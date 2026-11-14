import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/systems/gameState.ts';
import { grantCharacterXp, totalCharacterXp } from '../src/systems/characterProgression.ts';
import { runnerXpNeeded, campaignRunnerTargets } from '../src/data/campaignBalance.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { startSkillAction, processActionCompletion } from '../src/systems/actionProcessing.ts';
import { startCraft, processCrafting } from '../src/systems/craftingProcessing.ts';
import { applyOfflineProgress } from '../src/systems/offlineProgress.ts';
import { runBasicSimCache } from '../src/systems/simCacheEngine.ts';
import { simCacheTypes } from '../src/data/simCache.ts';
import { startCombat, processCombat, allEnemies } from '../src/systems/combatProcessing.ts';
import { beginRunner, startRpgMission, chooseMissionApproach, resolveRpgMission, missionCharacterXp } from '../src/systems/rpgSystem.ts';
import { rpgMissions, rpgSideGigs } from '../src/data/rpgCampaign.ts';

test('runner level XP preserves overflow, points and the level-30 cap',()=>{
 const state=createInitialState();
 grantCharacterXp(state,180);
 assert.equal(state.rpg.level,2);
 assert.equal(state.rpg.xp,20);
 assert.equal(state.rpg.attributePoints,8);
 assert.equal(state.rpg.perkPoints,2);
 grantCharacterXp(state,runnerXpNeeded(2)-20);
 assert.equal(state.rpg.level,3); assert.equal(state.rpg.xp,0);
 grantCharacterXp(state,1e10);
 assert.equal(state.rpg.level,30);assert.equal(state.rpg.xp,0);
 assert.equal(state.rpg.attributePoints,49);assert.equal(state.rpg.perkPoints,16);
 const snapshot=JSON.stringify(state.rpg);
 for(const invalid of [NaN,Infinity,-1,0,180])grantCharacterXp(state,invalid);
 assert.equal(JSON.stringify(state.rpg),snapshot);
 const overdue=createInitialState();overdue.rpg.xp=400;
 const restored=normalizeSave(overdue);
 assert.equal(restored.rpg.level,3);assert.equal(restored.rpg.xp,20);
 assert.deepEqual(normalizeSave(restored).rpg,restored.rpg);
});

test('old fractional activity XP remains safe in saves but is not earned by repeatable play',()=>{
 const old=createInitialState();
 old.rpg.activityXpFraction=0.625;
 const restored=normalizeSave(JSON.parse(JSON.stringify(old)));
 assert.equal(restored.rpg.activityXpFraction,0.625);
 assert.deepEqual(normalizeSave(restored).rpg,restored.rpg);
 const missing=createInitialState();delete missing.rpg.activityXpFraction;
 assert.equal(normalizeSave(missing).rpg.activityXpFraction,0);
});

test('live, offline and partial skill actions train skills without runner XP',()=>{
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
  assert.ok(offline.offlineRecap.levelsGained>0 || offline.skills.hacking.xp>initial.skills.hacking.xp);
  assert.deepEqual(online.skills.hacking,offline.skills.hacking);
  assert.deepEqual(online.actionMastery['hack-public-terminal'],offline.actionMastery['hack-public-terminal']);
 } finally {Math.random=random;}
});

test('live, offline and simulated crafting grant materials, skill XP and mastery but no runner XP',()=>{
 let state=createInitialState(1000);state.resources.scrap=12;
 state=startCraft(state,'recipe-street-knife',1000);
 assert.ok(state.activeCraft);
 const offline=applyOfflineProgress(state,61000);
 assert.equal(offline.offlineRecap.completions,2);
 assert.equal(offline.offlineRecap.characterXpGained,0);
 assert.equal(offline.rpg.level,1);assert.equal(offline.rpg.xp,0);
 assert.ok(offline.inventory['street-knife']>=2);
 state=processCrafting(state,1000+state.activeCraft.durationMs);
 assert.equal(state.rpg.xp,0);
 assert.equal(state.rpg.level,1);
 assert.ok(state.skills.cyberware.xp>0 || state.skills.cyberware.level>1);
 const cacheState=createInitialState(1000);
 cacheState.resources.scrap=120;
 cacheState.manualDiscovery.recipes['recipe-street-knife']=true;
 cacheState.inventory[simCacheTypes[0].itemId]=1;
 const ready=startCraft(cacheState,'recipe-street-knife',1000);
 const simulated=runBasicSimCache(ready,1);
 assert.notEqual(simulated,ready);
 assert.ok(simulated.simulationRecap.completions>0);
 assert.ok(simulated.simulationRecap.xpGained>0);
 assert.equal(simulated.simulationRecap.characterXpGained,0);
 assert.equal(simulated.rpg.level,1);assert.equal(simulated.rpg.xp,0);
});

test('street combat defeats grant combat skill XP and loot but not runner XP',()=>{
 const state=createInitialState(1000);
 const enemy=allEnemies().find(e=>(e.requiredCombatLevel??1)<=1);
 state.health.currentHp=100000;state.health.maxHp=100000;
 const fighting=startCombat(state,enemy.id,1000);
 assert.ok(fighting.currentCombat);
 fighting.currentCombat.enemyHp=1;
 const result=processCombat(fighting,100000);
 assert.ok(result.enemyLog[enemy.id]?.kills>0);
 assert.ok(result.skills.combat.xp>0 || result.skills.combat.level>1);
 assert.equal(result.rpg.xp,0);assert.equal(result.rpg.level,1);
});

test('Neon Row gig farming cannot max the runner or bypass chapters; first clear still rewards XP',()=>{
 let state=beginRunner(createInitialState(1000),'streetborn');
 const gig=rpgSideGigs[0];
 assert.equal(missionCharacterXp(state,gig),gig.xp);
 for(let clear=0;clear<40;clear++){
  const before=totalCharacterXp(state);
  const encounter=chooseMissionApproach(startRpgMission(state,gig.id),'assault');
  assert.equal(encounter.rpg.active.missionId,gig.id);
  encounter.rpg.active.phase='decision';
  state=resolveRpgMission(encounter,gig.choices[0].id,()=>1);
  assert.equal(totalCharacterXp(state)-before,clear===0?gig.xp:0);
  assert.equal(state.rpg.completed[gig.id].clears,clear+1);
  assert.equal(missionCharacterXp(state,gig),0);
 }
 assert.equal(state.rpg.level,2);
 assert.equal(state.rpg.attributePoints,8);
 assert.equal(state.districts.rustYards.unlocked,false);
 assert.ok(state.resources.credits>1000);
 const firstJob=rpgMissions[0];
 const encounter=chooseMissionApproach(startRpgMission(state,firstJob.id),'assault');
 encounter.rpg.active.phase='decision';
 const cleared=resolveRpgMission(encounter,firstJob.choices[0].id,()=>1);
 assert.ok(cleared.rpg.level>=campaignRunnerTargets[0]);
 assert.ok(cleared.rpg.level<campaignRunnerTargets[1]);
 assert.equal(cleared.districts.rustYards.unlocked,true);
});

test('previously earned character levels, points, district and item progress survive reload',()=>{
 const old=beginRunner(createInitialState(1000),'streetborn');
 grantCharacterXp(old,1e10);
 old.inventory['street-knife']=4;
 old.skills.hacking.level=63;
 old.districts.rustYards.unlocked=true;
 const saved=normalizeSave(JSON.parse(JSON.stringify(old)));
 assert.equal(saved.rpg.level,30);
 assert.equal(saved.rpg.attributePoints,49);
 assert.equal(saved.skills.hacking.level,63);
 assert.equal(saved.inventory['street-knife'],4);
 assert.equal(saved.districts.rustYards.unlocked,true);
 assert.deepEqual(normalizeSave(saved).rpg,saved.rpg);
});
