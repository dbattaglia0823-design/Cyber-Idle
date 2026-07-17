import { combatZones } from "../data/combat";
import { companions } from "../data/companions";
import { fixers } from "../data/fixers";
import { housingOptions } from "../data/housing";
import { jobs } from "../data/jobs";
import { operations } from "../data/operations";
import { ripperdocServices } from "../data/ripperdocs";
import { skillActions } from "../data/skills";
import type { DistrictId } from "../types";

const combatZoneIds: Partial<Record<DistrictId, string[]>> = {
  neonRow: ["neon-row"],
  rustYards: ["rust-yards"],
  underpassMarket: ["underpass-market"],
  blacknetQuarter: ["blacknet-quarter"],
  glasslineDistrict: ["glassline-district"],
  redlineBlocks: ["redline-blocks"],
};

export function districtSkillActions(districtId: DistrictId) {
  return skillActions
    .filter((action) => action.districtReq === districtId)
    .sort((a, b) => a.levelReq - b.levelReq || a.durationMs - b.durationMs || a.name.localeCompare(b.name));
}

export function districtJobs(districtId: DistrictId) {
  return jobs
    .filter((job) => job.districtId === districtId)
    .sort((a, b) => contentRequirementScore(a.requirements) - contentRequirementScore(b.requirements) || a.durationMs - b.durationMs || a.name.localeCompare(b.name));
}

export function districtOperations(districtId: DistrictId) {
  return operations
    .filter((operation) => operation.districtId === districtId)
    .sort((a, b) => contentRequirementScore(a.unlockRequirements) - contentRequirementScore(b.unlockRequirements) || a.stages.length - b.stages.length || a.name.localeCompare(b.name));
}

export function districtHousing(districtId: DistrictId) {
  return housingOptions
    .filter((housing) => housing.districtId === districtId)
    .sort((a, b) => a.cost - b.cost || contentRequirementScore(a.unlockRequirements) - contentRequirementScore(b.unlockRequirements) || a.name.localeCompare(b.name));
}

export function districtRipperdocs(districtId: DistrictId) {
  return ripperdocServices
    .filter((service) => service.districtId === districtId && service.neuralInstabilityChange === undefined && service.serviceType !== "stabilizer" && service.serviceType !== "loadReduction")
    .sort((a, b) => serviceTier(a) - serviceTier(b) || contentRequirementScore(a.requirements) - contentRequirementScore(b.requirements) || a.name.localeCompare(b.name));
}

export function districtFixers(districtId: DistrictId) {
  return fixers.filter((fixer) => fixer.districtId === districtId);
}

export function districtCompanions(districtId: DistrictId) {
  return companions.filter((companion) => companion.districtId === districtId);
}

export function districtCombatZones(districtId: DistrictId) {
  return combatZones
    .filter((zone) => combatZoneIds[districtId]?.includes(zone.id))
    .map((zone) => ({
      ...zone,
      enemies: [...zone.enemies].sort((a, b) => a.xpReward - b.xpReward || a.hp + a.damage - (b.hp + b.damage) || a.name.localeCompare(b.name)),
    }));
}

function contentRequirementScore(requirements: string[]) {
  const numbers = requirements
    .flatMap((requirement) => [...requirement.matchAll(/level\s+(\d+)|rank\s+(\d+)|trust\s+(\d+)|reputation\s+(\d+)/gi)])
    .map((match) => Number(match[1] ?? match[2] ?? match[3] ?? match[4] ?? 0))
    .filter(Boolean);
  return numbers.length ? Math.max(...numbers) : 0;
}

function serviceTier(service: { serviceType: string; cost: { credits?: number } }) {
  const order = ["treatment", "stabilizer", "install", "remove", "upgrade", "calibration", "slotOptimization", "loadReduction", "prototypeInstall", "unique"];
  return (order.indexOf(service.serviceType) + 1 || order.length + 1) * 100000 + (service.cost.credits ?? 0);
}
