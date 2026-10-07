import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { createInitialState, chooseStartingPath, cloneState } from '../src/systems/gameState.ts';
import { claimFieldKit, startRpgMission, chooseMissionApproach, performTactic, tacticalStats, resolveRpgMission, enemyIntent, canUseTactic } from '../src/systems/rpgSystem.ts';
import { calculateMaxHP } from '../src/systems/healthSystem.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { applyOfflineProgress } from '../src/systems/offlineProgress.ts';
import { rpgMissions, rpgSideGigs } from '../src/data/rpgCampaign.ts';
import { encounterTraits } from '../src/systems/tacticalTraits.ts';
import { districtEncounterProfiles } from '../src/data/tacticalTraits.ts';
import { prepareMainJob } from './main-job-fixture.mjs';
import { CampaignFinale } from '../src/screens/Missions/CampaignFinale.tsx';
function combat(act, keepPerks = false) {
 let s=claimFieldKit(chooseStartingPath(createInitialState(),'streetborn'));
 for(const m of rpgMissions.slice(0,act))s.rpg.completed[m.id]={outcome:'protect',approach:'assault',clears:1};
 for(const m of rpgMissions.slice(0,act+1))s.districts[m.district].unlocked=true;
 s=prepareMainJob(s,rpgMissions[act]);if (!keepPerks) s.rpg.perks={};
 return chooseMissionApproach(startRpgMission(s,rpgMissions[act].id),'assault');
}
test('Rust Yards plating reduces ordinary shots; aim and quickhacks bypass plating',()=>{
 const s=combat(1),base=tacticalStats(s).damage;
 const normal=performTactic(s,'attack');
 assert.equal(s.rpg.active.enemyHp-normal.rpg.active.enemyHp,Math.round(base*1.15*.82));
 const aimed=cloneState(s);aimed.rpg.active.aimed=true;
 const result=performTactic(aimed,'attack');
 assert.equal(aimed.rpg.active.enemyHp-result.rpg.active.enemyHp,Math.round(base*1.15*1.8));
 assert.doesNotMatch(performTactic(s,'hack').rpg.active.log.join(' '),/Plating reduced/);
});
test('bleed applies on special attacks, is blocked by cover, ticks twice and is cured by injectors',()=>{
 const s=combat(2);s.rpg.active.turn=2;
 const hit=performTactic(s,'attack');assert.equal(hit.rpg.active.playerBleedTurns,2);
 const cover=performTactic(s,'cover');assert.equal(cover.rpg.active.playerBleedTurns??0,0);
 const cured=performTactic(hit,'heal');assert.equal(cured.rpg.active.playerBleedTurns,0);
 const tick=performTactic(hit,'cover');assert.equal(tick.rpg.active.playerBleedTurns,1);assert.match(tick.rpg.active.log.join(' '),/Bleeding:.*damage/);
});
test('RAM disruption has a readable counter and cannot make RAM negative',()=>{
 const s=combat(3);s.rpg.active.turn=2;s.rpg.active.ram=1;
 const hit=performTactic(s,'attack'),cover=performTactic(s,'cover');
 assert.ok(hit.rpg.active.ram>=0);assert.equal(cover.rpg.active.ram-hit.rpg.active.ram,1);
 assert.match(hit.rpg.active.log.join(' '),/drained 1 RAM/);
});
test('Helix repairs are suppressed by both an interrupt and active Overheat',()=>{
 const s=combat(4);s.rpg.active.enemyHp-=100;
 const repaired=performTactic(s,'cover');assert.ok(repaired.rpg.active.enemyHp>s.rpg.active.enemyHp);
 const interrupted=performTactic(s,'disrupt');assert.match(interrupted.rpg.active.log.join(' '),/Repair system suppressed/);
 const burning=cloneState(s);burning.rpg.active.burnTurns=1;burning.rpg.active.burnDamage=1;
 const result=performTactic(burning,'cover');assert.equal(result.rpg.active.enemyHp,burning.rpg.active.enemyHp-1);
});
test('Glassline shields cycle predictably and do not reduce quickhack payloads',()=>{
 const s=combat(5);const t=tacticalStats(s);
 const shielded=performTactic(s,'attack');assert.equal(s.rpg.active.enemyHp-shielded.rpg.active.enemyHp,Math.round(t.damage*1.15*.65));
 s.rpg.active.turn=2;const open=performTactic(s,'attack');assert.equal(s.rpg.active.enemyHp-open.rpg.active.enemyHp,Math.round(t.damage*1.15));
 s.rpg.active.turn=0;assert.doesNotMatch(performTactic(s,'hack').rpg.active.log.join(' '),/Shield absorbed/);
});
test('Redline bosses telegraph consecutive bursts; Skyline rotates previously taught counters',()=>{
 const red=combat(6);red.rpg.active.enemyIndex=3;
 for(const turn of [1,2]){red.rpg.active.turn=turn;assert.equal(enemyIntent(red),'Charged burst');}
 red.rpg.active.turn=0;assert.equal(enemyIntent(red),'Recovery shot');
 const phases=[0,1,2].map(turn=>encounterTraits(rpgMissions[7],3,turn));
 assert.deepEqual(phases.map(p=>p.traits),[['armor','shield'],['ramDrain','regeneration'],['bleed','aggression']]);
 for(const mission of rpgMissions.slice(1,7)) assert.ok(districtEncounterProfiles[mission.district].patrols[0].traits.every(trait=>districtEncounterProfiles[mission.district].boss.traits.includes(trait)));
});
test('old saves default new statuses safely; ongoing bleed survives reload and does not tick offline',()=>{
 const s=combat(2);delete s.rpg.active.playerBleedTurns;delete s.rpg.active.playerBleedDamage;
 const old=normalizeSave(JSON.parse(JSON.stringify(s)));assert.equal(old.rpg.active.playerBleedTurns,0);
 s.rpg.active.playerBleedTurns=2;s.rpg.active.playerBleedDamage=7;
 const loaded=normalizeSave(JSON.parse(JSON.stringify(s)));const hp=loaded.health.currentHp;
 const offline=applyOfflineProgress(loaded,loaded.lastSavedAt+60000);
 assert.equal(offline.rpg.active.playerBleedTurns,2);assert.equal(offline.rpg.active.playerBleedDamage,7);assert.equal(offline.health.currentHp,hp);
 s.rpg.active.playerBleedTurns=Infinity;s.rpg.active.playerBleedDamage=-50;
 const invalid=normalizeSave(s);assert.equal(invalid.rpg.active.playerBleedTurns,0);assert.equal(invalid.rpg.active.playerBleedDamage,0);
});
test('all three finale outcomes have a distinct, recorded presentation without duplicate payouts',()=>{
 for(const ending of ['free','own','erase']) {
  const before=combat(7);before.rpg.active.phase='decision';before.rpg.active.enemyIndex=4;
  const after=resolveRpgMission(before,ending,()=>1);assert.equal(after.rpg.ending,ending);
  const html=render(createElement(CampaignFinale,{state:after}));assert.match(html,/CAMPAIGN COMPLETE/);assert.ok(html.includes("8 / 8"));assert.match(html,/Your decisions across the city/);
  assert.equal(resolveRpgMission(after,ending),after);
 }
});
for(const m of rpgMissions) test(m.district+' remains completable with its own stage equipment against the new traits',()=>{
 let s=combat(m.act,true),turns=0;
 while(s.rpg.active.phase==='combat'&&turns++<200){let action='attack';const e=s.rpg.active,traits=encounterTraits(m,e.enemyIndex,e.turn);
 if(traits.armor&&!e.aimed)action='aim';
 if((traits.shield||traits.regeneration)&&canUseTactic(s,'hack'))action='hack';
 if(enemyIntent(s)==='Charged burst'&&canUseTactic(s,'disrupt'))action='disrupt';
 if(s.health.currentHp<calculateMaxHP(s)*.5&&canUseTactic(s,'heal'))action='heal';
 s=performTactic(s,action);}
 assert.equal(s.rpg.active.phase,'decision',m.title+': '+s.rpg.active.log.join(' / '));
});

test('status edge cases preserve Finisher, allow bleed treatment at full HP, and reset between opponents',()=>{
 let s=combat(2);s.rpg.active.playerBleedTurns=2;s.rpg.active.playerBleedDamage=5;s.health.currentHp=calculateMaxHP(s);
 assert.equal(canUseTactic(s,'heal'),true);const healed=performTactic(s,'heal');assert.equal(healed.rpg.active.playerBleedTurns,0);
 s.rpg.active.enemyHp=1;const cleared=performTactic(s,'attack');assert.equal(cleared.rpg.active.playerBleedTurns,0);assert.equal(cleared.rpg.active.playerBleedDamage,0);
 const armored=combat(1);armored.rpg.perks.finisher=true;armored.rpg.active.enemyHp=20;assert.equal(performTactic(armored,'attack').rpg.active.enemyIndex,1);
 const lethal=combat(2);lethal.health.currentHp=1;lethal.rpg.active.playerBleedTurns=1;lethal.rpg.active.playerBleedDamage=2;const dead=performTactic(lethal,'cover');assert.equal(dead.rpg.active.phase,'failed');assert.equal(dead.health.currentHp,0);assert.doesNotMatch(dead.rpg.active.log.at(-2),/Counterattack interrupted/);
 const open=encounterTraits(rpgMissions[1],3,0),sealed=encounterTraits(rpgMissions[1],3,2);assert.ok(sealed.armor>open.armor);assert.notEqual(sealed.phase,open.phase);
});
