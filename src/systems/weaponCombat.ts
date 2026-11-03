import { getItem } from "../data/items";
import { weaponVariants } from "../data/weaponProgression";
import { scaledStats } from "./itemFormulas";
import type { GameState, ItemStats } from "../types";

// The same limits and attachment aggregation feed both combat modes and previews.
export function equippedWeaponStats(state: GameState): ItemStats {
  const id = state.equippedGear.weapon;
  if (!id) return {};
  const loadout = state.weaponLoadouts[id];
  const ids = [id, ...Object.values(loadout?.attachments ?? {}), ...(loadout?.mods ?? [])];
  const total: Record<string, number> = {};
  for (const item of ids) for (const [key, value] of Object.entries(scaledStats(state, item))) if (typeof value === "number") total[key] = (total[key] ?? 0) + value;
  return total;
}
export function weaponCombatProfile(state: GameState) {
  const weapon = getItem(state.equippedGear.weapon ?? "");
  const stats = equippedWeaponStats(state);
  for (const id of [...Object.entries(state.equippedGear).filter(([slot]) => slot !== "weapon").map(([,id])=>id), ...Object.values(state.equippedCyberware)]) {
    const other = scaledStats(state, id);
    for (const key of ["critChance", "critDamage", "armorPenetration"] as const) stats[key] = (stats[key] ?? 0) + (other[key] ?? 0);
  }
  const variant = weapon?.weaponVariant ? weaponVariants[weapon.weaponVariant] : weaponVariants.Power;
  const criticalChance = Math.min(.6, Math.max(0, stats.critChance ?? 0));
  const criticalBonus = .5 + Math.min(1.25, Math.max(0, stats.critDamage ?? 0));
  return { stats, damageFactor: variant.damage, criticalChance, criticalBonus,
    expectedCritical: 1 + criticalChance * criticalBonus,
    interval: Math.max(600, 1600 + (stats.attackSpeed ?? 0)),
    // Variant damage is already present in the item's stats. Only scale the
    // player's non-weapon damage, rather than multiplying the weapon twice.
    scaledWeaponDamage: (scaledStats(state, state.equippedGear.weapon ?? "").damage ?? 0) / variant.damage,
  };
}
