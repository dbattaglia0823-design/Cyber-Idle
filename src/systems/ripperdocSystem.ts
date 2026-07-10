import { ripperdocServices } from "../data/ripperdocs";
import { addItem } from "./collectionSystem";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import { cloneState, pushCategorizedLog } from "./gameState";
import { getActiveModifiers } from "./modifiers";
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
  if (service.serviceType === "stabilizer") addItem(next, "neural-stabilizer", 1);
  if (service.serviceType === "treatment" && service.id.includes("emergency")) addItem(next, "medical-gel", 1);
  if (service.neuralInstabilityChange) next.neuralInstability = Math.max(0, next.neuralInstability + service.neuralInstabilityChange);
  if (service.heatChange) next.resources.heat = Math.max(0, next.resources.heat + service.heatChange);
  next.ripperdocUnlocks[service.id] = true;
  discoverDistrictContent(next, service.districtId, `ripperdoc:${service.id}`);
  changeLocalStanding(next, service.districtId, 2, `${service.name} used`);
  pushCategorizedLog(next, "World", `Ripperdoc service used: ${service.name}.`);
  return next;
}

function adjustedServiceCost(state: GameState, cost: Record<ResourceId, number> | Partial<Record<ResourceId, number>>) {
  const reduction = Math.min(0.5, getActiveModifiers(state).ripperdocCostReduction);
  return Object.fromEntries(Object.entries(cost).map(([id, amount]) => [id, amount && amount > 0 ? Math.max(1, Math.ceil(amount * (1 - reduction))) : amount ?? 0]));
}
