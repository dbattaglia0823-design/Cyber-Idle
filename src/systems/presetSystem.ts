import { cloneState, pushCategorizedLog } from "./gameState";
import type { GameState } from "../types";

export function savePreset(state: GameState, name: string) {
  const next = cloneState(state);
  next.equipmentPresets[name] = {
    name,
    gear: { ...state.equippedGear },
    cyberware: { ...state.equippedCyberware },
  };
  pushCategorizedLog(next, "World", `Saved preset: ${name}.`);
  return next;
}

export function loadPreset(state: GameState, name: string) {
  const preset = state.equipmentPresets[name];
  if (!preset) return state;
  const next = cloneState(state);
  next.equippedGear = { ...preset.gear };
  next.equippedCyberware = { ...preset.cyberware };
  pushCategorizedLog(next, "World", `Loaded preset: ${name}. Missing item checks will become stricter as item instances expand.`);
  return next;
}

export function deletePreset(state: GameState, name: string) {
  const next = cloneState(state);
  delete next.equipmentPresets[name];
  pushCategorizedLog(next, "World", `Deleted preset: ${name}.`);
  return next;
}
