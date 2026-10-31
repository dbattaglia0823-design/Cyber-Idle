import { getItem } from "../data/items";
import { cloneState } from "./gameState";
import type { GameState } from "../types";

export function toggleInventoryLock(state: GameState, itemId: string) {
  if (!getItem(itemId) || !(state.inventory[itemId] > 0)) return state;
  const next = cloneState(state);
  if (next.inventoryLocks[itemId]) delete next.inventoryLocks[itemId];
  else next.inventoryLocks[itemId] = true;
  return next;
}
