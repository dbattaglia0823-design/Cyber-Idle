import { factions } from "../data/factions";
import { jobs } from "../data/jobs";
import { balanceConfig } from "../data/balanceConfig";
import { addSkillXp, applyRewards, formatRewards } from "./actionProcessing";
import { adjustedDurationMs, factionRank, getActiveModifiers } from "./modifiers";
import { applyRiskEvents } from "./riskEvents";
import { cloneState, pushCategorizedLog } from "./gameState";
import { updateWorldUnlocks } from "./worldUnlocks";
import { markJobManual } from "./manualDiscovery";
import { changeDistrictThreat } from "./districtThreat";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import { scenarioBonusForTags } from "./scenarioModifiers";
import { addWeaponClassXp, equippedWeaponClass } from "./weaponSystem";
import { unlockAchievement } from "./achievements";
import { calculateHeatGain, calculateJobRewards, calculateJobSuccessChance } from "./balanceFormulas";
import { emitRewardPopupGroup } from "./rewardPopups";
import { clearActiveActivityForSwitch } from "./activitySwitching";
import { addDistrictMasteryXp, districtMasteryRewardBonus } from "./districtMasteryProcessor";
import type { DistrictId, FactionId, GameState, JobContract, SkillId } from "../types";

export function getJob(jobId: string) {
  return jobs.find((job) => job.id === jobId);
}

export function availableJobsForFixer(state: GameState, fixerId: string) {
  return jobs.filter((job) => job.fixerId === fixerId && state.districts[job.districtId]?.unlocked);
}

export function startJob(state: GameState, jobId: string, now = Date.now()) {
  const job = getJob(jobId);
  if (!job || !canAttemptJob(state, job)) return state;
  const trust = state.fixerTrust[job.fixerId]?.trust ?? 0;
  const next = cloneState(state);
  clearActiveActivityForSwitch(state, next, job.name);
  next.activeJob = {
    jobId,
    startedAt: now,
    durationMs: adjustedDurationMs(state, job.durationMs, job.tags),
    repeats: Boolean(
      job.repeatable &&
      job.autoRepeatTrustReq !== undefined &&
      trust >= job.autoRepeatTrustReq &&
      state.manualDiscovery.jobs[job.id],
    ),
  };
  return next;
}

export function stopJob(state: GameState) {
  return { ...state, activeJob: null };
}

export function processJobCompletion(state: GameState, now = Date.now()) {
  if (!state.activeJob || now - state.activeJob.startedAt < state.activeJob.durationMs) return state;
  const next = cloneState(state);
  let guard = 0;

  while (next.activeJob && now - next.activeJob.startedAt >= next.activeJob.durationMs && guard < 50) {
    const job = getJob(next.activeJob.jobId);
    if (!job || !canAttemptJob(next, job)) {
      next.activeJob = null;
      break;
    }
    completeJob(next, job);
    if (!next.activeJob.repeats) {
      next.activeJob = null;
      break;
    }
    next.activeJob = {
      ...next.activeJob,
      startedAt: next.activeJob.startedAt + next.activeJob.durationMs,
      durationMs: adjustedDurationMs(next, job.durationMs, job.tags),
    };
    guard += 1;
  }

  next.lastSavedAt = Date.now();
  return next;
}

export function canAttemptJob(state: GameState, job: JobContract) {
  if (!state.districts[job.districtId]?.unlocked) return false;
  if (job.id === "job-data-leak-sale" && state.skills.hacking.level < 10) return false;
  if (job.id === "job-junkyard-sweep" && (state.skills.scavenging.level < 20 || !state.districts.rustYards.unlocked)) return false;
  if (job.id === "job-smuggled-axle" && factionRank(state.factions.chromeJackals.reputation) < 2) return false;
  if (job.id === "job-debt-collection" && (state.skills.combat.level < 40 || !state.districts.underpassMarket.unlocked)) return false;
  if (job.id === "job-terminal-ghost" && (state.skills.hacking.level < 60 || !state.districts.blacknetQuarter.unlocked)) return false;
  return job.requirements.every((requirement) => jobRequirementMet(state, job, requirement));
}

export function jobRequirementDetails(state: GameState, job: JobContract) {
  return visibleJobRequirements(job).map((requirement) => ({
    text: requirement,
    met: jobRequirementMet(state, job, requirement),
  }));
}

export function visibleJobRequirements(job: JobContract) {
  const extra: string[] = [];
  if (job.id === "job-data-leak-sale") extra.push("Hacking level 10");
  if (job.id === "job-junkyard-sweep") extra.push("Scavenging level 20");
  if (job.id === "job-smuggled-axle") extra.push("Chrome Jackals rank 2");
  if (job.id === "job-debt-collection") extra.push("Street Combat level 40");
  if (job.id === "job-terminal-ghost") extra.push("Hacking level 60");
  return [...new Set([...job.requirements, ...extra])].filter((requirement) => !isDistrictUnlockedRequirement(requirement));
}

function isDistrictUnlockedRequirement(requirement: string) {
  const normalized = requirement.toLowerCase();
  return normalized.includes("unlocked") && Object.values(districtRequirementNames).some((name) => normalized.includes(name.toLowerCase()));
}

export function jobRequirementMet(state: GameState, job: JobContract, requirement: string): boolean {
  const normalized = requirement.toLowerCase();
  if (normalized.includes(" or ")) return requirement.split(/\s+or\s+/i).some((part) => jobRequirementMet(state, job, part.trim()));

  const districtEntry = Object.entries(districtRequirementNames).find(([, name]) => normalized.includes(name.toLowerCase()) && normalized.includes("unlocked"));
  if (districtEntry) return Boolean(state.districts[districtEntry[0] as DistrictId]?.unlocked);

  const districtMasteryEntry = Object.entries(districtRequirementNames).find(([, name]) => normalized.includes(name.toLowerCase()) && normalized.includes("district mastery"));
  const districtMasteryMatch = normalized.match(/district mastery\s+level\s+(\d+)/i);
  if (districtMasteryEntry && districtMasteryMatch) return (state.districtMastery[districtMasteryEntry[0] as DistrictId]?.level ?? 1) >= Number(districtMasteryMatch[1]);

  const levelMatch = normalized.match(/level\s+(\d+)/i);
  if (levelMatch) {
    const skillEntry = Object.entries(skillRequirementNames).find(([, label]) => normalized.includes(label.toLowerCase()));
    if (skillEntry) return state.skills[skillEntry[0] as SkillId].level >= Number(levelMatch[1]);
  }

  const rankMatch = normalized.match(/rank\s+(\d+)/i);
  if (rankMatch) {
    const factionEntry = factions.find((faction) => normalized.includes(faction.name.toLowerCase()));
    const factionId = factionEntry?.id ?? job.factionId;
    return factionRank(state.factions[factionId].reputation) >= Number(rankMatch[1]);
  }

  const reputationMatch = normalized.match(/reputation\s+(\d+)/i);
  if (reputationMatch) return state.resources.reputation >= Number(reputationMatch[1]);

  const trustMatch = normalized.match(/trust\s+(\d+)/i);
  if (trustMatch) return (state.fixerTrust[job.fixerId]?.trust ?? 0) >= Number(trustMatch[1]);

  return true;
}

const skillRequirementNames: Record<SkillId, string> = {
  scavenging: "Scavenging",
  hacking: "Hacking",
  cyberware: "Cyberware Engineering",
  combat: "Street Combat",
  vehicleTuning: "Vehicle Tuning",
  blackMarket: "Black Market",
  medical: "Medical Knowledge",
  streetcraft: "Streetcraft",
};

const districtRequirementNames: Record<DistrictId, string> = {
  neonRow: "Neon Row",
  rustYards: "Rust Yards",
  underpassMarket: "Underpass Market",
  blacknetQuarter: "Blacknet Quarter",
  glasslineDistrict: "Glassline District",
  helixWard: "Helix Ward",
  redlineBlocks: "Redline Blocks",
  skylineCore: "Skyline Core",
};

function completeJob(state: GameState, job: JobContract) {
  const weaponClass = equippedWeaponClass(state);
  const scenario = scenarioBonusForTags(state, job.tags);
  const chance = calculateJobSuccessChance(job, state).chance;
  const success = Math.random() <= chance;
  const heat = Math.max(0, calculateHeatGain(state, job.heatChange, job.tags) + Math.round(job.heatChange * scenario.heatChange));
  const neural = 0;
  state.resources.heat += heat;

  if (success) {
    const rewards = calculateJobRewards(state, job);
    const districtBonus = districtMasteryRewardBonus(state, job.districtId);
    Object.entries(rewards).forEach(([resource, amount]) => {
      if ((amount ?? 0) > 0) rewards[resource as keyof typeof rewards] = Math.max(1, Math.round((amount ?? 0) * (1 + districtBonus)));
    });
    applyRewards(state, rewards);
    applySkillXp(state, job, 1);
    applyFactionReputation(state, job);
    applyFixerTrust(state, job);
    applyCompanionRelationship(state, job);
    const rareReward = maybeRareReward(state, job);
    markJobManual(state, job.id);
    state.marketStatistics.contractsCompletedByFixer[job.fixerId] = (state.marketStatistics.contractsCompletedByFixer[job.fixerId] ?? 0) + 1;
    unlockAchievement(state, "first-fixer-contract", "Complete First Fixer Contract");
    if (weaponClass) {
      addWeaponClassXp(state, weaponClass, Math.max(8, Math.round((job.skillXp?.combat ?? 20) * 0.25)), true);
      state.weaponStatistics.jobsByClass[weaponClass] = (state.weaponStatistics.jobsByClass[weaponClass] ?? 0) + 1;
      if (job.tags.includes("stealth") && state.weaponLoadouts[state.equippedGear.weapon ?? ""]?.attachments && Object.values(state.weaponLoadouts[state.equippedGear.weapon ?? ""].attachments).some((id) => id?.includes("suppressor"))) {
        state.achievements["stealth-job-suppressor"] = true;
      }
    }
    discoverDistrictContent(state, job.districtId, `job:${job.id}`);
    changeLocalStanding(state, job.districtId, 3, `${job.name} completed`);
    addDistrictMasteryXp(state, job.districtId, "job", Math.max(10, Math.round(Object.values(job.skillXp ?? {}).reduce((sum, xp) => sum + (xp ?? 0), 0) * 0.35)));
    pushCategorizedLog(state, "Job", `${job.name} succeeded: ${formatRewards(rewards)}.`);
    emitRewardPopupGroup(state, {
      title: `${job.name} Complete`,
      resources: rewards,
      reputation: { Fixer: job.fixerTrustReward },
      heat,
      neuralInstability: neural,
      rareDrops: rareReward ? [rareReward] : [],
    });
  } else {
    const partial = calculateJobRewards(state, { ...job, rewards: { credits: Math.floor((job.rewards.credits ?? 0) * balanceConfig.jobs.partialFailurePayout) } });
    applyRewards(state, partial);
    state.resources.heat += balanceConfig.jobs.failureHeatFlat;
    state.marketStatistics.contractsFailed += 1;
    changeDistrictThreat(state, job.districtId, balanceConfig.jobs.failureThreat);
    changeLocalStanding(state, job.districtId, -1, `${job.name} failed`);
    pushCategorizedLog(state, "Warning", `${job.name} failed. Partial payout received and Heat increased.`);
    emitRewardPopupGroup(state, {
      title: `${job.name} Failed`,
      category: "warning",
      resources: partial,
      heat: heat + balanceConfig.jobs.failureHeatFlat,
      neuralInstability: neural,
      warnings: ["Partial payout received"],
    });
  }

  applyRiskEvents(state);
  updateWorldUnlocks(state);
}

function applySkillXp(state: GameState, job: JobContract, multiplier: number) {
  Object.entries(job.skillXp ?? {}).forEach(([skill, xp]) => {
    addSkillXp(state, skill as keyof GameState["skills"], Math.round((xp ?? 0) * multiplier));
  });
}

function applyFactionReputation(state: GameState, job: JobContract) {
  Object.entries(job.factionReputation).forEach(([factionId, amount]) => {
    const id = factionId as FactionId;
    const beforeRank = factionRank(state.factions[id].reputation);
    state.factions[id].reputation += Math.round((amount ?? 0) * (1 + getActiveModifiers(state).factionReputationGain));
    const afterRank = factionRank(state.factions[id].reputation);
    if (afterRank > beforeRank) {
      pushCategorizedLog(state, "World", `${factionName(id)} reached faction rank ${afterRank}.`);
    }
  });

  if (!job.factionConflict) return;
  const faction = factions.find((entry) => entry.id === job.factionId);
  faction?.rivals.forEach((rival) => {
    state.factions[rival].reputation = Math.max(-50, state.factions[rival].reputation - 1);
  });
}

function applyFixerTrust(state: GameState, job: JobContract) {
  const trust = state.fixerTrust[job.fixerId] ?? { trust: 0, completedJobs: 0 };
  trust.trust += Math.round(job.fixerTrustReward * (1 + getActiveModifiers(state).fixerTrustGain));
  trust.completedJobs += 1;
  state.fixerTrust[job.fixerId] = trust;
  if (Math.floor(trust.trust / 10) + 1 >= 5) unlockAchievement(state, "fixer-rank-5", "Reach Fixer Trust Rank 5");
  pushCategorizedLog(state, "World", `Fixer trust +${job.fixerTrustReward}.`);
}

function applyCompanionRelationship(state: GameState, job: JobContract) {
  Object.entries(job.companionRelationship ?? {}).forEach(([id, amount]) => {
    const companion = state.companions[id];
    if (!companion?.unlocked) return;
    companion.relationship = Math.min(100, companion.relationship + Math.round((amount ?? 0) * (1 + getActiveModifiers(state).companionRelationshipGain)));
    pushCategorizedLog(state, "World", `Companion relationship +${amount}: ${id}.`);
  });
}

function maybeRareReward(state: GameState, job: JobContract) {
  if (!job.rareReward || Math.random() > balanceConfig.rewards.defaultRareJobChance) return "";
  state.inventory[job.rareReward] = (state.inventory[job.rareReward] ?? 0) + 1;
  pushCategorizedLog(state, "Loot", `Rare job reward: ${job.rareReward}.`);
  return job.rareReward;
}

function factionName(id: FactionId) {
  return factions.find((faction) => faction.id === id)?.name ?? id;
}
