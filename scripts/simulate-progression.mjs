import { simulateCampaign } from './balance/campaign-simulation.mjs';
import fs from 'node:fs';
const results = [];
for (const style of ['story', 'balanced', 'gatherer'])
    for (const approach of ['assault', 'netrunner', 'ghost']) {
        const r = simulateCampaign({ style, approach });
        results.push(r);
        console.log(JSON.stringify(r));
    }
if (process.argv[2])
    fs.writeFileSync(process.argv[2], JSON.stringify(results, null, 2));
