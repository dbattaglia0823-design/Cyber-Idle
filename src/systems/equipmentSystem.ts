import { getItem } from "../data/items";
import { addItem, removeItem } from "./collectionSystem";
import { cloneState, pushCategorizedLog } from "./gameState";
import type { CyberwareSlot, GameState, GearSlot } from "../types";

export function equipItem(state: GameState, itemId: string) {
  const item = getItem(itemId);
  if (!item || !item.slot || !removeItem(cloneState(state), itemId, 1)) return state;
  if (item.requiredSkill && state.skills[item.requiredSkill].level < (item.requiredLevel ?? 1)) return state;
  const next = cloneState(state);
  if (!removeItem(next, itemId, 1)) return state;

  if (item.type === "Cyberware") {
    const slot = item.slot as CyberwareSlot;
    const replaced = next.equippedCyberware[slot];
    if (replaced) addItem(next, replaced, 1);
    next.equippedCyberware[slot] = itemId;
    pushCategorizedLog(next, "World", `Equipped cyberware: ${item.name}.`);
  } else if (item.type === "Weapon" || item.type === "Armor") {
    const slot = item.slot as GearSlot;
    const replaced = next.equippedGear[slot];
    if (replaced) addItem(next, replaced, 1);
    next.equippedGear[slot] = itemId;
    pushCategorizedLog(next, "World", `Equipped gear: ${item.name}.`);
  }
  return next;
}

export function unequipGear(state: GameState, slot: GearSlot) {
  const itemId = state.equippedGear[slot];
  if (!itemId) return state;
  const next = cloneState(state);
  delete next.equippedGear[slot];
  addItem(next, itemId, 1);
  pushCategorizedLog(next, "World", `Unequipped ${getItem(itemId)?.name ?? itemId}.`);
  return next;
}

export function unequipCyberware(state: GameState, slot: CyberwareSlot) {
  const itemId = state.equippedCyberware[slot];
  if (!itemId) return state;
  const next = cloneState(state);
  delete next.equippedCyberware[slot];
  addItem(next, itemId, 1);
  pushCategorizedLog(next, "World", `Unequipped ${getItem(itemId)?.name ?? itemId}.`);
  return next;
}

export function useItem(state: GameState, itemId: string) {
  const item = getItem(itemId);
  if (!item?.useEffect) return state;
  const next = cloneState(state);
  if (!removeItem(next, itemId, 1)) return state;
  if (item.useEffect === "reduceNeuralInstability") next.neuralInstability = Math.max(0, next.neuralInstability - 8);
  pushCategorizedLog(next, "World", `Used ${item.name}.`);
  return next;
}
