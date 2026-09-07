import type { ActiveModifiers, DistrictId } from "../types";

export interface DistrictMasteryMilestone {
  level: number;
  name: string;
  description: string;
  unlockKey: string;
  modifiers?: Partial<ActiveModifiers>;
}

export const districtMasteryMilestones: DistrictMasteryMilestone[] = [
  { level: 5, name: "Street Familiarity", description: "+2% rewards from this district.", unlockKey: "district-reward-2", modifiers: { skillRewards: 0.02 } },
  { level: 10, name: "Return Contract", description: "Unlocks repeatable return contracts for this district.", unlockKey: "district-return-contracts" },
  { level: 15, name: "Hardened Variant", description: "High-threat enemy variants can appear in this district.", unlockKey: "district-hardened-enemies" },
  { level: 20, name: "Route Intel", description: "Unlocks advanced operation route hooks.", unlockKey: "district-operation-routes" },
  { level: 25, name: "Backroom Stock", description: "Unlocks district vendor, market, or Ripperdoc stock hooks.", unlockKey: "district-market-stock" },
  { level: 35, name: "Drop Memory", description: "+2% rare drop chance in this district.", unlockKey: "district-rare-drop-2", modifiers: { dropChance: 0.02 } },
  { level: 50, name: "High-Threat Access", description: "Unlocks late return content in this district.", unlockKey: "district-high-threat-content" },
  { level: 75, name: "Automation Route", description: "Unlocks district automation improvement hooks.", unlockKey: "district-automation" },
  { level: 99, name: "District Legend", description: "Mastery title and passive placeholder.", unlockKey: "district-title" },
];

export const districtSpecificMaterials: Record<DistrictId, string[]> = {
  neonRow: ["street-coil", "urban-reflex-chip", "lowgrade-optic-lens", "redline-wire", "neon-circuit-fragment"],
  rustYards: ["engineCore", "salvaged-servo", "rust-plated-frame", "drone-motor", "chrome-jackal-gearset"],
  underpassMarket: ["contraband-chip", "ghost-market-token", "illegal-mod-core", "black-ledger-shard", "smuggler-seal"],
  blacknetQuarter: ["blacknet-cipher", "rogue-packet-core", "trace-scrambler-chip", "encrypted-memory-stack", "daemon-fragment"],
  glasslineDistrict: ["corporate-access-token", "executive-processor", "glassline-alloy", "security-override-chip", "corporate-optic-lens"],
  helixWard: ["stabilizer-compound", "neural-dampener", "medical-gel-matrix", "bioware-thread", "helix-authorization"],
  redlineBlocks: ["ballistic-core", "reinforced-grip", "redline-trigger-kit", "combat-stim-pack", "armor-breaker-plate"],
  skylineCore: ["apex-neural-core", "relic-circuit", "luxury-processor", "skyline-authorization", "legendary-chrome-matrix"],
};

export function nextDistrictMasteryMilestone(level: number) {
  return districtMasteryMilestones.find((milestone) => level < milestone.level) ?? null;
}
