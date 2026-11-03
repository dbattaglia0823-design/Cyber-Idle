import { weaponClasses } from "../data/weaponClasses";
import { getItem } from "../data/items";
import { districts } from "../data/districts";
import { weaponVariants, weaponDistrictOrder } from "../data/weaponProgression";
import { calculatePlayerCombatStats } from "../systems/balanceFormulas";
import { weaponCombatProfile } from "../systems/weaponCombat";
import { tacticalStats } from "../systems/rpgSystem";
import { scaledStats } from "../systems/itemFormulas";
import type { GameState } from "../types";

export function WeaponSummary({ state, itemId, compareItemId }: { state: GameState; itemId: string; compareItemId?: string }) {
 const item = getItem(itemId);
 if (item?.type !== "Weapon") return null;
 const selected = { ...state, equippedGear: { ...state.equippedGear, weapon: itemId } };
 const before = compareItemId ? { ...state, equippedGear: { ...state.equippedGear, weapon: compareItemId } } : undefined;
 const combat = calculatePlayerCombatStats(selected), old = before && calculatePlayerCombatStats(before);
 const profile = weaponCombatProfile(selected), stats = scaledStats(state, itemId);
 const rows: Array<[string, number, number | undefined, string, boolean]> = [
   ["Damage", stats.damage ?? 0, before ? scaledStats(state, compareItemId!).damage ?? 0 : undefined, "", false],
   ["Interval", combat.attackSpeedMs / 1000, old ? old.attackSpeedMs / 1000 : undefined, "s", true],
   ["Crit", profile.criticalChance * 100, before ? weaponCombatProfile(before).criticalChance * 100 : undefined, "%", false],
   [item.iconic ? "Base DPS" : "Idle DPS", combat.damage / (combat.attackSpeedMs / 1000), old ? old.damage / (old.attackSpeedMs / 1000) : undefined, "", false],
 ];
 return <div className={`weapon-summary rarity-${item.rarity.toLowerCase()} ${item.iconic ? "iconic-weapon" : ""}`}>
   <div className="weapon-summary-tags"><b className={`weapon-variant variant-${item.iconic ? "iconic" : item.weaponVariant?.toLowerCase() ?? "power"}`}>{item.iconic ? "★ Iconic" : item.weaponVariant}</b><span>{item.rarity}</span><span>{districts.find(d => d.id === item.weaponDistrict)?.name} · D{weaponDistrictOrder.indexOf(item.weaponDistrict!) + 1}</span></div>
   {item.iconic && <small>{weaponClasses.find(c=>c.id===item.weaponClass)?.name} · Boss: {item.iconic.boss}</small>}
   <div className="weapon-summary-stats">{rows.map(([label, value, previous, unit, lower]) => {
     const delta = previous === undefined ? 0 : value - previous;
     const trend = Math.abs(delta) < .005 ? "same" : (lower ? delta < 0 : delta > 0) ? "better" : "worse";
     return <span key={label}><small>{label}</small><strong>{Number(value.toFixed(2))}{unit}</strong>{previous !== undefined && <em className={trend}>{delta > 0 ? "+" : ""}{Number(delta.toFixed(2))}{unit}</em>}</span>;
   })}</div>
   <small>{item.weaponVariant ? weaponVariants[item.weaponVariant].label + " · " : ""}Pen {profile.stats.armorPenetration ?? 0} · Crit ×{Number((1 + profile.criticalBonus).toFixed(2))}</small>
   {item.specialEffect && <small>{item.specialEffect}</small>}
   <small>Field hit {tacticalStats(selected).damage} · Mastery {state.weaponClasses[item.weaponClass!]?.level ?? 1}/99. {item.iconic ? "DPS excludes conditional signatures and enemy defenses." : "DPS includes your build, before enemy defenses."}</small>
 </div>;
}
