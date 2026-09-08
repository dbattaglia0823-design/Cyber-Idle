import { openStoryThroughSkillBand } from "./story-fixture.mjs";
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/systems/gameState.ts';
import { updateWorldUnlocks } from '../src/systems/worldUnlocks.ts';
import { canStartSkillAction } from '../src/systems/actionProcessing.ts';
import { xpForNextLevel } from '../src/systems/formulas.ts';
import { skillActions, skillOrder } from '../src/data/skills.ts';
import { districtLevelBands } from '../src/data/levelBands.ts';
import { districtCombatZones } from '../src/systems/districtActivities.ts';
import { canFightEnemy } from '../src/systems/combatProcessing.ts';

test('XP costs increase smoothly without a wall at former tier boundaries', () => {
  for (let level = 10; level < 149; level++) {
    const ratio = xpForNextLevel(level + 1) / xpForNextLevel(level);
    assert.ok(ratio > 1 && ratio < 1.21, `level ${level}: ${ratio}`);
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
    assert.ok(xpForNextLevel(level) / rate < 12, `${skill} level ${level} exceeds 12 minutes before any mastery bonuses`);
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

