import { simCacheTypes } from "../data/simCache";
import { addMasteryXp, addSkillXp, applyRewards, canAffordRewards, getSkillAction } from "./actionProcessing";
import { canCraft, completeCraft, getRecipe } from "./craftingProcessing";
import { removeItem } from "./collectionSystem";
import { cloneState, pushCategorizedLog } from "./gameState";
import { addMasteryPoolXp } from "./masteryPool";
import { applyHeatModifier, applyNeuralModifier, applyRewardModifiers, applyXpModifier } from "./modifiers";
import { applyRiskEvents } from "./riskEvents";
import { getSimulationEfficiency } from "./simulationEfficiency";
import type { GameState, ResourceId, RewardBundle, SimulationRecap } from "../types";

export function simCacheEligibility(state: GameState) {
  const basic = simCacheTypes[0];
  if ((state.inventory[basic.itemId] ?? 0) <= 0) return { eligible: false, reason: "No Basic Sim Cache available." };
  if (state.activeAction) {
    const action = getSkillAction(state.activeAction.actionId);
    if (!action) return { eligible: false, reason: "Current action is missing." };
    if (!state.manualDiscovery.skillActions[action.id]) return { eligible: false, reason: "Complete this skill action manually once first." };
    if (action.tags?.includes("hacking") && state.resources.heat >= 75) return { eligible: false, reason: "Heat safety stop: Hunted or higher." };
    if ((action.neuralInstabilityChange ?? 0) > 0 && state.neuralInstability >= 75) return { eligible: false, reason: "Neural Instability safety stop: Critical or higher." };
    return { eligible: true, reason: `Eligible: repeat ${action.name}.` };
  }
  if (state.activeCraft) {
    const recipe = getRecipe(state.activeCraft.recipeId);
    if (!recipe) return { eligible: false, reason: "Current recipe is missing." };
    if (!state.manualDiscovery.recipes[recipe.id]) return { eligible: false, reason: "Craft this recipe manually once first." };
    if (!canCraft(state, recipe)) return { eligible: false, reason: "Missing materials." };
    return { eligible: true, reason: `Eligible: repeat ${recipe.name}.` };
  }
  if (state.currentCombat) return { eligible: false, reason: "Basic Sim Cache does not simulate combat yet." };
  if (state.activeJob) return { eligible: false, reason: "Basic Sim Cache does not simulate fixer jobs yet." };
  return { eligible: false, reason: "Start a discovered skill action or craft first." };
}

export function runBasicSimCache(state: GameState, cacheCount: number) {
  const basic = simCacheTypes[0];
  const count = Math.max(1, Math.min(cacheCount, state.inventory[basic.itemId] ?? 0));
  const eligible = simCacheEligibility(state);
  if (!eligible.eligible) return state;
  const next = cloneState(state);
  removeItem(next, basic.itemId, count);
  const simulatedMs = count * basic.minutesPerItem * 60_000;
  const efficiency = getSimulationEfficiency(next);
  const recap: SimulationRecap = {
    cacheType: "basic",
    simulatedMs,
    activityName: "Simulation",
    completions: 0,
    efficiency,
    xpGained: 0,
    masteryXpGained: 0,
    poolXpGained: 0,
    resourcesGained: {},
    dropsGained: {},
    heatChange: 0,
    neuralInstabilityChange: 0,
    stoppedReason: "Simulated full cache.",
    warnings: [],
  };

  if (next.activeAction) simulateAction(next, simulatedMs, recap);
  else if (next.activeCraft) simulateCraft(next, simulatedMs, recap);

  next.worldUnlocks.usedSimCache = true;
  next.simulationRecap = recap;
  pushCategorizedLog(next, "World", `Sim Cache used: ${recap.completions} completions. ${recap.stoppedReason}`);
  return next;
}

function simulateAction(state: GameState, simulatedMs: number, recap: SimulationRecap) {
  const action = getSkillAction(state.activeAction!.actionId)!;
  const efficiency = recap.efficiency;
  recap.activityName = action.name;
  const loops = Math.floor(simulatedMs / state.activeAction!.durationMs);
  for (let i = 0; i < loops; i += 1) {
    if (!canAffordRewards(state, action.rewards)) {
      recap.stoppedReason = "Stopped early: missing required resources.";
      break;
    }
    if (state.resources.heat >= 90) {
      recap.stoppedReason = "Stopped early: Heat safety threshold.";
      break;
    }
    if (state.neuralInstability >= 90) {
      recap.stoppedReason = "Stopped early: Neural Instability safety threshold.";
      break;
    }
    const rewards = scaleRewards(applyRewardModifiers(state, action.rewards, [action.skillId, ...(action.tags ?? [])]), efficiency);
    const xp = Math.round(applyXpModifier(state, action.skillId, action.xpReward) * efficiency.skillXp);
    const mastery = Math.round(action.masteryXpReward * efficiency.masteryXp);
    applyRewards(state, rewards);
    addRewardDelta(recap.resourcesGained, rewards);
    addSkillXp(state, action.skillId, xp);
    const pool = Math.ceil(mastery * 0.25);
    addMasteryXp(state, action.id, mastery);
    addMasteryPoolXp(state, action.skillId, pool);
    recap.xpGained += xp;
    recap.masteryXpGained += mastery;
    recap.poolXpGained += pool;
    if (action.heatChange) {
      const heat = Math.round(applyHeatModifier(state, action.heatChange, action.tags) * efficiency.heat);
      state.resources.heat += heat;
      recap.heatChange += heat;
    }
    if (action.neuralInstabilityChange) {
      const ni = Math.round(applyNeuralModifier(state, action.neuralInstabilityChange, action.tags) * efficiency.neuralInstability);
      state.neuralInstability += ni;
      recap.neuralInstabilityChange += ni;
    }
    recap.completions += 1;
    applyRiskEvents(state);
  }
}

function simulateCraft(state: GameState, simulatedMs: number, recap: SimulationRecap) {
  const recipe = getRecipe(state.activeCraft!.recipeId)!;
  recap.activityName = recipe.name;
  const loops = Math.floor(simulatedMs / state.activeCraft!.durationMs);
  for (let i = 0; i < loops; i += 1) {
    if (!canCraft(state, recipe)) {
      recap.stoppedReason = "Stopped early: missing materials.";
      break;
    }
    completeCraft(state, recipe, recap.efficiency.masteryXp, false);
    recap.completions += 1;
    recap.xpGained += recipe.xpReward;
    recap.masteryXpGained += Math.round(recipe.masteryXpReward * recap.efficiency.masteryXp);
    recap.poolXpGained += Math.ceil(recipe.masteryXpReward * 0.25);
    recap.dropsGained[recipe.outputItemId] = (recap.dropsGained[recipe.outputItemId] ?? 0) + recipe.outputQuantity;
  }
}

function scaleRewards(rewards: RewardBundle, efficiency: ReturnType<typeof getSimulationEfficiency>) {
  const scaled: RewardBundle = {};
  Object.entries(rewards).forEach(([resource, amount]) => {
    const id = resource as ResourceId;
    const rate = id === "credits" ? efficiency.credits : efficiency.resources;
    scaled[id] = Math.round((amount ?? 0) * rate);
  });
  return scaled;
}

function addRewardDelta(target: RewardBundle, rewards: RewardBundle) {
  Object.entries(rewards).forEach(([resource, amount]) => {
    const id = resource as ResourceId;
    target[id] = (target[id] ?? 0) + Math.round(amount ?? 0);
  });
}
