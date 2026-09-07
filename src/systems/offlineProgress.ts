import { processActionCompletion, getSkillAction } from "./actionProcessing";
import { processCrafting, getRecipe } from "./craftingProcessing";
import { processCombat, getEnemy } from "./combatProcessing";
import { processJobCompletion, getJob } from "./jobProcessing";
import { processOperation, getOperation } from "./operationProcessor";
import { processBlackMarketListings } from "./blackMarketSystem";
import { cloneState, pushCategorizedLog } from "./gameState";
import { getActiveModifiers } from "./modifiers";
import { applyPassiveRecovery, unlockAutoHeal } from "./healthSystem";
import { updateWorldUnlocks } from "./worldUnlocks";
import { updateStoryProgress } from "./storySystem";
import { emitRewardPopupGroup } from "./rewardPopups";
import { getTotalXpForLevel } from "./xpCurves";
import type { GameState, OfflineRecap, ResourceId } from "../types";

export const OFFLINE_CAP_MS = 12 * 60 * 60 * 1000;

export function applyOfflineProgress(state: GameState, now = Date.now()) {
  const cap = Math.max(OFFLINE_CAP_MS, getActiveModifiers(state).offlineProgressCapHours * 3600000);
  const elapsed = Math.min(cap, Math.max(0, now - state.lastSavedAt));
  let next = cloneState(state);
  if (elapsed < 1000) return next;
  const action = state.activeAction && getSkillAction(state.activeAction.actionId);
  const recipe = state.activeCraft && getRecipe(state.activeCraft.recipeId);
  const job = state.activeJob && getJob(state.activeJob.jobId);
  const enemy = state.currentCombat && getEnemy(state.currentCombat.enemyId);
  const operation = state.activeOperation && getOperation(state.activeOperation.operationId);
  const name = state.rpg.active ? "Field mission paused" : action?.name || recipe?.name || job?.name || enemy?.name || operation?.name || "Recovery and market sales";
  // Move the capped simulation window forward without losing partial progress
  // or replaying discarded hours when the next live tick arrives.
  const shift = now - elapsed - state.lastSavedAt;
  for (const activity of [next.activeAction, next.activeCraft, next.activeJob, next.activeOperation]) {
    if (activity) activity.startedAt += shift;
  }
  if (next.currentCombat) {
    const combat = next.currentCombat;
    combat.startedAt += shift;
    for (const key of ["nextPlayerAttackAt", "nextEnemyAttackAt", "respawnAt", "lastPlayerAttackAt", "lastEnemyAttackAt"] as const) {
      if (combat[key] !== undefined) combat[key] += shift;
    }
  }
  unlockAutoHeal(next);
  let craftCompletions = 0;
  let operationCompletions = 0;
  // Drain the live processors' bounded batches, preserving costs, drops, healing,
  // death, discoveries and unlocks exactly as in online play.
  while (true) {
    if (next.activeAction) {
      const before = next.activeAction.startedAt;
      next = processActionCompletion(next, now);
      if (next.activeAction?.startedAt === before) break;
    } else if (next.activeCraft) {
      const before = next.activeCraft.startedAt;
      const countBefore = recipe ? owned(next, recipe.outputItemId) : 0;
      next = processCrafting(next, now);
      if (recipe) craftCompletions += (owned(next, recipe.outputItemId) - countBefore) / recipe.outputQuantity;
      if (next.activeCraft?.startedAt === before) break;
    } else if (next.activeJob) {
      const before = next.activeJob.startedAt;
      next = processJobCompletion(next, now);
      if (next.activeJob?.startedAt === before) break;
    } else if (next.currentCombat) {
      const before = JSON.stringify(next.currentCombat);
      next = processCombat(next, now);
      if (JSON.stringify(next.currentCombat) === before) break;
    } else if (next.activeOperation) {
      next = processOperation(next, now);
      if (next.activeOperation) break;
      operationCompletions += 1;
    } else break;
  }
  if (!enemy && !operation) applyPassiveRecovery(next, elapsed);
  next = processBlackMarketListings(next, now);
  updateWorldUnlocks(next);
  next = updateStoryProgress(next);
  const completions = action
    ? (next.marketStatistics.skillActionsCompletedBySkill[action.skillId] ?? 0) - (state.marketStatistics.skillActionsCompletedBySkill[action.skillId] ?? 0)
    : recipe ? craftCompletions
    : enemy ? (next.enemyLog[enemy.id]?.kills ?? 0) - (state.enemyLog[enemy.id]?.kills ?? 0)
    : job ? (next.fixerTrust[job.fixerId]?.completedJobs ?? 0) - (state.fixerTrust[job.fixerId]?.completedJobs ?? 0)
    : operation ? operationCompletions : next.blackMarketCompletedSales.length - state.blackMarketCompletedSales.length;
  const itemsGained = Object.fromEntries(Object.entries(next.inventory).map(([id, n]) => [id, n - (state.inventory[id] ?? 0)]).filter(([, n]) => Number(n) > 0));
  const recap: OfflineRecap = {
    timeAwayMs: elapsed, actionName: name, completions,
    xpGained: totalSkillXp(next) - totalSkillXp(state),
    levelsGained: sumLevels(next.skills) - sumLevels(state.skills),
    masteryXpGained: totalMasteryXp(next) - totalMasteryXp(state),
    masteryLevelsGained: sumLevels(next.actionMastery) - sumLevels(state.actionMastery),
    resourcesGained: Object.fromEntries(Object.keys(next.resources).map(id => [id, next.resources[id as ResourceId] - state.resources[id as ResourceId]]).filter(([, n]) => n !== 0)),
    itemsGained,
    heatGained: next.resources.heat - state.resources.heat,
    neuralInstabilityGained: 0,
    message: next.rpg.active ? "Your field mission is waiting for your next decision. No combat turns elapsed while away."
      : next.health.lifeState === "downed" ? "You were downed. Combat stopped; free Basic Recovery is available."
      : (action || recipe || job) && !next.activeAction && !next.activeCraft && !next.activeJob ? "Activity stopped when its requirements could no longer be met."
      : `Progressed using normal gameplay rules. Offline time is capped at ${Math.round(cap / 3600000)} hours.`,
  };
  next.offlineRecap = recap;
  next.lastSavedAt = now;
  next.rewardPopups = [];
  pushCategorizedLog(next, "World", `Offline: ${name}, ${completions} completions. ${recap.message}`);
  emitRewardPopupGroup(next, { title: "Offline Progress Complete", category: "story", resources: recap.resourcesGained, items: itemsGained, story: [`${completions} completions`, recap.message ?? ""], durationMs: 5200 });
  return next;
}

function owned(state: GameState, id: string) { return id in state.resources ? state.resources[id as ResourceId] : state.inventory[id] ?? 0; }
function sumLevels(values: Record<string, { level: number }>) { return Object.values(values).reduce((sum, value) => sum + value.level - 1, 0); }
function totalSkillXp(state: GameState) { return Object.values(state.skills).reduce((sum, skill) => sum + getTotalXpForLevel(skill.level, "skill") + skill.xp, 0); }
function totalMasteryXp(state: GameState) { return Object.values(state.actionMastery).reduce((sum, mastery) => sum + getTotalXpForLevel(mastery.level, "mastery") + mastery.xp, 0); }
