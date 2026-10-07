import type { DistrictId } from "../types";
export type TacticalTrait = "armor" | "bleed" | "ramDrain" | "regeneration" | "shield" | "aggression";
export interface EncounterProfile { traits: TacticalTrait[]; phase?: string }
export const traitDescriptions: Record<TacticalTrait, { name: string; counter: string }> = {
 armor: { name: "Plated armor", counter: "Reduces unaimed weapon damage. Aim bypasses plating; quickhacks ignore it." },
 bleed: { name: "Lacerating rounds", counter: "Special attacks cause two turns of bleeding. Cover or interrupt prevents it; an injector clears it." },
 ramDrain: { name: "RAM disruption", counter: "Special attacks drain RAM. Cover blocks the drain; Recover RAM also provides cover." },
 regeneration: { name: "Repair system", counter: "Repairs damage after each turn. Overheat or an interrupt disables recovery for that turn." },
 shield: { name: "Cycle shield", counter: "A timed shield reduces weapon damage. Quickhacks bypass it; aim during its guarded phase." },
 aggression: { name: "Overdrive", counter: "Extra charged bursts follow a recovery turn. Use cover or interrupts; attack during the opening." },
};
export const districtEncounterProfiles: Record<DistrictId, { patrols: EncounterProfile[]; boss: EncounterProfile; lesson: string }> = {
 neonRow: { patrols: [{traits:[]}], boss:{traits:[]}, lesson:"Read intent, aim your shots, and cover charged bursts." },
 rustYards: { patrols:[{traits:["armor"]}], boss:{traits:["armor"],phase:"Reinforced plating"}, lesson:"Aim bypasses heavy armor. Quickhacks also ignore plating." },
 underpassMarket: { patrols:[{traits:["bleed"]}], boss:{traits:["bleed"],phase:"Relentless laceration"}, lesson:"Cover lacerating shots. Injectors stop bleeding as well as healing." },
 blacknetQuarter: { patrols:[{traits:["ramDrain"]}], boss:{traits:["ramDrain"],phase:"Network lockdown"}, lesson:"Keep RAM in reserve. Cover blocks disruption; Recover RAM restores it." },
 helixWard: { patrols:[{traits:["regeneration"]}], boss:{traits:["regeneration"],phase:"Emergency repair cycle"}, lesson:"Overheat or interrupts suppress repairs. Strong aimed shots can also outpace them." },
 glasslineDistrict: { patrols:[{traits:["shield"]}], boss:{traits:["shield"],phase:"Extended shield cycle"}, lesson:"Aim while shields are raised, then fire when they drop. Quickhacks bypass shields." },
 redlineBlocks: { patrols:[{traits:["aggression"]}], boss:{traits:["aggression"],phase:"Double-burst overdrive"}, lesson:"Use the recovery opening. Cover or interrupt the following charged bursts." },
 skylineCore: { patrols:[{traits:["armor","shield"]},{traits:["ramDrain","regeneration"]},{traits:["bleed","aggression"]}], boss:{traits:["armor","shield","ramDrain","regeneration","bleed","aggression"],phase:"Rotating countermeasures"}, lesson:"Read the active phase: plating and shields, repair and disruption, then bleeding and burst pressure." },
};
