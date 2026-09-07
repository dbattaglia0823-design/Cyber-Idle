import { balanceConfig } from "../data/balanceConfig";
import { getItem } from "../data/items";
import { districtThreatRewardBonus } from "./districtThreat";
import { playerCombatStats } from "./formulas";
import { effectiveNeuralInstability } from "./itemFormulas";
import { scenarioBonusForTags } from "./scenarioModifiers";
import { equippedWeaponClass, weaponClassBonus } from "./weaponSystem";
import type { CombatAffinity, CombatMatchupRating, DamageType, Enemy, EnemyDifficultyTier, GameState, ItemDefinition } from "../types";

const difficultyOrder: EnemyDifficultyTier[] = ["Common", "Hardened", "Elite", "Mini-Boss", "Boss", "Apex"];
const difficultyStats: Record<EnemyDifficultyTier, { hp: number; damage: number; rewards: number; heat: number; drop: number }> = {
  Common: { hp: 1, damage: 1, rewards: 1, heat: 1, drop: 0 },
  Hardened: { hp: 1.14, damage: 1.08, rewards: 1.08, heat: 1.08, drop: 0.01 },
  Elite: { hp: 1.32, damage: 1.18, rewards: 1.18, heat: 1.16, drop: 0.02 },
  "Mini-Boss": { hp: 1.65, damage: 1.35, rewards: 1.35, heat: 1.28, drop: 0.035 },
  Boss: { hp: 2, damage: 1.55, rewards: 1.55, heat: 1.4, drop: 0.05 },
  Apex: { hp: 2.45, damage: 1.85, rewards: 1.9, heat: 1.6, drop: 0.08 },
};

export interface CombatMatchupReport {
  rating: CombatMatchupRating;
  damageMultiplier: number;
  rewardMultiplier: number;
  dropChance: number;
  heatChange: number;
  neuralInstabilityChange: number;
  effectiveHp: number;
  expectedKillMs: number;
  difficulty: EnemyDifficultyTier;
  tags: string[];
  notes: string[];
}

export function combatTagsForEnemy(enemy: Enemy, extraTags: string[] = []) {
  const text = `${enemy.id} ${enemy.name} ${enemy.description}`.toLowerCase();
  const tags = new Set<string>(["combat", ...(enemy.traits ?? []), ...(enemy.behaviorTags ?? []), ...(enemy.damageTypes ?? []), ...(enemy.recommendedLoadoutTags ?? []), ...extraTags]);
  if (enemy.archetype) tags.add(enemy.archetype);
  if (enemy.armorType) tags.add(enemy.armorType);
  if (enemy.difficulty) tags.add(enemy.difficulty);
  if (enemy.preferredDistrict) tags.add(enemy.preferredDistrict);
  if (enemy.factionAlignment) tags.add(enemy.factionAlignment);
  if (text.includes("drone")) ["drone", "mech"].forEach((tag) => tags.add(tag));
  if (text.includes("corp") || text.includes("guard")) ["corporate", "armorPiercing"].forEach((tag) => tags.add(tag));
  if (text.includes("market") || text.includes("cutthroat")) ["gang", "illegal"].forEach((tag) => tags.add(tag));
  if (text.includes("trace") || text.includes("blacknet")) tags.add("blacknet");
  if (enemy.hp >= 100) tags.add("highThreat");
  return [...tags];
}

export function combatEffectivenessForEnemy(state: GameState, enemy: Enemy, extraTags: string[] = []): CombatMatchupReport {
  const loadout = equippedLoadout(state);
  const tags = combatTagsForEnemy(enemy, extraTags);
  const scenario = scenarioBonusForTags(state, tags);
  const difficulty = scaledDifficulty(state, enemy);
  const difficultyBonus = difficultyStats[difficulty];
  let damageMultiplier = 1 + scenario.damageBonus;
  let rewardMultiplier = difficultyBonus.rewards;
  let dropChance = scenario.dropChance + difficultyBonus.drop;
  let heatChange = 0;
  let neuralInstabilityChange = 0;
  const notes = [...scenario.sources.map((source) => `${source}: scenario bonus`)];

  for (const affinity of enemy.weaknesses ?? []) {
    if (!affinityMatches(affinity, loadout, tags)) continue;
    damageMultiplier *= affinity.damageMultiplier;
    heatChange += affinity.heatMultiplier ? affinity.heatMultiplier - 1 : 0;
    dropChance += affinity.dropChance ?? 0;
    notes.push(`${affinity.label}: +${Math.round((affinity.damageMultiplier - 1) * 100)}% damage`);
  }

  for (const affinity of enemy.resistances ?? []) {
    if (!affinityMatches(affinity, loadout, tags)) continue;
    damageMultiplier *= affinity.damageMultiplier;
    notes.push(`${affinity.label}: ${Math.round((affinity.damageMultiplier - 1) * 100)}% damage`);
  }

  for (const modifier of enemy.combatModifiers ?? []) {
    damageMultiplier *= modifier.damageMultiplier ?? 1;
    rewardMultiplier *= modifier.rewardMultiplier ?? 1;
    dropChance += modifier.dropChance ?? 0;
    heatChange += modifier.heatChange ?? 0;
    neuralInstabilityChange += modifier.neuralInstabilityChange ?? 0;
    notes.push(`${modifier.label}: ${modifier.description}`);
  }

  if (state.resources.heat >= 75 && loadout.tags.some((tag) => tag === "loud" || tag === "highHeat")) {
    damageMultiplier *= 1.05;
    heatChange += 1;
    notes.push("Loud weapon under high Heat: +5% damage, +1 Heat");
  }

  const instability = effectiveNeuralInstability(state);
  if (instability >= 50) {
    const bonus = instability >= 75 ? 0.08 : 0.04;
    damageMultiplier *= 1 + bonus;
    notes.push(`Neural Instability combat edge: +${Math.round(bonus * 100)}% damage`);
  }

  if (enemy.preferredDistrict) {
    const threatBonus = districtThreatRewardBonus(state, enemy.preferredDistrict);
    rewardMultiplier *= 1 + threatBonus;
    dropChance += threatBonus * 0.35;
  }

  const stats = playerCombatStats(state);
  const classBonus = loadout.weaponClass ? weaponClassBonus(state, loadout.weaponClass) : { dropChance: 0 };
  const armorReduction = enemy.armor ? Math.max(balanceConfig.enemyScaling.armorPenetrationFloor, 1 - (loadout.armorPenetration / Math.max(12, enemy.armor * 5))) : 1;
  const effectiveHp = Math.max(1, Math.round(enemy.hp * difficultyBonus.hp * armorReduction / Math.max(0.25, damageMultiplier)));
  const expectedKillMs = Math.max(600, Math.ceil(effectiveHp / Math.max(1, stats.damage)) * stats.attackSpeedMs);
  dropChance += classBonus.dropChance;

  return {
    rating: ratingFor(damageMultiplier),
    damageMultiplier,
    rewardMultiplier,
    dropChance,
    heatChange: Math.round(heatChange * difficultyBonus.heat),
    neuralInstabilityChange: Math.round(neuralInstabilityChange),
    effectiveHp,
    expectedKillMs,
    difficulty,
    tags,
    notes: notes.length ? notes.slice(0, 4) : ["No strong loadout interaction."],
  };
}

function scaledDifficulty(state: GameState, enemy: Enemy): EnemyDifficultyTier {
  const baseIndex = difficultyOrder.indexOf(enemy.difficulty ?? "Common");
  const districtThreat = enemy.preferredDistrict ? state.districtThreat[enemy.preferredDistrict]?.level ?? 0 : 0;
  const threatStep = districtThreat >= 90 ? 2 : districtThreat >= 65 ? 1 : 0;
  const scalingStep = (enemy.threatScaling ?? 0) >= 1.2 && districtThreat >= 45 ? 1 : 0;
  return difficultyOrder[Math.min(difficultyOrder.length - 1, Math.max(0, baseIndex) + threatStep + scalingStep)];
}

function ratingFor(multiplier: number): CombatMatchupRating {
  if (multiplier >= balanceConfig.combat.weaknessExcellent) return "Excellent Matchup";
  if (multiplier >= balanceConfig.combat.weaknessGood) return "Good Matchup";
  if (multiplier <= balanceConfig.combat.weaknessPoor) return "Poor Matchup";
  return "Neutral Matchup";
}

function equippedLoadout(state: GameState) {
  const weapon = state.equippedGear.weapon ? getItem(state.equippedGear.weapon) : undefined;
  const loadout = state.weaponLoadouts[state.equippedGear.weapon ?? ""];
  const attachments = Object.values(loadout?.attachments ?? {}).map((id) => (id ? getItem(id) : undefined)).filter(Boolean) as ItemDefinition[];
  const mods = (loadout?.mods ?? []).map(getItem).filter(Boolean) as ItemDefinition[];
  const cyberware = Object.values(state.equippedCyberware).map((id) => (id ? getItem(id) : undefined)).filter(Boolean) as ItemDefinition[];
  return {
    weaponClass: equippedWeaponClass(state),
    tags: [...(weapon?.tags ?? ["unarmed", "melee", "bluntWeapons", "nonlethal"]), ...attachments.flatMap((item) => item.tags), ...mods.flatMap((item) => item.tags)],
    attachmentTags: attachments.flatMap((item) => item.tags),
    modTags: mods.flatMap((item) => item.tags),
    cyberwareTags: cyberware.flatMap((item) => item.tags),
    damageTypes: weaponDamageTypes(weapon),
    armorPenetration: (weapon?.stats?.armorPenetration ?? 0) + attachments.reduce((sum, item) => sum + (item.stats?.armorPenetration ?? 0), 0) + mods.reduce((sum, item) => sum + (item.stats?.armorPenetration ?? 0), 0),
  };
}

function affinityMatches(affinity: CombatAffinity, loadout: ReturnType<typeof equippedLoadout>, scenarioTags: string[]) {
  return Boolean(
    affinity.weaponClasses?.some((id) => id === loadout.weaponClass) ||
      affinity.weaponTags?.some((tag) => loadout.tags.includes(tag)) ||
      affinity.damageTypes?.some((type) => loadout.damageTypes.includes(type)) ||
      affinity.attachmentTags?.some((tag) => loadout.attachmentTags.includes(tag)) ||
      affinity.modTags?.some((tag) => loadout.modTags.includes(tag)) ||
      affinity.cyberwareTags?.some((tag) => loadout.cyberwareTags.includes(tag)) ||
      affinity.scenarioTags?.some((tag) => scenarioTags.includes(tag)),
  );
}

function weaponDamageTypes(weapon?: ItemDefinition): DamageType[] {
  const tags = weapon?.tags ?? [];
  const types = new Set<DamageType>();
  if (!weapon) return ["blunt"];
  if (weapon.weaponClass === "blades" || tags.includes("blade")) types.add("blade");
  if (weapon.weaponClass === "bluntWeapons" || tags.includes("nonlethal")) types.add("blunt");
  if (weapon.weaponClass === "techWeapons" || tags.includes("tech") || tags.includes("armorPiercing")) types.add("tech");
  if (weapon.weaponClass === "smartWeapons" || tags.includes("smart")) types.add("smart");
  if (weapon.weaponClass === "cyberdeckWeapons" || tags.includes("blacknet")) types.add("blacknet");
  if (weapon.weaponClass === "heavyWeapons" || weapon.weaponClass === "shotguns") types.add("explosive");
  if (tags.includes("drone") || tags.includes("mech")) types.add("shock");
  if (tags.includes("thermal")) types.add("thermal");
  if (!types.size) types.add("ballistic");
  return [...types];
}
