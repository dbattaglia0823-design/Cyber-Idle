import { factionRank } from "./modifiers";
import { pushCategorizedLog } from "./gameState";
import { triggerUnlockEventForDistrict } from "./districtProgression";
import type { GameState } from "../types";

export function updateWorldUnlocks(state: GameState) {
  unlockDistrict(
    state,
    "rustYards",
    state.skills.scavenging.level >= 10 ||
      factionRank(state.factions.chromeJackals.reputation) >= 2 ||
      Boolean(state.operationLogs["op-backstreet-sweep"]?.firstClear),
  );
  unlockDistrict(
    state,
    "underpassMarket",
    state.skills.streetcraft.level >= 12 ||
      factionRank(state.factions.ghostMarket.reputation) >= 2 ||
      (state.fixerTrust["sable-quinn-fixer"]?.completedJobs ?? 0) >= 3,
  );
  unlockDistrict(
    state,
    "blacknetQuarter",
    state.skills.hacking.level >= 18 ||
      factionRank(state.factions.nullChoir.reputation) >= 2 ||
      (state.inventory["blacknet-cipher"] ?? 0) > 0,
  );
  unlockDistrict(
    state,
    "glasslineDistrict",
    state.skills.hacking.level >= 30 ||
      (state.startingPath === "corporateDefector" && (state.inventory["corporate-access-token"] ?? 0) > 0),
  );
  unlockDistrict(
    state,
    "helixWard",
    state.skills.cyberware.level >= 24 ||
      factionRank(state.factions.helixOrder.reputation) >= 2 ||
      (state.inventory["medical-access-pass"] ?? 0) > 0,
  );
  unlockDistrict(
    state,
    "redlineBlocks",
    state.skills.combat.level >= 28 ||
      factionRank(state.factions.redlineSaints.reputation) >= 2 ||
      (state.inventory["bounty-token"] ?? 0) > 0,
  );
  unlockDistrict(
    state,
    "skylineCore",
    state.skills.combat.level >= 50 ||
      Boolean(state.operationLogs["op-corporate-extraction"]?.firstClear),
  );

  if (factionRank(state.factions.nullChoir.reputation) >= 2) unlockCompanion(state, "nyra-vale");
  if (factionRank(state.factions.chromeJackals.reputation) >= 2) unlockCompanion(state, "dex-riven");
  if (state.skills.combat.level >= 5 || factionRank(state.factions.redlineSaints.reputation) >= 2) unlockCompanion(state, "mara-voss");
  if (factionRank(state.factions.helixOrder.reputation) >= 2) unlockCompanion(state, "iris-kade");
}

function unlockDistrict(state: GameState, id: keyof GameState["districts"], condition: boolean) {
  const district = state.districts[id];
  if (!district || district.unlocked || !condition) return;
  district.unlocked = true;
  district.unlockProgress = 100;
  pushCategorizedLog(state, "World", `District unlocked: ${id}.`);
  triggerUnlockEventForDistrict(state, id);
}

function unlockCompanion(state: GameState, id: string) {
  const companion = state.companions[id];
  if (!companion || companion.unlocked) return;
  companion.unlocked = true;
  companion.relationship = Math.max(1, companion.relationship);
  pushCategorizedLog(state, "World", `Companion contact unlocked: ${id}.`);
}
