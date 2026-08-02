import { housingOptions } from "../data/housing";
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
