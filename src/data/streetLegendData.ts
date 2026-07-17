import type { ActiveModifiers } from "../types";

export interface StreetLegendMilestone {
  rank: number;
  name: string;
  description: string;
  unlockKey: string;
  modifiers?: Partial<ActiveModifiers>;
}

export const streetLegendMilestones: StreetLegendMilestone[] = [
  { rank: 1, name: "Street Legend", description: "Street Legend progression online.", unlockKey: "street-legend-online" },
  { rank: 5, name: "Known Runner", description: "+1% global XP.", unlockKey: "global-xp-1", modifiers: { combatXp: 0.01, skillXp: { scavenging: 0.01, hacking: 0.01, cyberware: 0.01, combat: 0.01 } } },
  { rank: 10, name: "City Reputation", description: "+1% global resource rewards.", unlockKey: "global-rewards-1", modifiers: { skillRewards: 0.01 } },
  { rank: 15, name: "Challenge Board", description: "Unlocks Challenge Contracts.", unlockKey: "challenge-contracts" },
  { rank: 20, name: "Simulation Memory", description: "+2% Sim Cache efficiency.", unlockKey: "sim-cache-2", modifiers: { simCacheEfficiency: 0.02 } },
  { rank: 25, name: "Lockdown Access", description: "Unlocks High-Threat Operations.", unlockKey: "high-threat-operations" },
  { rank: 30, name: "Legacy Bench", description: "Unlocks Legacy Crafting goals.", unlockKey: "legacy-crafting" },
  { rank: 40, name: "Blueprint Hunter", description: "Unlocks Legendary Blueprint tracking.", unlockKey: "legendary-blueprint-tracking", modifiers: { dropChance: 0.005 } },
  { rank: 50, name: "Prestige Protocol", description: "Unlocks Prestige Protocol placeholder.", unlockKey: "prestige-protocol" },
  { rank: 75, name: "Apex Citywork", description: "Unlocks Apex district modifier placeholders.", unlockKey: "apex-district-modifiers", modifiers: { skillRewards: 0.02, dropChance: 0.01 } },
  { rank: 100, name: "City Legend", description: "City Legend title and passive placeholder.", unlockKey: "city-legend-title", modifiers: { skillRewards: 0.03, combatXp: 0.03 } },
];

export function streetLegendXpForRank(rank: number) {
  const safeRank = Math.max(1, Math.floor(rank));
  const tier =
    safeRank < 10 ? 1 :
    safeRank < 25 ? 1.45 :
    safeRank < 50 ? 2.1 :
    safeRank < 75 ? 3.2 :
    5;
  return Math.floor((120 + Math.pow(safeRank, 1.82) * 38) * tier);
}

export function nextStreetLegendMilestone(rank: number) {
  return streetLegendMilestones.find((milestone) => rank < milestone.rank) ?? null;
}
