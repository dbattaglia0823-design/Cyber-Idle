import { startingResources } from "../data/resources";
import { createInitialState, normalizeLogEntries, SAVE_VERSION } from "./gameState";
import type { GameState } from "../types";

export const SAVE_KEY = "neon-row-idle-save";

export function saveGame(state: GameState) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSavedAt: Date.now(), saveVersion: SAVE_VERSION }));
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  return normalizeSave(JSON.parse(raw) as Partial<GameState>);
}

export function exportSave(state: GameState) {
  return btoa(JSON.stringify({ ...state, lastSavedAt: Date.now(), saveVersion: SAVE_VERSION }));
}

export function importSave(payload: string) {
  return normalizeSave(JSON.parse(atob(payload)) as Partial<GameState>);
}

export function resetSave() {
  localStorage.removeItem(SAVE_KEY);
  return createInitialState();
}

export function normalizeSave(saved: Partial<GameState>): GameState {
  const initial = createInitialState();
  return {
    ...initial,
    ...saved,
    saveVersion: SAVE_VERSION,
    startingPath: saved.startingPath ?? null,
    resources: { ...startingResources, ...saved.resources },
    neuralInstability: saved.neuralInstability ?? 0,
    skills: { ...initial.skills, ...saved.skills },
    actionMastery: { ...initial.actionMastery, ...saved.actionMastery },
    inventory: { ...initial.inventory, ...saved.inventory },
    activeAction: saved.activeAction ?? null,
    activeJob: saved.activeJob ?? null,
    activeCraft: saved.activeCraft ?? null,
    activeOperation: saved.activeOperation ?? null,
    currentCombat: saved.currentCombat ?? null,
    enemyLog: { ...initial.enemyLog, ...saved.enemyLog },
    unlocks: { ...initial.unlocks, ...saved.unlocks },
    districts: { ...initial.districts, ...saved.districts },
    factions: { ...initial.factions, ...saved.factions },
    fixerTrust: { ...initial.fixerTrust, ...saved.fixerTrust },
    ownedHousing: { ...initial.ownedHousing, ...saved.ownedHousing },
    activeResidence: saved.activeResidence ?? null,
    companions: { ...initial.companions, ...saved.companions },
    activeCompanion: saved.activeCompanion ?? initial.activeCompanion,
    worldUnlocks: { ...initial.worldUnlocks, ...saved.worldUnlocks },
    equippedGear: { ...initial.equippedGear, ...saved.equippedGear },
    equippedCyberware: { ...initial.equippedCyberware, ...saved.equippedCyberware },
    upgradeLevels: { ...initial.upgradeLevels, ...saved.upgradeLevels },
    unlockedBlueprints: { ...initial.unlockedBlueprints, ...saved.unlockedBlueprints },
    discoveredItems: { ...initial.discoveredItems, ...saved.discoveredItems },
    manualDiscovery: {
      skillActions: { ...initial.manualDiscovery.skillActions, ...saved.manualDiscovery?.skillActions },
      recipes: { ...initial.manualDiscovery.recipes, ...saved.manualDiscovery?.recipes },
      enemies: { ...initial.manualDiscovery.enemies, ...saved.manualDiscovery?.enemies },
      jobs: { ...initial.manualDiscovery.jobs, ...saved.manualDiscovery?.jobs },
      bosses: { ...initial.manualDiscovery.bosses, ...saved.manualDiscovery?.bosses },
    },
    masteryPool: {
      scavenging: { ...initial.masteryPool.scavenging, ...saved.masteryPool?.scavenging },
      hacking: { ...initial.masteryPool.hacking, ...saved.masteryPool?.hacking },
      cyberware: { ...initial.masteryPool.cyberware, ...saved.masteryPool?.cyberware },
      combat: { ...initial.masteryPool.combat, ...saved.masteryPool?.combat },
    },
    claimedTierRewards: { ...initial.claimedTierRewards, ...saved.claimedTierRewards },
    simulationEfficiency: { ...initial.simulationEfficiency, ...saved.simulationEfficiency },
    simulationRecap: saved.simulationRecap ?? null,
    operationLogs: { ...initial.operationLogs, ...saved.operationLogs },
    bossLogs: { ...initial.bossLogs, ...saved.bossLogs },
    operationRecap: saved.operationRecap ?? null,
    ownedVehicles: { ...initial.ownedVehicles, ...saved.ownedVehicles },
    activeVehicle: saved.activeVehicle ?? null,
    vehicleUpgradeLevels: { ...initial.vehicleUpgradeLevels, ...saved.vehicleUpgradeLevels },
    districtThreat: { ...initial.districtThreat, ...saved.districtThreat },
    achievements: { ...initial.achievements, ...saved.achievements },
    perkPointsEarned: saved.perkPointsEarned ?? initial.perkPointsEarned,
    perkRanks: { ...initial.perkRanks, ...saved.perkRanks },
    specializationMilestones: { ...initial.specializationMilestones, ...saved.specializationMilestones },
    respecCount: saved.respecCount ?? initial.respecCount,
    signatureBuildCache: saved.signatureBuildCache ?? null,
    selectedDistrict: saved.selectedDistrict ?? initial.selectedDistrict,
    lastVisitedDistrict: saved.lastVisitedDistrict ?? initial.lastVisitedDistrict,
    districtDiscoveries: { ...initial.districtDiscoveries, ...saved.districtDiscoveries },
    ripperdocUnlocks: { ...initial.ripperdocUnlocks, ...saved.ripperdocUnlocks },
    vendors: { ...initial.vendors, ...saved.vendors },
    districtStanding: { ...initial.districtStanding, ...saved.districtStanding },
    districtEvents: { ...initial.districtEvents, ...saved.districtEvents },
    travelUnlocks: { ...initial.travelUnlocks, ...saved.travelUnlocks },
    equipmentPresets: { ...initial.equipmentPresets, ...saved.equipmentPresets },
    recentLog: normalizeLogEntries(saved.recentLog, initial.recentLog),
    offlineRecap: saved.offlineRecap ?? null,
    lastSavedAt: saved.lastSavedAt ?? Date.now(),
  };
}
