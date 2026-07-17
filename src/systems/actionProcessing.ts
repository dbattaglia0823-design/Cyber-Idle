import { resourceNames } from "../data/resources";
import { skillActions, skillNames } from "../data/skills";
import { balanceConfig } from "../data/balanceConfig";
import { clampRiskStat, xpForNextLevel, xpForNextMastery } from "./formulas";
import { calculateDropChance, calculateHeatGain, calculateSkillActionRewards, masteryDropBonusForLevel } from "./balanceFormulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { adjustedDurationMs, applyXpModifier, getActiveModifiers } from "./modifiers";
import { applyRiskEvents } from "./riskEvents";
import { updateWorldUnlocks } from "./worldUnlocks";
import { markSkillActionManual } from "./manualDiscovery";
import { addMasteryPoolXp } from "./masteryPool";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import { changeDistrictThreat } from "./districtThreat";
import { addDistrictMasteryXp, districtMasteryRewardBonus } from "./districtMasteryProcessor";
import { addItem, discoverItem } from "./collectionSystem";
import { emitRewardPopupGroup } from "./rewardPopups";
import { clearActiveActivityForSwitch } from "./activitySwitching";
import { meetsActionAccessRequirement } from "./actionAccess";
import type { EnemyDrop, GameState, ResourceId, RewardBundle, SkillAction, SkillId } from "../types";

export function getSkillAction(actionId: string) {
  return skillActions.find((action) => action.id === actionId);
}

export function canAffordRewards(state: GameState, rewards: RewardBundle) {
  return Object.entries(rewards).every(([resource, amount]) => {
    return (amount ?? 0) >= 0 || state.resources[resource as ResourceId] >= Math.abs(amount ?? 0);
  });
}

function hasRequiredItems(state: GameState, action: SkillAction) {
  return Object.entries(action.requiredItems ?? {}).every(([id, amount]) => {
    if (id in resourceNames) return state.resources[id as ResourceId] >= amount;
    return (state.inventory[id] ?? 0) >= amount;
  });
}

function canUseActionInWorld(state: GameState, action: SkillAction) {
  if (action.districtReq && !state.districts[action.districtReq]?.unlocked) return false;
  return (action.requiredUnlocks ?? []).every((id) => state.unlocks[id] || state.worldUnlocks[id] || state.unlockedBlueprints[id] || Boolean(state.inventory[id]));
}

export function startSkillAction(state: GameState, actionId: string, now = Date.now()) {
  const action = getSkillAction(actionId);
  if (!action) return state;
  if (!meetsActionAccessRequirement(state, action) || !canAffordRewards(state, action.rewards) || !hasRequiredItems(state, action) || !canUseActionInWorld(state, action)) return state;
  const next = cloneState(state);
  clearActiveActivityForSwitch(state, next, action.name);
  next.activeAction = {
    actionId,
    startedAt: now,
    durationMs: adjustedDurationMs(state, action.durationMs, [action.skillId, ...(action.tags ?? [])]),
  };
  return next;
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
    if (!action || !meetsActionAccessRequirement(next, action) || !canAffordRewards(next, action.rewards) || !hasRequiredItems(next, action) || !canUseActionInWorld(next, action)) {
      pushCategorizedLog(next, "Warning", "Action stopped because required resources ran out.");
      next.activeAction = null;
      break;
    }

    const rewards = calculateSkillActionRewards(next, action);
    if (action.districtReq) {
      const districtBonus = districtMasteryRewardBonus(next, action.districtReq);
      Object.entries(rewards).forEach(([resource, amount]) => {
        if ((amount ?? 0) > 0) rewards[resource as keyof RewardBundle] = Math.max(1, Math.round((amount ?? 0) * (1 + districtBonus)));
      });
    }
    const xpReward = actionXpRewardWithMastery(next, action);
    applyRewards(next, rewards);
    const heatDelta = action.heatChange ? calculateHeatGain(next, action.heatChange, action.tags) : 0;
    if (heatDelta) next.resources.heat = clampRiskStat(next.resources.heat + heatDelta);
    const neuralDelta = 0;
    const levelUps = addSkillXp(next, action.skillId, xpReward);
    const masteryReward = Math.round(action.masteryXpReward * (1 + getActiveModifiers(next).masteryXpGain));
    const masteryUps = addMasteryXp(next, action.id, masteryReward);
    addMasteryPoolXp(next, action.skillId, action.masteryPoolXpReward ?? Math.ceil(masteryReward * 0.25));
    markSkillActionManual(next, action.id);
    const districtId = action.districtReq ?? next.selectedDistrict;
    if (districtId) {
      discoverDistrictContent(next, districtId, `skill:${action.id}`);
      changeLocalStanding(next, districtId, action.localStandingChange ?? 1, `${action.name} completed`);
      addDistrictMasteryXp(next, districtId, "action", Math.max(4, Math.round(action.xpReward * 0.55 + masteryReward * 0.35)));
      if (action.threatChange) changeDistrictThreat(next, districtId, action.threatChange);
    }
    const rareMessages = processSkillRareDrops(next, action);
    const traceMessage = processHackingTrace(next, action);
    updateSkillActionStats(next, action, rareMessages.length, Boolean(traceMessage));
    emitRewardPopupGroup(next, {
      title: `${action.name} Complete`,
      xp: { [action.skillId]: xpReward },
      masteryXp: masteryReward,
      poolXp: action.masteryPoolXpReward ?? Math.ceil(masteryReward * 0.25),
      resources: rewards,
      rareDrops: rareMessages,
      levelUps: levelUps ? [`${skillNames[action.skillId]} ${next.skills[action.skillId].level}`] : [],
      masteryLevelUps: masteryUps ? [`${action.name} ${next.actionMastery[action.id].level}`] : [],
      heat: heatDelta,
      neuralInstability: neuralDelta,
      warnings: traceMessage ? [traceMessage] : [],
    });
    pushCategorizedLog(
      next,
      "Skill",
      `${action.name}: +${xpReward} XP, +${masteryReward} mastery, ${formatRewards(rewards)}${rareMessages.length ? `, rare ${rareMessages.join(", ")}` : ""}${traceMessage ? `, ${traceMessage}` : ""}.`,
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

function processSkillRareDrops(state: GameState, action: SkillAction) {
  const messages: string[] = [];
  const mastery = state.actionMastery[action.id]?.level ?? 1;
  const masteryBonus = masteryDropBonusForLevel(mastery);
  (action.rareDrops ?? []).forEach((drop) => {
    const chance = calculateDropChance(drop.chance, state, [action.skillId, ...(action.tags ?? [])], masteryBonus + toolDropBonus(state, action));
    if (Math.random() > chance) return;
    grantDrop(state, drop);
    state.marketStatistics.rareDropsBySkill[action.skillId] = (state.marketStatistics.rareDropsBySkill[action.skillId] ?? 0) + 1;
    state.achievements[`first-rare-${action.skillId}`] = true;
    messages.push(drop.name);
    pushCategorizedLog(state, "Loot", `${action.name} rare drop: ${drop.name}.`);
  });
  return messages;
}

function grantDrop(state: GameState, drop: EnemyDrop) {
  if (drop.id in resourceNames) {
    state.resources[drop.id as ResourceId] += drop.quantity;
  } else {
    addItem(state, drop.id, drop.quantity);
    discoverItem(state, drop.id);
  }
}

function processHackingTrace(state: GameState, action: SkillAction) {
  if (!action.traceChance) return "";
  const chance = Math.max(balanceConfig.risk.traceMinChance, action.traceChance - traceReduction(state, action));
  if (Math.random() > chance) return "";
  const severity = action.traceSeverity ?? 1;
  const heat = calculateHeatGain(state, severity * 3, ["hacking", ...(action.tags ?? [])]);
  state.resources.heat = clampRiskStat(state.resources.heat + heat);
  state.resources.encryptedData = Math.max(0, state.resources.encryptedData - severity);
  if (severity >= 3) state.unlocks["blacknet-trace-events"] = true;
  if (action.districtReq) changeDistrictThreat(state, action.districtReq, severity);
  state.marketStatistics.traceEvents += 1;
  state.achievements["first-trace-event"] = true;
  return `trace event +${heat} Heat`;
}

function traceReduction(state: GameState, action: SkillAction) {
  const levelReduction = Math.min(balanceConfig.risk.traceLevelReductionMax, state.skills.hacking.level * balanceConfig.risk.traceLevelReductionPerLevel);
  const localStandingReduction = action.districtReq ? Math.max(0, state.districtStanding[action.districtReq]?.standing ?? 0) * 0.0008 : 0;
  const programReduction = (action.recommendedPrograms ?? []).some((id) => (state.inventory[id] ?? 0) > 0) ? balanceConfig.risk.traceProgramReduction : 0;
  const scrambler = Object.values(state.weaponLoadouts[state.equippedGear.weapon ?? ""]?.mods ?? {}).some((id) => id?.includes("trace-scrambler")) ? balanceConfig.risk.traceScramblerReduction : 0;
  const nullChoir = Math.min(balanceConfig.risk.traceFactionReductionMax, Math.max(0, state.factions.nullChoir.reputation) * 0.001);
  return levelReduction + localStandingReduction + programReduction + scrambler + nullChoir;
}

function toolDropBonus(state: GameState, action: SkillAction) {
  const toolBonus = (action.recommendedTools ?? []).some((id) => (state.inventory[id] ?? 0) > 0) ? balanceConfig.rewards.toolDropBonus : 0;
  const programBonus = (action.recommendedPrograms ?? []).some((id) => (state.inventory[id] ?? 0) > 0) ? balanceConfig.rewards.programDropBonus : 0;
  return toolBonus + programBonus;
}

function updateSkillActionStats(state: GameState, action: SkillAction, rareDrops: number, traced: boolean) {
  state.marketStatistics.skillActionsCompletedBySkill[action.skillId] = (state.marketStatistics.skillActionsCompletedBySkill[action.skillId] ?? 0) + 1;
  if (action.skillId === "scavenging") state.marketStatistics.scavengingFinds += 1 + rareDrops;
  if (action.skillId === "cyberware" && action.tags?.includes("repair")) {
    state.marketStatistics.cyberwareRepaired += 1;
    state.achievements["repair-first-damaged-cyberware"] = true;
  }
  if (action.skillId === "vehicleTuning") {
    state.marketStatistics.vehicleTuningActions += 1;
    state.achievements["first-vehicle-component-upgrade"] = true;
  }
  if (action.skillId === "medical") {
    state.marketStatistics.medicalTreatments += 1;
    if ((action.neuralInstabilityChange ?? 0) < 0) state.achievements["medical-ni-reduction"] = true;
  }
  if (action.skillId === "streetcraft") {
    state.marketStatistics.streetcraftFavors += 1;
    if ((action.heatChange ?? 0) < 0) state.achievements["streetcraft-heat-resolution"] = true;
  }
  if (traced) state.achievements[`trace-${action.id}`] = true;
  [25, 50, 99].forEach((level) => {
    if (state.skills[action.skillId].level >= level) state.achievements[`${action.skillId}-level-${level}`] = true;
  });
  if ((state.actionMastery[action.id]?.level ?? 1) >= 99) state.achievements[`master-${action.id}`] = true;
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

export function actionXpRewardWithMastery(state: GameState, action: SkillAction) {
  const masteryLevel = state.actionMastery[action.id]?.level ?? 1;
  return Math.max(1, Math.round(applyXpModifier(state, action.skillId, action.xpReward) * (1 + masteryLevel * 0.02)));
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
