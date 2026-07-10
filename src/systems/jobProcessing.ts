import { factions } from "../data/factions";
import { jobs } from "../data/jobs";
import { addSkillXp, applyRewards, formatRewards } from "./actionProcessing";
import { applyHeatModifier, applyNeuralModifier, applyRewardModifiers, adjustedDurationMs, factionRank, getActiveModifiers, jobSuccessChance } from "./modifiers";
import { applyRiskEvents } from "./riskEvents";
import { cloneState, pushCategorizedLog } from "./gameState";
import { updateWorldUnlocks } from "./worldUnlocks";
import { markJobManual } from "./manualDiscovery";
import { changeDistrictThreat, districtThreatPenalty } from "./districtThreat";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import type { FactionId, GameState, JobContract } from "../types";

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
  return {
    ...state,
    activeAction: null,
    activeCraft: null,
    activeJob: {
      jobId,
      startedAt: now,
      durationMs: adjustedDurationMs(state, job.durationMs, job.tags),
      repeats: Boolean(
        job.repeatable &&
        job.autoRepeatTrustReq !== undefined &&
        trust >= job.autoRepeatTrustReq &&
        state.manualDiscovery.jobs[job.id],
      ),
    },
  };
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
  if (job.id === "job-data-leak-sale" && state.skills.hacking.level < 3) return false;
  if (job.id === "job-junkyard-sweep" && state.skills.scavenging.level < 5 && !state.districts.rustYards.unlocked) return false;
  if (job.id === "job-smuggled-axle" && factionRank(state.factions.chromeJackals.reputation) < 2) return false;
  if (job.id === "job-debt-collection" && state.skills.combat.level < 4) return false;
  if (job.id === "job-terminal-ghost" && state.skills.hacking.level < 5) return false;
  return true;
}

function completeJob(state: GameState, job: JobContract) {
  const chance = Math.max(0.05, jobSuccessChance(state, job.baseSuccessChance, job.tags) - districtThreatPenalty(state, job.districtId));
  const success = Math.random() <= chance;
  const heat = applyHeatModifier(state, job.heatChange, job.tags);
  const neural = job.neuralInstabilityChange ? applyNeuralModifier(state, job.neuralInstabilityChange, job.tags) : 0;
  state.resources.heat += heat;
  state.neuralInstability += neural;

  if (success) {
    const rewards = applyRewardModifiers(state, job.rewards, job.tags);
    applyRewards(state, rewards);
    applySkillXp(state, job, 1);
    applyFactionReputation(state, job);
    applyFixerTrust(state, job);
    applyCompanionRelationship(state, job);
    maybeRareReward(state, job);
    markJobManual(state, job.id);
    discoverDistrictContent(state, job.districtId, `job:${job.id}`);
    changeLocalStanding(state, job.districtId, 3, `${job.name} completed`);
    pushCategorizedLog(state, "Job", `${job.name} succeeded: ${formatRewards(rewards)}.`);
  } else {
    const partial = applyRewardModifiers(state, { credits: Math.floor((job.rewards.credits ?? 0) * 0.25) }, job.tags);
    applyRewards(state, partial);
    state.resources.heat += 2;
    changeDistrictThreat(state, job.districtId, 4);
    changeLocalStanding(state, job.districtId, -1, `${job.name} failed`);
    pushCategorizedLog(state, "Warning", `${job.name} failed. Partial payout received and Heat increased.`);
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
  if (!job.rareReward || Math.random() > 0.08) return;
  state.inventory[job.rareReward] = (state.inventory[job.rareReward] ?? 0) + 1;
  pushCategorizedLog(state, "Loot", `Rare job reward: ${job.rareReward}.`);
}

function factionName(id: FactionId) {
  return factions.find((faction) => faction.id === id)?.name ?? id;
}
