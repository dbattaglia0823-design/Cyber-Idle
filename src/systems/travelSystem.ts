import { cloneState, pushCategorizedLog } from "./gameState";
import type { DistrictId, GameState } from "../types";

export function travelToDistrict(state: GameState, districtId: DistrictId) {
  const district = state.districts[districtId];
  if (!district) return state;
  const next = cloneState(state);
  next.selectedDistrict = districtId;
  if (district.unlocked) next.lastVisitedDistrict = districtId;
  pushCategorizedLog(next, "World", `City map selected: ${districtId}.`);
  return next;
}
