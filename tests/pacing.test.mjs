import { openStoryThroughSkillBand } from "./story-fixture.mjs";
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/systems/gameState.ts';
import { updateWorldUnlocks } from '../src/systems/worldUnlocks.ts';
import { canStartSkillAction } from '../src/systems/actionProcessing.ts';
import { xpForNextLevel } from '../src/systems/formulas.ts';
import { skillActions, skillOrder } from '../src/data/skills.ts';
import { districtLevelBands } from '../src/data/levelBands.ts';
import { districtCombatZones, districtSkillActions } from '../src/systems/districtActivities.ts';
import { canFightEnemy } from '../src/systems/combatProcessing.ts';

test('XP costs increase smoothly without a wall at former tier boundaries', () => {
  for (let level = 10; level < 149; level++) {
    const ratio = xpForNextLevel(level + 1) / xpForNextLevel(level);
    assert.ok(ratio > 1 && ratio < 1.25, `level ${level}: ${ratio}`);
  }
});

for (const skill of skillOrder.filter(id => id !== 'combat')) test(`${skill} has a practical training path through all 150 levels`, () => {
  const state = createInitialState();
  // Supplies are assumed replenished; no rare drops, blueprints or special unlocks.
  for (const key of Object.keys(state.resources)) state.resources[key] = 10000;
  let lastRate = 0;
  for (let level = 1; level < 150; level++) {
    state.skills[skill].level = level;
    openStoryThroughSkillBand(state);
    const available = skillActions.filter(action => action.skillId === skill && canStartSkillAction(state, action));
    assert.ok(available.length, `${skill} level ${level} has no training`);
    const rate = Math.max(...available.map(action => action.xpReward / (action.durationMs / 60000)));
    assert.ok(rate >= lastRate, `${skill} regresses at level ${level}`);
    assert.ok(xpForNextLevel(level) / rate < 36 * 60, `${skill} level ${level} exceeds 36 hours before any mastery bonuses`);
    lastRate = rate;
  }
});

test('all eight districts provide combat at their entry level with proper access gates', () => {
  for (const [district, band] of Object.entries(districtLevelBands)) {
    const state = createInitialState();
    state.skills.combat.level = band.entryLevel;
    openStoryThroughSkillBand(state);
    const enemies = districtCombatZones(district).flatMap(zone => zone.enemies);
    assert.ok(enemies.length >= 5, district);
    assert.ok(enemies.some(enemy => canFightEnemy(state, enemy)), `${district} entry encounter`);
    for (const enemy of enemies) {
      assert.ok(enemy.requiredCombatLevel >= band.entryLevel, enemy.id);
      assert.ok(enemy.requiredCombatLevel <= 150, enemy.id);
    }
    state.districts[district].unlocked = false;
    assert.ok(enemies.every(enemy => !canFightEnemy(state, enemy)), `${district} locked`);
  }
});



test('skill XP is higher at every level and the multiplier increases smoothly', () => {
  const previousCost = level => Math.floor(42 * Math.pow(level, 1.90) * (0.72 + (level - 1) * 0.012));
  assert.ok(xpForNextLevel(1) >= previousCost(1) * 20);
  let lastIncrease = 0;
  for (let level = 1; level < 150; level++) {
    const increase = xpForNextLevel(level) / previousCost(level);
    assert.ok(increase > lastIncrease, 'relative cost must rise with level ' + level);
    lastIncrease = increase;
  }
});

test('12 hours of the first Scavenging action stays within the opening skill tier', async () => {
  const { chooseStartingPath } = await import('../src/systems/gameState.ts');
  const { startSkillAction } = await import('../src/systems/actionProcessing.ts');
  const { applyOfflineProgress } = await import('../src/systems/offlineProgress.ts');
  const { normalizeSave } = await import('../src/systems/saveSystem.ts');
  for (const path of ['streetborn','outrider','corporateDefector']) {
    let state = chooseStartingPath(createInitialState(1000), path);
    state = startSkillAction(state, 'scav-alley-scrap-run', 1000);
    const result = applyOfflineProgress(state, 1000 + 12 * 60 * 60 * 1000);
    assert.ok(result.skills.scavenging.level >= 10 && result.skills.scavenging.level <= 16, path + ': ' + result.skills.scavenging.level);
    assert.deepEqual(normalizeSave(result).skills, result.skills);
  }
});


test('each district has exactly three training cards per skill at distinct unlock levels', () => {
  for (const district of Object.keys(districtLevelBands)) {
    for (const skill of skillOrder.filter(id => id !== 'combat')) {
      const actions = districtSkillActions(district).filter(action => action.skillId === skill);
      assert.equal(actions.length, 3, district + ': ' + skill);
      assert.equal(new Set(actions.map(action => action.levelReq)).size, 3, district + ': ' + skill);
      if (district === 'neonRow') assert.deepEqual(actions.map(action => action.levelReq), [1, 10, 15]);
    }
  }
});

test('hidden district requirements still block training and component processing', () => {
  const state = createInitialState();
  for (const skill of skillOrder) state.skills[skill].level = 150;
  for (const key of Object.keys(state.resources)) state.resources[key] = 100000;
  for (const action of skillActions) {
    for (const id of action.requiredUnlocks ?? []) state.unlocks[id] = true;
    for (const [id, amount] of Object.entries(action.requiredItems ?? {})) {
      if (id in state.resources) state.resources[id] = Math.max(state.resources[id], amount);
      else state.inventory[id] = amount;
    }
    state.districts[action.districtReq].unlocked = true;
    assert.ok(canStartSkillAction(state, action), action.id + ' available');
    state.districts[action.districtReq].unlocked = false;
    assert.equal(canStartSkillAction(state, action), false, action.id + ' locked');
  }
});
