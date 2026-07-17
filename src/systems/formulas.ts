import { calculateEstimatedKillTime, calculateInstabilityTier, calculatePlayerCombatStats } from "./balanceFormulas";
import { getDistrictMasteryXpForLevel, getXpForLevel } from "./xpCurves";
import type { GameState } from "../types";

export function xpForNextLevel(level: number) {
  return getXpForLevel(level, "skill");
}

export function xpForNextMastery(level: number) {
  return getXpForLevel(level, "mastery");
}

export function xpForNextDistrictMastery(level: number) {
  return getDistrictMasteryXpForLevel(level);
}

export function neuralInstabilityTier(value: number) {
  return calculateInstabilityTier(value);
}

export function clampRiskStat(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function totalLevel(state: GameState) {
  return Object.values(state.skills).reduce((sum, skill) => sum + skill.level, 0);
}

export function playerCombatStats(state: GameState) {
  return calculatePlayerCombatStats(state);
}

export function expectedKillTimeMs(state: GameState, enemyHp: number) {
  return calculateEstimatedKillTime(state, enemyHp);
}
