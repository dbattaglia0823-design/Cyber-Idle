import { mainJobBalance } from "../../data/mainJobBalance";
import { rpgMissions } from "../../data/rpgCampaign";
import type { GameState } from "../../types";
export type JourneyStep = "kit" | "attributes" | "equipment" | "prepare" | "mission" | "briefing" | "combat" | "decision" | "failed" | "complete";
// A presentation selector only. Guidance never adds a gate or modifies a save.
export function playerJourneyStep(state: GameState): JourneyStep {
  if (state.rpg.active) return state.rpg.active.phase;
  if (!state.rpg.starterClaimed) return "kit";
  if (rpgMissions.every(mission => state.rpg.completed[mission.id])) return "complete";
  const firstJob = !state.rpg.completed[rpgMissions[0].id];
  if (firstJob && state.rpg.attributePoints > 0 && Object.values(state.rpg.attributes).every(value => value === 3)) return "attributes";
  if (!state.equippedGear.weapon || !state.equippedGear.chest) return "equipment";
  if (firstJob && state.equippedGear.weapon === "rpg-weapon-0" && (state.upgradeLevels["rpg-weapon-0"] ?? 0) < 2) return (state.inventory[mainJobBalance.neonRow.weapon] ?? 0) > 0 ? "equipment" : "prepare";
  return "mission";
}
