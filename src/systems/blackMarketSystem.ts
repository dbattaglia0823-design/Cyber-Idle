import { getItem } from "../data/items";
import { removeItem } from "./collectionSystem";
import { cloneState, pushCategorizedLog } from "./gameState";
import { balanceConfig } from "../data/balanceConfig";
import { calculateBlackMarketListingValue, calculateBlackMarketRisk } from "./balanceFormulas";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { BlackMarketListing, BlackMarketStrategy, GameState } from "../types";

export function blackMarketEligibleItems(state: GameState) {
  return Object.entries(state.inventory)
    .filter(([, quantity]) => quantity > 0)
    .map(([id]) => getItem(id))
    .filter((item) => item && isBlackMarketEligible(item.id))
    .map((item) => item!.id);
}

export function isBlackMarketEligible(itemId: string) {
  const item = getItem(itemId);
  if (!item) return false;
  return item.rarity !== "Common" || item.tags.some((tag) => ["prototype", "illegal", "blacknet", "weapon-mod", "attachment", "blueprint"].includes(tag)) || item.type === "Cyberware" || item.type === "WeaponAttachment" || item.type === "WeaponMod";
}

export function expectedBlackMarketValue(state: GameState, itemId: string, strategy: BlackMarketStrategy) {
  return calculateBlackMarketListingValue(state, itemId, strategy);
}

export function listBlackMarketItem(state: GameState, itemId: string, strategy: BlackMarketStrategy, quantity = 1, now = Date.now()) {
  if (!isBlackMarketEligible(itemId) || (state.inventory[itemId] ?? 0) < quantity) return state;
  if (state.resources.heat >= 100 && !state.blackMarketAutomation.autoPauseHighHeat) return state;
  const next = cloneState(state);
  if (!removeItem(next, itemId, quantity)) return state;
  const risk = calculateBlackMarketRisk(next, strategy);
  const listing: BlackMarketListing = {
    id: `bm-${now}-${itemId}`,
    itemId,
    quantity,
    askingPrice: expectedBlackMarketValue(next, itemId, strategy) * quantity,
    strategy,
    progress: 0,
    durationMs: risk.durationMs,
    startedAt: now,
    saleChance: risk.saleChance,
    heatRisk: risk.heatRisk,
    buyerRisk: risk.buyerRisk,
    status: "active",
  };
  next.blackMarketListings = [listing, ...next.blackMarketListings];
  next.marketStatistics.blackMarketListingsCreated += 1;
  next.achievements["black-market-first-listing"] = true;
  pushCategorizedLog(next, "World", `Listed ${getItem(itemId)?.name ?? itemId} on the Black Market.`);
  return next;
}

export function processBlackMarketListings(state: GameState, now = Date.now()) {
  if (!state.blackMarketListings.length) return state;
  const next = cloneState(state);
  const active: BlackMarketListing[] = [];
  next.blackMarketListings.forEach((listing) => {
    if (listing.status !== "active") {
      active.push(listing);
      return;
    }
    if (next.resources.heat >= 100 && next.blackMarketAutomation.autoPauseHighHeat) {
      active.push({ ...listing, progress: Math.min(99, listing.progress), outcome: "Paused by high Heat automation." });
      return;
    }
    const progress = Math.min(100, ((now - listing.startedAt) / listing.durationMs) * 100);
    if (progress < 100) {
      active.push({ ...listing, progress });
      return;
    }
    const resolved = resolveListing(next, listing);
    next.blackMarketCompletedSales = [resolved, ...next.blackMarketCompletedSales].slice(0, 30);
  });
  next.blackMarketListings = active;
  return next;
}

function resolveListing(state: GameState, listing: BlackMarketListing): BlackMarketListing {
  const roll = Math.random();
  const sting = Math.random() < listing.heatRisk;
  if (sting && roll > listing.saleChance * 0.5) {
    const heat = Math.ceil(6 + state.resources.heat / 12);
    state.resources.heat = Math.min(100, state.resources.heat + heat);
    state.marketStatistics.blackMarketItemsSeized += listing.quantity;
    state.marketStatistics.heatFromMarketActivity += heat;
    state.achievements["black-market-sting-loss"] = true;
    pushCategorizedLog(state, "Warning", `Black Market sting: ${getItem(listing.itemId)?.name ?? listing.itemId} seized. Heat +${heat}.`);
    emitRewardPopupGroup(state, {
      title: "Black Market Sting",
      category: "warning",
      heat,
      warnings: [`Seized: ${getItem(listing.itemId)?.name ?? listing.itemId}`],
    });
    return { ...listing, progress: 100, status: "seized", outcome: "Sting attempt. Item seized." };
  }
  if (roll <= listing.saleChance) {
    const premium = Math.random() < Math.max(balanceConfig.blackMarket.premiumBuyerMin, balanceConfig.blackMarket.premiumBuyerBase - listing.buyerRisk) ? balanceConfig.blackMarket.premiumMultiplier : 1;
    const payout = Math.round(listing.askingPrice * premium);
    const heat = Math.ceil(listing.heatRisk * 3);
    state.resources.credits += payout;
    state.resources.heat = Math.min(100, state.resources.heat + heat);
    state.marketStatistics.blackMarketSalesCompleted += 1;
    state.marketStatistics.blackMarketCreditsEarned += payout;
    state.marketStatistics.heatFromMarketActivity += heat;
    state.achievements["black-market-first-sale"] = true;
    if (payout >= 1000) state.achievements["black-market-large-payout"] = true;
    if (getItem(listing.itemId)?.tags.includes("prototype")) state.achievements["black-market-prototype-sale"] = true;
    pushCategorizedLog(state, "Loot", `Black Market sale completed: +${payout} Credits.`);
    emitRewardPopupGroup(state, {
      title: "Black Market Sale",
      resources: { credits: payout },
      heat,
      story: premium > 1 ? ["Premium buyer bonus"] : [],
    });
    return { ...listing, progress: 100, status: "completed", outcome: premium > 1 ? "Premium buyer bonus." : "Successful sale." };
  }
  pushCategorizedLog(state, "World", `Black Market buyer ghosted: ${getItem(listing.itemId)?.name ?? listing.itemId}.`);
  return { ...listing, progress: 100, status: "failed", outcome: "Buyer ghosted. No payout." };
}
