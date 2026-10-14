import { scaledStats } from "./itemFormulas";
import type { GameState, ItemStats } from "../types";
// Expected weapon output keeps field combat deterministic while honoring the
// speed/precision tradeoffs already authored on weapons and installed parts.
export function tacticalWeaponStats(state: GameState): ItemStats {
 const id = state.equippedGear.weapon;
 if (!id) return {};
 const loadout = state.weaponLoadouts[id];
 const ids = [id, ...Object.values(loadout?.attachments ?? {}), ...(loadout?.mods ?? [])];
 const total: Record<string, number> = {};
 for (const item of ids) for (const [key,value] of Object.entries(scaledStats(state,item))) if (typeof value === "number") total[key] = (total[key] ?? 0) + value;
 return total;
}
export function tacticalWeaponPower(state: GameState) {
 const stats = tacticalWeaponStats(state);
 const damage = Math.max(0, stats.damage ?? 0);
 const speed = 1600 / Math.max(400, 1600 + (stats.attackSpeed ?? 0));
 const precision = 1 + Math.max(-20, stats.accuracy ?? 0) / 200;
 const critical = 1 + Math.max(0, stats.critChance ?? 0) * (.5 + Math.max(0, stats.critDamage ?? 0));
 return (Math.sqrt(damage) * 2 + damage * .9) * speed * precision * critical;
}
