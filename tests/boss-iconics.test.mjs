import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {bossIconics, makeBossIconicItems} from '../src/data/bossIconics.ts';
import {items,getItem} from '../src/data/items.ts';
import {recipes} from '../src/data/recipes.ts';
import {vendors} from '../src/data/vendors.ts';
import {combatZones} from '../src/data/combat.ts';
import {percentDropTables} from '../src/data/percentDrops.ts';
import {districtWeaponLootPools,gigUniquePools} from '../src/data/missionRewards.ts';
import {weaponDistrictOrder,weaponDropFitsDistrict} from '../src/data/weaponProgression.ts';
import {rpgMissions,rpgSideGigs} from '../src/data/rpgCampaign.ts';
import {createInitialState,cloneState} from '../src/systems/gameState.ts';
import {normalizeSave} from '../src/systems/saveSystem.ts';
import {beginRunner,startRpgMission,startBossReplay,chooseMissionApproach,performTactic,resolveRpgMission,retryRpgMission,leaveRpgMission,maxRam} from '../src/systems/rpgSystem.ts';
import {bossLootValue,settleBossIconic,ICONIC_DROP_CHANCE} from '../src/systems/bossIconicLoot.ts';
import {iconicWeaponHit,iconicIncoming,iconicKill,iconicNonAttack,resetIconicTarget} from '../src/systems/iconicCombat.ts';
import {startCombat,processCombat,allEnemies} from '../src/systems/combatProcessing.ts';
import {calculateMaxHP} from '../src/systems/healthSystem.ts';
import {BossIconicPreview} from '../src/components/BossIconicPreview.tsx';
import {WeaponSummary} from '../src/components/WeaponSummary.tsx';
import {MissionDebrief} from '../src/screens/Missions/MissionDebrief.tsx';
const fresh=()=>beginRunner(createInitialState(1000),'streetborn');
function completed(){const s=fresh();s.rpg.completed['dead-drop']={outcome:'protect',approach:'assault',clears:1};return s;}
function victory(s,mission=rpgMissions[0]){
 s=chooseMissionApproach(startBossReplay(s,mission.id),'assault');assert.ok(s.rpg.active?.bossReplay);
 s.rpg.active.enemyHp=1;s.rpg.active.enemyMaxHp=1;
 s=performTactic(s,'attack');assert.equal(s.rpg.active.phase,'decision');
 return resolveRpgMission(s,mission.choices[0].id);
}

test('exactly sixteen handcrafted boss Iconics coexist with all 261 unchanged regular variants',()=>{
 assert.equal(bossIconics.length,16);assert.equal(new Set(bossIconics.map(d=>d.id)).size,16);
 assert.equal(items.filter(i=>i.iconic).length,16);assert.equal(items.filter(i=>i.type==='Weapon'&&!i.iconic).length,261);
 const regular=JSON.stringify(items.filter(i=>!i.iconic));makeBossIconicItems(items.filter(i=>!i.iconic));assert.equal(JSON.stringify(items.filter(i=>!i.iconic)),regular);
 for(const district of weaponDistrictOrder){const defs=bossIconics.filter(d=>d.district===district);assert.equal(defs.length,2);assert.notEqual(defs[0].category,defs[1].category);}
 for(const def of bossIconics){const mission=rpgMissions.find(m=>m.id===def.mission);assert.equal(def.boss,mission.enemies[mission.enemies.length-1]);assert.equal(def.district,mission.district);const item=getItem(def.id);assert.equal(item.weaponVariant,undefined);assert.equal(item.weaponModel,undefined);assert.equal(item.weaponClass,def.category);assert.ok(item.stats.damage>0);assert.equal(item.specialEffect,def.ability);assert.equal(weaponDropFitsDistrict(item,def.district),false);}
});

test('Iconics are excluded from ordinary recipes, shops, idle drops, gigs and local weapon rolls',()=>{
 const ids=new Set(bossIconics.map(d=>d.id));
 assert.ok(recipes.every(r=>!ids.has(r.outputItemId)));
 assert.ok(vendors.every(v=>v.inventory.every(e=>!ids.has(e.itemId))));
 assert.ok(combatZones.every(z=>z.enemies.every(e=>e.drops.every(d=>!ids.has(d.id)))));
 assert.ok(Object.values(percentDropTables).every(pool=>pool.every(d=>!ids.has(d.itemId))));
 for(const pool of [...Object.values(districtWeaponLootPools),...Object.values(gigUniquePools)])assert.ok(pool.every(id=>!ids.has(id)));
});

test('base odds are 0.005 percent total, split evenly between missing weapons',()=>{
 assert.equal(ICONIC_DROP_CHANCE,.00005);
 let hits=0,a=0,b=0;
 for(let seed=1;seed<=2000000;seed++)if(bossLootValue(seed,'dead-drop',0)<ICONIC_DROP_CHANCE){hits++;bossLootValue(seed,'dead-drop',0,0x51ed270b)<.5?a++:b++;}
 assert.ok(hits>65&&hits<140,`${hits}`);assert.ok(Math.abs(a-b)<40,`${a}/${b}`);
});

test('legacy dry streaks never guarantee drops and selling cannot farm duplicates',()=>{
 let state=completed();state.rpg.iconicLootSeed=1;
 for(let i=0;i<20;i++){
  state.rpg.bossIconicProgress={'dead-drop':{victories:i,dryStreak:9,acquired:{}}};
  assert.ok(bossLootValue(1,'dead-drop',i)>=ICONIC_DROP_CHANCE);
  assert.equal(settleBossIconic(state,'dead-drop'),undefined);
 }
 state=completed();let seed=1;
 while(bossLootValue(seed,'dead-drop',0)>=ICONIC_DROP_CHANCE)seed++;
 state.rpg.iconicLootSeed=seed;
 const first=settleBossIconic(state,'dead-drop');assert.ok(first);assert.equal(state.inventoryLocks[first],true);
 delete state.inventory[first];state.rpg.bossIconicProgress['dead-drop'].victories=0;
 const second=settleBossIconic(state,'dead-drop');assert.ok(second);assert.notEqual(first,second);
 state.rpg.bossIconicProgress['dead-drop'].victories=0;
 assert.equal(settleBossIconic(state,'dead-drop'),undefined);assert.equal(state.inventory[first],undefined);
 const html=render(createElement(BossIconicPreview,{state:completed(),missionId:'dead-drop'}));
 assert.match(html,/0.005% total/);assert.match(html,/0.0025% per missing weapon/);assert.doesNotMatch(html,/Guaranteed after/);
});

test('boss replay preserves story, first-clear rewards, XP, credits and settlement cannot repeat',()=>{
 const state=completed();state.rpg.ending='liberate';state.storyFlags.example=true;
 const before={completed:structuredClone(state.rpg.completed),xp:state.rpg.xp,credits:state.resources.credits,flags:structuredClone(state.storyFlags),ending:state.rpg.ending,mastery:state.rpg.streetCred};
 let fight=chooseMissionApproach(startBossReplay(state,'dead-drop'),'assault');assert.equal(fight.rpg.active.enemyIndex,rpgMissions[0].enemies.length-1);
 fight.rpg.active.enemyHp=1;fight=performTactic(fight,'attack');
 const after=resolveRpgMission(fight,rpgMissions[0].choices[0].id);
 assert.deepEqual(after.rpg.completed,before.completed);assert.deepEqual(after.storyFlags,before.flags);assert.equal(after.rpg.xp,before.xp);assert.equal(after.resources.credits,before.credits);assert.equal(after.rpg.ending,before.ending);assert.equal(after.rpg.streetCred,before.mastery);
 assert.equal(resolveRpgMission(after,rpgMissions[0].choices[0].id),after);assert.equal(after.rpg.bossIconicProgress['dead-drop'].victories,1);
 const loaded=normalizeSave(JSON.parse(JSON.stringify(after)));assert.equal(loaded.rpg.bossIconicProgress['dead-drop'].victories,1);
 const html=render(createElement(MissionDebrief,{before:fight,after,onContinue(){}}));assert.match(html,/BOSS REMATCH COMPLETE/);assert.doesNotMatch(html,/DISTRICT UNLOCKED/);
});

test('failed encounters, incomplete reward states, retries, aborts and reloads cannot mint extra rolls',()=>{
 const s=completed();assert.equal(startBossReplay(fresh(),'dead-drop').rpg.active,null);
 let fight=chooseMissionApproach(startBossReplay(s,'dead-drop'),'assault');
 const seed=fight.rpg.iconicLootSeed;
 fight.rpg.active.phase='failed';assert.equal(resolveRpgMission(fight,rpgMissions[0].choices[0].id),fight);
 fight=retryRpgMission(fight);assert.equal(fight.rpg.active.bossReplay,true);assert.equal(fight.rpg.iconicLootSeed,seed);
 fight=leaveRpgMission(fight);assert.deepEqual(fight.rpg.bossIconicProgress??{},{});
 const loaded=normalizeSave(JSON.parse(JSON.stringify(fight)));
 const a=victory(fight),b=victory(loaded);assert.deepEqual(a.rpg.bossIconicProgress,b.rpg.bossIconicProgress);assert.deepEqual(a.inventory,b.inventory);
 let forged=chooseMissionApproach(startBossReplay(s,'dead-drop'),'assault');forged.rpg.active.phase='decision';forged.rpg.active.enemyIndex=0;assert.equal(resolveRpgMission(forged,rpgMissions[0].choices[0].id),forged);
 let gig=chooseMissionApproach(startRpgMission(fresh(),rpgSideGigs[0].id),'assault');gig.rpg.active.enemyHp=1;gig=performTactic(gig,'attack');gig=resolveRpgMission(gig,rpgSideGigs[0].choices[0].id,()=>1);assert.deepEqual(gig.rpg.bossIconicProgress??{},{});
});

test('first-clear rewards still settle once and add exactly one eligible boss roll',()=>{
 let state=chooseMissionApproach(startRpgMission(fresh(),'dead-drop'),'lifepath');state.rpg.active.enemyIndex=rpgMissions[0].enemies.length-1;state.rpg.active.enemyHp=1;state=performTactic(state,'attack');
 const after=resolveRpgMission(state,rpgMissions[0].choices[0].id,()=>1);
 assert.equal(after.rpg.completed['dead-drop'].clears,1);assert.ok(after.resources.credits>state.resources.credits);assert.equal(after.districts.rustYards.unlocked,true);assert.equal(after.rpg.bossIconicProgress['dead-drop'].victories,1);
 assert.equal(resolveRpgMission(after,rpgMissions[0].choices[0].id),after);
});

for(const def of bossIconics)test(`${def.name} signature is bounded and functional in both combat modes`,()=>{
 for(const mode of ['field','idle']){
  const state=fresh();state.equippedGear.weapon=def.id;state.inventory[def.id]=1;state.resources.heat=10;
  state.rpg.active=chooseMissionApproach(startRpgMission(fresh(),'dead-drop'),'assault').rpg.active;state.rpg.active.ram=0;
  const holder={},maxHp=calculateMaxHP(state);state.health.currentHp=maxHp/2;
  let changed=false;
  for(let i=0;i<8;i++){
   if(def.effect==='counteroffer')iconicIncoming(state,holder);
   const hp=state.health.currentHp,heat=state.resources.heat,ram=state.rpg.active.ram;
   const r=iconicWeaponHit(state,holder,{mode,damage:100,maxHp,enemyHp:20,enemyMaxHp:100,armored:true,shielded:true,maxRam:maxRam(state)});
   changed ||= r.multiplier!==1||r.extra>0||r.penetration>0||r.shieldPierce>0||r.burn>0||r.weaken>0||r.interval!==1||!!holder.iconicMemory?.guard||hp!==state.health.currentHp||heat!==state.resources.heat||ram!==state.rpg.active.ram;
   assert.ok(r.multiplier<=1.20&&r.interval>=.85&&r.extra<=25);assert.ok(state.health.currentHp<=maxHp);assert.ok(state.rpg.active.ram<=maxRam(state));
   if(def.effect==='requiem'||def.effect==='secondOpinion'){const prev=state.health.currentHp;iconicKill(state,holder,maxHp);changed ||= prev!==state.health.currentHp||holder.iconicMemory.tempoCharges===2;}
  }
  assert.ok(changed,`${def.effect}/${mode}`);
  iconicNonAttack(state,holder);assert.equal(holder.iconicMemory.momentum,0);
  resetIconicTarget(state,holder);assert.equal(holder.iconicMemory.hits,0);
 }
});

test('signature memory survives reload, is cloned safely and cannot carry charges across weapon switches',()=>{
 let state=chooseMissionApproach(startRpgMission(fresh(),'dead-drop'),'assault');state.equippedGear.weapon='iconic-barricade-anthem';state.inventory['iconic-barricade-anthem']=1;state.rpg.active.enemyHp=10000;state.rpg.active.enemyMaxHp=10000;
 state=performTactic(state,'attack');const copy=cloneState(state);copy.rpg.active.iconicMemory.hits=99;assert.notEqual(copy.rpg.active.iconicMemory.hits,state.rpg.active.iconicMemory.hits);
 const loaded=normalizeSave(JSON.parse(JSON.stringify(state)));assert.equal(loaded.rpg.active.iconicMemory.hits,state.rpg.active.iconicMemory.hits);
 loaded.equippedGear.weapon='iconic-afterimage-echo';const next=performTactic(loaded,'attack');assert.equal(next.rpg.active.iconicMemory.hits,1);
});

test('Iconic appearance, source and possible-reward previews are distinct from regular rarities',()=>{
 const state=fresh(),unknown=render(createElement(BossIconicPreview,{state,missionId:'dead-drop'}));assert.match(unknown,/Unknown Iconic/);assert.doesNotMatch(unknown,/Final Notice/);assert.match(unknown,/Possible/);
 state.discoveredItems['iconic-final-notice']=true;
 const known=render(createElement(BossIconicPreview,{state,missionId:'dead-drop'}));assert.match(known,/Final Notice/);assert.match(known,/18%/);
 const stats=render(createElement(WeaponSummary,{state,itemId:'iconic-final-notice',compareItemId:'rpg-weapon-0'}));assert.match(stats,/Iconic/);assert.match(stats,/Chrome Debt Collector/);assert.match(stats,/Pistols/);assert.match(stats,/Base DPS/);assert.doesNotMatch(stats,/NaN|undefined/);
});

for(const def of bossIconics)test(`${def.name} integrates with the actual idle processor without mutating input or farming loot`,()=>{
 const state=fresh();state.equippedGear.weapon=def.id;state.inventory[def.id]=1;
 const enemy=allEnemies().find(e=>(e.requiredCombatLevel??1)<=1);
 const fighting=startCombat(state,enemy.id,1000);assert.ok(fighting.currentCombat);
 fighting.currentCombat.enemyMaxHp=1000000;fighting.currentCombat.enemyCurrentHp=1000000;
 const snapshot=JSON.stringify(fighting);
 const result=processCombat(fighting,13000);
 assert.equal(JSON.stringify(fighting),snapshot);assert.ok(result.currentCombat.iconicMemory.hits>=4);
 assert.ok(result.currentCombat.enemyCurrentHp>0);assert.ok(result.health.currentHp>=0);
 assert.deepEqual(result.rpg.bossIconicProgress??{},{});
});

test('every Iconic can clear its actual district encounter with local equipment and counters',async()=>{
 const {prepareMainJob}=await import('./main-job-fixture.mjs');
 const {encounterTraits}=await import('../src/systems/tacticalTraits.ts');
 const {canUseTactic,enemyIntent}=await import('../src/systems/rpgSystem.ts');
 const {equipItem}=await import('../src/systems/equipmentSystem.ts');
 for(const def of bossIconics){
  const mission=rpgMissions.find(m=>m.id===def.mission);
  let state=fresh();
  for(const prior of rpgMissions.slice(0,mission.act))state.rpg.completed[prior.id]={outcome:prior.choices[0].id,approach:'assault',clears:1};
  for(const district of rpgMissions.slice(0,mission.act+1))state.districts[district.district].unlocked=true;
  const focus=['heavyWeapons','bluntWeapons'].includes(def.category)?'body':def.category==='smartWeapons'?'intelligence':'reflexes';
  state=prepareMainJob(state,mission,focus);state.inventory[def.id]=1;
  state=equipItem(state,def.id);assert.equal(state.equippedGear.weapon,def.id);
  state=chooseMissionApproach(startRpgMission(state,mission.id),'assault');
  for(let turns=0;state.rpg.active.phase==='combat'&&turns<200;turns++){
   const e=state.rpg.active,traits=encounterTraits(mission,e.enemyIndex,e.turn);let action='attack';
   if(traits.armor&&!e.aimed)action='aim';
   if((traits.shield||traits.regeneration)&&canUseTactic(state,'hack'))action='hack';
   if(enemyIntent(state)==='Charged burst'&&canUseTactic(state,'disrupt'))action='disrupt';
   if(state.health.currentHp<calculateMaxHP(state)*.5&&canUseTactic(state,'heal'))action='heal';
   state=performTactic(state,action);
  }
  assert.equal(state.rpg.active.phase,'decision',def.name+': '+state.rpg.active.log.join(' / '));
 }
});

test('old and new saves retain Iconic ownership, upgrades, protection, seed and active replay',()=>{
 let state=completed();delete state.rpg.iconicLootSeed;
 state.inventory['iconic-final-notice']=1;state.upgradeLevels['iconic-final-notice']=3;
 const old=JSON.parse(JSON.stringify(state));
 const loaded=normalizeSave(old),again=normalizeSave(old);
 assert.equal(loaded.rpg.iconicLootSeed,again.rpg.iconicLootSeed);
 assert.equal(loaded.rpg.bossIconicProgress['dead-drop'].acquired['iconic-final-notice'],true);
 assert.equal(loaded.inventory['iconic-final-notice'],1);assert.equal(loaded.upgradeLevels['iconic-final-notice'],3);
 const replay=chooseMissionApproach(startBossReplay(loaded,'dead-drop'),'assault');
 const restored=normalizeSave(JSON.parse(JSON.stringify(replay)));assert.equal(restored.rpg.active.bossReplay,true);assert.equal(restored.rpg.active.enemyIndex,rpgMissions[0].enemies.length-1);
});
