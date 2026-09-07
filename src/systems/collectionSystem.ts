import { getItem } from "../data/items";
import type { GameState } from "../types";

export function discoverItem(state: GameState, itemId: string) {
  state.discoveredItems[itemId] = true;
  const item = getItem(itemId);
  if (item?.type === "Blueprint") state.unlockedBlueprints[itemId] = true;
}

export function addItem(state: GameState, itemId: string, quantity = 1) {
  if (!Number.isFinite(quantity) || quantity <= 0) return;
  if (itemId in state.resources) {
    state.resources[itemId as keyof GameState["resources"]] += quantity;
    discoverItem(state, itemId);
    return;
  }
  state.inventory[itemId] = (state.inventory[itemId] ?? 0) + quantity;
  discoverItem(state, itemId);
}

export function removeItem(state: GameState, itemId: string, quantity = 1) {
  if (!Number.isFinite(quantity) || quantity <= 0) return false;
  if (itemId in state.resources) {
    const id = itemId as keyof GameState["resources"];
    if (state.resources[id] < quantity) return false;
    state.resources[id] -= quantity;
    return true;
  }
  if ((state.inventory[itemId] ?? 0) < quantity) return false;
  state.inventory[itemId] -= quantity;
  if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
  return true;
}
