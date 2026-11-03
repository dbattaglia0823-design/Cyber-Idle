import { getItem } from "../data/items";
import { recipes } from "../data/recipes";
import { canCraft } from "./craftingProcessing";
import { scaledStats } from "./itemFormulas";
import type { CraftingRecipe, GameState, GearSlot, CyberwareSlot, ItemStats } from "../types";

export const RECIPE_PAGE_SIZE = 15;
export function recipeLocked(state: GameState, recipe: CraftingRecipe) {
  return state.skills[recipe.requiredSkill].level < recipe.requiredLevel || Boolean(recipe.requiredBlueprint && !state.unlockedBlueprints[recipe.requiredBlueprint]) || Boolean(recipe.requiredDistrict && !state.districts[recipe.requiredDistrict]?.unlocked);
}
export function recipeSubcategory(recipe: CraftingRecipe) {
  const item = getItem(recipe.outputItemId);
  return recipe.category === "Weapons" ? item?.weaponClass ?? "Other" : ["Armor", "Cyberware"].includes(recipe.category) ? item?.slot ?? "Other" : "All";
}
export function recipeImprovesGear(state: GameState, recipe: CraftingRecipe) {
  const item = getItem(recipe.outputItemId);
  if (!item?.slot || !["Weapon", "Armor", "Cyberware"].includes(item.type)) return false;
  const equipped = item.type === "Cyberware" ? state.equippedCyberware[item.slot as CyberwareSlot] : state.equippedGear[item.slot as GearSlot];
  if (!equipped || equipped === item.id) return false;
  const before = scaledStats(state, equipped), after = scaledStats(state, item.id);
  const lower = ["attackSpeed", "heatModifier", "neuralInstabilityModifier"];
  return (Object.keys(after) as Array<keyof ItemStats>).some(key => {
    if (key === "attackSpeed" && (!before[key] || !after[key])) return false;
    return lower.includes(key) ? Number(after[key] ?? 0) < Number(before[key] ?? 0) : Number(after[key] ?? 0) > Number(before[key] ?? 0);
  });
}
export interface RecipeBrowserOptions {
  variant?: string; category: string; subcategory: string; query: string; ready: boolean; district: boolean;
  upgrades: boolean; favoritesOnly: boolean; favorites: string[]; showLocked: boolean; sort: string; direction: string;
}
export function browseRecipes(state: GameState, options: RecipeBrowserOptions) {
  const ranks: Record<string, number> = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5, Relic: 7, Prototype: 6 };
  return recipes.filter(recipe =>
    (!options.variant || options.variant === "All" || getItem(recipe.outputItemId)?.type !== "Weapon" || getItem(recipe.outputItemId)?.weaponVariant === options.variant) &&
    (options.category === "All" || recipe.category === options.category) &&
    (options.subcategory === "All" || recipeSubcategory(recipe) === options.subcategory) &&
    recipe.name.toLowerCase().includes(options.query.trim().toLowerCase()) &&
    (!options.ready || canCraft(state, recipe)) &&
    (!options.district || !recipe.requiredDistrict || recipe.requiredDistrict === state.selectedDistrict) &&
    (!options.upgrades || recipeImprovesGear(state, recipe)) &&
    (!options.favoritesOnly || options.favorites.includes(recipe.id)) &&
    (options.showLocked || !recipeLocked(state, recipe))
  ).sort((a,b) => {
    let order = options.sort === "name" ? a.name.localeCompare(b.name) : options.sort === "duration" ? a.durationMs-b.durationMs : options.sort === "rarity" ? (ranks[getItem(a.outputItemId)?.rarity ?? "Common"] ?? 0)-(ranks[getItem(b.outputItemId)?.rarity ?? "Common"] ?? 0) : a.requiredLevel-b.requiredLevel;
    if (!order) order = a.requiredLevel-b.requiredLevel || a.name.localeCompare(b.name);
    return options.direction === "desc" ? -order : order;
  });
}
