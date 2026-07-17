import { skillNames } from "../data/skills";
import type { GameState, SkillAction } from "../types";

export function meetsActionAccessRequirement(state: GameState, action: SkillAction) {
  return state.skills[action.skillId].level >= action.levelReq;
}

export function actionAccessRequirementText(state: GameState, action: SkillAction) {
  return `Requires ${skillNames[action.skillId]} level ${action.levelReq} / Current ${state.skills[action.skillId].level}`;
}
