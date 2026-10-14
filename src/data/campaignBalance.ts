// Runner progression is earned mainly through one-time story jobs. Gigs supplement it.
export const campaignRunnerTargets = [5, 9, 13, 17, 21, 25, 28, 30] as const;
export const runnerXpNeeded = (level: number) => 100 + level * 60;
export function mainJobXp(act: number) {
 const from = act === 0 ? 1 : campaignRunnerTargets[act - 1];
 let xp = 0;
 for (let level = from; level < campaignRunnerTargets[act]; level++) xp += runnerXpNeeded(level);
 return xp;
}
export const progressionBalance = {
 skillBase: 840, skillExponent: 2.1,
 gigHealthRatio: .45, gigDamageRatio: .45,
 upgradeRecipeBase: .35, upgradeRecipeExponent: 1.05,
} as const;
