import { districtEncounterProfiles, type TacticalTrait } from "../data/tacticalTraits";
import type { RpgMission } from "../data/rpgCampaign";
import type { RpgEncounter } from "../rpgTypes";
export function encounterTraits(mission: RpgMission, enemyIndex: number, turn = 0) {
 const district = districtEncounterProfiles[mission.district];
 const boss = !mission.sideGig && enemyIndex === mission.enemies.length - 1;
 // Gigs teach one local mechanic; main-job bosses own the advanced combinations.
 const profile = boss ? district.boss : district.patrols[enemyIndex % district.patrols.length];
 let traits = profile.traits;
 let phase = profile.phase;
 if (boss && mission.district === "skylineCore") {
   const phases: Array<{ traits: TacticalTrait[]; phase: string }> = [
     {traits:["armor","shield"],phase:"Bastion / aim or hack"},
     {traits:["ramDrain","regeneration"],phase:"Recovery / interrupt or overheat"},
     {traits:["bleed","aggression"],phase:"Assault / cover or interrupt"},
   ];
   ({traits, phase} = phases[turn % phases.length]);
 }
 if (boss && mission.district === "rustYards") phase = turn % 3 === 2 ? "Plating sealed / aim or hack" : "Plate seams exposed";
 const has = (id: TacticalTrait) => traits.includes(id);
 const charged = has("aggression") ? turn % 3 >= (boss ? 1 : 2) : turn % 3 === 2;
 const special = boss && has("bleed") ? turn % 3 >= 1 : charged;
 return { traits, phase, boss, charged, special,
   armor: has("armor") ? boss ? mission.district === "rustYards" ? turn % 3 === 2 ? .45 : .12 : .28 : .18 : 0,
   shield: has("shield") && turn % 3 < (boss ? 2 : 1) ? .35 : 0,
   regeneration: has("regeneration") ? boss && turn % 3 === 2 ? .025 : .012 : 0,
   ramDrain: has("ramDrain") && (boss ? turn % 3 >= 1 : charged) ? boss ? 2 : 1 : 0,
   bleed: has("bleed") && special,
   recovery: has("aggression") && turn % 3 === 0,
 };
}
export function tacticalIntent(mission: RpgMission, encounter: RpgEncounter) {
 const t = encounterTraits(mission, encounter.enemyIndex, encounter.turn);
 const attack = t.charged ? "Charged burst" : t.recovery ? "Recovery shot" : encounter.turn % 3 === 1 ? "Suppressing fire" : "Direct shot";
 const details = [t.bleed ? "Bleed on hit" : "", t.ramDrain ? "RAM drain " + t.ramDrain : "", t.regeneration ? "Repairs after turn" : "", t.shield ? "Shield raised" : ""].filter(Boolean);
 return { attack, details, ...t };
}
