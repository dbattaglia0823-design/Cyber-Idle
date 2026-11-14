import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, chooseStartingPath, cloneState } from '../src/systems/gameState.ts';
import { claimFieldKit, startRpgMission, chooseMissionApproach, performTactic, resolveRpgMission, gigPayout, retryRpgMission } from '../src/systems/rpgSystem.ts';
import { rpgSideGigs, rpgMissions } from '../src/data/rpgCampaign.ts';
import { gigUniquePools } from '../src/data/missionRewards.ts';
import { encounterTraits } from '../src/systems/tacticalTraits.ts';
import { normalizeSave, saveGame, loadGame, saveKeyForSlot, getSaveWarning, resetSave } from '../src/systems/saveSystem.ts';
import { recipes } from '../src/data/recipes.ts';
import { startCraft } from '../src/systems/craftingProcessing.ts';
import { applyOfflineProgress } from '../src/systems/offlineProgress.ts';
import { introductoryTrainingMultiplier } from '../src/data/progressionPacing.ts';
const gig=rpgSideGigs[0];
function fresh(){return claimFieldKit(chooseStartingPath(createInitialState(1000),'streetborn'));}
function combat(contract='none'){return chooseMissionApproach(startRpgMission(fresh(),gig.id,'standard',contract),'assault');}
function settlement(state){state.rpg.active.phase='decision';return resolveRpgMission(state,gig.choices[0].id,()=>1);}

test('optional objective bonus is paid once; missing it keeps normal rewards',()=>{
 const state=combat('clean'), before=state.resources.credits;
 const after=settlement(state);
 assert.equal(after.resources.credits-before,gigPayout(gig)+gig.choices[0].bonusCredits+Math.round(gigPayout(gig)*.25));
 assert.equal(resolveRpgMission(after,gig.choices[0].id),after);
 const missed=combat('clean');missed.rpg.active.contract.injectors=1;
 assert.equal(settlement(missed).resources.credits-missed.resources.credits,gigPayout(gig)+gig.choices[0].bonusCredits);
});
test('contract counters clone safely, survive saves and reset on retry',()=>{
 const state=combat('precision');state.rpg.active.aimed=true;state.rpg.active.enemyHp=1000;state.rpg.active.enemyMaxHp=1000;
 const after=performTactic(state,'attack');
 assert.equal(state.rpg.active.contract.aimedHits,0);assert.equal(after.rpg.active.contract.aimedHits,1);
 assert.equal(normalizeSave(after).rpg.active.contract.aimedHits,1);
 after.rpg.active.phase='failed';const retry=retryRpgMission(after);
 assert.equal(retry.rpg.active.contract.id,'precision');assert.equal(retry.rpg.active.contract.aimedHits,0);
});
test('replayed gigs rotate readable defenses without changing main-job profiles',()=>{
 const state=fresh();state.rpg.completed[gig.id]={clears:2,outcome:gig.choices[0].id,approach:'assault'};
 const started=startRpgMission(state,gig.id);
 assert.equal(started.rpg.active.gigVariant,2);
 assert.ok(encounterTraits(gig,0,0,2).regeneration>0);
 assert.ok(encounterTraits(gig,0,0,1).armor>0);
 assert.deepEqual(encounterTraits(rpgMissions[0],0,0,2),encounterTraits(rpgMissions[0],0,0,0));
});
test('ten dry gig clears award an eligible unique and reset protection',()=>{
 const state=combat();state.rpg.gigDryStreak={[gig.id]:9};
 const after=settlement(state);
 assert.ok(gigUniquePools[gig.district].some(id=>(after.inventory[id]??0)>(state.inventory[id]??0)));
 assert.equal(after.rpg.gigDryStreak[gig.id],0);
 assert.equal(normalizeSave(after).rpg.gigDryStreak[gig.id],0);
});
test('signature weapons change tactical actions, not just their damage stat',()=>{
 const jackal=combat();jackal.equippedGear.weapon='rpg-weapon-1';jackal.rpg.active.ram=2;jackal.rpg.active.aimed=true;jackal.rpg.active.enemyHp=1000;jackal.rpg.active.enemyMaxHp=1000;
 const shot=performTactic(jackal,'attack');assert.match(shot.rpg.active.log.join(' '),/restored 1 RAM/);assert.equal(shot.rpg.active.ram,4);
 const mercy=combat();mercy.equippedGear.weapon='rpg-weapon-4';mercy.health.currentHp=40;
 assert.ok(performTactic(mercy,'cover').rpg.active.feedback.healing>0);
 const afterimage=combat();afterimage.equippedGear.weapon='rpg-weapon-7';afterimage.rpg.active.enemyHp=1000;afterimage.rpg.active.enemyMaxHp=1000;
 assert.equal(performTactic(afterimage,'disrupt').rpg.active.aimed,true);
});
test('offline crafting identifies the exact missing supplies and activity',()=>{
 const state=fresh();state.resources.scrap=4;state.resources.circuitBoards=1;
 const recipe=recipes.find(r=>r.id==='recipe-circuit-bundle');
 const started=startCraft(state,recipe.id,1000);started.lastSavedAt=1000;
 const after=applyOfflineProgress(started,1000+recipe.durationMs*4);
 assert.deepEqual(after.offlineRecap.resumeAction,{kind:'craft',id:recipe.id});
 assert.ok(after.offlineRecap.missingMaterials.scrap>0);assert.ok(after.offlineRecap.missingMaterials.circuitBoards>0);
});
test('save backups recover broken writes and remain isolated per slot',()=>{
 const old=globalThis.localStorage, entries=new Map();globalThis.localStorage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)};
 try{
  const first=fresh();first.resources.credits=51;saveGame(first,1);
  const next=cloneState(first);next.resources.credits=92;saveGame(next,1);
  saveGame(next,2);entries.set(saveKeyForSlot(1),'{interrupted');
  assert.equal(loadGame(1).resources.credits,51);assert.match(getSaveWarning(),/backup/);assert.equal(loadGame(2).resources.credits,92);
  assert.equal(saveGame(next,1),true);assert.equal(loadGame(1).resources.credits,92);
  resetSave(1);assert.equal(loadGame(1),null);
  globalThis.localStorage.setItem=()=>{throw Error('quota');};
  assert.equal(saveGame(first,3),false);assert.match(getSaveWarning(),/Saving failed/);
 }finally{globalThis.localStorage=old;}
});
test('introductory XP bonus ends at level five',()=>{
 assert.equal(introductoryTrainingMultiplier(1),1.5);assert.equal(introductoryTrainingMultiplier(4),1.5);
 assert.equal(introductoryTrainingMultiplier(5),1);assert.equal(introductoryTrainingMultiplier(100),1);
});
