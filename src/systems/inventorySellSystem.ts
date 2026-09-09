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
  return spareInventoryCopies(state, itemId) > 0;
}

export function inventorySellAllButOneCount(state: GameState, itemId: string) {
  return Math.max(0, Math.floor(state.inventory[itemId] ?? 0) - Math.max(1, equippedCopies(state, itemId)));
}

export function quickSellAllButOne(state: GameState, itemId: string) {
  return quickSellInventoryItem(state, itemId, inventorySellAllButOneCount(state, itemId));
}

export function quickSellInventoryItem(state: GameState, itemId: string, quantity = 1) {
  if (!canQuickSellInventoryItem(state, itemId)) return state;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > spareInventoryCopies(state, itemId)) return state;
  const item = getItem(itemId)!;
  const value = inventoryQuickSellValue(state, itemId) * quantity;
  const next = cloneState(state);
  if (!removeItem(next, itemId, quantity)) return state;
  next.resources.credits += value;
  const soldName = quantity === 1 ? item.name : `${quantity} × ${item.name}`;
  pushCategorizedLog(next, "Loot", `Quick sold ${soldName} for ${value} Credits.`);
  emitRewardPopupGroup(next, {
    title: `Sold ${soldName}`,
    resources: { credits: value },
  });
  return next;
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
