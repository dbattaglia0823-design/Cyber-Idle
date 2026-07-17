export interface ActionMasteryMilestone {
  level: number;
  name: string;
  description: string;
}

export const actionMasteryMilestones: ActionMasteryMilestone[] = [
  { level: 10, name: "Cleaner Loop", description: "+3% speed for this action." },
  { level: 25, name: "Better Pulls", description: "+5% rewards from this action." },
  { level: 50, name: "Rare Pattern", description: "Improves or unlocks rare drop farming." },
  { level: 75, name: "District Habit", description: "Adds a small district-specific return bonus." },
  { level: 99, name: "Permanent Routine", description: "Completion passive placeholder." },
];

export function nextActionMasteryMilestone(level: number) {
  return actionMasteryMilestones.find((milestone) => level < milestone.level) ?? null;
}
