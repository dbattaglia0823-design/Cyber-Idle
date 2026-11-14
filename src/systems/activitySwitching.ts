import { operations } from "../data/operations";
import { jobs } from "../data/jobs";
import { skillActions } from "../data/skills";
import { combatZones } from "../data/combat";
import { pushCategorizedLog } from "./gameState";
import { emitSummaryPopup } from "./rewardPopups";
import type { GameState } from "../types";

export function clearActiveActivityForSwitch(state: GameState, next: GameState, startedName: string) {
  const stoppedName = activeActivityName(state);
  next.activeAction = null;
  // Crafting is a separate background lane. Switching foreground activities never stops it.
  next.activeJob = null;
  next.currentCombat = null;
  next.activeOperation = null;
  next.rpg.active = null;
  if (next.idleQueue.enabled) { next.idleQueue.enabled = false; next.idleQueue.message = "Queue paused: manual activity selected."; }
  if (stoppedName && stoppedName !== startedName) {
    pushCategorizedLog(next, "World", `Stopped ${stoppedName}. Started ${startedName}.`);
    emitSummaryPopup(next, `Started ${startedName}`, [`Stopped ${stoppedName}`], "story");
  } else {
    pushCategorizedLog(next, "World", `Started ${startedName}.`);
  }
}

function activeActivityName(state: GameState) {
  if (state.rpg?.active) return "field mission (progress reset)";
  if (state.activeAction) return skillActions.find((action) => action.id === state.activeAction?.actionId)?.name ?? "active action";
  if (state.activeJob) return jobs.find((job) => job.id === state.activeJob?.jobId)?.name ?? "active contract";
  if (state.currentCombat) return combatZones.flatMap((zone) => zone.enemies).find((enemy) => enemy.id === state.currentCombat?.enemyId)?.name ?? "combat";
  if (state.activeOperation) return operations.find((operation) => operation.id === state.activeOperation?.operationId)?.name ?? "operation";
  return "";
}
