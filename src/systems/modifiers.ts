import { companions } from "../data/companions";
import { housingOptions } from "../data/housing";
import { getItem } from "../data/items";
import { vehicles } from "../data/vehicles";
import { startingPaths } from "../data/startingPaths";
import { cyberwareLoad, effectiveNeuralInstability } from "./itemFormulas";
import { heatTier, neuralInstabilityTierName } from "./riskEvents";
import { masteryPoolBonus } from "./masteryPool";
import { applyPerkModifiers } from "./perkSystem";
import type { ActiveModifiers, GameState, RewardBundle, SkillId } from "../types";

export function getActiveModifiers(state: GameState): ActiveModifiers {
  const modifiers: ActiveModifiers = {
    skillXp: {},
    skillRewards: 0,
    actionSpeed: 0,
    combatDamage: 0,
    combatDefense: 0,
    combatXp: 0,
    dropChance: 0,
    creditsGained: 0,
    reputationGained: 0,
    heatGain: 0,
    heatDecay: 0,
    neuralInstabilityGain: 0,
    neuralInstabilityRecovery: 0,
    jobSuccessChance: 0,
    jobRewards: 0,
    shopPrices: 0,
    offlineProgressCapHours: 12,
    fixerTrustGain: 0,
    masteryXpGain: 0,
    craftingCostReduction: 0,
    upgradeCostReduction: 0,
    vehicleUpgradeCostReduction: 0,
    ripperdocCostReduction: 0,
    localStandingGain: 0,
    companionRelationshipGain: 0,
    factionReputationGain: 0,
    simCacheEfficiency: 0,
    activeSources: [],
  };

  applyPerkModifiers(state, modifiers);
  applyStartingPath(state, modifiers);
  applyHousing(state, modifiers);
  applyFactions(state, modifiers);
  applyMasteryPools(state, modifiers);
  applyFixerTrust(state, modifiers);
  applyCompanion(state, modifiers);
  applyEquipment(state, modifiers);
  applyVehicle(state, modifiers);
  applyRiskState(state, modifiers);

  return modifiers;
}

function applyMasteryPools(state: GameState, modifiers: ActiveModifiers) {
  (Object.keys(state.skills) as Array<keyof GameState["skills"]>).forEach((skill) => {
    const bonus = masteryPoolBonus(state, skill);
    modifiers.skillXp[skill] = (modifiers.skillXp[skill] ?? 0) + bonus.xp;
    modifiers.actionSpeed += bonus.speed;
    modifiers.skillRewards += bonus.rewards;
    modifiers.dropChance += bonus.rareDrop;
    if (bonus.automation) modifiers.activeSources.push(`${skill} mastery automation`);
  });
}

export function applyXpModifier(state: GameState, skillId: SkillId, amount: number) {
  const modifiers = getActiveModifiers(state);
  const skillBonus = modifiers.skillXp[skillId] ?? 0;
  const combatBonus = skillId === "combat" ? modifiers.combatXp : 0;
  return Math.max(1, Math.round(amount * (1 + skillBonus + combatBonus)));
}

export function applyRewardModifiers(state: GameState, rewards: RewardBundle, tags: string[] = []) {
  const modifiers = getActiveModifiers(state);
  const adjusted: RewardBundle = { ...rewards };
  Object.entries(adjusted).forEach(([resource, value]) => {
    if (!value || value < 0) return;
    let bonus = modifiers.skillRewards;
    if (resource === "credits") bonus += modifiers.creditsGained;
    if (resource === "reputation") bonus += modifiers.reputationGained;
    if (tags.includes("job")) bonus += modifiers.jobRewards;
    adjusted[resource as keyof RewardBundle] = Math.max(1, Math.round(value * (1 + bonus)));
  });
  return adjusted;
}

export function applyHeatModifier(state: GameState, heat: number, tags: string[] = []) {
  const modifiers = getActiveModifiers(state);
  const smugglingRelief = tags.includes("smuggling") ? -0.05 : 0;
  return Math.max(0, Math.round(heat * (1 + modifiers.heatGain + smugglingRelief)));
}

export function applyNeuralModifier(state: GameState, amount: number, tags: string[] = []) {
  const modifiers = getActiveModifiers(state);
  const prototypePenalty = state.startingPath === "corporateDefector" && tags.includes("prototype") ? 0.05 : 0;
  return Math.max(0, Math.round(amount * (1 + modifiers.neuralInstabilityGain + prototypePenalty)));
}

export function adjustedDurationMs(state: GameState, durationMs: number, tags: string[] = []) {
  const modifiers = getActiveModifiers(state);
  const speed = modifiers.actionSpeed + (tags.some((tag) => tag === "smuggling" || tag === "vehicle") ? vehicleSpeedBonus(state) : 0);
  return Math.max(1000, Math.round(durationMs * (1 - Math.min(0.5, speed))));
}

export function jobSuccessChance(state: GameState, baseChance: number, tags: string[] = []) {
  const modifiers = getActiveModifiers(state);
  let chance = baseChance + modifiers.jobSuccessChance;
  if (state.startingPath === "streetborn" && tags.includes("corporate")) chance -= 0.05;
  if (state.neuralInstability >= 25 && tags.includes("hacking")) chance -= state.neuralInstability >= 75 ? 0.1 : state.neuralInstability >= 50 ? 0.05 : 0.02;
  if (state.neuralInstability >= 75 && tags.includes("corporate")) chance -= 0.1;
  return Math.max(0.05, Math.min(0.98, chance));
}

function applyStartingPath(state: GameState, modifiers: ActiveModifiers) {
  const path = startingPaths.find((entry) => entry.id === state.startingPath);
  if (!path) return;
  modifiers.activeSources.push(path.name);
  if (path.id === "outrider") {
    modifiers.skillRewards += 0.05;
    modifiers.skillXp.hacking = (modifiers.skillXp.hacking ?? 0) - 0.05;
    modifiers.shopPrices += 0.05;
  }
  if (path.id === "streetborn") {
    modifiers.combatXp += 0.1;
    modifiers.reputationGained += 0.05;
    modifiers.fixerTrustGain += 0.05;
    modifiers.shopPrices -= 0.03;
    modifiers.heatGain += 0.05;
  }
  if (path.id === "corporateDefector") {
    modifiers.skillXp.hacking = (modifiers.skillXp.hacking ?? 0) + 0.1;
    modifiers.skillXp.cyberware = (modifiers.skillXp.cyberware ?? 0) + 0.05;
    modifiers.creditsGained += 0.05;
    modifiers.fixerTrustGain -= 0.05;
  }
}

function applyHousing(state: GameState, modifiers: ActiveModifiers) {
  const housing = housingOptions.find((option) => option.id === state.activeResidence);
  if (!housing) return;
  modifiers.activeSources.push(housing.name);
  modifiers.offlineProgressCapHours += housing.offlineCapBonusHours;
  modifiers.heatDecay += housing.heatDecayBonus / 100;
  modifiers.neuralInstabilityRecovery += housing.neuralRecoveryBonus / 100;
  if (housing.id === "rust-yard-garage") modifiers.skillRewards += 0.05;
  if (housing.id === "underpass-safehouse") modifiers.heatGain -= 0.05;
  if (housing.id === "blacknet-loft") {
    modifiers.skillXp.hacking = (modifiers.skillXp.hacking ?? 0) + 0.05;
    modifiers.skillRewards += 0.05;
  }
  if (housing.id === "glassline-apartment") {
    modifiers.jobSuccessChance += 0.05;
    modifiers.skillXp.cyberware = (modifiers.skillXp.cyberware ?? 0) + 0.05;
  }
  if (housing.id === "skyline-penthouse") {
    modifiers.skillXp.scavenging = (modifiers.skillXp.scavenging ?? 0) + 0.05;
    modifiers.skillXp.hacking = (modifiers.skillXp.hacking ?? 0) + 0.05;
    modifiers.skillXp.cyberware = (modifiers.skillXp.cyberware ?? 0) + 0.05;
    modifiers.skillXp.combat = (modifiers.skillXp.combat ?? 0) + 0.05;
    modifiers.reputationGained += 0.05;
  }
}

function applyFactions(state: GameState, modifiers: ActiveModifiers) {
  const rank = (id: keyof GameState["factions"]) => factionRank(state.factions[id]?.reputation ?? 0);
  const chrome = rank("chromeJackals");
  const nullChoir = rank("nullChoir");
  const redline = rank("redlineSaints");
  const ghost = rank("ghostMarket");
  const helix = rank("helixOrder");

  if (chrome >= 5) modifiers.jobRewards += 0.03;
  if (chrome >= 10) modifiers.actionSpeed += 0.03;
  if (nullChoir >= 5) modifiers.skillXp.hacking = (modifiers.skillXp.hacking ?? 0) + 0.04;
  if (nullChoir >= 10) modifiers.heatGain -= 0.04;
  if (redline >= 5) modifiers.combatXp += 0.04;
  if (redline >= 10) modifiers.creditsGained += 0.05;
  if (ghost >= 5) modifiers.shopPrices -= 0.04;
  if (ghost >= 10) modifiers.dropChance += 0.05;
  if (helix >= 5) modifiers.neuralInstabilityGain -= 0.05;
  if (helix >= 10) modifiers.neuralInstabilityRecovery += 0.05;
}

function applyFixerTrust(state: GameState, modifiers: ActiveModifiers) {
  const totalTrust = Object.values(state.fixerTrust).reduce((sum, fixer) => sum + fixer.trust, 0);
  if (totalTrust >= 25) modifiers.jobRewards += 0.02;
  if (totalTrust >= 75) modifiers.jobSuccessChance += 0.03;
}

function applyCompanion(state: GameState, modifiers: ActiveModifiers) {
  const companion = companions.find((entry) => entry.id === state.activeCompanion);
  const companionState = state.activeCompanion ? state.companions[state.activeCompanion] : null;
  if (!companion || !companionState?.unlocked) return;
  const scale = Math.min(0.1, companionState.relationship / 1000);
  modifiers.activeSources.push(companion.name);
  if (companion.id === "nyra-vale") {
    modifiers.actionSpeed += scale;
    modifiers.heatGain -= scale;
  }
  if (companion.id === "dex-riven") {
    modifiers.actionSpeed += scale;
    modifiers.skillRewards += scale;
  }
  if (companion.id === "mara-voss") {
    modifiers.combatDamage += scale;
    modifiers.combatXp += scale;
  }
  if (companion.id === "iris-kade") {
    modifiers.neuralInstabilityGain -= scale;
    modifiers.skillXp.cyberware = (modifiers.skillXp.cyberware ?? 0) + scale;
  }
  if (companion.id === "sable-quinn") {
    modifiers.jobRewards += scale;
    modifiers.fixerTrustGain += scale;
  }
}

function applyRiskState(state: GameState, modifiers: ActiveModifiers) {
  const heat = heatTier(state.resources.heat);
  if (heat === "Wanted") modifiers.jobSuccessChance -= 0.03;
  if (heat === "Hunted") {
    modifiers.jobSuccessChance -= 0.07;
    modifiers.shopPrices += 0.05;
  }
  const neural = neuralInstabilityTierName(effectiveNeuralInstability(state));
  if (neural === "Stressed") modifiers.combatDamage += 0.02;
  if (neural === "Unstable") {
    modifiers.combatDamage += 0.05;
    modifiers.heatGain += 0.03;
  }
  if (neural === "Critical") {
    modifiers.combatDamage += 0.1;
    modifiers.heatGain += 0.07;
  }
}

function applyEquipment(state: GameState, modifiers: ActiveModifiers) {
  Object.values(state.equippedCyberware).forEach((itemId) => mergeItemModifiers(modifiers, itemId));
  Object.values(state.equippedGear).forEach((itemId) => mergeItemModifiers(modifiers, itemId));
  if (cyberwareLoad(state) > 0) modifiers.activeSources.push(`Cyberware load +${cyberwareLoad(state)} NI`);
}

function applyVehicle(state: GameState, modifiers: ActiveModifiers) {
  const vehicle = vehicles.find((entry) => entry.id === state.activeVehicle);
  if (!vehicle) return;
  const level = state.vehicleUpgradeLevels[vehicle.id] ?? 0;
  modifiers.actionSpeed += vehicle.stats.jobEfficiency / 100 + level * 0.003;
  modifiers.heatGain -= vehicle.stats.heatReduction / 100 + level * 0.002;
  modifiers.jobRewards += vehicle.stats.smugglingRewardBonus / 100 + level * 0.002;
  modifiers.offlineProgressCapHours += Math.floor(vehicle.stats.storage / 20);
  modifiers.activeSources.push(vehicle.name);
}

function mergeItemModifiers(modifiers: ActiveModifiers, itemId?: string) {
  if (!itemId) return;
  const item = getItem(itemId);
  if (!item?.modifiers) return;
  const itemMods = item.modifiers;
  Object.entries(itemMods.skillXp ?? {}).forEach(([skill, value]) => {
    modifiers.skillXp[skill as keyof ActiveModifiers["skillXp"]] =
      (modifiers.skillXp[skill as keyof ActiveModifiers["skillXp"]] ?? 0) + (value ?? 0);
  });
  ([
    "skillRewards",
    "actionSpeed",
    "combatDamage",
    "combatDefense",
    "combatXp",
    "dropChance",
    "creditsGained",
    "reputationGained",
    "heatGain",
    "heatDecay",
    "neuralInstabilityGain",
    "neuralInstabilityRecovery",
    "jobSuccessChance",
    "jobRewards",
    "shopPrices",
    "fixerTrustGain",
  ] as const).forEach((key) => {
    modifiers[key] += itemMods[key] ?? 0;
  });
  modifiers.activeSources.push(item.name);
}

export function factionRank(reputation: number) {
  return Math.max(0, Math.min(10, Math.floor(reputation / 10)));
}

function vehicleSpeedBonus(state: GameState) {
  return state.startingPath === "outrider" ? 0.1 : 0;
}
