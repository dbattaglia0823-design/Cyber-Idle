import type { GameState } from "../types";

export function markSkillActionManual(state: GameState, actionId: string) {
  state.manualDiscovery.skillActions[actionId] = true;
}

export function markRecipeManual(state: GameState, recipeId: string) {
  state.manualDiscovery.recipes[recipeId] = true;
}

export function markEnemyManual(state: GameState, enemyId: string) {
  state.manualDiscovery.enemies[enemyId] = true;
}

export function markJobManual(state: GameState, jobId: string) {
  state.manualDiscovery.jobs[jobId] = true;
}
