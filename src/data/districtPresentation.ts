import type { DistrictId } from "../types";
// Editorial direction, not combat modifiers. Future mechanics belong in combat systems.
export const districtPresentation: Record<DistrictId, { focus: string; futureEncounterTheme: string }> = {
 neonRow: { focus: "Learn the city", futureEncounterTheme: "Core mechanics" },
 rustYards: { focus: "Industrial territory", futureEncounterTheme: "Armor and heavy enemies" },
 underpassMarket: { focus: "Deals under pressure", futureEncounterTheme: "Status and bleed pressure" },
 blacknetQuarter: { focus: "Inside the network", futureEncounterTheme: "RAM and quickhack pressure" },
 helixWard: { focus: "Biotech territory", futureEncounterTheme: "Healing and regeneration" },
 glasslineDistrict: { focus: "Corporate security", futureEncounterTheme: "Shields and countermeasures" },
 redlineBlocks: { focus: "The city fights back", futureEncounterTheme: "Aggressive, high-damage encounters" },
 skylineCore: { focus: "The final ascent", futureEncounterTheme: "Combined endgame mechanics" },
};
// Optional asset slot keyed by stable mission ID and encounter index. No new art required.
export const encounterArtwork: Partial<Record<string, { src: string; alt: string }>> = {};
