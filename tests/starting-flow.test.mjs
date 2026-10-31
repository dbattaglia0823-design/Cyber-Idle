import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { createInitialState } from '../src/systems/gameState.ts';
import { beginRunner, claimFieldKit, applyStartingBuild, startingBuilds, respecRpg, startRpgMission } from '../src/systems/rpgSystem.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { BuildPanel } from '../src/components/RpgHub.tsx';
import { NextGoal } from '../src/components/NextGoal.tsx';

test('starting an origin equips its free kit once and survives save reload',()=>{
  for(const origin of ['streetborn','outrider','corporateDefector']) {
    const base=createInitialState(), snapshot=JSON.stringify(base);
    const started=beginRunner(base,origin);
    assert.equal(JSON.stringify(base),snapshot);
    assert.equal(started.rpg.starterClaimed,true);
    assert.equal(started.equippedGear.weapon,'rpg-weapon-0');
    assert.equal(started.equippedGear.chest,'padded-street-vest');
    assert.equal(started.equippedCyberware.operatingSystem,'entry-cyberdeck');
    assert.equal(started.inventory['basic-med-injector'],5);
    assert.equal(claimFieldKit(started),started);
    assert.equal(beginRunner(started,'outrider'),started);
    const restored=normalizeSave(JSON.parse(JSON.stringify(started)));
    assert.equal(restored.rpg.attributePoints,7);
    assert.equal(restored.rpg.perkPoints,2);
    assert.deepEqual(restored.equippedGear,started.equippedGear);
  }
});
test('starting builds spend exactly seven points without changing perks or existing builds',()=>{
  const base=beginRunner(createInitialState(),'streetborn');
  for(const id of Object.keys(startingBuilds)) {
    const built=applyStartingBuild(base,id);
    assert.equal(built.rpg.attributePoints,0);
    assert.equal(built.rpg.perkPoints,2);
    assert.equal(Object.values(built.rpg.attributes).reduce((a,b)=>a+b,0),22);
    assert.equal(applyStartingBuild(built,id),built);
    assert.deepEqual(respecRpg(built).rpg.attributes,base.rpg.attributes);
    assert.equal(respecRpg(built).rpg.attributePoints,7);
    assert.equal(base.rpg.attributePoints,7);
  }
  const active=startRpgMission(base,'dead-drop');
  assert.equal(applyStartingBuild(active,'weapons'),active);
  assert.equal(applyStartingBuild(base,'invalid'),base);
});
test('fresh character shows a compact build choice and keeps advanced choices available',()=>{
  const state=beginRunner(createInitialState(),'streetborn');
  const html=render(createElement(BuildPanel,{state,onUpdate(){}}));
  assert.match(html,/Weapons/);assert.match(html,/Quickhacks/);assert.match(html,/Balanced/);
  assert.match(html,/Customize points/);assert.match(html,/Perks · 2 points saved/);
  assert.doesNotMatch(html,/Attribute-derived stats/);
  const next=render(createElement(NextGoal,{state}));
  assert.match(next,/Starter gear equipped/);
  assert.doesNotMatch(next,/journey-checklist|journey-preparation/);
  state.rpg.completed['neon-gig']={clears:1};
  assert.doesNotMatch(render(createElement(BuildPanel,{state,onUpdate(){}})),/early-perks/);
});
