import { getItem } from "../data/items";
import { meetsItemAttributeRequirement } from "./runnerProgression";
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
  if (state.rpg.active) return state;
  const preset = state.equipmentPresets[name];
  if (!preset) return state;
  const next = cloneState(state);
  const allowed = ([, id]: [string, string]) => {
    const item = getItem(id);
    return Boolean(item && (state.inventory[id] ?? 0) > 0 && meetsItemAttributeRequirement(state, item));
  };
  next.equippedGear = Object.fromEntries(Object.entries(preset.gear).filter(allowed));
  next.equippedCyberware = Object.fromEntries(Object.entries(preset.cyberware).filter(allowed));
  pushCategorizedLog(next, "World", `Loaded preset: ${name}. Only owned items meeting attribute requirements were equipped.`);
  return next;
}

export function deletePreset(state: GameState, name: string) {
  const next = cloneState(state);
  delete next.equipmentPresets[name];
  pushCategorizedLog(next, "World", `Deleted preset: ${name}.`);
  return next;
}
