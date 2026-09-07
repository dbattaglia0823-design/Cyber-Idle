import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/systems/gameState.ts';
import { campaignOperations } from '../src/data/campaign.ts';
import { legacyCraftingGoals } from '../src/data/endgameSystems.ts';
import { addItem } from '../src/systems/collectionSystem.ts';
import { updateWorldUnlocks } from '../src/systems/worldUnlocks.ts';
import { campaignProgress, syncCampaignCompletion, canAssembleLegacy, assembleLegacy, prestigeSkill, collectibleItems, claimCollectionReward, highThreatUnlocked } from '../src/systems/endgameProgress.ts';
import { getActiveModifiers } from '../src/systems/modifiers.ts';
import { syncStreetLegend } from '../src/systems/streetLegendProcessor.ts';
import { chooseStoryChoice, updateStoryProgress } from '../src/systems/storySystem.ts';
import { storyArcs } from '../src/data/storyArcs.ts';
import { streetLegendXpForRank } from '../src/data/streetLegendData.ts';

test('later story chapters unlock in their districts and complete with real operation clears', () => {
  const chapters = storyArcs.filter(arc => arc.steps.every(step => step.objective.type === 'clearOperation'));
  assert.ok(chapters.length >= 6);
  for (const arc of chapters) {
    let state = updateStoryProgress(createInitialState());
    assert.equal(state.storyArcs[arc.id].status, 'locked', arc.id);
    state.skills.scavenging.level = 150;
    updateWorldUnlocks(state);
    state = updateStoryProgress(state);
    assert.notEqual(state.storyArcs[arc.id].status, 'locked', arc.id);
    for (const step of arc.steps) {
      state.operationLogs[step.objective.target] = { firstClear: true, clears: 1, bestClearMs: 1000, drops: {} };
      state = updateStoryProgress(state);
    }
    assert.equal(state.storyArcs[arc.id].status, 'completed', arc.id);
    const credits = state.resources.credits;
    state = updateStoryProgress(state);
    assert.equal(state.resources.credits, credits, arc.id);
  }
});

test('legend pacing is smooth and a capped skill can prestige without an unrelated grind', () => {
  let rank50Cost = 0;
  for (let rank = 1; rank < 50; rank++) {
    rank50Cost += streetLegendXpForRank(rank);
    assert.ok(streetLegendXpForRank(rank + 1) / streetLegendXpForRank(rank) < 1.2);
  }
  assert.ok(rank50Cost < 30000);
  const state = createInitialState();
  state.skills.scavenging.level = 150;
  syncStreetLegend(state);
  assert.ok(state.prestigeProtocol.unlocked);
  const reset = prestigeSkill(state, 'scavenging');
  syncStreetLegend(reset);
  assert.ok(reset.prestigeProtocol.unlocked);
});

test('campaign finale requires all districts and awards its rewards exactly once', () => {
  const state=createInitialState();
  for(const id of campaignOperations.slice(0,-1)) state.operationLogs[id]={firstClear:true,clears:1,bestClearMs:1000,drops:{}};
  syncCampaignCompletion(state);
  assert.equal(campaignProgress(state).complete,false);
  assert.equal(state.inventory['iconic-exec-os'],undefined);
  state.operationLogs[campaignOperations.at(-1)]={firstClear:true,clears:1,bestClearMs:1000,drops:{}};
  const before=state.resources.credits;
  syncCampaignCompletion(state); syncCampaignCompletion(state);
  assert.equal(state.resources.credits,before+50000);
  assert.equal(state.inventory['iconic-exec-os'],1);
  assert.ok(state.achievements['campaign-complete']);
});

test('legacy assembly enforces materials and progression and creates usable rewards', () => {
  for (const goal of legacyCraftingGoals) {
    const state=createInitialState();
    assert.equal(assembleLegacy(state,goal.id),state);
    for (const skill of Object.values(state.skills)) skill.level=150;
    for (const mastery of Object.values(state.districtMastery)) mastery.level=50;
    state.streetLegend.rank=50;
    for (const [id,n] of Object.entries(goal.materials)) addItem(state,id,n);
    assert.ok(canAssembleLegacy(state,goal.id));
    const result=assembleLegacy(state,goal.id);
    assert.equal(result.endgameStatistics.legacyCraftsCompleted,1);
    assert.equal(canAssembleLegacy(result,goal.id),false);
    if(goal.id==='legacy-reflex-core') assert.equal(result.inventory['iconic-reflex-spine'],1);
    if(goal.id==='legacy-blacknet-processor') assert.equal(result.inventory['iconic-null-eye'],1);
    if(goal.id==='legacy-prototype-drive') assert.equal(result.resources.prototypeDriveUnit,12);
  }
});

test('prestige is optional, grants XP and preserves districts, items, story and legend', () => {
  let state=createInitialState();
  assert.equal(prestigeSkill(state,'scavenging'),state);
  state.skills.scavenging.level=150;
  state.prestigeProtocol.unlocked=true;
  state.inventory['street-knife']=1; state.storyFlags['test-story']=true;
  updateWorldUnlocks(state); syncStreetLegend(state);
  const legend=state.streetLegend.totalXp;
  // Eligibility is normally a rank-50 unlock. Set it explicitly for this isolated reset test.
  state.prestigeProtocol.unlocked=true;
  const before=getActiveModifiers(state).skillXp.scavenging??0;
  state=prestigeSkill(state,'scavenging');
  assert.equal(state.skills.scavenging.level,1);
  assert.ok(Math.abs((getActiveModifiers(state).skillXp.scavenging??0)-before-0.1)<1e-9);
  assert.ok(state.districts.skylineCore.unlocked);
  assert.equal(state.inventory['street-knife'],1);
  assert.ok(state.storyFlags['test-story']);
  syncStreetLegend(state);
  assert.ok(state.streetLegend.totalXp>=legend);
});

test('collection rewards require real discovery, grant bonuses, and cannot be reclaimed', () => {
  let state=createInitialState();
  assert.equal(claimCollectionReward(state,25),state);
  for (const item of collectibleItems) state.discoveredItems[item.id]=true;
  state=claimCollectionReward(state,25);
  const credits=state.resources.credits;
  assert.equal(claimCollectionReward(state,25),state);
  assert.equal(state.resources.credits,credits);
  assert.ok(getActiveModifiers(state).skillRewards>=0.02);
});

test('high-threat modes honor their distinct mastery thresholds', () => {
  const state=createInitialState(); state.streetLegend.rank=25;
  state.operationLogs['op-junkyard-lockdown']={firstClear:true,clears:1,bestClearMs:1000,drops:{}};
  state.districtMastery.rustYards.level=15;
  assert.equal(highThreatUnlocked(state,'ht-op-junkyard-warpath'),false);
  state.districtMastery.rustYards.level=25;
  assert.equal(highThreatUnlocked(state,'ht-op-junkyard-warpath'),true);
});

test('story choices cannot skip locked or future steps', () => {
  const state=createInitialState();
  assert.equal(chooseStoryChoice(state,'main-act-1-neon-entry','act1-recovered-data-choice','sell-to-sable'),state);
});
