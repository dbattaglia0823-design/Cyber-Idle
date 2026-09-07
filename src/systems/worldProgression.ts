import { housingOptions } from "../data/housing";
import { companions } from "../data/companions";
import { cloneState, pushCategorizedLog } from "./gameState";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import type { GameState } from "../types";

export function canBuyHousing(state: GameState, housingId: string) {
  const housing = housingOptions.find((option) => option.id === housingId);
  if (!housing || state.ownedHousing[housingId]) return false;
  return state.resources.credits >= housing.cost && state.districts[housing.districtId]?.unlocked;
}

export function buyHousing(state: GameState, housingId: string) {
  if (!canBuyHousing(state, housingId)) return state;
  const housing = housingOptions.find((option) => option.id === housingId)!;
  const next = cloneState(state);
  next.resources.credits -= housing.cost;
  next.ownedHousing[housingId] = true;
  next.activeResidence = next.activeResidence ?? housingId;
  discoverDistrictContent(next, housing.districtId, `housing:${housingId}`);
  changeLocalStanding(next, housing.districtId, 5, `${housing.name} purchased`);
  pushCategorizedLog(next, "World", `Purchased residence: ${housing.name}.`);
  return next;
}

export function setActiveResidence(state: GameState, housingId: string) {
  if (!state.ownedHousing[housingId]) return state;
  const housing = housingOptions.find((option) => option.id === housingId);
  const next = cloneState(state);
  next.activeResidence = housingId;
  pushCategorizedLog(next, "World", `Active residence set to ${housing?.name ?? housingId}.`);
  return next;
}

export function giveCompanionGift(state: GameState, companionId: string) {
  const companion = companions.find((entry) => entry.id === companionId);
  const current = state.companions[companionId];
  if (!companion || !current?.unlocked) return state;
  if (state.resources.credits < 25) return state;
  const next = cloneState(state);
  next.resources.credits -= 25;
  next.companions[companionId] = {
    ...current,
    relationship: Math.min(100, current.relationship + 5),
  };
  pushCategorizedLog(next, "World", `Gift sent to ${companion.name}. Relationship +5.`);
  return next;
}

export function setActiveCompanion(state: GameState, companionId: string) {
  if (!state.companions[companionId]?.unlocked) return state;
  const next = cloneState(state);
  next.activeCompanion = companionId;
  pushCategorizedLog(next, "World", `Active companion set to ${companions.find((entry) => entry.id === companionId)?.name ?? companionId}.`);
  return next;
}

export function spendTimeWithCompanion(state: GameState, companionId: string, now = Date.now()) {
  const current = state.companions[companionId];
  if (!current?.unlocked || state.resources.credits < 15) return state;
  if (current.spendTimeAt && now - current.spendTimeAt < 60_000) return state;
  const next = cloneState(state);
  next.resources.credits -= 15;
  next.companions[companionId] = {
    ...current,
    relationship: Math.min(100, current.relationship + 3),
    spendTimeAt: now,
  };
  pushCategorizedLog(next, "World", `Spent time with ${companions.find((entry) => entry.id === companionId)?.name ?? companionId}. Relationship +3.`);
  return next;
}
