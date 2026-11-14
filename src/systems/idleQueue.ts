import { skillActions } from "../data/skills";
import { adjustedActionDurationMs } from "./modifiers";
import { canStartSkillAction } from "./actionProcessing";
import { cloneState, pushCategorizedLog } from "./gameState";
import type { GameState, IdleQueueState, IdleQueueStep, SkillAction } from "../types";

export const MAX_IDLE_QUEUE_STEPS = 8;
export const DEFAULT_IDLE_QUEUE_RUNS = 200;
export const MAX_IDLE_QUEUE_RUNS = 2000;
export const DEFAULT_IDLE_QUEUE_HEAT_LIMIT = 75;

export function emptyIdleQueue(): IdleQueueState {
  return { enabled: false, steps: [], index: 0, nextId: 1, heatLimit: DEFAULT_IDLE_QUEUE_HEAT_LIMIT, message: "" };
}

// Only guaranteed positive outputs are eligible. Random drops, credits spent,
// Heat, reputation, and XP are not controllable resource targets.
export function idleQueueTargets(action: SkillAction) {
  return [
    ...Object.entries(action.rewards).filter(([id, amount]) => !["heat", "reputation"].includes(id) && (amount ?? 0) > 0).map(([id]) => id),
    ...Object.entries(action.itemRewards ?? {}).filter(([, amount]) => amount > 0).map(([id]) => id),
  ].filter((id, i, all) => all.indexOf(id) === i);
}

const bounded = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback;

export function normalizeIdleQueue(raw: Partial<IdleQueueState> | null | undefined): IdleQueueState {
  const initial = emptyIdleQueue();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return initial;
  const ids = new Set<string>();
  const steps: IdleQueueStep[] = [];
  for (const source of Array.isArray(raw.steps) ? raw.steps.slice(0, MAX_IDLE_QUEUE_STEPS) : []) {
    if (!source || typeof source !== "object") continue;
    const action = skillActions.find(entry => entry.id === source.actionId);
    if (!action || !idleQueueTargets(action).includes(source.targetId)) continue;
    const id = typeof source.id === "string" && /^q[0-9]{1,7}$/.test(source.id) && !ids.has(source.id) ? source.id : `q${steps.length + 1}`;
    if (ids.has(id)) continue;
    ids.add(id);
    const maxCycles = bounded(source.maxCycles, DEFAULT_IDLE_QUEUE_RUNS, 1, MAX_IDLE_QUEUE_RUNS);
    steps.push({
      id, actionId: action.id, targetId: source.targetId,
      targetAmount: bounded(source.targetAmount, 1, 1, 1_000_000_000),
      maxCycles, cycles: bounded(source.cycles, 0, 0, maxCycles),
    });
  }
  const index = bounded(raw.index, 0, 0, steps.length);
  return {
    enabled: Boolean(raw.enabled && index < steps.length), steps, index,
    nextId: Math.max(bounded(raw.nextId, 1, 1, 10_000_000), ...steps.map(x => Number(x.id.slice(1)) + 1)),
    heatLimit: typeof raw.heatLimit === "number" && Number.isFinite(raw.heatLimit) && raw.heatLimit >= 10 && raw.heatLimit <= 99
      ? Math.floor(raw.heatLimit) : DEFAULT_IDLE_QUEUE_HEAT_LIMIT,
    message: typeof raw.message === "string" ? raw.message.slice(0, 180) : "",
  };
}

export function idleQueueOwned(state: GameState, targetId: string) {
  const n = targetId in state.resources
    ? state.resources[targetId as keyof typeof state.resources]
    : state.inventory[targetId] ?? 0;
  return Number.isFinite(n) ? n : 0;
}

export function addIdleQueueStep(state: GameState, actionId: string, targetId: string, targetAmount: number, maxCycles = DEFAULT_IDLE_QUEUE_RUNS) {
  const action = skillActions.find(entry => entry.id === actionId);
  if (state.idleQueue.enabled || !action || !idleQueueTargets(action).includes(targetId)
    || !Number.isSafeInteger(targetAmount) || targetAmount < 1 || targetAmount > 1_000_000_000
    || !Number.isSafeInteger(maxCycles) || maxCycles < 1 || maxCycles > MAX_IDLE_QUEUE_RUNS
    || state.idleQueue.steps.length >= MAX_IDLE_QUEUE_STEPS) return state;
  const next = cloneState(state);
  next.idleQueue.steps.push({ id: `q${next.idleQueue.nextId++}`, actionId, targetId, targetAmount, maxCycles, cycles: 0 });
  next.idleQueue.message = "Queue updated. Start it when ready.";
  return next;
}

export function removeIdleQueueStep(state: GameState, id: string) {
  if (state.idleQueue.enabled || !state.idleQueue.steps.some(s => s.id === id)) return state;
  const next = cloneState(state);
  const position = next.idleQueue.steps.findIndex(s => s.id === id);
  next.idleQueue.steps.splice(position, 1);
  next.idleQueue.index = Math.min(next.idleQueue.index > position ? next.idleQueue.index - 1 : next.idleQueue.index, next.idleQueue.steps.length);
  return next;
}

export function moveIdleQueueStep(state: GameState, id: string, delta: -1 | 1) {
  if (state.idleQueue.enabled) return state;
  const index = state.idleQueue.steps.findIndex(s => s.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= state.idleQueue.steps.length) return state;
  const next = cloneState(state);
  [next.idleQueue.steps[index], next.idleQueue.steps[target]] = [next.idleQueue.steps[target], next.idleQueue.steps[index]];
  next.idleQueue.index = 0;
  next.idleQueue.steps.forEach(s => { s.cycles = 0; });
  next.idleQueue.message = "Queue reordered; progress resets on restart.";
  return next;
}

export function resetIdleQueue(state: GameState) {
  if (state.idleQueue.enabled) return state;
  const next = cloneState(state);
  next.idleQueue.index = 0;
  next.idleQueue.steps.forEach(s => { s.cycles = 0; });
  next.idleQueue.message = "Queue reset.";
  return next;
}

export function setIdleQueueHeatLimit(state: GameState, heatLimit: number) {
  if (!Number.isFinite(heatLimit) || heatLimit < 10 || heatLimit > 99) return state;
  const next = cloneState(state);
  next.idleQueue.heatLimit = Math.floor(heatLimit);
  return next;
}

export function pauseIdleQueue(state: GameState, message = "Queue paused. Current skill action continues.") {
  if (!state.idleQueue.enabled) return state;
  const next = cloneState(state);
  next.idleQueue.enabled = false;
  next.idleQueue.message = message;
  return next;
}

function halt(next: GameState, message: string) {
  next.idleQueue.enabled = false;
  next.idleQueue.message = message;
  if (next.activeAction && next.idleQueue.steps.some(s => s.actionId === next.activeAction?.actionId)) next.activeAction = null;
  pushCategorizedLog(next, "Warning", message);
}

export function startIdleQueue(state: GameState, now = Date.now()) {
  if (state.idleQueue.enabled || state.idleQueue.steps.length === 0) return state;
  const next = cloneState(state);
  if (next.rpg.active || next.currentCombat || next.activeJob || next.activeOperation || next.health.lifeState === "downed") {
    next.idleQueue.message = "Cannot start while a mission, fight or other foreground activity is active.";
    return next;
  }
  if (next.idleQueue.index >= next.idleQueue.steps.length) {
    next.idleQueue.index = 0;
    next.idleQueue.steps.forEach(step => { step.cycles = 0; });
  }
  next.idleQueue.enabled = true;
  next.idleQueue.message = "Queue running.";
  enterNextStep(next, now);
  return next;
}

// Called at an actual completion boundary, not once per rendered frame, so
// rapid offline completions and online ticks have the same target behavior.
export function idleQueueAfterCompletion(next: GameState, actionId: string, boundary: number) {
  if (!next.idleQueue.enabled) return;
  const step = next.idleQueue.steps[next.idleQueue.index];
  if (!step || step.actionId !== actionId) {
    halt(next, "Safety stop: queued action no longer matches the current activity.");
    return;
  }
  step.cycles += 1;
  if (idleQueueOwned(next, step.targetId) >= step.targetAmount) {
    next.idleQueue.index += 1;
    enterNextStep(next, boundary);
  } else if (step.cycles >= step.maxCycles) {
    halt(next, `Safety stop: ${actionId} reached the ${step.maxCycles}-cycle limit before its target.`);
  } else if (next.resources.heat >= next.idleQueue.heatLimit) {
    halt(next, `Safety stop: Heat reached ${next.resources.heat}; queue limit is ${next.idleQueue.heatLimit}.`);
  }
}

export function idleQueueAfterBlocked(next: GameState, actionId: string) {
  if (next.idleQueue.enabled && next.idleQueue.steps[next.idleQueue.index]?.actionId === actionId) {
    halt(next, `Safety stop: ${actionId} no longer meets its resource or access requirements.`);
  }
}

function enterNextStep(next: GameState, at: number) {
  for (let check = 0; check <= MAX_IDLE_QUEUE_STEPS; check++) {
    const step = next.idleQueue.steps[next.idleQueue.index];
    if (!step) {
      next.idleQueue.enabled = false;
      next.idleQueue.message = "All resource targets reached. Queue complete.";
      next.activeAction = null;
      pushCategorizedLog(next, "World", next.idleQueue.message);
      return;
    }
    if (idleQueueOwned(next, step.targetId) >= step.targetAmount) {
      next.idleQueue.index++;
      continue;
    }
    const action = skillActions.find(a => a.id === step.actionId);
    if (!action || !canStartSkillAction(next, action)) {
      halt(next, `Safety stop: ${action?.name ?? step.actionId} is locked or lacks required materials.`);
      return;
    }
    if (next.resources.heat >= next.idleQueue.heatLimit) {
      halt(next, `Safety stop: Heat reached ${next.resources.heat}; queue limit is ${next.idleQueue.heatLimit}.`);
      return;
    }
    if (step.cycles >= step.maxCycles) {
      halt(next, `Safety stop: ${action.name} exhausted its cycle limit.`);
      return;
    }
    next.activeAction = { actionId: action.id, startedAt: at, durationMs: adjustedActionDurationMs(next, action.durationMs, action.id, [action.skillId, ...(action.tags ?? [])]) };
    next.idleQueue.message = `Working: ${action.name}, target ${step.targetAmount} ${step.targetId}.`;
    pushCategorizedLog(next, "World", `Queue started ${action.name}.`);
    return;
  }
  halt(next, "Safety stop: queue transition limit exceeded.");
}
