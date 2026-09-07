import { getItem } from "../data/items";
import { resourceSourceHint } from "../data/resourceTiers";
import { getActiveModifiers } from "./modifiers";
import type { CraftingRecipe, GameState, ItemRarity } from "../types";

const rarityScale: Record<ItemRarity, number> = {
  Common: 1, Uncommon: 1.15, Rare: 1.35, Epic: 1.6, Legendary: 2, Prototype: 2.4, Relic: 3,
};

export function scaledCraftingCosts(state: GameState, recipe: CraftingRecipe) {
  const output = getItem(recipe.outputItemId);
  const equipment = output && ["Weapon", "Armor", "Cyberware", "WeaponMod", "WeaponAttachment"].includes(output.type);
  const multiplier = equipment ? rarityScale[output.rarity] : 1;
  const reduction = Math.max(0, Math.min(0.5, getActiveModifiers(state).craftingCostReduction));
  // Recipes are the complete bill of materials. Rarity changes quantities only;
  // it must never inject components from districts that are still locked.
  return Object.fromEntries(Object.entries(recipe.inputCosts).map(([id, amount]) =>
    [id, amount > 0 ? Math.max(1, Math.ceil(amount * multiplier * (1 - reduction))) : amount],
  ));
}

export function recipeSourceHints(recipe: CraftingRecipe) {
  return Object.keys(recipe.inputCosts).map(id => `${getItem(id)?.name ?? id}: ${resourceSourceHint(id) ?? getItem(id)?.sourceHint ?? "See the item source guide."}`);
}
