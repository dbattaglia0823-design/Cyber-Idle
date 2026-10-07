import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { recipes } from '../src/data/recipes.ts';
import { skillActions } from '../src/data/skills.ts';
import { vendors } from '../src/data/vendors.ts';
import { rpgMissions, rpgSideGigs } from '../src/data/rpgCampaign.ts';
import { missionRewardPools, missionItemRewards, GIG_UNIQUE_CHANCE } from '../src/data/missionRewards.ts';
import { districtSupplyItems } from '../src/data/materialSupply.ts';
import { mainJobBalance } from '../src/data/mainJobBalance.ts';
import { districtLevelBands } from '../src/data/levelBands.ts';
import { getItem } from '../src/data/items.ts';
import { startCraft, processCrafting, stopCraft } from '../src/systems/craftingProcessing.ts';
import { itemUpgradeCost, upgradeItem } from '../src/systems/upgradeSystem.ts';
import { prepareMainJob } from './main-job-fixture.mjs';
import { claimFieldKit } from '../src/systems/rpgSystem.ts';
function reachableBeforeBoss(act) {
 const districtIds = new Set(rpgMissions.slice(0,act+1).map(m=>m.district));
 const maxLevel=districtLevelBands[rpgMissions[act].district].max;
 const known=new Set(['credits','scrap','encryptedData','basic-med-injector']);
 for(const id of districtIds) {districtSupplyItems(id).forEach(item=>known.add(item));missionRewardPools[id].forEach(item=>known.add(item));}
 for(const m of rpgMissions.slice(0,act))Object.keys(missionItemRewards(m)).forEach(id=>known.add(id));
 for(const vendor of vendors.filter(v=>districtIds.has(v.districtId)))for(const item of vendor.inventory)if(!item.requiredUnlock&&!item.requiredFactionRank)known.add(item.itemId);
 for(let pass=0;pass<recipes.length;pass++){
  const count=known.size;
  for(const a of skillActions.filter(a=>(!a.districtReq||districtIds.has(a.districtReq))&&a.levelReq<=maxLevel)){
   const costs=[...Object.keys(a.requiredItems??{}),...Object.entries(a.rewards).filter(([,n])=>n<0).map(([id])=>id)];
   if(!costs.every(id=>known.has(id)))continue;
   Object.entries(a.rewards).filter(([,n])=>n>0).forEach(([id])=>known.add(id));Object.keys(a.itemRewards??{}).forEach(id=>known.add(id));
  }
  for(const r of recipes.filter(r=>(!r.requiredDistrict||districtIds.has(r.requiredDistrict))&&r.requiredLevel<=maxLevel))if([...Object.keys(r.inputCosts),...(r.requiredBlueprint?[r.requiredBlueprint]:[])].every(id=>known.has(id)))known.add(r.outputItemId);
  if(count===known.size)break;
 }
 return known;
}
for(const mission of rpgMissions)test(mission.district+' can craft and upgrade recommended gear before clearing its own boss',()=>{
 const known=reachableBeforeBoss(mission.act);
 let s=claimFieldKit(chooseStartingPath(createInitialState(1000),'streetborn'));
 for(const prior of rpgMissions.slice(0,mission.act))s.rpg.completed[prior.id]={outcome:'protect',approach:'assault',clears:1};
 for(const m of rpgMissions.slice(0,mission.act+1))s.districts[m.district].unlocked=true;
 s=prepareMainJob(s,mission);
 const gear=Object.values(s.equippedGear);s.inventory={};s.equippedGear={};s.upgradeLevels={};
 for(const skill of Object.values(s.skills))skill.level=districtLevelBands[mission.district].max;
 for(const id of known){if(id in s.resources)s.resources[id]=1000000;else s.inventory[id]=1000000; if(getItem(id)?.type==='Blueprint')s.unlockedBlueprints[id]=true;}
 let now=1000;
 for(const id of gear){const recipe=recipes.find(r=>r.outputItemId===id);assert.ok(recipe,id+' recipe');
  for(const cost of [...Object.keys(recipe.inputCosts),...(recipe.requiredBlueprint?[recipe.requiredBlueprint]:[])])assert.ok(known.has(cost),id+' needs unavailable '+cost);
  s.inventory[id]=0;s=startCraft(s,recipe.id,now);assert.equal(s.activeCraft?.recipeId,recipe.id);now+=s.activeCraft.durationMs;s=processCrafting(s,now);s=stopCraft(s);assert.ok(s.inventory[id]>=1);
  for(let i=0;i<Math.min(4,s.rpg.attributes.technical-2);i++){for(const cost of Object.keys(itemUpgradeCost(s,id)))assert.ok(known.has(cost),id+' upgrade needs '+cost);s=upgradeItem(s,id);assert.equal(s.upgradeLevels[id],i+1);}
 }
 assert.equal(Boolean(s.rpg.completed[mission.id]),false);
});
test('every district gig rotates useful local supplies without guaranteed gear or campaign progression',()=>{
 assert.equal(GIG_UNIQUE_CHANCE,.05);
 for(const gig of rpgSideGigs){const local=districtSupplyItems(gig.district);const seen=new Set();for(let clear=0;clear<Math.max(local.length,missionRewardPools[gig.district].length);clear++){
   const loot=missionItemRewards(gig,clear);Object.keys(loot).forEach(id=>seen.add(id));
   assert.ok(Object.keys(loot).every(id=>!['Weapon','Armor','Cyberware'].includes(getItem(id)?.type)),gig.title);
  }for(const id of local)assert.ok(seen.has(id),gig.title+' supplies '+id);
 }
});
