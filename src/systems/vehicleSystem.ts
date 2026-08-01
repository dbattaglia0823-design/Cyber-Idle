import { housingOptions } from "../data/housing";
import { vehicles } from "../data/vehicles";
import { applyRewards } from "./actionProcessing";
import { calculateVehicleUpgradeCost } from "./balanceFormulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { updateOperationAchievements } from "./achievements";
import { emitRewardPopupGroup } from "./rewardPopups";
import { factionRank } from "./modifiers";
import type { FactionId, GameState, RewardBundle, SkillId, VehicleDefinition } from "../types";

export function garageSlots(state: GameState) {
  const housing = housingOptions.find((option) => option.id === state.activeResidence);
  return 1 + (housing?.garageSlots ?? 0);
}

export function canBuyVehicle(state: GameState, vehicleId: string) {
  const vehicle = vehicles.find((entry) => entry.id === vehicleId);
  if (!vehicle || state.ownedVehicles[vehicleId]) return false;
  if (Object.values(state.ownedVehicles).filter(Boolean).length >= garageSlots(state)) return false;
  if (!vehicle.unlockRequirements.every((requirement) => vehicleRequirementMet(state, vehicle, requirement))) return false;
  return canPay(state, vehicle.cost);
}

export function vehicleRequirementMet(state: GameState, vehicle: VehicleDefinition, requirement: string) {
  const lower = requirement.toLowerCase();
  if (lower.includes("available early") || lower.includes("major credit sink")) return true;
  const faction = factionRequirement(lower);
  const rank = Number(lower.match(/rank\s+(\d+)/)?.[1] ?? 0);
  if (faction && rank) return factionRank(state.factions[faction].reputation) >= rank;
  const factionReputation = Number(lower.match(/reputation\s+(\d+)/)?.[1] ?? 0);
  if (faction && factionReputation) return state.factions[faction].reputation >= factionReputation;
  const globalReputation = Number(lower.match(/^reputation\s+(\d+)/)?.[1] ?? 0);
  if (globalReputation) return state.resources.reputation >= globalReputation;
  const skillMatch = lower.match(/(vehicle tuning|combat|hacking|cyberware|scavenging)\s+level\s+(\d+)/);
  if (skillMatch) {
    const skills: Record<string, SkillId> = { "vehicle tuning": "vehicleTuning", combat: "combat", hacking: "hacking", cyberware: "cyberware", scavenging: "scavenging" };
    return state.skills[skills[skillMatch[1]]].level >= Number(skillMatch[2]);
  }
  if (lower.includes("unlocked")) return Boolean(state.districts[vehicle.districtId]?.unlocked);
  if (lower.includes("corporate extraction")) return Boolean(state.operationLogs["op-corporate-extraction"]?.firstClear);
  return true;
}

function factionRequirement(requirement: string): FactionId | null {
  if (requirement.includes("chrome jackals")) return "chromeJackals";
  if (requirement.includes("null choir")) return "nullChoir";
  if (requirement.includes("redline saints")) return "redlineSaints";
  if (requirement.includes("ghost market")) return "ghostMarket";
  if (requirement.includes("helix order")) return "helixOrder";
  return null;
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
