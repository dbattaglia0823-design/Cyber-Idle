// A smooth rate floor shared by all training skills. Longer actions award
// proportionally more XP, so moving to a new district is always worthwhile.
export function trainingXpPerSecond(level: number) {
  const milestone = Math.max(1, Math.min(150, level));
  const advancedTraining = 1 + 2.5 * (1 - Math.exp(-(milestone - 1) / 20));
  return 8 * Math.pow(milestone, 0.98) * advancedTraining;
}

export function pacedActionXp(level: number, durationMs: number, originalXp: number) {
  return Math.max(originalXp, Math.round(trainingXpPerSecond(level) * durationMs / 1000));
}
// Give new players a quicker first few skill unlocks without compressing the
// established level-5+ curve or late-district progression.
export function introductoryTrainingMultiplier(level: number) { return level < 5 ? 1.5 : 1; }
