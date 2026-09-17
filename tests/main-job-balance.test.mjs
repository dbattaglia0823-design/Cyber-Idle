import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RpgHub } from '../src/components/RpgHub.tsx';
import { rpgMissions, rpgSideGigs } from '../src/data/rpgCampaign.ts';
import { createInitialState, chooseStartingPath, cloneState } from '../src/systems/gameState.ts';
import { claimFieldKit, startRpgMission, chooseMissionApproach, performTactic, resolveRpgMission, missionEnemyStats, tacticalStats, enemyIntent, canUseTactic } from '../src/systems/rpgSystem.ts';
import { calculateMaxHP } from '../src/systems/healthSystem.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { prepareMainJob } from './main-job-fixture.mjs';

const fresh = () => claimFieldKit(chooseStartingPath(createInitialState(), 'streetborn'));

test('every Main job has three patrols and a tougher final boss; gigs keep one encounter', () => {
  let lastHealth = 0, lastDamage = 0;
  for (const mission of rpgMissions) {
    assert.equal(mission.enemies.length, 4);
    assert.equal(new Set(mission.enemies).size, 4);
    const patrol = missionEnemyStats(mission, 2), boss = missionEnemyStats(mission, 3);
    assert.equal(patrol.boss, false); assert.equal(boss.boss, true);
    assert.ok(boss.health >= patrol.health * 1.49);
    assert.ok(boss.damage > patrol.damage);
    assert.ok(boss.health > lastHealth && boss.damage > lastDamage);
    lastHealth = boss.health; lastDamage = boss.damage;
  }
  for (const gig of rpgSideGigs) {
    assert.equal(gig.enemies.length, 1);
    assert.deepEqual(missionEnemyStats(gig, 0), { boss: false, health: 80 + gig.act * 24, damage: 10 + gig.act * 2 });
  }
});

test('patrol transitions preserve health and injectors; only the boss unlocks settlement', () => {
  let state = chooseMissionApproach(startRpgMission(fresh(), 'dead-drop'), 'assault');
  state.health.currentHp = 70; state.rpg.active.meds = 1;
  const credits = state.resources.credits;
  for (let index = 0; index < 4; index++) {
    assert.equal(state.rpg.active.enemyIndex, index);
    assert.equal(resolveRpgMission(state, 'protect'), state);
    state.rpg.active.enemyHp = 1; // Isolate encounter transitions from damage balancing.
    state = performTactic(state, 'attack');
    assert.equal(state.health.currentHp, 70);
    assert.equal(state.rpg.active.meds, 1);
    assert.equal(state.resources.credits, credits);
    assert.equal(state.rpg.active.phase, index === 3 ? 'decision' : 'combat');
    if (index === 2) {
      state = normalizeSave(JSON.parse(JSON.stringify(state)));
      assert.equal(state.rpg.active.enemyIndex, 3);
      assert.match(state.rpg.active.log.at(-1), /Boss contact/);
      const html = renderToStaticMarkup(createElement(RpgHub, { state, page: 'journal', onUpdate() {}, onServices() {}, onPage() {} }));
      assert.match(html, /DISTRICT BOSS/);
      assert.match(html, /Chrome Debt Collector/);
    }
  }
  state = resolveRpgMission(state, 'protect');
  assert.ok(state.resources.credits > credits);
  assert.equal(state.districts.rustYards.unlocked, true);
});

test('lifepath skips only the opening patrol and leaves two fights before the boss', () => {
  let state = chooseMissionApproach(startRpgMission(fresh(), 'dead-drop'), 'lifepath');
  assert.equal(state.rpg.active.enemyIndex, 1);
  for (let index = 1; index <= 3; index++) {
    assert.equal(state.rpg.active.phase, 'combat');
    assert.equal(state.rpg.active.enemyIndex, index);
    state.rpg.active.enemyHp = 1;
    state = performTactic(state, 'attack');
  }
  assert.equal(state.rpg.active.phase, 'decision');
});

test('district weapons and upgrades improve field damage without scaling enemies to the player', () => {
  const mission = rpgMissions[7];
  let state = fresh();
  for (const prior of rpgMissions.slice(0, 7)) state.rpg.completed[prior.id] = { outcome: 'protect', approach: 'assault', clears: 1 };
  state = prepareMainJob(state, mission);
  const equipped = tacticalStats(state).damage;
  const starter = cloneState(state);
  starter.equippedGear = { weapon: 'rpg-weapon-0', chest: 'padded-street-vest' };
  starter.equippedCyberware = { operatingSystem: 'entry-cyberdeck' };
  starter.rpg.quickhackLoadouts['entry-cyberdeck'] = ['quickhack-short-circuit','quickhack-reboot-optics'];
  assert.ok(equipped > tacticalStats(starter).damage * 1.5);
  const noUpgrade = cloneState(state); noUpgrade.upgradeLevels = {};
  assert.ok(equipped > tacticalStats(noUpgrade).damage);
  let trained = chooseMissionApproach(startRpgMission(state, mission.id), 'assault');
  let unprepared = chooseMissionApproach(startRpgMission(starter, mission.id), 'assault');
  assert.equal(trained.rpg.active.enemyMaxHp, unprepared.rpg.active.enemyMaxHp);
  const fight = input => {
    let current = input, turns = 0;
    while (turns++ < 200 && current.rpg.active.phase === 'combat') {
      let action = 'attack';
      if (enemyIntent(current) === 'Charged burst' && canUseTactic(current, 'disrupt')) action = 'disrupt';
      if (current.health.currentHp < calculateMaxHP(current) * .5 && canUseTactic(current, 'heal')) action = 'heal';
      current = performTactic(current, action);
    }
    return { state: current, turns };
  };
  const preparedRun = fight(trained), starterRun = fight(unprepared);
  assert.equal(preparedRun.state.rpg.active.phase, 'decision');
  assert.ok(starterRun.state.rpg.active.phase === 'failed' || starterRun.turns > preparedRun.turns * 1.5, 'local gear must provide a substantial combat advantage');
  assert.ok(starterRun.state.rpg.active.meds < preparedRun.state.rpg.active.meds);
  const firstJob = fight(chooseMissionApproach(startRpgMission(fresh(), 'dead-drop'), 'assault'));
  assert.equal(firstJob.state.rpg.active.phase, 'failed', 'the bare starter kit requires preparation for the first boss');
});
