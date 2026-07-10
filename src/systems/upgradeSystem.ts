import { getItem } from "../data/items";
import { removeItem } from "./collectionSystem";
import { upgradeCost } from "./itemFormulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { getActiveModifiers } from "./modifiers";
import type { GameState } from "../types";

export function upgradeItem(state: GameState, itemId: string) {
  const item = getItem(itemId);
  const current = state.upgradeLevels[itemId] ?? 0;
  if (!item?.maxUpgradeLevel || current >= item.maxUpgradeLevel) return state;
  if (item.requiredSkill && state.skills[item.requiredSkill].level < Math.max(1, current + 1)) return state;
  const cost = adjustedUpgradeCost(state, upgradeCost(itemId, current));
  if (Object.entries(cost).some(([id, amount]) => amount > 0 && (state.inventory[id] ?? state.resources[id as keyof typeof state.resources] ?? 0) < amount)) return state;
  const next = cloneState(state);
  Object.entries(cost).forEach(([id, amount]) => {
    if (amount <= 0) return;
    if (id in next.resources) next.resources[id as keyof typeof next.resources] -= amount;
    else removeItem(next, id, amount);
  });
  next.upgradeLevels[itemId] = current + 1;
  pushCategorizedLog(next, "World", `Upgraded ${item.name} to +${current + 1}.`);
  return next;
}

function adjustedUpgradeCost(state: GameState, cost: Record<string, number>) {
  const reduction = Math.min(0.5, getActiveModifiers(state).upgradeCostReduction);
  return Object.fromEntries(Object.entries(cost).map(([id, amount]) => [id, amount > 0 ? Math.max(1, Math.ceil(amount * (1 - reduction))) : amount]));
}
