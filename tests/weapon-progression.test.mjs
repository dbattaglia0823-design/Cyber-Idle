import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { items, getItem, canonicalWeaponId, legacyWeaponAliases } from '../src/data/items.ts';
import { resourceNames } from '../src/data/resources.ts';
import { recipes } from '../src/data/recipes.ts';
import { vendors } from '../src/data/vendors.ts';
import { weaponSpecs } from '../src/data/weapons.ts';
import { weaponDistrictOrder, weaponRarityStage, weaponVariants } from '../src/data/weaponProgression.ts';
import { districtWeaponLootPools, rollDistrictWeapon } from '../src/data/missionRewards.ts';
import { createInitialState } from '../src/systems/gameState.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { calculatePlayerCombatStats } from '../src/systems/balanceFormulas.ts';
import { tacticalStats, performTactic, startRpgMission, chooseMissionApproach, beginRunner } from '../src/systems/rpgSystem.ts';
import { canCraft, startCraft, processCrafting } from '../src/systems/craftingProcessing.ts';
import { vendorItemUnlocked } from '../src/systems/vendorSystem.ts';
import { weaponClassBonus } from '../src/systems/weaponSystem.ts';
import { WeaponSummary } from '../src/components/WeaponSummary.tsx';
const weapons=items.filter(i=>i.type==='Weapon'&&!i.iconic);

test('every existing and new weapon model has exactly three distinct variants and valid IDs',()=>{
 assert.equal(new Set(items.map(i=>i.id)).size,items.length);
 assert.equal(new Set(recipes.map(i=>i.id)).size,recipes.length);
 for(const model of weapons.filter(i=>i.weaponVariant==='Power')){
  const family=weapons.filter(i=>i.weaponModel===model.id);
  assert.deepEqual(family.map(i=>i.weaponVariant).sort(),['Power','Precision','Rapid']);
  assert.equal(new Set(family.map(i=>i.rarity)).size,1);
  assert.equal(new Set(family.map(i=>i.weaponDistrict)).size,1);
  assert.ok(family.find(i=>i.weaponVariant==='Rapid').stats.damage<model.stats.damage);
  assert.ok(family.find(i=>i.weaponVariant==='Rapid').stats.attackSpeed<model.stats.attackSpeed);
  assert.ok(family.find(i=>i.weaponVariant==='Precision').stats.critChance>model.stats.critChance);
 }
});

test('district lineups and loot phase in rarity without cross-product loot inflation',()=>{
 for(const [stage,district] of weaponDistrictOrder.entries()){
  const pool=districtWeaponLootPools[district];
  assert.ok(pool.length>=18 && pool.length<=36,district);
  for(const id of pool){const w=getItem(id);assert.equal(w.weaponDistrict,district);assert.ok(weaponRarityStage(w.rarity)<=stage);}
  const local=weaponSpecs.filter(w=>w.districtId===district);
  for(const model of local){const w=getItem(model.id);assert.ok(weaponRarityStage(w.rarity)<=stage);}
  assert.equal(rollDistrictWeapon(district,.25,()=>1),undefined);
  assert.ok(pool.includes(rollDistrictWeapon(district,.25,()=>0)));
 }
});

test('craftable models expose each variant and all shop, crafting and loot references are valid',()=>{
 for(const r of recipes){assert.ok(getItem(r.outputItemId),r.id);for(const id of Object.keys(r.inputCosts))assert.ok(getItem(id) || id in resourceNames,r.id+': '+id);}
 for(const model of weapons.filter(i=>i.weaponVariant==='Power')){
  const base=recipes.find(r=>r.outputItemId===model.id);
  if(!base)continue;
  for(const variant of weapons.filter(i=>i.weaponModel===model.id)){
   const recipe=recipes.find(r=>r.outputItemId===variant.id);
   assert.ok(recipe,variant.id);assert.equal(recipe.requiredDistrict,base.requiredDistrict);assert.deepEqual(recipe.inputCosts,base.inputCosts);
  }
 }
 for(const vendor of vendors)for(const entry of vendor.inventory)assert.ok(getItem(entry.itemId) || entry.itemId in resourceNames,entry.itemId);
});

test('variants remain competitive in both modes across districts, upgrades and builds',()=>{
 for(const spec of weaponSpecs.filter(w=>w.weaponClass==='Rifle'))for(const upgraded of [0,10]){
  const state=createInitialState();state.rpg.level=30;state.rpg.attributes.reflexes=20;
  const rates=[],field=[];
  for(const variant of Object.keys(weaponVariants)){
   const id=canonicalWeaponId(variant==='Power'?spec.id:spec.id+'-'+variant.toLowerCase());
   state.equippedGear.weapon=id;state.upgradeLevels[id]=upgraded;
   const stats=calculatePlayerCombatStats(state);rates.push(stats.damage*1000/stats.attackSpeedMs);field.push(tacticalStats(state).damage);
   assert.ok(stats.attackSpeedMs>=400);assert.ok(Number.isFinite(stats.damage));
  }
  assert.ok(Math.max(...rates)/Math.min(...rates)<1.16,spec.id+' idle '+rates);
  assert.ok(Math.max(...field)/Math.min(...field)<1.16,spec.id+' field '+field);
 }
});

test('legacy inventory, upgrades, installed parts and recipe progress survive save normalization',()=>{
 const state=createInitialState(1000);
 for(const spec of weaponSpecs){state.inventory[spec.id]=1;state.upgradeLevels[spec.id]=4;}
 state.equippedGear.weapon='street-rifle';state.inventory['street-rifle']=1;
 state.weaponLoadouts['street-rifle']={attachments:{scope:'cheap-reflex-sight'},mods:[]};
 state.activeCraft={recipeId:'recipe-street-rifle',startedAt:1000,durationMs:10000};
 const restored=normalizeSave(JSON.parse(JSON.stringify(state)));
 const quantities = {};
 for (const spec of weaponSpecs) quantities[canonicalWeaponId(spec.id)] = (quantities[canonicalWeaponId(spec.id)] ?? 0) + 1;
 for (const [id,count] of Object.entries(quantities)) { assert.equal(restored.inventory[id],count + (id === "street-rifle" ? 1 : 0)); assert.equal(restored.upgradeLevels[id],4); }
 for (const old of Object.keys(legacyWeaponAliases)) assert.equal(restored.inventory[old],undefined);
 assert.equal(restored.equippedGear.weapon,'street-rifle');assert.equal(restored.activeCraft.recipeId,'recipe-street-rifle');
 assert.deepEqual(restored.weaponLoadouts['street-rifle'],state.weaponLoadouts['street-rifle']);
});

test('crafting and vendors prevent new access to locked district weapons',()=>{
 const state=createInitialState();state.skills.cyberware.level=150;
 for(const item of items)state.inventory[item.id]=1e5;
 for(const id of Object.keys(state.resources))state.resources[id]=1e6;
 const recipe=recipes.find(r=>r.outputItemId==='skyline-zero-rapid');
 assert.ok(!canCraft(state,recipe));state.districts.skylineCore.unlocked=true;assert.ok(canCraft(state,recipe));
 state.districts.skylineCore.unlocked=false;
 assert.equal(vendorItemUnlocked(state,{itemId:'skyline-zero-rapid',stockType:'limited',price:100}),false);
});

test('tactical weapon use trains existing category mastery with a bounded five-percent bonus',()=>{
 let state=beginRunner(createInitialState(),'streetborn');
 state=chooseMissionApproach(startRpgMission(state,'dead-drop'),'assault');
 const category=getItem(state.equippedGear.weapon).weaponClass;
 const previous=state.weaponClasses[category].xp;
 state=performTactic(state,'attack');assert.ok(state.weaponClasses[category].xp>previous);
 const base=weaponClassBonus(state,category).damage;state.weaponClasses[category].level=99;
 assert.ok(weaponClassBonus(state,category).damage-base<=.050001);
 const summary=renderToStaticMarkup(createElement(WeaponSummary,{state,itemId:'zip-pistol-rapid',compareItemId:'zip-pistol'}));
 assert.match(summary,/Rapid/);assert.match(summary,/Neon Row/);assert.match(summary,/Idle DPS/);assert.doesNotMatch(summary,/NaN|undefined/);
});

test('Rapid supports RAM recovery and Precision rewards aiming without granting extra turns',()=>{
 let start=beginRunner(createInitialState(),'streetborn');
 start=chooseMissionApproach(startRpgMission(start,'dead-drop'),'assault');
 start.rpg.active.ram=0;start.rpg.active.enemyHp=10000;start.rpg.active.enemyMaxHp=10000;
 start.equippedGear.weapon='zip-pistol-rapid';
 const rapid=performTactic(start,'attack');
 assert.ok(rapid.rpg.active.log.some(line=>line.includes('Rapid cadence')));
 assert.equal(rapid.rpg.active.turn,start.rpg.active.turn+1);
 start.equippedGear.weapon='zip-pistol-precision';start.rpg.active.aimed=true;
 const aimed=performTactic(start,'attack');
 assert.ok(aimed.rpg.active.feedback.damage>tacticalStats(start).damage*1.8);
});

test('each district keeps a local three-variant lineup for every category already introduced',()=>{
 const introduced=new Set();
 for(const district of weaponDistrictOrder){
  weapons.filter(item=>item.weaponDistrict===district).forEach(item=>introduced.add(item.weaponClass));
  for(const category of introduced){
   for(const variant of Object.keys(weaponVariants))assert.ok(weapons.some(item=>item.weaponDistrict===district&&item.weaponClass===category&&item.weaponVariant===variant),district+': '+category+' '+variant);
  }
 }
});

for (const variant of ['Rapid','Precision']) for (const approach of ['assault','netrunner','ghost']) test(`${variant} can complete all eight chapters as ${approach} using earned local gear`, async()=>{
 const {simulateCampaign}=await import('../scripts/balance/campaign-simulation.mjs');
 const result=simulateCampaign({weaponVariant:variant,approach,style:'balanced'});
 assert.equal(result.completed,8,JSON.stringify(result));
 assert.equal(result.error,undefined);
 assert.ok(result.rows.every(row=>row.turns<85 && row.minHp>0));
});

test('active catalogue has exactly three weapons per district/category and no retired models',()=>{
 for(const district of weaponDistrictOrder) for(const category of new Set(weapons.filter(item=>item.weaponDistrict===district).map(item=>item.weaponClass))){
  assert.equal(weapons.filter(item=>item.weaponDistrict===district&&item.weaponClass===category).length,3);
 }
 for(const id of Object.keys(legacyWeaponAliases))assert.ok(!items.some(item=>item.id===id),id);
});

test('consolidation preserves counts, best upgrades, equipped parts, presets and recipe progress exactly once',()=>{
 const state=createInitialState(1000), target=canonicalWeaponId('vendor-nine');
 state.inventory['vendor-nine']=2;state.inventory['zip-pistol']=3;state.inventory[target]=1;
 state.upgradeLevels['vendor-nine']=6;state.upgradeLevels['zip-pistol']=3;
 state.inventoryLocks['zip-pistol']=true;state.equippedGear.weapon='vendor-nine';
 state.weaponLoadouts['vendor-nine']={attachments:{scope:'reflex-sight'},mods:[]};
 state.weaponLoadouts['zip-pistol']={attachments:{grip:'recoil-grip'},mods:[]};
 state.equipmentPresets.old={name:'old',gear:{weapon:'zip-pistol'},cyberware:{}};
 state.activeCraft={recipeId:'recipe-vendor-nine-rapid',startedAt:1000,durationMs:10000};
 const before=JSON.stringify(state);
 const restored=normalizeSave(state);
 assert.equal(JSON.stringify(state),before,'migration must not mutate the supplied save');
 assert.equal(restored.inventory[target],6);assert.equal(restored.upgradeLevels[target],6);
 assert.equal(restored.equippedGear.weapon,target);assert.equal(restored.weaponLoadouts[target].attachments.scope,'reflex-sight');
 assert.equal(restored.inventory['recoil-grip'],1);assert.equal(restored.inventoryLocks[target],true);
 assert.equal(restored.equipmentPresets.old.gear.weapon,target);
 assert.ok(recipes.some(recipe=>recipe.id===restored.activeCraft.recipeId));
 const again=normalizeSave(restored);assert.deepEqual(again.inventory,restored.inventory);assert.deepEqual(again.weaponLoadouts,restored.weaponLoadouts);
});
