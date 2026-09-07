import { operations } from "../data/operations";
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
  const operationLogs = Object.values(state.operationLogs);
  const bossKills = Object.values(state.bossLogs).reduce((sum, log) => sum + log.kills, 0);
  if (operationLogs.some((log) => log.clears > 0)) unlockAchievement(state, "first-operation", "Clear First Operation");
  operations.forEach((operation) => {
    if (state.operationLogs[operation.id]?.firstClear) unlockAchievement(state, `clear-${operation.id}`, `Clear ${operation.name}`);
    if ((state.operationLogs[operation.id]?.clears ?? 0) >= 10) unlockAchievement(state, `clear-10-${operation.id}`, `${operation.name} x10`);
  });
  if (bossKills > 0) unlockAchievement(state, "first-boss", "Defeat First Boss");
  if (Object.values(state.ownedVehicles).some(Boolean)) unlockAchievement(state, "first-vehicle", "Own First Vehicle");
  if (Object.values(state.vehicleUpgradeLevels).some((level) => level >= 5)) unlockAchievement(state, "vehicle-plus-5", "Upgrade Vehicle to +5");
  if (Object.values(state.vehicleUpgradeLevels).some((level) => level >= 10)) unlockAchievement(state, "vehicle-plus-10", "Upgrade Vehicle to +10");
  if (Object.values(state.districtThreat).some((threat) => threat.level >= 100)) unlockAchievement(state, "district-lockdown", "Trigger District Lockdown");
}
