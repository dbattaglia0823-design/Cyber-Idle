import { combatZones } from "../data/combat";
import { recipes } from "../data/recipes";
import { ripperdocClinics } from "../data/ripperdocClinics";
import { skillActions, skillNames } from "../data/skills";
import { vendors } from "../data/vendors";
import { jobs } from "../data/jobs";
import { percentDropTables } from "../data/percentDrops";
import { getItem } from "../data/items";
import { resourceNames } from "../data/resources";
import { balanceConfig } from "../data/balanceConfig";
import { actionAccessRequirementText, meetsActionAccessRequirement } from "./actionAccess";
import { calculateDropChance, calculateJobRewards, calculateSkillActionRewards } from "./balanceFormulas";
import { skillActionDropChance } from "./actionProcessing";
import { enemyDropChance } from "./combatProcessing";
import { combatTagsForEnemy } from "./combatMatchups";
import { effectivePercentDropChance } from "./percentDrops";
import { canUseVendor, vendorItemUnlocked, vendorPrice } from "./vendorSystem";
import { ripperdocBuyPrice } from "./ripperdocSystem";
import type { DistrictActivityCategory } from "./districtActivityMap";
import type { DistrictId, GameState, SkillId } from "../types";

export interface ItemSourceDestination {
  districtId: DistrictId;
  category: DistrictActivityCategory | `skill-${SkillId}`;
  targetId?: string;
}

export type ItemSourceType =
  | "Skill action"
  | "Rare skill drop"
  | "Enemy drop"
  | "Percent drop"
  | "Contract reward"
  | "Crafting recipe"
  | "Vendor"
  | "Ripperdoc"
  | "Black Market";

export interface ItemSourceEntry {
  type: ItemSourceType;
  name: string;
  detail: string;
  districtId?: DistrictId;
  chance?: number;
  unlocked: boolean;
  requirement?: string;
  goLabel?: string;
  destination?: ItemSourceDestination;
}

export function getItemSources(itemId: string, state: GameState): ItemSourceEntry[] {
  const sources: ItemSourceEntry[] = [];

  skillActions.forEach((action) => {
    const actionReward = (calculateSkillActionRewards(state, action) as Record<string, number>)[itemId] ?? 0;
    if (actionReward > 0) {
      sources.push({
        type: "Skill action",
        name: action.name,
        detail: `Rewards ${actionReward.toLocaleString()} ${resourceName(itemId)} per completion.`,
        districtId: action.districtReq,
        unlocked: sourceDistrictUnlocked(state, action.districtReq) && meetsActionAccessRequirement(state, action),
        requirement: actionAccessRequirementText(state, action),
        goLabel: `Go to ${action.name}`,
        destination: action.districtReq ? { districtId: action.districtReq, category: `skill-${action.skillId}`, targetId: action.id } : undefined,
      });
    }
    action.rareDrops?.filter((drop) => drop.id === itemId).forEach((drop) => {
      const chance = skillActionDropChance(state, action, drop);
      sources.push({
        type: "Rare skill drop",
        name: action.name,
        detail: `${formatChance(chance)} per completion with current bonuses.`,
        districtId: action.districtReq,
        chance,
        unlocked: sourceDistrictUnlocked(state, action.districtReq) && meetsActionAccessRequirement(state, action),
        requirement: actionAccessRequirementText(state, action),
        goLabel: `Go to ${action.name}`,
        destination: action.districtReq ? { districtId: action.districtReq, category: `skill-${action.skillId}`, targetId: action.id } : undefined,
      });
    });
  });

  combatZones.forEach((zone) => {
    zone.enemies.forEach((enemy) => {
      enemy.drops.filter((drop) => drop.id === itemId).forEach((drop) => {
        const chance = enemyDropChance(state, enemy, drop.chance);
        sources.push({
          type: "Enemy drop",
          name: enemy.name,
          detail: `${formatChance(chance)} in ${zone.name} with current bonuses.`,
          districtId: enemy.preferredDistrict,
          chance,
          unlocked: sourceDistrictUnlocked(state, enemy.preferredDistrict),
          goLabel: `Go to ${enemy.name}`,
          destination: enemy.preferredDistrict ? { districtId: enemy.preferredDistrict, category: "combat", targetId: enemy.id } : undefined,
        });
      });
      percentDropTables[enemy.id]?.filter((drop) => drop.itemId === itemId && !enemy.drops.some((authoredDrop) => authoredDrop.id === itemId)).forEach((drop) => {
        const chance = effectivePercentDropChance(state, drop, combatTagsForEnemy(enemy));
        sources.push({
          type: "Percent drop",
          name: enemy.name,
          detail: `${formatChance(chance)} in ${zone.name} with current bonuses.`,
          districtId: enemy.preferredDistrict,
          chance,
          unlocked: sourceDistrictUnlocked(state, enemy.preferredDistrict),
          requirement: drop.requirements?.join(", "),
          goLabel: `Go to ${enemy.name}`,
          destination: enemy.preferredDistrict ? { districtId: enemy.preferredDistrict, category: "combat", targetId: enemy.id } : undefined,
        });
      });
    });
  });

  jobs.forEach((job) => {
    const jobReward = (calculateJobRewards(state, job) as Record<string, number>)[itemId] ?? 0;
    const rareRewardChance = calculateDropChance(job.rareRewardChance ?? balanceConfig.rewards.defaultRareJobChance, state, job.tags);
    if (jobReward > 0 || job.rareReward === itemId) {
      sources.push({
        type: "Contract reward",
        name: job.name,
        detail: job.rareReward === itemId
          ? `Rare fixer contract reward, ${formatChance(rareRewardChance)} per successful contract with current bonuses.`
          : `Rewards ${jobReward.toLocaleString()} ${resourceName(itemId)} per successful contract.`,
        districtId: job.districtId,
        chance: job.rareReward === itemId ? rareRewardChance : undefined,
        unlocked: Boolean(state.districts[job.districtId]?.unlocked),
        requirement: job.requirements.join(", "),
        goLabel: `Go to ${job.name}`,
        destination: { districtId: job.districtId, category: "contracts", targetId: job.id },
      });
    }
    job.rareRewardTable?.filter((drop) => drop.itemId === itemId).forEach((drop) => {
      const chance = calculateDropChance(drop.chancePercent / 100, state, drop.affectedByScenarioModifiers ? job.tags : []);
      sources.push({
        type: "Contract reward",
        name: job.name,
        detail: `Expedition loot, ${formatChance(chance)} per successful contract with current bonuses.`,
        districtId: job.districtId,
        chance,
        unlocked: Boolean(state.districts[job.districtId]?.unlocked),
        requirement: job.requirements.join(", "),
        goLabel: `Go to ${job.name}`,
        destination: { districtId: job.districtId, category: "contracts", targetId: job.id },
      });
    });
  });

  recipes.filter((recipe) => recipe.outputItemId === itemId).forEach((recipe) => {
    const districtId = recipe.requiredDistrict ?? state.selectedDistrict ?? undefined;
    sources.push({
      type: "Crafting recipe",
      name: recipe.name,
      detail: `Crafted with ${skillNames[recipe.requiredSkill]} level ${recipe.requiredLevel}.`,
      unlocked: state.skills[recipe.requiredSkill].level >= recipe.requiredLevel && (!recipe.requiredBlueprint || state.unlockedBlueprints[recipe.requiredBlueprint]),
      requirement: recipe.requiredBlueprint ? `Blueprint: ${getItem(recipe.requiredBlueprint)?.name ?? recipe.requiredBlueprint}` : `${skillNames[recipe.requiredSkill]} level ${recipe.requiredLevel}`,
      goLabel: `Go to ${recipe.name}`,
      districtId,
      destination: districtId ? { districtId, category: "crafting", targetId: recipe.id } : undefined,
    });
  });

  vendors.forEach((vendor) => {
    vendor.inventory.filter((entry) => entry.itemId === itemId).forEach((entry) => {
      const price = vendorPrice(state, vendor, entry);
      sources.push({
        type: "Vendor",
        name: vendor.name,
        detail: `${price.toLocaleString()} Credits at current modifiers. ${entry.sourceHint}`,
        districtId: vendor.districtId,
        unlocked: Boolean(state.districts[vendor.districtId]?.unlocked) && canUseVendor(state, vendor) && vendorItemUnlocked(state, entry),
        requirement: vendor.unlockRequirements.join(", "),
        goLabel: `Go to ${vendor.name}`,
        destination: { districtId: vendor.districtId, category: "market", targetId: itemId },
      });
    });
  });

  ripperdocClinics.forEach((clinic) => {
    if (clinic.cyberwareInventory.includes(itemId)) {
      const price = ripperdocBuyPrice(state, clinic.id, itemId);
      sources.push({
        type: "Ripperdoc",
        name: clinic.name,
        detail: `${price.toLocaleString()} Credits at current modifiers. Cyberware clinic inventory.`,
        districtId: clinic.districtId,
        unlocked: Boolean(state.districts[clinic.districtId]?.unlocked),
        requirement: clinic.unlockRequirements.join(", "),
        goLabel: `Go to ${clinic.name}`,
        destination: { districtId: clinic.districtId, category: "market", targetId: itemId },
      });
    }
  });

  if (!sources.length) {
    const districtId = state.districts.underpassMarket?.unlocked ? "underpassMarket" : "blacknetQuarter";
    const unlocked = Boolean(state.districts[districtId]?.unlocked);
    sources.push({ type: "Black Market", name: "Black Market", detail: "Watch vendors, contracts, and rare market listings.", districtId, unlocked, goLabel: "Go to Black Market", destination: { districtId, category: "market" } });
  }
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
