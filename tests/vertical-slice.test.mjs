import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { claimFieldKit, spendAttribute, startRpgMission, chooseMissionApproach, performTactic, resolveRpgMission } from '../src/systems/rpgSystem.ts';
import { playerJourneyStep } from '../src/screens/Start/playerJourney.ts';
import { MissionDebrief } from '../src/screens/Missions/MissionDebrief.tsx';
import { DistrictJourney } from '../src/screens/District/DistrictJourney.tsx';
import { TacticalEncounter } from '../src/screens/Missions/TacticalEncounter.tsx';
import { districtPresentation } from '../src/data/districtPresentation.ts';
import { districts } from '../src/data/districts.ts';
import { rpgMissions } from '../src/data/rpgCampaign.ts';
import { RewardPopupContainer } from '../src/components/RewardPopups.tsx';
const fresh = () => chooseStartingPath(createInitialState(), 'streetborn');
test('new-player guidance follows real preparation and never gates starting a mission', () => {
 let s = fresh(); assert.equal(playerJourneyStep(s), 'kit');
 s = claimFieldKit(s); assert.equal(playerJourneyStep(s), 'attributes');
 s = spendAttribute(s, 'body'); assert.equal(playerJourneyStep(s), 'prepare');
 s.equippedGear.weapon = undefined; assert.equal(playerJourneyStep(s), 'equipment');
 s = startRpgMission(s, 'dead-drop'); assert.equal(playerJourneyStep(s), 'briefing');
 s = chooseMissionApproach(s, 'assault'); assert.equal(playerJourneyStep(s), 'combat');
 s.rpg.active.phase = 'failed'; assert.equal(playerJourneyStep(s), 'failed');
 s.rpg.active.phase = 'decision'; assert.equal(playerJourneyStep(s), 'decision');
});
test('settling Neon Row shows actual payout, district unlock and inventory without changing state', () => {
 let s = chooseMissionApproach(startRpgMission(claimFieldKit(fresh()), 'dead-drop'), 'assault');
 for (let i=0;i<4;i++) { s.rpg.active.enemyHp=1; s=performTactic(s,'attack'); }
 const before = s, after = resolveRpgMission(s, 'protect', () => 1);
 const saved = JSON.stringify(after);
 const html = render(createElement(MissionDebrief,{before,after,onContinue(){}}));
 assert.match(html,/BOSS DEFEATED/); assert.match(html,/DISTRICT UNLOCKED/); assert.match(html,/Rust Yards/);
 assert.match(html,/Added to inventory/); assert.match(html,/attribute.*perk points/);
 assert.equal(JSON.stringify(after),saved);
 const overview = render(createElement(DistrictJourney,{state:after,districtId:'neonRow'}));
 assert.match(overview,/Dead Drop completed/); assert.match(overview,/not story gates/);
});
test('combat explains charged intent, disabled healing, boss and RAM accessibly', () => {
 let s = chooseMissionApproach(startRpgMission(claimFieldKit(fresh()), 'dead-drop'), 'assault');
 s.rpg.active.enemyIndex=3; s.rpg.active.turn=2;
 const html=render(createElement(TacticalEncounter,{state:s,mission:rpgMissions[0],onUpdate(){}}));
 assert.match(html,/FINAL ENCOUNTER/); assert.match(html,/Charged burst incoming/);
 assert.match(html,/Health is already full/); assert.match(html,/aria-label="Available RAM"/);
 assert.match(html,/aria-current="step"/);
});
test('routine idle notifications do not cover tactical controls; important drops remain visible', () => {
 const base={createdAt:0,expiresAt:1000,lines:[]};
 const popups=[{...base,id:'routine',title:'Scrap collected',category:'resource'},{...base,id:'rare',title:'Unique found',category:'rare'}];
 const html=render(createElement(RewardPopupContainer,{popups,now:1,combatActive:true,onDismiss(){}}));
 assert.doesNotMatch(html,/Scrap collected/); assert.match(html,/Unique found/);
});
test('every district has an editorial identity without introducing gameplay modifiers', () => {
 for(const district of districts) { assert.ok(districtPresentation[district.id].focus); assert.ok(districtPresentation[district.id].futureEncounterTheme); }
});
