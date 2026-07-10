import { baseCombatStats } from "../data/combat";
import { getActiveModifiers } from "./modifiers";
import { scaledStats } from "./itemFormulas";
import type { GameState, PlayerCombatStats } from "../types";

export function xpForNextLevel(level: number) {
  return Math.floor(60 * Math.pow(level, 1.55));
}

export function xpForNextMastery(level: number) {
  return Math.floor(35 * Math.pow(level, 1.45));
}

export function neuralInstabilityTier(value: number) {
  if (value >= 100) return "Overload";
  if (value >= 75) return "Critical";
  if (value >= 50) return "Unstable";
  if (value >= 25) return "Stressed";
  return "Stable";
}

export function clampRiskStat(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function totalLevel(state: GameState) {
  return Object.values(state.skills).reduce((sum, skill) => sum + skill.level, 0);
}

export function playerCombatStats(state: GameState): PlayerCombatStats {
  const modifiers = getActiveModifiers(state);
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
  return {
    maxHp: Math.round(baseCombatStats.maxHp + Math.floor(state.skills.combat.level * 4) + gearStats.maxHp),
    damage: Math.round((baseCombatStats.damage + Math.floor(state.skills.combat.level * 1.5) + gearStats.damage) * (1 + modifiers.combatDamage)),
    attackSpeedMs: Math.max(600, Math.round(baseCombatStats.attackSpeedMs + gearStats.attackSpeedMs)),
    armor: Math.round((baseCombatStats.armor + Math.floor(state.skills.combat.level / 3) + gearStats.armor) * (1 + modifiers.combatDefense)),
  };
}

export function expectedKillTimeMs(state: GameState, enemyHp: number) {
  const stats = playerCombatStats(state);
  const swings = Math.max(1, Math.ceil(enemyHp / stats.damage));
  return swings * stats.attackSpeedMs;
}
