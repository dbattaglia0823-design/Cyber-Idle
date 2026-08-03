import { getItem } from "../data/items";
import { calculateSellValue } from "./balanceFormulas";
import { removeItem } from "./collectionSystem";
import { cloneState, pushCategorizedLog } from "./gameState";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { GameState } from "../types";

const INVENTORY_QUICK_SELL_RATE = 0.7;

export function inventoryQuickSellValue(state: GameState, itemId: string) {
  const item = getItem(itemId);
  if (!item || item.type === "Quest") return 0;
  return calculateSellValue(state, item, INVENTORY_QUICK_SELL_RATE);
}

export function canQuickSellInventoryItem(state: GameState, itemId: string) {
  const item = getItem(itemId);
  if (!item || inventoryQuickSellValue(state, itemId) <= 0) return false;
  const copiesToKeep = item.tags.includes("permanent-market") ? 1 : 0;
  return spareInventoryCopies(state, itemId) > copiesToKeep;
}

export function inventoryQuickSellAllButOneValue(state: GameState, itemId: string) {
  return inventoryQuickSellValue(state, itemId) * quickSellAllButOneCount(state, itemId);
}

export function canQuickSellAllButOneInventoryItem(state: GameState, itemId: string) {
  return inventoryQuickSellValue(state, itemId) > 0 && quickSellAllButOneCount(state, itemId) > 0;
}

export function quickSellInventoryItem(state: GameState, itemId: string) {
  if (!canQuickSellInventoryItem(state, itemId)) return state;
  const item = getItem(itemId)!;
  const next = cloneState(state);
  if (!removeItem(next, itemId, 1)) return state;
  const value = inventoryQuickSellValue(next, itemId);
  next.resources.credits += value;
  pushCategorizedLog(next, "Loot", `Quick sold ${item.name} for ${value} Credits.`);
  emitRewardPopupGroup(next, {
    title: `Sold ${item.name}`,
    resources: { credits: value },
  });
  return next;
}

export function quickSellAllButOneInventoryItem(state: GameState, itemId: string) {
  if (!canQuickSellAllButOneInventoryItem(state, itemId)) return state;
  const item = getItem(itemId)!;
  const quantity = quickSellAllButOneCount(state, itemId);
  const unitValue = inventoryQuickSellValue(state, itemId);
  const value = unitValue * quantity;
  const next = cloneState(state);
  if (!removeItem(next, itemId, quantity)) return state;
  next.resources.credits += value;
  pushCategorizedLog(next, "Loot", `Quick sold ${quantity} ${item.name} for ${value} Credits, keeping one copy.`);
  emitRewardPopupGroup(next, {
    title: `Sold ${quantity} ${item.name}`,
    resources: { credits: value },
  });
  return next;
}

function quickSellAllButOneCount(state: GameState, itemId: string) {
  const owned = state.inventory[itemId] ?? 0;
  const copiesToKeep = Math.max(1, equippedCopies(state, itemId));
  return Math.max(0, owned - copiesToKeep);
}

function spareInventoryCopies(state: GameState, itemId: string) {
  return (state.inventory[itemId] ?? 0) - equippedCopies(state, itemId);
}

function equippedCopies(state: GameState, itemId: string) {
  return [
    ...Object.values(state.equippedGear),
    ...Object.values(state.equippedCyberware),
  ].filter((id) => id === itemId).length;
}
