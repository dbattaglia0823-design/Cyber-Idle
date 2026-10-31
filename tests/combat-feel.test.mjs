import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { CombatScene } from '../src/components/CombatScene.tsx';
import { beginRunner, startRpgMission, chooseMissionApproach, performTactic } from '../src/systems/rpgSystem.ts';
import { createInitialState } from '../src/systems/gameState.ts';
import { TacticalEncounter } from '../src/screens/Missions/TacticalEncounter.tsx';
import { rpgMissions } from '../src/data/rpgCampaign.ts';

test('visual feedback distinguishes weapon, hack, defense and healing without inventing damage', () => {
  const base = { id:'turn', action:'attack', damage:20, taken:4, blocked:2, healing:0, interrupted:false };
  const shot = render(createElement(CombatScene,{target:'Patrol',pulse:base}));
  assert.match(shot,/scene-projectile/); assert.match(shot,/−20/); assert.match(shot,/−4/);
  const hack = render(createElement(CombatScene,{target:'Patrol',pulse:{...base,action:'quickhack:reboot-optics',interrupted:true}}));
  assert.match(hack,/scene-hack/); assert.match(hack,/Counter interrupted/);
  const cover = render(createElement(CombatScene,{target:'Patrol',pulse:{...base,action:'cover',damage:0,taken:0}}));
  assert.match(cover,/scene-shield/); assert.doesNotMatch(cover,/scene-projectile|scene-outgoing|scene-incoming/);
  const heal = render(createElement(CombatScene,{target:'Patrol',pulse:{...base,action:'heal',damage:0,healing:12}}));
  assert.match(heal,/scene-heal-ring/); assert.match(heal,/\+12/);
  const melee = render(createElement(CombatScene,{target:'Patrol',pulse:base,melee:true}));
  assert.match(melee,/scene-melee/);
});

test('a lethal turn identifies the defeated target rather than hitting the next enemy', () => {
  let state = chooseMissionApproach(startRpgMission(beginRunner(createInitialState(),'streetborn'),'dead-drop'),'assault');
  const target = rpgMissions[0].enemies[0];
  state.rpg.active.enemyHp = 1;
  const next = performTactic(state,'attack');
  assert.equal(next.rpg.active.feedback.target,target);
  assert.equal(next.rpg.active.feedback.defeated,true);
  assert.equal(next.rpg.active.enemyIndex,1);
  const html = render(createElement(TacticalEncounter,{state:next,mission:rpgMissions[0],onUpdate(){}}));
  assert.match(html,/NEUTRALIZED/);
  assert.doesNotMatch(html,/portrait-impact/);
  assert.equal(state.rpg.active.enemyIndex,0);
});

test('final kill and ordinary strikes retain accurate combat feedback', () => {
  let state = chooseMissionApproach(startRpgMission(beginRunner(createInitialState(),'streetborn'),'dead-drop'),'assault');
  let next = performTactic(state,'attack');
  assert.equal(next.rpg.active.feedback.defeated,false);
  assert.match(render(createElement(TacticalEncounter,{state:next,mission:rpgMissions[0],onUpdate(){}})),/portrait-impact/);
  next.rpg.active.enemyIndex = rpgMissions[0].enemies.length-1;
  next.rpg.active.enemyHp = 1;
  next = performTactic(next,'attack');
  assert.equal(next.rpg.active.phase,'decision');
  assert.equal(next.rpg.active.feedback.defeated,true);
  assert.equal(next.rpg.active.feedback.target,rpgMissions[0].enemies.at(-1));
});
