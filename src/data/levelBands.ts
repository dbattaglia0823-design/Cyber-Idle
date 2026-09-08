import { rpgMissions } from "./rpgCampaign";
import type { DistrictId, GameState, SkillId } from "../types";

export const MAX_MAIN_SKILL_LEVEL = 150;

export const majorUnlockLevels = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150] as const;

type DistrictLevelBand = {
  min: number;
  max: number;
  entryLevel: number;
  recommendedSkills: Partial<Record<SkillId, number>>;
};

export const districtLevelBands: Record<DistrictId, DistrictLevelBand> = {
  neonRow: {
    min: 1,
    max: 20,
    entryLevel: 1,
    recommendedSkills: { scavenging: 1, hacking: 1, cyberware: 1, medical: 1, combat: 1 },
  },
  rustYards: {
    min: 20,
    max: 40,
    entryLevel: 20,
    recommendedSkills: { scavenging: 20, vehicleTuning: 20, combat: 20 },
  },
  underpassMarket: {
    min: 41,
    max: 60,
    entryLevel: 40,
    recommendedSkills: { hacking: 40 },
  },
  blacknetQuarter: {
    min: 61,
    max: 80,
    entryLevel: 60,
    recommendedSkills: { hacking: 60, vehicleTuning: 60 },
  },
  helixWard: {
    min: 81,
    max: 100,
    entryLevel: 80,
    recommendedSkills: { medical: 80, cyberware: 80 },
  },
  glasslineDistrict: {
    min: 101,
    max: 120,
    entryLevel: 100,
    recommendedSkills: { cyberware: 100, hacking: 100, medical: 100 },
  },
  redlineBlocks: {
    min: 121,
    max: 140,
    entryLevel: 120,
    recommendedSkills: { combat: 120, hacking: 120 },
  },
  skylineCore: {
    min: 141,
    max: 150,
    entryLevel: 140,
    recommendedSkills: { hacking: 140, cyberware: 140, vehicleTuning: 140, combat: 140 },
  },
};

export function districtLevelBandLabel(districtId: DistrictId) {
  const band = districtLevelBands[districtId];
  return `Level ${band.min}-${band.max}`;
}

export function districtEntryRequirementText(districtId: DistrictId) {
  const index = rpgMissions.findIndex(mission => mission.district === districtId);
  return index <= 0 ? "Available at start" : "Complete main job: " + rpgMissions[index - 1].title;
}

export function hasAnyMainSkillLevel(state: GameState, level: number) {
  return Object.values(state.skills).some((skill) => skill.level >= level);
}

export function nextMajorUnlockLevel(level: number) {
  return majorUnlockLevels.find((entry) => entry > level) ?? MAX_MAIN_SKILL_LEVEL;
}
