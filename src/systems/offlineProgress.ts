import { skillActions } from "../data/skills";
import { balanceConfig } from "../data/balanceConfig";
import { MAX_MAIN_SKILL_LEVEL } from "../data/levelBands";
import { actionMasteryXpReward, actionXpRewardWithMastery, canAffordRewards, getSkillAction } from "./actionProcessing";
import { calculateHeatGain, calculateSkillActionRewards } from "./balanceFormulas";
import { canCraft, completeCraft, getRecipe } from "./craftingProcessing";
import { clampRiskStat, xpForNextLevel, xpForNextMastery } from "./formulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { adjustedActionDurationMs, getActiveModifiers } from "./modifiers";
import { applyRiskEvents } from "./riskEvents";
import { processBlackMarketListings } from "./blackMarketSystem";
import { addDistrictMasteryXp } from "./districtMasteryProcessor";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { GameState, OfflineRecap, ResourceId, RewardBundle } from "../types";

const OFFLINE_CAP_MS = 1000 * 60 * 60 * 12;

export function applyOfflineProgress(state: GameState, now = Date.now()) {
  const modifiers = getActiveModifiers(state);
  const capMs = Math.max(OFFLINE_CAP_MS, modifiers.offlineProgressCapHours * 60 * 60 * 1000);
  const elapsed = Math.min(capMs, Math.max(0, now - state.lastSavedAt));
  const next = cloneState(state);
  const marketBefore = next.blackMarketCompletedSales.length;
  const creditsBefore = next.resources.credits;
  const heatBefore = next.resources.heat;

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
    const completions = Math.min(balanceConfig.simCache.maxLoops, Math.floor(available / recipe.durationMs));
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
      completeCraft(next, recipe, 1, true, false);
      recap.completions += 1;
      recap.xpGained += recipe.xpReward;
      recap.masteryXpGained += recipe.masteryXpReward;
    }
    if (next.activeCraft) next.activeCraft.startedAt = now - (available % recipe.durationMs);
    processBlackMarketListings(next, now);
    next.offlineRecap = recap;
    next.lastSavedAt = now;
    pushCategorizedLog(next, "Skill", `Offline crafting: ${recipe.name} completed ${recap.completions} time${recap.completions === 1 ? "" : "s"}.`);
    emitOfflineSummary(next, recap);
    return next;
  }

  if (!next.activeAction) {
    processBlackMarketListings(next, now);
    const marketSales = next.blackMarketCompletedSales.length - marketBefore;
    if (marketSales > 0 || next.blackMarketListings.length !== state.blackMarketListings.length) {
      next.offlineRecap = {
        timeAwayMs: elapsed,
        actionName: "Black Market Listings",
        completions: marketSales,
        xpGained: 0,
        resourcesGained: { credits: Math.max(0, next.resources.credits - creditsBefore) },
        levelsGained: 0,
        masteryXpGained: 0,
        masteryLevelsGained: 0,
        heatGained: Math.max(0, next.resources.heat - heatBefore),
        neuralInstabilityGained: 0,
        message: `Black Market listings progressed while you were away. Completed outcomes: ${marketSales}.`,
      };
      emitOfflineSummary(next, next.offlineRecap);
    }
    next.lastSavedAt = now;
    return next;
  }

  const action = getSkillAction(next.activeAction.actionId);
  if (!action) {
    next.activeAction = null;
    next.lastSavedAt = now;
    return next;
  }

  const durationMs = adjustedActionDurationMs(next, action.durationMs, action.id, [action.skillId, ...(action.tags ?? [])]);
  const available = elapsed + Math.max(0, state.lastSavedAt - next.activeAction.startedAt);
  const completions = Math.min(balanceConfig.simCache.maxLoops, Math.floor(available / durationMs));
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
    const rewards = calculateSkillActionRewards(next, action);
    const xpReward = actionXpRewardWithMastery(next, action);
    const masteryReward = actionMasteryXpReward(next, action);
    applyRewardDelta(next, rewards);
    addRewardDelta(recap.resourcesGained, rewards);
    recap.xpGained += xpReward;
    recap.masteryXpGained += masteryReward;
    recap.levelsGained += addOfflineSkillXp(next, action.skillId, xpReward);
    recap.masteryLevelsGained += addOfflineMasteryXp(next, action.id, masteryReward);
    addDistrictMasteryXp(next, action.districtReq ?? next.selectedDistrict, "action", Math.max(2, Math.round((action.xpReward * 0.55 + masteryReward * 0.35) * 0.5)));
    if (action.heatChange) {
      const heat = calculateHeatGain(next, action.heatChange, action.tags);
      next.resources.heat = clampRiskStat(next.resources.heat + heat);
      recap.heatGained += heat;
    }
    recap.neuralInstabilityGained += 0;
    recap.completions += 1;
  }

  if (next.activeAction) {
    next.activeAction.startedAt = now - (available % durationMs);
    next.activeAction.durationMs = adjustedActionDurationMs(next, action.durationMs, action.id, [action.skillId, ...(action.tags ?? [])]);
  }
  processBlackMarketListings(next, now);
  next.offlineRecap = recap;
  next.lastSavedAt = now;
  applyRiskEvents(next);
  pushCategorizedLog(next, "Skill", `Offline: ${action.name} completed ${recap.completions} time${recap.completions === 1 ? "" : "s"}.`);
  emitOfflineSummary(next, recap);
  return next;
}

function emitOfflineSummary(state: GameState, recap: OfflineRecap) {
  emitRewardPopupGroup(state, {
    title: "Offline Progress Complete",
    category: "story",
    xp: recap.xpGained ? { [state.activeAction ? getSkillAction(state.activeAction.actionId)?.skillId ?? "scavenging" : "cyberware"]: recap.xpGained } : undefined,
    masteryXp: recap.masteryXpGained,
    resources: recap.resourcesGained,
    heat: recap.heatGained,
    neuralInstability: recap.neuralInstabilityGained,
    story: [`${recap.completions} completions`, `${recap.levelsGained} levels gained`],
    durationMs: 5200,
  });
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
  while (skill.level < MAX_MAIN_SKILL_LEVEL && skill.xp >= xpForNextLevel(skill.level)) {
    skill.xp -= xpForNextLevel(skill.level);
    skill.level += 1;
    levels += 1;
  }
  if (skill.level >= MAX_MAIN_SKILL_LEVEL) skill.xp = 0;
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
