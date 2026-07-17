import { streetLegendMilestones, streetLegendXpForRank } from "../data/streetLegendData";
import { challengeContracts } from "../data/challengeContracts";
import { factionRank } from "./modifiers";
import type { GameState } from "../types";

export function syncStreetLegend(state: GameState) {
  const totalXp = calculateStreetLegendXp(state);
  let remaining = totalXp;
  let rank = 1;
  while (rank < 100 && remaining >= streetLegendXpForRank(rank)) {
    remaining -= streetLegendXpForRank(rank);
    rank += 1;
  }
  state.streetLegend.totalXp = totalXp;
  state.streetLegend.rank = rank;
  state.streetLegend.xp = remaining;
  state.endgameStatistics.streetLegendXpEarned = totalXp;
  streetLegendMilestones.forEach((milestone) => {
    if (rank < milestone.rank || state.streetLegend.claimedMilestones[milestone.rank]) return;
    state.streetLegend.claimedMilestones[milestone.rank] = true;
    state.unlocks[`streetLegend:${milestone.unlockKey}`] = true;
  });
  state.prestigeProtocol.unlocked = rank >= 50 || state.streetLegend.claimedMilestones[50];
  if (rank >= 10) state.achievements["street-legend-rank-10"] = true;
  if (rank >= 50) state.achievements["street-legend-rank-50"] = true;
  if (state.prestigeProtocol.unlocked) state.achievements["unlock-prestige-protocol"] = true;
}

export function streetLegendRankProgress(state: GameState) {
  return {
    rank: state.streetLegend.rank,
    xp: state.streetLegend.xp,
    nextXp: streetLegendXpForRank(state.streetLegend.rank),
  };
}

function calculateStreetLegendXp(state: GameState) {
  const skillXp = Object.values(state.skills).reduce((sum, skill) => sum + skill.level * 8 + Math.floor(skill.level / 25) * 100, 0);
  const weaponXp = Object.values(state.weaponClasses).reduce((sum, weapon) => sum + weapon.level * 5 + Math.floor(weapon.level / 25) * 80, 0);
  const districtXp = Object.values(state.districtMastery).reduce((sum, mastery) => sum + mastery.level * 12 + Object.values(mastery.milestones).filter(Boolean).length * 160, 0);
  const operationXp = Object.values(state.operationLogs).reduce((sum, log) => sum + (log.firstClear ? 240 : 0) + log.clears * 12, 0);
  const bossXp = Object.values(state.bossLogs).reduce((sum, log) => sum + log.kills * 18 + bossMilestoneXp(log.kills), 0);
  const rareXp = state.weaponStatistics.rareDropsFound * 25 + Object.values(state.discoveredItems).filter(Boolean).length * 6;
  const factionXp = Object.values(state.factions).reduce((sum, faction) => sum + factionRank(faction.reputation) * 45, 0);
  const fixerXp = Object.values(state.fixerTrust).reduce((sum, fixer) => sum + Math.floor(fixer.trust / 10) * 18 + fixer.completedJobs * 5, 0);
  const achievementXp = Object.values(state.achievements).filter(Boolean).length * 35;
  const challengeXp = challengeContracts.reduce((sum, challenge) => {
    const progress = state.challengeProgress[challenge.id];
    return sum + challenge.tiers.reduce((tierSum, tier) => tierSum + (progress?.completedTiers[tier.tier] ? tier.streetLegendXp : 0), 0);
  }, 0);
  const storyXp = Object.values(state.storyArcs).filter((arc) => arc.status === "completed").length * 300;
  const highThreatXp = Object.values(state.highThreatOperationClears).reduce((sum, clears) => sum + clears * 60, 0);
  return skillXp + weaponXp + districtXp + operationXp + bossXp + rareXp + factionXp + fixerXp + achievementXp + challengeXp + storyXp + highThreatXp;
}

function bossMilestoneXp(kills: number) {
  return [1, 5, 10, 25, 50, 100, 250, 500, 1000].filter((milestone) => kills >= milestone).length * 85;
}
