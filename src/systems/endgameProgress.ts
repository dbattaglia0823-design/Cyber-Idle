import { rpgMissions } from "../data/rpgCampaign";
import { missionRewardPools } from "../data/missionRewards";
import { campaignOperations } from "../data/campaign";
import { highThreatOperations, legacyCraftingGoals, collectionRewardMilestones } from "../data/endgameSystems";
import { items } from "../data/items";
import { rpgWeapons, rpgIconic } from "../data/rpgLoot";
import { recipes } from "../data/recipes";
import { skillActions, skillNames } from "../data/skills";
import { combatZones } from "../data/combat";
import { bosses } from "../data/bosses";
import { vendors } from "../data/vendors";
import { jobs } from "../data/jobs";
import { operations } from "../data/operations";
import { percentDropTables } from "../data/percentDrops";
import { ripperdocClinics } from "../data/ripperdocClinics";
import { addItem, removeItem } from "./collectionSystem";
import { cloneState, pushCategorizedLog } from "./gameState";
import { startOperation } from "./operationProcessor";
import { clearActiveActivityForSwitch } from "./activitySwitching";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { DistrictId, GameState, SkillId } from "../types";

export function campaignProgress(state: GameState) {
  const cleared = rpgMissions.filter(mission => state.rpg.completed[mission.id]).length;
  return { cleared, total: rpgMissions.length, complete: cleared === rpgMissions.length, next: rpgMissions.find(mission => !state.rpg.completed[mission.id])?.id };
}

export function syncCampaignCompletion(state: GameState) {
  if (!campaignProgress(state).complete || state.achievements["campaign-complete"]) return;
  state.achievements["campaign-complete"] = true;
  state.storyFlags["city-liberated"] = true;
  // Rewards are part of the final mission's single, previewed payout.
}

const legacyRequirements: Record<string, { skill: SkillId; level: number; district: DistrictId; mastery: number; rank: number; item: string; quantity: number }> = {
  "legacy-reflex-core": { skill: "cyberware", level: 80, district: "neonRow", mastery: 50, rank: 20, item: "iconic-reflex-spine", quantity: 1 },
  "legacy-blacknet-processor": { skill: "hacking", level: 85, district: "blacknetQuarter", mastery: 50, rank: 30, item: "iconic-null-eye", quantity: 1 },
  "legacy-prototype-drive": { skill: "vehicleTuning", level: 100, district: "rustYards", mastery: 50, rank: 30, item: "prototypeDriveUnit", quantity: 12 },
};

export function canAssembleLegacy(state: GameState, id: string) {
  const goal = legacyCraftingGoals.find(goal => goal.id === id);
  const req = legacyRequirements[id];
  return Boolean(goal && req && state.skills[req.skill].level >= req.level && state.districtMastery[req.district].level >= req.mastery && state.streetLegend.rank >= req.rank && Object.entries(goal.materials).every(([id, n]) => owned(state, id) >= n));
}

export function assembleLegacy(state: GameState, id: string) {
  if (!canAssembleLegacy(state, id)) return state;
  const next = cloneState(state);
  const goal = legacyCraftingGoals.find(goal => goal.id === id)!;
  const req = legacyRequirements[id];
  Object.entries(goal.materials).forEach(([id, n]) => removeItem(next, id, n));
  addItem(next, req.item, req.quantity);
  next.endgameStatistics.legacyCraftsCompleted += 1;
  if (req.item.startsWith("iconic-")) next.endgameStatistics.iconicCyberwareObtained += 1;
  next.achievements["first-legacy-craft"] = true;
  emitRewardPopupGroup(next, { title: `Assembled ${goal.name}`, items: { [req.item]: req.quantity } });
  return next;
}

export function highThreatUnlocked(_state: GameState, _id: string) { return false; }
export function startHighThreat(state: GameState, _id: string) { return state; }

export function prestigeSkill(state: GameState, skill: SkillId) {
  if (!state.prestigeProtocol.unlocked || state.skills[skill].level < 150) return state;
  const next = cloneState(state);
  clearActiveActivityForSwitch(state, next, `${skillNames[skill]} Prestige`);
  next.skills[skill] = { level: 1, xp: 0 };
  next.prestigeProtocol.skillPrestiges[skill] = (next.prestigeProtocol.skillPrestiges[skill] ?? 0) + 1;
  next.endgameStatistics.prestigeCount += 1;
  emitRewardPopupGroup(next, { title: `${skillNames[skill]} Prestiged`, story: ["Skill reset to level 1. Permanent +10% XP for this skill; city access and possessions preserved."] });
  return next;
}

  const sourceIds = new Set([
  ...rpgWeapons.map(item => item.id), rpgIconic.id, ...Object.values(missionRewardPools).flat(),
  ...recipes.map(r => r.outputItemId), ...vendors.flatMap(v => v.inventory.map(i => i.itemId)),
  ...skillActions.flatMap(a => [...Object.keys(a.rewards).filter(id => (a.rewards as Record<string, number>)[id] > 0), ...Object.keys(a.itemRewards ?? {}), ...(a.rareDrops ?? []).map(d => d.id)]),
  ...combatZones.flatMap(z => z.enemies.flatMap(e => e.drops.map(d => d.id))), ...bosses.flatMap(b => b.drops.map(d => d.id)),
  ...Object.values(percentDropTables).flatMap(drops => drops.map(d => d.itemId)),
  ...operations.flatMap(o => o.rareDrops.map(d => d.id)),
  ...jobs.flatMap(j => [j.rareReward ?? "", ...(j.rareRewardTable ?? []).map(d => d.itemId)]),
  ...ripperdocClinics.flatMap(c => c.cyberwareInventory), "iconic-reflex-spine", "iconic-null-eye", "iconic-exec-os",
]);
export const collectibleItems = items.filter(item => sourceIds.has(item.id));
export function collectionPercent(state: GameState) { return Math.floor(100 * collectibleItems.filter(item => state.discoveredItems[item.id]).length / Math.max(1, collectibleItems.length)); }
export function claimCollectionReward(state: GameState, percent: number) {
  if (!collectionRewardMilestones.some(m => m.percent === percent) || state.collectionRewardsClaimed[percent] || collectionPercent(state) < percent) return state;
  const next = cloneState(state);
  next.collectionRewardsClaimed[percent] = true;
  next.resources.credits += percent * 100;
  next.resources.scrap += percent * 10;
  emitRewardPopupGroup(next, { title: `${percent}% Collection Reward`, resources: { credits: percent * 100, scrap: percent * 10 } });
  return next;
}
function owned(state: GameState, id: string) { return id in state.resources ? state.resources[id as keyof GameState["resources"]] : state.inventory[id] ?? 0; }
