import { districtEvents } from "../data/districtEvents";
import { vendors } from "../data/vendors";
import { pushCategorizedLog } from "./gameState";
import { getActiveModifiers } from "./modifiers";
import type { DistrictId, GameState } from "../types";

export function changeLocalStanding(state: GameState, districtId: DistrictId, amount: number, reason: string) {
  const current = state.districtStanding[districtId] ?? { standing: 0 };
  const before = current.standing;
  const adjusted = amount > 0 ? Math.round(amount * (1 + getActiveModifiers(state).localStandingGain)) : amount;
  const after = Math.max(0, Math.min(100, before + adjusted));
  state.districtStanding[districtId] = { standing: after };
  if (after !== before && Math.abs(amount) >= 2) {
    pushCategorizedLog(state, "World", `${districtName(districtId)} Local Standing ${adjusted > 0 ? "+" : ""}${adjusted}: ${reason}.`);
  }
}

export function discoverDistrictContent(state: GameState, districtId: DistrictId, key: string) {
  state.districtDiscoveries[districtId] = { ...(state.districtDiscoveries[districtId] ?? {}), [key]: true };
}

export function discoverDistrictVendor(state: GameState, vendorId: string) {
  const vendor = vendors.find((entry) => entry.id === vendorId);
  if (!vendor) return;
  const current = state.vendors[vendorId] ?? { discovered: false, purchases: {} };
  state.vendors[vendorId] = { ...current, discovered: true };
  discoverDistrictContent(state, vendor.districtId, `vendor:${vendorId}`);
}

export function triggerDistrictEvent(state: GameState, eventId: string) {
  if (state.districtEvents[eventId]) return;
  const event = districtEvents.find((entry) => entry.id === eventId);
  if (!event) return;
  state.districtEvents[eventId] = true;
  discoverDistrictContent(state, event.districtId, `event:${eventId}`);
  pushCategorizedLog(state, event.logCategory, `${event.name}: ${event.description}`);
}

export function triggerUnlockEventForDistrict(state: GameState, districtId: DistrictId) {
  const event = districtEvents.find((entry) => entry.districtId === districtId && entry.trigger === "District unlock");
  if (event) triggerDistrictEvent(state, event.id);
}

function districtName(districtId: DistrictId) {
  return districtId.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
