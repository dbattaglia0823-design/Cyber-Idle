import type { DistrictId } from "../types";

// Fixed district targets, calibrated against locally craftable weapons and armor.
// These never scale with the player's current loadout.
export const mainJobBalance: Record<DistrictId, { health: number; damage: number; weapon: string; armor: string }> = {
  neonRow: { health: 145, damage: 14, weapon: "street-rifle", armor: "scrap-bulwark-chest" },
  rustYards: { health: 300, damage: 24, weapon: "hauler-carbine", armor: "jackal-plate-chest" },
  underpassMarket: { health: 500, damage: 38, weapon: "contraband-lancer", armor: "ghostweave-chest" },
  blacknetQuarter: { health: 850, damage: 85, weapon: "null-choir-rifle", armor: "null-shroud-chest" },
  helixWard: { health: 1100, damage: 110, weapon: "helix-pulse-rifle", armor: "helix-aegis-chest" },
  glasslineDistrict: { health: 1450, damage: 145, weapon: "corporate-verdict", armor: "glassline-tactical-chest" },
  redlineBlocks: { health: 1800, damage: 190, weapon: "redline-dominion", armor: "redline-juggernaut-chest" },
  skylineCore: { health: 2200, damage: 230, weapon: "skyline-zero", armor: "skyline-apex-chest" },
};
