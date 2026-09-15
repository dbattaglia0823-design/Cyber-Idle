import test from 'node:test';
import assert from 'node:assert/strict';
import { materialSupplyActions, districtSupplyItems } from '../src/data/materialSupply.ts';
import { districtSpecificMaterials } from '../src/data/districtMastery.ts';
import { districtLevelBands } from '../src/data/levelBands.ts';
import { skillActions } from '../src/data/skills.ts';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { startSkillAction, processActionCompletion } from '../src/systems/actionProcessing.ts';
import { applyOfflineProgress } from '../src/systems/offlineProgress.ts';
import { claimFieldKit, startRpgMission, chooseMissionApproach, resolveRpgMission } from '../src/systems/rpgSystem.ts';
import { rpgSideGigs } from '../src/data/rpgCampaign.ts';
import { resourceSourceHint } from '../src/data/resourceTiers.ts';

test('district supplies are focused, profession-specific and complete at district entry', () => {
  for (const [district, materials] of Object.entries(districtSpecificMaterials)) {
    const routes = materialSupplyActions.filter(a => a.districtReq === district);
    assert.ok(new Set(routes.map(a => a.skillId)).size >= 2, district);
    for (const material of materials) assert.ok(routes.some(a => a.itemRewards[material] > 0), district + ': ' + material);
    for (const action of routes) {
      assert.equal(action.levelReq, districtLevelBands[district].entryLevel);
      assert.ok(Object.keys(action.itemRewards).length <= 2, action.id);
      assert.ok(Object.values(action.itemRewards).every(n => n === 1), action.id);
      assert.ok(action.durationMs >= 24000, action.id);
      assert.ok(Object.keys(action.rewards).every(id => !(id in action.itemRewards)), action.id);
      if (action.skillId === 'scavenging') assert.ok(Object.values(action.rewards).every(n => n >= 0));
      else assert.ok(Object.values(action.rewards).some(n => n < 0), action.id);
    }
  }
  assert.equal(materialSupplyActions.find(a => a.id === 'supply-neonRow').skillId, 'cyberware');
  assert.match(resourceSourceHint('street-coil'), /Engineering 1/);
  assert.match(resourceSourceHint('rare-blueprint-fragment'), /Hacking 1/);
});

test('processing consumes each cycle and stops at the same limit online and offline', () => {
  let state = createInitialState(1000);
  assert.equal(startSkillAction(state, 'supply-neonRow', 1000), state);
  state.resources.scrap = 14; state.resources.circuitBoards = 2;
  state = startSkillAction(state, 'supply-neonRow', 1000);
  assert.ok(state.activeAction);
  const online = processActionCompletion(state, 301000);
  const offline = applyOfflineProgress(state, 301000);
  for (const next of [online, offline]) {
    assert.equal(next.activeAction, null);
    assert.equal(next.resources.scrap, 2);
    assert.equal(next.resources.circuitBoards, 0);
    assert.equal(next.inventory['street-coil'], 2);
    assert.equal(next.inventory['neon-circuit-fragment'], 2);
    assert.equal(next.inventory['rare-blueprint-fragment'], undefined);
    assert.deepEqual(next.skills.scavenging, { level: 1, xp: 0 });
  }
  assert.deepEqual(online.inventory, offline.inventory);
});

test('training cash is incidental and exceptional component duplication is removed', () => {
  for (const action of skillActions) if (action.rewards.credits > 0) {
    assert.ok(action.rewards.credits <= Math.max(1, Math.floor((30 + action.levelReq) * action.durationMs / 60000)), action.id);
  }
  assert.equal(skillActions.find(a => a.id === 'vehicle-prototype-interceptor-tuning').rewards.prototypeDriveUnit, undefined);
  assert.equal(skillActions.find(a => a.id === 'scav-prototype-recovery-zone').rewards.armorPlating, undefined);
});

test('local gig supplies rotate one component per clear instead of bypassing every profession', () => {
  let state = claimFieldKit(chooseStartingPath(createInitialState(), 'streetborn'));
  const gig = rpgSideGigs[0], materials = districtSupplyItems(gig.district);
  for (let i = 0; i < materials.length; i++) {
    const before = { ...state.inventory };
    state = chooseMissionApproach(startRpgMission(state, gig.id), 'assault');
    state.rpg.active.phase = 'decision';
    state = resolveRpgMission(state, 'extract');
    for (const material of materials) assert.equal((state.inventory[material] ?? 0) - (before[material] ?? 0), material === materials[i] ? 1 : 0);
  }
});


test('Neon Row has exactly three Scavenging actions and preserves starter material access', () => {
  const actions = skillActions.filter(a => a.skillId === 'scavenging' && a.districtReq === 'neonRow').sort((a,b) => a.levelReq-b.levelReq);
  assert.deepEqual(actions.map(a => a.levelReq), [1,10,15]);
  assert.deepEqual(actions.map(a => a.id), ['scav-alley-scrap-run','scav-backlot-dumpster-sweep','scav-clinic-sweep']);
  assert.ok(!skillActions.some(a => a.id === 'scav-recover-circuit-boards'));
  let state = startSkillAction(createInitialState(1000), actions[0].id, 1000);
  const before = { ...state.resources };
  state = processActionCompletion(state, 1000 + state.activeAction.durationMs);
  assert.equal(state.resources.circuitBoards - before.circuitBoards, 1);
  assert.equal(state.resources.scrap - before.scrap, 6);
  assert.ok(actions[0].durationMs >= 8000);
  const recovery = skillActions.find(a => a.id === 'supply-neonRow-1');
  assert.equal(recovery.skillId, 'vehicleTuning');
  assert.equal(recovery.levelReq, 1);
  assert.deepEqual(recovery.itemRewards, {'redline-wire':1,'lowgrade-optic-lens':1});
  assert.ok(recovery.rewards.vehicleParts < 0);
});
