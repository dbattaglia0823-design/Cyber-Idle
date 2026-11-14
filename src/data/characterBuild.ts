export const MAX_CHARACTER_LEVEL = 30;
export const STARTING_ATTRIBUTE_POINTS = 7;
export const STARTING_PERK_POINTS = 2;
// One point per runner level, with a bonus every six level-ups. At level 30
// this is 40 points: two attributes from 3 to 20 (34) plus six flex points.
export const attributePointBudget = (level: number) => {
  const levelUps = Math.max(0, Math.min(MAX_CHARACTER_LEVEL, level) - 1);
  return STARTING_ATTRIBUTE_POINTS + levelUps + Math.floor(levelUps / 6);
};
export const perkPointBudget = (level: number) => STARTING_PERK_POINTS + Math.floor(Math.max(0, Math.min(MAX_CHARACTER_LEVEL, level) - 1) / 2);
