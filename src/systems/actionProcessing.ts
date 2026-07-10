import { resourceNames } from "../data/resources";
import { skillActions } from "../data/skills";
import { clampRiskStat, xpForNextLevel, xpForNextMastery } from "./formulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { adjustedDurationMs, applyHeatModifier, applyNeuralModifier, applyRewardModifiers, applyXpModifier, getActiveModifiers } from "./modifiers";
import { applyRiskEvents } from "./riskEvents";
import { updateWorldUnlocks } from "./worldUnlocks";
import { markSkillActionManual } from "./manualDiscovery";
import { addMasteryPoolXp } from "./masteryPool";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import type { GameState, ResourceId, RewardBundle, SkillId } from "../types";

export function getSkillAction(actionId: string) {
  return skillActions.find((action) => action.id === actionId);
}

export function canAffordRewards(state: GameState, rewards: RewardBundle) {
  return Object.entries(rewards).every(([resource, amount]) => {
    return (amount ?? 0) >= 0 || state.resources[resource as ResourceId] >= Math.abs(amount ?? 0);
  });
}

export function startSkillAction(state: GameState, actionId: string, now = Date.now()) {
  const action = getSkillAction(actionId);
  if (!action) return state;
  if (state.skills[action.skillId].level < action.levelReq || !canAffordRewards(state, action.rewards)) return state;
  return {
    ...state,
    activeJob: null,
    activeCraft: null,
    activeAction: {
      actionId,
      startedAt: now,
      durationMs: adjustedDurationMs(state, action.durationMs, [action.skillId, ...(action.tags ?? [])]),
    },
  };
}

export function stopSkillAction(state: GameState) {
  return { ...state, activeAction: null };
}

export function processActionCompletion(state: GameState, now = Date.now()) {
  if (!state.activeAction) return state;
  if (now - state.activeAction.startedAt < state.activeAction.durationMs) return state;

  const next = cloneState(state);
  let guard = 0;

  while (next.activeAction && now - next.activeAction.startedAt >= next.activeAction.durationMs && guard < 100) {
    const action = getSkillAction(next.activeAction.actionId);
    if (!action || !canAffordRewards(next, action.rewards)) {
      pushCategorizedLog(next, "Warning", "Action stopped because required resources ran out.");
      next.activeAction = null;
      break;
    }

    const rewards = applyRewardModifiers(next, action.rewards, [action.skillId, ...(action.tags ?? [])]);
    const xpReward = applyXpModifier(next, action.skillId, action.xpReward);
    applyRewards(next, rewards);
    if (action.heatChange) next.resources.heat = clampRiskStat(next.resources.heat + applyHeatModifier(next, action.heatChange, action.tags));
    if (action.neuralInstabilityChange) {
      next.neuralInstability = clampRiskStat(
        next.neuralInstability + applyNeuralModifier(next, action.neuralInstabilityChange, action.tags),
      );
    }
    const levelUps = addSkillXp(next, action.skillId, xpReward);
    const masteryReward = Math.round(action.masteryXpReward * (1 + getActiveModifiers(next).masteryXpGain));
    const masteryUps = addMasteryXp(next, action.id, masteryReward);
    addMasteryPoolXp(next, action.skillId, Math.ceil(masteryReward * 0.25));
    markSkillActionManual(next, action.id);
    if (next.selectedDistrict) {
      discoverDistrictContent(next, next.selectedDistrict, `skill:${action.id}`);
      changeLocalStanding(next, next.selectedDistrict, 1, `${action.name} completed`);
    }
    pushCategorizedLog(
      next,
      "Skill",
      `${action.name}: +${xpReward} XP, +${masteryReward} mastery, ${formatRewards(rewards)}.`,
    );
    if (levelUps) pushCategorizedLog(next, "Skill", `${action.skillId} reached level ${next.skills[action.skillId].level}.`);
    if (masteryUps) pushCategorizedLog(next, "Skill", `${action.name} mastery reached ${next.actionMastery[action.id].level}.`);
    applyRiskEvents(next);
    updateWorldUnlocks(next);

    next.activeAction = {
      ...next.activeAction,
      startedAt: next.activeAction.startedAt + next.activeAction.durationMs,
      durationMs: adjustedDurationMs(next, action.durationMs, [action.skillId, ...(action.tags ?? [])]),
    };
    guard += 1;
  }

  next.lastSavedAt = Date.now();
  return next;
}

export function applyRewards(state: GameState, rewards: RewardBundle) {
  Object.entries(rewards).forEach(([resource, amount]) => {
    const id = resource as ResourceId;
    state.resources[id] = Math.max(0, state.resources[id] + Math.round(amount ?? 0));
  });
}

export function addSkillXp(state: GameState, skillId: SkillId, xp: number) {
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

export function addMasteryXp(state: GameState, actionId: string, xp: number) {
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

export function formatRewards(rewards: RewardBundle) {
  const parts = Object.entries(rewards)
    .filter(([, amount]) => amount)
    .map(([resource, amount]) => `${amount! > 0 ? "+" : ""}${amount} ${resourceNames[resource as ResourceId]}`);
  return parts.length ? parts.join(", ") : "no resources";
}
