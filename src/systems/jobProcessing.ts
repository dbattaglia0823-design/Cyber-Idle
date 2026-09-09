import type { GameState, JobContract } from "../types";

// Cancel retired contracts without charging costs or granting overdue rewards.
export function getJob(_id: string): JobContract | undefined { return undefined; }
export function availableJobsForFixer(_state: GameState, _fixerId: string): JobContract[] { return []; }
export function canAttemptJob(_state: GameState, _job: JobContract) { return false; }
export function startJob(state: GameState, _id: string, _now = Date.now()) { return state; }
export function stopJob(state: GameState) { return state.activeJob ? { ...state, activeJob: null } : state; }
export function processJobCompletion(state: GameState, _now = Date.now()) { return stopJob(state); }
export function jobRequirementDetails(_state: GameState, _job: JobContract) { return [{ text: "Choose a main job or local gig in Missions.", met: false }]; }
export function visibleJobRequirements(_job: JobContract): string[] { return []; }
export function jobRequirementMet(_state: GameState, _job: JobContract, _requirement: string) { return false; }
