import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/systems/gameState.ts';
import { grantActivityCharacterXp } from '../src/systems/characterProgression.ts';
import { MAX_CHARACTER_LEVEL, attributePointBudget, perkPointBudget } from '../src/data/characterBuild.ts';
import { attributeDefinitions, rpgPerks } from '../src/data/rpgCampaign.ts';
import { spendAttribute, buyRpgPerk, respecRpg } from '../src/systems/rpgSystem.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
const capped = () => {const state=createInitialState();grantActivityCharacterXp(state,1e10);return state;};

test('level cap limits lifetime investment below all attributes and all perk trees',()=>{
 const state=capped();
 assert.equal(state.rpg.level,MAX_CHARACTER_LEVEL);
 assert.equal(state.rpg.attributePoints,40);assert.equal(state.rpg.perkPoints,16);
 assert.ok(attributePointBudget(MAX_CHARACTER_LEVEL)<attributeDefinitions.length*17);
 assert.ok(perkPointBudget(MAX_CHARACTER_LEVEL)<rpgPerks.length);
 const before=structuredClone(state.rpg);
 grantActivityCharacterXp(state,1e10);
 assert.deepEqual(state.rpg,before);
});

test('any attribute and its entire perk tree can be maxed within the budget',()=>{
 for(const attribute of attributeDefinitions){
  let state=capped();
  for(let i=0;i<17;i++)state=spendAttribute(state,attribute.id);
  assert.equal(state.rpg.attributes[attribute.id],20);
  const tree=rpgPerks.filter(p=>p.attribute===attribute.id);
  for(let pass=0;pass<tree.length;pass++)for(const perk of tree)state=buyRpgPerk(state,perk.id);
  assert.ok(tree.every(p=>state.rpg.perks[p.id]),attribute.id);
  assert.equal(state.rpg.perkPoints,16-tree.length);
  assert.equal(state.rpg.attributePoints,23);
  assert.deepEqual(normalizeSave(state).rpg,state.rpg);
  for(let i=0;i<3;i++)state=respecRpg(state);
  assert.equal(state.rpg.attributePoints,40);assert.equal(state.rpg.perkPoints,16);
 }
});

test('old over-budget builds are refunded without resetting character progress',()=>{
 const state=capped();
 for(const key of Object.keys(state.rpg.attributes))state.rpg.attributes[key]=20;
 state.rpg.perks=Object.fromEntries(rpgPerks.map(p=>[p.id,true]));
 state.rpg.attributePoints=65;state.rpg.perkPoints=31;
 const restored=normalizeSave(state);
 assert.equal(restored.rpg.level,30);
 assert.ok(Object.values(restored.rpg.attributes).every(v=>v===3));
 assert.deepEqual(restored.rpg.perks,{});
 assert.equal(restored.rpg.attributePoints,40);assert.equal(restored.rpg.perkPoints,16);
 assert.deepEqual(normalizeSave(restored).rpg,restored.rpg);
});
