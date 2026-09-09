import { rpgMissions, rpgSideGigs } from "../data/rpgCampaign";
import { pushCategorizedLog } from "./gameState";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { GameState } from "../types";

export function unlockAchievement(state: GameState, id: string, name: string) {
  if (state.achievements[id]) return;
  state.achievements[id] = true;
  pushCategorizedLog(state, "World", `Achievement unlocked: ${name}.`);
  emitRewardPopupGroup(state, {
    title: "Achievement Unlocked",
    category: "achievement",
    achievements: [name],
    durationMs: 5200,
  });
}

export function updateOperationAchievements(state: GameState) {
  for (const mission of rpgMissions) if (state.rpg.completed[mission.id]) unlockAchievement(state, `mission-${mission.id}`, `Complete ${mission.title}`);
  for (const gig of rpgSideGigs) if ((state.rpg.completed[gig.id]?.clears ?? 0) >= 10) unlockAchievement(state, `gig-10-${gig.id}`, `${gig.title} x10`);
  if (Object.values(state.ownedVehicles).some(Boolean)) unlockAchievement(state, "first-vehicle", "Own First Vehicle");
  if (Object.values(state.vehicleUpgradeLevels).some((level) => level >= 5)) unlockAchievement(state, "vehicle-plus-5", "Upgrade Vehicle to +5");
  if (Object.values(state.vehicleUpgradeLevels).some((level) => level >= 10)) unlockAchievement(state, "vehicle-plus-10", "Upgrade Vehicle to +10");
  if (Object.values(state.districtThreat).some((threat) => threat.level >= 100)) unlockAchievement(state, "district-lockdown", "Trigger District Lockdown");
}
