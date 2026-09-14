import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/systems/gameState.ts';
import { exportSave, importSave } from '../src/systems/saveSystem.ts';
import { savePreset, loadPreset } from '../src/systems/presetSystem.ts';
import { equipItem } from '../src/systems/equipmentSystem.ts';
import { respecRpg } from '../src/systems/rpgSystem.ts';
import { itemAttributeRequirement } from '../src/systems/runnerProgression.ts';
import { getItem } from '../src/data/items.ts';
import { vendors } from '../src/data/vendors.ts';
import { canSellVendorItem, sellVendorItem } from '../src/systems/vendorSystem.ts';
import { blackMarketEligibleItems, isBlackMarketEligible, listBlackMarketItem } from '../src/systems/blackMarketSystem.ts';

test('save exports round-trip Unicode preset names and accept legacy Latin-1 exports', () => {
  const name = 'Runner \u2014 \u6771\u4eac \ud83c\udf03';
  const state = savePreset(createInitialState(), name);
  assert.deepEqual(importSave(exportSave(state)).equipmentPresets[name], state.equipmentPresets[name]);
  const old = savePreset(createInitialState(), 'Caf\u00e9');
  assert.deepEqual(importSave(btoa(JSON.stringify(old))).equipmentPresets, old.equipmentPresets);
});

test('presets reject mismatched equipment slots and handle reserved names safely', () => {
  let state = createInitialState();
  state.inventory['street-knife'] = 1;
  state.inventory['entry-cyberdeck'] = 1;
  state.equipmentPresets.invalid = { name: 'invalid', gear: { weapon: 'street-knife', chest: 'street-knife', operatingSystem: 'entry-cyberdeck' }, cyberware: { operatingSystem: 'entry-cyberdeck', weapon: 'street-knife' } };
  state = loadPreset(state, 'invalid');
  assert.deepEqual(state.equippedGear, { weapon: 'street-knife' });
  assert.deepEqual(state.equippedCyberware, { operatingSystem: 'entry-cyberdeck' });
  assert.equal(loadPreset(state, 'toString'), state);
  state = savePreset(state, '__proto__');
  assert.equal(Object.getPrototypeOf(state.equipmentPresets), Object.prototype);
  assert.ok(Object.hasOwn(state.equipmentPresets, '__proto__'));
  assert.deepEqual(loadPreset(state, '__proto__').equippedGear, state.equippedGear);
});

test('respec removes ineligible implants but preserves ownership, upgrades and eligible gear', () => {
  let state = createInitialState();
  const item = getItem('iconic-reflex-spine');
  const requirement = itemAttributeRequirement(item);
  state.rpg.attributes[requirement.attribute] = requirement.level;
  state.inventory[item.id] = 1;
  state.inventory['street-knife'] = 1;
  state.upgradeLevels[item.id] = 2;
  state = equipItem(equipItem(state, item.id), 'street-knife');
  const next = respecRpg(state);
  assert.equal(next.equippedCyberware[item.slot], undefined);
  assert.equal(next.equippedGear.weapon, 'street-knife');
  assert.equal(next.inventory[item.id], 1);
  assert.equal(next.upgradeLevels[item.id], 2);
  assert.equal(state.equippedCyberware[item.slot], item.id);
});

test('vendors and market listings preserve the last equipped copy while allowing spare sales', () => {
  let state = createInitialState();
  const item = getItem('iconic-reflex-spine');
  state.inventory[item.id] = 1;
  state.equippedCyberware[item.slot] = item.id;
  const vendor = vendors.find(v => v.canSell);
  state.districts[vendor.districtId].unlocked = true;
  assert.equal(canSellVendorItem(state, vendor.id, item.id), false);
  assert.equal(sellVendorItem(state, vendor.id, item.id), state);
  assert.equal(listBlackMarketItem(state, item.id, 'standard'), state);
  assert.ok(!blackMarketEligibleItems(state).includes(item.id));
  state.inventory[item.id] = 2;
  assert.equal(sellVendorItem(state, vendor.id, item.id).inventory[item.id], 1);
  const listed = listBlackMarketItem(state, item.id, 'standard');
  assert.equal(listed.inventory[item.id], 1);
  assert.equal(listed.blackMarketListings.length, 1);
  for (const count of [0, -1, 0.5, NaN, Infinity, 3]) assert.equal(listBlackMarketItem(state, item.id, 'standard', count), state);
});

test('market listings cannot consume reusable quickhacks', () => {
  const state = createInitialState();
  state.inventory['quickhack-short-circuit'] = 1;
  assert.equal(isBlackMarketEligible('quickhack-short-circuit'), false);
  assert.equal(listBlackMarketItem(state, 'quickhack-short-circuit', 'standard'), state);
});
