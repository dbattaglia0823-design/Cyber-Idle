import { skillActions } from "../data/skills";
import { canAffordRewards, getSkillAction } from "./actionProcessing";
import { canCraft, completeCraft, getRecipe } from "./craftingProcessing";
import { clampRiskStat, xpForNextLevel, xpForNextMastery } from "./formulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { applyHeatModifier, applyNeuralModifier, applyRewardModifiers, applyXpModifier, getActiveModifiers } from "./modifiers";
import { applyRiskEvents } from "./riskEvents";
import type { GameState, OfflineRecap, ResourceId, RewardBundle } from "../types";

const OFFLINE_CAP_MS = 1000 * 60 * 60 * 12;

export function applyOfflineProgress(state: GameState, now = Date.now()) {
  const modifiers = getActiveModifiers(state);
  const capMs = Math.max(OFFLINE_CAP_MS, modifiers.offlineProgressCapHours * 60 * 60 * 1000);
  const elapsed = Math.min(capMs, Math.max(0, now - state.lastSavedAt));
  const next = cloneState(state);

  if (elapsed < 1000) {
    next.lastSavedAt = now;
    return next;
  }

  if (next.currentCombat) {
    next.offlineRecap = {
      timeAwayMs: elapsed,
      actionName: "Combat",
      completions: 0,
      xpGained: 0,
      resourcesGained: {},
      levelsGained: 0,
      masteryXpGained: 0,
      masteryLevelsGained: 0,
      heatGained: 0,
      neuralInstabilityGained: 0,
      message: "Combat offline progress will be added later.",
    };
    pushCategorizedLog(next, "World", "Offline combat progress is not simulated yet.");
    next.lastSavedAt = now;
    return next;
  }

  if (next.activeCraft) {
    const recipe = getRecipe(next.activeCraft.recipeId);
    if (!recipe) {
      next.activeCraft = null;
      next.lastSavedAt = now;
      return next;
    }
    const available = elapsed + Math.max(0, state.lastSavedAt - next.activeCraft.startedAt);
    const completions = Math.min(500, Math.floor(available / recipe.durationMs));
    const recap = {
      timeAwayMs: elapsed,
      actionName: recipe.name,
      completions: 0,
      xpGained: 0,
      resourcesGained: {},
      levelsGained: 0,
      masteryXpGained: 0,
      masteryLevelsGained: 0,
      heatGained: 0,
      neuralInstabilityGained: 0,
      message: "Crafting continued while you were away.",
    };
    for (let i = 0; i < completions; i += 1) {
      if (!canCraft(next, recipe)) {
        recap.message = "Crafting stopped because materials ran out.";
        next.activeCraft = null;
        break;
      }
      completeCraft(next, recipe);
      recap.completions += 1;
      recap.xpGained += recipe.xpReward;
      recap.masteryXpGained += recipe.masteryXpReward;
    }
    if (next.activeCraft) next.activeCraft.startedAt = now - (available % recipe.durationMs);
    next.offlineRecap = recap;
    next.lastSavedAt = now;
    pushCategorizedLog(next, "Skill", `Offline crafting: ${recipe.name} completed ${recap.completions} time${recap.completions === 1 ? "" : "s"}.`);
    return next;
  }

  if (!next.activeAction) {
    next.lastSavedAt = now;
    return next;
  }

  const action = getSkillAction(next.activeAction.actionId);
  if (!action) {
    next.activeAction = null;
    next.lastSavedAt = now;
    return next;
  }

  const available = elapsed + Math.max(0, state.lastSavedAt - next.activeAction.startedAt);
  const completions = Math.min(500, Math.floor(available / action.durationMs));
  if (completions <= 0) {
    next.lastSavedAt = now;
    return next;
  }

  const recap: OfflineRecap = {
    timeAwayMs: elapsed,
    actionName: action.name,
    completions: 0,
    xpGained: 0,
    resourcesGained: {},
    levelsGained: 0,
    masteryXpGained: 0,
    masteryLevelsGained: 0,
    heatGained: 0,
    neuralInstabilityGained: 0,
  };

  for (let i = 0; i < completions; i += 1) {
    if (!canAffordRewards(next, action.rewards)) {
      recap.message = "Action stopped because required resources ran out.";
      next.activeAction = null;
      break;
    }
    const rewards = applyRewardModifiers(next, action.rewards, [action.skillId, ...(action.tags ?? [])]);
    const xpReward = applyXpModifier(next, action.skillId, action.xpReward);
    applyRewardDelta(next, rewards);
    addRewardDelta(recap.resourcesGained, rewards);
    recap.xpGained += xpReward;
    recap.masteryXpGained += action.masteryXpReward;
    recap.levelsGained += addOfflineSkillXp(next, action.skillId, xpReward);
    recap.masteryLevelsGained += addOfflineMasteryXp(next, action.id, action.masteryXpReward);
    if (action.heatChange) {
      const heat = applyHeatModifier(next, action.heatChange, action.tags);
      next.resources.heat = clampRiskStat(next.resources.heat + heat);
      recap.heatGained += heat;
    }
    if (action.neuralInstabilityChange) {
      const neural = applyNeuralModifier(next, action.neuralInstabilityChange, action.tags);
      next.neuralInstability = clampRiskStat(next.neuralInstability + neural);
      recap.neuralInstabilityGained += neural;
    }
    recap.completions += 1;
  }

  if (next.activeAction) {
    next.activeAction.startedAt = now - (available % action.durationMs);
  }
  next.offlineRecap = recap;
  next.lastSavedAt = now;
  applyRiskEvents(next);
  pushCategorizedLog(next, "Skill", `Offline: ${action.name} completed ${recap.completions} time${recap.completions === 1 ? "" : "s"}.`);
  return next;
}

function applyRewardDelta(state: GameState, rewards: RewardBundle) {
  Object.entries(rewards).forEach(([resource, amount]) => {
    const id = resource as ResourceId;
    state.resources[id] = Math.max(0, state.resources[id] + Math.round(amount ?? 0));
  });
}

function addRewardDelta(target: RewardBundle, rewards: RewardBundle) {
  Object.entries(rewards).forEach(([resource, amount]) => {
    const id = resource as ResourceId;
    target[id] = (target[id] ?? 0) + Math.round(amount ?? 0);
  });
}

function addOfflineSkillXp(state: GameState, skillId: (typeof skillActions)[number]["skillId"], xp: number) {
  const skill = state.skills[skillId];
  let levels = 0;
  skill.xp += xp;
  while (skill.xp >= xpForNextLevel(skill.level)) {
    skill.xp -= xpForNextLevel(skill.level);
    skill.level += 1;
    levels += 1;
  }
  return levels;
}

function addOfflineMasteryXp(state: GameState, actionId: string, xp: number) {
  const mastery = state.actionMastery[actionId] ?? { level: 1, xp: 0 };
  let levels = 0;
  mastery.xp += xp;
  while (mastery.xp >= xpForNextMastery(mastery.level)) {
    mastery.xp -= xpForNextMastery(mastery.level);
    mastery.level += 1;
    levels += 1;
  }
  state.actionMastery[actionId] = mastery;
  return levels;
}
