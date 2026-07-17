import type { DistrictId } from "../types";

export type ChallengeTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Iconic" | "Apex";

export type ChallengeObjective =
  | { type: "operationClears"; operationId: string; count: number }
  | { type: "enemyKills"; enemyId: string; count: number }
  | { type: "bossKills"; bossId: string; count: number }
  | { type: "districtMastery"; districtId: DistrictId; level: number }
  | { type: "actionMastery"; actionId: string; level: number }
  | { type: "skillLevel"; skillId: string; level: number }
  | { type: "heatBelow"; value: number }
  | { type: "itemOwned"; itemId: string; count: number };

export interface ChallengeTierDefinition {
  tier: ChallengeTier;
  objective: ChallengeObjective;
  streetLegendXp: number;
  rewards: string[];
}

export interface ChallengeContractDefinition {
  id: string;
  name: string;
  districtId?: DistrictId;
  description: string;
  tiers: ChallengeTierDefinition[];
}

export const challengeContracts: ChallengeContractDefinition[] = [
  {
    id: "challenge-backstreet-sweep",
    name: "Backstreet Sweep Trials",
    districtId: "neonRow",
    description: "Turn the starter operation into a long-term route mastery test.",
    tiers: [
      tier("Bronze", { type: "operationClears", operationId: "op-backstreet-sweep", count: 1 }, 80, ["Basic Sim Cache"]),
      tier("Silver", { type: "operationClears", operationId: "op-backstreet-sweep", count: 10 }, 180, ["Rare Blueprint Fragment"]),
      tier("Gold", { type: "districtMastery", districtId: "neonRow", level: 15 }, 320, ["High-threat variants"]),
      tier("Platinum", { type: "operationClears", operationId: "op-backstreet-sweep", count: 50 }, 520, ["Street Coil bundle"]),
      tier("Iconic", { type: "districtMastery", districtId: "neonRow", level: 50 }, 850, ["Legacy route placeholder"]),
      tier("Apex", { type: "operationClears", operationId: "op-backstreet-sweep", count: 250 }, 1400, ["Apex title placeholder"]),
    ],
  },
  {
    id: "challenge-street-punk-log",
    name: "Street Punk Problem",
    districtId: "neonRow",
    description: "Farm old enemies until Neon Row becomes a solved map.",
    tiers: [
      tier("Bronze", { type: "enemyKills", enemyId: "street-punk", count: 100 }, 90, ["Credits"]),
      tier("Silver", { type: "enemyKills", enemyId: "street-punk", count: 250 }, 180, ["Scrap bundle"]),
      tier("Gold", { type: "enemyKills", enemyId: "street-punk", count: 1000 }, 450, ["Street Coil source focus"]),
      tier("Platinum", { type: "enemyKills", enemyId: "hardened-street-punk", count: 250 }, 700, ["High-threat farming"]),
      tier("Iconic", { type: "enemyKills", enemyId: "neon-row-kill-team", count: 100 }, 1100, ["Iconic fragment hint"]),
      tier("Apex", { type: "districtMastery", districtId: "neonRow", level: 99 }, 2000, ["Neon Row legend placeholder"]),
    ],
  },
  {
    id: "challenge-junkyard-warden",
    name: "Warden's Warpath",
    districtId: "rustYards",
    description: "Repeat Rust Yards clears and build toward high-threat operation farming.",
    tiers: [
      tier("Bronze", { type: "operationClears", operationId: "op-junkyard-lockdown", count: 1 }, 120, ["Vehicle Parts"]),
      tier("Silver", { type: "operationClears", operationId: "op-junkyard-lockdown", count: 10 }, 260, ["Engine Core tracking"]),
      tier("Gold", { type: "districtMastery", districtId: "rustYards", level: 25 }, 480, ["Return contract focus"]),
      tier("Platinum", { type: "bossKills", bossId: "boss-junkyard-warden", count: 50 }, 760, ["Boss milestone placeholder"]),
      tier("Iconic", { type: "districtMastery", districtId: "rustYards", level: 75 }, 1200, ["Automation hook"]),
      tier("Apex", { type: "bossKills", bossId: "boss-junkyard-warden", count: 500 }, 2200, ["Apex vehicle title"]),
    ],
  },
  {
    id: "challenge-blacknet-trace-storm",
    name: "Trace Storm",
    districtId: "blacknetQuarter",
    description: "Push Blacknet clears while keeping trace pressure under control.",
    tiers: [
      tier("Bronze", { type: "skillLevel", skillId: "hacking", level: 25 }, 150, ["Encrypted Data"]),
      tier("Silver", { type: "operationClears", operationId: "op-ghost-signal-dive", count: 5 }, 320, ["Blacknet Cipher"]),
      tier("Gold", { type: "heatBelow", value: 25 }, 420, ["Trace cleanup goal"]),
      tier("Platinum", { type: "districtMastery", districtId: "blacknetQuarter", level: 50 }, 900, ["High-threat dive"]),
      tier("Iconic", { type: "bossKills", bossId: "boss-firewall-warden", count: 100 }, 1400, ["Cyberdeck fragment"]),
      tier("Apex", { type: "districtMastery", districtId: "blacknetQuarter", level: 99 }, 2400, ["Null legend placeholder"]),
    ],
  },
  {
    id: "challenge-legacy-bench",
    name: "Legacy Bench Prep",
    description: "Build the material base for legendary and iconic crafting.",
    tiers: [
      tier("Bronze", { type: "itemOwned", itemId: "circuit-bundle", count: 25 }, 100, ["Component chain tracking"]),
      tier("Silver", { type: "itemOwned", itemId: "neural-connector", count: 20 }, 250, ["Cyberware chain tracking"]),
      tier("Gold", { type: "itemOwned", itemId: "urban-reflex-chip", count: 5 }, 500, ["Legacy Reflex Core hint"]),
      tier("Platinum", { type: "itemOwned", itemId: "prototype-neural-core", count: 3 }, 900, ["Prototype chain"]),
      tier("Iconic", { type: "skillLevel", skillId: "cyberware", level: 80 }, 1500, ["Iconic cyberware access"]),
      tier("Apex", { type: "itemOwned", itemId: "legendary-chrome-matrix", count: 1 }, 2600, ["Apex crafting placeholder"]),
    ],
  },
];

function tier(tierName: ChallengeTier, objective: ChallengeObjective, streetLegendXp: number, rewards: string[]): ChallengeTierDefinition {
  return { tier: tierName, objective, streetLegendXp, rewards };
}
