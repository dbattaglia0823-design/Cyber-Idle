import { skillActions } from "../data/skills";
import { recipes } from "../data/recipes";
import { pushCategorizedLog } from "./gameState";
import type { GameState, SkillId } from "../types";

export const masteryPoolCheckpoints = [10, 25, 50, 75, 95, 100] as const;

export function masteryPoolCap(state: GameState, skillId: SkillId) {
  const actions = skillActions.filter((action) => action.skillId === skillId).length;
  const recipeCount = skillId === "cyberware" ? recipes.length : 0;
  return Math.max(500, (actions + recipeCount + 1) * state.skills[skillId].level * 120);
}

export function masteryPoolPercent(state: GameState, skillId: SkillId) {
  return Math.min(100, Math.floor((state.masteryPool[skillId].xp / masteryPoolCap(state, skillId)) * 100));
}

export function addMasteryPoolXp(state: GameState, skillId: SkillId, amount: number) {
  const before = masteryPoolPercent(state, skillId);
  state.masteryPool[skillId].xp += Math.max(0, Math.round(amount));
  const after = masteryPoolPercent(state, skillId);
  masteryPoolCheckpoints.forEach((checkpoint) => {
    if (before < checkpoint && after >= checkpoint) {
      pushCategorizedLog(state, "Skill", `${skillId} mastery pool reached ${checkpoint}%.`);
    }
  });
}

export function masteryPoolBonus(state: GameState, skillId: SkillId) {
  const percent = masteryPoolPercent(state, skillId);
  return {
    xp: percent >= 10 ? 0.02 : 0,
    speed: percent >= 25 ? 0.03 : 0,
    rewards: percent >= 50 ? 0.05 : 0,
    rareDrop: percent >= 75 ? 0.05 : 0,
    automation: percent >= 95,
    complete: percent >= 100,
  };
}

export function spendMasteryPool(state: GameState, skillId: SkillId, actionId: string) {
  const cost = 100;
  if (state.masteryPool[skillId].xp < cost) return state;
  const next = { ...state, masteryPool: { ...state.masteryPool, [skillId]: { ...state.masteryPool[skillId] } }, actionMastery: { ...state.actionMastery } };
  next.masteryPool[skillId].xp -= cost;
  next.masteryPool[skillId].spent += cost;
  const mastery = next.actionMastery[actionId] ?? { level: 1, xp: 0 };
  mastery.xp += 100;
  next.actionMastery[actionId] = mastery;
  return next;
}
