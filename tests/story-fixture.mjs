import { rpgMissions } from '../src/data/rpgCampaign.ts';
import { districtLevelBands } from '../src/data/levelBands.ts';
import { updateWorldUnlocks } from '../src/systems/worldUnlocks.ts';
// Stage combat/crafting fixtures after the main jobs that open that content band.
export function openStoryThroughSkillBand(state, level = Math.max(...Object.values(state.skills).map(s => s.level))) {
  for (let i = 1; i < rpgMissions.length; i++) if (districtLevelBands[rpgMissions[i].district].entryLevel <= level) {
    state.rpg.completed[rpgMissions[i - 1].id] = { outcome: 'protect', approach: 'assault', clears: 1 };
  }
  updateWorldUnlocks(state);
}
