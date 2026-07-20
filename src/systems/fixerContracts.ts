import { fixers } from "../data/fixers";
import { jobs } from "../data/jobs";
import type { ContractType, Fixer, GameState, JobContract } from "../types";

export function fixerTrustRank(state: GameState, fixerId: string) {
  return Math.max(1, Math.min(10, Math.floor((state.fixerTrust[fixerId]?.trust ?? 0) / 10) + 1));
}

export function fixerContracts(fixerId: string) {
  return jobs.filter((job) => job.fixerId === fixerId);
}

export function jobRiskScore(job: JobContract) {
  const hackingPressure = job.tags.includes("hacking") || job.tags.includes("blacknet");
  const tracePressure = job.tags.includes("blacknet")
    ? 12
    : hackingPressure && (job.tags.includes("illegal") || job.tags.includes("blackmarket") || job.factionConflict)
      ? 8
      : hackingPressure
        ? 6
        : 0;
  const successPressure = Math.max(0, 0.9 - job.baseSuccessChance) * 35;
  const conflictPressure = job.factionConflict ? 3 : 0;
  const elitePressure = job.tags.includes("elite") || job.tags.includes("prototype") ? 6 : 0;
  return Math.max(0, job.heatChange) + tracePressure + (job.neuralInstabilityChange ?? 0) * 2 + successPressure + conflictPressure + elitePressure;
}

export function jobRiskTier(job: JobContract) {
  const score = jobRiskScore(job);
  if (score >= 35) return "High";
  if (score >= 14) return "Medium";
  return "Low";
}

export function jobRiskSortRank(job: JobContract) {
  return { Low: 0, Medium: 1, High: 2 }[jobRiskTier(job)];
}

export function jobProgressionLevel(job: JobContract) {
  const levels = job.requirements
    .flatMap((requirement) => [...requirement.matchAll(/level\s+(\d+)|rank\s+(\d+)|trust\s+(\d+)|reputation\s+(\d+)/gi)])
    .map((match) => Number(match[1] ?? match[2] ?? match[3] ?? match[4] ?? 0))
    .filter(Boolean);
  return levels.length ? Math.max(...levels) : 0;
}

export function contractType(job: JobContract): ContractType {
  if (job.contractType) return job.contractType;
  if (job.tags.includes("bounty")) return "Bounty";
  if (job.tags.includes("smuggling")) return "Smuggling";
  if (job.tags.includes("hacking") || job.tags.includes("dataTheft")) return "Data Theft";
  if (job.tags.includes("corporate")) return "Corporate Espionage";
  if (job.tags.includes("vehicle")) return "Vehicle Recovery";
  if (job.tags.includes("medical") || job.tags.includes("cyberware")) return "Cyberware Recovery";
  if (job.tags.includes("faction-conflict")) return "Faction Conflict";
  if (job.tags.includes("combat")) return "Protection";
  if (job.tags.includes("elite")) return "Extraction";
  return "Courier";
}

export function recommendedLoadoutTags(job: JobContract) {
  if (job.recommendedLoadoutTags?.length) return job.recommendedLoadoutTags;
  const type = contractType(job);
  const tags = new Set<string>();
  if (type === "Data Theft") ["blacknet", "smart", "lowHeat"].forEach((tag) => tags.add(tag));
  if (type === "Bounty" || type === "Protection") ["combat", "armorPiercing", "loud"].forEach((tag) => tags.add(tag));
  if (type === "Smuggling" || type === "Courier") ["vehicle", "stealth", "lowHeat"].forEach((tag) => tags.add(tag));
  if (type === "Corporate Espionage") ["corporate", "stealth", "hacking"].forEach((tag) => tags.add(tag));
  if (type === "Cyberware Recovery") ["medical", "cyberware", "lowHeat"].forEach((tag) => tags.add(tag));
  if (type === "Vehicle Recovery") ["vehicle", "scavenging", "smuggling"].forEach((tag) => tags.add(tag));
  job.tags.forEach((tag) => tags.add(tag));
  return [...tags].slice(0, 6);
}

export function failureOutcomes(job: JobContract) {
  if (job.failureOutcomes?.length) return job.failureOutcomes;
  return [
    "Partial payout only",
    `Heat +${Math.max(1, Math.ceil(job.heatChange / 2))}`,
    "District threat may rise",
    job.factionConflict ? "Rival faction reputation loss" : "Fixer trust stalls",
  ];
}

export function fixerTrustRewards(fixer: Fixer) {
  return fixer.trustRewards ?? [
    { rank: 2, description: "Auto-repeat safe contracts begins appearing." },
    { rank: 5, description: "Rare blueprint leads and district introductions improve." },
    { rank: 8, description: "Operation leads and market interventions unlock." },
    { rank: 10, description: "Elite contracts, private buyers, and signature favors." },
  ];
}

export function fixerUnlockSummary(fixer: Fixer) {
  return [
    ...(fixer.uniqueUnlocks ?? []),
    ...fixer.jobChains,
    ...(fixer.operationLeads ?? []),
    ...(fixer.marketConnections ?? []),
    ...(fixer.ripperdocConnections ?? []),
  ];
}

export function fixerById(id: string) {
  return fixers.find((fixer) => fixer.id === id);
}
