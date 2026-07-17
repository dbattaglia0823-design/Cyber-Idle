import { calculateSimulationEfficiency } from "./balanceFormulas";
import type { GameState, SimulationEfficiency } from "../types";

export function getSimulationEfficiency(state: GameState): SimulationEfficiency {
  return calculateSimulationEfficiency(state);
}
