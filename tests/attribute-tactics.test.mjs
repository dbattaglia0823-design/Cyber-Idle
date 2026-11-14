import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { createInitialState, cloneState } from '../src/systems/gameState.ts';
import { beginRunner, startRpgMission, chooseMissionApproach, canUseTactic, performTactic, abilityCooldownRemaining, spendAttribute, tacticalStats } from '../src/systems/rpgSystem.ts';
import { tacticalAbilities } from '../src/data/tacticalAbilities.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { applyOfflineProgress } from '../src/systems/offlineProgress.ts';
import { TacticalEncounter } from '../src/screens/Missions/TacticalEncounter.tsx';
import { rpgMissions } from '../src/data/rpgCampaign.ts';
import { calculateMaxHP } from '../src/systems/healthSystem.ts';

function fight(attribute='body',act=0) {
 let state=beginRunner(createInitialState(1000),'streetborn');
 for(const mission of rpgMissions.slice(0,act))state.rpg.completed[mission.id]={outcome:'protect',approach:'assault',clears:1};
 for(const mission of rpgMissions.slice(0,act+1))state.districts[mission.district].unlocked=true;
 state.rpg.attributes[attribute]=8;
 state.rpg.attributePoints=2;
 state=chooseMissionApproach(startRpgMission(state,rpgMissions[act].id),'assault');
 state.rpg.active.enemyHp=1000;
 state.rpg.active.enemyMaxHp=1000;
 return state;
}

test('five attributes expose one unlockable ability each, without changing starter progression',()=>{
 assert.equal(tacticalAbilities.length,5);
 assert.equal(new Set(tacticalAbilities.map(a=>a.attribute)).size,5);
 for(const ability of tacticalAbilities) {
  const newbie=beginRunner(createInitialState(1000),'streetborn');
  const combat=chooseMissionApproach(startRpgMission(newbie,'dead-drop'),'assault');
  assert.equal(canUseTactic(combat,ability.id),false,ability.name);
  for(let i=0;i<5;i++) {
   const promoted=spendAttribute(newbie,ability.attribute);
   assert.notEqual(promoted,newbie);
   Object.assign(newbie.rpg,promoted.rpg);
  }
  const ready=chooseMissionApproach(startRpgMission(newbie,'dead-drop'),'assault');
  assert.equal(ready.rpg.attributes[ability.attribute],8);
  assert.equal(canUseTactic(ready,ability.id),true,ability.name);
 }
});

test('Body Breach Strike hits harder through plating and interrupts a charged retaliation',()=>{
 const base=fight('body',1);
 const normal=performTactic(base,'attack');
 const breach=performTactic(base,'ability:body');
 assert.ok(breach.rpg.active.enemyHp<normal.rpg.active.enemyHp);
 assert.equal(breach.rpg.active.feedback.interrupted,true);
 assert.equal(breach.health.currentHp,base.health.currentHp);
 assert.equal(breach.rpg.active.abilityReadyAt.body,4);
 assert.equal(abilityCooldownRemaining(breach,'ability:body'),3);
 assert.equal(canUseTactic(breach,'ability:body'),false);
 assert.equal(performTactic(breach,'ability:body'),breach);
});

test('Reflexes Double Tap combines with aim and spends the charge once',()=>{
 const state=fight('reflexes');
 state.rpg.active.aimed=true;
 const normal=performTactic(state,'attack'),fast=performTactic(state,'ability:reflexes');
 assert.ok(fast.rpg.active.feedback.damage>normal.rpg.active.feedback.damage);
 assert.equal(fast.rpg.active.aimed,false);
 assert.equal(fast.rpg.active.feedback.action,'ability:reflexes');
 assert.ok(fast.rpg.active.abilityClock>0);
});

test('Intelligence System Override costs two RAM, bypasses defenses and weakens enemy damage',()=>{
 const state=fight('intelligence',1);
 state.rpg.active.ram=2;
 const hacked=performTactic(state,'ability:intelligence');
 assert.ok(hacked.rpg.active.feedback.damage>=Math.round(tacticalStats(state).hack));
 assert.ok(hacked.rpg.active.weaken>0.2);
 assert.equal(hacked.rpg.active.weakenTurns,2);
 assert.ok(hacked.rpg.active.ram>=0);
 const without=cloneState(state);
 without.rpg.active.ram=1;
 assert.equal(canUseTactic(without,'ability:intelligence'),false);
 assert.equal(performTactic(without,'ability:intelligence'),without);
 assert.ok(hacked.rpg.active.feedback.taken<performTactic(state,'attack').rpg.active.feedback.taken);
});

test('Technical Emergency Patch heals and clears bleed without using an injector',()=>{
 const state=fight('technical');
 state.health.currentHp=calculateMaxHP(state)-30;
 state.rpg.active.playerBleedTurns=2;
 state.rpg.active.playerBleedDamage=5;
 state.rpg.active.meds=0;
 const repaired=performTactic(state,'ability:technical');
 assert.equal(repaired.rpg.active.playerBleedTurns,0);
 assert.equal(repaired.rpg.active.meds,0);
 assert.ok(repaired.health.currentHp>state.health.currentHp);
 assert.equal(repaired.rpg.active.feedback.action,'ability:technical');
 assert.equal(abilityCooldownRemaining(repaired,'ability:technical'),4);
});

test('Cool Ghost Step evades a hit and primes the next weapon attack',()=>{
 const state=fight('cool');
 const covered=performTactic(state,'cover'),stepped=performTactic(state,'ability:cool');
 assert.ok(stepped.rpg.active.feedback.taken<covered.rpg.active.feedback.taken);
 assert.equal(stepped.rpg.active.aimed,true);
 const next=performTactic(stepped,'attack');
 assert.equal(next.rpg.active.aimed,false);
 assert.ok(next.rpg.active.feedback.damage>performTactic(state,'attack').rpg.active.feedback.damage);
});

test('cooldowns persist across opponents, save round trips, and offline time',()=>{
 const state=fight('cool');
 const stepped=performTactic(state,'ability:cool');
 assert.equal(abilityCooldownRemaining(stepped,'ability:cool'),3);
 stepped.rpg.active.enemyHp=1;
 const cleared=performTactic(stepped,'attack');
 assert.equal(cleared.rpg.active.enemyIndex,1);
 assert.equal(abilityCooldownRemaining(cleared,'ability:cool'),2);
 assert.equal(canUseTactic(cleared,'ability:cool'),false);
 const reloaded=normalizeSave(JSON.parse(JSON.stringify(cleared)));
 assert.equal(abilityCooldownRemaining(reloaded,'ability:cool'),2);
 const offline=applyOfflineProgress(reloaded,reloaded.lastSavedAt+1000*60*60);
 assert.equal(abilityCooldownRemaining(offline,'ability:cool'),2);
 let later=performTactic(offline,'cover');
 assert.equal(abilityCooldownRemaining(later,'ability:cool'),1);
 later=performTactic(later,'cover');
 assert.equal(abilityCooldownRemaining(later,'ability:cool'),0);
 assert.equal(canUseTactic(later,'ability:cool'),true);
});

test('invalid ability state sanitizes safely and legacy combat saves remain valid',()=>{
 const state=fight('body');
 delete state.rpg.active.abilityClock;
 delete state.rpg.active.abilityReadyAt;
 const legacy=normalizeSave(state);
 assert.equal(legacy.rpg.active.abilityClock,0);
 assert.deepEqual(legacy.rpg.active.abilityReadyAt,{});
 assert.equal(canUseTactic(legacy,'ability:body'),true);
 state.rpg.active.abilityClock=Infinity;
 state.rpg.active.abilityReadyAt={body:Infinity,cool:-10,notAnAttribute:100};
 const sanitized=normalizeSave(state);
 assert.equal(sanitized.rpg.active.abilityClock,0);
 assert.deepEqual(sanitized.rpg.active.abilityReadyAt,{body:0,cool:0});
 assert.equal(canUseTactic(sanitized,'ability:body'),true);
});

test('combat UI shows accessible ready and cooldown states, and concise locked options',()=>{
 const ready=fight('body');
 let markup=render(createElement(TacticalEncounter,{state:ready,mission:rpgMissions[0],onUpdate(){}}));
 assert.match(markup,/ATTRIBUTE ABILITIES/);
 assert.match(markup,/Breach Strike/);
 assert.match(markup,/Other abilities/);
 assert.match(markup,/aria-label="Breach Strike: ready"/);
 const used=performTactic(ready,'ability:body');
 markup=render(createElement(TacticalEncounter,{state:used,mission:rpgMissions[0],onUpdate(){}}));
 assert.match(markup,/Cooldown · 3 turns/);
 assert.match(markup,/aria-label="Breach Strike: 3 turns until ready"/);
});
