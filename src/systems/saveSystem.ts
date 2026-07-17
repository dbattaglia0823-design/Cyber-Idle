import { startingResources } from "../data/resources";
import { createInitialState, normalizeLogEntries, SAVE_VERSION } from "./gameState";
import { calculateMaxHP } from "./healthSystem";
import type { GameState } from "../types";

export const SAVE_KEY = "neon-row-idle-save";
export const SAVE_SLOT_COUNT = 3;
export const ACTIVE_SAVE_SLOT_KEY = "neon-row-idle-active-save-slot";
export type SaveSlotId = 1 | 2 | 3;

export interface SaveSlotSummary {
  slot: SaveSlotId;
  exists: boolean;
  startingPath: GameState["startingPath"] | null;
  credits: number;
  totalLevel: number;
  lastSavedAt: number | null;
}

export function saveGame(state: GameState, slot: SaveSlotId = getActiveSaveSlot()) {
  localStorage.setItem(saveKeyForSlot(slot), JSON.stringify({ ...state, lastSavedAt: Date.now(), saveVersion: SAVE_VERSION }));
}

export function loadGame(slot: SaveSlotId = getActiveSaveSlot()) {
  try {
    const raw = localStorage.getItem(saveKeyForSlot(slot));
    if (!raw) return null;
    return normalizeSave(JSON.parse(raw) as Partial<GameState>);
  } catch (error) {
    console.warn("Save could not be loaded. Starting a clean state instead.", error);
    return null;
  }
}

export function exportSave(state: GameState) {
  return btoa(JSON.stringify({ ...state, lastSavedAt: Date.now(), saveVersion: SAVE_VERSION }));
}

export function importSave(payload: string) {
  return normalizeSave(JSON.parse(atob(payload)) as Partial<GameState>);
}

export function resetSave(slot: SaveSlotId = getActiveSaveSlot()) {
  localStorage.removeItem(saveKeyForSlot(slot));
  return createInitialState();
}

export function getActiveSaveSlot(): SaveSlotId {
  const value = Number(localStorage.getItem(ACTIVE_SAVE_SLOT_KEY) ?? 1);
  return value === 2 || value === 3 ? value : 1;
}

export function setActiveSaveSlot(slot: SaveSlotId) {
  localStorage.setItem(ACTIVE_SAVE_SLOT_KEY, String(slot));
}

export function saveKeyForSlot(slot: SaveSlotId) {
  return slot === 1 ? SAVE_KEY : `${SAVE_KEY}-${slot}`;
}

export function saveSlotSummaries(): SaveSlotSummary[] {
  return ([1, 2, 3] as SaveSlotId[]).map((slot) => {
    try {
      const raw = localStorage.getItem(saveKeyForSlot(slot));
      if (!raw) {
        return { slot, exists: false, startingPath: null, credits: 0, totalLevel: 0, lastSavedAt: null };
      }
      const parsed = JSON.parse(raw) as Partial<GameState>;
      const totalLevel = Object.values(parsed.skills ?? {}).reduce((sum, skill) => sum + (skill?.level ?? 0), 0);
      return {
        slot,
        exists: true,
        startingPath: parsed.startingPath ?? null,
        credits: parsed.resources?.credits ?? 0,
        totalLevel,
        lastSavedAt: parsed.lastSavedAt ?? null,
      };
    } catch {
      return { slot, exists: false, startingPath: null, credits: 0, totalLevel: 0, lastSavedAt: null };
    }
  });
}

export function normalizeSave(saved: Partial<GameState>): GameState {
  const initial = createInitialState();
  const normalized: GameState = {
    ...initial,
    ...saved,
    saveVersion: SAVE_VERSION,
    startingPath: saved.startingPath ?? null,
    resources: { ...startingResources, ...saved.resources },
    neuralInstability: 0,
    skills: { ...initial.skills, ...saved.skills },
    actionMastery: { ...initial.actionMastery, ...saved.actionMastery },
    inventory: { ...initial.inventory, ...saved.inventory },
    activeAction: saved.activeAction ?? null,
    activeJob: saved.activeJob ?? null,
    activeCraft: saved.activeCraft ?? null,
    activeOperation: saved.activeOperation ?? null,
    currentCombat: saved.currentCombat ?? null,
    health: { ...initial.health, ...saved.health },
    autoHeal: { ...initial.autoHeal, ...saved.autoHeal },
    healthStatistics: {
      ...initial.healthStatistics,
      ...saved.healthStatistics,
      deathsByEnemy: { ...initial.healthStatistics.deathsByEnemy, ...saved.healthStatistics?.deathsByEnemy },
      deathsByOperation: { ...initial.healthStatistics.deathsByOperation, ...saved.healthStatistics?.deathsByOperation },
    },
    enemyLog: { ...initial.enemyLog, ...saved.enemyLog },
    unlocks: { ...initial.unlocks, ...saved.unlocks },
    districts: { ...initial.districts, ...saved.districts },
    districtMastery: Object.fromEntries(
      Object.entries(initial.districtMastery).map(([id, mastery]) => {
        const savedMastery = saved.districtMastery?.[id as keyof typeof initial.districtMastery];
        return [id, { ...mastery, ...savedMastery, milestones: { ...mastery.milestones, ...savedMastery?.milestones } }];
      }),
    ) as GameState["districtMastery"],
    streetLegend: {
      ...initial.streetLegend,
      ...saved.streetLegend,
      claimedMilestones: { ...initial.streetLegend.claimedMilestones, ...saved.streetLegend?.claimedMilestones },
    },
    challengeProgress: Object.fromEntries(
      Object.entries({ ...initial.challengeProgress, ...saved.challengeProgress }).map(([id, progress]) => [
        id,
        { completedTiers: { ...(progress as GameState["challengeProgress"][string])?.completedTiers } },
      ]),
    ),
    highThreatOperationClears: { ...initial.highThreatOperationClears, ...saved.highThreatOperationClears },
    collectionRewardsClaimed: { ...initial.collectionRewardsClaimed, ...saved.collectionRewardsClaimed },
    prestigeProtocol: {
      ...initial.prestigeProtocol,
      ...saved.prestigeProtocol,
      skillPrestiges: { ...initial.prestigeProtocol.skillPrestiges, ...saved.prestigeProtocol?.skillPrestiges },
      districtPrestiges: { ...initial.prestigeProtocol.districtPrestiges, ...saved.prestigeProtocol?.districtPrestiges },
      weaponClassPrestiges: { ...initial.prestigeProtocol.weaponClassPrestiges, ...saved.prestigeProtocol?.weaponClassPrestiges },
    },
    endgameStatistics: { ...initial.endgameStatistics, ...saved.endgameStatistics },
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
    masteryPool: Object.fromEntries(
      Object.entries(initial.masteryPool).map(([skill, pool]) => [skill, { ...pool, ...saved.masteryPool?.[skill as keyof typeof initial.masteryPool] }]),
    ) as GameState["masteryPool"],
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
    weaponClasses: { ...initial.weaponClasses, ...saved.weaponClasses },
    weaponLoadouts: { ...initial.weaponLoadouts, ...saved.weaponLoadouts },
    dropDiscovery: { ...initial.dropDiscovery, ...saved.dropDiscovery },
    weaponStatistics: { ...initial.weaponStatistics, ...saved.weaponStatistics },
    selectedDistrict: saved.selectedDistrict ?? initial.selectedDistrict,
    lastVisitedDistrict: saved.lastVisitedDistrict ?? initial.lastVisitedDistrict,
    districtDiscoveries: { ...initial.districtDiscoveries, ...saved.districtDiscoveries },
    ripperdocUnlocks: { ...initial.ripperdocUnlocks, ...saved.ripperdocUnlocks },
    ripperdocHistory: { ...initial.ripperdocHistory, ...saved.ripperdocHistory },
    activeRipperdocEffects: saved.activeRipperdocEffects ?? initial.activeRipperdocEffects,
    vendors: { ...initial.vendors, ...saved.vendors },
    blackMarketListings: saved.blackMarketListings ?? initial.blackMarketListings,
    blackMarketCompletedSales: saved.blackMarketCompletedSales ?? initial.blackMarketCompletedSales,
    blackMarketAutomation: { ...initial.blackMarketAutomation, ...saved.blackMarketAutomation },
    marketStatistics: {
      ...initial.marketStatistics,
      ...saved.marketStatistics,
      contractsCompletedByFixer: {
        ...initial.marketStatistics.contractsCompletedByFixer,
        ...saved.marketStatistics?.contractsCompletedByFixer,
      },
      skillActionsCompletedBySkill: {
        ...initial.marketStatistics.skillActionsCompletedBySkill,
        ...saved.marketStatistics?.skillActionsCompletedBySkill,
      },
      rareDropsBySkill: {
        ...initial.marketStatistics.rareDropsBySkill,
        ...saved.marketStatistics?.rareDropsBySkill,
      },
      simCacheRunsBySkill: {
        ...initial.marketStatistics.simCacheRunsBySkill,
        ...saved.marketStatistics?.simCacheRunsBySkill,
      },
    },
    storyArcs: Object.fromEntries(
      Object.entries(initial.storyArcs).map(([id, arc]) => {
        const savedArc = saved.storyArcs?.[id];
        return [
          id,
          {
            ...arc,
            ...savedArc,
            completedSteps: { ...arc.completedSteps, ...savedArc?.completedSteps },
            choices: { ...arc.choices, ...savedArc?.choices },
            outcomeFlags: { ...arc.outcomeFlags, ...savedArc?.outcomeFlags },
          },
        ];
      }),
    ) as GameState["storyArcs"],
    storyFlags: { ...initial.storyFlags, ...saved.storyFlags },
    storyChoices: saved.storyChoices ?? initial.storyChoices,
    operationLeads: { ...initial.operationLeads, ...saved.operationLeads },
    factionConflicts: Object.fromEntries(
      Object.entries(initial.factionConflicts).map(([id, conflict]) => {
        const savedConflict = saved.factionConflicts?.[id];
        return [id, { ...conflict, ...savedConflict, decisions: { ...conflict.decisions, ...savedConflict?.decisions } }];
      }),
    ) as GameState["factionConflicts"],
    districtStanding: { ...initial.districtStanding, ...saved.districtStanding },
    districtEvents: { ...initial.districtEvents, ...saved.districtEvents },
    travelUnlocks: { ...initial.travelUnlocks, ...saved.travelUnlocks },
    equipmentPresets: { ...initial.equipmentPresets, ...saved.equipmentPresets },
    rewardPopups: [],
    recentLog: normalizeLogEntries(saved.recentLog, initial.recentLog),
    offlineRecap: saved.offlineRecap ?? null,
    lastSavedAt: saved.lastSavedAt ?? Date.now(),
  };
  const maxHp = calculateMaxHP(normalized);
  if (!saved.health) normalized.health.currentHp = maxHp;
  normalized.health.currentHp = Math.max(0, Math.min(maxHp, normalized.health.currentHp || maxHp));
  if (!saved.health?.lifeState) normalized.health.lifeState = "alive";
  return normalized;
}
