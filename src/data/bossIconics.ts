import { streetBosses } from "./streetBosses";
import type { DistrictId, ItemDefinition, WeaponClassId } from "../types";
export type IconicEffect = "finalNotice" | "collateral" | "impound" | "towline" | "escrow" | "finePrint" | "cacheMiss" | "airGap" | "sterileBurn" | "secondOpinion" | "override" | "counteroffer" | "anthem" | "requiem" | "rootAccess" | "echo";
export interface BossIconicDefinition { id:string; name:string; district:DistrictId; mission:string; bossEnemyId:string; boss:string; category:WeaponClassId; effect:IconicEffect; ability:string; lore:string }
const authoredIconics: Omit<BossIconicDefinition,"bossEnemyId"|"boss">[] = [
 {id:"iconic-final-notice",name:"Final Notice",district:"neonRow",mission:"dead-drop",category:"pistols",effect:"finalNotice",ability:"Every third weapon hit deals 18% extra damage. Resets on a new target.",lore:"The Kill Team Leader's stamped sidearm: three notices, then repossession."},
 {id:"iconic-collateral",name:"Collateral",district:"neonRow",mission:"dead-drop",category:"bluntWeapons",effect:"collateral",ability:"Your first weapon hit on a target reduces its next incoming hit by 25%.",lore:"The kill team's chrome baton, used to stagger rivals beneath the maglev."},
 {id:"iconic-impound-order",name:"Impound Order",district:"rustYards",mission:"burning-rubber",category:"shotguns",effect:"impound",ability:"Armored targets suffer a 10% breach bonus; field shots also gain 8 penetration.",lore:"The Roadboss's vehicle-panel breacher, stamped with the Jackal convoy's seal."},
 {id:"iconic-towline",name:"Towline",district:"rustYards",mission:"burning-rubber",category:"heavyWeapons",effect:"towline",ability:"Every fourth weapon hit weakens enemy damage by 15% for two field turns or two idle attacks.",lore:"A convoy suppression rig built to pin a moving vehicle in place."},
 {id:"iconic-escrow",name:"Escrow",district:"underpassMarket",mission:"ghost-price",category:"sniperRifles",effect:"escrow",ability:"The opening shot marks a target; the next weapon hit consumes the mark for 20% extra damage.",lore:"The Factor's auction-vault overwatch rifle. Payment clears on the second shot."},
 {id:"iconic-fine-print",name:"Fine Print",district:"underpassMarket",mission:"ghost-price",category:"blades",effect:"finePrint",ability:"Hits on targets below 40% HP restore 2% max HP, at most three times per target.",lore:"A lacerating escrow blade hidden in the Factor's armored sleeve."},
 {id:"iconic-cache-miss",name:"Cache Miss",district:"blacknetQuarter",mission:"choir-of-static",category:"cyberdeckWeapons",effect:"cacheMiss",ability:"Every third weapon hit restores 1 RAM in the field, or sheds 0.1 Heat in idle combat.",lore:"A stolen Null Oracle interface that siphons back the memory it once confiscated."},
 {id:"iconic-air-gap",name:"Air Gap",district:"blacknetQuarter",mission:"choir-of-static",category:"smartWeapons",effect:"airGap",ability:"Every fourth weapon hit grants a ward: 20% less damage from the next hit and blocks one field RAM drain.",lore:"Oracle targeting hardware with its quarantine channel turned inside out."},
 {id:"iconic-sterile-burn",name:"Sterile Burn",district:"helixWard",mission:"borrowed-time",category:"techWeapons",effect:"sterileBurn",ability:"Hits apply a non-stacking two-tick burn at 5% shot damage; field burn suppresses repairs.",lore:"The Captain's sterilization emitter, repurposed against the clinic's own repair systems."},
 {id:"iconic-second-opinion",name:"Second Opinion",district:"helixWard",mission:"borrowed-time",category:"smartWeapons",effect:"secondOpinion",ability:"Defeating a target restores 4% max HP. No overhealing.",lore:"A biometric security arm whose triage interlock finally serves its wielder."},
 {id:"iconic-executive-override",name:"Executive Override",district:"glasslineDistrict",mission:"hostile-takeover",category:"assaultRifles",effect:"override",ability:"Ignores half of field shield mitigation; deals 12% more damage to shielded idle targets.",lore:"An exosuit authorization rifle that signs its own shield-access exemptions."},
 {id:"iconic-golden-handshake",name:"Golden Handshake",district:"glasslineDistrict",mission:"hostile-takeover",category:"pistols",effect:"counteroffer",ability:"After taking a hit, your next weapon attack deals 12% extra damage. Cannot stack.",lore:"The Handler's retaliation sidearm: every hostile offer receives a counteroffer."},
 {id:"iconic-barricade-anthem",name:"Barricade Anthem",district:"redlineBlocks",mission:"no-kings",category:"smgs",effect:"anthem",ability:"Consecutive weapon attacks gain 3% damage per stack, up to 12%. Other field actions reset the chain.",lore:"The Executioner's blockade automatic, tuned to the rhythm of its double-burst overdrive."},
 {id:"iconic-redline-requiem",name:"Redline Requiem",district:"redlineBlocks",mission:"no-kings",category:"heavyWeapons",effect:"requiem",ability:"A kill grants two tempo charges: 15% faster idle attacks or 15% stronger field attacks. No stacking.",lore:"A siege platform that carries the barricade's momentum into its next engagement."},
 {id:"iconic-root-access",name:"Root Access",district:"skylineCore",mission:"afterimage",category:"exoticWeapons",effect:"rootAccess",ability:"Cycles three counters: armor breach, half shield bypass, then a small repair-suppressing burn.",lore:"The observatory's root weapon, carrying the Commander's rotating countermeasures."},
 {id:"iconic-afterimage-echo",name:"Afterimage Echo",district:"skylineCore",mission:"afterimage",category:"sniperRifles",effect:"echo",ability:"Every fourth hit echoes 20% shot damage once. Field echoes bypass plating and shields; echoes cannot trigger effects.",lore:"A neural-observatory long rifle whose final packet arrives after the original shot."},
];
export const bossIconics: BossIconicDefinition[] = authoredIconics.map(def=>{
 const source=streetBosses.find(boss=>boss.district===def.district)!;
 return {...def,bossEnemyId:source.enemyId,boss:source.name,lore:def.lore};
});
export function makeBossIconicItems(regular: ItemDefinition[]): ItemDefinition[] {
 return bossIconics.map(def=>{
  const base=regular.find(item=>item.weaponDistrict===def.district&&item.weaponClass===def.category&&item.weaponVariant==="Power")!;
  return {...base,id:def.id,name:def.name,description:def.lore,weaponModel:undefined,weaponVariant:undefined,
   iconic:{boss:def.boss,mission:def.mission,bossEnemyId:def.bossEnemyId,effect:def.effect},specialEffect:def.ability,
   sourceHint:`Exceptionally rare Street Combat drop: ${def.boss}. Farm directly or with Combat Sim Caches after a manual defeat.`,
   tags:[...base.tags.filter(tag=>tag!=="power"),"iconic","bossReward"],
   stats:{...base.stats,damage:Number(((base.stats?.damage??0)*.96).toFixed(2))},
  };
 });
}
