import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { attributePreview } from '../src/systems/attributePreview.ts';
import { playerCombatStats } from '../src/systems/formulas.ts';
import { claimFieldKit, startRpgMission, chooseMissionApproach, performTactic, spendAttribute } from '../src/systems/rpgSystem.ts';
import { NetworkHero } from '../src/components/NetworkHero.tsx';
import { MissionPreparation } from '../src/screens/Missions/MissionPreparation.tsx';
import { rpgMissions } from '../src/data/rpgCampaign.ts';

test('attribute preview matches allocation without spending or mutating state', () => {
  const state = createInitialState();
  const snapshot = JSON.stringify(state);
  const changes = attributePreview(state, 'body');
  const hp = changes.find(c => c.label === 'Max HP');
  assert.equal(hp.before, playerCombatStats(state).maxHp);
  assert.equal(hp.after, playerCombatStats(spendAttribute(state, 'body')).maxHp);
  assert.equal(JSON.stringify(state), snapshot);
  state.rpg.attributes.body = 20;
  assert.deepEqual(attributePreview(state, 'body'), []);
});

test('compact header keeps progress and removes the large hero', () => {
  const html = render(createElement(NetworkHero, { compact: true, title: ['NEON', 'AFTERIMAGE'], eyebrow: 'Banner', description: 'Long introduction', actions: null, progress: { label: 'Story', value: 2, maximum: 8, suffix: '/08', note: '' } }));
  assert.match(html, /network-compact-header/);
  assert.match(html, /aria-valuenow="2"/);
  assert.doesNotMatch(html, /Long introduction|rpg-hero/);
});

test('preparation distinguishes missing equipment and equipped loadout', () => {
  const state = chooseStartingPath(createInitialState(), 'streetborn');
  const empty = render(createElement(MissionPreparation, { state, mission: rpgMissions[0] }));
  assert.match(empty, /Preparation gaps/);
  assert.match(empty, /None installed/);
  const equipped = render(createElement(MissionPreparation, { state: claimFieldKit(state), mission: rpgMissions[0] }));
  assert.match(equipped, /Loadout ready/);
  assert.match(equipped, /Short Circuit/);
});

test('turn feedback reports actual hit and damage prevented by cover', () => {
  const base = claimFieldKit(chooseStartingPath(createInitialState(), 'streetborn'));
  const state = chooseMissionApproach(startRpgMission(base, rpgMissions[0].id), 'assault');
  const shot = performTactic(state, 'attack');
  assert.equal(shot.rpg.active.feedback.damage, state.rpg.active.enemyHp - shot.rpg.active.enemyHp);
  assert.equal(shot.rpg.active.feedback.taken, state.health.currentHp - shot.health.currentHp);
  const covered = performTactic(state, 'cover');
  assert.ok(covered.rpg.active.feedback.blocked > shot.rpg.active.feedback.blocked);
  assert.equal(covered.rpg.active.feedback.damage, 0);
  const interrupted = performTactic(state, 'disrupt');
  assert.equal(interrupted.rpg.active.feedback.interrupted, true);
  assert.equal(interrupted.rpg.active.feedback.taken, 0);
});
