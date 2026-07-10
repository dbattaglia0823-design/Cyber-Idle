import type { GameState, SimulationEfficiency } from "../types";

export function getSimulationEfficiency(state: GameState): SimulationEfficiency {
  return {
    skillXp: Math.min(1, state.simulationEfficiency.skillXp ?? 1),
    resources: Math.min(1, state.simulationEfficiency.resources ?? 1),
    credits: Math.min(1, state.simulationEfficiency.credits ?? 1),
    masteryXp: Math.min(1, state.simulationEfficiency.masteryXp ?? 0.75),
    rareDrops: Math.min(1, state.simulationEfficiency.rareDrops ?? 0.75),
    factionTrust: Math.min(1, state.simulationEfficiency.factionTrust ?? 0.75),
    heat: state.simulationEfficiency.heat ?? 1,
    neuralInstability: state.simulationEfficiency.neuralInstability ?? 1,
  };
}
