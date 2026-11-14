import { recipes } from "../data/recipes";
import { scaledCraftingCosts } from "./craftingCosts";
import type { ActiveCraft, GameState } from "../types";

export const MAX_CRAFT_TARGET = 2000;

export function ownedMaterial(state: GameState, id: string) {
  return id in state.resources ? (state.resources[id as keyof typeof state.resources] ?? 0) : (state.inventory[id] ?? 0);
}

export function craftRemainingCycles(state: GameState, craft: ActiveCraft) {
  const recipe = recipes.find(r => r.id === craft.recipeId);
  if (!recipe) return 0;
  if (!craft.targetQuantity) return 1;
  return Math.max(0, Math.ceil((craft.targetQuantity - (craft.completedQuantity ?? 0)) / recipe.outputQuantity));
}

// Protect ingredients for the next/remaining craft cycles from automatic skill
// action resource costs. This is a soft ownership rule, not a withdrawal:
// crafting itself may spend its own protected materials normally.
export function reservedCraftMaterial(state: GameState, id: string) {
  const craft = state.activeCraft;
  if (!craft?.reserveMaterials) return 0;
  const recipe = recipes.find(r => r.id === craft.recipeId);
  if (!recipe) return 0;
  const cycles = craftRemainingCycles(state, craft);
  const perCycle = Number(scaledCraftingCosts(state, recipe)[id] ?? 0);
  if (!Number.isFinite(perCycle) || perCycle <= 0 || cycles <= 0) return 0;
  return Math.min(Math.max(0, ownedMaterial(state, id)), Math.ceil(perCycle * cycles));
}

export function craftTargetStatus(state: GameState) {
  const craft = state.activeCraft;
  const recipe = craft && recipes.find(r => r.id === craft.recipeId);
  if (!craft || !recipe) return null;
  const total = craft.targetQuantity ?? 0;
  const completed = craft.completedQuantity ?? 0;
  const needs = scaledCraftingCosts(state, recipe);
  const reserves = Object.fromEntries(Object.keys(needs).map(id => [id, reservedCraftMaterial(state, id)]).filter(([, value]) => Number(value) > 0));
  return { recipe, total, completed, remainingCycles: craftRemainingCycles(state, craft), reserves };
}
