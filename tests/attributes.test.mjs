import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BuildPanel } from '../src/components/RpgHub.tsx';
import { createInitialState, cloneState } from '../src/systems/gameState.ts';
import { getActiveModifiers } from '../src/systems/modifiers.ts';
import { playerCombatStats } from '../src/systems/formulas.ts';
import { spendAttribute, buyRpgPerk, respecRpg, tacticalStats } from '../src/systems/rpgSystem.ts';
import { canAffordItemUpgrade, upgradeItem, itemUpgradeCost } from '../src/systems/upgradeSystem.ts';
import { getItem } from '../src/data/items.ts';
import { equipItem } from '../src/systems/equipmentSystem.ts';
import { itemAttributeRequirement } from '../src/systems/runnerProgression.ts';
import { savePreset, loadPreset } from '../src/systems/presetSystem.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';

test('all five attributes give useful bonuses before the starter kit is claimed', () => {
  const base = createInitialState();
  const body = spendAttribute(base, 'body');
  assert.ok(playerCombatStats(body).maxHp > playerCombatStats(base).maxHp);
  assert.ok(tacticalStats(body).heal > tacticalStats(base).heal);
  const reflexes = spendAttribute(base, 'reflexes');
  assert.ok(playerCombatStats(reflexes).attackSpeedMs < playerCombatStats(base).attackSpeedMs);
  const intelligence = spendAttribute(base, 'intelligence');
  assert.ok(tacticalStats(intelligence).hack > tacticalStats(base).hack);
  assert.ok(getActiveModifiers(intelligence).jobSuccessChance > getActiveModifiers(base).jobSuccessChance);
  const technical = spendAttribute(base, 'technical');
  assert.ok(getActiveModifiers(technical).combatDefense > getActiveModifiers(base).combatDefense);
  assert.ok(itemUpgradeCost(technical, 'street-knife').credits < itemUpgradeCost(base, 'street-knife').credits);
  const cool = spendAttribute(base, 'cool');
  assert.ok(tacticalStats(cool).mitigation > tacticalStats(base).mitigation);
  assert.ok(getActiveModifiers(cool).heatGain < getActiveModifiers(base).heatGain);
  assert.equal(base.rpg.attributes.body, 3);
});

test('retired skill levels, weapon levels and Build perks cannot boost character combat stats', () => {
  const base = createInitialState();
  const legacy = cloneState(base);
  for (const skill of Object.values(legacy.skills)) skill.level = 150;
  for (const weapon of Object.values(legacy.weaponClasses)) weapon.level = 99;
  legacy.perkRanks = { 'solo-hard-target': 5, 'core-efficient-routine': 5 };
  assert.deepEqual(playerCombatStats(legacy), playerCombatStats(base));
  assert.deepEqual(tacticalStats(legacy), tacticalStats(base));
  assert.equal(getActiveModifiers(legacy).actionSpeed, getActiveModifiers(base).actionSpeed);
});

test('Technical and Tinkerer gate upgrades even with maxed skills and ample resources', () => {
  let state = createInitialState();
  for (const id of Object.keys(state.resources)) state.resources[id] = 100000;
  for (const skill of Object.values(state.skills)) skill.level = 150;
  state.inventory['street-knife'] = 100;
  state.upgradeLevels['street-knife'] = 1;
  assert.equal(canAffordItemUpgrade(state, 'street-knife'), false);
  assert.equal(upgradeItem(state, 'street-knife'), state);
  state = spendAttribute(state, 'technical');
  assert.equal(canAffordItemUpgrade(state, 'street-knife'), true);
  const upgraded = upgradeItem(state, 'street-knife');
  assert.equal(upgraded.upgradeLevels['street-knife'], 2);
  assert.ok(upgraded.resources.credits < state.resources.credits);
  state = spendAttribute(upgraded, 'technical');
  state.upgradeLevels['street-knife'] = 3;
  assert.equal(canAffordItemUpgrade(state, 'street-knife'), false);
  const cost = itemUpgradeCost(state, 'street-knife').credits;
  state = buyRpgPerk(state, 'tinkerer');
  assert.equal(canAffordItemUpgrade(state, 'street-knife'), true);
  assert.ok(itemUpgradeCost(state, 'street-knife').credits < cost);
  state = respecRpg(state);
  assert.equal(canAffordItemUpgrade(state, 'street-knife'), false);
  assert.equal(state.upgradeLevels['street-knife'], 3);
});

test('equipment and presets use attribute requirements instead of skill levels', () => {
  let state = createInitialState();
  const item = getItem('iconic-reflex-spine');
  state.inventory[item.id] = 1;
  state.skills.cyberware.level = 150;
  assert.equal(equipItem(state, item.id), state);
  const requirement = itemAttributeRequirement(item);
  state.rpg.attributes[requirement.attribute] = requirement.level;
  state.skills.cyberware.level = 1;
  state = equipItem(state, item.id);
  assert.equal(state.equippedCyberware[item.slot], item.id);
  state = savePreset(state, 'test');
  state.rpg.attributes[requirement.attribute] = 3;
  assert.equal(loadPreset(state, 'test').equippedCyberware[item.slot], undefined);
});

test('legacy character investment transfers once without deleting gear or progress', () => {
  const old = createInitialState();
  delete old.rpg.attributeProgressionVersion;
  old.skills.combat.level = 75;
  old.perkRanks['core-efficient-routine'] = 3;
  old.equippedGear.weapon = 'street-knife';
  old.upgradeLevels['street-knife'] = 4;
  const migrated = normalizeSave(old);
  assert.equal(migrated.rpg.level, 16);
  assert.equal(migrated.rpg.attributePoints, 37);
  assert.equal(migrated.rpg.perkPoints, 20);
  assert.equal(migrated.equippedGear.weapon, 'street-knife');
  assert.equal(migrated.upgradeLevels['street-knife'], 4);
  assert.equal(migrated.skills.combat.level, 75);
  assert.deepEqual(normalizeSave(migrated).rpg, migrated.rpg);
});

test('attributes screen shows live stats, per-point bonuses and the upgrade perk', () => {
  const html = renderToStaticMarkup(createElement(BuildPanel, { state: createInitialState(), onUpdate() {} }));
  assert.match(html, /Attribute-derived stats/);
  assert.match(html, /UPGRADE LIMIT/);
  assert.match(html, /Tinkerer/);
  assert.match(html, /per point above 3/);
  assert.doesNotMatch(html, /NaN|undefined/);
});
