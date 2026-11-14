import { recipes } from "../data/recipes";
import { skillActions } from "../data/skills";
import { scaledCraftingCosts } from "./craftingCosts";
import { ownedMaterial } from "./craftAutomation";
import { canStartSkillAction } from "./actionProcessing";
import { addIdleQueueStep, MAX_IDLE_QUEUE_STEPS, MAX_IDLE_QUEUE_RUNS } from "./idleQueue";
import { cloneState } from "./gameState";
import type { CraftingRecipe, GameState } from "../types";

export type SuggestedStep = { actionId: string; targetId: string; targetAmount: number; maxCycles: number; yieldPerCycle: number };
export type MissingSource = { id: string; need: number; reason: string };
export interface SupplyPlan {
  title: string;
  requested: Array<{ id: string; target: number; owned: number }>;
  steps: SuggestedStep[];
  unavailable: MissingSource[];
}

export const smartPresetCatalog = [
  { id: "upgrades", title: "Gather upgrade materials", detail: "Stock scrap, circuit boards and engineering parts." },
  { id: "medical", title: "Stock medical inputs", detail: "Gather the ingredients needed for basic injectors." },
  { id: "hacking", title: "Train hacking", detail: "Repeat safe available breaches until data stock grows." },
] as const;
export type SmartPresetId = typeof smartPresetCatalog[number]["id"];

export function planPreset(state: GameState, preset: SmartPresetId): SupplyPlan {
  if (preset === "upgrades") return planStockTargets(state, "Upgrade materials", {
    scrap: ownedMaterial(state, "scrap") + 100,
    circuitBoards: ownedMaterial(state, "circuitBoards") + 20,
    cyberwareParts: ownedMaterial(state, "cyberwareParts") + 15,
  });
  if (preset === "medical") return planRecipeSupplies(state, "recipe-basic-med-injector", 10, "Medical supplies for 10 basic injectors");
  return planStockTargets(state, "Hacking practice", {
    encryptedData: ownedMaterial(state, "encryptedData") + 60,
  });
}

export function planRecipeSupplies(state: GameState, recipeId: string, quantity: number, title?: string): SupplyPlan {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 2000)
    return { title: "Unavailable recipe", requested: [], steps: [], unavailable: [{ id: recipeId, need: quantity, reason: "Recipe or quantity is invalid." }] };
  const cycles = Math.ceil(quantity / recipe.outputQuantity);
  const needs = Object.fromEntries(Object.entries(scaledCraftingCosts(state, recipe)).map(([id, value]) => [id, value * cycles]));
  // Required inputs are stocks, not per-click purchases. Previews never spend inventory.
  return planStockTargets(state, title ?? `Ingredients for ${quantity} ${recipe.name}`, needs, true, recipe);
}

function planStockTargets(state: GameState, title: string, targets: Record<string, number>, inputsAreNeeds = false, recipe?: CraftingRecipe): SupplyPlan {
  const requested: SupplyPlan["requested"] = [], steps: SuggestedStep[] = [], unavailable: MissingSource[] = [];
  for (const [id, raw] of Object.entries(targets)) {
    const owned = ownedMaterial(state, id);
    const target = inputsAreNeeds ? owned + Math.max(0, raw - owned) : raw;
    const need = Math.max(0, target - owned);
    if (!Number.isSafeInteger(target) || target < 0 || target > 1_000_000_000) {
      unavailable.push({ id, need, reason: "Target exceeds the safe inventory limit." });
      continue;
    }
    requested.push({ id, owned, target });
    if (need === 0) continue;
    // Only no-cost repeatable actions are suggested. This prevents one queued
    // step from consuming an earlier target or the protected craft ingredients.
    const candidates = skillActions.filter(action =>
      (Number(action.rewards[id as keyof typeof action.rewards] ?? action.itemRewards?.[id] ?? 0) > 0)
      && Object.values(action.rewards).every(value => (value ?? 0) >= 0)
      && canStartSkillAction(state, action));
    candidates.sort((a,b) => {
      const output = (action: typeof a) => Number(action.rewards[id as keyof typeof action.rewards] ?? action.itemRewards?.[id] ?? 0);
      return a.durationMs / output(a) - b.durationMs / output(b);
    });
    const action = candidates[0];
    if (!action) {
      unavailable.push({ id, need, reason: "No unlocked, free-input repeatable skill action guarantees this material." });
      continue;
    }
    const yieldPerCycle = Number(action.rewards[id as keyof typeof action.rewards] ?? action.itemRewards?.[id] ?? 0);
    const estimatedCycles = Math.ceil(need / yieldPerCycle);
    if (estimatedCycles > MAX_IDLE_QUEUE_RUNS || steps.length >= MAX_IDLE_QUEUE_STEPS) {
      unavailable.push({ id, need, reason: "This target exceeds the queue's safe run/step limit." });
      continue;
    }
    steps.push({ actionId: action.id, targetId: id, targetAmount: target, yieldPerCycle,
      maxCycles: Math.min(MAX_IDLE_QUEUE_RUNS, Math.max(estimatedCycles + 2, Math.ceil(estimatedCycles * 1.25))) });
  }
  if (recipe && (state.skills[recipe.requiredSkill].level < recipe.requiredLevel
    || (recipe.requiredDistrict && !state.districts[recipe.requiredDistrict]?.unlocked)
    || (recipe.requiredBlueprint && !state.unlockedBlueprints[recipe.requiredBlueprint]))) {
    unavailable.push({ id: recipe.id, need: 1, reason: "Recipe crafting requirements remain locked; gathering inputs does not unlock crafting." });
  }
  return { title, requested, steps, unavailable };
}

export function installSupplyPlan(state: GameState, plan: SupplyPlan) {
  if (state.idleQueue.enabled || !plan.steps.length || plan.steps.length > MAX_IDLE_QUEUE_STEPS) return state;
  const next = cloneState(state);
  next.idleQueue.index = 0;
  next.idleQueue.steps = [];
  for (const step of plan.steps) {
    const candidate = addIdleQueueStep(next, step.actionId, step.targetId, step.targetAmount, step.maxCycles);
    if (candidate === next) return state;
    next.idleQueue = candidate.idleQueue;
  }
  next.idleQueue.message = `${plan.title} prepared. Review the steps and press Start queue.`;
  return next;
}
