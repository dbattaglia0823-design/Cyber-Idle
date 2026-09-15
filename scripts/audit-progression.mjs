import { allRpgMissions } from '../src/data/rpgCampaign.ts';
import { missionRewardPools, missionItemRewards, gigUniquePools } from '../src/data/missionRewards.ts';
import { districtSupplyItems } from '../src/data/materialSupply.ts';
import { materialStage } from "../src/data/materialSupply.ts";
import { trainingXpPerSecond } from "../src/data/progressionPacing.ts";
import { getContentValidationReport } from '../src/systems/contentValidation.ts';
import { recipes } from '../src/data/recipes.ts';
import { skillActions } from '../src/data/skills.ts';
import { vendors } from '../src/data/vendors.ts';
import { combatZones } from '../src/data/combat.ts';
import { bosses } from '../src/data/bosses.ts';
import { operations } from '../src/data/operations.ts';
import { jobs } from '../src/data/jobs.ts';
import { percentDropTables } from '../src/data/percentDrops.ts';
import { districtLevelBands } from '../src/data/levelBands.ts';
export const report = getContentValidationReport();
export const sources = new Map();
const level = district => district ? districtLevelBands[district].entryLevel : 1;
function add(id, at, name) {
  if (!sources.has(id) || sources.get(id).level > at) sources.set(id, { level: at, name });
}
for (const a of skillActions) {
  for (const [id, n] of Object.entries(a.rewards)) if (n > 0) add(id, Math.max(a.levelReq, level(a.districtReq)), a.name);
  for (const d of a.rareDrops ?? []) add(d.id, Math.max(a.levelReq, level(a.districtReq)), a.name);
  for (const id of Object.keys(a.itemRewards ?? {})) add(id, Math.max(a.levelReq, level(a.districtReq)), a.name);
}
for (const v of vendors) for (const i of v.inventory) if (!i.requiredUnlock && !i.requiredFactionRank) add(i.itemId, level(v.districtId), v.name);
for (const e of combatZones.flatMap(z => z.enemies)) {
  for (const d of e.drops) add(d.id, Math.max(e.requiredCombatLevel ?? 1, level(e.preferredDistrict)), e.name);
  for (const d of percentDropTables[e.id] ?? []) add(d.itemId, Math.max(e.requiredCombatLevel ?? 1, level(e.preferredDistrict)), e.name);
}
for (const mission of allRpgMissions) {
  const ids = mission.sideGig ? [...missionRewardPools[mission.district], ...gigUniquePools[mission.district], ...districtSupplyItems(mission.district), ...Object.keys(missionItemRewards(mission))] : Object.keys(missionItemRewards(mission));
  for (const id of ids) add(id, level(mission.district), mission.title);
}
for (let pass = 0; pass < recipes.length; pass++) {
  let changed = false;
  for (const r of recipes) {
    const needs = [...Object.keys(r.inputCosts), ...(r.requiredBlueprint ? [r.requiredBlueprint] : [])];
    const at = Math.max(r.requiredLevel, level(r.requiredDistrict), ...needs.map(id => sources.get(id)?.level ?? Infinity));
    if (Number.isFinite(at) && (!sources.has(r.outputItemId) || sources.get(r.outputItemId).level > at)) { add(r.outputItemId, at, r.name); changed = true; }
  }
  if (!changed) break;
}
export const problems = new Map();
for (const r of recipes) for (const id of [...Object.keys(r.inputCosts), ...(r.requiredBlueprint ? [r.requiredBlueprint] : [])]) {
  const at = Math.max(r.requiredLevel, level(r.requiredDistrict));
  if ((sources.get(id)?.level ?? Infinity) > at) {
    const p = problems.get(id) ?? { needed: at, source: sources.get(id), recipes: [] };
    p.needed = Math.min(p.needed, at); p.recipes.push(r.id); problems.set(id,p);
  }
}
export const rewardProblems = skillActions.flatMap(action => {
  const band = action.districtReq && districtLevelBands[action.districtReq];
  const issues = band && (action.levelReq < band.entryLevel || action.levelReq > band.max) ? [action.id + ': outside district level band'] : [];
  const rewards = [...Object.entries(action.rewards).filter(([, n]) => n > 0).map(([id]) => id), ...Object.keys(action.itemRewards ?? {}), ...(action.rareDrops ?? []).map(drop => drop.id)];
  for (const id of rewards) if ((materialStage[id] ?? 1) > action.levelReq) issues.push(action.id + ': premature ' + id);
  return issues;
});
export const craftingRewardProblems = recipes.filter(recipe => recipe.xpReward < Math.round(trainingXpPerSecond(recipe.requiredLevel) * recipe.durationMs / 1000 * 0.6)).map(recipe => recipe.id);
if (process.argv[1]?.endsWith('audit-progression.mjs')) {
  console.log(`Checked ${recipes.length} recipes and ${skillActions.length} actions.`);
  console.log('Content errors', JSON.stringify({ missing: report.missingReferences, duplicates: report.duplicateIds }));
  console.log('Skill reward problems', JSON.stringify(rewardProblems));
  console.log('Crafting XP problems', JSON.stringify(craftingRewardProblems));
  console.log('Material timing problems', JSON.stringify(Object.fromEntries(problems), null, 2));
  process.exitCode = report.missingReferences.length || report.duplicateIds.length || problems.size || rewardProblems.length || craftingRewardProblems.length ? 1 : 0;
}
