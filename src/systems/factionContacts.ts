import { fixers } from "../data/fixers";
import type { FactionId, GameState } from "../types";

export function factionIdForFixer(fixerId: string): FactionId | undefined {
  return fixers.find((fixer) => fixer.id === fixerId)?.factionId;
}

export function fixerFactionReputation(state: GameState, fixerId: string) {
  const factionId = factionIdForFixer(fixerId);
  return factionId ? state.factions[factionId]?.reputation ?? 0 : 0;
}

export function fixerFactionRank(state: GameState, fixerId: string) {
  return Math.max(0, Math.min(10, Math.floor(fixerFactionReputation(state, fixerId) / 10)));
}

export function addFixerFactionReputation(state: GameState, fixerId: string, amount: number) {
  const factionId = factionIdForFixer(fixerId);
  if (!factionId) return;
  state.factions[factionId].reputation += amount;
}

export function totalFactionReputation(state: GameState) {
  return Object.values(state.factions).reduce((sum, faction) => sum + Math.max(0, faction.reputation), 0);
}

export function completedFactionContracts(state: GameState, factionId: FactionId) {
  const fixerIds = fixers.filter((fixer) => fixer.factionId === factionId).map((fixer) => fixer.id);
  return fixerIds.reduce((sum, fixerId) => sum + (state.marketStatistics.contractsCompletedByFixer[fixerId] ?? 0), 0);
}
