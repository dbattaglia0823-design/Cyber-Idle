import { getDistrict } from "../data/cityMap";
import type { ActiveModifiers, DistrictId, GameState } from "../types";

export function getDistrictModifiers(state: GameState, districtId: DistrictId): Partial<ActiveModifiers> {
  const district = getDistrict(districtId);
  const threat = state.districtThreat[districtId]?.level ?? 0;
  const threatReward = threat >= 75 ? 0.12 : threat >= 50 ? 0.08 : threat >= 25 ? 0.04 : 0;
  return {
    skillRewards: (district?.modifiers?.skillRewards ?? 0) + threatReward,
    jobRewards: (district?.modifiers?.jobRewards ?? 0) + threatReward,
    heatGain: (district?.heatModifier ?? 0) + (threat >= 75 ? 0.08 : threat >= 50 ? 0.05 : 0),
    dropChance: (district?.modifiers?.dropChance ?? 0) + (threat >= 50 ? 0.04 : 0),
    shopPrices: (district?.modifiers?.shopPrices ?? 0) + (threat >= 75 ? 0.05 : 0),
  };
}
