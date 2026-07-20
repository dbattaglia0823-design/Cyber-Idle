import { bosses } from "../data/bosses";
import { combatZones } from "../data/combat";
import { operations } from "../data/operations";
import { balanceConfig } from "../data/balanceConfig";
import { addSkillXp, applyRewards } from "./actionProcessing";
import { calculateDropChance, calculateHeatGain, calculateOperationRewards } from "./balanceFormulas";
import { addItem, removeItem } from "./collectionSystem";
import { clampRiskStat, playerCombatStats } from "./formulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { applyRiskEvents } from "./riskEvents";
import { changeDistrictThreat, districtThreatPenalty, districtThreatRewardBonus } from "./districtThreat";
import { updateOperationAchievements } from "./achievements";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import { scenarioBonusForTags } from "./scenarioModifiers";
import { addWeaponClassXp, equippedWeaponClass } from "./weaponSystem";
import { combatEffectivenessForEnemy, combatTagsForEnemy } from "./combatMatchups";
import { emitRewardPopupGroup } from "./rewardPopups";
import { clearActiveActivityForSwitch } from "./activitySwitching";
import { applyDamage, estimateIncomingDamage, maybeAutoHeal } from "./healthSystem";
import { addDistrictMasteryXp, districtMasteryDropBonus, districtMasteryRewardBonus } from "./districtMasteryProcessor";
import type { Boss, GameState, OperationDefinition, OperationRoute, OperationRouteId } from "../types";

export function getOperation(id: string) {
  return operations.find((operation) => operation.id === id);
}

export function canStartOperation(state: GameState, operation: OperationDefinition) {
  if (!state.districts[operation.districtId]?.unlocked) return false;
  if (operation.id === "op-backstreet-sweep" && !state.operationLeads[operation.id] && !state.operationLogs[operation.id]?.firstClear) return false;
  if (operation.id === "op-backstreet-sweep" && state.skills.combat.level < 10) return false;
  if (operation.id === "op-junkyard-lockdown" && state.skills.combat.level < 30) return false;
  if (operation.id === "op-contraband-raid" && state.resources.reputation < 150) return false;
  if (operation.id === "op-ghost-signal-dive" && state.skills.hacking.level < 60) return false;
  if (operation.id === "op-corporate-extraction" && (state.skills.hacking.level < 100 || state.skills.combat.level < 100)) return false;
  if (!operation.unlockRequirements.every((requirement) => requirementMet(state, requirement))) return false;
  return Object.entries(operation.requiredItems ?? {}).every(([id, amount]) => (state.inventory[id] ?? 0) >= amount);
}

export function operationRequirementDetails(state: GameState, operation: OperationDefinition) {
  const requirements = [
    ...operation.unlockRequirements,
    ...(operation.id === "op-backstreet-sweep" ? ["Street Combat level 5", "Operation lead: Backstreet Sweep"] : []),
    ...(operation.id === "op-junkyard-lockdown" ? ["Street Combat level 15"] : []),
    ...(operation.id === "op-contraband-raid" ? ["Reputation 150"] : []),
    ...(operation.id === "op-ghost-signal-dive" ? ["Hacking level 25"] : []),
    ...(operation.id === "op-corporate-extraction" ? ["Hacking level 35", "Street Combat level 30"] : []),
    ...Object.entries(operation.requiredItems ?? {}).map(([id, amount]) => `${amount} ${id}`),
  ];
  return [...new Set(requirements)].map((requirement) => ({
    text: requirement,
    met: operationRequirementMet(state, operation, requirement),
  }));
}

export function operationRouteSuccessChance(state: GameState, operation: OperationDefinition, route?: OperationRoute) {
  const boss = bosses.find((entry) => entry.id === operation.bossId);
  if (!boss) return 0;
  const operationTags = operationMatchupTags(operation, boss, route);
  const bossMatchup = combatEffectivenessForEnemy(state, boss, operationTags);
  const stats = playerCombatStats(state);
  const threatPenalty = districtThreatPenalty(state, operation.districtId);
  const scenario = scenarioBonusForTags(state, operationTags);
  const mechanicSuccess = (operation.mechanics ?? []).reduce((sum, mechanic) => sum + (mechanic.successModifier ?? 0), 0);
  const playerScore = stats.damage * 5 + stats.armor * 3 + stats.maxHp * 0.25;
  const operationScore = bossMatchup.effectiveHp * 0.45 + boss.damage * 6 + boss.armor * 8;
  const modifier = 1 + scenario.damageBonus + (route?.successModifier ?? 0) + mechanicSuccess - threatPenalty;
  const ratio = (playerScore * modifier) / Math.max(1, operationScore);
  return Math.max(0.05, Math.min(0.95, 0.5 + (ratio - 1) * 0.8));
}

export function operationRequirementMet(state: GameState, operation: OperationDefinition, requirement: string) {
  const lower = requirement.toLowerCase();
  if (operation.id === "op-backstreet-sweep" && lower.includes("operation lead")) return Boolean(state.operationLeads[operation.id] || state.operationLogs[operation.id]?.firstClear);
  const itemMatch = requirement.match(/^(\d+)\s+(.+)$/);
  if (itemMatch && operation.requiredItems?.[itemMatch[2]]) return (state.inventory[itemMatch[2]] ?? 0) >= Number(itemMatch[1]);
  return requirementMet(state, requirement);
}

function requirementMet(state: GameState, requirement: string) {
  const lower = requirement.toLowerCase();
  const levelMatch = lower.match(/(street combat|combat|hacking|scavenging|cyberware engineering|vehicle tuning|black market|medical knowledge|medical|streetcraft)\s+level\s+(\d+)/);
  if (levelMatch) {
    const skill = skillIdFromRequirement(levelMatch[1]);
    return skill ? state.skills[skill].level >= Number(levelMatch[2]) : true;
  }
  if (lower.includes("unlocked")) return true;
  if (lower.includes("reputation")) {
    const value = Number(lower.match(/reputation\s+(\d+)/)?.[1] ?? 0);
    return state.resources.reputation >= value;
  }
  return true;
}

function skillIdFromRequirement(label: string): keyof GameState["skills"] | null {
  if (label.includes("hacking")) return "hacking";
  if (label.includes("scavenging")) return "scavenging";
  if (label.includes("cyberware")) return "cyberware";
  if (label.includes("vehicle")) return "vehicleTuning";
  if (label.includes("black market")) return "blackMarket";
  if (label.includes("medical")) return "medical";
  if (label.includes("streetcraft")) return "streetcraft";
  if (label.includes("combat")) return "combat";
  return null;
}

export function startOperation(state: GameState, operationId: string, routeId?: OperationRouteId, now = Date.now()) {
  const operation = getOperation(operationId);
  if (!operation || !canStartOperation(state, operation)) return state;
  const route = selectedRoute(operation, routeId);
  const next = cloneState(state);
  Object.entries(operation.requiredItems ?? {}).forEach(([id, amount]) => removeItem(next, id, amount));
  clearActiveActivityForSwitch(state, next, operation.name);
  next.activeOperation = {
    operationId,
    routeId: route?.id,
    startedAt: now,
    durationMs: operationDurationMs(next, operation, route),
    stageIndex: 0,
  };
  pushCategorizedLog(next, "Combat", `Operation started: ${operation.name}${route ? ` via ${route.name}` : ""}.`);
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
  completeOperation(next, operation, next.activeOperation!.durationMs, next.activeOperation!.routeId);
  next.activeOperation = null;
  next.lastSavedAt = Date.now();
  return next;
}

function completeOperation(state: GameState, operation: OperationDefinition, clearMs: number, routeId?: OperationRouteId) {
  const boss = bosses.find((entry) => entry.id === operation.bossId)!;
  const route = selectedRoute(operation, routeId);
  const operationTags = operationMatchupTags(operation, boss, route);
  const bossMatchup = combatEffectivenessForEnemy(state, boss, operationTags);
  const stats = playerCombatStats(state);
  const threatPenalty = districtThreatPenalty(state, operation.districtId);
  const threatBonus = districtThreatRewardBonus(state, operation.districtId);
  const playerScore = stats.damage * 5 + stats.armor * 3 + stats.maxHp * 0.25;
  const scenario = scenarioBonusForTags(state, operationTags);
  const mechanicSuccess = (operation.mechanics ?? []).reduce((sum, mechanic) => sum + (mechanic.successModifier ?? 0), 0);
  const phaseEffects = bossPhaseEffects(boss);
  const operationScore = bossMatchup.effectiveHp * 0.45 + boss.damage * 6 + boss.armor * 8;
  const stageDamage = operation.stages.reduce((sum, stage) => {
    return sum + stage.enemyIds.reduce((stageSum, enemyId) => {
      const enemy = combatZones.flatMap((zone) => zone.enemies).find((entry) => entry.id === enemyId) ?? bosses.find((entry) => entry.id === enemyId);
      return stageSum + (enemy ? estimateIncomingDamage(state, enemy, Math.max(2500, clearMs / Math.max(1, operation.stages.length))) : 0);
    }, 0);
  }, 0);
  const bossDamage = estimateIncomingDamage(state, boss, clearMs);
  const damageTaken = applyDamage(state, Math.max(1, Math.round((stageDamage + bossDamage) * (route?.id === "silentEntry" ? 0.8 : 1))), operation.name);
  maybeAutoHeal(state, operation.name);
  if (state.health.lifeState === "downed") {
    state.healthStatistics.deathsByOperation[operation.id] = (state.healthStatistics.deathsByOperation[operation.id] ?? 0) + 1;
  }
  const routeSuccess = route?.successModifier ?? 0;
  const success = state.health.lifeState !== "downed" && playerScore * (1 + scenario.damageBonus + routeSuccess + mechanicSuccess) >= operationScore * (1 + threatPenalty);
  const firstClear = !state.operationLogs[operation.id]?.firstClear;
  const mechanicReward = (operation.mechanics ?? []).reduce((total, mechanic) => total * (mechanic.rewardMultiplier ?? 1), 1);
  const rewardMultiplier = (1 + threatBonus + districtMasteryRewardBonus(state, operation.districtId)) * bossMatchup.rewardMultiplier * (route?.rewardMultiplier ?? 1) * mechanicReward;
  const rareDropBonus =
    threatBonus +
    bossMatchup.dropChance +
    (route?.rareDropModifier ?? 0) +
    (operation.mechanics ?? []).reduce((sum, mechanic) => sum + (mechanic.rareDropModifier ?? 0), 0) +
    districtMasteryDropBonus(state, operation.districtId) +
    phaseEffects.rareDropModifier;
  const rewards = calculateOperationRewards(state, {
    ...operation.completionRewards,
    ...(firstClear ? operation.firstClearRewards : operation.repeatClearRewards),
  }, rewardMultiplier);
  const itemsGained: Record<string, number> = {};

  if (success) {
    applyRewards(state, rewards);
    operation.rareDrops.forEach((drop) => {
      if (Math.random() <= calculateDropChance(drop.chance, state, operationTags, rareDropBonus)) {
        addItem(state, drop.id, drop.quantity);
        itemsGained[drop.id] = (itemsGained[drop.id] ?? 0) + drop.quantity;
      }
    });
    boss.drops.forEach((drop) => {
      if (Math.random() <= calculateDropChance(drop.chance, state, operationTags, rareDropBonus)) {
        addItem(state, drop.id, drop.quantity);
        itemsGained[drop.id] = (itemsGained[drop.id] ?? 0) + drop.quantity;
      }
    });
    if (route?.bonusDrop && Math.random() <= calculateDropChance(route.bonusDrop.chance, state, operationTags, rareDropBonus)) {
      addItem(state, route.bonusDrop.id, route.bonusDrop.quantity);
      itemsGained[route.bonusDrop.id] = (itemsGained[route.bonusDrop.id] ?? 0) + route.bonusDrop.quantity;
    }
    addSkillXp(state, "combat", Math.ceil(boss.xpReward * (1 + threatBonus)));
    if (operation.id.includes("ghost") || operation.id.includes("corporate")) addSkillXp(state, "hacking", Math.ceil(boss.xpReward * 0.35));
    const weaponClass = equippedWeaponClass(state);
    if (weaponClass) {
      addWeaponClassXp(state, weaponClass, Math.max(20, Math.round(boss.xpReward * 0.4)), true);
      state.weaponStatistics.operationsByClass[weaponClass] = (state.weaponStatistics.operationsByClass[weaponClass] ?? 0) + 1;
      state.achievements[`operation-${weaponClass}`] = true;
    }
    const heatChange = totalOperationHeatChange(state, operation, route, bossMatchup.heatChange, phaseEffects.heatChange);
    state.resources.heat = clampRiskStat(state.resources.heat + heatChange);
    Object.entries(operation.factionReputation).forEach(([id, amount]) => {
      state.factions[id as keyof typeof state.factions].reputation += amount ?? 0;
    });
    Object.entries(route?.factionConsequences ?? {}).forEach(([id, amount]) => {
      state.factions[id as keyof typeof state.factions].reputation += amount ?? 0;
    });
    Object.entries(operation.fixerTrust ?? {}).forEach(([id, amount]) => {
      const trust = state.fixerTrust[id] ?? { trust: 0, completedJobs: 0 };
      trust.trust += amount ?? 0;
      state.fixerTrust[id] = trust;
    });
    changeDistrictThreat(state, operation.districtId, -8 + (operation.mechanics ?? []).reduce((sum, mechanic) => sum + (mechanic.threatChange ?? 0), 0));
    changeLocalStanding(state, operation.districtId, firstClear ? 8 : 4, `${operation.name} cleared`);
    discoverDistrictContent(state, operation.districtId, `operation:${operation.id}`);
    addDistrictMasteryXp(state, operation.districtId, "operation", Math.max(40, Math.round(boss.xpReward * 0.8)));
    if ((state.districtThreat[operation.districtId]?.level ?? 0) >= 35) {
      state.highThreatOperationClears[operation.id] = (state.highThreatOperationClears[operation.id] ?? 0) + 1;
      state.endgameStatistics.highThreatClears += 1;
      state.achievements["first-high-threat-operation"] = true;
    }
    recordOperation(state, operation.id, clearMs, itemsGained);
    recordBoss(state, boss.id, clearMs);
    phaseEffects.messages.forEach((message) => pushCategorizedLog(state, "Combat", message));
    pushCategorizedLog(state, "Combat", `Operation cleared: ${operation.name}${route ? ` via ${route.name}` : ""}. ${bossMatchup.rating}.`);
  } else {
    const failedHeat = Math.ceil(totalOperationHeatChange(state, operation, route, bossMatchup.heatChange, phaseEffects.heatChange) * 0.5);
    state.resources.heat = clampRiskStat(state.resources.heat + failedHeat);
    changeDistrictThreat(state, operation.districtId, 10);
    changeLocalStanding(state, operation.districtId, -3, `${operation.name} failed`);
    pushCategorizedLog(state, "Warning", `Operation failed: ${operation.name}. District threat rose.${state.health.lifeState === "downed" ? " You were downed." : ""}`);
  }

  state.operationRecap = {
    operationId: operation.id,
    routeId: route?.id,
    success,
    clearMs,
    enemiesDefeated: success ? operation.stages.reduce((sum, stage) => sum + stage.enemyIds.length, 0) : 0,
    bossDefeated: success,
    xpGained: success ? boss.xpReward : 0,
    rewards: success ? rewards : {},
    itemsGained,
    heatChange: totalOperationHeatChange(state, operation, route, bossMatchup.heatChange, phaseEffects.heatChange),
    neuralInstabilityChange: 0,
    firstClear: success && firstClear,
    message: success ? `${operation.name} cleared${route ? ` via ${route.name}` : ""}. Took ${damageTaken} damage.` : `${operation.name} failed${route ? ` via ${route.name}` : ""}. Took ${damageTaken} damage.`,
  };
  emitRewardPopupGroup(state, {
    title: success ? `${operation.name} Cleared` : `${operation.name} Failed`,
    category: success ? "rare" : "warning",
    xp: success ? { combat: boss.xpReward } : undefined,
    resources: success ? rewards : {},
    items: itemsGained,
    heat: state.operationRecap.heatChange,
    neuralInstability: state.operationRecap.neuralInstabilityChange,
    warnings: success ? [] : ["District threat rose"],
    durationMs: success ? 5000 : 4500,
  });
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

function operationDurationMs(state: GameState, operation: OperationDefinition, route?: OperationRoute) {
  const boss = bosses.find((entry) => entry.id === operation.bossId)!;
  const stageTime = operation.stages.reduce((sum, stage) => sum + stage.enemyIds.length * balanceConfig.enemyScaling.operationStageMs, 0);
  const routeMultiplier = route?.id === "silentEntry" || route?.id === "corporateDisguise" ? 1.12 : route?.id === "directAssault" ? 0.94 : 1;
  return Math.round((stageTime + combatEffectivenessForEnemy(state, boss, operationMatchupTags(operation, boss, route)).expectedKillMs + boss.mechanics.length * balanceConfig.enemyScaling.operationMechanicMs) * routeMultiplier);
}

function selectedRoute(operation: OperationDefinition, routeId?: OperationRouteId) {
  return operation.routes?.find((route) => route.id === routeId) ?? operation.routes?.find((route) => route.id === operation.defaultRouteId) ?? operation.routes?.[0];
}

function operationMatchupTags(operation: OperationDefinition, boss: Boss, route?: OperationRoute) {
  return [
    "operation",
    "boss",
    operation.districtId,
    ...(operation.recommendedLoadoutTags ?? []),
    ...(route ? [route.id, ...route.recommendedTags] : []),
    ...operation.stages.flatMap((stage) => [...stage.enemyIds, ...(stage.recommendedTags ?? [])]),
    ...(operation.mechanics ?? []).flatMap((mechanic) => mechanic.tags),
    ...combatTagsForEnemy(boss),
  ];
}

function bossPhaseEffects(boss: Boss) {
  return (boss.phases ?? []).reduce(
    (totals, phase) => {
      totals.heatChange += phase.heatChange ?? 0;
      totals.neuralInstabilityChange += phase.neuralInstabilityChange ?? 0;
      totals.rareDropModifier += phase.rareDropModifier ?? 0;
      totals.messages.push(phase.logMessage);
      return totals;
    },
    { heatChange: 0, neuralInstabilityChange: 0, rareDropModifier: 0, messages: [] as string[] },
  );
}

function totalOperationHeatChange(state: GameState, operation: OperationDefinition, route: OperationRoute | undefined, matchupHeat: number, phaseHeat: number) {
  const raw =
    operation.heatChange +
    (route?.heatChange ?? 0) +
    (operation.mechanics ?? []).reduce((sum, mechanic) => sum + (mechanic.heatChange ?? 0), 0) +
    matchupHeat +
    phaseHeat;
  return calculateHeatGain(state, raw, ["operation", operation.districtId, ...(route?.recommendedTags ?? [])]);
}
