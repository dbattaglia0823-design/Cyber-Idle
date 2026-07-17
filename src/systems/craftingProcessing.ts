import { recipes } from "../data/recipes";
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

export function canCraft(state: GameState, recipe: CraftingRecipe) {
  if (state.skills[recipe.requiredSkill].level < recipe.requiredLevel) return false;
  if (recipe.requiredBlueprint && !state.unlockedBlueprints[recipe.requiredBlueprint]) return false;
  return Object.entries(adjustCraftingCosts(state, recipe)).every(([id, amount]) => getCount(state, id) >= amount);
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
      pushCategorizedLog(next, "Warning", "Crafting stopped because materials are missing.");
      next.activeCraft = null;
      break;
    }
    completeCraft(next, recipe);
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
  addItem(state, recipe.outputItemId, recipe.outputQuantity);
  const levelUps = addSkillXp(state, recipe.requiredSkill, recipe.xpReward);
  const masteryXp = Math.round(recipe.masteryXpReward * masteryEfficiency * (1 + getActiveModifiers(state).masteryXpGain));
  const masteryUps = addMasteryXp(state, recipe.id, masteryXp);
  addMasteryPoolXp(state, recipe.requiredSkill, Math.ceil(masteryXp * 0.25));
  addDistrictMasteryXp(state, recipeDistrict(recipe), "craft", Math.max(3, Math.round(recipe.xpReward * 0.25)));
  if (markManual) markRecipeManual(state, recipe.id);
  pushCategorizedLog(state, "Skill", `Crafted ${recipe.name}: +${recipe.xpReward} ${recipe.requiredSkill} XP.`);
  if (emitPopup) {
    emitRewardPopupGroup(state, {
      title: `Crafted ${recipe.name}`,
      xp: { [recipe.requiredSkill]: recipe.xpReward },
      masteryXp,
      poolXp: Math.ceil(masteryXp * 0.25),
      items: { [recipe.outputItemId]: recipe.outputQuantity },
      levelUps: levelUps ? [`${recipe.requiredSkill} ${state.skills[recipe.requiredSkill].level}`] : [],
      masteryLevelUps: masteryUps ? [`${recipe.name} ${state.actionMastery[recipe.id].level}`] : [],
    });
  }
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
