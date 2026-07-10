import { housingOptions } from "../data/housing";
import { vehicles } from "../data/vehicles";
import { applyRewards } from "./actionProcessing";
import { cloneState, pushCategorizedLog } from "./gameState";
import { updateOperationAchievements } from "./achievements";
import { getActiveModifiers } from "./modifiers";
import type { GameState, RewardBundle } from "../types";

export function garageSlots(state: GameState) {
  const housing = housingOptions.find((option) => option.id === state.activeResidence);
  return 1 + (housing?.garageSlots ?? 0);
}

export function canBuyVehicle(state: GameState, vehicleId: string) {
  const vehicle = vehicles.find((entry) => entry.id === vehicleId);
  if (!vehicle || state.ownedVehicles[vehicleId]) return false;
  if (Object.values(state.ownedVehicles).filter(Boolean).length >= garageSlots(state)) return false;
  return canPay(state, vehicle.cost);
}

export function buyVehicle(state: GameState, vehicleId: string) {
  if (!canBuyVehicle(state, vehicleId)) return state;
  const vehicle = vehicles.find((entry) => entry.id === vehicleId)!;
  const next = cloneState(state);
  pay(next, vehicle.cost);
  next.ownedVehicles[vehicleId] = true;
  next.activeVehicle = next.activeVehicle ?? vehicleId;
  pushCategorizedLog(next, "World", `Vehicle acquired: ${vehicle.name}.`);
  updateOperationAchievements(next);
  return next;
}

export function setActiveVehicle(state: GameState, vehicleId: string) {
  if (!state.ownedVehicles[vehicleId]) return state;
  const next = cloneState(state);
  next.activeVehicle = vehicleId;
  pushCategorizedLog(next, "World", `Active vehicle set: ${vehicles.find((vehicle) => vehicle.id === vehicleId)?.name ?? vehicleId}.`);
  return next;
}

export function upgradeVehicle(state: GameState, vehicleId: string) {
  const vehicle = vehicles.find((entry) => entry.id === vehicleId);
  if (!vehicle || !state.ownedVehicles[vehicleId]) return state;
  const level = state.vehicleUpgradeLevels[vehicleId] ?? 0;
  if (level >= vehicle.maxUpgradeLevel) return state;
  const cost = adjustedVehicleCost(state, { vehicleParts: 5 * (level + 1), credits: 50 * (level + 1), engineCore: level >= 4 ? 1 : 0 });
  if (!canPay(state, cost)) return state;
  const next = cloneState(state);
  pay(next, cost);
  next.vehicleUpgradeLevels[vehicleId] = level + 1;
  pushCategorizedLog(next, "World", `${vehicle.name} upgraded to +${level + 1}.`);
  updateOperationAchievements(next);
  return next;
}

function adjustedVehicleCost(state: GameState, cost: RewardBundle) {
  const reduction = Math.min(0.5, getActiveModifiers(state).vehicleUpgradeCostReduction);
  return Object.fromEntries(Object.entries(cost).map(([id, amount]) => [id, amount && amount > 0 ? Math.max(1, Math.ceil(amount * (1 - reduction))) : amount ?? 0])) as RewardBundle;
}

function canPay(state: GameState, cost: RewardBundle) {
  return Object.entries(cost).every(([resource, amount]) => (state.resources[resource as keyof typeof state.resources] ?? 0) >= (amount ?? 0));
}

function pay(state: GameState, cost: RewardBundle) {
  applyRewards(state, Object.fromEntries(Object.entries(cost).map(([key, amount]) => [key, -(amount ?? 0)])) as RewardBundle);
}
