import { perks, specializationMilestones } from "../data/perks";
import { unlockAchievement } from "./achievements";
import { cloneState, pushCategorizedLog } from "./gameState";
import { masteryPoolPercent } from "./masteryPool";
import type { ActiveModifiers, GameState, PerkDefinition, PerkTreeId, SkillId } from "../types";

export function earnedPerkPoints(state: GameState) {
  const totalLevel = Object.values(state.skills).reduce((sum, skill) => sum + skill.level, 0);
  const totalMilestones = Math.floor(totalLevel / 10);
  const skillMilestones = Object.values(state.skills).reduce((sum, skill) => sum + Math.floor(skill.level / 25), 0);
  const operationClears = Object.values(state.operationLogs).filter((log) => log.firstClear).length * 2;
  const bossKills = Object.values(state.bossLogs).filter((log) => log.kills > 0).length * 2;
  const factionRanks = Object.values(state.factions).reduce((sum, faction) => sum + Math.floor(Math.max(0, faction.reputation) / 20), 0);
  const fixerTrust = Object.values(state.fixerTrust).reduce((sum, fixer) => sum + Math.floor(fixer.trust / 25), 0);
  const achievements = Math.floor(Object.values(state.achievements).filter(Boolean).length / 3);
  const masteryPools = (Object.keys(state.skills) as SkillId[]).filter((skill) => masteryPoolPercent(state, skill) >= 100).length * 3;
  return totalMilestones + skillMilestones + operationClears + bossKills + factionRanks + fixerTrust + achievements + masteryPools;
}

export function spentPerkPoints(state: GameState) {
  return perks.reduce((sum, perk) => sum + (state.perkRanks[perk.id] ?? 0) * perk.cost, 0);
}

export function availablePerkPoints(state: GameState) {
  return Math.max(0, Math.max(state.perkPointsEarned, earnedPerkPoints(state)) - spentPerkPoints(state));
}

export function treeInvestment(state: GameState, tree: PerkTreeId) {
  return perks.filter((perk) => perk.tree === tree).reduce((sum, perk) => sum + (state.perkRanks[perk.id] ?? 0) * perk.cost, 0);
}

export function canBuyPerk(state: GameState, perk: PerkDefinition) {
  if ((state.perkRanks[perk.id] ?? 0) >= perk.maxRanks) return false;
  if (availablePerkPoints(state) < perk.cost) return false;
  if (perk.prerequisites.some((id) => !state.perkRanks[id])) return false;
  if (perk.tier >= 2 && treeInvestment(state, perk.tree) < (perk.tier - 1) * 3) return false;
  return meetsNamedUnlock(state, perk);
}

export function buyPerk(state: GameState, perkId: string) {
  const perk = perks.find((entry) => entry.id === perkId);
  if (!perk || !canBuyPerk(state, perk)) return state;
  const next = cloneState(state);
  next.perkPointsEarned = Math.max(next.perkPointsEarned, earnedPerkPoints(next));
  next.perkRanks[perk.id] = (next.perkRanks[perk.id] ?? 0) + 1;
  updateSpecializationMilestones(next);
  updatePerkAchievements(next);
  pushCategorizedLog(next, "World", `Perk purchased: ${perk.name} rank ${next.perkRanks[perk.id]}/${perk.maxRanks}.`);
  return next;
}

export function respecPerks(state: GameState) {
  const cost = respecCost(state);
  if (spentPerkPoints(state) <= 0 || state.resources.credits < cost) return state;
  const next = cloneState(state);
  next.resources.credits -= cost;
  next.perkRanks = {};
  next.specializationMilestones = {};
  next.respecCount += 1;
  unlockAchievement(next, "perk-respec-once", "Respec Perks Once");
  pushCategorizedLog(next, "World", `Perks respeced for ${cost} Credits. Starting path remains permanent.`);
  return next;
}

export function respecCost(state: GameState) {
  return Math.max(100, 100 + spentPerkPoints(state) * 35 + state.respecCount * 150);
}

export function updatePerkProgress(state: GameState) {
  const earned = earnedPerkPoints(state);
  if (earned > state.perkPointsEarned) {
    state.perkPointsEarned = earned;
    pushCategorizedLog(state, "World", `Perk points earned: ${earned}.`);
  }
  updateSpecializationMilestones(state);
  updatePerkAchievements(state);
}

export function applyPerkModifiers(state: GameState, modifiers: ActiveModifiers) {
  perks.forEach((perk) => {
    const rank = state.perkRanks[perk.id] ?? 0;
    if (!rank) return;
    mergeModifiers(modifiers, perk.modifiers, rank);
  });
  if (spentPerkPoints(state) > 0) modifiers.activeSources.push("Perk tree");
}

export function updateSpecializationMilestones(state: GameState) {
  specializationMilestones.forEach((milestone) => {
    const id = `${milestone.tree}-${milestone.points}`;
    if (state.specializationMilestones[id] || treeInvestment(state, milestone.tree) < milestone.points) return;
    state.specializationMilestones[id] = true;
    unlockAchievement(state, "first-specialization-milestone", "Unlock First Specialization Milestone");
    if (milestone.points >= 30) unlockAchievement(state, `tree-30-${milestone.tree}`, `Reach 30 Points in ${milestone.tree}`);
    if (milestone.points >= 50) unlockAchievement(state, `signature-passive-${milestone.tree}`, `Unlock ${milestone.name}`);
    pushCategorizedLog(state, "World", `Specialization milestone: ${milestone.name}.`);
  });
}

function updatePerkAchievements(state: GameState) {
  const spent = spentPerkPoints(state);
  if (spent >= 1) unlockAchievement(state, "first-perk-point", "Spend First Perk Point");
  if (spent >= 10) unlockAchievement(state, "perk-points-10", "Spend 10 Perk Points");
  if (perks.some((perk) => (state.perkRanks[perk.id] ?? 0) >= perk.maxRanks)) unlockAchievement(state, "max-perk", "Max a Perk");
}

function meetsNamedUnlock(state: GameState, perk: PerkDefinition) {
  if (perk.id === "core-simulation-tuning" || perk.id === "ghost-clean-simulation") return Boolean(state.worldUnlocks.usedSimCache);
  if (perk.id === "solo-operation-breacher") return Object.values(state.operationLogs).some((log) => log.firstClear);
  if (perk.id === "solo-critical-routine") return Object.values(state.bossLogs).some((log) => log.kills > 0);
  if (perk.id === "netrunner-trace-ghost") return state.skills.hacking.level >= 10;
  if (perk.id === "netrunner-blacknet-familiarity") return state.districts.blacknetQuarter?.unlocked;
  if (perk.id === "techie-upgrade-planning") return state.skills.cyberware.level >= 8;
  if (perk.id === "techie-ripperdoc-negotiator") return state.districts.helixWard?.unlocked;
  if (perk.id === "techie-blueprint-analyst") return Object.values(state.unlockedBlueprints).some(Boolean);
  if (perk.id === "outrider-hidden-compartments" || perk.id === "outrider-engine-whisperer") return Object.values(state.ownedVehicles).some(Boolean);
  if (perk.id === "outrider-rust-yard-regular") return state.districts.rustYards?.unlocked;
  if (perk.id === "fixer-local-leverage") return Object.values(state.fixerTrust).some((fixer) => fixer.completedJobs > 0);
  if (perk.id === "fixer-negotiated-prices") return Object.values(state.vendors).some((vendor) => vendor.discovered);
  if (perk.id === "fixer-contact-chain") return Object.values(state.companions).some((companion) => companion.unlocked);
  if (perk.id === "fixer-favor-economy") return Object.values(state.factions).some((faction) => faction.reputation >= 20);
  if (perk.id === "ghost-evidence-cleaner") return state.resources.heat < 50;
  if (perk.id === "ghost-shadow-market") return state.factions.ghostMarket.reputation > 0;
  if (perk.id === "ghost-no-witnesses") return Object.values(state.enemyLog).reduce((sum, log) => sum + log.kills, 0) >= 50;
  return true;
}

function mergeModifiers(target: ActiveModifiers, source: Partial<ActiveModifiers>, rank: number) {
  Object.entries(source.skillXp ?? {}).forEach(([skill, value]) => {
    target.skillXp[skill as SkillId] = (target.skillXp[skill as SkillId] ?? 0) + (value ?? 0) * rank;
  });
  Object.entries(source).forEach(([key, value]) => {
    if (key === "skillXp" || key === "activeSources" || typeof value !== "number") return;
    const id = key as keyof ActiveModifiers;
    target[id] = ((target[id] as number) + value * rank) as never;
  });
}
