import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { createInitialState, cloneState } from '../src/systems/gameState.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { toggleInventoryLock } from '../src/systems/inventoryLocks.ts';
import { canQuickSellInventoryItem, inventorySellAllButOneCount, quickSellInventoryItem, quickSellAllButOne } from '../src/systems/inventorySellSystem.ts';
import { canSellVendorItem, sellVendorItem } from '../src/systems/vendorSystem.ts';
import { canSellCyberwareToRipperdoc, sellCyberwareToRipperdoc } from '../src/systems/ripperdocSystem.ts';
import { blackMarketEligibleItems, listBlackMarketItem } from '../src/systems/blackMarketSystem.ts';
import { items } from '../src/data/items.ts';
import { ripperdocClinics } from '../src/data/ripperdocClinics.ts';
import { readUiPreference, writeUiPreference } from '../src/components/useUiPreferences.ts';
import { UpcomingUnlocks } from '../src/components/UpcomingUnlocks.tsx';
import { itemAttributeRequirement } from '../src/systems/runnerProgression.ts';
import { CharacterTab } from '../src/App.tsx';
import { itemUpgradeCost, canAffordItemUpgrade } from '../src/systems/upgradeSystem.ts';

const item = items.find(i => i.type === 'Cyberware' && i.sellValue > 0 && !i.tags.includes('illegal') && !i.tags.includes('prototype'));
function stocked() {
  const state = createInitialState();
  Object.values(state.districts).forEach(d => { d.unlocked = true; });
  state.inventory[item.id] = 3;
  return state;
}

test('locking protects all copies from single, bulk, vendor, clinic and black-market selling', () => {
  const base = stocked(), locked = toggleInventoryLock(base, item.id);
  assert.equal(base.inventoryLocks[item.id], undefined);
  assert.equal(locked.inventoryLocks[item.id], true);
  assert.equal(canQuickSellInventoryItem(locked, item.id), false);
  assert.equal(inventorySellAllButOneCount(locked, item.id), 0);
  assert.equal(quickSellInventoryItem(locked, item.id), locked);
  assert.equal(quickSellAllButOne(locked, item.id), locked);
  assert.equal(canSellVendorItem(locked, 'vendor-neon-street', item.id), false);
  assert.equal(sellVendorItem(locked, 'vendor-neon-street', item.id), locked);
  const clinic = ripperdocClinics[0];
  assert.equal(canSellCyberwareToRipperdoc(locked, clinic.id, item.id), false);
  assert.equal(sellCyberwareToRipperdoc(locked, clinic.id, item.id), locked);
  assert.ok(!blackMarketEligibleItems(locked).includes(item.id));
  assert.equal(listBlackMarketItem(locked, item.id, 'balanced'), locked);
  const unlocked = toggleInventoryLock(locked, item.id);
  assert.ok(canQuickSellInventoryItem(unlocked, item.id));
  assert.ok(canSellVendorItem(unlocked, 'vendor-neon-street', item.id));
  assert.equal(quickSellAllButOne(unlocked, item.id).inventory[item.id], 1);
});

test('locks survive save normalization and cloning; old saves receive an empty lock map', () => {
  const locked = toggleInventoryLock(stocked(), item.id);
  const saved = normalizeSave(JSON.parse(JSON.stringify(locked)));
  assert.equal(saved.inventoryLocks[item.id], true);
  const copy = cloneState(saved); delete copy.inventoryLocks[item.id];
  assert.equal(saved.inventoryLocks[item.id], true);
  assert.deepEqual(normalizeSave({}).inventoryLocks, {});
  assert.deepEqual(normalizeSave({ inventoryLocks: { bogus: 'false' } }).inventoryLocks, {});
});

test('UI preferences tolerate corrupt values and blocked storage', () => {
  const original = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value) };
  try {
    writeUiPreference('test-sort', 'price');
    assert.equal(readUiPreference('test-sort', 'rarity', ['rarity','price']), 'price');
    writeUiPreference('test-sort', 'invalid');
    assert.equal(readUiPreference('test-sort', 'rarity', ['rarity','price']), 'rarity');
    values.set('cyber-idle-ui-v1:test-sort', '{bad json');
    assert.equal(readUiPreference('test-sort', 'rarity'), 'rarity');
    globalThis.localStorage = { getItem() { throw Error('disabled'); }, setItem() { throw Error('disabled'); } };
    assert.equal(readUiPreference('test-sort', 'rarity'), 'rarity');
    assert.doesNotThrow(() => writeUiPreference('test-sort', 'price'));
  } finally { globalThis.localStorage = original; }
});

test('upcoming unlocks show the next district and an unmet owned-equipment requirement', () => {
  const state = createInitialState();
  const gear = items.find(i => ['Weapon','Armor','Cyberware'].includes(i.type) && itemAttributeRequirement(i).level > 3);
  state.inventory[gear.id] = 1;
  const html = render(createElement(UpcomingUnlocks, { state }));
  assert.match(html, /Rust Yards/);
  assert.match(html, /Dead Drop/);
  assert.ok(html.includes(gear.name.replaceAll('&','&amp;')));
  assert.match(html, /unlock progress/);
  assert.doesNotMatch(html, /NaN|undefined/);
});

test('inventory retains lock and item actions in its selectable detail sheet', () => {
  const state = toggleInventoryLock(stocked(), item.id);
  const original = globalThis.localStorage;
  // The inspector only shows item actions after a selection; simulate a saved selection.
  globalThis.localStorage = {
    getItem: key => key.endsWith('inventory-selected') ? JSON.stringify(item.id) : null,
    setItem() {},
  };
  try {
    const html = render(createElement(CharacterTab, { state, section: 'gear', onSection() {}, onUpdate() {}, onRecover() {}, onAutoHealChange() {} }));
    assert.match(html, /Affordable upgrades/);
    assert.match(html, /Locked items/);
    assert.match(html, /inventory-detail-layer/);
    assert.match(html, /Back to inventory/);
    assert.match(html, /Locked against selling/);
    assert.match(html, /item-action-dock/);
    assert.doesNotMatch(html, /aria-modal="true"/);
  } finally { globalThis.localStorage = original; }
});

test('affordable filter updates when upgrade materials become insufficient', () => {
  const state = createInitialState();
  const gear = items.find(i => i.maxUpgradeLevel);
  state.inventory[gear.id] = 1;
  state.inventory['basic-med-injector'] = 5;
  state.rpg.attributes.technical = 20;
  const cost = itemUpgradeCost(state, gear.id);
  for (const [id, amount] of Object.entries(cost)) {
    if (id in state.resources) state.resources[id] = amount;
    else state.inventory[id] = amount + (id === gear.id ? 1 : 0);
  }
  assert.ok(canAffordItemUpgrade(state, gear.id));
  const original = globalThis.localStorage;
  globalThis.localStorage = { getItem: key => key.endsWith('inventory-upgrades') ? 'true' : null, setItem() {} };
  const props = { state, section: 'gear', onSection() {}, onUpdate() {}, onRecover() {}, onAutoHealChange() {} };
  try {
    assert.equal((render(createElement(CharacterTab, props)).match(/class="inventory-slot /g) ?? []).length, 1);
    const missingId = Object.keys(cost)[0];
    if (missingId in state.resources) state.resources[missingId] = 0;
    else state.inventory[missingId] = missingId === gear.id ? 1 : 0;
    assert.equal(canAffordItemUpgrade(state, gear.id), false);
    assert.match(render(createElement(CharacterTab, props)), /No matching items/);
  } finally { globalThis.localStorage = original; }
});
