import { getItem } from "./items";
import { recipes } from "./recipes";
import { districtLevelBands } from "./levelBands";
import { materialStage } from "./materialSupply";
import { quickhacks } from "./quickhacks";
import { cyberdecks } from "./cyberdecks";
import { operations } from "./operations";
import { jobs } from "./jobs";
import { bosses } from "./bosses";
import { rpgMissions, type RpgMission } from "./rpgCampaign";
import { districtSupplyItems } from "./materialSupply";
import type { DistrictId } from "../types";

// Retired activities provide an archive of items; equipment is separated from supply payouts.
const archivedRewardPools: Record<DistrictId, string[]> = Object.fromEntries(rpgMissions.map(mission => {
  const ids = new Set<string>();
  const add = (id: string) => { if (id && !["credits", "heat", "reputation"].includes(id)) ids.add(id); };
  for (const operation of operations.filter(entry => entry.districtId === mission.district)) {
    for (const drop of [...operation.rareDrops, ...(bosses.find(boss => boss.id === operation.bossId)?.drops ?? [])]) add(drop.id);
    for (const rewards of [operation.completionRewards, operation.firstClearRewards, operation.repeatClearRewards]) {
      for (const [id, amount] of Object.entries(rewards)) if ((amount ?? 0) > 0) add(id);
    }
    for (const route of operation.routes ?? []) if (route.bonusDrop) add(route.bonusDrop.id);
  }
  for (const job of jobs.filter(entry => entry.districtId === mission.district)) {
    if (job.rareReward) add(job.rareReward);
    for (const drop of job.rareRewardTable ?? []) add(drop.itemId);
    for (const [id, amount] of Object.entries(job.rewards)) if ((amount ?? 0) > 0) add(id);
  }
  ids.delete("boss-data-key");
  districtSupplyItems(mission.district).forEach(id => ids.delete(id));
  if (mission.act === 7) ids.add("iconic-exec-os");
  for (const entry of [...quickhacks, ...cyberdecks].filter(entry => entry.stage === mission.act)) ids.add(entry.id);
  return [mission.district, [...ids]];
})) as Record<DistrictId, string[]>;


const gearTypes = new Set(["Weapon", "Armor", "Cyberware", "WeaponAttachment", "WeaponMod"]);
const crafted = new Set(recipes.map(recipe => recipe.outputItemId));
const rarityFloor: Record<string, number> = { Common: 1, Uncommon: 1, Rare: 20, Epic: 40, Legendary: 80, Prototype: 100, Relic: 140 };
const districts = rpgMissions.map(mission => mission.district);
export const missionRewardPools = Object.fromEntries(districts.map(id => [id, [] as string[]])) as Record<DistrictId, string[]>;
export const gigUniquePools = Object.fromEntries(districts.map(id => [id, [] as string[]])) as Record<DistrictId, string[]>;
const assigned = new Set<string>();
for (const mission of rpgMissions) {
  for (const id of archivedRewardPools[mission.district]) {
    const item = getItem(id);
    if (!item || assigned.has(id) || quickhacks.some(entry => entry.id === id) || cyberdecks.some(entry => entry.id === id)) continue;
    const gear = gearTypes.has(item.type);
    // Regular equipment belongs to its recipe. Non-craftable archive gear remains rare gig loot.
    if (gear && crafted.has(id)) continue;
    const level = Math.max(districtLevelBands[mission.district].entryLevel, materialStage[id] ?? 1, gear ? Math.max(item.requiredLevel ?? 1, rarityFloor[item.rarity]) : 1);
    const district = districts.find(id => districtLevelBands[id].entryLevel >= level) ?? districts[7];
    (gear ? gigUniquePools : missionRewardPools)[district].push(id);
    assigned.add(id);
  }
}
for (let act = 0; act < 7; act++) gigUniquePools[districts[act]].push('rpg-weapon-' + (act + 1));
missionRewardPools.skylineCore.push("boss-data-key");
export const GIG_UNIQUE_CHANCE = 0.05;

/** Preview and guaranteed payout are deterministic; rolling happens only on a completed gig. */
export function missionItemRewards(mission: RpgMission, priorClears = 0): Record<string, number> {
  const supplies = districtSupplyItems(mission.district);
  const pool = missionRewardPools[mission.district];
  const loot: Record<string, number> = { "basic-med-injector": 2 };
  const grant = (id: string | undefined) => { if (id) loot[id] = (loot[id] ?? 0) + 1; };
  if (mission.sideGig) {
    grant(supplies[priorClears % Math.max(1, supplies.length)]);
    grant(pool[priorClears % Math.max(1, pool.length)]);
  } else {
    supplies.forEach(grant);
    grant("boss-data-key");
    pool.filter(id => getItem(id)?.type === "Blueprint").forEach(grant);
    if (mission.act === 7) grant("rpg-afterimage-os");
  }
  return loot;
}
export function rollGigUnique(mission: RpgMission, random: () => number = Math.random): string | undefined {
  const pool = gigUniquePools[mission.district];
  if (!mission.sideGig || !pool.length || random() >= GIG_UNIQUE_CHANCE) return undefined;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
