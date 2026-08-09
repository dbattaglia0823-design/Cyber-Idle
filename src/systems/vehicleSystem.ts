import { vehicles } from "../data/vehicles";
import { applyRewards } from "./actionProcessing";
import { calculateVehicleUpgradeCost } from "./balanceFormulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { updateVehicleAchievements } from "./achievements";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { GameState, RewardBundle, VehicleUpgradePartId } from "../types";

export const vehicleUpgradeParts: Array<{
  id: VehicleUpgradePartId;
  name: string;
  description: string;
  bonusPerLevel: string;
}> = [
  { id: "body", name: "Body & Armor", description: "Reinforce the chassis and cabin around the runner.", bonusPerLevel: "+2% player Armor" },
  { id: "engine", name: "Engine", description: "Tune power delivery and reduce travel time between actions.", bonusPerLevel: "+1% action speed" },
  { id: "cargo", name: "Cargo System", description: "Expand secure storage and improve profitable hauling.", bonusPerLevel: "+1.5% job rewards" },
  { id: "electronics", name: "Electronics", description: "Improve route masking, sensors, and contract navigation.", bonusPerLevel: "-1% Heat gain, +1% job success" },
];

const MAX_PART_LEVEL = 5;

export function canBuyVehicle(state: GameState, vehicleId: string) {
  const vehicle = vehicles.find((entry) => entry.id === vehicleId);
  if (!vehicle || state.ownedVehicles[vehicleId]) return false;
  if (!vehicle.unlockRequirements.every((requirement) => vehicleRequirementMet(state, requirement))) return false;
  return canPay(state, vehicle.cost);
}

export function vehicleRequirementMet(state: GameState, requirement: string) {
  const lower = requirement.toLowerCase();
  const level = Number(lower.match(/vehicle tuning\s+level\s+(\d+)/)?.[1] ?? 0);
  return level > 0 && state.skills.vehicleTuning.level >= level;
}

export function buyVehicle(state: GameState, vehicleId: string) {
  if (!canBuyVehicle(state, vehicleId)) return state;
  const vehicle = vehicles.find((entry) => entry.id === vehicleId)!;
  const next = cloneState(state);
  pay(next, vehicle.cost);
  next.ownedVehicles[vehicleId] = true;
  pushCategorizedLog(next, "World", `Vehicle acquired: ${vehicle.name}.`);
  emitRewardPopupGroup(next, {
    title: `Vehicle Acquired`,
    category: "item",
    story: [vehicle.name],
  });
  updateVehicleAchievements(next);
  return next;
}

export function setActiveVehicle(state: GameState, vehicleId: string) {
  if (!state.ownedVehicles[vehicleId]) return state;
  const next = cloneState(state);
  next.activeVehicle = vehicleId;
  pushCategorizedLog(next, "World", `Active vehicle set: ${vehicles.find((vehicle) => vehicle.id === vehicleId)?.name ?? vehicleId}.`);
  return next;
}

export function vehiclePartUpgradeLevel(state: GameState, vehicleId: string, partId: VehicleUpgradePartId) {
  const explicitKey = vehiclePartKey(vehicleId, partId);
  if (state.vehicleUpgradeLevels[explicitKey] !== undefined) return state.vehicleUpgradeLevels[explicitKey];
  const legacyTotal = state.vehicleUpgradeLevels[vehicleId] ?? 0;
  const partIndex = vehicleUpgradeParts.findIndex((part) => part.id === partId);
  return Math.min(MAX_PART_LEVEL, Math.floor(legacyTotal / vehicleUpgradeParts.length) + (partIndex < legacyTotal % vehicleUpgradeParts.length ? 1 : 0));
}

export function vehicleTotalUpgradeLevel(state: GameState, vehicleId: string) {
  return vehicleUpgradeParts.reduce((sum, part) => sum + vehiclePartUpgradeLevel(state, vehicleId, part.id), 0);
}

export function vehiclePartUpgradeCost(state: GameState, vehicleId: string, partId: VehicleUpgradePartId): RewardBundle {
  const level = vehiclePartUpgradeLevel(state, vehicleId, partId);
  const tier = level + 1;
  const shared = { credits: calculateVehicleUpgradeCost(state, vehicleTotalUpgradeLevel(state, vehicleId)), vehicleParts: 4 + tier * 3 };
  if (partId === "body") return { ...shared, armorPlating: tier };
  if (partId === "engine") return { ...shared, fuelCell: Math.ceil(tier / 2), engineCore: tier >= 3 ? 1 : 0, prototypeDriveUnit: tier >= 5 ? 1 : 0 };
  if (partId === "cargo") return { ...shared, navigationChip: Math.ceil(tier / 2), smugglerCompartment: tier >= 3 ? 1 : 0 };
  return { ...shared, navigationChip: tier, fuelCell: tier >= 3 ? 1 : 0 };
}

export function canUpgradeVehiclePart(state: GameState, vehicleId: string, partId: VehicleUpgradePartId) {
  const vehicle = vehicles.find((entry) => entry.id === vehicleId);
  if (!vehicle || !state.ownedVehicles[vehicleId]) return false;
  if (vehiclePartUpgradeLevel(state, vehicleId, partId) >= MAX_PART_LEVEL) return false;
  return canPay(state, vehiclePartUpgradeCost(state, vehicleId, partId));
}

export function upgradeVehicle(state: GameState, vehicleId: string, partId: VehicleUpgradePartId = "engine") {
  const vehicle = vehicles.find((entry) => entry.id === vehicleId);
  if (!vehicle || !state.ownedVehicles[vehicleId] || !canUpgradeVehiclePart(state, vehicleId, partId)) return state;
  const cost = vehiclePartUpgradeCost(state, vehicleId, partId);
  const levels = Object.fromEntries(vehicleUpgradeParts.map((part) => [part.id, vehiclePartUpgradeLevel(state, vehicleId, part.id)])) as Record<VehicleUpgradePartId, number>;
  const next = cloneState(state);
  pay(next, cost);
  levels[partId] += 1;
  vehicleUpgradeParts.forEach((part) => { next.vehicleUpgradeLevels[vehiclePartKey(vehicleId, part.id)] = levels[part.id]; });
  next.vehicleUpgradeLevels[vehicleId] = Object.values(levels).reduce((sum, level) => sum + level, 0);
  const part = vehicleUpgradeParts.find((entry) => entry.id === partId)!;
  pushCategorizedLog(next, "World", `${vehicle.name} ${part.name} upgraded to level ${levels[partId]}.`);
  emitRewardPopupGroup(next, {
    title: `Vehicle Upgraded`,
    category: "item",
    story: [`${vehicle.name}: ${part.name} ${levels[partId]}/${MAX_PART_LEVEL}`, part.bonusPerLevel],
  });
  updateVehicleAchievements(next);
  return next;
}

function vehiclePartKey(vehicleId: string, partId: VehicleUpgradePartId) {
  return `${vehicleId}:${partId}`;
}

function canPay(state: GameState, cost: RewardBundle) {
  return Object.entries(cost).every(([resource, amount]) => (state.resources[resource as keyof typeof state.resources] ?? 0) >= (amount ?? 0));
}

function pay(state: GameState, cost: RewardBundle) {
  applyRewards(state, Object.fromEntries(Object.entries(cost).map(([key, amount]) => [key, -(amount ?? 0)])) as RewardBundle);
}
