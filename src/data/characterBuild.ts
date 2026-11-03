export const MAX_CHARACTER_LEVEL = 30;
export const STARTING_ATTRIBUTE_POINTS = 7;
export const STARTING_PERK_POINTS = 2;
export const attributePointBudget = (level: number) => STARTING_ATTRIBUTE_POINTS + Math.max(0, Math.min(MAX_CHARACTER_LEVEL, level) - 1) * 2;
export const perkPointBudget = (level: number) => STARTING_PERK_POINTS + Math.floor(Math.max(0, Math.min(MAX_CHARACTER_LEVEL, level) - 1) / 2);
