import { ripperdocServices } from "../data/ripperdocs";
import { ripperdocClinics } from "../data/ripperdocClinics";
import { getItem } from "../data/items";
import { addItem, removeItem } from "./collectionSystem";
import { calculateRipperdocServiceCost, calculateSellValue, calculateVendorPrice } from "./balanceFormulas";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import { cloneState, pushCategorizedLog } from "./gameState";
import { factionRank } from "./modifiers";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { GameState, ResourceId } from "../types";

export function canUseRipperdocService(state: GameState, serviceId: string) {
  const service = ripperdocServices.find((entry) => entry.id === serviceId);
  if (!service || !state.districts[service.districtId]?.unlocked) return false;
  return Object.entries(adjustedServiceCost(state, service.cost)).every(([resource, amount]) => state.resources[resource as ResourceId] >= (amount ?? 0));
}

export function useRipperdocService(state: GameState, serviceId: string) {
  if (!canUseRipperdocService(state, serviceId)) return state;
  const service = ripperdocServices.find((entry) => entry.id === serviceId)!;
  const next = cloneState(state);
  Object.entries(adjustedServiceCost(next, service.cost)).forEach(([resource, amount]) => {
    next.resources[resource as ResourceId] -= amount ?? 0;
  });
  if (service.serviceType === "treatment" && service.id.includes("emergency")) addItem(next, "medical-gel", 1);
  if (service.heatChange) next.resources.heat = Math.max(0, next.resources.heat + service.heatChange);
  if (service.temporaryEffect) {
    const now = Date.now();
    next.activeRipperdocEffects = [
      {
        ...service.temporaryEffect,
        serviceId: service.id,
        sourceName: service.name,
        startedAt: now,
        expiresAt: service.temporaryEffect.durationMs ? now + service.temporaryEffect.durationMs : undefined,
        remainingUses: service.temporaryEffect.uses,
      },
      ...(next.activeRipperdocEffects ?? []).filter((effect) => effect.serviceId !== service.id),
    ].slice(0, 5);
  }
  next.ripperdocUnlocks[service.id] = true;
  next.ripperdocHistory.servicesUsed += 1;
  next.marketStatistics.ripperdocServicesUsed += 1;
  if (service.category === "Install") {
    next.ripperdocHistory.cyberwareInstalled += 1;
    next.marketStatistics.cyberwareInstalledByRipperdocs += 1;
    next.achievements["ripperdoc-install-cyberware"] = true;
  }
  next.achievements["first-ripperdoc-service"] = true;
  if (service.ripperdocId === "underpass-street-surgeon") next.achievements["unlock-underpass-surgeon"] = true;
  if (service.ripperdocId === "helix-recovery-lab") next.achievements["unlock-helix-lab"] = true;
  discoverDistrictContent(next, service.districtId, `ripperdoc:${service.id}`);
  changeLocalStanding(next, service.districtId, 2, `${service.name} used`);
  pushCategorizedLog(next, "World", `Ripperdoc service used: ${service.name}.`);
  emitRewardPopupGroup(next, {
    title: service.name,
    items: {
      ...(service.serviceType === "treatment" && service.id.includes("emergency") ? { "medical-gel": 1 } : {}),
    },
    heat: service.heatChange,
    neuralInstability: 0,
    story: service.temporaryEffect ? [service.temporaryEffect.description] : [],
  });
  return next;
}

export function clinicForDistrict(districtId: string) {
  return ripperdocClinics.find((clinic) => clinic.districtId === districtId);
}

export function canBuyCyberwareFromRipperdoc(state: GameState, clinicId: string, itemId: string) {
  const clinic = ripperdocClinics.find((entry) => entry.id === clinicId);
  const item = getItem(itemId);
  if (!clinic || !item || item.type !== "Cyberware" || !state.districts[clinic.districtId]?.unlocked) return false;
  if (!clinic.cyberwareInventory.includes(itemId)) return false;
  return state.resources.credits >= ripperdocBuyPrice(state, clinicId, itemId);
}

export function buyCyberwareFromRipperdoc(state: GameState, clinicId: string, itemId: string) {
  if (!canBuyCyberwareFromRipperdoc(state, clinicId, itemId)) return state;
  const clinic = ripperdocClinics.find((entry) => entry.id === clinicId)!;
  const item = getItem(itemId)!;
  const next = cloneState(state);
  const price = ripperdocBuyPrice(next, clinicId, itemId);
  next.resources.credits -= price;
  addItem(next, itemId, 1);
  next.ripperdocHistory.cyberwareBought += 1;
  discoverDistrictContent(next, clinic.districtId, `ripperdoc-buy:${itemId}`);
  pushCategorizedLog(next, "Loot", `Bought ${item.name} from ${clinic.name} for ${price} Credits.`);
  emitRewardPopupGroup(next, {
    title: `Bought ${item.name}`,
    items: { [itemId]: 1 },
    resources: { credits: -price },
  });
  return next;
}

export function canSellCyberwareToRipperdoc(state: GameState, clinicId: string, itemId: string) {
  const clinic = ripperdocClinics.find((entry) => entry.id === clinicId);
  const item = getItem(itemId);
  if (!clinic || !item || item.type !== "Cyberware" || !state.districts[clinic.districtId]?.unlocked) return false;
  if (clinic.legalOnly && (item.tags.includes("prototype") || item.tags.includes("illegal"))) return false;
  return (state.inventory[itemId] ?? 0) > 0;
}

export function sellCyberwareToRipperdoc(state: GameState, clinicId: string, itemId: string) {
  if (!canSellCyberwareToRipperdoc(state, clinicId, itemId)) return state;
  const clinic = ripperdocClinics.find((entry) => entry.id === clinicId)!;
  const item = getItem(itemId)!;
  const next = cloneState(state);
  removeItem(next, itemId, 1);
  const value = ripperdocSellValue(next, clinicId, itemId);
  next.resources.credits += value;
  next.ripperdocHistory.cyberwareSold += 1;
  next.marketStatistics.cyberwareSoldToRipperdocs += 1;
  next.achievements["ripperdoc-sell-cyberware"] = true;
  discoverDistrictContent(next, clinic.districtId, `ripperdoc-sell:${itemId}`);
  pushCategorizedLog(next, "Loot", `Sold ${item.name} to ${clinic.name} for ${value} Credits.`);
  emitRewardPopupGroup(next, {
    title: `Sold ${item.name}`,
    resources: { credits: value },
  });
  return next;
}

export function ripperdocBuyPrice(state: GameState, clinicId: string, itemId: string) {
  const clinic = ripperdocClinics.find((entry) => entry.id === clinicId);
  const item = getItem(itemId);
  if (!clinic || !item) return 0;
  const factionDiscount = clinic.factionDiscount ? Math.min(0.18, factionRank(state.factions[clinic.factionDiscount].reputation) * 0.015) : 0;
  const fixerDiscount = Math.min(0.12, Object.values(state.fixerTrust).reduce((sum, fixer) => sum + fixer.trust, 0) / 2000);
  return calculateVendorPrice(state, item.sellValue * 4, clinic.districtId, clinic.priceModifier * (1 - factionDiscount - fixerDiscount));
}

export function ripperdocSellValue(state: GameState, clinicId: string, itemId: string) {
  const clinic = ripperdocClinics.find((entry) => entry.id === clinicId);
  const item = getItem(itemId);
  if (!clinic || !item) return 0;
  const factionBonus = clinic.factionDiscount ? Math.min(0.16, factionRank(state.factions[clinic.factionDiscount].reputation) * 0.012) : 0;
  const illegalBonus = !clinic.legalOnly && (item.tags.includes("prototype") || item.tags.includes("illegal")) ? 0.18 : 0;
  return calculateSellValue(state, item, clinic.sellModifier * (1 + factionBonus + illegalBonus));
}

function adjustedServiceCost(state: GameState, cost: Record<ResourceId, number> | Partial<Record<ResourceId, number>>) {
  return Object.fromEntries(Object.entries(cost).map(([id, amount]) => [id, amount && amount > 0 ? calculateRipperdocServiceCost(state, amount) : amount ?? 0]));
}
