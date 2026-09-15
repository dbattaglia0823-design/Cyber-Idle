import test from 'node:test';
import assert from 'node:assert/strict';
import { rpgMissions, rpgSideGigs } from '../src/data/rpgCampaign.ts';
import { missionItemRewards, gigUniquePools, rollGigUnique, GIG_UNIQUE_CHANCE } from '../src/data/missionRewards.ts';
import { getItem } from '../src/data/items.ts';
import { recipes } from '../src/data/recipes.ts';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { claimFieldKit, startRpgMission, chooseMissionApproach, resolveRpgMission } from '../src/systems/rpgSystem.ts';

test('guaranteed payouts cannot flood equipment or software; finale keeps its single trophy', () => {
  const equipment = new Set(['Weapon','Armor','Cyberware','WeaponMod','WeaponAttachment','Quickhack']);
  for (const mission of [...rpgMissions,...rpgSideGigs]) for(let clear=0;clear<30;clear++) {
    const gear=Object.keys(missionItemRewards(mission,clear)).filter(id=>equipment.has(getItem(id)?.type));
    assert.deepEqual(gear,!mission.sideGig && mission.act===7 ? ['rpg-afterimage-os'] : [], mission.id);
  }
  for(const pool of Object.values(gigUniquePools)) for(const id of pool) assert.ok(!recipes.some(r=>r.outputItemId===id),id);
  assert.ok(gigUniquePools.neonRow.every(id=>['Common','Uncommon'].includes(getItem(id).rarity)));
});

test('unique drops have a 5 percent boundary and select exactly one item', () => {
  assert.equal(GIG_UNIQUE_CHANCE,.05);
  for(const gig of rpgSideGigs) {
    assert.ok(gigUniquePools[gig.district].length>0);
    assert.equal(rollGigUnique(gig,()=>.05),undefined);
    assert.equal(rollGigUnique(gig,()=>.99),undefined);
    for(let index=0;index<gigUniquePools[gig.district].length;index++) {
      const values=[.049,index/gigUniquePools[gig.district].length];
      assert.equal(rollGigUnique(gig,()=>values.shift()),gigUniquePools[gig.district][index]);
    }
  }
  assert.equal(rollGigUnique(rpgMissions[0],()=>0),undefined);
});

test('gig loot rolls only at settlement, preserves equipped gear and cannot pay twice', () => {
  let state=claimFieldKit(chooseStartingPath(createInitialState(),'streetborn'));
  const gig=rpgSideGigs[0], weapon=state.equippedGear.weapon;
  state=chooseMissionApproach(startRpgMission(state,gig.id),'assault');
  assert.equal(resolveRpgMission(state,gig.choices[0].id,()=>0),state);
  state.rpg.active.phase='decision';
  const next=resolveRpgMission(state,gig.choices[0].id,()=>0);
  assert.equal(next.inventory[gigUniquePools[gig.district][0]],1);
  assert.equal(next.equippedGear.weapon,weapon);
  assert.equal(resolveRpgMission(next,gig.choices[0].id,()=>0),next);
  const miss=resolveRpgMission(state,gig.choices[0].id,()=>.99);
  assert.equal(miss.inventory[gigUniquePools[gig.district][0]],undefined);
});
