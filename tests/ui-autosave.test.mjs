import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProgressionGuide } from '../src/components/ProgressionGuide.tsx';
import App from '../src/App.tsx';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { updateWorldUnlocks } from '../src/systems/worldUnlocks.ts';
import { startAutoSave } from '../src/systems/autoSave.ts';
import { saveGame, loadGame } from '../src/systems/saveSystem.ts';

function memoryStorage() {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
}

test('autosave uses the latest state and slot, persists on hide, and cleans up listeners', () => {
  globalThis.localStorage = memoryStorage();
  const windowEvents = new Map(), documentEvents = new Map();
  let callback, cleared = false;
  globalThis.window = {
    setInterval: (fn, delay) => { assert.equal(delay, 5000); callback = fn; return 7; },
    clearInterval: id => { assert.equal(id, 7); cleared = true; },
    addEventListener: (key, fn) => windowEvents.set(key, fn), removeEventListener: key => windowEvents.delete(key),
  };
  globalThis.document = {
    visibilityState: 'visible', addEventListener: (key, fn) => documentEvents.set(key, fn), removeEventListener: key => documentEvents.delete(key),
  };
  let current = { state: createInitialState(), slot: 1 };
  const stop = startAutoSave(() => current);
  for (let i = 0; i < 25; i++) current = { state: { ...current.state, resources: { ...current.state.resources, credits: i } }, slot: 2 };
  callback();
  assert.equal(loadGame(2).resources.credits, 24);
  assert.equal(loadGame(1), null);
  current.state.resources.credits = 99;
  document.visibilityState = 'hidden'; documentEvents.get('visibilitychange')();
  assert.equal(loadGame(2).resources.credits, 99);
  current.state.resources.credits = 100;
  windowEvents.get('pagehide')();
  assert.equal(loadGame(2).resources.credits, 100);
  stop();
  assert.ok(cleared); assert.equal(windowEvents.size, 0); assert.equal(documentEvents.size, 0);
});

test('progression dashboard renders useful guidance at every district tier', () => {
  for (const level of [1, 20, 40, 60, 80, 100, 120, 140, 150]) {
    const state = createInitialState();
    for (const skill of Object.values(state.skills)) skill.level = level;
    updateWorldUnlocks(state);
    const html = renderToStaticMarkup(createElement(ProgressionGuide, { state, onStartSkill() {}, onCraft() {}, onOpenDistrict() {} }));
    assert.match(html, /Guaranteed/); assert.match(html, /aria-label="District progression"/);
    assert.match(html, /0\/8/); assert.doesNotMatch(html, /NaN|undefined|Infinity/);
    assert.equal((html.match(/runner-route-node/g) ?? []).length, 8);
  }
});

test('new game and saved character render through the actual application entry point', () => {
  globalThis.localStorage = memoryStorage();
  const fresh = renderToStaticMarkup(createElement(App));
  assert.match(fresh, /Streetborn/);
  saveGame(chooseStartingPath(createInitialState(), 'streetborn'), 1);
  const playing = renderToStaticMarkup(createElement(App));
  assert.match(playing, /Afterimage RPG/);
  assert.match(playing, /Claim field kit/);
  assert.doesNotMatch(playing, /NaN|undefined/);
});
