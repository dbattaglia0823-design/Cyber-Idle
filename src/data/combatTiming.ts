export const defaultAttackIntervalMs = 3000;

// Existing enemy timing values were authored around the former 1.6-second
// baseline. Treat their distance from that baseline as their weapon/style
// modifier, then apply it to the shared 3-second baseline.
const formerAttackIntervalMs = 1600;

export function attackIntervalFromFormerBaseline(authoredIntervalMs: number) {
  return defaultAttackIntervalMs + (authoredIntervalMs - formerAttackIntervalMs);
}
