import { districts } from "./districts";
import { combatZones } from "./combat";
import { housingOptions } from "./housing";
import { jobs } from "./jobs";
import { operations } from "./operations";
import { ripperdocServices } from "./ripperdocs";
import { skillActions } from "./skills";
import { storyArcs } from "./storyArcs";
import { vendors } from "./vendors";
import type { DistrictCompletionBreakdown, DistrictId, GameState } from "../types";

export const cityDistrictOrder: DistrictId[] = [
  "neonRow",
  "rustYards",
  "underpassMarket",
  "blacknetQuarter",
  "glasslineDistrict",
  "helixWard",
  "redlineBlocks",
  "skylineCore",
];

export function getDistrict(id: DistrictId) {
  return districts.find((district) => district.id === id);
}

export function districtCompletionPercent(state: GameState, districtId: DistrictId) {
  return calculateDistrictCompletion(state, districtId).total;
}

export function districtCompletionBreakdown(state: GameState, districtId: DistrictId): DistrictCompletionBreakdown {
  return calculateDistrictCompletion(state, districtId);
}

export function calculateDistrictCompletion(state: GameState, districtId: DistrictId): DistrictCompletionBreakdown {
  const districtUnlocked = Boolean(state.districts[districtId]?.unlocked);
  const combatEnemies = districtCombatEnemyIds(districtId);
  const districtActions = skillActions.filter((action) => action.districtReq === districtId);
  const districtJobs = jobs.filter((job) => job.districtId === districtId);
  const districtOperations = operations.filter((operation) => operation.districtId === districtId);
  const districtHousing = housingOptions.filter((housing) => housing.districtId === districtId);
  const districtServices = ripperdocServices.filter((service) => service.districtId === districtId);
  const districtVendors = vendors.filter((vendor) => vendor.districtId === districtId);
  const districtStory = storyArcs.filter((arc) => arc.districtId === districtId);
  const discoveries = state.districtDiscoveries[districtId] ?? {};
  const actionProgress = ratio(districtActions.filter((action) => districtUnlocked && state.manualDiscovery.skillActions[action.id]).length, districtActions.length);
  const categories = {
    combat: ratio(combatEnemies.filter((id) => districtUnlocked && (state.enemyLog[id]?.kills ?? 0) > 0).length, combatEnemies.length),
    jobs: ratio(districtJobs.filter((job) => districtUnlocked && state.manualDiscovery.jobs[job.id]).length, districtJobs.length),
    collection: ratio(districtUnlocked ? Object.keys(discoveries).filter((key) => key.startsWith("item:")).length : 0, districtVendors.length * 2),
    housing: ratio(districtHousing.filter((housing) => districtUnlocked && state.ownedHousing[housing.id]).length, districtHousing.length),
    factions: ratio((getDistrict(districtId)?.associatedFactions ?? []).filter((id) => districtUnlocked && (state.factions[id]?.reputation ?? 0) > 0).length, getDistrict(districtId)?.associatedFactions.length ?? 0),
    services: ratio(districtServices.filter((service) => districtUnlocked && state.ripperdocUnlocks[service.id]).length, districtServices.length),
    operations: ratio(districtOperations.filter((operation) => districtUnlocked && state.operationLogs[operation.id]?.firstClear).length, districtOperations.length),
    vendors: ratio(districtVendors.filter((vendor) => districtUnlocked && Object.values(state.vendors[vendor.id]?.purchases ?? {}).some((count) => count > 0)).length, districtVendors.length),
  };
  const storyProgress = ratio(districtUnlocked ? districtStory.reduce((sum, arc) => sum + Object.keys(state.storyArcs[arc.id]?.completedSteps ?? {}).length, 0) : 0, districtStory.reduce((sum, arc) => sum + arc.steps.length, 0));
  const totalInputs = [
    weighted(actionProgress, districtActions.length),
    weighted(categories.combat, combatEnemies.length),
    weighted(categories.jobs, districtJobs.length),
    weighted(categories.collection, Object.keys(discoveries).filter((key) => key.startsWith("item:")).length),
    weighted(categories.housing, districtHousing.length),
    weighted(categories.factions, getDistrict(districtId)?.associatedFactions.length ?? 0),
    weighted(categories.services, districtServices.length),
    weighted(categories.operations, districtOperations.length),
    weighted(categories.vendors, districtVendors.length),
    weighted(storyProgress, districtStory.length),
  ].filter((entry): entry is number => entry !== null);
  return {
    ...categories,
    total: totalInputs.length ? Math.round(totalInputs.reduce((sum, value) => sum + value, 0) / totalInputs.length) : 0,
  };
}

export function districtCompletionDebug(state: GameState, districtId: DistrictId) {
  const breakdown = calculateDistrictCompletion(state, districtId);
  return Object.entries(breakdown).map(([label, value]) => `${label}: ${value}%`);
}

function districtCombatEnemyIds(districtId: DistrictId) {
  const zoneIds: Partial<Record<DistrictId, string[]>> = {
    neonRow: ["neon-row"],
    rustYards: ["rust-yards"],
    underpassMarket: ["underpass-market"],
    blacknetQuarter: ["blacknet-quarter"],
    glasslineDistrict: ["glassline-district"],
    redlineBlocks: ["redline-blocks"],
  };
  return combatZones.filter((zone) => zoneIds[districtId]?.includes(zone.id)).flatMap((zone) => zone.enemies.map((enemy) => enemy.id));
}

function ratio(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

function weighted(value: number, hasContent: number) {
  if (hasContent <= 0 && value <= 0) return null;
  if (value <= 0) return null;
  return value;
}
