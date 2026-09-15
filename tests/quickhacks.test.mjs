import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createInitialState, chooseStartingPath, cloneState } from '../src/systems/gameState.ts';
import { claimFieldKit, startRpgMission, chooseMissionApproach, canUseTactic, performTactic, maxRam, resolveRpgMission } from '../src/systems/rpgSystem.ts';
import { craftQuickhack, installQuickhack, removeQuickhack, installedQuickhacks } from '../src/systems/quickhackSystem.ts';
import { equipItem, unequipCyberware } from '../src/systems/equipmentSystem.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { savePreset, loadPreset } from '../src/systems/presetSystem.ts';
import { QuickhackPanel } from '../src/components/QuickhackPanel.tsx';
const fresh = () => claimFieldKit(chooseStartingPath(createInitialState(), 'streetborn'));
const combat = state => chooseMissionApproach(startRpgMission(state, 'dead-drop'), 'assault');

test('field kit grants real software and hacking requires a compatible equipped deck', () => {
  const state = fresh();
  assert.equal(state.equippedCyberware.operatingSystem, 'entry-cyberdeck');
  assert.equal(installedQuickhacks(state).length, 2);
  assert.ok(canUseTactic(combat(state), 'hack'));
  const removed = unequipCyberware(state, 'operatingSystem');
  assert.equal(maxRam(removed), 0);
  assert.equal(canUseTactic(combat(removed), 'hack'), false);
  assert.equal(canUseTactic(combat(removed), 'overclock'), false);
  removed.inventory['helix-governor-os'] = 1;
  removed.rpg.attributes.technical = 20;
  const medical = equipItem(removed, 'helix-governor-os');
  assert.equal(maxRam(medical), 0);
  assert.equal(canUseTactic(combat(removeQuickhack(state, 'quickhack-short-circuit')), 'hack'), false);
});

test('quickhack crafting charges the resource wallet exactly once and enforces Technical', () => {
  const state = fresh();
  state.resources.credits = 1000; state.resources.encryptedData = 50;
  assert.equal(craftQuickhack(state, 'quickhack-synapse-burnout'), state);
  state.rpg.attributes.technical = 5;
  const next = craftQuickhack(state, 'quickhack-synapse-burnout');
  assert.equal(next.resources.credits, 600);
  assert.equal(next.resources.encryptedData, 30);
  assert.equal(next.inventory['quickhack-synapse-burnout'], 1);
  assert.equal(state.resources.credits, 1000);
  assert.equal(craftQuickhack(next, 'quickhack-synapse-burnout'), next);
  const poor = cloneState(state); poor.resources.encryptedData = 19;
  assert.equal(craftQuickhack(poor, 'quickhack-synapse-burnout'), poor);
  assert.equal(craftQuickhack(state, 'unknown'), state);
});

test('deck slots enforce capacity and ownership, preserve per-deck programs, and survive saves', () => {
  let state = fresh(); state.inventory['quickhack-synapse-burnout'] = 1;
  assert.equal(installQuickhack(state, 'quickhack-synapse-burnout'), state);
  state = installQuickhack(removeQuickhack(state, 'quickhack-short-circuit'), 'quickhack-synapse-burnout');
  assert.deepEqual(installedQuickhacks(state).map(h => h.action), ['disrupt', 'burnout']);
  state.inventory['streetdeck-os'] = 1;
  state = equipItem(state, 'streetdeck-os');
  assert.equal(installedQuickhacks(state).length, 0);
  state = installQuickhack(state, 'quickhack-short-circuit');
  state = equipItem(state, 'entry-cyberdeck');
  assert.deepEqual(installedQuickhacks(normalizeSave(state)).map(h => h.action), ['disrupt', 'burnout']);
  const cloned = cloneState(state); cloned.rpg.quickhackLoadouts['entry-cyberdeck'].pop();
  assert.equal(installedQuickhacks(state).length, 2);
  const unowned = removeQuickhack(state, 'quickhack-synapse-burnout'); delete unowned.inventory['quickhack-synapse-burnout'];
  assert.equal(installQuickhack(unowned, 'quickhack-synapse-burnout'), unowned);
});

test('combat spends exact RAM, interrupts fire, regenerates, and rejects unaffordable casts', () => {
  let state = combat(fresh());
  state.rpg.active.enemyHp = state.rpg.active.enemyMaxHp = 1000;
  const hp = state.health.currentHp, ram = state.rpg.active.ram;
  let next = performTactic(state, 'disrupt');
  assert.equal(next.health.currentHp, hp);
  assert.equal(next.rpg.active.ram, ram - 4 + 1);
  assert.ok(next.rpg.active.enemyHp < 1000);
  next.rpg.active.ram = 1;
  assert.equal(performTactic(next, 'hack'), next);
  const recovered = performTactic(next, 'overclock');
  assert.equal(recovered.rpg.active.ram, 5);
  state = fresh(); state.inventory['quickhack-synapse-burnout'] = 1;
  state = combat(installQuickhack(removeQuickhack(state, 'quickhack-short-circuit'), 'quickhack-synapse-burnout'));
  state.rpg.active.enemyHp = state.rpg.active.enemyMaxHp = 1000;
  const burned = performTactic(state, 'burnout');
  assert.equal(burned.rpg.active.ram, state.rpg.active.ram - 6 + 1);
  assert.ok(burned.rpg.active.enemyHp < 950);
});

test('mission locks prevent deck and program swaps through equipment or presets', () => {
  let state = fresh(); state.inventory['streetdeck-os'] = 1;
  state = combat(savePreset(state, 'test'));
  assert.equal(equipItem(state, 'streetdeck-os'), state);
  assert.equal(unequipCyberware(state, 'operatingSystem'), state);
  assert.equal(removeQuickhack(state, 'quickhack-short-circuit'), state);
  assert.equal(loadPreset(state, 'test'), state);
});

test('legacy field kits receive programs once without replacing an existing OS', () => {
  const state = fresh(); delete state.rpg.quickhackVersion; delete state.rpg.quickhackLoadouts;
  delete state.inventory['quickhack-short-circuit']; delete state.inventory['quickhack-reboot-optics'];
  state.equippedCyberware.operatingSystem = 'helix-governor-os';
  const next = normalizeSave(state);
  assert.equal(next.equippedCyberware.operatingSystem, 'helix-governor-os');
  assert.equal(next.inventory['quickhack-short-circuit'], 1);
  assert.deepEqual(normalizeSave(next).inventory, next.inventory);
});

test('quickhack management renders installed slots, crafting requirements and mission locks', () => {
  for (const state of [fresh(), combat(fresh()), unequipCyberware(fresh(), 'operatingSystem')]) {
    const html = renderToStaticMarkup(createElement(QuickhackPanel, { state, onUpdate() {} }));
    assert.match(html, /Synapse Burnout/);
    assert.match(html, /Encrypted Data/);
    assert.match(html, /PROGRAM SLOTS/);
    assert.doesNotMatch(html, /NaN|undefined|Infinity/);
    if (state.rpg.active) assert.match(html, /Return to the clinic/);
  }
});

test('main jobs no longer bypass program crafting with automatic quickhacks', async () => {
  const { rpgMissions } = await import('../src/data/rpgCampaign.ts');
  const state = fresh(), mission = rpgMissions[2];
  state.rpg.active = { missionId: mission.id, phase: 'decision', approach: 'assault', enemyIndex: mission.enemies.length, enemyHp: 0, enemyMaxHp: 100, turn: 1, ram: 0, meds: 1, aimed: false, log: [] };
  const next = resolveRpgMission(state, mission.choices[0].id);
  assert.equal(next.inventory['quickhack-synapse-burnout'], undefined);
  assert.equal(state.inventory['quickhack-synapse-burnout'], undefined);
  assert.equal(resolveRpgMission(next, mission.choices[0].id), next);

});
