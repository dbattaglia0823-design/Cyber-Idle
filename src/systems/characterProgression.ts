import { MAX_CHARACTER_LEVEL, attributePointBudget, perkPointBudget } from "../data/characterBuild";
import { runnerTrainingLevelMs, runnerXpNeeded } from "../data/campaignBalance";
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

// Only completed eligible activity time counts toward runner XP (e.g. crafting and combat).
// Repeatable skill actions do not call this helper. Carry fractional XP through saves.
export function grantActivityCharacterXp(state: GameState, elapsedMs: number) {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0 || state.rpg.level >= MAX_CHARACTER_LEVEL) return;
  let remaining = elapsedMs;
  while (remaining > 0 && state.rpg.level < MAX_CHARACTER_LEVEL) {
    const needed = runnerXpNeeded(state.rpg.level);
    const fraction = state.rpg.activityXpFraction ?? 0;
    const timeToLevel = (needed - state.rpg.xp - fraction) / needed * runnerTrainingLevelMs;
    const spent = Math.min(remaining, timeToLevel);
    const earned = fraction + spent / runnerTrainingLevelMs * needed;
    const whole = Math.floor(earned + 1e-9);
    state.rpg.activityXpFraction = Math.max(0, earned - whole);
    grantCharacterXp(state, whole);
    remaining = Math.max(0, remaining - spent);
  }
}
