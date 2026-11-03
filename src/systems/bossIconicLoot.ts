import { bossIconics } from "../data/bossIconics";
import { addItem, discoverItem } from "./collectionSystem";
import type { GameState } from "../types";
export const ICONIC_DROP_CHANCE = .00005;

// A saved seed + settled-victory index makes retry, reload and reopening a
// receipt reproduce the same roll instead of drawing again from Math.random.
export function bossLootValue(seed:number, mission:string, victory:number, salt=0) {
 let h=(seed ^ Math.imul(victory+1,0x9e3779b9) ^ salt)>>>0;
 for(const char of mission) h=Math.imul(h^char.charCodeAt(0),16777619)>>>0;
 h=Math.imul(h^(h>>>16),0x85ebca6b);h=Math.imul(h^(h>>>13),0xc2b2ae35);
 return ((h^(h>>>16))>>>0)/4294967296;
}
export function normalizeBossIconicOwnership(state:GameState) {
 state.rpg.iconicLootSeed=(Math.trunc(state.rpg.iconicLootSeed ?? state.lastSavedAt)>>>0)||1;
 const progress=state.rpg.bossIconicProgress ?? (state.rpg.bossIconicProgress={});
 for(const def of bossIconics) {
  const legacy=progress[def.mission];
  if(legacy?.acquired?.[def.id]||progress[def.bossEnemyId]?.acquired?.[def.id]||(state.inventory[def.id]??0)>0) {
   const entry=progress[def.bossEnemyId]??(progress[def.bossEnemyId]={victories:0,dryStreak:0,acquired:{}});
   entry.acquired[def.id]=true;discoverItem(state,def.id);
  }
 }
 for(const def of bossIconics) delete progress[def.mission];
}

export function settleBossIconic(state:GameState, enemyId:string):string|undefined {
 normalizeBossIconicOwnership(state);
 const pool=bossIconics.filter(def=>def.bossEnemyId===enemyId);
 if(pool.length!==2)return undefined;
 const progress=state.rpg.bossIconicProgress!;
 const entry=progress[enemyId]??(progress[enemyId]={victories:0,dryStreak:0,acquired:{}});
 const candidates=pool.filter(def=>!entry.acquired[def.id]);
 const victory=entry.victories++;
 if(!candidates.length){entry.dryStreak=0;return undefined;}
 const hit=bossLootValue(state.rpg.iconicLootSeed!,enemyId,victory)<ICONIC_DROP_CHANCE;
 // Retain the legacy save field without allowing it to affect drop odds.
 entry.dryStreak=0;
 if(!hit)return undefined;
 const selected=candidates[Math.min(candidates.length-1,Math.floor(bossLootValue(state.rpg.iconicLootSeed!,enemyId,victory,0x51ed270b)*candidates.length))];
 entry.acquired[selected.id]=true;entry.dryStreak=0;addItem(state,selected.id,1);state.inventoryLocks[selected.id]=true;
 return selected.id;
}
