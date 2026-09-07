import { combatZones } from "../data/combat";
import { districtEvents } from "../data/districtEvents";
import { factions } from "../data/factions";
import { housingOptions } from "../data/housing";
import { jobs } from "../data/jobs";
import { operations } from "../data/operations";
import { ripperdocClinics } from "../data/ripperdocClinics";
import { ripperdocServices } from "../data/ripperdocs";
import { skillActions } from "../data/skills";
import { storyArcs } from "../data/storyArcs";
import { vehicles } from "../data/vehicles";
import { vendors } from "../data/vendors";
import { districtCombatZones, districtCompanions, districtFixers } from "./districtActivities";
import { meetsActionAccessRequirement } from "./actionAccess";
import type { DistrictId, GameState } from "../types";

export type DistrictActivityCategory =
  | "overview"
  | "actions"
  | "contracts"
  | "combat"
  | "operations"
  | "crafting"
  | "ripperdoc"
  | "market"
  | "housing"
  | "garage"
  | "blacknet"
  | "story";

export interface DistrictContentMap {
  actions: string[];
  contracts: string[];
  combatZones: string[];
  enemies: string[];
  operations: string[];
  fixers: string[];
  vendors: string[];
  ripperdocServices: string[];
  ripperdocClinics: string[];
  housing: string[];
  factions: string[];
  garage: string[];
  blacknet: string[];
  story: string[];
  companions: string[];
  events: string[];
}

export interface DistrictCategorySummary {
  id: DistrictActivityCategory;
  label: string;
  summary: string;
  available: number;
  locked: number;
  reward: string;
  warning?: string;
}

const blacknetDistricts: DistrictId[] = ["blacknetQuarter", "underpassMarket"];

export function districtContentMap(state: GameState, districtId: DistrictId): DistrictContentMap {
  const zoneList = districtCombatZones(districtId);
  const districtJobs = jobs.filter((job) => job.districtId === districtId);
  const localFactions = factions.filter((faction) => faction.districtInfluence.includes(districtId));
  return {
    actions: skillActions.filter((action) => action.districtReq === districtId).map((action) => action.id),
    contracts: districtJobs.map((job) => job.id),
    combatZones: zoneList.map((zone) => zone.id),
    enemies: zoneList.flatMap((zone) => zone.enemies.map((enemy) => enemy.id)),
    operations: operations.filter((operation) => operation.districtId === districtId).map((operation) => operation.id),
    fixers: districtFixers(districtId).map((fixer) => fixer.id),
    vendors: vendors.filter((vendor) => vendor.districtId === districtId).map((vendor) => vendor.id),
    ripperdocServices: ripperdocServices.filter((service) => service.districtId === districtId).map((service) => service.id),
    ripperdocClinics: ripperdocClinics.filter((clinic) => clinic.districtId === districtId).map((clinic) => clinic.id),
    housing: housingOptions.filter((housing) => housing.districtId === districtId).map((housing) => housing.id),
    factions: localFactions.map((faction) => faction.id),
    garage: vehicles.filter((vehicle) => vehicle.districtId === districtId).map((vehicle) => vehicle.id),
    blacknet: blacknetDistricts.includes(districtId)
      ? skillActions.filter((action) => action.districtReq === districtId && (action.skillId === "hacking" || action.tags?.includes("blacknet"))).map((action) => action.id)
      : [],
    story: storyArcs.filter((arc) => arc.districtId === districtId).map((arc) => arc.id),
    companions: districtCompanions(districtId).map((companion) => companion.id),
    events: districtEvents.filter((event) => event.districtId === districtId).map((event) => event.id),
  };
}

export function districtActivitySummaries(state: GameState, districtId: DistrictId): DistrictCategorySummary[] {
  const content = districtContentMap(state, districtId);
  const unlocked = Boolean(state.districts[districtId]?.unlocked);
  const threat = state.districtThreat[districtId]?.level ?? 0;
  const heat = state.resources.heat;
  const summaries: DistrictCategorySummary[] = [
    {
      id: "actions",
      label: "Actions",
      summary: `${content.actions.length} local skill loops`,
      available: skillActions.filter((action) => content.actions.includes(action.id) && meetsActionAccessRequirement(state, action) && unlocked).length,
      locked: skillActions.filter((action) => content.actions.includes(action.id) && (!unlocked || !meetsActionAccessRequirement(state, action))).length,
      reward: "XP, mastery, resources",
      warning: heat >= 75 && content.blacknet.length ? "High trace pressure" : undefined,
    },
    {
      id: "contracts",
      label: "Contracts",
      summary: `${content.contracts.length} contracts from ${content.fixers.length} fixers`,
      available: unlocked ? content.contracts.length : 0,
      locked: unlocked ? 0 : content.contracts.length,
      reward: "Credits, trust, reputation",
      warning: threat >= 75 ? "Threat hurts success" : undefined,
    },
    {
      id: "combat",
      label: "Combat",
      summary: `${content.enemies.length} enemies in ${content.combatZones.length} zones`,
      available: unlocked ? content.enemies.length : 0,
      locked: unlocked ? 0 : content.enemies.length,
      reward: "Combat XP, drops",
      warning: threat >= 75 ? "High threat rewards and risk" : undefined,
    },
    {
      id: "operations",
      label: "Operations",
      summary: `${content.operations.length} boss chains`,
      available: unlocked ? content.operations.length : 0,
      locked: unlocked ? 0 : content.operations.length,
      reward: "First clears, rare drops",
    },
    {
      id: "crafting",
      label: "Crafting",
      summary: `${content.actions.length ? "Local" : "Workshop"} fabrication bench`,
      available: unlocked ? 1 : 0,
      locked: unlocked ? 0 : 1,
      reward: "Gear, cyberware, tools",
    },
    {
      id: "ripperdoc",
      label: "Ripperdoc",
      summary: `${content.ripperdocClinics.length} clinics, ${content.ripperdocServices.length} services`,
      available: unlocked ? content.ripperdocClinics.length + content.ripperdocServices.length : 0,
      locked: unlocked ? 0 : content.ripperdocClinics.length + content.ripperdocServices.length,
      reward: "Cyberware, recovery",
    },
    {
      id: "market",
      label: "Market",
      summary: `${content.vendors.length} vendors${blacknetDistricts.includes(districtId) ? ", black market access" : ""}`,
      available: unlocked ? content.vendors.length + (blacknetDistricts.includes(districtId) ? 1 : 0) : 0,
      locked: unlocked ? 0 : content.vendors.length,
      reward: "Items, parts, resale",
      warning: heat >= 75 ? "Heat raises risk" : undefined,
    },
    {
      id: "housing",
      label: "Housing",
      summary: `${content.housing.length} residences`,
      available: unlocked ? content.housing.length : 0,
      locked: unlocked ? 0 : content.housing.length,
      reward: "Passive bonuses",
    },
    {
      id: "garage",
      label: "Garage",
      summary: `${content.garage.length} vehicle services`,
      available: unlocked ? content.garage.length : 0,
      locked: unlocked ? 0 : content.garage.length,
      reward: "Vehicles, tuning",
    },
    {
      id: "blacknet",
      label: "Blacknet",
      summary: `${content.blacknet.length} local network loops`,
      available: unlocked ? content.blacknet.length + (blacknetDistricts.includes(districtId) ? 1 : 0) : 0,
      locked: unlocked ? 0 : content.blacknet.length,
      reward: "Encrypted data, illicit sales",
      warning: heat >= 50 ? "Trace risk elevated" : undefined,
    },
    {
      id: "story",
      label: "Story",
      summary: `${content.story.length} arcs, ${content.events.length} event hooks`,
      available: content.story.length + content.events.length,
      locked: 0,
      reward: "Intel, unlocks, choices",
    },
  ];
  return summaries.filter((summary) => summary.available + summary.locked > 0 || categoryAlwaysVisible(districtId, summary.id));
}

function categoryAlwaysVisible(districtId: DistrictId, category: DistrictActivityCategory) {
  if (category === "blacknet") return blacknetDistricts.includes(districtId);
  return false;
}
