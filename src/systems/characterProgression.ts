import { attributePointBudget, perkPointBudget } from "../data/characterBuild";
import { runnerXpNeeded } from "../data/campaignBalance";
import { addRunnerXp } from "./rpgState";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { GameState } from "../types";

export function totalCharacterXp(state: GameState) {
  let total = state.rpg.xp;
  for (let level = 1; level < state.rpg.level; level++) total += runnerXpNeeded(level);
  return total;
}

export function grantCharacterXp(state: GameState, amount: number) {
  const before = state.rpg.level;
  const levels = addRunnerXp(state.rpg, amount);
  if (levels) emitRewardPopupGroup(state, {
    title: `Runner level ${state.rpg.level}`,
    levelUps: [`Character level ${state.rpg.level}`],
    story: [`+${attributePointBudget(state.rpg.level) - attributePointBudget(before)} attribute points · +${perkPointBudget(state.rpg.level) - perkPointBudget(before)} perk points`],
  });
  return levels;
}

