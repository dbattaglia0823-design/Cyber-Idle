import { housingOptions } from "../data/housing";
import { vehicles } from "../data/vehicles";
import { applyRewards } from "./actionProcessing";
import { calculateVehicleUpgradeCost } from "./balanceFormulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { updateOperationAchievements } from "./achievements";
import { emitRewardPopupGroup } from "./rewardPopups";
import { factionRank } from "./modifiers";
import type { GameState, RewardBundle } from "../types";

export function garageSlots(state: GameState) {
  return 1 + housingOptions.filter(option => state.ownedHousing[option.id]).reduce((sum, option) => sum + (option.garageSlots ?? 0), 0);
}

export function canBuyVehicle(state: GameState, vehicleId: string) {
  const vehicle = vehicles.find((entry) => entry.id === vehicleId);
  if (!vehicle || state.ownedVehicles[vehicleId]) return false;
  if (!state.districts[vehicle.districtId]?.unlocked) return false;
  if (!vehicle.unlockRequirements.every(requirement => {
    const rank = requirement.match(/Chrome Jackals rank (\d+)/i);
    if (rank) return factionRank(state.factions.chromeJackals.reputation) >= Number(rank[1]);
    const factionRep = requirement.match(/Chrome Jackals reputation (\d+)/i);
    if (factionRep) return state.factions.chromeJackals.reputation >= Number(factionRep[1]);
    const rep = requirement.match(/^Reputation (\d+)/i);
    if (rep) return state.resources.reputation >= Number(rep[1]);
    const skill = requirement.match(/Vehicle Tuning level (\d+)/i);
    if (skill) return state.skills.vehicleTuning.level >= Number(skill[1]);
    if (requirement === "Corporate Extraction rare reward") return Boolean(state.operationLogs["op-corporate-extraction"]?.firstClear);
    return true;
  })) return false;
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
  emitRewardPopupGroup(next, {
    title: `Vehicle Acquired`,
    category: "item",
    story: [vehicle.name],
  });
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
  const cost = { vehicleParts: 5 * (level + 1), credits: calculateVehicleUpgradeCost(state, level), engineCore: level >= 4 ? 1 : 0 };
  if (!canPay(state, cost)) return state;
  const next = cloneState(state);
  pay(next, cost);
  next.vehicleUpgradeLevels[vehicleId] = level + 1;
  pushCategorizedLog(next, "World", `${vehicle.name} upgraded to +${level + 1}.`);
  emitRewardPopupGroup(next, {
    title: `Vehicle Upgraded`,
    category: "item",
    story: [`${vehicle.name} +${level + 1}`],
  });
  updateOperationAchievements(next);
  return next;
}

function canPay(state: GameState, cost: RewardBundle) {
  return Object.entries(cost).every(([resource, amount]) => (state.resources[resource as keyof typeof state.resources] ?? 0) >= (amount ?? 0));
}

function pay(state: GameState, cost: RewardBundle) {
  applyRewards(state, Object.fromEntries(Object.entries(cost).map(([key, amount]) => [key, -(amount ?? 0)])) as RewardBundle);
}
