import type { GameState, OperationDefinition, OperationRoute, OperationRouteId } from "../types";

// Compatibility boundary for old saves and callers. Operations are retired;
// historical logs and the loot archive remain readable, never executable.
export function getOperation(_id: string): OperationDefinition | undefined { return undefined; }
export function canStartOperation(_state: GameState, _operation: OperationDefinition) { return false; }
export function operationRequirementDetails(_state: GameState, _operation: OperationDefinition) { return [{ text: "Choose a main job or local gig in Missions.", met: false }]; }
export function operationLoadoutReadiness(_state: GameState, _operation: OperationDefinition, _route?: OperationRoute) { return 0; }
export function operationRequirementMet(_state: GameState, _operation: OperationDefinition, _requirement: string) { return false; }
export function startOperation(state: GameState, _id: string, _route?: OperationRouteId, _now = Date.now()) { return state; }
export function stopOperation(state: GameState) { return state.activeOperation ? { ...state, activeOperation: null } : state; }
export function processOperation(state: GameState, _now = Date.now()) { return stopOperation(state); }
