import { getItem } from "../data/items";
import { resourceSourceHint } from "../data/resourceTiers";
import { getActiveModifiers } from "./modifiers";
import type { CraftingRecipe, GameState, ItemRarity } from "../types";

const rarityScale: Record<ItemRarity, number> = {
  Common: 1,
  Uncommon: 1.55,
  Rare: 3,
  Epic: 5.8,
  Legendary: 9.5,
  Prototype: 14,
  Relic: 22,
};

export function scaledCraftingCosts(state: GameState, recipe: CraftingRecipe) {
  const output = getItem(recipe.outputItemId);
  const rarity = output?.rarity ?? "Common";
  const tier = output?.tier ?? 1;
  const base = mergeCosts(recipe.inputCosts, rarityExtras(recipe, rarity, tier, output?.type));
  delete base[recipe.outputItemId];
  const multiplier = rarityScale[rarity] * Math.max(1, tier * 0.85);
  const reduction = Math.min(0.5, getActiveModifiers(state).craftingCostReduction);
  return Object.fromEntries(
    Object.entries(base).map(([id, amount]) => [id, amount > 0 ? Math.max(1, Math.ceil(amount * multiplier * (1 - reduction))) : amount]),
  );
}

export function recipeSourceHints(recipe: CraftingRecipe) {
  return Object.keys(rarityExtras(recipe, getItem(recipe.outputItemId)?.rarity ?? "Common", getItem(recipe.outputItemId)?.tier ?? 1, getItem(recipe.outputItemId)?.type))
    .map((id) => `${getItem(id)?.name ?? id}: ${resourceSourceHint(id) ?? getItem(id)?.sourceHint ?? "Activity, vendor, or operation source."}`);
}

function rarityExtras(recipe: CraftingRecipe, rarity: ItemRarity, tier: number, type?: string) {
  const extra: Record<string, number> = {};
  if (rarity !== "Common") add(extra, type === "Cyberware" ? "cyberware-frame" : type === "Weapon" ? "weapon-frame" : "circuit-bundle", 1);
  if (["Rare", "Epic", "Legendary", "Prototype", "Relic"].includes(rarity)) {
    add(extra, type === "Cyberware" ? "neural-connector" : type === "Weapon" ? "precision-parts" : "mod-core", Math.max(1, tier - 1));
    if (recipe.requiredBlueprint) add(extra, "rare-blueprint-fragment", 1);
    add(extra, "scrap", 10 + tier * 8);
    add(extra, "circuitBoards", 4 + tier * 3);
  }
  if (["Epic", "Legendary", "Prototype", "Relic"].includes(rarity)) {
    add(extra, type === "Cyberware" ? "stabilized-chrome-frame" : type === "Weapon" ? "prototype-weapon-core" : "blacknet-cipher", 1);
    add(extra, "faction-authorization", 1);
    add(extra, "cyberwareParts", 4 + tier * 3);
    add(extra, "neon-circuit-fragment", 2);
  }
  if (["Legendary", "Prototype", "Relic"].includes(rarity)) {
    add(extra, "boss-data-key", 1);
    add(extra, "engineCore", 1 + Math.floor(tier / 2));
    add(extra, "encryptedData", 18 + tier * 6);
  }
  if (["Prototype", "Relic"].includes(rarity)) {
    add(extra, type === "Cyberware" ? "prototype-neural-core" : type === "Weapon" ? "prototype-weapon-core" : "prototypeDriveUnit", 1);
    add(extra, "stabilizer-compound", 2);
    add(extra, "urban-reflex-chip", 1);
  }
  if (rarity === "Relic") {
    add(extra, "rare-blueprint-fragment", 4);
    add(extra, "relic-circuit", 1);
    add(extra, "legendary-chrome-matrix", 1);
  }
  return extra;
}

function mergeCosts(...costs: Array<Record<string, number>>) {
  const merged: Record<string, number> = {};
  costs.forEach((cost) => {
    Object.entries(cost).forEach(([id, amount]) => add(merged, id, amount));
  });
  return merged;
}

function add(target: Record<string, number>, id: string, amount: number) {
  target[id] = (target[id] ?? 0) + amount;
}
