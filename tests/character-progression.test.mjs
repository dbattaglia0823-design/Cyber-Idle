import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/systems/gameState.ts';
import { grantActivityCharacterXp, grantCharacterXp } from '../src/systems/characterProgression.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { startSkillAction, processActionCompletion } from '../src/systems/actionProcessing.ts';
import { startCraft, processCrafting } from '../src/systems/craftingProcessing.ts';
import { applyOfflineProgress } from '../src/systems/offlineProgress.ts';
import { runBasicSimCache } from '../src/systems/simCacheEngine.ts';
import { simCacheTypes } from '../src/data/simCache.ts';
import { startCombat, processCombat, allEnemies } from '../src/systems/combatProcessing.ts';

test('thirty minutes of completed work grants a level and points regardless of loop size',()=>{
 const fast=createInitialState(), slow=createInitialState();
 for(let i=0;i<900;i++)grantActivityCharacterXp(fast,2000);
 grantActivityCharacterXp(slow,1800000);
 assert.equal(fast.rpg.level,2); assert.equal(fast.rpg.xp,0);
 assert.equal(slow.rpg.level,fast.rpg.level);
 assert.equal(fast.rpg.attributePoints,8); assert.equal(fast.rpg.perkPoints,2);
 grantActivityCharacterXp(fast,3600000);
 assert.equal(fast.rpg.level,4); assert.equal(fast.rpg.attributePoints,10);
 assert.ok(fast.rewardPopups.some(p=>p.title==='Runner level 4'));
});

test('fractional activity XP survives save reload and old saves start safely',()=>{
 let state=createInitialState();
 for(let i=0;i<600;i++){
  grantActivityCharacterXp(state,3000);
  state=normalizeSave(JSON.parse(JSON.stringify(state)));
 }
 assert.equal(state.rpg.level,2); assert.equal(state.rpg.xp,0);
 const legacy=createInitialState();delete legacy.rpg.activityXpFraction;
 assert.equal(normalizeSave(legacy).rpg.activityXpFraction,0);
});

test('mission XP and training share overflow, rewards, normalization and level cap',()=>{
 const state=createInitialState();
 grantActivityCharacterXp(state,900000);
 assert.equal(state.rpg.xp,80);
 grantCharacterXp(state,100);
 assert.equal(state.rpg.level,2);assert.equal(state.rpg.xp,20);
 grantActivityCharacterXp(state,1e10);
 assert.equal(state.rpg.level,30);assert.equal(state.rpg.xp,0);
 assert.equal(state.rpg.attributePoints,49);assert.equal(state.rpg.perkPoints,16);
 const before=JSON.stringify(state.rpg);
 for(const n of [Infinity,NaN,-1,0,1800000])grantActivityCharacterXp(state,n);
 assert.equal(JSON.stringify(state.rpg),before);
 const overdue=createInitialState();overdue.rpg.xp=400;
 const restored=normalizeSave(overdue);
 assert.equal(restored.rpg.level,3);assert.equal(restored.rpg.xp,20);
 assert.deepEqual(normalizeSave(restored).rpg,restored.rpg);
});

test('live, offline and partial skill actions earn skill XP but no runner XP',()=>{
 const initial=startSkillAction(createInitialState(1000),'hack-public-terminal',1000);
 assert.equal(processActionCompletion(initial,1001).rpg.xp,0);
 const random=Math.random;Math.random=()=>0.5;
 try {
  let online=structuredClone(initial);
  for(let now=2000;now<=1861000;now+=1000)online=processActionCompletion(online,now);
  const offline=applyOfflineProgress(initial,1861000);
  assert.equal(online.rpg.level,1);assert.equal(offline.rpg.level,1);
  assert.equal(online.rpg.xp,0);assert.equal(offline.rpg.xp,0);
  assert.equal(offline.offlineRecap.characterLevelsGained,0);
  assert.equal(offline.offlineRecap.characterXpGained,0);
  assert.equal(online.rpg.attributePoints,7);assert.equal(offline.rpg.attributePoints,7);
  assert.equal(online.rpg.activityXpFraction??0,0);
  assert.equal(offline.rpg.activityXpFraction??0,0);
  assert.ok(offline.offlineRecap.levelsGained>0 || offline.skills.hacking.xp>initial.skills.hacking.xp);
  assert.deepEqual(online.skills.hacking,offline.skills.hacking);
  assert.deepEqual(online.actionMastery['hack-public-terminal'],offline.actionMastery['hack-public-terminal']);
 }finally{Math.random=random;}
});

test('crafting grants runner XP, while skill-action Sim Caches only train skills',()=>{
 let state=createInitialState(1000);state.resources.scrap=12;
 state=startCraft(state,'recipe-street-knife',1000);
 assert.ok(state.activeCraft);
 const duration=state.activeCraft.durationMs;
 const offline=applyOfflineProgress(state,61000);
 assert.equal(offline.offlineRecap.completions,2);
 const expected=createInitialState();grantActivityCharacterXp(expected,duration*2);
 assert.equal(offline.rpg.xp,expected.rpg.xp);
 assert.ok(Math.abs(offline.rpg.activityXpFraction-expected.rpg.activityXpFraction)<1e-8);
 state=processCrafting(state,1000+duration);
 assert.ok(state.rpg.xp+(state.rpg.activityXpFraction??0)>0);
 state=startSkillAction(createInitialState(1000),'hack-public-terminal',1000);
 state.manualDiscovery.skillActions['hack-public-terminal']=true;
 state.inventory[simCacheTypes[0].itemId]=1;
 const simulated=runBasicSimCache(state,1);
 assert.equal(simulated.rpg.xp,0);
 assert.equal(simulated.rpg.level,1);
 assert.equal(simulated.simulationRecap.characterXpGained,0);
 assert.ok(simulated.simulationRecap.xpGained>0);
});

test('defeated district enemies grant character XP',()=>{
 const state=createInitialState(1000);
 const enemy=allEnemies().find(e=>(e.requiredCombatLevel??1)<=1);
 state.health.currentHp=100000;state.health.maxHp=100000;
 const fighting=startCombat(state,enemy.id,1000);
 assert.ok(fighting.currentCombat);
 fighting.currentCombat.enemyHp=1;
 const result=processCombat(fighting,100000);
 assert.ok(result.enemyLog[enemy.id]?.kills>0);
 assert.ok(result.rpg.xp+(result.rpg.activityXpFraction??0)>0);
});
