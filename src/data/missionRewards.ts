import { quickhacks } from "./quickhacks";
import { cyberdecks } from "./cyberdecks";
import { operations } from "./operations";
import { jobs } from "./jobs";
import { bosses } from "./bosses";
import { rpgMissions, type RpgMission } from "./rpgCampaign";
import { districtSupplyItems } from "./materialSupply";
import type { DistrictId } from "../types";

// Retired activity definitions are a loot archive only. Their items now come
// from main missions and predictable, replayable district gig rotations.
export const missionRewardPools: Record<DistrictId, string[]> = Object.fromEntries(rpgMissions.map(mission => {
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

export function missionItemRewards(mission: RpgMission, priorClears = 0): Record<string, number> {
  const supplies = districtSupplyItems(mission.district);
  const pool = missionRewardPools[mission.district];
  const loot: Record<string, number> = { "basic-med-injector": 2, "boss-data-key": 1 };
  const grant = (id: string | undefined, amount = 1) => { if (id) loot[id] = (loot[id] ?? 0) + amount; };
  if (mission.sideGig) {
    grant(supplies[priorClears % Math.max(1, supplies.length)]);
    // Three consecutive archive items per clear keeps every former exclusive
    // obtainable in a short, visible cycle rather than a rare-drop lottery.
    for (let index = 0; index < Math.min(3, pool.length); index++) grant(pool[(priorClears * 3 + index) % pool.length]);
  } else {
    supplies.forEach(id => grant(id));
    pool.slice(0, 4).forEach(id => grant(id));
    for (const entry of [...quickhacks, ...cyberdecks].filter(entry => entry.stage === mission.act)) loot[entry.id] = Math.max(1, loot[entry.id] ?? 0);
    grant(`rpg-weapon-${Math.min(7, mission.act + 1)}`);
    if (mission.act === 7) { grant("rpg-afterimage-os"); grant("iconic-exec-os"); }
  }
  return loot;
}
