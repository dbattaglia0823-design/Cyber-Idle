import { simulateCampaign } from './balance/campaign-simulation.mjs';
import { performance } from 'node:perf_hooks';
// Deterministic material-ledger audit, assuming four seconds per tactical choice.
// This is a reproducible progression estimate, not measured human or iPhone performance.
const started=performance.now();
for(const approach of ['assault','netrunner','ghost']){
  const result=simulateCampaign({approach,maxChapters:1});
  console.log(JSON.stringify({approach,completed:result.completed,minutes:Math.round(result.totalHours*60),gigs:result.gigs,cycles:result.cycles,minHp:result.rows[0]?.minHp,error:result.error}));
  if(result.completed!==1||result.totalHours>1)process.exitCode=1;
}
console.log(`Audit runtime: ${Math.round(performance.now()-started)} ms`);
