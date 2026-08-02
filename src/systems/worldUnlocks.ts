import { pushCategorizedLog } from "./gameState";
import { triggerUnlockEventForDistrict } from "./districtProgression";
import { districtLevelBands, hasAnyMainSkillLevel } from "../data/levelBands";
import type { DistrictId, GameState } from "../types";

export function updateWorldUnlocks(state: GameState) {
  syncDistrictUnlock(state, "neonRow", true);
  syncDistrictUnlock(state, "rustYards", hasAnyMainSkillLevel(state, 20));
  syncDistrictUnlock(state, "underpassMarket", hasAnyMainSkillLevel(state, 40));
  syncDistrictUnlock(state, "blacknetQuarter", hasAnyMainSkillLevel(state, 60));
  syncDistrictUnlock(state, "helixWard", hasAnyMainSkillLevel(state, 80));
  syncDistrictUnlock(state, "glasslineDistrict", hasAnyMainSkillLevel(state, 100));
  syncDistrictUnlock(state, "redlineBlocks", hasAnyMainSkillLevel(state, 120));
  syncDistrictUnlock(state, "skylineCore", hasAnyMainSkillLevel(state, 140));

}

function syncDistrictUnlock(state: GameState, id: DistrictId, condition: boolean) {
  const district = state.districts[id];
  if (!district) return;
  if (condition) {
    if (!district.unlocked) {
      district.unlocked = true;
      pushCategorizedLog(state, "World", `District unlocked: ${id}.`);
      triggerUnlockEventForDistrict(state, id);
    }
    district.unlockProgress = 100;
    return;
  }
  district.unlocked = false;
  district.unlockProgress = districtUnlockProgress(state, id);
}

function districtUnlockProgress(state: GameState, id: DistrictId) {
  const requiredLevel = districtLevelBands[id].entryLevel;
  if (requiredLevel <= 1) return 100;
  const highestLevel = Math.max(...Object.values(state.skills).map((skill) => skill.level));
  return Math.max(0, Math.min(99, Math.floor((highestLevel / requiredLevel) * 100)));
}
