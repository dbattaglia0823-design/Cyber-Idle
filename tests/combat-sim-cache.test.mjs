import test from 'node:test';
import assert from 'node:assert/strict';
import {bossIconics} from '../src/data/bossIconics.ts';
import {streetBosses} from '../src/data/streetBosses.ts';
import {items,getItem} from '../src/data/items.ts';
import {recipes} from '../src/data/recipes.ts';
import {vendors} from '../src/data/vendors.ts';
import {createInitialState,cloneState} from '../src/systems/gameState.ts';
import {normalizeSave} from '../src/systems/saveSystem.ts';
import {allEnemies,getEnemy,startCombat,processCombat,advanceCombat,canFightEnemy} from '../src/systems/combatProcessing.ts';
import {combatSimEligibility,combatCache,reserveCombatSimCaches,finishCombatSimCaches,runCombatSimCaches,estimateCombatSimKills} from '../src/systems/combatSimulation.ts';
import {simCacheEligibility,runBasicSimCache} from '../src/systems/simCacheEngine.ts';
import {calculateMaxHP} from '../src/systems/healthSystem.ts';
import {calculatePlayerCombatStats} from '../src/systems/balanceFormulas.ts';
import {bossLootValue,settleBossIconic,ICONIC_DROP_CHANCE} from '../src/systems/bossIconicLoot.ts';
import {getItemSources} from '../src/systems/itemSourceLookup.ts';

function ready(enemyId='street-punk',caches=1){
 let s=createInitialState(1000);s.skills.combat.level=150;
 for(const d of Object.values(s.districts))d.unlocked=true;
 s.inventory[combatCache.itemId]=caches;s.manualDiscovery.enemies[enemyId]=true;
 s.rpg.attributes.body=20;s.rpg.attributes.technical=20;
 s.inventory['advanced-med-injector']=10000;s.autoHeal={...s.autoHeal,enabled:true,unlocked:true,itemId:'advanced-med-injector',threshold:80,stopIfNoHealing:true};
 s.health.currentHp=calculateMaxHP(s);return startCombat(s,enemyId,1000);
}
function luckySeed(enemyId,victory=0){let seed=1;while(bossLootValue(seed,enemyId,victory)>=ICONIC_DROP_CHANCE)seed++;return seed;}
function lcg(){let seed=9123;return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
async function deterministic(fn){const old=Math.random;Math.random=()=>.999;try{return await fn();}finally{Math.random=old;}}

// Each boss has two million independent seeded first-kill rolls. No drop bonus
// or cache efficiency is involved; both routes call this exact resolver.
test('all eight boss pools retain 0.005 percent odds and equal missing-item distribution across 16 million rolls',()=>{
 for(const boss of streetBosses){let hits=0,left=0;
  for(let seed=1;seed<=2000000;seed++)if(bossLootValue(seed,boss.enemyId,0)<ICONIC_DROP_CHANCE){hits++;if(bossLootValue(seed,boss.enemyId,0,0x51ed270b)<.5)left++;}
  assert.ok(hits>=55&&hits<=150,`${boss.name}: ${hits}`);assert.ok(Math.abs(2*left-hits)<45,`${boss.name}: ${left}/${hits-left}`);
 }
});

test('each promoted boss is accessible at its own level and district, with existing IDs, unique defenses and two exclusive drops',()=>{
 assert.equal(streetBosses.length,8);assert.equal(items.filter(i=>i.type==='Weapon'&&!i.iconic).length,261);
 for(const boss of streetBosses){const enemy=getEnemy(boss.enemyId),s=ready(boss.enemyId);
  assert.equal(enemy.name,boss.name);assert.equal(enemy.difficulty,'Boss');assert.ok(enemy.armor>0);assert.ok(enemy.weaknesses.length);assert.ok(enemy.resistances.length);
  assert.equal(bossIconics.filter(i=>i.bossEnemyId===boss.enemyId).length,2);
  s.skills.combat.level=enemy.requiredCombatLevel;assert.ok(canFightEnemy(s,enemy));
  s.skills.combat.level--;assert.equal(canFightEnemy(s,enemy),false);s.skills.combat.level++;
  s.districts[boss.district].unlocked=false;assert.equal(canFightEnemy(s,enemy),false);
 }
});

test('combat cache eligibility requires manual discovery, active target, valid district/level and correct cache type',async()=>{
 const s=ready();delete s.manualDiscovery.enemies['street-punk'];assert.equal(combatSimEligibility(s).eligible,false);
 assert.equal(await runCombatSimCaches(s,1,1000),s);
 s.manualDiscovery.enemies['street-punk']=true;assert.ok(simCacheEligibility(s).eligible);assert.equal(runBasicSimCache(s,1),s);
 delete s.inventory[combatCache.itemId];s.inventory['basic-sim-cache']=10;assert.equal(combatSimEligibility(s).eligible,false);
 s.inventory[combatCache.itemId]=1;s.districts.neonRow.unlocked=false;assert.equal(combatSimEligibility(s).eligible,false);
 s.districts.neonRow.unlocked=true;s.currentCombat=null;assert.equal(combatSimEligibility(s).eligible,false);
 for(const count of [0,-1,NaN,Infinity]){const x=ready();assert.equal(await runCombatSimCaches(x,count),x);}
});

test('one cache matches a five-minute live event replay in kills, damage, healing, XP, mastery, drops and respawn timing',async()=>{
 const input=ready(),snapshot=JSON.stringify(input);
 const actual=await deterministic(()=>runCombatSimCaches(input,1,1000));
 const expected=await deterministic(()=>{const live=cloneState(input);let cursor=1000;
  while(live.currentCombat){const c=live.currentCombat,at=Math.max(cursor,c.respawnAt??Math.min(c.nextPlayerAttackAt,c.nextEnemyAttackAt));if(at>301000)break;cursor=at;advanceCombat(live,at);}
  return live;
 });
 assert.equal(JSON.stringify(input),snapshot);
 assert.equal(actual.enemyLog['street-punk'].kills,expected.enemyLog['street-punk'].kills);
 assert.deepEqual(actual.skills.combat,expected.skills.combat);for(const id of Object.keys(expected.weaponClasses)){assert.equal(actual.weaponClasses[id].level,expected.weaponClasses[id].level);assert.equal(actual.weaponClasses[id].xp,expected.weaponClasses[id].xp);}
 assert.equal(actual.health.currentHp,expected.health.currentHp);assert.deepEqual(actual.healthStatistics,expected.healthStatistics);
 assert.deepEqual(actual.resources,expected.resources);
 for(const [id,count] of Object.entries(actual.inventory))if(id!==combatCache.itemId)assert.equal(count,expected.inventory[id],id);
 assert.equal(actual.inventory[combatCache.itemId],undefined);assert.equal(actual.simulationRecap.simulatedMs,300000);
 assert.equal(actual.simulationRecap.completions,actual.enemyLog['street-punk'].kills);
 assert.ok(actual.simulationRecap.masteryXpGained>0&&actual.simulationRecap.xpGained>0);
 assert.ok(actual.currentCombat.nextPlayerAttackAt>=actual.lastSavedAt-2000);
});

test('simulations consume real healing, stop when supplies run out and never revive for free',async()=>{
 const s=ready('skyline-core-patrol-5');delete s.inventory['advanced-med-injector'];s.health.currentHp=1;
 const result=await runCombatSimCaches(s,12,1000);
 assert.equal(result.simulationRecap.completions,0);assert.equal(result.health.lifeState,'downed');assert.equal(result.currentCombat,null);
 assert.equal(result.rpg.bossIconicProgress?.['skyline-core-patrol-5']?.victories??0,0);
 assert.match(result.simulationRecap.stoppedReason,/defeated/);
 assert.ok(result.simulationRecap.elapsedMs<300000);
 const healer=ready('street-punk');healer.inventory['advanced-med-injector']=1;healer.health.currentHp=5;
 const healed=await runCombatSimCaches(healer,1,1000);
 assert.ok(healed.healthStatistics.healingItemsUsed>0);assert.equal(healed.inventory['advanced-med-injector'],undefined);
 assert.ok(healed.simulationRecap.completions<100);
});

test('live and simulated successful boss kills get the same seeded Iconic, exactly once, independent of efficiency',async()=>{
 for(const boss of streetBosses){const s=ready(boss.enemyId);s.rpg.iconicLootSeed=luckySeed(boss.enemyId);
  // Finish an already almost-defeated target; subsequent fights remain authored difficulty.
  s.currentCombat.enemyCurrentHp=1;s.currentCombat.nextPlayerAttackAt=1001;s.currentCombat.nextEnemyAttackAt=1002;
  const live=await deterministic(()=>processCombat(s,1001));
  const simulated=await deterministic(()=>runCombatSimCaches(s,1,1000));
  const acquired=Object.keys(live.rpg.bossIconicProgress[boss.enemyId].acquired);
  assert.equal(acquired.length,1);assert.ok(simulated.rpg.bossIconicProgress[boss.enemyId].acquired[acquired[0]]);
  assert.equal(simulated.inventory[acquired[0]],1);assert.equal(simulated.inventoryLocks[acquired[0]],true);
  assert.ok(simulated.simulationRecap.iconicsRecovered.includes(acquired[0]));
  assert.equal(live.enemyLog[boss.enemyId].kills,1);assert.ok(live.manualDiscovery.enemies[boss.enemyId]);
  assert.equal(simulated.enemyLog[boss.enemyId].kills,simulated.rpg.bossIconicProgress[boss.enemyId].victories);
  const restored=normalizeSave(JSON.parse(JSON.stringify(simulated)));assert.equal(restored.inventory[acquired[0]],1);
  const before=JSON.stringify(restored.rpg.bossIconicProgress);const tick=processCombat(restored,restored.lastSavedAt);assert.equal(JSON.stringify(tick.rpg.bossIconicProgress),before);
 }
});

test('normal targets and all legacy story IDs are ineligible even on lucky seeds; recovered items remain excluded after sale',()=>{
 const s=ready();s.rpg.iconicLootSeed=luckySeed('neon-row-kill-team');
 for(const id of ['street-punk',...streetBosses.map(b=>b.legacyMission)])assert.equal(settleBossIconic(s,id),undefined);
 const id=settleBossIconic(s,'neon-row-kill-team');assert.ok(id);delete s.inventory[id];
 s.rpg.bossIconicProgress['neon-row-kill-team'].victories=0;
 const second=settleBossIconic(s,'neon-row-kill-team');assert.ok(second);assert.notEqual(second,id);
 s.rpg.bossIconicProgress['neon-row-kill-team'].victories=0;
 assert.equal(settleBossIconic(s,'neon-row-kill-team'),undefined);
});

test('legacy story collections migrate recovered but sold items without converting story victories into Street Combat kills',()=>{
 const s=ready();s.rpg.bossIconicProgress={'dead-drop':{victories:500,dryStreak:9,acquired:{'iconic-final-notice':true}}};
 s.inventory['iconic-collateral']=1;s.upgradeLevels['iconic-collateral']=5;
 s.weaponLoadouts['iconic-collateral']={attachments:{},mods:[]};s.equippedGear.weapon='iconic-collateral';
 const loaded=normalizeSave(JSON.parse(JSON.stringify(s))),progress=loaded.rpg.bossIconicProgress['neon-row-kill-team'];
 assert.deepEqual(progress.acquired,{'iconic-final-notice':true,'iconic-collateral':true});assert.equal(progress.victories,0);
 assert.equal(loaded.rpg.bossIconicProgress['dead-drop'],undefined);
 assert.equal(loaded.inventory['iconic-final-notice'],undefined);assert.equal(loaded.inventory['iconic-collateral'],1);assert.equal(loaded.upgradeLevels['iconic-collateral'],5);
 assert.equal(loaded.equippedGear.weapon,'iconic-collateral');assert.deepEqual(loaded.weaponLoadouts['iconic-collateral'],s.weaponLoadouts['iconic-collateral']);
 assert.equal(getItemSources('iconic-final-notice',loaded)[0].chance,0);
});

test('cache reservation persists consumption before rewards, invalid repeats cannot spend the same cache twice',async()=>{
 const s=ready(),snapshot=JSON.stringify(s),reservation=reserveCombatSimCaches(s,1,1000);assert.ok(reservation);
 assert.equal(JSON.stringify(s),snapshot);assert.equal(reservation.state.inventory[combatCache.itemId],undefined);
 const reload=normalizeSave(JSON.parse(JSON.stringify(reservation.state)));assert.equal(reserveCombatSimCaches(reload,1),null);
 assert.equal(reload.enemyLog['street-punk']?.kills??0,0);
 const result=await finishCombatSimCaches(reservation);assert.equal(await runCombatSimCaches(result,1),result);
 assert.equal(reserveCombatSimCaches(result,1),null);
 assert.ok(result.enemyLog['street-punk'].kills>0);
});

test('kill estimate has no state changes or random rolls and boss/cache sources stay compact and accurate',()=>{
 const s=ready(),snapshot=JSON.stringify(s),random=Math.random;Math.random=()=>{throw Error('preview must not roll loot');};
 try{assert.ok(estimateCombatSimKills(s)>0);}finally{Math.random=random;}
 assert.equal(JSON.stringify(s),snapshot);
 const source=getItemSources('iconic-final-notice',s)[0];assert.equal(source.chance,.000025);assert.match(source.detail,/Street Combat only/);
 assert.ok(recipes.some(r=>r.outputItemId===combatCache.itemId));assert.ok(vendors.some(v=>v.inventory.some(i=>i.itemId===combatCache.itemId)));
});

test('a large cache batch yields to the browser while retaining real respawn-limited performance',async()=>{
 const s=ready('street-punk',100);let yields=0,maxSlice=0,last=performance.now();const reservation=reserveCombatSimCaches(s,100,1000);
 const result=await finishCombatSimCaches(reservation,async()=>{maxSlice=Math.max(maxSlice,performance.now()-last);yields++;await new Promise(resolve=>setTimeout(resolve,0));last=performance.now();});
 assert.ok(yields>1);assert.equal(result.inventory[combatCache.itemId],undefined);
 assert.ok(result.simulationRecap.completions>100);assert.ok(result.simulationRecap.completions<=Math.floor(100*300000/(400+1000)));
 assert.ok(maxSlice<1000,`longest event batch ${maxSlice}ms`);
 console.log(`100 caches: ${result.simulationRecap.completions} actual kills, ${yields} yields, max batch ${Math.round(maxSlice)}ms`);
});

test('district-local crafted equipment sustains repeated boss fights with finite healing and longer kill times',async()=>{
 const {prepareMainJob}=await import('./main-job-fixture.mjs');
 const {beginRunner}=await import('../src/systems/rpgSystem.ts');
 const {rpgMissions}=await import('../src/data/rpgCampaign.ts');
 for(const boss of streetBosses){
  const mission=rpgMissions.find(m=>m.district===boss.district);
  let s=prepareMainJob(beginRunner(createInitialState(1000),'streetborn'),mission,'body');
  s.skills.combat.level=getEnemy(boss.enemyId).requiredCombatLevel;s.districts[boss.district].unlocked=true;
  s.inventory[combatCache.itemId]=1;s.inventory['advanced-med-injector']=100;s.manualDiscovery.enemies[boss.enemyId]=true;
  s.autoHeal={...s.autoHeal,unlocked:true,enabled:true,itemId:'advanced-med-injector',threshold:80,stopIfNoHealing:true};s.health.currentHp=calculateMaxHP(s);
  s=startCombat(s,boss.enemyId,1000);s=await runCombatSimCaches(s,1,1000);
  assert.equal(s.health.lifeState,'alive',boss.name);assert.ok(s.simulationRecap.completions>=5,boss.name);
  assert.ok(s.enemyLog[boss.enemyId].bestKillMs>=10000,boss.name);assert.ok(s.enemyLog[boss.enemyId].bestKillMs<45000,boss.name);
  assert.ok(s.healthStatistics.healingItemsUsed<100,boss.name);
 }
});
