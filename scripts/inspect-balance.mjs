import { rpgMissions, rpgSideGigs } from '../src/data/rpgCampaign.ts';
import { missionRewardPools, missionItemRewards } from '../src/data/missionRewards.ts';
for (const mission of rpgMissions) {
  const gig = rpgSideGigs.find(entry => entry.district === mission.district);
  console.log(JSON.stringify({ district: mission.district, mainJob: mission.title, mainCredits: mission.reward, localCredits: gig.reward, mainItems: missionItemRewards(mission), lootRotationClears: Math.ceil(missionRewardPools[mission.district].length / 3) }));
}
