import { recipes } from "../data/recipes";
import { addMasteryXp, addSkillXp } from "./actionProcessing";
import { addItem, removeItem } from "./collectionSystem";
import { adjustedDurationMs, getActiveModifiers } from "./modifiers";
import { cloneState, pushCategorizedLog } from "./gameState";
import { markRecipeManual } from "./manualDiscovery";
import { addMasteryPoolXp } from "./masteryPool";
import type { CraftingRecipe, GameState } from "../types";

export function getRecipe(recipeId: string) {
  return recipes.find((recipe) => recipe.id === recipeId);
}

export function canCraft(state: GameState, recipe: CraftingRecipe) {
  if (state.skills[recipe.requiredSkill].level < recipe.requiredLevel) return false;
  if (recipe.requiredBlueprint && !state.unlockedBlueprints[recipe.requiredBlueprint]) return false;
  return Object.entries(adjustCraftingCosts(state, recipe.inputCosts)).every(([id, amount]) => getCount(state, id) >= amount);
}

export function startCraft(state: GameState, recipeId: string, now = Date.now()) {
  const recipe = getRecipe(recipeId);
  if (!recipe || !canCraft(state, recipe)) return state;
  return {
    ...state,
    activeAction: null,
    activeJob: null,
    activeCraft: {
      recipeId,
      startedAt: now,
      durationMs: adjustedDurationMs(state, recipe.durationMs, recipe.tags),
    },
  };
}

export function stopCraft(state: GameState) {
  return { ...state, activeCraft: null };
}

export function processCrafting(state: GameState, now = Date.now()) {
  if (!state.activeCraft || now - state.activeCraft.startedAt < state.activeCraft.durationMs) return state;
  const next = cloneState(state);
  let guard = 0;
  while (next.activeCraft && now - next.activeCraft.startedAt >= next.activeCraft.durationMs && guard < 100) {
    const recipe = getRecipe(next.activeCraft.recipeId);
    if (!recipe || !canCraft(next, recipe)) {
      pushCategorizedLog(next, "Warning", "Crafting stopped because materials are missing.");
      next.activeCraft = null;
      break;
    }
    completeCraft(next, recipe);
    next.activeCraft = {
      ...next.activeCraft,
      startedAt: next.activeCraft.startedAt + next.activeCraft.durationMs,
      durationMs: adjustedDurationMs(next, recipe.durationMs, recipe.tags),
    };
    guard += 1;
  }
  next.lastSavedAt = Date.now();
  return next;
}

export function completeCraft(state: GameState, recipe: CraftingRecipe, masteryEfficiency = 1, markManual = true) {
  Object.entries(adjustCraftingCosts(state, recipe.inputCosts)).forEach(([id, amount]) => consume(state, id, amount));
  addItem(state, recipe.outputItemId, recipe.outputQuantity);
  addSkillXp(state, recipe.requiredSkill, recipe.xpReward);
  const masteryXp = Math.round(recipe.masteryXpReward * masteryEfficiency * (1 + getActiveModifiers(state).masteryXpGain));
  addMasteryXp(state, recipe.id, masteryXp);
  addMasteryPoolXp(state, recipe.requiredSkill, Math.ceil(masteryXp * 0.25));
  if (markManual) markRecipeManual(state, recipe.id);
  pushCategorizedLog(state, "Skill", `Crafted ${recipe.name}: +${recipe.xpReward} ${recipe.requiredSkill} XP.`);
}

export function adjustCraftingCosts(state: GameState, costs: Record<string, number>) {
  const reduction = Math.min(0.5, getActiveModifiers(state).craftingCostReduction);
  return Object.fromEntries(Object.entries(costs).map(([id, amount]) => [id, amount > 0 ? Math.max(1, Math.ceil(amount * (1 - reduction))) : amount]));
}

function getCount(state: GameState, id: string) {
  if (id in state.resources) return state.resources[id as keyof typeof state.resources];
  return state.inventory[id] ?? 0;
}

function consume(state: GameState, id: string, amount: number) {
  if (id in state.resources) state.resources[id as keyof typeof state.resources] -= amount;
  else removeItem(state, id, amount);
}
