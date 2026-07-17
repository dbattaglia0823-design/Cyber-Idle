import { storyArcs } from "../data/storyArcs";
import { applyRewards } from "./actionProcessing";
import { changeDistrictThreat } from "./districtThreat";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import { cloneState, pushCategorizedLog } from "./gameState";
import { emitRewardPopupGroup } from "./rewardPopups";
import type { FactionId, GameState, StoryArcDefinition, StoryArcState, StoryChoice, StoryObjective, StoryStepDefinition } from "../types";

export function getStoryArc(id: string) {
  return storyArcs.find((arc) => arc.id === id);
}

export function storyArcState(state: GameState, arc: StoryArcDefinition): StoryArcState {
  return state.storyArcs[arc.id] ?? initialArcState(arc);
}

export function activeStoryStep(state: GameState, arc: StoryArcDefinition) {
  const arcState = storyArcState(state, arc);
  return arc.steps.find((step) => step.id === arcState.activeStepId) ?? arc.steps.find((step) => !arcState.completedSteps[step.id]) ?? arc.steps[0];
}

export function updateStoryProgress(state: GameState) {
  const next = cloneState(state);
  storyArcs.forEach((arc) => updateArcProgress(next, arc));
  return next;
}

export function chooseStoryChoice(state: GameState, arcId: string, stepId: string, choiceId: string) {
  const arc = getStoryArc(arcId);
  const step = arc?.steps.find((entry) => entry.id === stepId);
  const choice = step?.choices?.find((entry) => entry.id === choiceId);
  if (!arc || !step || !choice) return state;
  const next = cloneState(state);
  ensureArc(next, arc);
  const arcState = next.storyArcs[arc.id];
  if (arcState.completedSteps[step.id] || arcState.choices[step.id]) return state;
  if (step.objective.type !== "makeChoice" && !storyObjectiveComplete(next, step.objective)) return state;
  applyChoice(next, arc, step, choice);
  completeStep(next, arc, step);
  updateArcProgress(next, arc);
  next.lastSavedAt = Date.now();
  return next;
}

export function storyProgressForArc(state: GameState, arc: StoryArcDefinition) {
  const arcState = storyArcState(state, arc);
  const completed = arc.steps.filter((step) => arcState.completedSteps[step.id]).length;
  return Math.round((completed / Math.max(1, arc.steps.length)) * 100);
}

export function storyObjectiveProgress(state: GameState, objective: StoryObjective) {
  switch (objective.type) {
    case "completeSkillAction":
      return state.manualDiscovery.skillActions[objective.target] ? 1 : 0;
    case "reachSkillLevel":
      return state.skills[objective.target as keyof GameState["skills"]]?.level ?? 0;
    case "killEnemy":
      return state.enemyLog[objective.target]?.kills ?? 0;
    case "clearOperation":
      return state.operationLogs[objective.target]?.clears ?? 0;
    case "completeFixerContract":
      if (objective.target.startsWith("job-")) return state.manualDiscovery.jobs[objective.target] ? 1 : 0;
      return state.fixerTrust[objective.target]?.completedJobs ?? 0;
    case "gainFactionReputation":
      return state.factions[objective.target as FactionId]?.reputation ?? 0;
    case "buyInstallCyberware":
      return Object.values(state.equippedCyberware).includes(objective.target) || Boolean(state.inventory[objective.target]) ? 1 : 0;
    case "useRipperdocService":
      return state.ripperdocUnlocks[objective.target] ? 1 : 0;
    case "listSellBlackMarketItem":
      return state.blackMarketCompletedSales.some((listing) => listing.itemId === objective.target || objective.target === "any") ? 1 : 0;
    case "buyHousing":
      return state.ownedHousing[objective.target] ? 1 : 0;
    case "unlockDistrict":
      return state.districts[objective.target as keyof GameState["districts"]]?.unlocked ? 1 : 0;
    case "reachLocalStanding":
      return state.districtStanding[objective.target as keyof GameState["districtStanding"]]?.standing ?? 0;
    case "reduceDistrictThreat":
      return Math.max(0, 100 - (state.districtThreat[objective.target as keyof GameState["districtThreat"]]?.level ?? 100));
    case "craftItem":
      return state.manualDiscovery.recipes[objective.target] || Boolean(state.inventory[objective.target]) ? 1 : 0;
    case "equipItem":
      return Object.values(state.equippedGear).includes(objective.target) || Object.values(state.equippedCyberware).includes(objective.target) ? 1 : 0;
    case "completeCompanionInteraction":
      return state.companions[objective.target]?.relationship ?? 0;
    case "makeChoice":
      return Object.values(state.storyArcs).some((arcState) => Object.values(arcState.choices).includes(objective.target)) || state.storyFlags[objective.target] ? 1 : 0;
    default:
      return 0;
  }
}

export function storyObjectiveComplete(state: GameState, objective: StoryObjective) {
  return storyObjectiveProgress(state, objective) >= objective.requiredCount;
}

export function availableStoryArcsForDistrict(state: GameState, districtId: string) {
  return storyArcs.filter((arc) => arc.districtId === districtId && storyArcState(state, arc).status !== "locked");
}

function updateArcProgress(state: GameState, arc: StoryArcDefinition) {
  ensureArc(state, arc);
  const arcState = state.storyArcs[arc.id];
  if (arc.roadmap) {
    arcState.status = "locked";
    return;
  }
  if (!arcUnlocked(state, arc)) {
    arcState.status = "locked";
    return;
  }
  if (arcState.status === "locked") arcState.status = "available";
  const current = activeStoryStep(state, arc);
  arcState.activeStepId = current?.id ?? null;
  if (!current) return;
  if (!current.choices?.length && storyObjectiveComplete(state, current.objective)) {
    completeStep(state, arc, current);
  }
  if (arc.steps.every((step) => arcState.completedSteps[step.id])) {
    arcState.status = "completed";
    if (!arcState.rewardsClaimed) {
      if (arc.rewards) applyRewards(state, arc.rewards);
      arc.outcomeFlags.forEach((flag) => {
        state.storyFlags[flag] = true;
        state.worldUnlocks[flag] = true;
      });
      arcState.rewardsClaimed = true;
      state.achievements[`story-${arc.id}`] = true;
      if (arc.category === "Main Arc" && arc.id.includes("act-1")) state.achievements["complete-act-1"] = true;
      if (arc.category === "District Arc") state.achievements["complete-first-district-arc"] = true;
      if (arc.category === "Fixer Chain") state.achievements["complete-first-fixer-chain"] = true;
      pushCategorizedLog(state, "World", `Story arc completed: ${arc.name}.`);
      emitRewardPopupGroup(state, {
        title: `Story Complete: ${arc.name}`,
        category: "story",
        resources: arc.rewards,
        achievements: [arc.name],
        durationMs: 5200,
      });
    }
  } else if (arcState.status === "available") {
    arcState.status = "active";
  }
}

function completeStep(state: GameState, arc: StoryArcDefinition, step: StoryStepDefinition) {
  const arcState = state.storyArcs[arc.id];
  if (arcState.completedSteps[step.id]) return;
  arcState.completedSteps[step.id] = true;
  if (step.rewards) applyRewards(state, step.rewards);
  (step.worldFlags ?? []).forEach((flag) => {
    state.storyFlags[flag] = true;
    state.worldUnlocks[flag] = true;
    if (flag.startsWith("lead-")) state.operationLeads[flag.replace("lead-", "op-")] = true;
  });
  (step.unlocks ?? []).forEach((unlock) => applyStoryUnlock(state, unlock));
  if (arc.districtId) discoverDistrictContent(state, arc.districtId, `story:${arc.id}:${step.id}`);
  pushCategorizedLog(state, "World", `Story step completed: ${step.title}.`);
  emitRewardPopupGroup(state, {
    title: `Story Step: ${step.title}`,
    category: "story",
    resources: step.rewards,
    durationMs: 4200,
  });
  const nextId = step.nextStepIds?.find((id) => !arcState.completedSteps[id]);
  arcState.activeStepId = nextId ?? arc.steps.find((entry) => !arcState.completedSteps[entry.id])?.id ?? null;
}

function applyChoice(state: GameState, arc: StoryArcDefinition, step: StoryStepDefinition, choice: StoryChoice) {
  const arcState = state.storyArcs[arc.id];
  arcState.choices[step.id] = choice.id;
  state.storyChoices.unshift({ arcId: arc.id, stepId: step.id, choiceId: choice.id, label: choice.label, timestamp: Date.now() });
  state.achievements["first-major-choice"] = true;
  if (choice.rewards) applyRewards(state, choice.rewards);
  state.resources.heat = Math.max(0, Math.min(100, state.resources.heat + (choice.heatChange ?? 0)));
  Object.entries(choice.districtThreat ?? {}).forEach(([id, amount]) => changeDistrictThreat(state, id as keyof GameState["districtThreat"], amount ?? 0));
  Object.entries(choice.localStanding ?? {}).forEach(([id, amount]) => changeLocalStanding(state, id as keyof GameState["districtStanding"], amount ?? 0, choice.label));
  Object.entries(choice.factionReputation ?? {}).forEach(([id, amount]) => {
    state.factions[id as FactionId].reputation += amount ?? 0;
    updateConflictLeaning(state, id as FactionId, amount ?? 0, step.id, choice.id);
  });
  Object.entries(choice.fixerTrust ?? {}).forEach(([id, amount]) => {
    const trust = state.fixerTrust[id] ?? { trust: 0, completedJobs: 0 };
    trust.trust += amount ?? 0;
    state.fixerTrust[id] = trust;
  });
  Object.entries(choice.companionRelationship ?? {}).forEach(([id, amount]) => {
    const companion = state.companions[id];
    if (companion) companion.relationship += amount ?? 0;
  });
  (choice.worldFlags ?? []).forEach((flag) => {
    state.storyFlags[flag] = true;
    state.worldUnlocks[flag] = true;
  });
  (choice.operationLeads ?? []).forEach((lead) => {
    state.operationLeads[lead] = true;
    state.achievements["first-operation-lead"] = true;
  });
  pushCategorizedLog(state, "World", `Choice made: ${choice.label}.`);
  emitRewardPopupGroup(state, {
    title: `Choice: ${choice.label}`,
    category: "story",
    resources: choice.rewards,
    heat: choice.heatChange,
    neuralInstability: 0,
    reputation: Object.fromEntries(Object.entries(choice.factionReputation ?? {}).map(([id, amount]) => [id, amount ?? 0])),
    durationMs: 4800,
  });
}

function updateConflictLeaning(state: GameState, factionId: FactionId, amount: number, decisionId: string, choiceId: string) {
  Object.entries(state.factionConflicts).forEach(([id, conflict]) => {
    const involved =
      (id === "chrome-vs-redline" && (factionId === "chromeJackals" || factionId === "redlineSaints")) ||
      (id === "null-vs-ghost" && (factionId === "nullChoir" || factionId === "ghostMarket")) ||
      (id === "helix-vs-street-surgeons" && factionId === "helixOrder") ||
      (id === "glassline-vs-street" && factionId === "helixOrder");
    if (!involved || amount === 0) return;
    conflict.score += Math.abs(amount);
    conflict.status = conflict.score >= 20 ? "open" : conflict.score >= 8 ? "rising" : "cold";
    conflict.playerLeaning = amount > 0 ? factionId : conflict.playerLeaning;
    conflict.decisions[decisionId] = choiceId;
    state.achievements["take-faction-side"] = true;
  });
}

function applyStoryUnlock(state: GameState, unlock: string) {
  state.unlocks[unlock] = true;
  state.worldUnlocks[unlock] = true;
  if (unlock.startsWith("operation:")) {
    state.operationLeads[unlock.replace("operation:", "")] = true;
    state.achievements["first-operation-lead"] = true;
  }
}

function arcUnlocked(state: GameState, arc: StoryArcDefinition) {
  if (arc.id === "main-act-1-neon-entry" || arc.id === "district-neon-row-street-initiation" || arc.id === "fixer-sable-first-credit") return Boolean(state.startingPath);
  if (arc.id === "companion-nyra-intro") return Boolean(state.districts.blacknetQuarter?.unlocked);
  return arc.unlockRequirements.every((requirement) => {
    const lower = requirement.toLowerCase();
    if (lower.includes("neon row")) return state.districts.neonRow?.unlocked;
    if (lower.includes("blacknet quarter")) return state.districts.blacknetQuarter?.unlocked;
    return true;
  });
}

function ensureArc(state: GameState, arc: StoryArcDefinition) {
  state.storyArcs[arc.id] ??= initialArcState(arc);
}

function initialArcState(arc: StoryArcDefinition): StoryArcState {
  return {
    status: arc.roadmap ? "locked" : "locked",
    activeStepId: arc.steps[0]?.id ?? null,
    completedSteps: {},
    choices: {},
    outcomeFlags: {},
    rewardsClaimed: false,
  };
}
