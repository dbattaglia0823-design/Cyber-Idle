import { rpgMissions } from "../data/rpgCampaign";
import { pushCategorizedLog } from "./gameState";
import { triggerUnlockEventForDistrict } from "./districtProgression";
import { districtLevelBands, hasAnyMainSkillLevel } from "../data/levelBands";
import type { DistrictId, GameState } from "../types";

export function updateWorldUnlocks(state: GameState) {
  rpgMissions.forEach((mission, index) => syncDistrictUnlock(state, mission.district, index === 0 || Boolean(state.rpg.completed[rpgMissions[index - 1].id])));

  if (state.districts.blacknetQuarter?.unlocked) unlockCompanion(state, "nyra-vale");
  if (state.districts.rustYards?.unlocked) unlockCompanion(state, "dex-riven");
  if (state.skills.combat.level >= 5 || state.districts.redlineBlocks?.unlocked) unlockCompanion(state, "mara-voss");
  if (state.districts.helixWard?.unlocked) unlockCompanion(state, "iris-kade");
}

function syncDistrictUnlock(state: GameState, id: DistrictId, condition: boolean) {
  const district = state.districts[id];
  if (!district) return;
  if (condition || district.unlocked) {
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
  const index = rpgMissions.findIndex(mission => mission.district === id);
  if (index <= 0) return 100;
  const completed = rpgMissions.slice(0, index).filter(mission => state.rpg.completed[mission.id]).length;
  return Math.min(99, Math.floor(completed / index * 100));
}

function unlockCompanion(state: GameState, id: string) {
  const companion = state.companions[id];
  if (!companion || companion.unlocked) return;
  companion.unlocked = true;
  companion.relationship = Math.max(1, companion.relationship);
  pushCategorizedLog(state, "World", `Companion contact unlocked: ${id}.`);
}
