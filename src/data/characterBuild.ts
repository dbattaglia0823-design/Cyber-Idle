export const MAX_CHARACTER_LEVEL = 30;
export const STARTING_ATTRIBUTE_POINTS = 7;
export const STARTING_PERK_POINTS = 2;
// 49 lifetime points at level 30: 7 starting + 29 level-up points +
// 13 bonuses at levels 5, 7, ..., 29. Two stats can reach 20 with
// 15 additional points available for a third.
export const attributePointBudget = (level: number) => {
  const levelUps = Math.max(0, Math.min(MAX_CHARACTER_LEVEL, level) - 1);
  return STARTING_ATTRIBUTE_POINTS + levelUps + Math.max(0, Math.floor((levelUps - 2) / 2));
};

// Retain the 40-point formula for one-time migration of version-2 saves.
export const attributePointBudgetV2 = (level: number) => {
  const levelUps = Math.max(0, Math.min(MAX_CHARACTER_LEVEL, level) - 1);
  return STARTING_ATTRIBUTE_POINTS + levelUps + Math.floor(levelUps / 6);
};
export const perkPointBudget = (level: number) => STARTING_PERK_POINTS + Math.floor(Math.max(0, Math.min(MAX_CHARACTER_LEVEL, level) - 1) / 2);
