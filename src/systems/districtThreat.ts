import { pushCategorizedLog } from "./gameState";
import { triggerDistrictEvent } from "./districtProgression";
import type { DistrictId, GameState } from "../types";

export function threatTier(level: number) {
  if (level >= 100) return "Lockdown";
  if (level >= 75) return "Hostile";
  if (level >= 50) return "Dangerous";
  if (level >= 25) return "Tense";
  return "Stable";
}

export function changeDistrictThreat(state: GameState, districtId: DistrictId, amount: number) {
  const threat = state.districtThreat[districtId];
  if (!threat) return;
  const beforeTier = threatTier(threat.level);
  threat.level = Math.max(0, Math.min(100, threat.level + amount));
  const afterTier = threatTier(threat.level);
  if (beforeTier !== afterTier) {
    pushCategorizedLog(state, afterTier === "Lockdown" ? "Warning" : "World", `${districtId} threat is now ${afterTier}.`);
    if (afterTier === "Lockdown") triggerDistrictEvent(state, "event-lockdown");
    if (districtId === "underpassMarket" && afterTier === "Hostile") triggerDistrictEvent(state, "event-price-surge");
    if (districtId === "blacknetQuarter" && (afterTier === "Hostile" || afterTier === "Lockdown")) triggerDistrictEvent(state, "event-trace-storm");
    if (districtId === "helixWard" && afterTier === "Stable") triggerDistrictEvent(state, "event-ripperdoc-window");
  }
}

export function districtThreatRewardBonus(state: GameState, districtId: DistrictId) {
  const level = state.districtThreat[districtId]?.level ?? 0;
  return level >= 75 ? 0.12 : level >= 50 ? 0.08 : level >= 25 ? 0.04 : 0;
}

export function districtThreatPenalty(state: GameState, districtId: DistrictId) {
  const level = state.districtThreat[districtId]?.level ?? 0;
  return level >= 100 ? 0.15 : level >= 75 ? 0.1 : level >= 50 ? 0.06 : level >= 25 ? 0.03 : 0;
}
