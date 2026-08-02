import { recipes } from "../data/recipes";
import { getItem } from "../data/items";
import { addMasteryXp, addSkillXp } from "./actionProcessing";
import { addItem, removeItem } from "./collectionSystem";
import { adjustedDurationMs, getActiveModifiers } from "./modifiers";
import { scaledCraftingCosts } from "./craftingCosts";
import { cloneState, pushCategorizedLog } from "./gameState";
import { markRecipeManual } from "./manualDiscovery";
import { addMasteryPoolXp } from "./masteryPool";
import { emitRewardPopupGroup } from "./rewardPopups";
import { clearActiveActivityForSwitch } from "./activitySwitching";
import { addDistrictMasteryXp } from "./districtMasteryProcessor";
import type { CraftingRecipe, DistrictId, GameState } from "../types";

export function getRecipe(recipeId: string) {
  return recipes.find((recipe) => recipe.id === recipeId);
}

export function nextPlayerUpgradeRecipe(itemId: string) {
  return recipes.find((recipe) => recipe.category === "Player Upgrades" && (recipe.inputCosts[itemId] ?? 0) > 0);
}

export function canUpgradePlayerUpgradeFromInventory(state: GameState, itemId: string) {
  const recipe = nextPlayerUpgradeRecipe(itemId);
  return Boolean(recipe && (state.inventory[itemId] ?? 0) > 0 && canCraft(state, recipe));
}

export function upgradePlayerUpgradeFromInventory(state: GameState, itemId: string) {
  const recipe = nextPlayerUpgradeRecipe(itemId);
  if (!recipe || !canUpgradePlayerUpgradeFromInventory(state, itemId)) return state;
  const next = cloneState(state);
  completeCraft(next, recipe);
  pushCategorizedLog(next, "World", `Permanent upgrade installed from inventory: ${recipe.name}.`);
  next.lastSavedAt = Date.now();
  return next;
}

const craftingDistrictOrder: DistrictId[] = [
  "neonRow",
  "rustYards",
  "underpassMarket",
  "blacknetQuarter",
  "helixWard",
  "glasslineDistrict",
  "redlineBlocks",
  "skylineCore",
];

const cumulativeCraftingCategories = new Set<CraftingRecipe["category"]>([
  "Components",
  "Upgrade Parts",
  "Attachments",
  "Weapon Mods",
  "Consumables",
]);

export function craftingLevelRangeForDistrict(districtId: DistrictId | null) {
  if (!districtId) return null;
  const districtIndex = craftingDistrictOrder.indexOf(districtId);
  if (districtIndex < 0) return null;
  return { min: districtIndex * 20 + 1, max: (districtIndex + 1) * 20 };
}

export function recipeAvailableInCurrentDistrict(state: GameState, recipe: CraftingRecipe) {
  const range = craftingLevelRangeForDistrict(state.selectedDistrict);
  if (!range) return false;
  if (cumulativeCraftingCategories.has(recipe.category)) return recipe.requiredLevel <= range.max;
  return recipe.requiredLevel >= range.min && recipe.requiredLevel <= range.max;
}

export function canCraft(state: GameState, recipe: CraftingRecipe) {
  if (!recipeAvailableInCurrentDistrict(state, recipe)) return false;
  if (getRecipeOutput(recipe)?.tags.includes("player-upgrade") && state.discoveredItems[recipe.outputItemId]) return false;
  if (state.skills[recipe.requiredSkill].level < recipe.requiredLevel) return false;
  if (recipe.requiredBlueprint && !state.unlockedBlueprints[recipe.requiredBlueprint]) return false;
  if (recipe.requiredDistrict && !state.districts[recipe.requiredDistrict]?.unlocked) return false;
  return Object.entries(adjustCraftingCosts(state, recipe)).every(([id, amount]) => getCount(state, id) >= amount);
}

function getRecipeOutput(recipe: CraftingRecipe) {
  return getItem(recipe.outputItemId);
}

export function startCraft(state: GameState, recipeId: string, now = Date.now()) {
  const recipe = getRecipe(recipeId);
  if (!recipe || !canCraft(state, recipe)) return state;
  const next = cloneState(state);
  clearActiveActivityForSwitch(state, next, recipe.name);
  next.activeCraft = {
    recipeId,
    startedAt: now,
    durationMs: adjustedDurationMs(state, recipe.durationMs, recipe.tags),
  };
  return next;
}

export function stopCraft(state: GameState) {
  return { ...state, activeCraft: null };
}

export function processCrafting(state: GameState, now = Date.now()) {
  if (!state.activeCraft || now - state.activeCraft.startedAt < state.activeCraft.durationMs) return state;
  const next = cloneState(state);
  let guard = 0;
  while (next.activeCraft && now - next.activeCraft.startedAt >= next.activeCraft.durationMs && guard < 100) {
    const recipe = getRecipe(next.activeCraft.recipeId);
    if (!recipe || !canCraft(next, recipe)) {
      pushCategorizedLog(next, "Warning", "Crafting stopped because its requirements are no longer met in this district.");
      next.activeCraft = null;
      break;
    }
    completeCraft(next, recipe);
    if (getRecipeOutput(recipe)?.tags.includes("player-upgrade")) {
      next.activeCraft = null;
      break;
    }
    next.activeCraft = {
      ...next.activeCraft,
      startedAt: next.activeCraft.startedAt + next.activeCraft.durationMs,
      durationMs: adjustedDurationMs(next, recipe.durationMs, recipe.tags),
    };
    guard += 1;
  }
  next.lastSavedAt = Date.now();
  return next;
}

export function completeCraft(state: GameState, recipe: CraftingRecipe, masteryEfficiency = 1, markManual = true, emitPopup = true) {
  Object.entries(adjustCraftingCosts(state, recipe)).forEach(([id, amount]) => consume(state, id, amount));
  const output = getRecipeOutput(recipe);
  const doubleCraftChance = output?.tags.includes("player-upgrade") ? 0 : getActiveModifiers(state).doubleCraftChance;
  const doubled = doubleCraftChance > 0 && Math.random() < doubleCraftChance;
  const producedQuantity = recipe.outputQuantity * (doubled ? 2 : 1);
  addItem(state, recipe.outputItemId, producedQuantity);
  const levelUps = addSkillXp(state, recipe.requiredSkill, recipe.xpReward);
  const masteryXp = Math.round(recipe.masteryXpReward * masteryEfficiency * (1 + getActiveModifiers(state).masteryXpGain));
  const masteryUps = addMasteryXp(state, recipe.id, masteryXp);
  addMasteryPoolXp(state, recipe.requiredSkill, Math.ceil(masteryXp * 0.25));
  addDistrictMasteryXp(state, recipeDistrict(recipe), "craft", Math.max(3, Math.round(recipe.xpReward * 0.25)));
  if (markManual) markRecipeManual(state, recipe.id);
  pushCategorizedLog(state, "Skill", `Crafted ${recipe.name}${doubled ? " (Replication Matrix doubled the output)" : ""}: +${recipe.xpReward} ${recipe.requiredSkill} XP.`);
  if (emitPopup) {
    emitRewardPopupGroup(state, {
      title: `Crafted ${recipe.name}`,
      xp: { [recipe.requiredSkill]: recipe.xpReward },
      masteryXp,
      poolXp: Math.ceil(masteryXp * 0.25),
      items: { [recipe.outputItemId]: producedQuantity },
      levelUps: levelUps ? [`${recipe.requiredSkill} ${state.skills[recipe.requiredSkill].level}`] : [],
      masteryLevelUps: masteryUps ? [`${recipe.name} ${state.actionMastery[recipe.id].level}`] : [],
    });
  }
  return producedQuantity;
}

function recipeDistrict(recipe: CraftingRecipe): DistrictId | null {
  const haystack = `${recipe.id} ${recipe.name} ${recipe.tags.join(" ")}`.toLowerCase();
  if (haystack.includes("rust") || haystack.includes("vehicle") || haystack.includes("drone")) return "rustYards";
  if (haystack.includes("market") || haystack.includes("contraband") || haystack.includes("smuggler")) return "underpassMarket";
  if (haystack.includes("blacknet") || haystack.includes("daemon") || haystack.includes("trace")) return "blacknetQuarter";
  if (haystack.includes("corp") || haystack.includes("glassline") || haystack.includes("prototype")) return "glasslineDistrict";
  if (haystack.includes("helix") || haystack.includes("medical") || haystack.includes("stabilizer")) return "helixWard";
  if (haystack.includes("redline") || haystack.includes("ballistic") || haystack.includes("combat")) return "redlineBlocks";
  if (haystack.includes("skyline") || haystack.includes("relic") || haystack.includes("legendary")) return "skylineCore";
  return "neonRow";
}

export function adjustCraftingCosts(state: GameState, recipe: CraftingRecipe) {
  return scaledCraftingCosts(state, recipe);
}

function getCount(state: GameState, id: string) {
  if (id in state.resources) return state.resources[id as keyof typeof state.resources];
  return state.inventory[id] ?? 0;
}

function consume(state: GameState, id: string, amount: number) {
  if (id in state.resources) state.resources[id as keyof typeof state.resources] -= amount;
  else removeItem(state, id, amount);
}
