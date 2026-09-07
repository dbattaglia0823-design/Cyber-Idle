import test from 'node:test';
import assert from 'node:assert/strict';
import { report, problems, sources } from '../scripts/audit-progression.mjs';
import { recipes } from '../src/data/recipes.ts';
import { skillActions } from '../src/data/skills.ts';
import { materialSupplyActions } from '../src/data/materialSupply.ts';
import { districtSpecificMaterials } from '../src/data/districtMastery.ts';
import { districtLevelBands } from '../src/data/levelBands.ts';
import { items } from '../src/data/items.ts';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { startSkillAction, processActionCompletion, stopSkillAction, addMasteryXp } from '../src/systems/actionProcessing.ts';
import { startCraft, processCrafting } from '../src/systems/craftingProcessing.ts';
import { scaledCraftingCosts } from '../src/systems/craftingCosts.ts';
import { getItemSources } from '../src/systems/itemSourceLookup.ts';
import { updateWorldUnlocks } from '../src/systems/worldUnlocks.ts';
import { addItem, removeItem } from '../src/systems/collectionSystem.ts';
import { equipItem } from '../src/systems/equipmentSystem.ts';

test('all content references, item IDs, recipe IDs and ingredient stages are valid', () => {
  assert.deepEqual(report.missingReferences, []);
  assert.deepEqual(report.duplicateIds, []);
  assert.deepEqual(Object.fromEntries(problems), {});
  for (const recipe of recipes) {
    assert.ok(recipe.requiredLevel <= 150, recipe.id);
    const state = createInitialState();
    const costs = scaledCraftingCosts(state, recipe);
    assert.deepEqual(Object.keys(costs).sort(), Object.keys(recipe.inputCosts).sort(), recipe.id);
    for (const [id, amount] of Object.entries(costs)) {
      assert.ok(Number.isInteger(amount) && amount > 0, `${recipe.id}: ${id}`);
      assert.ok(sources.has(id), `${recipe.id}: ${id} has no source`);
    }
  }
});

test('every district supplies its equipment materials at entry, even without rare drops', () => {
  for (const action of materialSupplyActions) {
    let state = createInitialState(1000);
    state.skills.scavenging.level = districtLevelBands[action.districtReq].entryLevel;
    state.resources.scrap = 100;
    updateWorldUnlocks(state);
    state = startSkillAction(state, action.id, 1000);
    assert.ok(state.activeAction, action.id);
    state = processActionCompletion(state, 1000 + state.activeAction.durationMs);
    for (const id of districtSpecificMaterials[action.districtReq]) {
      assert.ok((state.resources[id] ?? state.inventory[id] ?? 0) >= 1, `${action.id}: ${id}`);
    }
  }
});

for (const path of ['streetborn', 'outrider', 'corporateDefector']) test(`${path} can gather, craft starter gear and medicine from a new save`, () => {
  let state = chooseStartingPath(createInitialState(1000), path);
  let now = 1000;
  for (const [action, loops] of [['supply-neonRow', 12], ['scav-alley-scrap-run', 15], ['cyber-strip-implant', 5], ['hack-public-terminal', 4]]) {
    state = startSkillAction(state, action, now);
    assert.ok(state.activeAction, action);
    for (let i=0; i<loops; i++) {
      now = state.activeAction.startedAt + state.activeAction.durationMs;
      state = processActionCompletion(state, now);
    }
  }
  state = stopSkillAction(state);
  for (const id of ['recipe-street-knife','recipe-padded-street-vest','recipe-basic-med-injector','recipe-medical-gel']) {
    state = startCraft(state, id, now);
    assert.equal(state.activeCraft?.recipeId, id);
    now += state.activeCraft.durationMs;
    state = processCrafting(state, now);
    assert.ok(state.inventory[recipes.find(r=>r.id===id).outputItemId] > 0, id);
  }
  state = equipItem(state, 'street-knife');
  assert.equal(state.equippedGear.weapon,'street-knife');
  for (const quantity of Object.values(state.resources)) assert.ok(Number.isFinite(quantity) && quantity >= 0);
});

test('source guide never lists consuming an ingredient as a source', () => {
  const state = createInitialState();
  const sources = getItemSources('scrap', state);
  assert.ok(!sources.some(s => s.name === 'Strip Damaged Implant'));
  assert.equal(getItemSources('redline-wire', state)[0].name, 'Strip Street Electronics');
  assert.ok(!getItemSources('legendary-chrome-matrix',state).some(s => s.type !== 'Item note' && s.unlocked));
});

test('resource drops and crafted vehicle components use the resource wallet', () => {
  const state = createInitialState();
  addItem(state,'engineCore',3);
  assert.equal(state.resources.engineCore,3);
  assert.equal(state.inventory.engineCore,undefined);
  assert.equal(removeItem(state,'engineCore',2),true);
  assert.equal(state.resources.engineCore,1);
  addItem(state,'scrap',NaN);
  assert.equal(state.resources.scrap,0);
});

test('districts stay unlocked after a skill reset and mastery respects its cap', () => {
  const state = createInitialState();
  state.skills.scavenging.level = 150;
  updateWorldUnlocks(state);
  state.skills.scavenging.level = 1;
  updateWorldUnlocks(state);
  assert.ok(Object.values(state.districts).every(d=>d.unlocked));
  addMasteryXp(state,'supply-neonRow',1e9);
  assert.deepEqual(state.actionMastery['supply-neonRow'],{level:99,xp:0});
  assert.equal(items.find(i=>i.id==='neon-runner-legs').type,'Armor');
  assert.equal(items.find(i=>i.id==='neon-runner-legs-implant').type,'Cyberware');
});
