import { processActionCompletion } from "./actionProcessing";
import { processCrafting } from "./craftingProcessing";
import type { GameState } from "../types";

// A skill and background craft can share components. Process their completed
// cycles in timestamp order so both never spend the same last materials.
// A bounded batch avoids freezing a tab resumed after a long suspension.
export function processParallelWork(state: GameState, now = Date.now(), maxEvents = 150): GameState {
  if (!state.activeAction || !state.activeCraft) return processCrafting(processActionCompletion(state, now), now);
  let next = state;
  for (let i = 0; i < maxEvents; i++) {
    if (!next.activeAction || !next.activeCraft) {
      next = processCrafting(processActionCompletion(next, now), now);
      break;
    }
    const skillDue = next.activeAction.startedAt + next.activeAction.durationMs;
    const craftDue = next.activeCraft.startedAt + next.activeCraft.durationMs;
    if (Math.min(skillDue, craftDue) > now) break;
    if (skillDue <= craftDue) {
      const previous = next.activeAction;
      next = processActionCompletion(next, skillDue, 1);
      if (next.activeAction === previous) break;
    } else {
      const previous = next.activeCraft;
      next = processCrafting(next, craftDue, 1);
      if (next.activeCraft === previous) break;
    }
  }
  return next;
}
