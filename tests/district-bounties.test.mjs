import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { createInitialState } from '../src/systems/gameState.ts';
import { beginRunner, startRpgMission, chooseMissionApproach, performTactic, resolveRpgMission, leaveRpgMission, retryRpgMission, missionCharacterXp, missionEnemyStats, missionEnemyName, gigPayout } from '../src/systems/rpgSystem.ts';
import { districtBountyOffers, districtBountyById, activeDistrictBounty } from '../src/data/districtBounties.ts';
import { rpgSideGigs, rpgMissions } from '../src/data/rpgCampaign.ts';
import { missionItemRewards } from '../src/data/missionRewards.ts';
import { getItem } from '../src/data/items.ts';
import { resourceNames } from '../src/data/resources.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { applyOfflineProgress } from '../src/systems/offlineProgress.ts';
import { DistrictBountyBoard } from '../src/components/DistrictBountyBoard.tsx';
import { MissionDebrief } from '../src/screens/Missions/MissionDebrief.tsx';

const gig=rpgSideGigs[0];
const fresh=()=>beginRunner(createInitialState(1000),'streetborn');
const count=(state,id)=>id in state.resources?state.resources[id]:state.inventory[id]??0;
function accepted(state,offer,contract='none'){
 const begun=startRpgMission(state,gig.id,'standard',contract,false,offer.id);
 assert.notEqual(begun,state);
 return chooseMissionApproach(begun,'assault');
}
function finish(state){state.rpg.active.phase='decision';return resolveRpgMission(state,'extract',()=>1);}

test('every district has three deterministic rotating contracts and canonical material rewards',()=>{
 const state=fresh();
 for(const mission of rpgSideGigs){
  assert.deepEqual(districtBountyOffers(state,mission),mission.act===0?districtBountyOffers(state,mission):[]);
  state.districts[mission.district].unlocked=true;
  const offers=districtBountyOffers(state,mission);
  assert.equal(offers.length,3,mission.district);
  assert.equal(new Set(offers.map(o=>o.id)).size,3);
  assert.deepEqual(new Set(offers.map(o=>o.kind)),new Set(['hunt','intercept','sabotage']));
  for(const offer of offers){
   assert.ok(offer.creditBonus>0&&offer.creditBonus<mission.reward,offer.id);
   assert.ok(offer.healthMultiplier>=1);
   assert.ok(offer.damageMultiplier>0);
   assert.ok(offer.rewardItemAmount>0);
   assert.ok(getItem(offer.rewardItemId)||resourceNames[offer.rewardItemId],offer.rewardItemId);
   assert.equal(districtBountyById(state,mission,offer.id)?.title,offer.title);
  }
 }
 assert.equal(districtBountyOffers(state,rpgMissions[0]).length,0);
});

test('accepting bounty changes target, gig variant and health without modifying the base gig',()=>{
 const state=fresh(),offer=districtBountyOffers(state,gig)[0];
 const regular=chooseMissionApproach(startRpgMission(state,gig.id),'assault');
 const bounty=accepted(state,offer);
 assert.equal(bounty.rpg.active.bounty.id,offer.id);
 assert.equal(bounty.rpg.active.gigVariant,offer.variant);
 assert.equal(missionEnemyName(bounty,gig,0),offer.target);
 assert.equal(bounty.rpg.active.enemyMaxHp,missionEnemyStats(gig,0,'standard',offer).health);
 assert.ok(bounty.rpg.active.enemyMaxHp>regular.rpg.active.enemyMaxHp);
 assert.equal(regular.rpg.active.bounty,undefined);
 assert.equal(state.rpg.active,null);
 bounty.rpg.active.enemyHp=1;
 const hit=performTactic(bounty,'attack');
 assert.equal(hit.rpg.active.feedback.target,offer.target);
 assert.equal(hit.rpg.active.phase,'decision');
});

test('bounty payout, standing and materials are guaranteed and board refreshes only after successful settlement',()=>{
 const state=fresh(),offers=districtBountyOffers(state,gig),offer=offers[1];
 const before=accepted(state,offer);
 assert.equal(activeDistrictBounty(before,gig)?.id,offer.id);
 const loot=missionItemRewards(gig,0);
 const amount=(loot[offer.rewardItemId]??0)+offer.rewardItemAmount;
 const after=finish(before);
 assert.equal(after.resources.credits-state.resources.credits,gigPayout(gig)+offer.creditBonus);
 assert.equal(count(after,offer.rewardItemId)-count(state,offer.rewardItemId),amount);
 assert.equal(after.resources.reputation-state.resources.reputation,gig.choices[0].reputation+2);
 assert.equal(after.rpg.bountyCycles.neonRow,1);
 assert.equal(after.rpg.completed[gig.id].clears,1);
 assert.equal(after.rpg.level,2);
 assert.equal(after.districts.rustYards.unlocked,false);
 assert.equal(districtBountyOffers(after,gig).length,3);
 assert.ok(districtBountyOffers(after,gig).every(next=>!offers.some(old=>old.id===next.id)));
 assert.equal(after.rpg.bountyCycles.rustYards,0);
 assert.equal(resolveRpgMission(after,'extract'),after);
 assert.equal(startRpgMission(after,gig.id,'standard','none',false,offer.id),after);
 assert.equal(missionCharacterXp(after,gig),0);
 const repeated=accepted(after,districtBountyOffers(after,gig)[0]);
 const second=finish(repeated);
 assert.equal(second.rpg.level,after.rpg.level);
 assert.equal(second.rpg.xp,after.rpg.xp);
 assert.equal(second.rpg.bountyCycles.neonRow,2);
});

test('normal gigs and optional objectives retain exact payouts and never rotate bounty boards',()=>{
 const state=fresh(),basic=startRpgMission(state,gig.id);
 assert.equal(basic.rpg.active.bounty,undefined);
 const chosen=chooseMissionApproach(basic,'assault');
 const after=finish(chosen);
 assert.equal(after.resources.credits-state.resources.credits,gig.reward);
 assert.equal(after.rpg.bountyCycles.neonRow,0);
 assert.equal(after.rpg.completed[gig.id].clears,1);
 const objective=accepted(after,districtBountyOffers(after,gig)[0],'clean');
 const bonus=finish(objective);
 assert.equal(bonus.resources.credits-after.resources.credits,gig.reward+districtBountyOffers(after,gig)[0].creditBonus+Math.round(gig.reward*.25));
 assert.equal(bonus.rpg.completed[gig.id].clears,2);
});

test('reject forged offers, cross-district offers and bounty use with main story',()=>{
 const state=fresh(),offer=districtBountyOffers(state,gig)[0];
 for(const id of ['unknown','neonRow:1234:1','rustYards:0:1','neonRow:0:100']){
  assert.equal(startRpgMission(state,gig.id,'standard','none',false,id),state,id);
 }
 assert.equal(startRpgMission(state,rpgMissions[0].id,'standard','none',false,offer.id),state);
 assert.equal(state.resources.credits,50);
});

test('bounty remains stable during retry, reload and offline; old saves have an empty board',()=>{
 const state=fresh(),offer=districtBountyOffers(state,gig)[2];
 let active=accepted(state,offer);
 active.rpg.active.phase='failed';
 const retried=retryRpgMission(active);
 assert.equal(retried.rpg.active.bounty.id,offer.id);
 assert.equal(retried.rpg.active.phase,'briefing');
 assert.equal(retried.rpg.bountyCycles.neonRow,0);
 const reloaded=normalizeSave(JSON.parse(JSON.stringify(retried)));
 assert.equal(activeDistrictBounty(reloaded,gig)?.id,offer.id);
 assert.deepEqual(normalizeSave(reloaded).rpg,reloaded.rpg);
 const offline=applyOfflineProgress(reloaded,reloaded.lastSavedAt+3600000);
 assert.equal(activeDistrictBounty(offline,gig)?.id,offer.id);
 assert.equal(offline.rpg.bountyCycles.neonRow,0);
 assert.equal(leaveRpgMission(offline).rpg.bountyCycles.neonRow,0);
 const legacy=fresh();delete legacy.rpg.bountyCycles;
 assert.equal(normalizeSave(legacy).rpg.bountyCycles.neonRow,0);
});

test('invalid bounty save values cannot create extra rewards or break story state',()=>{
 const state=fresh();
 state.rpg.bountyCycles={neonRow:Infinity,rustYards:-12,ghostDistrict:777};
 const fixed=normalizeSave(state);
 assert.equal(fixed.rpg.bountyCycles.neonRow,0);
 assert.equal(fixed.rpg.bountyCycles.rustYards,0);
 assert.equal(fixed.rpg.bountyCycles.ghostDistrict,undefined);
 let begun=accepted(fixed,districtBountyOffers(fixed,gig)[0]);
 begun.rpg.active.bounty={id:'neonRow:999:0',cycle:999};
 const restored=normalizeSave(begun);
 assert.equal(restored.rpg.active.bounty,undefined);
 const settled=finish(restored);
 assert.equal(settled.rpg.bountyCycles.neonRow,0);
 assert.equal(settled.resources.credits-fixed.resources.credits,gig.reward);
});

test('bounty board and debrief show readable targets, supplies and earned bonuses',()=>{
 const state=fresh(),offer=districtBountyOffers(state,gig)[0];
 const panel=render(createElement(DistrictBountyBoard,{state,mission:gig,selectedId:offer.id,onSelect(){}}));
 assert.match(panel,/District bounty board/i);
 assert.match(panel,/Wanted target/);
 assert.match(panel,/aria-pressed="true"/);
 assert.match(panel,/Regular local gig/);
 assert.match(panel,/credits/);
 const before=accepted(state,offer);
 before.rpg.active.phase='decision';
 const after=resolveRpgMission(before,'extract',()=>1);
 const receipt=render(createElement(MissionDebrief,{before,after,onContinue(){}}));
 assert.match(receipt,/DISTRICT BOUNTY COMPLETE/);
 assert.match(receipt,new RegExp(offer.target));
 assert.match(receipt,/Bounty secured/);
 assert.match(receipt,/now has new targets/);
});
