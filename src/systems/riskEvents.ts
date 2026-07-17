import { clampRiskStat } from "./formulas";
import { pushCategorizedLog } from "./gameState";
import { effectiveNeuralInstability } from "./itemFormulas";
import type { GameState } from "../types";

export function heatTier(value: number) {
  if (value >= 100) return "Lockdown";
  if (value >= 75) return "Hunted";
  if (value >= 50) return "Wanted";
  if (value >= 25) return "Watched";
  return "Low";
}

export function neuralInstabilityTierName(value: number) {
  if (value >= 100) return "Overload";
  if (value >= 75) return "Critical";
  if (value >= 50) return "Unstable";
  if (value >= 25) return "Stressed";
  return "Stable";
}

export function applyRiskEvents(state: GameState) {
  if (state.resources.heat >= 100) {
    state.resources.heat = 80;
    state.resources.credits = Math.max(0, state.resources.credits - 50);
    pushCategorizedLog(state, "Warning", "Heat Lockdown triggered. Enforcement pressure cost 50 Credits and Heat dropped to 80.");
  } else {
    state.resources.heat = clampRiskStat(state.resources.heat);
  }

  if (effectiveNeuralInstability(state) >= 100) {
    state.resources.reputation = Math.max(0, state.resources.reputation - 5);
    state.neuralInstability = 0;
    pushCategorizedLog(state, "Warning", "Neural Instability Overload triggered. Public glitches cost 5 Reputation. Reduce equipped cyberware load to stabilize.");
  } else {
    state.neuralInstability = 0;
  }
}
