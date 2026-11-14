import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import { getItem, items } from "../src/data/items.ts";
import { armorSpecs } from "../src/data/armor.ts";
import { weaponClassOrder } from "../src/data/weaponClasses.ts";
import { createInitialState } from "../src/systems/gameState.ts";
import { equipItem, unequipGear } from "../src/systems/equipmentSystem.ts";
import { normalizeSave } from "../src/systems/saveSystem.ts";
import { getActiveModifiers } from "../src/systems/modifiers.ts";
import { armorSetIdentity, equippedArmorSetProgress, weaponClassIdentity, weaponTuning } from "../src/systems/equipmentIdentity.ts";
import { buildSnapshot, withPreviewEquipped, EquipmentImpact, EquipmentUpgradeImpact, ArmorSetStatus, WeaponTuningStatus } from "../src/components/EquipmentInsights.tsx";
import { WeaponSummary } from "../src/components/WeaponSummary.tsx";
import { itemUpgradeCost, canAffordItemUpgrade, upgradeItem } from "../src/systems/upgradeSystem.ts";
import { beginRunner, startRpgMission, chooseMissionApproach, performTactic } from "../src/systems/rpgSystem.ts";
import { rpgMissions } from "../src/data/rpgCampaign.ts";

const slots=["head","chest","hands","legs","boots"];
function wear(state, prefix, count=5) {
 for (const slot of slots.slice(0,count)) {
  const id=prefix+"-"+slot;
  assert.equal(getItem(id)?.type,"Armor",id);
  state.equippedGear[slot]=id;
  state.inventory[id]=1;
 }
 return state;
}
function scene(itemId,act=0,upgrade=3) {
 let state=beginRunner(createInitialState(1000),"streetborn");
 for (const mission of rpgMissions.slice(0,act)) state.rpg.completed[mission.id]={outcome:"protect",approach:"assault",clears:1};
 for (const mission of rpgMissions.slice(0,act+1)) state.districts[mission.district].unlocked=true;
 state.equippedGear.weapon=itemId;
 state.inventory[itemId]=1;
 state.upgradeLevels[itemId]=upgrade;
 state=chooseMissionApproach(startRpgMission(state,rpgMissions[act].id),"assault");
 assert.equal(state.rpg.active.phase,"combat");
 state.rpg.active.enemyHp=10000;
 state.rpg.active.enemyMaxHp=10000;
 return state;
}
const model=cls=>items.find(i=>i.type==="Weapon"&&!i.iconic&&i.weaponVariant==="Power"&&i.weaponClass===cls)?.id;
function upgradeResources(state,cost) {
 for (const [id,qty] of Object.entries(cost)) {
  if(id in state.resources)state.resources[id]=qty+100000;
  else state.inventory[id]=qty+100000;
 }
}
test("all ten complete armor sets have real two/three/five-piece bonuses and valid item IDs",()=>{
 assert.equal(Object.keys(armorSetIdentity).length,10);
 const unique=new Set(armorSpecs.map(spec=>spec.name.split(" ").slice(0,-1).join(" ")));
 assert.deepEqual([...unique].sort(),Object.keys(armorSetIdentity).sort());
 for(const name of Object.keys(armorSetIdentity)){
  const id=name.toLowerCase().replaceAll(" ","-");
  for(const slot of slots)assert.equal(getItem(id+"-"+slot)?.setName,name);
  const state=wear(createInitialState(),id);
  const progress=equippedArmorSetProgress(state);
  assert.deepEqual(progress.map(s=>s.name),[name]);
  assert.deepEqual(progress[0].activeTiers,[2,3,5]);
  assert.equal(progress[0].nextTier,null);
  assert.ok(getActiveModifiers(state).activeSources.includes(name+" 5/5"));
 }
});
test("set thresholds activate only on actual worn pieces and stop after unequipping",()=>{
 const state=createInitialState(),baseline=getActiveModifiers(state);
 state.inventory["neon-runner-head"]=1;state.inventory["neon-runner-chest"]=1;
 let one=equipItem(state,"neon-runner-head");
 assert.equal(equippedArmorSetProgress(one)[0].count,1);
 assert.equal(getActiveModifiers(one).combatAttackSpeed,baseline.combatAttackSpeed);
 let two=equipItem(one,"neon-runner-chest");
 assert.equal(equippedArmorSetProgress(two)[0].count,2);
 assert.ok(getActiveModifiers(two).combatAttackSpeed-baseline.combatAttackSpeed>=.015);
 assert.equal(getActiveModifiers(two).dodgeChance,baseline.dodgeChance);
 two=wear(two,"neon-runner",3);
 assert.ok(getActiveModifiers(two).dodgeChance-baseline.dodgeChance>=.025);
 const full=wear(two,"neon-runner",5);
 assert.ok(getActiveModifiers(full).combatDamage-baseline.combatDamage>=.035);
 assert.ok(getActiveModifiers(full).dodgeChance-baseline.dodgeChance>=.04);
 const out=unequipGear(full,"chest");
 assert.equal(equippedArmorSetProgress(out)[0].count,4);
 assert.ok(getActiveModifiers(out).combatDamage-baseline.combatDamage<.035);
 assert.deepEqual(equippedArmorSetProgress(state),[]);
 assert.equal(state.equippedGear.head,undefined,"inspection/equip helpers must not mutate the original");
});
test("mixed pieces never count toward an unearned bonus or double count copies",()=>{
 const state=wear(createInitialState(),"neon-runner",3);
 state.equippedGear.legs="street-operator-legs";
 state.equippedGear.boots="street-operator-boots";
 state.inventory["neon-runner-boots"]=80;
 const sets=equippedArmorSetProgress(state);
 assert.equal(sets.find(s=>s.name==="Neon Runner").count,3);
 assert.equal(sets.find(s=>s.name==="Street Operator").count,2);
 const sources=getActiveModifiers(state).activeSources;
 assert.ok(sources.includes("Neon Runner 3/5"));
 assert.ok(sources.includes("Street Operator 2/5"));
 assert.ok(!sources.includes("Neon Runner 5/5"));
 assert.ok(!sources.includes("Street Operator 3/5"));
 // A corrupt save with a headpiece in the chest slot must not unlock a set.
 state.equippedGear.chest="neon-runner-head";
 assert.equal(equippedArmorSetProgress(state).find(s=>s.name==="Neon Runner").count,2);
});
test("equipping full armor improves real combat output while preserving old saves",()=>{
 const old=createInitialState(1000);
 old.skills.combat.level=17;old.rpg.level=12;old.inventory["neon-runner-chest"]=1;
 const worn=wear(old,"neon-runner");
 const hp=buildSnapshot(worn),bare=buildSnapshot(createInitialState());
 assert.ok(hp.maxHp>=bare.maxHp);
 assert.ok(hp.idleDps>0&&hp.fieldDamage>0);
 const JSONsave=JSON.parse(JSON.stringify(worn));
 const restored=normalizeSave(JSONsave);
 assert.equal(restored.skills.combat.level,17);
 assert.equal(restored.rpg.level,12);
 assert.equal(restored.inventory["neon-runner-boots"],1);
 assert.equal(equippedArmorSetProgress(restored)[0].count,5);
 assert.deepEqual(normalizeSave(restored).rpg,restored.rpg);
 assert.deepEqual(buildSnapshot(restored),buildSnapshot(normalizeSave(restored)));
});
test("weapon class tuning covers all 12 classes and respects +3/+6/+9 milestones",()=>{
 assert.deepEqual(Object.keys(weaponClassIdentity).sort(),[...weaponClassOrder].sort());
 for(const cls of weaponClassOrder) {
  const id=model(cls);assert.ok(id,cls);
  let state=createInitialState();state.equippedGear.weapon=id;
  const base=getActiveModifiers(state);
  assert.equal(weaponTuning(state)?.traitUnlocked,false);
  state.upgradeLevels[id]=2;
  assert.equal(weaponTuning(state)?.traitUnlocked,false);
  state.upgradeLevels[id]=3;
  assert.equal(weaponTuning(state)?.traitUnlocked,true);
  const upgraded=getActiveModifiers(state);
  assert.ok(upgraded.activeSources.includes(weaponClassIdentity[cls].name+" +3"));
  assert.ok(upgraded.combatDamage>base.combatDamage||upgraded.combatAttackSpeed>base.combatAttackSpeed);
  state.upgradeLevels[id]=6;assert.equal(weaponTuning(state)?.reinforced,true);
  state.upgradeLevels[id]=9;assert.equal(weaponTuning(state)?.perfected,true);
  assert.ok(getActiveModifiers(state).combatDamage>=upgraded.combatDamage+.012-1e-9);
  state.equippedGear.weapon=undefined;
  assert.equal(weaponTuning(state),null);
  assert.ok(!getActiveModifiers(state).activeSources.includes(weaponClassIdentity[cls].name+" +3"));
 }
});
test("upgrades spend their actual existing materials and activate tuning without resetting progress",()=>{
 const id=model("pistols"),state=createInitialState();
 state.inventory[id]=1;state.equippedGear.weapon=id;state.rpg.attributes.technical=20;
 state.upgradeLevels[id]=2;
 const cost=itemUpgradeCost(state,id);upgradeResources(state,cost);
 assert.equal(canAffordItemUpgrade(state,id),true);
 const previousResources={...state.resources};
 const changed=upgradeItem(state,id);
 assert.notEqual(changed,state);
 assert.equal(state.upgradeLevels[id],2);
 assert.equal(changed.upgradeLevels[id],3);
 assert.equal(weaponTuning(changed).traitUnlocked,true);
 for(const [resource,amount] of Object.entries(cost))if(resource in state.resources)assert.equal(changed.resources[resource],previousResources[resource]-amount);
 assert.equal(changed.rpg.level,state.rpg.level);
 assert.equal(changed.inventory[id],1);
 const blocked=upgradeItem({...state,rpg:{...state.rpg,attributes:{...state.rpg.attributes,technical:3}}},id);
 assert.equal(blocked.upgradeLevels[id],2);
});
test("tuning alters meaningful field actions and cannot grant actions to unupgraded weapons",()=>{
 const pistol=model("pistols");
 let s=scene(pistol);s.rpg.active.turn=0;
 const first=performTactic(s,"attack");
 s.rpg.active.turn=1;const second=performTactic(s,"attack");
 assert.ok(first.rpg.active.feedback.damage>second.rpg.active.feedback.damage);
 const noTune=scene(pistol,0,2);assert.ok(!noTune.rpg.active.log.some(l=>l.includes("Quickdraw tuning")));
 const smg=scene(model("smgs"));const suppressed=performTactic(smg,"attack");
 assert.ok(suppressed.rpg.active.log.some(l=>l.includes("Suppressive Volley")));
 assert.ok(suppressed.rpg.active.feedback.taken<performTactic(scene(model("smgs"),0,2),"attack").rpg.active.feedback.taken);
 const blunt=performTactic(scene(model("bluntWeapons")),"attack");
 assert.equal(blunt.rpg.active.feedback.interrupted,true);
 assert.equal(performTactic(scene(model("bluntWeapons"),0,2),"attack").rpg.active.feedback.interrupted,false);
 const rifle=scene(model("assaultRifles"));
 const shot=performTactic(rifle,"attack");
 rifle.rpg.active.aimed=true;
 const aimed=performTactic(rifle,"attack");
 assert.ok(shot.rpg.active.log.some(l=>l.includes("Follow-through")));
 assert.ok(aimed.rpg.active.feedback.damage>shot.rpg.active.feedback.damage);
 const exotic=scene(model("exoticWeapons"));exotic.rpg.active.turn=1;
 const ordinary=performTactic(exotic,"attack");
 exotic.rpg.active.turn=2;const pulse=performTactic(exotic,"attack");
 assert.ok(pulse.rpg.active.feedback.damage>ordinary.rpg.active.feedback.damage);
});
test("penetration, charged pressure and linked quickhacks have distinct class effects",()=>{
 const shotgun=scene(model("shotguns"),1,3),normalShot=scene(model("shotguns"),1,2);
 assert.ok(performTactic(shotgun,"attack").rpg.active.feedback.damage>performTactic(normalShot,"attack").rpg.active.feedback.damage);
 const tech=scene(model("techWeapons"),5,3),normalTech=scene(model("techWeapons"),5,2);
 assert.ok(performTactic(tech,"attack").rpg.active.feedback.damage>performTactic(normalTech,"attack").rpg.active.feedback.damage);
 const heavy=scene(model("heavyWeapons"),6);
 heavy.rpg.active.enemyIndex=3;heavy.rpg.active.turn=1;heavy.rpg.active.enemyHp=10000;heavy.rpg.active.enemyMaxHp=10000;
 const charger=performTactic(heavy,"attack");
 assert.ok(charger.rpg.active.log.some(l=>l.includes("Heavy Suppression")));
 for(const cls of ["smartWeapons","cyberdeckWeapons"]){
  const named=model(cls);
  const state=scene(named,0,3),baseline=scene(named,0,2);
  const tuned=performTactic(state,"hack"),old=performTactic(baseline,"hack");
  assert.ok(tuned.rpg.active.feedback.damage>old.rpg.active.feedback.damage,cls);
  assert.ok(tuned.rpg.active.log.some(l=>l.includes("boosted the quickhack")));
 }
});
test("comparison uses full loadout, set thresholds and upgrade impact without mutating state",()=>{
 const state=wear(createInitialState(),"neon-runner",2);
 const candidate="neon-runner-hands";
 const prev=buildSnapshot(state),proposed=withPreviewEquipped(state,candidate);
 assert.equal(state.equippedGear.hands,undefined);
 assert.equal(equippedArmorSetProgress(proposed)[0].count,3);
 assert.equal(equippedArmorSetProgress(state)[0].count,2);
 const after=buildSnapshot(proposed);
 assert.ok(after.fieldMitigation>=prev.fieldMitigation);
 assert.ok(after.maxHp>=prev.maxHp);
 const orig=JSON.stringify(state);
 const comparison=render(createElement(EquipmentImpact,{state,itemId:candidate}));
 assert.match(comparison,/Build comparison/);
 assert.match(comparison,/Idle DPS/);
 assert.match(comparison,/Field mitigation/);
 assert.match(comparison,/Neon Runner: 2\/5.*3\/5/);
 const bonuses=render(createElement(ArmorSetStatus,{state,itemId:candidate}));
 assert.match(bonuses,/2 pieces ACTIVE/);
 assert.match(bonuses,/3 pieces LOCKED/);
 assert.equal(JSON.stringify(state),orig);
});
test("weapon summaries and upgrade dialogs describe milestones, strengths and tradeoffs",()=>{
 const state=createInitialState();
 state.inventory["zip-pistol"]=1;state.equippedGear.weapon="zip-pistol";state.rpg.attributes.technical=20;
 state.upgradeLevels["zip-pistol"]=2;
 const summary=render(createElement(WeaponSummary,{state,itemId:"zip-pistol",compareItemId:"zip-pistol-rapid"}));
 assert.match(summary,/Quickdraw/);assert.match(summary,/Unlocks at \+3/);
 const milestones=render(createElement(WeaponTuningStatus,{state,itemId:"zip-pistol"}));
 assert.match(milestones,/Quickdraw/);assert.match(milestones,/\+3/);
 assert.match(milestones,/Reinforced tuning/);assert.match(milestones,/Perfected tuning/);
 const upgrade=render(createElement(EquipmentUpgradeImpact,{state,itemId:"zip-pistol"}));
 assert.match(upgrade,/Equipped build impact/);
 assert.match(upgrade,/Idle DPS/);
 assert.match(upgrade,/Field hit/);
});
