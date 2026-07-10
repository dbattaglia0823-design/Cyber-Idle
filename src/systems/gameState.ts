import { companions } from "../data/companions";
import { districtEvents } from "../data/districtEvents";
import { districts } from "../data/districts";
import { factions } from "../data/factions";
import { startingResources } from "../data/resources";
import { districts as districtData } from "../data/districts";
import { vendors } from "../data/vendors";
import type { DistrictId, FactionId, GameState, GameLogEntry, LogCategory, StartingPathId } from "../types";

export const SAVE_VERSION = 7;

export function createInitialState(now = Date.now()): GameState {
  return {
    saveVersion: SAVE_VERSION,
    startingPath: null,
    resources: { ...startingResources },
    neuralInstability: 0,
    skills: {
      scavenging: { level: 1, xp: 0 },
      hacking: { level: 1, xp: 0 },
      cyberware: { level: 1, xp: 0 },
      combat: { level: 1, xp: 0 },
    },
    actionMastery: {},
    inventory: {},
    activeAction: null,
    activeJob: null,
    activeCraft: null,
    activeOperation: null,
    currentCombat: null,
    enemyLog: {},
    unlocks: {},
    districts: Object.fromEntries(
      districts.map((district) => [
        district.id,
        { unlocked: district.id === "neonRow", unlockProgress: district.id === "neonRow" ? 100 : 0 },
      ]),
    ) as Record<DistrictId, { unlocked: boolean; unlockProgress: number }>,
    factions: Object.fromEntries(
      factions.map((faction) => [faction.id, { reputation: 0, hostility: 0, affiliated: false }]),
    ) as Record<FactionId, { reputation: number; hostility: number; affiliated: boolean }>,
    fixerTrust: {},
    ownedHousing: {},
    activeResidence: null,
    companions: Object.fromEntries(
      companions.map((companion) => [
        companion.id,
        { unlocked: companion.id === "sable-quinn", relationship: companion.id === "sable-quinn" ? 1 : 0 },
      ]),
    ),
    activeCompanion: "sable-quinn",
    worldUnlocks: {},
    equippedGear: {},
    equippedCyberware: {},
    upgradeLevels: {},
    unlockedBlueprints: {},
    discoveredItems: {},
    manualDiscovery: { skillActions: {}, recipes: {}, enemies: {}, jobs: {}, bosses: {} },
    masteryPool: {
      scavenging: { xp: 0, spent: 0 },
      hacking: { xp: 0, spent: 0 },
      cyberware: { xp: 0, spent: 0 },
      combat: { xp: 0, spent: 0 },
    },
    claimedTierRewards: {},
    simulationEfficiency: {},
    simulationRecap: null,
    operationLogs: {},
    bossLogs: {},
    operationRecap: null,
    ownedVehicles: {},
    activeVehicle: null,
    vehicleUpgradeLevels: {},
    districtThreat: Object.fromEntries(
      districtData.map((district) => [district.id, { level: 10, controllingForce: district.associatedFactions[0] ?? "Local crews" }]),
    ) as GameState["districtThreat"],
    achievements: {},
    perkPointsEarned: 0,
    perkRanks: {},
    specializationMilestones: {},
    respecCount: 0,
    signatureBuildCache: null,
    selectedDistrict: "neonRow",
    lastVisitedDistrict: "neonRow",
    districtDiscoveries: Object.fromEntries(districtData.map((district) => [district.id, {}])) as GameState["districtDiscoveries"],
    ripperdocUnlocks: {},
    vendors: Object.fromEntries(vendors.map((vendor) => [vendor.id, { discovered: vendor.districtId === "neonRow", purchases: {} }])) as GameState["vendors"],
    districtStanding: Object.fromEntries(districtData.map((district) => [district.id, { standing: district.id === "neonRow" ? 5 : 0 }])) as GameState["districtStanding"],
    districtEvents: Object.fromEntries(districtEvents.map((event) => [event.id, event.id === "event-neon-row-open"])) as GameState["districtEvents"],
    travelUnlocks: {},
    equipmentPresets: Object.fromEntries(
      ["Combat", "Hacking", "Scavenging", "Crafting", "Low Instability"].map((name) => [name, { name, gear: {}, cyberware: {} }]),
    ),
    recentLog: [
      {
        category: "World",
        message: "Booted into Neon Row with 50 Credits and a borrowed deck.",
        timestamp: now,
      },
    ],
    offlineRecap: null,
    lastSavedAt: now,
  };
}

export function cloneState(state: GameState): GameState {
  return {
    ...state,
    resources: { ...state.resources },
    skills: {
      scavenging: { ...state.skills.scavenging },
      hacking: { ...state.skills.hacking },
      cyberware: { ...state.skills.cyberware },
      combat: { ...state.skills.combat },
    },
    actionMastery: Object.fromEntries(
      Object.entries(state.actionMastery).map(([id, mastery]) => [id, { ...mastery }]),
    ),
    inventory: { ...state.inventory },
    activeAction: state.activeAction ? { ...state.activeAction } : null,
    activeJob: state.activeJob ? { ...state.activeJob } : null,
    activeCraft: state.activeCraft ? { ...state.activeCraft } : null,
    activeOperation: state.activeOperation ? { ...state.activeOperation } : null,
    currentCombat: state.currentCombat ? { ...state.currentCombat } : null,
    enemyLog: Object.fromEntries(
      Object.entries(state.enemyLog).map(([id, log]) => [
        id,
        { ...log, discoveredDrops: { ...log.discoveredDrops } },
      ]),
    ),
    unlocks: { ...state.unlocks },
    districts: Object.fromEntries(Object.entries(state.districts).map(([id, district]) => [id, { ...district }])) as GameState["districts"],
    factions: Object.fromEntries(Object.entries(state.factions).map(([id, faction]) => [id, { ...faction }])) as GameState["factions"],
    fixerTrust: Object.fromEntries(Object.entries(state.fixerTrust).map(([id, trust]) => [id, { ...trust }])) as GameState["fixerTrust"],
    ownedHousing: { ...state.ownedHousing },
    companions: Object.fromEntries(Object.entries(state.companions).map(([id, companion]) => [id, { ...companion }])) as GameState["companions"],
    worldUnlocks: { ...state.worldUnlocks },
    equippedGear: { ...state.equippedGear },
    equippedCyberware: { ...state.equippedCyberware },
    upgradeLevels: { ...state.upgradeLevels },
    unlockedBlueprints: { ...state.unlockedBlueprints },
    discoveredItems: { ...state.discoveredItems },
    manualDiscovery: {
      skillActions: { ...state.manualDiscovery.skillActions },
      recipes: { ...state.manualDiscovery.recipes },
      enemies: { ...state.manualDiscovery.enemies },
      jobs: { ...state.manualDiscovery.jobs },
      bosses: { ...state.manualDiscovery.bosses },
    },
    masteryPool: {
      scavenging: { ...state.masteryPool.scavenging },
      hacking: { ...state.masteryPool.hacking },
      cyberware: { ...state.masteryPool.cyberware },
      combat: { ...state.masteryPool.combat },
    },
    claimedTierRewards: { ...state.claimedTierRewards },
    simulationEfficiency: { ...state.simulationEfficiency },
    simulationRecap: state.simulationRecap ? { ...state.simulationRecap, resourcesGained: { ...state.simulationRecap.resourcesGained }, dropsGained: { ...state.simulationRecap.dropsGained } } : null,
    operationLogs: Object.fromEntries(
      Object.entries(state.operationLogs).map(([id, log]) => [id, { ...log, drops: { ...log.drops } }]),
    ),
    bossLogs: Object.fromEntries(
      Object.entries(state.bossLogs).map(([id, log]) => [id, { ...log, discoveredDrops: { ...log.discoveredDrops } }]),
    ),
    operationRecap: state.operationRecap ? { ...state.operationRecap, rewards: { ...state.operationRecap.rewards }, itemsGained: { ...state.operationRecap.itemsGained } } : null,
    ownedVehicles: { ...state.ownedVehicles },
    activeVehicle: state.activeVehicle,
    vehicleUpgradeLevels: { ...state.vehicleUpgradeLevels },
    districtThreat: Object.fromEntries(Object.entries(state.districtThreat).map(([id, threat]) => [id, { ...threat }])) as GameState["districtThreat"],
    achievements: { ...state.achievements },
    perkPointsEarned: state.perkPointsEarned,
    perkRanks: { ...state.perkRanks },
    specializationMilestones: { ...state.specializationMilestones },
    respecCount: state.respecCount,
    signatureBuildCache: state.signatureBuildCache,
    selectedDistrict: state.selectedDistrict,
    lastVisitedDistrict: state.lastVisitedDistrict,
    districtDiscoveries: Object.fromEntries(
      Object.entries(state.districtDiscoveries).map(([id, discoveries]) => [id, { ...discoveries }]),
    ) as GameState["districtDiscoveries"],
    ripperdocUnlocks: { ...state.ripperdocUnlocks },
    vendors: Object.fromEntries(
      Object.entries(state.vendors).map(([id, vendor]) => [id, { discovered: vendor.discovered, purchases: { ...vendor.purchases } }]),
    ),
    districtStanding: Object.fromEntries(
      Object.entries(state.districtStanding).map(([id, standing]) => [id, { ...standing }]),
    ) as GameState["districtStanding"],
    districtEvents: { ...state.districtEvents },
    travelUnlocks: { ...state.travelUnlocks },
    equipmentPresets: Object.fromEntries(
      Object.entries(state.equipmentPresets).map(([id, preset]) => [
        id,
        { name: preset.name, gear: { ...preset.gear }, cyberware: { ...preset.cyberware } },
      ]),
    ),
    recentLog: state.recentLog.map((entry) => ({ ...entry })),
    offlineRecap: state.offlineRecap ? { ...state.offlineRecap, resourcesGained: { ...state.offlineRecap.resourcesGained } } : null,
  };
}

export function chooseStartingPath(state: GameState, pathId: StartingPathId) {
  if (state.startingPath) return state;
  const next = cloneState(state);
  next.startingPath = pathId;
  if (pathId === "corporateDefector") next.resources.credits += 100;
  pushCategorizedLog(next, "World", `Starting path locked: ${pathId}.`);
  return next;
}

export function pushLog(state: GameState, message: string) {
  pushCategorizedLog(state, "World", message);
}

export function pushCategorizedLog(state: GameState, category: LogCategory, message: string) {
  state.recentLog = [{ category, message, timestamp: Date.now() }, ...state.recentLog].slice(0, 50);
}

export function normalizeLogEntries(entries: unknown, fallback: GameLogEntry[]): GameLogEntry[] {
  if (!Array.isArray(entries)) return fallback;
  return entries
    .map((entry) => {
      if (typeof entry === "string") {
        return { category: "World" as LogCategory, message: entry, timestamp: Date.now() };
      }
      if (entry && typeof entry === "object" && "message" in entry) {
        const candidate = entry as Partial<GameLogEntry>;
        return {
          category: candidate.category ?? "World",
          message: String(candidate.message ?? ""),
          timestamp: candidate.timestamp ?? Date.now(),
        };
      }
      return null;
    })
    .filter((entry): entry is GameLogEntry => Boolean(entry))
    .slice(0, 50);
}
