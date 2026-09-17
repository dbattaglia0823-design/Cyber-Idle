import assert from 'node:assert/strict';
import { mainJobBalance } from '../src/data/mainJobBalance.ts';
import { getItem } from '../src/data/items.ts';
import { recipes } from '../src/data/recipes.ts';
import { rpgPerks } from '../src/data/rpgCampaign.ts';
import { cyberdecks } from '../src/data/cyberdecks.ts';
import { quickhacks } from '../src/data/quickhacks.ts';
import { spendAttribute, buyRpgPerk } from '../src/systems/rpgSystem.ts';
import { itemAttributeRequirement, meetsItemAttributeRequirement } from '../src/systems/runnerProgression.ts';

// Models preparation through local gigs and crafting, using only this district's gear.
export function prepareMainJob(state, mission, focus = 'body') {
  state.rpg.level = Math.min(30, 3 + mission.act * 4);
  state.rpg.attributes = { body: 3, reflexes: 3, intelligence: 3, technical: 3, cool: 3 };
  state.rpg.attributePoints = 7 + (state.rpg.level - 1) * 2;
  state.rpg.perks = {}; state.rpg.perkPoints = 2 + state.rpg.level - 1;
  const profile = mainJobBalance[mission.district];
  const armorPrefix = profile.armor.replace(/-chest$/, '');
  const gear = [profile.weapon, ...['chest','head','hands','legs','boots'].map(slot => armorPrefix + '-' + slot)].filter(id => getItem(id));
  const requirements = { body: 3, reflexes: 3, intelligence: 3, technical: 3 + mission.act * 2, cool: focus === 'cool' ? 4 + mission.act : 3 };
  for (const id of gear) {
    const requirement = itemAttributeRequirement(getItem(id));
    requirements[requirement.attribute] = Math.max(requirements[requirement.attribute], requirement.level);
    const recipe = recipes.find(recipe => recipe.outputItemId === id);
    assert.ok(recipe, id + ' craftable');
    assert.ok(!recipe.requiredDistrict || recipe.requiredDistrict === mission.district, id + ' local');
    assert.ok(recipe.requiredLevel <= Math.max(20, mission.act * 20 + 18), id + ' skill band');
  }
  for (const [attribute, target] of Object.entries(requirements)) while (state.rpg.attributes[attribute] < target) {
    const next = spendAttribute(state, attribute); assert.notEqual(next, state, 'enough attribute points'); state = next;
  }
  while (state.rpg.attributePoints > 0) {
    const attribute = [focus, 'body', 'reflexes', 'technical', 'intelligence', 'cool'].find(id => state.rpg.attributes[id] < 20);
    state = spendAttribute(state, attribute);
  }
  for (const perk of rpgPerks) state = buyRpgPerk(state, perk.id);
  for (const id of gear) {
    const item = getItem(id); assert.ok(meetsItemAttributeRequirement(state, item), id + ' attributes');
    state.inventory[id] = 1; state.equippedGear[item.slot] = id;
    state.upgradeLevels[id] = Math.min(4, state.rpg.attributes.technical - 2);
  }
  const deck = cyberdecks.filter(deck => deck.stage <= mission.act).at(-1);
  if (deck) { state.inventory[deck.id] = 1; state.equippedCyberware.operatingSystem = deck.id; }
  const programs = ['hack', 'disrupt', 'burnout'].map(family => quickhacks.filter(hack => hack.family === family && hack.stage <= mission.act && hack.technical <= state.rpg.attributes.technical).at(-1)).filter(Boolean);
  const deckId = state.equippedCyberware.operatingSystem;
  const installed = programs.slice(0, deck?.slots ?? 2);
  for (const hack of installed) state.inventory[hack.id] = 1;
  state.rpg.quickhackLoadouts[deckId] = installed.map(hack => hack.id);
  return state;
}
