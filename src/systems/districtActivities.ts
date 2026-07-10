import { combatZones } from "../data/combat";
import { companions } from "../data/companions";
import { fixers } from "../data/fixers";
import { housingOptions } from "../data/housing";
import { jobs } from "../data/jobs";
import { operations } from "../data/operations";
import { ripperdocServices } from "../data/ripperdocs";
import { skillActions } from "../data/skills";
import type { DistrictId } from "../types";

const actionDistrictNames: Record<DistrictId, string[]> = {
  neonRow: ["Lowglow", "Chromeline", "Suture Row", "Backroom Clinic", "Lens Pit"],
  rustYards: ["Brakeyard", "Rust Haulers"],
  glasslineDistrict: ["Glasshook", "Glassline Archives"],
  underpassMarket: ["Underpass Stalls"],
  blacknetQuarter: ["Null Market", "Blacknet Relay"],
  helixWard: ["Backroom Clinic", "Suture Row", "Helix Recovery"],
  redlineBlocks: ["Redline Armory"],
  skylineCore: ["Skyline Labs"],
};

const combatZoneIds: Partial<Record<DistrictId, string[]>> = {
  neonRow: ["neon-row"],
  rustYards: ["rust-yards"],
  underpassMarket: ["underpass-market"],
  blacknetQuarter: ["blacknet-quarter"],
  glasslineDistrict: ["glassline-district"],
  redlineBlocks: ["redline-blocks"],
};

export function districtSkillActions(districtId: DistrictId) {
  return skillActions.filter((action) => actionDistrictNames[districtId]?.includes(action.district));
}

export function districtJobs(districtId: DistrictId) {
  return jobs.filter((job) => job.districtId === districtId);
}

export function districtOperations(districtId: DistrictId) {
  return operations.filter((operation) => operation.districtId === districtId);
}

export function districtHousing(districtId: DistrictId) {
  return housingOptions.filter((housing) => housing.districtId === districtId);
}

export function districtRipperdocs(districtId: DistrictId) {
  return ripperdocServices.filter((service) => service.districtId === districtId);
}

export function districtFixers(districtId: DistrictId) {
  return fixers.filter((fixer) => fixer.districtId === districtId);
}

export function districtCompanions(districtId: DistrictId) {
  return companions.filter((companion) => companion.districtId === districtId);
}

export function districtCombatZones(districtId: DistrictId) {
  return combatZones.filter((zone) => combatZoneIds[districtId]?.includes(zone.id));
}
