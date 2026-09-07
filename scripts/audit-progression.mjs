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
for (const o of operations) {
  const at = Math.max(level(o.districtId), ...o.unlockRequirements.map(r => Number(r.match(/level (\d+)/i)?.[1] ?? 1)));
  for (const d of [...o.rareDrops, ...(bosses.find(b => b.id === o.bossId)?.drops ?? [])]) add(d.id, at, o.name);
  for (const rewards of [o.completionRewards, o.repeatClearRewards, o.firstClearRewards]) for (const [id,n] of Object.entries(rewards)) if (n > 0) add(id, at, o.name);
}
for (const j of jobs) {
  const at = Math.max(level(j.districtId), ...j.requirements.map(r => Number(r.match(/level (\d+)/i)?.[1] ?? 1)));
  if (j.rareReward) add(j.rareReward, at, j.name);
  for (const [id,n] of Object.entries(j.rewards)) if (n > 0) add(id, at, j.name);
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
if (process.argv[1]?.endsWith('audit-progression.mjs')) {
  console.log(`Checked ${recipes.length} recipes and ${skillActions.length} actions.`);
  console.log('Content errors', JSON.stringify({ missing: report.missingReferences, duplicates: report.duplicateIds }));
  console.log('Material timing problems', JSON.stringify(Object.fromEntries(problems), null, 2));
  process.exitCode = report.missingReferences.length || report.duplicateIds.length || problems.size ? 1 : 0;
}
