import { vendors } from "../data/vendors";
import { getItem } from "../data/items";
import { resourceNames } from "../data/resources";
import { addItem, removeItem } from "./collectionSystem";
import { changeLocalStanding, discoverDistrictContent, discoverDistrictVendor } from "./districtProgression";
import { calculateRarityAdjustedShopBasePrice, calculateSellValue, calculateVendorPrice } from "./balanceFormulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { factionRank } from "./modifiers";
import { updateWorldUnlocks } from "./worldUnlocks";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { FactionId, GameState, ResourceId, VendorDefinition, VendorItemEntry } from "../types";

const resourceIds = new Set(Object.keys(resourceNames));
export const VENDOR_LIMITED_STOCK_REFRESH_MS = 15 * 60 * 1000;

export function districtVendors(districtId: string) {
  return vendors
    .filter((vendor) => vendor.districtId === districtId)
    .map((vendor) => ({ ...vendor, inventory: [...vendor.inventory].sort((a, b) => vendorItemScore(a) - vendorItemScore(b) || a.price - b.price || a.itemId.localeCompare(b.itemId)) }));
}

function vendorItemScore(entry: VendorItemEntry) {
  const rarityScore = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5, Prototype: 6, Relic: 7 } as const;
  const item = getItem(entry.itemId);
  return (entry.stockType === "unlock" ? 1000 : entry.stockType === "limited" ? 500 : 0) + (item ? rarityScore[item.rarity] * 100 : 0);
}

export function canUseVendor(state: GameState, vendor: VendorDefinition) {
  return state.districts[vendor.districtId]?.unlocked && vendor.canBuy;
}

export function vendorItemUnlocked(state: GameState, entry: VendorItemEntry) {
  if (entry.requiredDistrictUnlock && !state.districts[entry.requiredDistrictUnlock]?.unlocked) return false;
  if (entry.requiredUnlock && !state.worldUnlocks[entry.requiredUnlock] && !state.unlocks[entry.requiredUnlock]) return false;
  return Object.entries(entry.requiredFactionRank ?? {}).every(([factionId, rank]) => {
    return factionRank(state.factions[factionId as FactionId]?.reputation ?? 0) >= (rank ?? 0);
  });
}

export function vendorPrice(state: GameState, vendor: VendorDefinition, entry: VendorItemEntry) {
  const factionDiscount = Object.entries(vendor.factionDiscounts ?? {}).reduce((sum, [factionId, discount]) => {
    return sum + (factionRank(state.factions[factionId as FactionId]?.reputation ?? 0) > 0 ? discount ?? 0 : 0);
  }, 0);
  const pathDiscount = state.startingPath ? vendor.startingPathModifiers?.[state.startingPath] ?? 0 : 0;
  const modifier = Math.max(0.35, vendor.priceModifier - factionDiscount - pathDiscount);
  return calculateVendorPrice(state, calculateRarityAdjustedShopBasePrice(getItem(entry.itemId), entry.price), vendor.districtId, modifier);
}

export function vendorLimitedStockRefreshAt(state: GameState, vendorId: string) {
  return normalizedVendorState(state, vendorId).limitedStockRefreshAt;
}

export function vendorLimitedStockRemaining(state: GameState, vendorId: string, entry: VendorItemEntry) {
  if (entry.stockType !== "limited") return Infinity;
  const vendorState = normalizedVendorState(state, vendorId);
  return Math.max(0, (entry.stock ?? 0) - (vendorState.purchases[entry.itemId] ?? 0));
}

export function canBuyVendorItem(state: GameState, vendorId: string, itemId: string) {
  const vendor = vendors.find((entry) => entry.id === vendorId);
  const item = vendor?.inventory.find((entry) => entry.itemId === itemId);
  if (!vendor || !item || !canUseVendor(state, vendor) || !vendorItemUnlocked(state, item)) return false;
  if (item.stockType === "limited" && vendorLimitedStockRemaining(state, vendorId, item) <= 0) return false;
  return state.resources.credits >= vendorPrice(state, vendor, item);
}

export function buyVendorItem(state: GameState, vendorId: string, itemId: string) {
  if (!canBuyVendorItem(state, vendorId, itemId)) return state;
  const vendor = vendors.find((entry) => entry.id === vendorId)!;
  const entry = vendor.inventory.find((item) => item.itemId === itemId)!;
  const next = cloneState(state);
  const price = vendorPrice(next, vendor, entry);
  next.resources.credits -= price;
  if (isResourceId(itemId)) next.resources[itemId] += 1;
  else addItem(next, itemId, 1);
  const vendorState = normalizedVendorState(next, vendorId);
  vendorState.discovered = true;
  vendorState.purchases[itemId] = (vendorState.purchases[itemId] ?? 0) + 1;
  next.vendors[vendorId] = vendorState;
  discoverDistrictVendor(next, vendorId);
  discoverDistrictContent(next, vendor.districtId, `item:${itemId}`);
  changeLocalStanding(next, vendor.districtId, 1, `bought from ${vendor.name}`);
  pushCategorizedLog(next, "Loot", `Bought ${itemLabel(itemId)} from ${vendor.name} for ${price} Credits.`);
  emitRewardPopupGroup(next, {
    title: `Bought ${itemLabel(itemId)}`,
    items: isResourceId(itemId) ? undefined : { [itemId]: 1 },
    resources: isResourceId(itemId) ? { [itemId]: 1, credits: -price } : { credits: -price },
  });
  updateWorldUnlocks(next);
  return next;
}

export function canSellVendorItem(state: GameState, vendorId: string, itemId: string) {
  const vendor = vendors.find((entry) => entry.id === vendorId);
  if (!vendor?.canSell || !state.districts[vendor.districtId]?.unlocked) return false;
  return getOwnedCount(state, itemId) > 0 && sellValue(state, vendor, itemId) > 0;
}

export function sellVendorItem(state: GameState, vendorId: string, itemId: string) {
  if (!canSellVendorItem(state, vendorId, itemId)) return state;
  const vendor = vendors.find((entry) => entry.id === vendorId)!;
  const next = cloneState(state);
  if (isResourceId(itemId)) next.resources[itemId] = Math.max(0, next.resources[itemId] - 1);
  else removeItem(next, itemId, 1);
  const value = sellValue(next, vendor, itemId);
  next.resources.credits += value;
  discoverDistrictVendor(next, vendorId);
  changeLocalStanding(next, vendor.districtId, 1, `sold goods to ${vendor.name}`);
  pushCategorizedLog(next, "Loot", `Sold ${itemLabel(itemId)} to ${vendor.name} for ${value} Credits.`);
  emitRewardPopupGroup(next, {
    title: `Sold ${itemLabel(itemId)}`,
    resources: { credits: value },
  });
  return next;
}

export function sellValue(state: GameState, vendor: VendorDefinition, itemId: string) {
  if (itemId === "credits" || itemId === "heat" || itemId === "reputation") return 0;
  if (isResourceId(itemId)) {
    const base = Math.max(1, Math.floor((resourceBaseValue(itemId) ?? 1) * 0.45));
    const underpassBonus = vendor.districtId === "underpassMarket" ? 1.2 : 1;
    const standingBonus = 1 + Math.min(0.15, (state.districtStanding[vendor.districtId]?.standing ?? 0) / 800);
    return Math.max(1, Math.round(base * underpassBonus * standingBonus));
  }
  const item = getItem(itemId);
  if (!item) return 0;
  const underpassBonus = vendor.districtId === "underpassMarket" ? 1.2 : 1;
  const standingBonus = 1 + Math.min(0.15, (state.districtStanding[vendor.districtId]?.standing ?? 0) / 800);
  return calculateSellValue(state, item, underpassBonus * standingBonus);
}

export function getOwnedCount(state: GameState, itemId: string) {
  return isResourceId(itemId) ? state.resources[itemId] ?? 0 : state.inventory[itemId] ?? 0;
}

export function isResourceId(itemId: string): itemId is ResourceId {
  return resourceIds.has(itemId);
}

function itemLabel(itemId: string) {
  return getItem(itemId)?.name ?? resourceNames[itemId as ResourceId] ?? itemId;
}

function resourceBaseValue(itemId: string) {
  return getItem(itemId)?.sellValue ?? 1;
}

function normalizedVendorState(state: GameState, vendorId: string, now = Date.now()) {
  const current = state.vendors[vendorId] ?? { discovered: true, purchases: {} };
  const hasLimitedPurchases = Object.values(current.purchases).some((amount) => amount > 0);
  const refreshAt = current.limitedStockRefreshAt;
  if (refreshAt && refreshAt > now) return { discovered: current.discovered, purchases: { ...current.purchases }, limitedStockRefreshAt: refreshAt };
  if (!refreshAt && !hasLimitedPurchases) return { discovered: current.discovered, purchases: { ...current.purchases }, limitedStockRefreshAt: now + VENDOR_LIMITED_STOCK_REFRESH_MS };
  return { discovered: current.discovered, purchases: {}, limitedStockRefreshAt: now + VENDOR_LIMITED_STOCK_REFRESH_MS };
}
