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

function spareInventoryCopies(state: GameState, itemId: string) {
  return (state.inventory[itemId] ?? 0) - equippedCopies(state, itemId);
}

function equippedCopies(state: GameState, itemId: string) {
  return [
    ...Object.values(state.equippedGear),
    ...Object.values(state.equippedCyberware),
  ].filter((id) => id === itemId).length;
}
