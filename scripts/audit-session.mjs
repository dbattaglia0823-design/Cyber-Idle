import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { startSkillAction } from '../src/systems/actionProcessing.ts';
import { applyOfflineProgress, OFFLINE_CAP_MS } from '../src/systems/offlineProgress.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
for(const path of ['streetborn','outrider','corporateDefector']){
 const state=startSkillAction(chooseStartingPath(createInitialState(1000),path),'scav-alley-scrap-run',1000);
 const start=performance.now();const next=applyOfflineProgress(state,1000+OFFLINE_CAP_MS);
 const offlineMs=performance.now()-start;
 assert.ok(next.recentLog.length<=50);
 const repeated=applyOfflineProgress(next,1000+OFFLINE_CAP_MS);
 assert.deepEqual(repeated.inventory,next.inventory);assert.deepEqual(repeated.resources,next.resources);
 const roundTrip=performance.now();for(let n=0;n<100;n++)normalizeSave(JSON.parse(JSON.stringify(next)));
 console.log(JSON.stringify({path,offlineHours:12,offlineMs:Math.round(offlineMs),saveRoundTripAverageMs:+((performance.now()-roundTrip)/100).toFixed(2),saveBytes:Buffer.byteLength(JSON.stringify(next)),logEntries:next.recentLog.length,completions:next.offlineRecap?.completions}));
}
