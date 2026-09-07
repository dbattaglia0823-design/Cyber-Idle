import { balanceConfig } from "../data/balanceConfig";
import { getItem } from "../data/items";
import { factionRank, getActiveModifiers } from "./modifiers";
import { districtThreatPenalty } from "./districtThreat";
import { masteryPoolBonus, masteryPoolPercent } from "./masteryPool";
import { scenarioBonusForTags } from "./scenarioModifiers";
import { effectiveNeuralInstability } from "./itemFormulas";
import { scaledStats } from "./itemFormulas";
import { equippedWeaponClass, weaponClassBonus } from "./weaponSystem";
import type { BlackMarketStrategy, DistrictId, EnemyDrop, GameState, ItemDefinition, JobContract, PlayerCombatStats, RewardBundle, SkillAction } from "../types";

export interface FormulaBreakdown {
  label: string;
  value: number | string;
}

export function clampPercent(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function calculatePlayerCombatStats(state: GameState): PlayerCombatStats {
  const modifiers = getActiveModifiers(state);
  const weaponClass = equippedWeaponClass(state);
  const classBonus = weaponClass ? weaponClassBonus(state, weaponClass) : { damage: 0, unarmedDamage: 0 };
  const gearStats = [...Object.values(state.equippedGear), ...Object.values(state.equippedCyberware)].reduce(
    (totals, itemId) => {
      const stats = itemId ? scaledStats(state, itemId) : {};
      totals.maxHp += stats.maxHp ?? 0;
      totals.damage += stats.damage ?? 0;
      totals.attackSpeedMs += stats.attackSpeed ?? 0;
      totals.armor += stats.armor ?? 0;
      return totals;
    },
    { maxHp: 0, damage: 0, attackSpeedMs: 0, armor: 0 },
  );
  const rawMaxHp = balanceConfig.combat.baseMaxHp + state.skills.combat.level * balanceConfig.combat.hpPerCombatLevel + gearStats.maxHp;
  const rawAttackSpeed = balanceConfig.combat.baseAttackSpeedMs + gearStats.attackSpeedMs;
  return {
    maxHp: Math.round(rawMaxHp * (1 + modifiers.combatMaxHp)),
    damage: Math.round(
      (balanceConfig.combat.baseDamage +
        state.skills.combat.level * balanceConfig.combat.damagePerCombatLevel +
        gearStats.damage +
        (!state.equippedGear.weapon && weaponClass === "bluntWeapons" ? classBonus.unarmedDamage : 0)) *
        (1 + modifiers.combatDamage + classBonus.damage),
    ),
    attackSpeedMs: Math.max(balanceConfig.combat.minAttackSpeedMs, Math.round(rawAttackSpeed * (1 - Math.min(0.45, modifiers.combatAttackSpeed)))),
    armor: Math.round((balanceConfig.combat.baseArmor + Math.floor(state.skills.combat.level / balanceConfig.combat.armorPerCombatLevels) + gearStats.armor) * (1 + modifiers.combatDefense)),
  };
}

export function calculateEstimatedKillTime(state: GameState, effectiveHp: number) {
  const stats = calculatePlayerCombatStats(state);
  return Math.max(balanceConfig.combat.minAttackSpeedMs, Math.ceil(Math.max(1, effectiveHp) / Math.max(1, stats.damage)) * stats.attackSpeedMs);
}

export function calculateHitChance(attackerAccuracy: number, defenderDodge = 0) {
  return clampPercent(attackerAccuracy - defenderDodge, balanceConfig.combat.minHitChance, balanceConfig.combat.maxHitChance);
}

export function calculateCritChance(baseChance: number, bonus = 0) {
  return clampPercent(baseChance + bonus, 0, 0.85);
}

export function calculateSkillActionRewards(state: GameState, action: SkillAction, efficiency = 1): RewardBundle {
  return scaleRewards(applyRewardFormula(state, action.rewards, [action.skillId, ...(action.tags ?? [])]), efficiency);
}

export function calculateCombatRewards(state: GameState, rewards: RewardBundle, tags: string[] = [], multiplier = 1): RewardBundle {
  return scaleRewards(applyRewardFormula(state, rewards, tags), multiplier);
}

export function calculateJobRewards(state: GameState, job: JobContract, multiplier = 1) {
  return scaleRewards(applyRewardFormula(state, job.rewards, job.tags), multiplier * requirementRewardMultiplier(job.requirements, balanceConfig.rewards.jobRequirementRewardGrowth));
}

export function calculateOperationRewards(state: GameState, rewards: RewardBundle, multiplier = 1) {
  return scaleRewards(applyRewardFormula(state, rewards, ["operation"]), multiplier);
}

export function calculateCraftingOutput(rewards: RewardBundle, efficiency = 1) {
  return scaleRewards(rewards, efficiency);
}

export function calculateJobSuccessChance(job: JobContract, state: GameState) {
  const modifiers = getActiveModifiers(state);
  const scenario = scenarioBonusForTags(state, job.tags);
  const weaponClass = equippedWeaponClass(state);
  const classBonus = weaponClass ? weaponClassBonus(state, weaponClass).jobSuccess : 0;
  const trustBonus = Math.min(0.08, (state.fixerTrust[job.fixerId]?.trust ?? 0) / 1000);
  const factionBonus = Math.min(0.06, Math.max(0, state.factions[job.factionId]?.reputation ?? 0) / 1000);
  const standingBonus = Math.min(0.05, Math.max(0, state.districtStanding[job.districtId]?.standing ?? 0) / 1000);
  const threatPenalty = districtThreatPenalty(state, job.districtId);
  let chance = job.baseSuccessChance + modifiers.jobSuccessChance + scenario.successChance + classBonus + trustBonus + factionBonus + standingBonus - threatPenalty;
  if (state.startingPath === "streetborn" && job.tags.includes("corporate")) chance -= 0.05;
  const instability = effectiveNeuralInstability(state);
  if (instability >= 25 && job.tags.includes("hacking")) chance -= instability >= 75 ? 0.1 : instability >= 50 ? 0.05 : 0.02;
  if (instability >= 75 && job.tags.includes("corporate")) chance -= balanceConfig.jobs.corporateInstabilityPenalty;
  const requirementPenalty = requirementScore(job.requirements) * balanceConfig.jobs.requirementSuccessPenalty;
  chance -= requirementPenalty;
  const final = clampPercent(chance, balanceConfig.jobs.minSuccess, balanceConfig.jobs.maxSuccess);
  return {
    chance: final,
    guaranteed: final >= balanceConfig.jobs.guaranteedAt,
    breakdown: [
      { label: "Base", value: job.baseSuccessChance },
      { label: "Modifiers", value: modifiers.jobSuccessChance },
      { label: "Scenario", value: scenario.successChance },
      { label: "Weapon class", value: classBonus },
      { label: "Fixer trust", value: trustBonus },
      { label: "Faction", value: factionBonus },
      { label: "Standing", value: standingBonus },
      { label: "Threat penalty", value: -threatPenalty },
      { label: "Requirement", value: -requirementPenalty },
      { label: "Final", value: final },
    ] satisfies FormulaBreakdown[],
  };
}

export function calculateHeatGain(state: GameState, heat: number, tags: string[] = []) {
  const modifiers = getActiveModifiers(state);
  const smugglingRelief = tags.includes("smuggling") ? balanceConfig.risk.heatSmugglingRelief : 0;
  const multiplier = Math.max(0.1, 1 + modifiers.heatGain + smugglingRelief);
  return Math.round(heat * multiplier);
}

export function calculateHeatTier(value: number) {
  if (value >= 100) return "Lockdown";
  if (value >= 75) return "Hunted";
  if (value >= 50) return "Wanted";
  if (value >= 25) return "Watched";
  return "Clean";
}

export function calculateHeatEffects(value: number) {
  const tier = calculateHeatTier(value);
  return {
    tier,
    jobPenalty: tier === "Hunted" ? -0.07 : tier === "Wanted" ? -0.03 : 0,
    vendorMarkup: tier === "Hunted" ? 0.05 : tier === "Lockdown" ? 0.12 : 0,
    blackMarketRisk: value / balanceConfig.blackMarket.heatRiskDivisor,
  };
}

export function calculateInstabilityGain(state: GameState, amount: number, tags: string[] = []) {
  const modifiers = getActiveModifiers(state);
  const prototypePenalty = state.startingPath === "corporateDefector" && tags.includes("prototype") ? 0.05 : 0;
  const recoveryBonus = amount < 0 ? modifiers.neuralInstabilityRecovery : 0;
  return Math.round(amount * Math.max(0.1, 1 + modifiers.neuralInstabilityGain + prototypePenalty + recoveryBonus));
}

export function calculateInstabilityTier(value: number) {
  if (value >= 100) return "Overload";
  if (value >= 75) return "Critical";
  if (value >= 50) return "Unstable";
  if (value >= 25) return "Stressed";
  return "Stable";
}

export function calculateInstabilityEffects(value: number) {
  const tier = calculateInstabilityTier(value);
  return {
    tier,
    combatDamage: tier === "Critical" ? 0.1 : tier === "Unstable" ? 0.05 : tier === "Stressed" ? 0.02 : 0,
    heatGain: tier === "Critical" ? 0.07 : tier === "Unstable" ? 0.03 : 0,
    hackingPenalty: tier === "Critical" ? -0.1 : tier === "Unstable" ? -0.05 : tier === "Stressed" ? -0.02 : 0,
  };
}

export function rollDropTable(sourceId: string, drops: EnemyDrop[], state: GameState, context: { tags?: string[]; efficiency?: number; bonus?: number } = {}) {
  const modifiers = getActiveModifiers(state);
  const scenario = scenarioBonusForTags(state, context.tags ?? []);
  const efficiency = context.efficiency ?? 1;
  return drops.filter((drop) => {
    const bonus = cappedDropBonus(drop.chance, modifiers.dropChance + scenario.dropChance + (context.bonus ?? 0));
    const chance = Math.min(balanceConfig.rewards.maxDropChance, (drop.chance + bonus) * efficiency * balanceConfig.rewards.globalDropChanceMultiplier);
    return Math.random() <= chance;
  }).map((drop) => ({ ...drop, sourceId }));
}

export function calculateDropChance(baseChance: number, state: GameState, tags: string[] = [], bonus = 0, efficiency = 1) {
  const totalBonus = cappedDropBonus(baseChance, getActiveModifiers(state).dropChance + scenarioBonusForTags(state, tags).dropChance + bonus);
  return Math.min(balanceConfig.rewards.maxDropChance, (baseChance + totalBonus) * efficiency * balanceConfig.rewards.globalDropChanceMultiplier);
}

function cappedDropBonus(baseChance: number, bonus: number) {
  const cap =
    baseChance <= 0.001 ? 0.001 :
    baseChance <= 0.0025 ? 0.0025 :
    baseChance <= 0.005 ? 0.005 :
    baseChance <= 0.02 ? 0.015 :
    baseChance <= 0.08 ? 0.035 :
    0.12;
  return Math.max(0, Math.min(cap, bonus));
}

export function calculateBlackMarketListingValue(state: GameState, itemId: string, strategy: BlackMarketStrategy) {
  const item = getItem(itemId);
  if (!item) return 0;
  const config = balanceConfig.blackMarket.strategy[strategy];
  const ghostRank = factionRank(state.factions.ghostMarket.reputation);
  const heatPremium = state.resources.heat >= 75 ? 0.12 : state.resources.heat >= 50 ? 0.06 : 0;
  const tradingBonus = Math.min(0.18, (state.skills.blackMarket?.level ?? 1) * 0.003);
  const stealthDiscount = Math.max(0, -getActiveModifiers(state).heatGain);
  return Math.round(item.sellValue * config.price * (1 + ghostRank * 0.015 + heatPremium + tradingBonus + stealthDiscount));
}

export function calculateBlackMarketRisk(state: GameState, strategy: BlackMarketStrategy) {
  const config = balanceConfig.blackMarket.strategy[strategy];
  const heatScale = state.resources.heat / balanceConfig.blackMarket.heatRiskDivisor;
  const ghostReduction = factionRank(state.factions.ghostMarket.reputation) * 0.008;
  const tradingReduction = Math.min(0.08, (state.skills.blackMarket?.level ?? 1) * 0.0015);
  const heatRisk = Math.max(0.01, config.risk * (0.04 + heatScale) - ghostReduction - tradingReduction + getActiveModifiers(state).heatGain);
  const buyerRisk = Math.max(0.02, 0.16 * config.risk - Object.values(state.fixerTrust).reduce((sum, fixer) => sum + fixer.trust, 0) / 2000);
  const saleChance = clampPercent(config.chance + ghostReduction + tradingReduction - calculateHeatEffects(state.resources.heat).blackMarketRisk * 0.35, 0.08, 0.97);
  return { heatRisk, buyerRisk, saleChance, durationMs: Math.round(config.durationMs * (1 - Math.min(0.35, tradingReduction))) };
}

export function calculateVendorPrice(state: GameState, basePrice: number, districtId: DistrictId, modifier = 1) {
  const standingDiscount = Math.min(0.18, (state.districtStanding[districtId]?.standing ?? 0) / 600);
  const threatMarkup = districtThreatPenalty(state, districtId);
  return Math.max(balanceConfig.economy.vendorMinPrice, Math.round(basePrice * modifier * (1 + threatMarkup - standingDiscount + getActiveModifiers(state).shopPrices)));
}

export function calculateRarityShopBasePrice(item: ItemDefinition) {
  if (item.type === "Resource") return 0;
  const rarityMultiplier: Record<ItemDefinition["rarity"], number> = {
    Common: 1,
    Uncommon: 1.45,
    Rare: 2.35,
    Epic: 4,
    Legendary: 7,
    Prototype: 9,
    Relic: 13,
  };
  const typeBase: Record<ItemDefinition["type"], number> = {
    Resource: 0,
    Material: 120,
    Component: 80,
    Cyberware: 420,
    Weapon: 170,
    WeaponAttachment: 90,
    WeaponMod: 105,
    Armor: 140,
    Consumable: 45,
    Blueprint: 220,
    Quest: 0,
  };
  return Math.round((typeBase[item.type] ?? 80) * (item.tier ?? 1) * rarityMultiplier[item.rarity]);
}

export function calculateRarityAdjustedShopBasePrice(item: ItemDefinition | undefined, listedBasePrice: number) {
  if (!item) return listedBasePrice;
  return Math.max(listedBasePrice, calculateRarityShopBasePrice(item));
}

export function calculateSellValue(state: GameState, item: ItemDefinition, modifier = 1) {
  const marketBonus = item.tags.some((tag) => ["illegal", "prototype", "blacknet"].includes(tag)) ? Math.min(0.15, (state.skills.blackMarket?.level ?? 1) * 0.002) : 0;
  return Math.max(balanceConfig.economy.sellMinValue, Math.round(item.sellValue * modifier * (1 + marketBonus)));
}

export function calculateUpgradeCost(state: GameState, item: ItemDefinition, level: number) {
  const rarity = balanceConfig.economy.rarityMultiplier[item.rarity];
  const tier = item.tier ?? 1;
  const reduction = item.type === "Cyberware" ? getActiveModifiers(state).upgradeCostReduction + getActiveModifiers(state).craftingCostReduction : getActiveModifiers(state).upgradeCostReduction;
  return Math.max(1, Math.round(balanceConfig.economy.upgradeBaseCredits * rarity * tier * Math.pow(level + 1, balanceConfig.economy.upgradeLevelExponent) * (1 - Math.min(0.65, reduction))));
}

export function calculateVehicleUpgradeCost(state: GameState, level: number) {
  return Math.max(1, Math.round(balanceConfig.economy.vehicleUpgradeBaseCredits * Math.pow(level + 1, balanceConfig.economy.vehicleUpgradeLevelExponent) * (1 - Math.min(0.5, getActiveModifiers(state).vehicleUpgradeCostReduction))));
}

export function calculateRipperdocServiceCost(state: GameState, amount: number) {
  return Math.max(1, Math.ceil(amount * (1 - Math.min(balanceConfig.economy.ripperdocMaxDiscount, getActiveModifiers(state).ripperdocCostReduction))));
}

export function calculateSimulationEfficiency(state: GameState) {
  const modifiers = getActiveModifiers(state);
  return {
    skillXp: Math.min(1, (state.simulationEfficiency.skillXp ?? balanceConfig.simCache.defaultSkillXp) + modifiers.simCacheEfficiency),
    resources: Math.min(1, (state.simulationEfficiency.resources ?? balanceConfig.simCache.defaultRewards) + modifiers.simCacheEfficiency),
    credits: Math.min(1, (state.simulationEfficiency.credits ?? balanceConfig.simCache.defaultRewards) + modifiers.simCacheEfficiency),
    masteryXp: Math.min(1, (state.simulationEfficiency.masteryXp ?? balanceConfig.simCache.defaultMasteryXp) + modifiers.simCacheEfficiency),
    rareDrops: Math.min(1, (state.simulationEfficiency.rareDrops ?? balanceConfig.simCache.defaultRareDrops) + modifiers.simCacheEfficiency),
    factionTrust: Math.min(1, (state.simulationEfficiency.factionTrust ?? balanceConfig.simCache.defaultRewards) + modifiers.simCacheEfficiency),
    heat: state.simulationEfficiency.heat ?? balanceConfig.simCache.defaultHeat,
    neuralInstability: state.simulationEfficiency.neuralInstability ?? balanceConfig.simCache.defaultNeuralInstability,
  };
}

export function masteryDropBonusForLevel(level: number) {
  if (level >= 99) return balanceConfig.rewards.masteryDropLevel99;
  if (level >= 75) return balanceConfig.rewards.masteryDropLevel75;
  if (level >= 50) return balanceConfig.rewards.masteryDropLevel50;
  if (level >= 25) return balanceConfig.rewards.masteryDropLevel25;
  return 0;
}

export function masteryPoolCheckpointBonus(state: GameState, skillId: keyof GameState["skills"]) {
  const percent = masteryPoolPercent(state, skillId);
  return { percent, ...masteryPoolBonus(state, skillId) };
}

function applyRewardFormula(state: GameState, rewards: RewardBundle, tags: string[] = []) {
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

function scaleRewards(rewards: RewardBundle, multiplier: number) {
  return Object.fromEntries(Object.entries(rewards).map(([id, amount]) => [id, Math.round((amount ?? 0) * multiplier)])) as RewardBundle;
}

function requirementRewardMultiplier(requirements: string[], growth: number) {
  return 1 + requirementScore(requirements) * growth;
}

function requirementScore(requirements: string[]) {
  const scores = requirements
    .flatMap((requirement) => [...requirement.matchAll(/level\s+(\d+)|rank\s+(\d+)|trust\s+(\d+)|reputation\s+(\d+)/gi)])
    .map((match) => Number(match[1] ?? match[2] ?? match[3] ?? match[4] ?? 0))
    .filter(Boolean);
  return scores.length ? Math.max(...scores) : 0;
}
