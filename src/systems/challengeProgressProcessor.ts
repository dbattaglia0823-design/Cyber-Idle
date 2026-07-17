import { challengeContracts, type ChallengeObjective } from "../data/challengeContracts";
import type { GameState, SkillId } from "../types";

export function syncChallengeProgress(state: GameState) {
  let completedCount = 0;
  challengeContracts.forEach((challenge) => {
    const progress = state.challengeProgress[challenge.id] ?? { completedTiers: {} };
    challenge.tiers.forEach((tier) => {
      if (progress.completedTiers[tier.tier]) {
        completedCount += 1;
        return;
      }
      if (!challengeObjectiveComplete(state, tier.objective)) return;
      progress.completedTiers[tier.tier] = true;
      completedCount += 1;
      state.achievements["first-challenge-contract"] = true;
      if (tier.tier === "Gold") state.achievements["first-gold-challenge"] = true;
    });
    state.challengeProgress[challenge.id] = progress;
  });
  state.endgameStatistics.challengeContractsCompleted = completedCount;
}

export function challengeObjectiveProgress(state: GameState, objective: ChallengeObjective) {
  switch (objective.type) {
    case "operationClears":
      return { current: state.operationLogs[objective.operationId]?.clears ?? 0, target: objective.count };
    case "enemyKills":
      return { current: state.enemyLog[objective.enemyId]?.kills ?? 0, target: objective.count };
    case "bossKills":
      return { current: state.bossLogs[objective.bossId]?.kills ?? 0, target: objective.count };
    case "districtMastery":
      return { current: state.districtMastery[objective.districtId]?.level ?? 1, target: objective.level };
    case "actionMastery":
      return { current: state.actionMastery[objective.actionId]?.level ?? 1, target: objective.level };
    case "skillLevel":
      return { current: state.skills[objective.skillId as SkillId]?.level ?? 1, target: objective.level };
    case "heatBelow":
      return { current: Math.max(0, objective.value - state.resources.heat), target: objective.value };
    case "itemOwned":
      return { current: state.inventory[objective.itemId] ?? 0, target: objective.count };
  }
}

export function challengeObjectiveText(objective: ChallengeObjective) {
  switch (objective.type) {
    case "operationClears": return `Clear ${objective.operationId} ${objective.count}x`;
    case "enemyKills": return `Kill ${objective.enemyId} ${objective.count}x`;
    case "bossKills": return `Defeat ${objective.bossId} ${objective.count}x`;
    case "districtMastery": return `${objective.districtId} mastery ${objective.level}`;
    case "actionMastery": return `${objective.actionId} mastery ${objective.level}`;
    case "skillLevel": return `${objective.skillId} level ${objective.level}`;
    case "heatBelow": return `Keep Heat below ${objective.value}`;
    case "itemOwned": return `Own ${objective.count} ${objective.itemId}`;
  }
}

function challengeObjectiveComplete(state: GameState, objective: ChallengeObjective) {
  const progress = challengeObjectiveProgress(state, objective);
  if (objective.type === "heatBelow") return state.resources.heat < objective.value;
  return progress.current >= progress.target;
}
