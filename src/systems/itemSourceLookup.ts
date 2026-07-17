import { bosses } from "../data/bosses";
import { combatZones } from "../data/combat";
import { operations } from "../data/operations";
import { recipes } from "../data/recipes";
import { ripperdocClinics } from "../data/ripperdocClinics";
import { skillActions, skillNames } from "../data/skills";
import { vendors } from "../data/vendors";
import { jobs } from "../data/jobs";
import { percentDropTables } from "../data/percentDrops";
import { getItem } from "../data/items";
import { resourceNames } from "../data/resources";
import { resourceSourceHint } from "../data/resourceTiers";
import { actionAccessRequirementText, meetsActionAccessRequirement } from "./actionAccess";
import type { DistrictId, GameState } from "../types";

export type ItemSourceType =
  | "Skill action"
  | "Rare skill drop"
  | "Enemy drop"
  | "Percent drop"
  | "Boss drop"
  | "Operation reward"
  | "Contract reward"
  | "Crafting recipe"
  | "Vendor"
  | "Ripperdoc"
  | "Black Market"
  | "Item note";

export interface ItemSourceEntry {
  type: ItemSourceType;
  name: string;
  detail: string;
  districtId?: DistrictId;
  chance?: number;
  unlocked: boolean;
  requirement?: string;
  goLabel?: string;
}

export function getItemSources(itemId: string, state: GameState): ItemSourceEntry[] {
  const sources: ItemSourceEntry[] = [];

  skillActions.forEach((action) => {
    if ((action.rewards as Record<string, number>)[itemId]) {
      sources.push({
        type: "Skill action",
        name: action.name,
        detail: `Rewards ${resourceName(itemId)} on completion.`,
        districtId: action.districtReq,
        unlocked: sourceDistrictUnlocked(state, action.districtReq) && meetsActionAccessRequirement(state, action),
        requirement: actionAccessRequirementText(state, action),
        goLabel: `Go to ${action.name}`,
      });
    }
    action.rareDrops?.filter((drop) => drop.id === itemId).forEach((drop) => {
      sources.push({
        type: "Rare skill drop",
        name: action.name,
        detail: `${formatChance(drop.chance)} per completion.`,
        districtId: action.districtReq,
        chance: drop.chance,
        unlocked: sourceDistrictUnlocked(state, action.districtReq) && meetsActionAccessRequirement(state, action),
        requirement: actionAccessRequirementText(state, action),
        goLabel: `Go to ${action.name}`,
      });
    });
  });

  combatZones.forEach((zone) => {
    zone.enemies.forEach((enemy) => {
      enemy.drops.filter((drop) => drop.id === itemId).forEach((drop) => {
        sources.push({
          type: "Enemy drop",
          name: enemy.name,
          detail: `${formatChance(drop.chance)} in ${zone.name}.`,
          districtId: enemy.preferredDistrict,
          chance: drop.chance,
          unlocked: sourceDistrictUnlocked(state, enemy.preferredDistrict),
          goLabel: `Go to ${enemy.name}`,
        });
      });
      percentDropTables[enemy.id]?.filter((drop) => drop.itemId === itemId).forEach((drop) => {
        sources.push({
          type: "Percent drop",
          name: enemy.name,
          detail: `${formatChance(drop.chancePercent / 100)} in ${zone.name}.`,
          districtId: enemy.preferredDistrict,
          chance: drop.chancePercent / 100,
          unlocked: sourceDistrictUnlocked(state, enemy.preferredDistrict),
          requirement: drop.requirements?.join(", "),
          goLabel: `Go to ${enemy.name}`,
        });
      });
    });
  });

  bosses.forEach((boss) => {
    boss.drops.filter((drop) => drop.id === itemId).forEach((drop) => {
      sources.push({ type: "Boss drop", name: boss.name, detail: `${formatChance(drop.chance)} from boss drops.`, chance: drop.chance, unlocked: true, goLabel: `Go to ${boss.name}` });
    });
  });

  operations.forEach((operation) => {
    if ((operation.completionRewards as Record<string, number>)[itemId] || (operation.firstClearRewards as Record<string, number>)[itemId] || (operation.repeatClearRewards as Record<string, number>)[itemId]) {
      sources.push({
        type: "Operation reward",
        name: operation.name,
        detail: "Operation completion reward.",
        districtId: operation.districtId,
        unlocked: Boolean(state.districts[operation.districtId]?.unlocked),
        requirement: operation.unlockRequirements.join(", "),
        goLabel: `Go to ${operation.name}`,
      });
    }
    operation.rareDrops.filter((drop) => drop.id === itemId).forEach((drop) => {
      sources.push({
        type: "Operation reward",
        name: operation.name,
        detail: `Rare operation drop, ${formatChance(drop.chance)}.`,
        districtId: operation.districtId,
        chance: drop.chance,
        unlocked: Boolean(state.districts[operation.districtId]?.unlocked),
        requirement: operation.unlockRequirements.join(", "),
        goLabel: `Go to ${operation.name}`,
      });
    });
  });

  jobs.forEach((job) => {
    if ((job.rewards as Record<string, number>)[itemId] || job.rareReward === itemId) {
      sources.push({
        type: "Contract reward",
        name: job.name,
        detail: job.rareReward === itemId ? "Rare fixer contract reward." : "Fixer contract reward.",
        districtId: job.districtId,
        unlocked: Boolean(state.districts[job.districtId]?.unlocked),
        requirement: job.requirements.join(", "),
        goLabel: `Go to ${job.name}`,
      });
    }
  });

  recipes.filter((recipe) => recipe.outputItemId === itemId).forEach((recipe) => {
    sources.push({
      type: "Crafting recipe",
      name: recipe.name,
      detail: `Crafted with ${skillNames[recipe.requiredSkill]} level ${recipe.requiredLevel}.`,
      unlocked: state.skills[recipe.requiredSkill].level >= recipe.requiredLevel && (!recipe.requiredBlueprint || state.unlockedBlueprints[recipe.requiredBlueprint]),
      requirement: recipe.requiredBlueprint ? `Blueprint: ${getItem(recipe.requiredBlueprint)?.name ?? recipe.requiredBlueprint}` : `${skillNames[recipe.requiredSkill]} level ${recipe.requiredLevel}`,
      goLabel: `Go to ${recipe.name}`,
    });
  });

  vendors.forEach((vendor) => {
    vendor.inventory.filter((entry) => entry.itemId === itemId).forEach((entry) => {
      sources.push({
        type: "Vendor",
        name: vendor.name,
        detail: `${entry.price} Credits. ${entry.sourceHint}`,
        districtId: vendor.districtId,
        unlocked: Boolean(state.districts[vendor.districtId]?.unlocked),
        requirement: vendor.unlockRequirements.join(", "),
        goLabel: `Go to ${vendor.name}`,
      });
    });
  });

  ripperdocClinics.forEach((clinic) => {
    if (clinic.cyberwareInventory.includes(itemId)) {
      sources.push({
        type: "Ripperdoc",
        name: clinic.name,
        detail: "Cyberware clinic inventory.",
        districtId: clinic.districtId,
        unlocked: Boolean(state.districts[clinic.districtId]?.unlocked),
        requirement: clinic.unlockRequirements.join(", "),
        goLabel: `Go to ${clinic.name}`,
      });
    }
  });

  const item = getItem(itemId);
  const hint = resourceSourceHint(itemId) ?? item?.sourceHint;
  if (hint) sources.push({ type: "Item note", name: resourceName(itemId), detail: hint, unlocked: true });
  if (!sources.length) sources.push({ type: "Black Market", name: "Black Market", detail: "Watch vendors, contracts, and rare market listings.", unlocked: Boolean(state.districts.blacknetQuarter?.unlocked || state.districts.underpassMarket?.unlocked), goLabel: "Go to Black Market" });
  return sources;
}

export function bestItemSources(itemId: string, state: GameState) {
  return getItemSources(itemId, state).slice(0, 8);
}

export function itemDisplayName(itemId: string) {
  return getItem(itemId)?.name ?? resourceNames[itemId as keyof typeof resourceNames] ?? itemId;
}

function sourceDistrictUnlocked(state: GameState, districtId?: DistrictId) {
  return !districtId || Boolean(state.districts[districtId]?.unlocked);
}

function resourceName(itemId: string) {
  return itemDisplayName(itemId);
}

function formatChance(chance: number) {
  if (chance <= 0) return "Unavailable";
  return `1/${Math.max(1, Math.round(1 / chance))}`;
}
