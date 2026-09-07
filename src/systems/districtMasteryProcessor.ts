import { districtMasteryMilestones } from "../data/districtMastery";
import { xpForNextDistrictMastery } from "./formulas";
import { pushCategorizedLog } from "./gameState";
import type { DistrictId, GameState } from "../types";

export type DistrictMasterySource = "action" | "combat" | "job" | "operation" | "craft" | "story" | "standing";

const sourceMultipliers: Record<DistrictMasterySource, number> = {
  action: 1,
  combat: 1.1,
  job: 2.4,
  operation: 8,
  craft: 0.8,
  story: 6,
  standing: 0.35,
};

export function addDistrictMasteryXp(state: GameState, districtId: DistrictId | null | undefined, source: DistrictMasterySource, baseXp: number) {
  if (!districtId) return { levelsGained: 0, xpGained: 0, milestones: [] as string[] };
  const mastery = state.districtMastery[districtId] ?? { level: 1, xp: 0, milestones: {} };
  const xpGained = Math.max(1, Math.round(baseXp * sourceMultipliers[source]));
  mastery.xp += xpGained;
  let levelsGained = 0;
  while (mastery.level < 99 && mastery.xp >= xpForNextDistrictMastery(mastery.level)) {
    mastery.xp -= xpForNextDistrictMastery(mastery.level);
    mastery.level += 1;
    levelsGained += 1;
  }
  const milestones = unlockDistrictMasteryMilestones(state, districtId, mastery.level, mastery.milestones);
  state.districtMastery[districtId] = mastery;
  if (levelsGained) pushCategorizedLog(state, "World", `${districtLabel(districtId)} mastery reached level ${mastery.level}.`);
  milestones.forEach((name) => pushCategorizedLog(state, "World", `${districtLabel(districtId)} mastery milestone unlocked: ${name}.`));
  return { levelsGained, xpGained, milestones };
}

export function districtMasteryRewardBonus(state: GameState, districtId: DistrictId | null | undefined) {
  if (!districtId) return 0;
  const mastery = state.districtMastery[districtId];
  if (!mastery) return 0;
  const levelBonus = Math.floor(mastery.level / 10) * 0.01;
  const milestoneBonus = mastery.milestones[5] ? 0.02 : 0;
  return levelBonus + milestoneBonus;
}

export function districtMasteryDropBonus(state: GameState, districtId: DistrictId | null | undefined) {
  if (!districtId) return 0;
  const mastery = state.districtMastery[districtId];
  if (!mastery) return 0;
  return (mastery.milestones[35] ? 0.02 : 0) + Math.floor(mastery.level / 25) * 0.005;
}

export function hasDistrictMasteryUnlock(state: GameState, districtId: DistrictId, unlockKey: string) {
  const mastery = state.districtMastery[districtId];
  if (!mastery) return false;
  return districtMasteryMilestones.some((milestone) => milestone.unlockKey === unlockKey && mastery.milestones[milestone.level]);
}

function unlockDistrictMasteryMilestones(state: GameState, districtId: DistrictId, level: number, claimed: Record<number, boolean>) {
  const names: string[] = [];
  districtMasteryMilestones.forEach((milestone) => {
    if (level < milestone.level || claimed[milestone.level]) return;
    claimed[milestone.level] = true;
    state.unlocks[`districtMastery:${districtId}:${milestone.unlockKey}`] = true;
    names.push(milestone.name);
  });
  return names;
}

function districtLabel(districtId: DistrictId) {
  return districtId.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
