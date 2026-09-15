import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { operations } from '../src/data/operations.ts';
import { jobs } from '../src/data/jobs.ts';
import { bosses } from '../src/data/bosses.ts';
import { rpgMissions, rpgSideGigs } from '../src/data/rpgCampaign.ts';
import { districtSupplyItems } from '../src/data/materialSupply.ts';
import { missionRewardPools, missionItemRewards } from '../src/data/missionRewards.ts';
import { getItem } from '../src/data/items.ts';
import { resourceNames } from '../src/data/resources.ts';
import { startOperation, processOperation, canStartOperation } from '../src/systems/operationProcessor.ts';
import { startJob, processJobCompletion, canAttemptJob } from '../src/systems/jobProcessing.ts';
import { districtActivitySummaries, districtContentMap } from '../src/systems/districtActivityMap.ts';
import { getItemSources } from '../src/systems/itemSourceLookup.ts';
import { claimFieldKit, startRpgMission, chooseMissionApproach, resolveRpgMission } from '../src/systems/rpgSystem.ts';

test('retired activities cannot start and their navigation entries are absent', () => {
  const state = createInitialState();
  for (const operation of operations) {
    assert.equal(canStartOperation(state, operation), false);
    assert.equal(startOperation(state, operation.id), state);
  }
  for (const job of jobs) {
    assert.equal(canAttemptJob(state, job), false);
    assert.equal(startJob(state, job.id), state);
  }
  for (const mission of rpgMissions) {
    assert.deepEqual(districtContentMap(state, mission.district).operations, []);
    assert.deepEqual(districtContentMap(state, mission.district).contracts, []);
    assert.ok(districtActivitySummaries(state, mission.district).every(entry => !['contracts', 'operations'].includes(entry.id)));
  }
});

test('old saves cancel retired work while preserving money, inventory and earned records', () => {
  const state = createInitialState();
  state.activeJob = { jobId: jobs[0].id, startedAt: 1, durationMs: 10 };
  state.activeOperation = { operationId: operations[0].id, startedAt: 1, durationMs: 10 };
  state.operationLogs[operations[0].id] = { firstClear: true, clears: 2, bestClearMs: 10, drops: {} };
  state.inventory['street-knife'] = 3;
  for (const result of [normalizeSave(state), processOperation(processJobCompletion(state, 100000), 100000)]) {
    assert.equal(result.activeJob, null);
    assert.equal(result.activeOperation, null);
    assert.equal(result.resources.credits, state.resources.credits);
    assert.equal(result.inventory['street-knife'], 3);
    assert.equal(result.operationLogs[operations[0].id].clears, 2);
  }
});

for (const gig of rpgSideGigs) test(`${gig.title} keeps retired rewards obtainable through crafting, supplies or rare gig loot`, () => {
  const formerRewards = new Set();
  const addBundle = rewards => Object.entries(rewards ?? {}).forEach(([id, amount]) => { if (amount > 0) formerRewards.add(id); });
  for (const operation of operations.filter(entry => entry.districtId === gig.district)) {
    for (const drop of [...operation.rareDrops, ...(bosses.find(entry => entry.id === operation.bossId)?.drops ?? [])]) formerRewards.add(drop.id);
    [operation.completionRewards, operation.firstClearRewards, operation.repeatClearRewards].forEach(addBundle);
    for (const route of operation.routes ?? []) if (route.bonusDrop) formerRewards.add(route.bonusDrop.id);
  }
  for (const job of jobs.filter(entry => entry.districtId === gig.district)) {
    addBundle(job.rewards);
    if (job.rareReward) formerRewards.add(job.rareReward);
    for (const drop of job.rareRewardTable ?? []) formerRewards.add(drop.itemId);
  }
  ['credits', 'heat', 'reputation'].forEach(id => formerRewards.delete(id));
  const obtained = new Set();
  const clears = Math.max(missionRewardPools[gig.district].length, districtSupplyItems(gig.district).length);
  const state = createInitialState();
  for (let clear = 0; clear < clears; clear++) for (const [id, amount] of Object.entries(missionItemRewards(gig, clear))) {
    assert.ok(getItem(id) || resourceNames[id], `Unknown reward ${id}`);
    assert.ok(Number.isInteger(amount) && amount > 0);
    obtained.add(id);
    assert.ok(getItemSources(id, state).some(source => source.type === 'Mission reward' && source.name === gig.title), `Missing source for ${id}`);
  }
  for (const id of formerRewards) assert.ok(getItemSources(id, state).some(source => source.type !== "Item note"), `Stranded reward ${id}`);
  assert.ok(rpgMissions.find(mission => mission.district === gig.district).reward > gig.reward * 2);
});

test('local gig clears pay their preview, rotate loot and build local standing without advancing the main story', () => {
  let state = claimFieldKit(chooseStartingPath(createInitialState(), 'streetborn'));
  const gig = rpgSideGigs[0];
  for (let clear = 0; clear < 3; clear++) {
    state = chooseMissionApproach(startRpgMission(state, gig.id), 'assault');
    state.rpg.active.phase = 'decision'; // Isolate payout from combat, which has full campaign tests.
    const inventory = { ...state.inventory }, resources = { ...state.resources };
    const loot = missionItemRewards(gig, clear);
    state = resolveRpgMission(state, gig.choices[0].id);
    assert.equal(state.resources.credits - resources.credits, gig.reward + gig.choices[0].bonusCredits);
    for (const [id, amount] of Object.entries(loot)) {
      const delta = id in resources ? state.resources[id] - resources[id] : (state.inventory[id] ?? 0) - (inventory[id] ?? 0);
      assert.equal(delta, amount, id);
    }
    assert.equal(state.rpg.completed[gig.id].clears, clear + 1);
    assert.equal(state.districts.rustYards.unlocked, false);
  }
  assert.ok(state.districtStanding.neonRow.standing > 0);
  assert.ok(state.fixerTrust['sable-quinn-fixer'].trust > 0);
  assert.ok(rpgMissions.every(mission => !state.rpg.completed[mission.id]));
});
