import { meetsItemAttributeRequirement } from "./runnerProgression";
import { getItem } from "../data/items";
import { removeItem } from "./collectionSystem";
import { cloneState, pushCategorizedLog } from "./gameState";
import { useHealingItem } from "./healthSystem";
import type { CyberwareSlot, GameState, GearSlot } from "../types";

export function equipItem(state: GameState, itemId: string) {
  const item = getItem(itemId);
  if (state.rpg.active && item?.slot === "operatingSystem") return state;
  if (!item || !item.slot || (state.inventory[itemId] ?? 0) <= 0) return state;
  if (!meetsItemAttributeRequirement(state, item)) return state;
  const next = cloneState(state);

  if (item.type === "Cyberware") {
    const slot = item.slot as CyberwareSlot;
    next.equippedCyberware[slot] = itemId;
    pushCategorizedLog(next, "World", `Equipped cyberware: ${item.name}.`);
  } else if (item.type === "Weapon" || item.type === "Armor") {
    const slot = item.slot as GearSlot;
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
  pushCategorizedLog(next, "World", `Unequipped ${getItem(itemId)?.name ?? itemId}.`);
  return next;
}

export function unequipCyberware(state: GameState, slot: CyberwareSlot) {
  if (state.rpg.active && slot === "operatingSystem") return state;
  const itemId = state.equippedCyberware[slot];
  if (!itemId) return state;
  const next = cloneState(state);
  delete next.equippedCyberware[slot];
  pushCategorizedLog(next, "World", `Unequipped ${getItem(itemId)?.name ?? itemId}.`);
  return next;
}

export function useItem(state: GameState, itemId: string) {
  const item = getItem(itemId);
  if (!item?.useEffect) return state;
  const next = cloneState(state);
  if (item.useEffect === "heal") {
    const result = useHealingItem(next, itemId, "Manual Healing");
    if (!result.used) return state;
    pushCategorizedLog(next, "Combat", `Used ${item.name}: restored ${result.healed} HP.`);
    return next;
  }
  if (!removeItem(next, itemId, 1)) return state;
  pushCategorizedLog(next, "World", `Used ${item.name}.`);
  return next;
}
