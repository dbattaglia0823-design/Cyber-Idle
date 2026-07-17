import { getItem } from "../data/items";
import { recipes } from "../data/recipes";
import { removeItem } from "./collectionSystem";
import { calculateUpgradeCost } from "./balanceFormulas";
import { scaledCraftingCosts } from "./craftingCosts";
import { cloneState, pushCategorizedLog } from "./gameState";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { GameState } from "../types";

export function upgradeItem(state: GameState, itemId: string) {
  const item = getItem(itemId);
  const current = state.upgradeLevels[itemId] ?? 0;
  if (!item?.maxUpgradeLevel || current >= item.maxUpgradeLevel) return state;
  if (item.requiredSkill && state.skills[item.requiredSkill].level < Math.max(1, current + 1)) return state;
  const cost = itemUpgradeCost(state, itemId);
  if (!canAffordItemUpgrade(state, itemId)) return state;
  const next = cloneState(state);
  Object.entries(cost).forEach(([id, amount]) => {
    if (amount <= 0) return;
    if (id in next.resources) next.resources[id as keyof typeof next.resources] -= amount;
    else removeItem(next, id, amount);
  });
  next.upgradeLevels[itemId] = current + 1;
  if (item.type === "Weapon" || item.type === "WeaponAttachment" || item.type === "WeaponMod") {
    next.weaponStatistics.weaponsUpgraded += 1;
  }
  pushCategorizedLog(next, "World", `Upgraded ${item.name} to +${current + 1}.`);
  emitRewardPopupGroup(next, {
    title: `Upgraded ${item.name}`,
    category: "item",
    story: [`${item.name} +${current + 1}`],
  });
  return next;
}

export function itemUpgradeCost(state: GameState, itemId: string) {
  const item = getItem(itemId);
  if (!item) return {};
  const current = state.upgradeLevels[itemId] ?? 0;
  if (!item.maxUpgradeLevel || current >= item.maxUpgradeLevel) return {};
  const step = current + 1;
  const recipe = recipes.find((entry) => entry.outputItemId === itemId);
  const cost: Record<string, number> = {
    credits: calculateUpgradeCost(state, item, current),
  };

  if (recipe) {
    const multiplier = 0.75 * Math.pow(step, 1.15);
    Object.entries(scaledCraftingCosts(state, recipe)).forEach(([id, amount]) => {
      if (amount <= 0) return;
      cost[id] = (cost[id] ?? 0) + Math.max(1, Math.ceil(amount * multiplier));
    });
  } else {
    cost[itemId] = Math.ceil(step * 1.5);
  }

  return Object.fromEntries(Object.entries(cost).filter(([, amount]) => amount > 0));
}

export function canAffordItemUpgrade(state: GameState, itemId: string) {
  const item = getItem(itemId);
  const current = state.upgradeLevels[itemId] ?? 0;
  if (!item?.maxUpgradeLevel || current >= item.maxUpgradeLevel) return false;
  if (item.requiredSkill && state.skills[item.requiredSkill].level < Math.max(1, current + 1)) return false;
  const cost = itemUpgradeCost(state, itemId);
  return Object.entries(cost).every(([id, amount]) => {
    if (id in state.resources) return state.resources[id as keyof typeof state.resources] >= amount;
    const owned = state.inventory[id] ?? 0;
    return id === itemId ? owned >= amount + 1 : owned >= amount;
  });
}
