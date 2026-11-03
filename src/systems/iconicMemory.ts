import { bossIconics } from "../data/bossIconics";
import type { IconicCombatMemory } from "../rpgTypes";
export function normalizeIconicMemory(value?:IconicCombatMemory):IconicCombatMemory|undefined {
 if(!value||!bossIconics.some(item=>item.id===value.weaponId))return undefined;
 const bounded=(n:number|undefined,max:number)=>Number.isFinite(n)?Math.max(0,Math.min(max,n!)):0;
 return {weaponId:value.weaponId,hits:Math.floor(bounded(value.hits,1000000)),guard:bounded(value.guard,.25),weakHits:Math.floor(bounded(value.weakHits,2)),ramWard:!!value.ramWard,heals:Math.floor(bounded(value.heals,3)),marked:!!value.marked,retaliation:!!value.retaliation,momentum:Math.floor(bounded(value.momentum,4)),tempoCharges:Math.floor(bounded(value.tempoCharges,2)),burnDamage:bounded(value.burnDamage,10000),burnTicks:Math.floor(bounded(value.burnTicks,2))};
}
