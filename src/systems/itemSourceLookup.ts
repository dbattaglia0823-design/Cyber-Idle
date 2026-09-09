import { quickhacks } from "../data/quickhacks";
import { cyberdecks } from "../data/cyberdecks";
import { districtProgressionOrder } from "../data/districtProgressionOrder";
import { softwareStageUnlocked } from "./quickhackSystem";
import { missionItemRewards, missionRewardPools } from "../data/missionRewards";
import { bosses } from "../data/bosses";
import { rpgMissions, allRpgMissions } from "../data/rpgCampaign";
import { districtSupplyItems } from "../data/materialSupply";
import { missionAvailable } from "./rpgSystem";
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
import { actionAccessRequirementText } from "./actionAccess";
import { canStartSkillAction } from "./actionProcessing";
import { canFightEnemy } from "./combatProcessing";
import { canStartOperation } from "./operationProcessor";
import { canAttemptJob } from "./jobProcessing";
import { canUseVendor, vendorItemUnlocked, vendorPrice } from "./vendorSystem";
import type { DistrictId, GameState } from "../types";

export type ItemSourceType =
  | "Skill action"
  | "Rare skill drop"
  | "Enemy drop"
  | "Percent drop"
  | "Boss drop"
  | "Operation reward"
  | "Contract reward"
  | "Mission reward"
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
  const software = quickhacks.find(entry => entry.id === itemId) ?? cyberdecks.find(entry => entry.id === itemId);
  if (software) sources.push({ type: "Vendor", name: "Netrunner exchange", detail: `${software.price} credits in Character > Quickhacks. Programs can also be crafted with credits and Encrypted Data.`, districtId: districtProgressionOrder[software.stage], unlocked: softwareStageUnlocked(state, software.stage) });
  if (itemId === "rpg-weapon-0") sources.push({ type: "Mission reward", name: "Sable's field kit", detail: "Guaranteed starting sidearm. Claim the field kit in Main > Missions.", unlocked: Boolean(state.startingPath) && !state.rpg.starterClaimed });
  allRpgMissions.forEach(mission => {
    const supply = districtSupplyItems(mission.district);
    const rewards = missionItemRewards(mission);
    if (rewards[itemId] || (mission.sideGig && [...supply, ...missionRewardPools[mission.district]].includes(itemId))) {
      sources.push({ type: "Mission reward", name: mission.title, detail: mission.sideGig ? "Guaranteed local-gig loot rotation. The mission preview shows the next payout; replay to cycle through all district loot." : "Guaranteed main-job reward. Open Missions > Main jobs.", districtId: mission.district, unlocked: missionAvailable(state, mission) });
    }
  });
  if (itemId === "iconic-reflex-spine" || itemId === "iconic-null-eye") {
    sources.push({ type: "Crafting recipe", name: itemId === "iconic-reflex-spine" ? "Legacy Reflex Core" : "Blacknet Processor", detail: "Assemble in Main > Progress > Street Legend > Legacy. The bench lists the required skills, mastery and materials.", unlocked: state.streetLegend.rank >= (itemId === "iconic-reflex-spine" ? 20 : 30) });
  }
  skillActions.forEach((action) => {
    const quantity = (action.rewards as Record<string, number>)[itemId] ?? action.itemRewards?.[itemId] ?? 0;
    if (quantity > 0) {
      sources.push({
        type: "Skill action",
        name: action.name,
        detail: `Guaranteed ${quantity} ${resourceName(itemId)} per completion (before resource bonuses).`,
        districtId: action.districtReq,
        unlocked: canStartSkillAction(state, action),
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
        unlocked: canStartSkillAction(state, action),
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
          unlocked: canFightEnemy(state, enemy),
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
          unlocked: canFightEnemy(state, enemy),
          requirement: drop.requirements?.join(", "),
          goLabel: `Go to ${enemy.name}`,
        });
      });
    });
  });

  recipes.filter((recipe) => recipe.outputItemId === itemId).forEach((recipe) => {
    sources.push({
      type: "Crafting recipe",
      name: recipe.name,
      detail: `Crafted with ${skillNames[recipe.requiredSkill]} level ${recipe.requiredLevel}.`,
      districtId: recipe.requiredDistrict,
      unlocked: sourceDistrictUnlocked(state, recipe.requiredDistrict) && state.skills[recipe.requiredSkill].level >= recipe.requiredLevel && (!recipe.requiredBlueprint || state.unlockedBlueprints[recipe.requiredBlueprint]),
      requirement: recipe.requiredBlueprint ? `Blueprint: ${getItem(recipe.requiredBlueprint)?.name ?? recipe.requiredBlueprint}` : `${skillNames[recipe.requiredSkill]} level ${recipe.requiredLevel}`,
      goLabel: `Go to ${recipe.name}`,
    });
  });

  vendors.forEach((vendor) => {
    vendor.inventory.filter((entry) => entry.itemId === itemId).forEach((entry) => {
      sources.push({
        type: "Vendor",
        name: vendor.name,
        detail: `${vendorPrice(state, vendor, entry)} Credits. ${entry.sourceHint}`,
        districtId: vendor.districtId,
        unlocked: canUseVendor(state, vendor) && vendorItemUnlocked(state, entry),
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
  if (hint && !sources.some(source => source.type === "Mission reward")) sources.push({ type: "Item note", name: resourceName(itemId), detail: hint, unlocked: true });
  if (!sources.length) sources.push({ type: "Black Market", name: "Black Market", detail: "Watch vendors, local gigs, and rare market listings.", unlocked: Boolean(state.districts.blacknetQuarter?.unlocked || state.districts.underpassMarket?.unlocked), goLabel: "Go to Black Market" });
  return sources.sort((a, b) => Number(a.type === "Item note") - Number(b.type === "Item note") || Number(b.unlocked) - Number(a.unlocked) || Number(Boolean(a.chance)) - Number(Boolean(b.chance)));
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
