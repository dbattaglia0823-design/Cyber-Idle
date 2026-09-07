// A smooth rate floor shared by all training skills. Longer actions award
// proportionally more XP, so moving to a new district is always worthwhile.
export function trainingXpPerSecond(level: number) {
  return 8 * Math.pow(Math.max(1, Math.min(150, level)), 0.98);
}

export function pacedActionXp(level: number, durationMs: number, originalXp: number) {
  return Math.max(originalXp, Math.round(trainingXpPerSecond(level) * durationMs / 1000));
}
