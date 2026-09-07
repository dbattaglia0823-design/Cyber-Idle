import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RpgHub } from '../src/components/RpgHub.tsx';
import { createInitialState, chooseStartingPath, cloneState } from '../src/systems/gameState.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { rpgMissions, rpgSideGigs, rpgPerks } from '../src/data/rpgCampaign.ts';
import { claimFieldKit, spendAttribute, buyRpgPerk, respecRpg, missionAvailable, startRpgMission, chooseMissionApproach, approachRequirement, performTactic, canUseTactic, enemyIntent, resolveRpgMission, leaveRpgMission, retryRpgMission, mainChaptersCleared, tacticalStats, campaignEpilogue } from '../src/systems/rpgSystem.ts';
import { applyPassiveRecovery, calculateMaxHP } from '../src/systems/healthSystem.ts';
import { applyOfflineProgress } from '../src/systems/offlineProgress.ts';
import { startSkillAction } from '../src/systems/actionProcessing.ts';
import { getItem } from '../src/data/items.ts';
import { getItemSources } from '../src/systems/itemSourceLookup.ts';

const fresh = (path='streetborn') => claimFieldKit(chooseStartingPath(createInitialState(),path));
function build(state, attribute) {
  while (state.rpg.attributePoints>0) {
    const target = state.rpg.attributes[attribute]<20 ? attribute : state.rpg.attributes.technical<20 ? 'technical' : 'body';
    const next=spendAttribute(state,target);
    if(next===state) break;
    state=next;
  }
  for(const perk of rpgPerks) state=buyRpgPerk(state,perk.id);
  return state;
}
function fight(state, style='weapon') {
  let turns=0;
  while(state.rpg.active?.phase==='combat' && turns++<120) {
    const hp=state.health.currentHp, max=calculateMaxHP(state);
    let action=style==='hack' && canUseTactic(state,'hack') ? 'hack' : 'attack';
    if(enemyIntent(state)==='Charged burst' && canUseTactic(state,'disrupt')) action='disrupt';
    if(hp<max*.5 && canUseTactic(state,'heal')) action='heal';
    state=performTactic(state,action);
  }
  assert.equal(state.rpg.active?.phase,'decision',`${state.rpg.active?.missionId}: ${JSON.stringify(state.rpg.active?.log)}`);
  return state;
}

for(const [path,attribute,approach,ending] of [['streetborn','body','assault','free'],['corporateDefector','intelligence','netrunner','own'],['outrider','cool','ghost','erase']]) {
  test(`${path} can finish all eight RPG chapters as ${approach}, without idle work, farming, or purchased supplies`,()=>{
    let state=fresh(path);
    for(const mission of rpgMissions) {
      state=build(state,attribute);
      assert.ok(missionAvailable(state,mission),mission.id);
      state=startRpgMission(state,mission.id);
      assert.ok(approachRequirement(state,mission,approach).met,`${mission.id} approach`);
      state=chooseMissionApproach(state,approach);
      state=fight(state,approach==='netrunner'?'hack':'weapon');
      state=resolveRpgMission(state,mission.act===7 ? ending : 'protect');
      assert.equal(state.rpg.active,null);
      if(mission.act<7) assert.ok(state.districts[rpgMissions[mission.act+1].district].unlocked);
      assert.equal(state.skills.scavenging.level,1);
      assert.equal(state.skills.combat.level,1);
      state=normalizeSave(JSON.parse(JSON.stringify(state)));
    }
    assert.equal(mainChaptersCleared(state),8);
    assert.equal(state.rpg.ending,ending);
    assert.equal(state.inventory['rpg-afterimage-os'],1);
    assert.equal(getItem('rpg-afterimage-os').requiredLevel,1);
    assert.ok(state.rpg.level>5);
  });
}

test('field kit and chapter rewards cannot be claimed twice, and later chapters cannot be skipped',()=>{
  let state=fresh(); const inventory={...state.inventory};
  assert.equal(claimFieldKit(state),state); assert.deepEqual(state.inventory,inventory);
  assert.equal(startRpgMission(state,rpgMissions[7].id),state);
  state=startRpgMission(state,rpgMissions[0].id);
  assert.equal(resolveRpgMission(state,'protect'),state);
  state=fight(chooseMissionApproach(state,'assault'));
  assert.equal(resolveRpgMission(state,'invalid'),state);
  state=resolveRpgMission(state,'protect');
  const credits=state.resources.credits;
  assert.equal(resolveRpgMission(state,'protect'),state);
  assert.equal(startRpgMission(state,rpgMissions[0].id),state);
  assert.equal(state.resources.credits,credits);
});

test('lifepath and attribute checks have real effects but assault remains accessible',()=>{
  let state=startRpgMission(fresh(),rpgMissions[0].id);
  assert.equal(chooseMissionApproach(state,'ghost'),state);
  const direct=chooseMissionApproach(state,'assault');
  const connection=chooseMissionApproach(state,'lifepath');
  assert.equal(direct.rpg.active.enemyIndex,0); assert.equal(connection.rpg.active.enemyIndex,1);
  state=startRpgMission(fresh('corporateDefector'),rpgMissions[0].id);
  assert.equal(chooseMissionApproach(state,'lifepath'),state);
});

test('cover reduces charged damage, aim improves attacks, and quickhacks enforce RAM costs',()=>{
  const state=chooseMissionApproach(startRpgMission(fresh(),rpgMissions[0].id),'assault');
  state.rpg.active.turn=2;
  const covered=performTactic(state,'cover'), exposed=performTactic(state,'attack');
  assert.ok(covered.health.currentHp>exposed.health.currentHp);
  assert.equal(performTactic(state,'disrupt').health.currentHp,state.health.currentHp);
  state.rpg.active.ram=0;
  assert.equal(performTactic(state,'hack'),state);
  assert.ok(performTactic(state,'overclock').rpg.active.ram>=3);
  const aimed=performTactic(performTactic(state,'aim'),'attack');
  assert.ok(aimed.rpg.active.enemyHp<exposed.rpg.active.enemyHp || aimed.rpg.active.enemyIndex>0);
});

test('build respec refunds exactly, enforces perk prerequisites and cannot alter an active encounter',()=>{
  let state=fresh();
  assert.equal(buyRpgPerk(state,'synapse'),state);
  const original=cloneState(state);
  state=spendAttribute(spendAttribute(state,'intelligence'),'intelligence');
  state=buyRpgPerk(state,'ram-recycler');
  assert.ok(state.rpg.perks['ram-recycler']);
  assert.equal(buyRpgPerk(state,'ram-recycler'),state);
  state=respecRpg(state);
  assert.deepEqual(state.rpg.attributes,original.rpg.attributes);
  assert.equal(state.rpg.attributePoints,original.rpg.attributePoints);
  assert.equal(state.rpg.perkPoints,original.rpg.perkPoints);
  state=startRpgMission(state,'dead-drop');
  assert.equal(respecRpg(state),state); assert.equal(spendAttribute(state,'body'),state);
});

test('active encounters survive saves and offline time without free healing or enemy turns',()=>{
  let state=chooseMissionApproach(startRpgMission(fresh(),'dead-drop'),'assault');
  state=performTactic(state,'attack');
  const hp=state.health.currentHp, active=structuredClone(state.rpg.active);
  applyPassiveRecovery(state,3600000);
  assert.equal(state.health.currentHp,hp);
  state=normalizeSave(JSON.parse(JSON.stringify(state)));
  state=applyOfflineProgress(state,state.lastSavedAt+3600000);
  assert.equal(state.health.currentHp,hp); assert.deepEqual(state.rpg.active,active);
});

test('defeat offers a free fresh retry and switching to idle work clears the field mission',()=>{
  let state=chooseMissionApproach(startRpgMission(fresh(),'dead-drop'),'assault');
  state.health.currentHp=1;
  state=performTactic(state,'cover');
  assert.equal(state.rpg.active.phase,'failed');
  const credits=state.resources.credits;
  state=retryRpgMission(normalizeSave(JSON.parse(JSON.stringify(state))));
  assert.equal(state.rpg.active.phase,'briefing'); assert.equal(state.resources.credits,credits);
  assert.equal(state.health.currentHp,calculateMaxHP(state));
  state=startSkillAction(state,'scav-alley-scrap-run');
  assert.equal(state.rpg.active,null); assert.ok(state.activeAction);
});

test('local gigs replenish supplies and award half XP on repeat without resetting story choices',()=>{
  let state=fresh();
  for(let n=1;n<=2;n++) {
    state=fight(chooseMissionApproach(startRpgMission(state,rpgSideGigs[0].id),'assault'));
    state=resolveRpgMission(state,'extract');
    assert.equal(state.rpg.completed[rpgSideGigs[0].id].clears,n);
  }
  assert.equal(mainChaptersCleared(state),0); assert.ok(state.inventory['basic-med-injector']>=9);
  assert.ok(getItemSources('rpg-weapon-1',state).some(source=>source.name==='Dead Drop'));
});

test('old saves acquire the RPG profile without changing existing progress or gear',()=>{
  const old=createInitialState(); delete old.rpg; old.saveVersion=8;
  old.skills.combat.level=75; old.resources.credits=9000; old.equippedGear.weapon='street-knife';
  const state=normalizeSave(old);
  assert.equal(state.rpg.level,1); assert.equal(state.rpg.attributePoints,7);
  assert.equal(state.resources.credits,9000); assert.equal(state.skills.combat.level,75);
  assert.equal(state.equippedGear.weapon,'street-knife');
  const copy=cloneState(state); copy.rpg.attributes.body=10;
  assert.equal(state.rpg.attributes.body,3);
});

test('earlier community choices change later field support and the ending epilogue',()=>{
  const loyal=fresh(), corporate=fresh();
  for(const mission of rpgMissions.slice(0,3)) {
    loyal.rpg.completed[mission.id]={outcome:'protect',approach:'assault',clears:1};
    corporate.rpg.completed[mission.id]={outcome:'profit',approach:'assault',clears:1};
  }
  const supported=startRpgMission(loyal,rpgMissions[3].id), solo=startRpgMission(corporate,rpgMissions[3].id);
  assert.equal(supported.rpg.active.meds,solo.rpg.active.meds+1);
  assert.notEqual(campaignEpilogue(loyal),campaignEpilogue(corporate));
});

test('unknown mission data is dropped safely while the rest of a save is retained',()=>{
  const state=fresh(); state.resources.credits=4321;
  state.rpg.active={missionId:'removed-mission',phase:'combat'};
  const loaded=normalizeSave(state);
  assert.equal(loaded.rpg.active,null);
  assert.equal(loaded.resources.credits,4321);
  assert.equal(loaded.rpg.starterClaimed,true);
});

test('RPG entry, briefing, combat, decision and failure screens render without invalid values',()=>{
  const render=state=>renderToStaticMarkup(createElement(RpgHub,{state,onUpdate(){},onServices(){},onLoadout(){}}));
  let state=fresh();
  assert.match(render(state),/Dead Drop/);
  state=startRpgMission(state,'dead-drop'); assert.match(render(state),/Choose your way in/);
  state=chooseMissionApproach(state,'assault'); assert.match(render(state),/Short Circuit/);
  assert.match(render(state),/Charged|Direct shot/);
  assert.doesNotMatch(render(state),/NaN|undefined|Infinity/);
  const failed=cloneState(state); failed.rpg.active.phase='failed'; assert.match(render(failed),/Retry mission/);
  state=fight(state); assert.match(render(state),/Hide the courier/);
});
