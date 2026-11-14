import { districtSupplyItems } from "./materialSupply";
import type { RpgMission } from "./rpgCampaign";
import type { DistrictId, GameState } from "../types";

export type DistrictBountyKind = "hunt" | "intercept" | "sabotage";
export interface DistrictBountyOffer {
  id: string;
  cycle: number;
  district: DistrictId;
  kind: DistrictBountyKind;
  title: string;
  target: string;
  objective: string;
  briefing: string;
  variant: number;
  creditBonus: number;
  rewardItemId: string;
  rewardItemAmount: number;
  healthMultiplier: number;
  damageMultiplier: number;
}

// Each district has its own named contacts; three different contract styles
// are offered per rotation. No daily clock, random reroll, or paid refresh:
// claiming one bounty advances that district's board exactly once.
const targets: Record<DistrictId, readonly [string, string, string, string]> = {
  neonRow: ["Lowglow Jack", "Vex Relay", "Courier Zero", "Glass-Eye Miko"],
  rustYards: ["Breaker Holt", "Scrap Queen", "Axle Rook", "Brass Vandal"],
  underpassMarket: ["Broker Shade", "Ratchet Nine", "The Tollkeeper", "Silk Wire"],
  blacknetQuarter: ["Ghost Daemon", "Proxy Sable", "Null Operator", "Trace Widow"],
  helixWard: ["Dr. Stitch", "Biohazard V", "Suture Wolf", "Ward Sentinel"],
  glasslineDistrict: ["Agent Argon", "Silver Ledger", "Director Hex", "Mirror Guard"],
  redlineBlocks: ["Iron Riot", "Trigger Saint", "Road Wraith", "Red Widow"],
  skylineCore: ["Apex Warden", "Executive Null", "Skyline Reaper", "The Auditor"],
};

const kinds: readonly DistrictBountyKind[] = ["hunt", "intercept", "sabotage"];
const titles: Record<DistrictBountyKind, string> = {
  hunt: "Wanted target", intercept: "Convoy interception", sabotage: "Security takedown",
};
const objectiveText: Record<DistrictBountyKind, (name: string) => string> = {
  hunt: name => `Neutralize ${name} and collect the district bounty.`,
  intercept: name => `Intercept ${name} and secure the courier's supplies.`,
  sabotage: name => `Disable ${name}'s repair crew before the operation recovers.`,
};
const descriptions: Record<DistrictBountyKind, string> = {
  hunt: "Armored wanted target · aim or use penetration",
  intercept: "High-pressure pursuit · survive heavy counterfire",
  sabotage: "Repair crew · counter regeneration with interrupts or Overheat",
};
const healthFactors = { hunt: 1.3, intercept: 1.05, sabotage: 1.25 } as const;
const damageFactors = { hunt: 1.05, intercept: 1.3, sabotage: 0.95 } as const;
const creditFactors = { hunt: 0.65, intercept: 0.5, sabotage: 0.55 } as const;
const variants = { hunt: 1, intercept: 0, sabotage: 2 } as const;

export function districtBountyCycle(state: GameState, district: DistrictId) {
  return Math.max(0, Math.min(1000000, state.rpg.bountyCycles?.[district] ?? 0));
}

export function districtBountyOffers(state: GameState, mission: RpgMission): DistrictBountyOffer[] {
  if (!mission.sideGig || !state.districts[mission.district]?.unlocked) return [];
  const cycle = districtBountyCycle(state, mission.district);
  const supplies = districtSupplyItems(mission.district).filter(id => id !== "boss-data-key");
  if (!supplies.length) return [];
  const pressure = Math.min(0.25, Math.floor(cycle / 3) * 0.025);
  return kinds.map((_, slot) => {
    const kind = kinds[(slot + cycle) % kinds.length];
    const target = targets[mission.district][(cycle + slot) % targets[mission.district].length];
    return {
      id: `${mission.district}:${cycle}:${slot}`,
      district: mission.district, cycle, kind, target,
      title: `${titles[kind]}: ${target}`,
      objective: objectiveText[kind](target),
      briefing: descriptions[kind],
      variant: variants[kind],
      creditBonus: Math.round(mission.reward * (creditFactors[kind] + pressure)),
      rewardItemId: supplies[(cycle + slot) % supplies.length],
      rewardItemAmount: 2 + Math.floor(mission.act / 3),
      healthMultiplier: healthFactors[kind] + pressure,
      damageMultiplier: damageFactors[kind] + pressure * 0.6,
    };
  });
}

// Both acceptance and settlement use this canonical lookup. A client-supplied
// bounty ID cannot invent rewards, choose a locked district, or reroll terms.
export function districtBountyById(state: GameState, mission: RpgMission, id: string | undefined) {
  return id ? districtBountyOffers(state, mission).find(offer => offer.id === id) : undefined;
}
export function activeDistrictBounty(state: GameState, mission: RpgMission) {
  const bounty = state.rpg.active?.bounty;
  const offer = districtBountyById(state, mission, bounty?.id);
  return offer && bounty?.cycle === offer.cycle && state.rpg.active?.missionId === mission.id ? offer : undefined;
}
