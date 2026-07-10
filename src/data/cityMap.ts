import { districts } from "./districts";
import { combatZones } from "./combat";
import { housingOptions } from "./housing";
import { jobs } from "./jobs";
import { operations } from "./operations";
import { ripperdocServices } from "./ripperdocs";
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
  const breakdown = districtCompletionBreakdown(state, districtId);
  return breakdown.total;
}

export function districtCompletionBreakdown(state: GameState, districtId: DistrictId): DistrictCompletionBreakdown {
  const combatEnemies = districtCombatEnemyIds(districtId);
  const districtJobs = jobs.filter((job) => job.districtId === districtId);
  const districtOperations = operations.filter((operation) => operation.districtId === districtId);
  const districtHousing = housingOptions.filter((housing) => housing.districtId === districtId);
  const districtServices = ripperdocServices.filter((service) => service.districtId === districtId);
  const districtVendors = vendors.filter((vendor) => vendor.districtId === districtId);
  const discoveries = state.districtDiscoveries[districtId] ?? {};
  const categories = {
    combat: ratio(combatEnemies.filter((id) => (state.enemyLog[id]?.kills ?? 0) > 0).length, combatEnemies.length),
    jobs: ratio(districtJobs.filter((job) => state.manualDiscovery.jobs[job.id]).length, districtJobs.length),
    collection: ratio(Object.keys(discoveries).filter((key) => key.startsWith("item:")).length, Math.max(3, districtVendors.length * 2)),
    housing: ratio(districtHousing.filter((housing) => state.ownedHousing[housing.id]).length, districtHousing.length),
    factions: ratio((getDistrict(districtId)?.associatedFactions ?? []).filter((id) => (state.factions[id]?.reputation ?? 0) > 0).length, getDistrict(districtId)?.associatedFactions.length ?? 0),
    services: ratio(districtServices.filter((service) => state.ripperdocUnlocks[service.id]).length, districtServices.length),
    operations: ratio(districtOperations.filter((operation) => state.operationLogs[operation.id]?.firstClear).length, districtOperations.length),
    vendors: ratio(districtVendors.filter((vendor) => state.vendors[vendor.id]?.discovered).length, districtVendors.length),
  };
  return {
    ...categories,
    total: Math.round(Object.values(categories).reduce((sum, value) => sum + value, 0) / Object.keys(categories).length),
  };
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
  if (total <= 0) return 100;
  return Math.min(100, Math.round((done / total) * 100));
}
