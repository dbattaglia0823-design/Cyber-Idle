import { weaponCombatProfile } from "./weaponCombat";
import type { GameState, ItemStats } from "../types";
export function tacticalWeaponStats(state: GameState): ItemStats { return weaponCombatProfile(state).stats; }
export function tacticalWeaponTempo(state: GameState) {
 const profile = weaponCombatProfile(state);
 const accuracy = 1 + Math.max(-20, Math.min(40, profile.stats.accuracy ?? 0)) / 200;
 return profile.damageFactor * Math.sqrt(1600 / profile.interval) * profile.expectedCritical * accuracy;
}
// Expected criticals and tempo keep turn-based combat deterministic: faster
// weapons improve output per action without extra real-time turns.
export function tacticalWeaponPower(state: GameState) {
 const profile = weaponCombatProfile(state);
 const damage = Math.max(0, profile.scaledWeaponDamage + (profile.stats.damage ?? 0) - profile.scaledWeaponDamage * profile.damageFactor);
 return (Math.sqrt(damage) * 2 + damage * .9) * tacticalWeaponTempo(state);
}
