import { recipes, legacyRecipeAliases } from "../data/recipes";
import { addMasteryXp, addSkillXp } from "./actionProcessing";
import { addItem, removeItem } from "./collectionSystem";
import { adjustedDurationMs, getActiveModifiers } from "./modifiers";
import { scaledCraftingCosts } from "./craftingCosts";
import { MAX_CRAFT_TARGET } from "./craftAutomation";
import { addQueuedCraft } from "./craftQueue";
import { cloneState, pushCategorizedLog } from "./gameState";
import { markRecipeManual } from "./manualDiscovery";
import { addMasteryPoolXp } from "./masteryPool";
import { emitRewardPopupGroup } from "./rewardPopups";
import { addDistrictMasteryXp } from "./districtMasteryProcessor";
import { updateWorldUnlocks } from "./worldUnlocks";
import type { CraftingRecipe, DistrictId, GameState } from "../types";

export function getRecipe(recipeId: string) {
  return recipes.find((recipe) => recipe.id === (legacyRecipeAliases[recipeId] ?? recipeId));
}

export function canCraft(state: GameState, recipe: CraftingRecipe) {
  if (state.skills[recipe.requiredSkill].level < recipe.requiredLevel) return false;
  if (recipe.requiredBlueprint && !state.unlockedBlueprints[recipe.requiredBlueprint]) return false;
  if (recipe.requiredDistrict && !state.districts[recipe.requiredDistrict]?.unlocked) return false;
  return Object.entries(adjustCraftingCosts(state, recipe)).every(([id, amount]) => getCount(state, id) >= amount);
}

export function startCraft(state: GameState, recipeId: string, now = Date.now(), targetQuantity?: number, reserveMaterials = true) {
  recipeId = legacyRecipeAliases[recipeId] ?? recipeId;
  const recipe = getRecipe(recipeId);
  if (!recipe || !canCraft(state, recipe)) return state;
  if (targetQuantity !== undefined && (!Number.isSafeInteger(targetQuantity) || targetQuantity < 1 || targetQuantity > MAX_CRAFT_TARGET)) return state;
  const next = cloneState(state);
  // Background crafting does not interrupt skill training, combat, missions or queues.
  pushCategorizedLog(next, "World", state.activeCraft ? `Changed background crafting to ${recipe.name}.` : `Started background crafting: ${recipe.name}.`);
  next.activeCraft = {
    recipeId,
    startedAt: now,
    durationMs: adjustedDurationMs(state, recipe.durationMs, recipe.tags),
    targetQuantity, completedQuantity: targetQuantity ? 0 : undefined,
    reserveMaterials,
  };
  // Manually starting a recipe replaces any paused work but retains the
  // planned upcoming recipes. They will follow this newly started craft.
  next.craftQueue.blockedCraft = null;
  next.craftQueue.paused = false;
  return next;
}

// Every queued recipe has its own target and protection choice. Queueing a
// future recipe never changes the currently running crafting timer.
export function enqueueCraft(state: GameState, recipeId: string, targetQuantity?: number, reserveMaterials = true, now = Date.now()) {
  const next = addQueuedCraft(state, recipeId, targetQuantity, reserveMaterials);
  if (next === state) return state;
  if (!next.activeCraft && !next.craftQueue.blockedCraft && !next.craftQueue.paused) {
    startNextQueuedCraft(next, now);
  }
  return next;
}

export function pauseCraftQueue(state: GameState) {
  if (state.craftQueue.paused || (!state.craftQueue.entries.length && !state.craftQueue.blockedCraft)) return state;
  const next = cloneState(state);
  next.craftQueue.paused = true;
  next.craftQueue.message = "Upcoming crafting paused. The current recipe continues.";
  return next;
}

// Starting a blocked craft uses the original target and completed quantity.
// Its timer restarts at the current time, not at the old offline timestamp.
export function resumeCraftQueue(state: GameState, now = Date.now()) {
  if (state.activeCraft || (!state.craftQueue.entries.length && !state.craftQueue.blockedCraft)) return state;
  const next = cloneState(state);
  const blocked = next.craftQueue.blockedCraft;
  if (blocked) {
    const recipe = getRecipe(blocked.recipeId);
    if (!recipe || !canCraft(next, recipe)) {
      next.craftQueue.paused = true;
      next.craftQueue.message = `Cannot resume ${recipe?.name ?? blocked.recipeId}: requirements or ingredients missing.`;
      return next;
    }
    next.activeCraft = { ...blocked, startedAt: now, durationMs: adjustedDurationMs(next, recipe.durationMs, recipe.tags) };
    next.craftQueue.blockedCraft = null;
    next.craftQueue.paused = false;
    next.craftQueue.message = `Resumed ${recipe.name}; upcoming recipes retained.`;
    return next;
  }
  next.craftQueue.paused = false;
  startNextQueuedCraft(next, now);
  return next;
}

export function stopCraft(state: GameState) {
  if (!state.activeCraft) return state;
  const next = cloneState(state);
  if (next.craftQueue.entries.length) {
    next.craftQueue.blockedCraft = { ...next.activeCraft! };
    next.craftQueue.paused = true;
    next.craftQueue.message = "Crafting paused. Resume the current recipe to continue with the queued recipes.";
  }
  next.activeCraft = null;
  return next;
}

// Called on a precise completion boundary, preserving chronological progress
// during long offline processing and large live ticks.
function startNextQueuedCraft(next: GameState, at: number) {
  if (next.craftQueue.paused || next.activeCraft) return;
  const queued = next.craftQueue.entries[0];
  if (!queued) {
    next.craftQueue.message = "Crafting queue complete.";
    return;
  }
  const recipe = getRecipe(queued.recipeId);
  if (!recipe || !canCraft(next, recipe)) {
    next.craftQueue.paused = true;
    next.craftQueue.message = `Queued craft waiting: ${recipe?.name ?? queued.recipeId} needs ingredients or recipe access. Add materials and resume.`;
    pushCategorizedLog(next, "Warning", next.craftQueue.message);
    return;
  }
  next.craftQueue.entries.shift();
  next.activeCraft = {
    recipeId: recipe.id, startedAt: at,
    durationMs: adjustedDurationMs(next, recipe.durationMs, recipe.tags),
    targetQuantity: queued.targetQuantity, completedQuantity: queued.targetQuantity ? 0 : undefined,
    reserveMaterials: queued.reserveMaterials,
  };
  next.craftQueue.message = `Now crafting ${recipe.name}. ${next.craftQueue.entries.length} more queued.`;
  pushCategorizedLog(next, "World", next.craftQueue.message);
}

export function processCrafting(state: GameState, now = Date.now(), maxCompletions = 100) {
  if (!state.activeCraft || now - state.activeCraft.startedAt < state.activeCraft.durationMs) return state;
  const next = cloneState(state);
  let guard = 0;
  while (next.activeCraft && now - next.activeCraft.startedAt >= next.activeCraft.durationMs && guard < Math.max(1, Math.min(100, maxCompletions))) {
    const active = next.activeCraft;
    const boundary = active.startedAt + active.durationMs;
    const recipe = getRecipe(active.recipeId);
    if (active.targetQuantity && (active.completedQuantity ?? 0) >= active.targetQuantity) {
      next.activeCraft = null;
      startNextQueuedCraft(next, boundary);
      continue;
    }
    if (!recipe || !canCraft(next, recipe)) {
      if (active.targetQuantity) {
        next.craftQueue.blockedCraft = { ...active };
        next.craftQueue.paused = true;
        next.craftQueue.message = `Crafting paused: ${recipe?.name ?? active.recipeId} needs ingredients or access to finish its target.`;
      } else {
        next.craftQueue.message = `Continuous crafting finished: ${recipe?.name ?? active.recipeId} ran out of materials.`;
      }
      pushCategorizedLog(next, "Warning", next.craftQueue.message);
      next.activeCraft = null;
      if (!active.targetQuantity) startNextQueuedCraft(next, boundary);
      break;
    }
    completeCraft(next, recipe);
    next.craftQueue.completedCycles += 1;
    guard += 1;
    if (active.targetQuantity) {
      const completed = (active.completedQuantity ?? 0) + recipe.outputQuantity;
      if (completed >= active.targetQuantity) {
        pushCategorizedLog(next, "World", `Crafting target met: ${recipe.name} ${completed}/${active.targetQuantity} produced.`);
        next.activeCraft = null;
        startNextQueuedCraft(next, boundary);
        continue;
      }
      next.activeCraft.completedQuantity = completed;
    }
    next.activeCraft = {
      ...next.activeCraft,
      startedAt: boundary,
      durationMs: adjustedDurationMs(next, recipe.durationMs, recipe.tags),
    };
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
  addDistrictMasteryXp(state, recipeDistrict(recipe), "craft", Math.max(3, Math.round(recipe.masteryXpReward * 0.55)));
  if (markManual) markRecipeManual(state, recipe.id);
  updateWorldUnlocks(state);
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
  if (recipe.requiredDistrict) return recipe.requiredDistrict;
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
