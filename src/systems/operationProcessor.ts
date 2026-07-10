import { bosses } from "../data/bosses";
import { operations } from "../data/operations";
import { addSkillXp, applyRewards } from "./actionProcessing";
import { addItem, removeItem } from "./collectionSystem";
import { expectedKillTimeMs, playerCombatStats } from "./formulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { applyHeatModifier, applyNeuralModifier } from "./modifiers";
import { applyRiskEvents } from "./riskEvents";
import { changeDistrictThreat, districtThreatPenalty, districtThreatRewardBonus } from "./districtThreat";
import { updateOperationAchievements } from "./achievements";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import type { GameState, OperationDefinition, RewardBundle } from "../types";

export function getOperation(id: string) {
  return operations.find((operation) => operation.id === id);
}

export function canStartOperation(state: GameState, operation: OperationDefinition) {
  if (!state.districts[operation.districtId]?.unlocked) return false;
  if (operation.id === "op-backstreet-sweep" && state.skills.combat.level < 5) return false;
  if (operation.id === "op-junkyard-lockdown" && state.skills.combat.level < 15) return false;
  if (operation.id === "op-contraband-raid" && state.resources.reputation < 150) return false;
  if (operation.id === "op-ghost-signal-dive" && state.skills.hacking.level < 25) return false;
  if (operation.id === "op-corporate-extraction" && (state.skills.hacking.level < 35 || state.skills.combat.level < 30)) return false;
  return Object.entries(operation.requiredItems ?? {}).every(([id, amount]) => (state.inventory[id] ?? 0) >= amount);
}

export function startOperation(state: GameState, operationId: string, now = Date.now()) {
  const operation = getOperation(operationId);
  if (!operation || !canStartOperation(state, operation)) return state;
  const next = cloneState(state);
  Object.entries(operation.requiredItems ?? {}).forEach(([id, amount]) => removeItem(next, id, amount));
  next.activeAction = null;
  next.activeCraft = null;
  next.activeJob = null;
  next.currentCombat = null;
  next.activeOperation = {
    operationId,
    startedAt: now,
    durationMs: operationDurationMs(next, operation),
    stageIndex: 0,
  };
  pushCategorizedLog(next, "Combat", `Operation started: ${operation.name}.`);
  return next;
}

export function stopOperation(state: GameState) {
  return { ...state, activeOperation: null };
}

export function processOperation(state: GameState, now = Date.now()) {
  if (!state.activeOperation || now - state.activeOperation.startedAt < state.activeOperation.durationMs) return state;
  const next = cloneState(state);
  const operation = getOperation(next.activeOperation!.operationId);
  if (!operation) return { ...next, activeOperation: null };
  completeOperation(next, operation, next.activeOperation!.durationMs);
  next.activeOperation = null;
  next.lastSavedAt = Date.now();
  return next;
}

function completeOperation(state: GameState, operation: OperationDefinition, clearMs: number) {
  const boss = bosses.find((entry) => entry.id === operation.bossId)!;
  const stats = playerCombatStats(state);
  const threatPenalty = districtThreatPenalty(state, operation.districtId);
  const threatBonus = districtThreatRewardBonus(state, operation.districtId);
  const playerScore = stats.damage * 5 + stats.armor * 3 + stats.maxHp * 0.25;
  const operationScore = boss.hp * 0.45 + boss.damage * 6 + boss.armor * 8;
  const success = playerScore >= operationScore * (1 + threatPenalty);
  const firstClear = !state.operationLogs[operation.id]?.firstClear;
  const rewardMultiplier = 1 + threatBonus;
  const rewards = multiplyRewards({
    ...operation.completionRewards,
    ...(firstClear ? operation.firstClearRewards : operation.repeatClearRewards),
  }, rewardMultiplier);
  const itemsGained: Record<string, number> = {};

  if (success) {
    applyRewards(state, rewards);
    operation.rareDrops.forEach((drop) => {
      if (Math.random() <= drop.chance * (1 + threatBonus)) {
        addItem(state, drop.id, drop.quantity);
        itemsGained[drop.id] = (itemsGained[drop.id] ?? 0) + drop.quantity;
      }
    });
    boss.drops.forEach((drop) => {
      if (Math.random() <= drop.chance * (1 + threatBonus)) {
        addItem(state, drop.id, drop.quantity);
        itemsGained[drop.id] = (itemsGained[drop.id] ?? 0) + drop.quantity;
      }
    });
    addSkillXp(state, "combat", Math.ceil(boss.xpReward * (1 + threatBonus)));
    if (operation.id.includes("ghost") || operation.id.includes("corporate")) addSkillXp(state, "hacking", Math.ceil(boss.xpReward * 0.35));
    state.resources.heat += applyHeatModifier(state, operation.heatChange, ["operation", operation.districtId]);
    if (operation.neuralInstabilityChange) state.neuralInstability += applyNeuralModifier(state, operation.neuralInstabilityChange, ["operation"]);
    Object.entries(operation.factionReputation).forEach(([id, amount]) => {
      state.factions[id as keyof typeof state.factions].reputation += amount ?? 0;
    });
    Object.entries(operation.fixerTrust ?? {}).forEach(([id, amount]) => {
      const trust = state.fixerTrust[id] ?? { trust: 0, completedJobs: 0 };
      trust.trust += amount ?? 0;
      state.fixerTrust[id] = trust;
    });
    changeDistrictThreat(state, operation.districtId, -8);
    changeLocalStanding(state, operation.districtId, firstClear ? 8 : 4, `${operation.name} cleared`);
    discoverDistrictContent(state, operation.districtId, `operation:${operation.id}`);
    recordOperation(state, operation.id, clearMs, itemsGained);
    recordBoss(state, boss.id, clearMs);
    pushCategorizedLog(state, "Combat", `Operation cleared: ${operation.name}.`);
  } else {
    state.resources.heat += Math.ceil(operation.heatChange * 0.5);
    changeDistrictThreat(state, operation.districtId, 10);
    changeLocalStanding(state, operation.districtId, -3, `${operation.name} failed`);
    pushCategorizedLog(state, "Warning", `Operation failed: ${operation.name}. District threat rose.`);
  }

  state.operationRecap = {
    operationId: operation.id,
    success,
    clearMs,
    enemiesDefeated: success ? operation.stages.reduce((sum, stage) => sum + stage.enemyIds.length, 0) : 0,
    bossDefeated: success,
    xpGained: success ? boss.xpReward : 0,
    rewards: success ? rewards : {},
    itemsGained,
    heatChange: operation.heatChange,
    neuralInstabilityChange: operation.neuralInstabilityChange ?? 0,
    firstClear: success && firstClear,
    message: success ? `${operation.name} cleared.` : `${operation.name} failed.`,
  };
  applyRiskEvents(state);
  updateOperationAchievements(state);
}

function recordOperation(state: GameState, operationId: string, clearMs: number, drops: Record<string, number>) {
  const log = state.operationLogs[operationId] ?? { clears: 0, bestClearMs: null, firstClear: false, drops: {} };
  log.clears += 1;
  log.firstClear = true;
  log.bestClearMs = log.bestClearMs === null ? clearMs : Math.min(log.bestClearMs, clearMs);
  Object.entries(drops).forEach(([id, amount]) => {
    log.drops[id] = (log.drops[id] ?? 0) + amount;
  });
  state.operationLogs[operationId] = log;
}

function recordBoss(state: GameState, bossId: string, clearMs: number) {
  const log = state.bossLogs[bossId] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
  log.kills += 1;
  log.bestKillMs = log.bestKillMs === null ? clearMs : Math.min(log.bestKillMs, clearMs);
  state.bossLogs[bossId] = log;
}

function operationDurationMs(state: GameState, operation: OperationDefinition) {
  const boss = bosses.find((entry) => entry.id === operation.bossId)!;
  const stageTime = operation.stages.reduce((sum, stage) => sum + stage.enemyIds.length * 4500, 0);
  return stageTime + expectedKillTimeMs(state, boss.hp) + boss.mechanics.length * 1200;
}

function multiplyRewards(rewards: RewardBundle, multiplier: number) {
  return Object.fromEntries(Object.entries(rewards).map(([id, amount]) => [id, Math.round((amount ?? 0) * multiplier)])) as RewardBundle;
}
