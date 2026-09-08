import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { skillOrder, skillActions } from '../src/data/skills.ts';
import { recipes } from '../src/data/recipes.ts';
import { rpgMissions, rpgSideGigs } from '../src/data/rpgCampaign.ts';
import { claimFieldKit, startRpgMission, chooseMissionApproach, resolveRpgMission, performTactic, gigPayout, clearHeatWithFixer, heatCleanupCost, retryRpgMission } from '../src/systems/rpgSystem.ts';
import { updateWorldUnlocks } from '../src/systems/worldUnlocks.ts';
import { storyObjectiveProgress } from '../src/systems/storySystem.ts';
const fresh = () => claimFieldKit(chooseStartingPath(createInitialState(), 'streetborn'));
const decision = (state, id, risk = 'standard') => {
  const next = chooseMissionApproach(startRpgMission(state, id, risk), 'assault');
  assert.ok(next.rpg.active);
  next.rpg.active.phase = 'decision';
  return next;
};

test('retired skills are absent from training, crafting and new saves', () => {
  const state = fresh();
  assert.equal(skillOrder.length, 6);
  for (const id of ['blackMarket', 'streetcraft']) {
    assert.equal(state.skills[id], undefined);
    assert.equal(state.masteryPool[id], undefined);
    assert.ok(skillActions.every(a => a.skillId !== id));
    assert.ok(recipes.every(r => r.requiredSkill !== id));
  }
});

test('legacy skill levels and mastery transfer once and retired activities stop', () => {
  const state = fresh();
  state.skills.blackMarket = { level: 70, xp: 55 };
  state.skills.streetcraft = { level: 80, xp: 66 };
  state.masteryPool.blackMarket = { xp: 120, spent: 20 };
  state.masteryPool.streetcraft = { xp: 240, spent: 40 };
  state.activeAction = { actionId: 'street-read-rumors', startedAt: 1000, durationMs: 4000 };
  state.districts.rustYards.unlocked = true;
  const next = normalizeSave(state);
  assert.deepEqual(next.skills.hacking, { level: 70, xp: 55 });
  assert.deepEqual(next.skills.cyberware, { level: 80, xp: 66 });
  assert.equal(next.masteryPool.hacking.xp, 120);
  assert.equal(next.masteryPool.cyberware.xp, 240);
  assert.equal(next.activeAction, null);
  assert.equal(next.districts.rustYards.unlocked, true);
  assert.equal(state.skills.streetcraft.level, 80);
  const again = normalizeSave(next);
  assert.deepEqual(again.skills, next.skills);
  assert.deepEqual(again.masteryPool, next.masteryPool);
});

test('skill grinding and local gigs cannot skip main-story district progression', () => {
  let state = fresh();
  for (const skill of Object.values(state.skills)) skill.level = 150;
  updateWorldUnlocks(state);
  assert.equal(Object.values(state.districts).filter(d => d.unlocked).length, 1);
  state = resolveRpgMission(decision(state, rpgSideGigs[0].id), 'extract');
  assert.equal(Object.values(state.districts).filter(d => d.unlocked).length, 1);
  assert.equal(state.rpg.completed[rpgMissions[0].id], undefined);
  state = resolveRpgMission(decision(state, rpgMissions[0].id), 'protect');
  assert.equal(state.districts.rustYards.unlocked, true);
  assert.equal(state.districts.underpassMarket.unlocked, false);
  assert.equal(startRpgMission(state, rpgMissions[2].id), state);
});

test('local gigs pay on every replay, reduce Heat and count toward neighborhood trust', () => {
  let state = fresh(); const gig = rpgSideGigs[0];
  for (let i = 0; i < 3; i++) {
    state.resources.heat = 20;
    const before = state.resources.credits;
    state = resolveRpgMission(decision(state, gig.id), 'extract');
    assert.equal(state.resources.credits - before, gig.reward);
    assert.equal(state.resources.heat, 5);
    assert.equal(state.rpg.completed[gig.id].clears, i + 1);
    assert.equal(resolveRpgMission(state, 'extract'), state);
  }
  assert.equal(storyObjectiveProgress(state, { type: 'completeLocalGig', target: gig.id, requiredCount: 2 }), 3);
});

test('higher-risk gigs require experience and increase enemies and credits without more story rewards', () => {
  let state = fresh(); const gig = rpgSideGigs[0];
  assert.equal(startRpgMission(state, gig.id, 'dangerous'), state);
  assert.equal(startRpgMission(state, gig.id, 'elite'), state);
  assert.equal(startRpgMission(state, gig.id, '__proto__'), state);
  state.rpg.completed[gig.id] = { outcome: 'extract', approach: 'assault', clears: 3 };
  const normal = chooseMissionApproach(startRpgMission(state, gig.id), 'assault');
  const elite = chooseMissionApproach(startRpgMission(state, gig.id, 'elite'), 'assault');
  assert.ok(elite.rpg.active.enemyMaxHp > normal.rpg.active.enemyMaxHp);
  const normalHit = performTactic(normal, 'cover'), eliteHit = performTactic(elite, 'cover');
  assert.ok(eliteHit.health.currentHp < normalHit.health.currentHp);
  const roundTrip = normalizeSave(elite);
  assert.equal(roundTrip.rpg.active.gigRisk, 'elite');
  roundTrip.rpg.active.phase = 'failed';
  assert.equal(retryRpgMission(roundTrip).rpg.active.gigRisk, 'elite');
  const before = state.resources.credits;
  const next = resolveRpgMission(decision(state, gig.id, 'elite'), 'extract');
  assert.equal(next.resources.credits - before, gigPayout(gig, 'elite'));
  assert.equal(gigPayout(gig, 'elite'), gig.reward * 2);
  assert.equal(Object.keys(next.rpg.completed).length, 1);
});

test('fixer cleanup charges only actual Heat and cannot run during a mission', () => {
  const state = fresh(); state.resources.heat = 12; state.resources.credits = 500;
  assert.equal(heatCleanupCost(state), 120);
  const next = clearHeatWithFixer(state);
  assert.equal(next.resources.credits, 380); assert.equal(next.resources.heat, 0);
  assert.equal(clearHeatWithFixer(next), next);
  state.resources.credits = 119;
  assert.equal(clearHeatWithFixer(state), state);
  state.resources.credits = 500;
  const active = startRpgMission(state, rpgSideGigs[0].id);
  assert.equal(clearHeatWithFixer(active), active);
});
