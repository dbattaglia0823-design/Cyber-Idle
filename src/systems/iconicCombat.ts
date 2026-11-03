import { getItem } from "../data/items";
import type { GameState } from "../types";
import type { IconicCombatMemory } from "../rpgTypes";
type Holder={iconicMemory?:IconicCombatMemory};
export interface IconicHitContext { mode:"field"|"idle"; damage:number; maxHp:number; enemyHp:number; enemyMaxHp:number; armored:boolean; shielded:boolean; maxRam?:number }
function memory(state:GameState,holder:Holder) {
 const id=state.equippedGear.weapon??"";
 if(!getItem(id)?.iconic){holder.iconicMemory=undefined;return {weaponId:id,hits:0} as IconicCombatMemory;}
 if(holder.iconicMemory?.weaponId!==id)holder.iconicMemory={weaponId:id,hits:0};
 return holder.iconicMemory!;
}
function heal(state:GameState,amount:number,maxHp:number) {
 const gain=Math.max(0,Math.min(maxHp-state.health.currentHp,Math.round(amount)));
 state.health.currentHp+=gain;state.healthStatistics.totalHealingReceived+=gain;
 return gain;
}
export function iconicWeaponHit(state:GameState,holder:Holder,c:IconicHitContext) {
 const m=memory(state,holder),effect=getItem(m.weaponId)?.iconic?.effect;
 const result={multiplier:1,extra:0,penetration:0,shieldPierce:0,burn:0,weaken:0,interval:1,proc:false};
 if(!effect)return result;
 m.hits=Math.min(1000000,m.hits+1);
 if(c.mode==="idle"&&(m.burnTicks??0)>0){result.extra+=m.burnDamage??0;m.burnTicks!--;}
 const burn=()=>{result.burn=Math.max(1,Math.round(c.damage*.05));if(c.mode==="idle"){m.burnDamage=result.burn;m.burnTicks=2;}result.proc=true;};
 switch(effect){
 case "finalNotice":if(m.hits%3===0){result.multiplier=1.18;result.proc=true;}break;
 case "collateral":if(m.hits===1){m.guard=.25;result.proc=true;}break;
 case "impound":if(c.armored){result.multiplier=1.10;result.penetration=8;result.proc=true;}break;
 case "towline":if(m.hits%4===0){result.weaken=.15;if(c.mode==="idle")m.weakHits=2;result.proc=true;}break;
 case "escrow":if(m.marked){result.multiplier=1.20;m.marked=false;result.proc=true;}else if(m.hits===1)m.marked=true;break;
 case "finePrint":if(c.enemyHp/c.enemyMaxHp<.4&&(m.heals??0)<3){heal(state,c.maxHp*.02,c.maxHp);m.heals=(m.heals??0)+1;result.proc=true;}break;
 case "cacheMiss":if(m.hits%3===0){if(c.mode==="field"&&state.rpg.active)state.rpg.active.ram=Math.min(c.maxRam??0,state.rpg.active.ram+1);else state.resources.heat=Math.max(0,state.resources.heat-.1);result.proc=true;}break;
 case "airGap":if(m.hits%4===0){m.guard=.20;m.ramWard=true;result.proc=true;}break;
 case "sterileBurn":burn();break;
 case "override":if(c.shielded){result.shieldPierce=.5;if(c.mode==="idle")result.multiplier=1.12;result.proc=true;}break;
 case "counteroffer":if(m.retaliation){result.multiplier=1.12;m.retaliation=false;result.proc=true;}break;
 case "anthem":m.momentum=Math.min(4,(m.momentum??0)+1);result.multiplier=1+m.momentum*.03;break;
 case "requiem":if((m.tempoCharges??0)>0){m.tempoCharges!--;if(c.mode==="idle")result.interval=.85;else result.multiplier=1.15;result.proc=true;}break;
 case "rootAccess":if(m.hits%3===1&&c.armored){result.multiplier=1.10;result.penetration=8;result.proc=true;}else if(m.hits%3===2&&c.shielded){result.shieldPierce=.5;if(c.mode==="idle")result.multiplier=1.12;result.proc=true;}else if(m.hits%3===0)burn();break;
 case "echo":if(m.hits%4===0){result.extra+=Math.round(c.damage*.20);result.proc=true;}break;
 }
 return result;
}
export function iconicNonAttack(state:GameState,holder:Holder){memory(state,holder).momentum=0;}
export function iconicIncoming(state:GameState,holder:Holder) {
 const m=memory(state,holder);const reduction=Math.max(m.guard??0,(m.weakHits??0)>0?.15:0);
 m.guard=0;if((m.weakHits??0)>0)m.weakHits!--;
 if(getItem(m.weaponId)?.iconic?.effect==="counteroffer")m.retaliation=true;
 return 1-Math.min(.25,reduction);
}
export function iconicKill(state:GameState,holder:Holder,maxHp:number) {
 const m=memory(state,holder),effect=getItem(m.weaponId)?.iconic?.effect;
 if(effect==="secondOpinion")heal(state,maxHp*.04,maxHp);
 if(effect==="requiem")m.tempoCharges=2;
}
export function resetIconicTarget(state:GameState,holder:Holder) {
 const old=memory(state,holder);
 if(!getItem(old.weaponId)?.iconic){holder.iconicMemory=undefined;return;}
 holder.iconicMemory={weaponId:old.weaponId,hits:0,tempoCharges:old.tempoCharges??0};
}
