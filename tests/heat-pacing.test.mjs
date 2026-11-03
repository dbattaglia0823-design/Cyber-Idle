import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/systems/gameState.ts';
import { calculateActionHeatGain, calculateHeatGain } from '../src/systems/balanceFormulas.ts';
import { applyRiskEvents } from '../src/systems/riskEvents.ts';
import { startSkillAction, processActionCompletion } from '../src/systems/actionProcessing.ts';
import { applyOfflineProgress } from '../src/systems/offlineProgress.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';

test('repeatable Heat depends on elapsed time, preserving fractional gains and cooling', () => {
 const state = createInitialState();
 const fast = calculateActionHeatGain(state, 1, 1500);
 const slow = calculateActionHeatGain(state, 1, 6000);
 assert.ok(Math.abs(fast * 4 - slow) < 1e-10);
 assert.ok(fast > 0 && fast < 0.1);
 assert.equal(calculateActionHeatGain(state, -1, 1500), calculateHeatGain(state, -1));
 assert.equal(calculateActionHeatGain(state, 1, 0), 0);
 state.resources.heat = fast;
 applyRiskEvents(state);
 assert.equal(state.resources.heat, fast);
 assert.equal(normalizeSave(JSON.parse(JSON.stringify(state))).resources.heat, fast);
 state.resources.heat = 100; state.resources.credits = 100;
 applyRiskEvents(state);
 assert.equal(state.resources.heat, 80);
 assert.equal(state.resources.credits, 50);
});

test('terminal hacking can idle for thirty minutes online and offline, even with every trace triggered', () => {
 const random = Math.random;
 Math.random = () => 0;
 try {
  const start = 100000;
  let online = startSkillAction(createInitialState(), 'hack-public-terminal', start);
  assert.ok(online.activeAction);
  online.lastSavedAt = start;
  const initial = structuredClone(online);
  for (let t = start + 1000; t <= start + 1800000; t += 1000) online = processActionCompletion(online, t);
  const offline = applyOfflineProgress(initial, start + 1800000);
  assert.ok(online.resources.heat > 0 && online.resources.heat < 75, `Heat ${online.resources.heat}`);
  assert.ok(online.activeAction);
  assert.ok(Math.abs(online.resources.heat - offline.resources.heat) < 1e-8);
  assert.equal(online.marketStatistics.traceEvents, offline.marketStatistics.traceEvents);
 } finally { Math.random = random; }
});

test('Sim Cache retains fractional Heat instead of rounding every loop to zero', async () => {
 const { runBasicSimCache } = await import('../src/systems/simCacheEngine.ts');
 const { simCacheTypes } = await import('../src/data/simCache.ts');
 let state = startSkillAction(createInitialState(), 'hack-public-terminal', 100000);
 state.manualDiscovery.skillActions['hack-public-terminal'] = true;
 state.inventory[simCacheTypes[0].itemId] = 1;
 const result = runBasicSimCache(state, 1);
 assert.ok(result.simulationRecap.completions > 0);
 assert.ok(result.resources.heat > 0 && result.resources.heat < 25);
 assert.ok(Math.abs(result.resources.heat - result.simulationRecap.heatChange) < 1e-8);
});
