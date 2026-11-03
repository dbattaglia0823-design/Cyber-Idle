import { calculatePlayerCombatStats } from "./balanceFormulas";
import { simCacheTypes } from "../data/simCache";
import { advanceCombat, canFightEnemy, getEnemy } from "./combatProcessing";
import { cloneState, pushCategorizedLog } from "./gameState";
import { removeItem } from "./collectionSystem";
import { emitRewardPopupGroup, suppressRewardPopups } from "./rewardPopups";
import { totalCharacterXp } from "./characterProgression";
import { updateWorldUnlocks } from "./worldUnlocks";
import { getItem } from "../data/items";
import type { GameState, ResourceId, SimulationRecap } from "../types";

export const combatCache = simCacheTypes.find(cache=>cache.id==="combat")!;
export function combatSimEligibility(state:GameState) {
 const enemy=state.currentCombat&&getEnemy(state.currentCombat.enemyId);
 if(!enemy)return {eligible:false,reason:"Start a Street Combat target first."};
 if(!canFightEnemy(state,enemy))return {eligible:false,reason:"Target locked or player unable to fight."};
 if(!state.manualDiscovery.enemies[enemy.id])return {eligible:false,reason:"Defeat this target manually once before simulating."};
 if((state.inventory[combatCache.itemId]??0)<1)return {eligible:false,reason:"No Combat Sim Cache available."};
 return {eligible:true,reason:`Ready to simulate ${enemy.name}.`};
}

function nextEvent(state:GameState) {
 const c=state.currentCombat;
 return !c ? Infinity : c.respawnAt ?? Math.min(c.nextPlayerAttackAt??c.startedAt+calculatePlayerCombatStats(state).attackSpeedMs,c.nextEnemyAttackAt??c.startedAt+(getEnemy(c.enemyId)?.attackSpeedMs??1600));
}
function shiftCombat(state:GameState,offset:number) {
 const c=state.currentCombat;if(!c)return;
 c.startedAt+=offset;
 for(const key of ["nextPlayerAttackAt","nextEnemyAttackAt","respawnAt","lastPlayerAttackAt","lastEnemyAttackAt"] as const)if(c[key]!==undefined)c[key]!+=offset;
 for(const key of ["lastPlayerHit","lastEnemyHit"] as const)if(c[key])c[key]!.at+=offset;
}

// Runs real attack events, not a DPS-derived kill grant. Preview uses a disposable
// clone, no reward resolver, no RNG, and consumes real healing supplies on that clone.
export function estimateCombatSimKills(state:GameState,minutes=combatCache.minutesPerItem) {
 if(!state.currentCombat)return 0;
 const next=cloneState(state),start=state.lastSavedAt,end=start+minutes*60000;
 let kills=0,events=0;
 suppressRewardPopups(next,true);
 while(next.currentCombat&&events++<3000){const at=Math.max(start,nextEvent(next));if(at>end||!Number.isFinite(at))break;advanceCombat(next,at,{simulated:true,preview:true,onKill:()=>kills++});}
 suppressRewardPopups(next,false);
 return kills;
}

export interface CombatSimReservation { state:GameState; count:number; startedAt:number }
// The UI persists this reservation before asynchronous work. Closing/reloading
// can forfeit unfinished caches, but can never replay rolls or refund spent ones.
export function reserveCombatSimCaches(state:GameState,cacheCount:number,now=Date.now()):CombatSimReservation|null {
 if(!Number.isFinite(cacheCount)||cacheCount<1||!combatSimEligibility(state).eligible)return null;
 const count=Math.min(Math.floor(cacheCount),Math.floor(state.inventory[combatCache.itemId]??0));
 if(count<1)return null;
 const next=cloneState(state);removeItem(next,combatCache.itemId,count);next.lastSavedAt=now;
 return {state:next,count,startedAt:now};
}

export async function finishCombatSimCaches(reservation:CombatSimReservation, yieldFrame:()=>Promise<void> = ()=>new Promise(resolve=>setTimeout(resolve,0))) {
 const original=reservation.state,next=cloneState(original),start=reservation.startedAt;
 const simulatedMs=reservation.count*combatCache.minutesPerItem*60000,end=start+simulatedMs;
 const enemy=getEnemy(next.currentCombat!.enemyId)!;
 const recap:SimulationRecap={cacheType:"combat",simulatedMs,activityName:enemy.name,completions:0,
  efficiency:{skillXp:1,masteryXp:1,resources:1,credits:1,rareDrops:1,heat:1,factionTrust:1,neuralInstability:1},xpGained:0,masteryXpGained:0,poolXpGained:0,resourcesGained:{},dropsGained:{},heatChange:0,neuralInstabilityChange:0,stoppedReason:"Simulated full cache duration.",warnings:[]};
 let lastYield=performance.now(),cursor=start;
 suppressRewardPopups(next,true);
 try {
  while(next.currentCombat){
   const at=Math.max(cursor,nextEvent(next));if(at>end||!Number.isFinite(at))break;
   cursor=at;
   advanceCombat(next,at,{simulated:true,onKill:(_enemy,_duration,earned)=>{recap.completions++;recap.xpGained+=earned?.xp??0;recap.masteryXpGained+=earned?.mastery??0;}});
   if(performance.now()-lastYield>=12){await yieldFrame();lastYield=performance.now();}
  }
 } finally {suppressRewardPopups(next,false);}
 if(!next.currentCombat)recap.stoppedReason=next.health.lifeState==="downed"?"Stopped: defeated. No automatic revival or free recovery.":"Stopped: healing exhausted or target requirements no longer met.";
 recap.elapsedMs=next.currentCombat?simulatedMs:Math.max(0,cursor-start);
 recap.characterXpGained=totalCharacterXp(next)-totalCharacterXp(original);
 recap.characterLevelsGained=next.rpg.level-original.rpg.level;
 recap.heatChange=next.resources.heat-original.resources.heat;
 recap.neuralInstabilityChange=next.neuralInstability-original.neuralInstability;
 for(const [id,value] of Object.entries(next.resources)){const delta=value-original.resources[id as ResourceId];if(delta)recap.resourcesGained[id as ResourceId]=delta;}
 for(const [id,value] of Object.entries(next.inventory)){const delta=value-(original.inventory[id]??0);if(delta>0)recap.dropsGained[id]=delta;}
 recap.iconicsRecovered=Object.keys(recap.dropsGained).filter(id=>getItem(id)?.iconic);
 const now=Date.now();shiftCombat(next,now-(next.currentCombat?end:cursor));next.lastSavedAt=now;
 next.worldUnlocks.usedSimCache=true;next.simulationRecap=recap;updateWorldUnlocks(next);
 pushCategorizedLog(next,"Combat",`Combat Sim Cache: ${recap.completions} kills of ${enemy.name}. ${recap.stoppedReason}`);
 emitRewardPopupGroup(next,{title:`${recap.completions} kills · Combat simulation complete`,category:recap.iconicsRecovered.length?"rare":"story",xp:{combat:recap.xpGained},masteryXp:recap.masteryXpGained,resources:recap.resourcesGained,items:recap.dropsGained});
 return next;
}

export async function runCombatSimCaches(state:GameState,count:number,now=Date.now()) {
 const reservation=reserveCombatSimCaches(state,count,now);
 return reservation?finishCombatSimCaches(reservation):state;
}
