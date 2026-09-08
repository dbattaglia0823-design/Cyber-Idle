import { openStoryThroughSkillBand } from "./story-fixture.mjs";
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/systems/gameState.ts';
import { applyDamage, clampPlayerHP, recoverFromDowned, useHealingItem, calculateMaxHP } from '../src/systems/healthSystem.ts';
import { normalizeSave, exportSave, importSave } from '../src/systems/saveSystem.ts';
import { startSkillAction, processActionCompletion } from '../src/systems/actionProcessing.ts';
import { startCraft } from '../src/systems/craftingProcessing.ts';
import { startCombat, processCombat } from '../src/systems/combatProcessing.ts';
import { applyOfflineProgress, OFFLINE_CAP_MS } from '../src/systems/offlineProgress.ts';
import { updateWorldUnlocks } from '../src/systems/worldUnlocks.ts';
import { runBasicSimCache } from '../src/systems/simCacheEngine.ts';
import { operations } from '../src/data/operations.ts';
import { weaponSpecs } from '../src/data/weapons.ts';
import { armorSpecs } from '../src/data/armor.ts';
import { cyberwareSpecs } from '../src/data/cyberware.ts';
import { districtLevelBands } from '../src/data/levelBands.ts';
import { startOperation, processOperation, operationRequirementDetails } from '../src/systems/operationProcessor.ts';

test('death persists across clamping, export and reload; free recovery never needs currency', () => {
  let state = createInitialState();
  state.resources.credits = 0;
  applyDamage(state,99999,'Test enemy');
  clampPlayerHP(state);
  assert.equal(state.health.currentHp,0);
  state = importSave(exportSave(state));
  assert.equal(state.health.currentHp,0);
  assert.equal(state.health.lifeState,'downed');
  assert.equal(startCombat(state,'street-punk'),state);
  state = recoverFromDowned(state,'basic');
  assert.ok(state.health.currentHp>0);
  assert.equal(state.health.lifeState,'alive');
});

test('medical bills and emergency recovery charge their advertised costs', () => {
  const state = createInitialState();
  state.health.currentHp=0; state.health.lifeState='downed'; state.resources.credits=0;
  recoverFromDowned(state,'paid');
  assert.equal(state.health.currentHp,0);
  recoverFromDowned(state,'full');
  assert.equal(state.health.currentHp,0);
  state.inventory['emergency-reboot-kit']=1;
  recoverFromDowned(state,'full');
  assert.equal(state.health.currentHp,calculateMaxHP(state));
  assert.equal(state.inventory['emergency-reboot-kit'],undefined);
  state.inventory['basic-med-injector']=1;
  assert.equal(useHealingItem(state,'basic-med-injector').used,false);
  assert.equal(state.inventory['basic-med-injector'],1);
});

test('old saves migrate resource drops and colliding equipped implant IDs once', () => {
  const state = createInitialState();
  state.inventory.engineCore=4; state.resources.engineCore=2;
  state.inventory['neon-runner-legs']=1; state.equippedCyberware.legs='neon-runner-legs';
  const restored=normalizeSave(state);
  assert.equal(restored.resources.engineCore,6);
  assert.equal(restored.inventory.engineCore,undefined);
  assert.equal(restored.equippedCyberware.legs,'neon-runner-legs-implant');
  assert.equal(normalizeSave(restored).resources.engineCore,6);
});

test('offline supply work matches online resources, discoveries, XP and item drops', () => {
  const originalRandom=Math.random;
  Math.random=()=>0.5;
  try {
    const supplied=createInitialState(1000); supplied.resources.scrap=1e8; supplied.resources.circuitBoards=1e8;
    const start=startSkillAction(supplied,'supply-neonRow',1000);
    const online=processActionCompletion(start,121000);
    const offline=applyOfflineProgress(start,121000);
    assert.deepEqual(offline.resources,online.resources);
    assert.deepEqual(offline.inventory,online.inventory);
    assert.deepEqual(offline.skills,online.skills);
    assert.deepEqual(offline.actionMastery,online.actionMastery);
    assert.ok(offline.offlineRecap.itemsGained['street-coil']>0);
    assert.ok(offline.manualDiscovery.skillActions['supply-neonRow']);
  } finally { Math.random=originalRandom; }
});

test('offline crafting and actions stop at real material limits', () => {
  let state=createInitialState(1000);
  state.resources.scrap=9;
  state=startSkillAction(state,'cyber-strip-implant',1000);
  state=applyOfflineProgress(state,61000);
  assert.equal(state.offlineRecap.completions,3);
  assert.equal(state.activeAction,null);
  assert.equal(state.resources.scrap,0);
  state=createInitialState(1000); state.resources.scrap=12;
  state=startCraft(state,'recipe-street-knife',1000);
  state=applyOfflineProgress(state,61000);
  assert.equal(state.inventory['street-knife'],2);
  assert.equal(state.activeCraft,null);
  assert.equal(state.offlineRecap.completions,2);
});

test('offline cap discards excess time and does not leave a live replay backlog', () => {
  const originalRandom=Math.random; Math.random=()=>0.5;
  try {
    const supplied=createInitialState(1000); supplied.resources.scrap=1e8; supplied.resources.circuitBoards=1e8;
    const start=startSkillAction(supplied,'supply-neonRow',1000);
    const finish=1000+OFFLINE_CAP_MS*2;
    const result=applyOfflineProgress(start,finish);
    assert.equal(result.offlineRecap.timeAwayMs,OFFLINE_CAP_MS);
    assert.ok(result.activeAction.startedAt+result.activeAction.durationMs>finish);
    const tick=processActionCompletion(result,finish);
    assert.deepEqual(tick.inventory,result.inventory);
    assert.equal(applyOfflineProgress(result,finish).offlineRecap.completions,result.offlineRecap.completions);
  } finally { Math.random=originalRandom; }
});

test('offline combat stops on death instead of skipping damage or resurrecting', () => {
  let state=createInitialState(1000);
  state=startCombat(state,'street-punk',1000);
  state=applyOfflineProgress(state,1000+3600000);
  assert.equal(state.health.lifeState,'downed');
  assert.equal(state.currentCombat,null);
  assert.ok(state.healthStatistics.deaths>0);
});

test('simulation caches pay full inputs, award supplies and reject invalid counts', () => {
  let state=createInitialState(1000); state.resources.scrap=9; state.inventory['basic-sim-cache']=1;
  state=startSkillAction(state,'cyber-strip-implant',1000);
  state.manualDiscovery.skillActions['cyber-strip-implant']=true;
  state=runBasicSimCache(state,1);
  assert.equal(state.simulationRecap.completions,3);
  assert.equal(state.resources.scrap,0);
  state=createInitialState(1000); state.inventory['basic-sim-cache']=1;
  state.resources.scrap=1000; state.resources.circuitBoards=1000;
  state=startSkillAction(state,'supply-neonRow',1000); state.manualDiscovery.skillActions['supply-neonRow']=true;
  assert.equal(runBasicSimCache(state,NaN),state);
  state=runBasicSimCache(state,1);
  assert.ok(state.inventory['street-coil']>0);
});

for (const operation of operations) test(`${operation.name} is clearable with equipment from its progression stage`, () => {
  let state=createInitialState(1000);
  const minimum=Math.max(districtLevelBands[operation.districtId].entryLevel,...operation.unlockRequirements.map(r=>Number(r.match(/level (\d+)/i)?.[1]??1)));
  const level=Math.min(150,minimum+10);
  state.rpg.level = Math.min(30, 1 + Math.ceil((level - 1) / 5));
  for(const skill of Object.values(state.skills)) skill.level=level;
  openStoryThroughSkillBand(state);
  state.resources.reputation=1000; state.operationLeads[operation.id]=true;
  for (const [id,n] of Object.entries(operation.requiredItems??{})) state.inventory[id]=n;
  const available=spec=>spec.requiredLevel<=level && state.districts[spec.districtId].unlocked;
  state.equippedGear.weapon=weaponSpecs.filter(available).sort((a,b)=>b.stats.damage-a.stats.damage)[0].id;
  for(const slot of ['head','chest','hands','legs','boots']) state.equippedGear[slot]=armorSpecs.filter(a=>a.slot===slot&&available(a)).sort((a,b)=>(b.stats.armor??0)-(a.stats.armor??0))[0].id;
  for(const slot of ['neural','optics','arms','legs','skin','skeleton','operatingSystem','utility']) state.equippedCyberware[slot]=cyberwareSpecs.filter(a=>a.slot===slot&&available(a)).sort((a,b)=>b.requiredLevel-a.requiredLevel)[0].id;
  state.health.currentHp=calculateMaxHP(state);
  state.inventory['advanced-med-injector']=100;
  state.autoHeal={...state.autoHeal,unlocked:true,enabled:true,threshold:60,itemId:'advanced-med-injector'};
  assert.ok(operationRequirementDetails(state,operation).every(r=>r.met));
  state=startOperation(state,operation.id,undefined,1000);
  assert.ok(state.activeOperation);
  state=processOperation(state,1000+state.activeOperation.durationMs);
  assert.equal(state.operationRecap.success,true);
  assert.ok(state.operationLogs[operation.id].firstClear);
});
