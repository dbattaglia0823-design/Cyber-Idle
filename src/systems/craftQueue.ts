import { recipes, legacyRecipeAliases } from "../data/recipes";
import { MAX_CRAFT_TARGET } from "./craftAutomation";
import { cloneState } from "./gameState";
import type { ActiveCraft, CraftQueueEntry, CraftQueueState, GameState } from "../types";

export const MAX_CRAFT_QUEUE = 8;

export function emptyCraftQueue(): CraftQueueState {
  return { entries: [], nextId: 1, paused: false, blockedCraft: null, message: "", completedCycles: 0 };
}

function saneTarget(value: unknown): number | undefined {
  return Number.isSafeInteger(value) && Number(value) >= 1 && Number(value) <= MAX_CRAFT_TARGET ? Number(value) : undefined;
}

function saneActive(raw: unknown): ActiveCraft | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const source = raw as Partial<ActiveCraft>;
  const recipeId = legacyRecipeAliases[source.recipeId ?? ""] ?? source.recipeId;
  if (!recipes.some(recipe => recipe.id === recipeId)) return null;
  if (!Number.isFinite(source.startedAt) || !Number.isFinite(source.durationMs) || Number(source.durationMs) <= 0) return null;
  const target = saneTarget(source.targetQuantity);
  const completed = Number.isSafeInteger(source.completedQuantity) && Number(source.completedQuantity) >= 0
    ? Math.min(MAX_CRAFT_TARGET, Number(source.completedQuantity)) : 0;
  if (target && completed >= target) return null;
  return { recipeId: recipeId!, startedAt: source.startedAt!, durationMs: source.durationMs!,
    targetQuantity: target, completedQuantity: target ? completed : undefined, reserveMaterials: source.reserveMaterials === true };
}

export function normalizeCraftQueue(raw: Partial<CraftQueueState> | null | undefined): CraftQueueState {
  const blank = emptyCraftQueue();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return blank;
  const entries: CraftQueueEntry[] = [];
  const ids = new Set<string>();
  for (const value of Array.isArray(raw.entries) ? raw.entries.slice(0, MAX_CRAFT_QUEUE) : []) {
    if (!value || typeof value !== "object") continue;
    const recipeId = legacyRecipeAliases[value.recipeId] ?? value.recipeId;
    if (!recipes.some(recipe => recipe.id === recipeId)) continue;
    // An explicitly invalid target must not be transformed into unlimited crafting.
    if (value.targetQuantity !== undefined && saneTarget(value.targetQuantity) === undefined) continue;
    let id = typeof value.id === "string" && /^c[0-9]{1,7}$/.test(value.id) && !ids.has(value.id)
      ? value.id : `c${entries.length + 1}`;
    if (ids.has(id)) continue;
    ids.add(id);
    entries.push({ id, recipeId, targetQuantity: saneTarget(value.targetQuantity), reserveMaterials: value.reserveMaterials === true });
  }
  const nextId = Math.max(1, Math.min(10_000_000, Number.isSafeInteger(raw.nextId) ? raw.nextId! : 1),
    ...entries.map(entry => Number(entry.id.slice(1)) + 1));
  const blockedCraft = saneActive(raw.blockedCraft);
  return {
    entries, nextId, blockedCraft, paused: Boolean(raw.paused) && Boolean(entries.length || blockedCraft),
    message: typeof raw.message === "string" ? raw.message.slice(0, 220) : "",
    completedCycles: Number.isSafeInteger(raw.completedCycles) && Number(raw.completedCycles) >= 0
      ? Math.min(Number.MAX_SAFE_INTEGER, Number(raw.completedCycles)) : 0,
  };
}

export function addQueuedCraft(state: GameState, recipeId: string, targetQuantity?: number, reserveMaterials = true) {
  recipeId = legacyRecipeAliases[recipeId] ?? recipeId;
  if (!recipes.some(recipe => recipe.id === recipeId) || state.craftQueue.entries.length >= MAX_CRAFT_QUEUE
    || (targetQuantity !== undefined && saneTarget(targetQuantity) === undefined)) return state;
  const next = cloneState(state);
  next.craftQueue.entries.push({ id: `c${next.craftQueue.nextId++}`, recipeId,
    targetQuantity, reserveMaterials });
  const name = recipes.find(recipe => recipe.id === recipeId)?.name ?? recipeId;
  next.craftQueue.message = `Queued ${name}. It will start when the current recipe finishes.`;
  return next;
}

export function moveQueuedCraft(state: GameState, id: string, direction: -1 | 1) {
  const index = state.craftQueue.entries.findIndex(entry => entry.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= state.craftQueue.entries.length) return state;
  const next = cloneState(state);
  [next.craftQueue.entries[index], next.craftQueue.entries[nextIndex]] =
    [next.craftQueue.entries[nextIndex], next.craftQueue.entries[index]];
  return next;
}

export function removeQueuedCraft(state: GameState, id: string) {
  if (!state.craftQueue.entries.some(entry => entry.id === id)) return state;
  const next = cloneState(state);
  next.craftQueue.entries = next.craftQueue.entries.filter(entry => entry.id !== id);
  if (!next.craftQueue.entries.length && !next.craftQueue.blockedCraft) next.craftQueue.paused = false;
  return next;
}

export function clearCraftQueue(state: GameState) {
  if (!state.craftQueue.entries.length && !state.craftQueue.blockedCraft) return state;
  const next = cloneState(state);
  next.craftQueue.entries = [];
  next.craftQueue.blockedCraft = null;
  next.craftQueue.paused = false;
  next.craftQueue.message = "Upcoming crafting queue cleared. Current crafting was not interrupted.";
  return next;
}
