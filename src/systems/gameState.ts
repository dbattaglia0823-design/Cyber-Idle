import { companions } from "../data/companions";
import { districtEvents } from "../data/districtEvents";
import { districts } from "../data/districts";
import { factions } from "../data/factions";
import { startingResources } from "../data/resources";
import { districts as districtData } from "../data/districts";
import { vendors } from "../data/vendors";
import { weaponClasses } from "../data/weaponClasses";
import { factionConflictDefaults, storyArcs } from "../data/storyArcs";
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
      vehicleTuning: { level: 1, xp: 0 },
      blackMarket: { level: 1, xp: 0 },
      medical: { level: 1, xp: 0 },
      streetcraft: { level: 1, xp: 0 },
      combat: { level: 1, xp: 0 },
    },
    actionMastery: {},
    inventory: {},
    activeAction: null,
    activeJob: null,
    activeCraft: null,
    activeOperation: null,
    currentCombat: null,
    health: {
      currentHp: 104,
      lifeState: "alive",
      lastDamageTaken: 0,
      lastHealingReceived: 0,
    },
    autoHeal: {
      unlocked: false,
      enabled: false,
      threshold: 40,
      itemId: "basic-med-injector",
      stopIfNoHealing: true,
    },
    healthStatistics: {
      totalDamageTaken: 0,
      totalHealingReceived: 0,
      healingItemsUsed: 0,
      deaths: 0,
      deathsByEnemy: {},
      deathsByOperation: {},
      autoHealsTriggered: 0,
      ripperdocRecoveries: 0,
      lowestHpSurvived: null,
      damageReducedByArmor: 0,
    },
    enemyLog: {},
    unlocks: {},
    districts: Object.fromEntries(
      districts.map((district) => [
        district.id,
        { unlocked: district.id === "neonRow", unlockProgress: district.id === "neonRow" ? 100 : 0 },
      ]),
    ) as Record<DistrictId, { unlocked: boolean; unlockProgress: number }>,
    districtMastery: Object.fromEntries(
      districtData.map((district) => [district.id, { level: 1, xp: 0, milestones: {} }]),
    ) as GameState["districtMastery"],
    streetLegend: { rank: 1, xp: 0, totalXp: 0, claimedMilestones: {} },
    challengeProgress: {},
    highThreatOperationClears: {},
    collectionRewardsClaimed: {},
    prestigeProtocol: { unlocked: false, skillPrestiges: {}, districtPrestiges: {}, weaponClassPrestiges: {} },
    endgameStatistics: {
      streetLegendXpEarned: 0,
      challengeContractsCompleted: 0,
      highThreatClears: 0,
      apexEnemiesKilled: 0,
      legacyCraftsCompleted: 0,
      iconicCyberwareObtained: 0,
      prestigeCount: 0,
    },
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
      vehicleTuning: { xp: 0, spent: 0 },
      blackMarket: { xp: 0, spent: 0 },
      medical: { xp: 0, spent: 0 },
      streetcraft: { xp: 0, spent: 0 },
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
    weaponClasses: Object.fromEntries(
      weaponClasses.map((weaponClass) => [weaponClass.id, { level: 1, xp: 0, manuallyUsed: false, milestones: {} }]),
    ) as GameState["weaponClasses"],
    weaponLoadouts: {},
    dropDiscovery: {},
    weaponStatistics: {
      killsByClass: {},
      damageByClass: {},
      jobsByClass: {},
      operationsByClass: {},
      rareDropsFound: 0,
      attachmentDropsFound: 0,
      modsInstalled: 0,
      weaponsUpgraded: 0,
      dropRatesRevealed: 0,
    },
    selectedDistrict: "neonRow",
    lastVisitedDistrict: "neonRow",
    districtDiscoveries: Object.fromEntries(districtData.map((district) => [district.id, {}])) as GameState["districtDiscoveries"],
    ripperdocUnlocks: {},
    ripperdocHistory: { servicesUsed: 0, cyberwareInstalled: 0, cyberwareSold: 0, cyberwareBought: 0 },
    activeRipperdocEffects: [],
    vendors: Object.fromEntries(vendors.map((vendor) => [vendor.id, { discovered: false, purchases: {}, limitedStockRefreshAt: undefined }])) as GameState["vendors"],
    blackMarketListings: [],
    blackMarketCompletedSales: [],
    blackMarketAutomation: {
      autoListRareItems: false,
      autoSellCommonCyberware: false,
      autoPauseHighHeat: true,
      autoQuickSaleHighHeat: false,
      autoClaimCompleted: false,
    },
    marketStatistics: {
      contractsCompletedByFixer: {},
      contractsFailed: 0,
      ripperdocServicesUsed: 0,
      cyberwareInstalledByRipperdocs: 0,
      cyberwareSoldToRipperdocs: 0,
      blackMarketListingsCreated: 0,
      blackMarketSalesCompleted: 0,
      blackMarketItemsSeized: 0,
      blackMarketCreditsEarned: 0,
      heatFromMarketActivity: 0,
      skillActionsCompletedBySkill: {},
      rareDropsBySkill: {},
      traceEvents: 0,
      scavengingFinds: 0,
      cyberwareRepaired: 0,
      vehicleTuningActions: 0,
      medicalTreatments: 0,
      streetcraftFavors: 0,
      simCacheRunsBySkill: {},
    },
    storyArcs: Object.fromEntries(
      storyArcs.map((arc) => [
        arc.id,
        { status: arc.roadmap ? "locked" : "locked", activeStepId: arc.steps[0]?.id ?? null, completedSteps: {}, choices: {}, outcomeFlags: {}, rewardsClaimed: false },
      ]),
    ) as GameState["storyArcs"],
    storyFlags: {},
    storyChoices: [],
    operationLeads: {},
    factionConflicts: Object.fromEntries(Object.entries(factionConflictDefaults).map(([id, conflict]) => [id, { ...conflict, decisions: { ...conflict.decisions } }])) as GameState["factionConflicts"],
    districtStanding: Object.fromEntries(districtData.map((district) => [district.id, { standing: district.id === "neonRow" ? 5 : 0 }])) as GameState["districtStanding"],
    districtEvents: Object.fromEntries(districtEvents.map((event) => [event.id, event.id === "event-neon-row-open"])) as GameState["districtEvents"],
    travelUnlocks: {},
    equipmentPresets: Object.fromEntries(
      ["Combat", "Hacking", "Scavenging", "Crafting", "Low Instability"].map((name) => [name, { name, gear: {}, cyberware: {} }]),
    ),
    rewardPopups: [],
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
    skills: Object.fromEntries(Object.entries(state.skills).map(([id, skill]) => [id, { ...skill }])) as GameState["skills"],
    actionMastery: Object.fromEntries(
      Object.entries(state.actionMastery).map(([id, mastery]) => [id, { ...mastery }]),
    ),
    inventory: { ...state.inventory },
    activeAction: state.activeAction ? { ...state.activeAction } : null,
    activeJob: state.activeJob ? { ...state.activeJob } : null,
    activeCraft: state.activeCraft ? { ...state.activeCraft } : null,
    activeOperation: state.activeOperation ? { ...state.activeOperation } : null,
    currentCombat: state.currentCombat ? { ...state.currentCombat } : null,
    health: { ...state.health },
    autoHeal: { ...state.autoHeal },
    healthStatistics: {
      ...state.healthStatistics,
      deathsByEnemy: { ...state.healthStatistics.deathsByEnemy },
      deathsByOperation: { ...state.healthStatistics.deathsByOperation },
    },
    enemyLog: Object.fromEntries(
      Object.entries(state.enemyLog).map(([id, log]) => [
        id,
        { ...log, discoveredDrops: { ...log.discoveredDrops } },
      ]),
    ),
    unlocks: { ...state.unlocks },
    districts: Object.fromEntries(Object.entries(state.districts).map(([id, district]) => [id, { ...district }])) as GameState["districts"],
    districtMastery: Object.fromEntries(
      Object.entries(state.districtMastery).map(([id, mastery]) => [id, { ...mastery, milestones: { ...mastery.milestones } }]),
    ) as GameState["districtMastery"],
    streetLegend: { ...state.streetLegend, claimedMilestones: { ...state.streetLegend.claimedMilestones } },
    challengeProgress: Object.fromEntries(
      Object.entries(state.challengeProgress).map(([id, progress]) => [id, { completedTiers: { ...progress.completedTiers } }]),
    ),
    highThreatOperationClears: { ...state.highThreatOperationClears },
    collectionRewardsClaimed: { ...state.collectionRewardsClaimed },
    prestigeProtocol: {
      ...state.prestigeProtocol,
      skillPrestiges: { ...state.prestigeProtocol.skillPrestiges },
      districtPrestiges: { ...state.prestigeProtocol.districtPrestiges },
      weaponClassPrestiges: { ...state.prestigeProtocol.weaponClassPrestiges },
    },
    endgameStatistics: { ...state.endgameStatistics },
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
    masteryPool: Object.fromEntries(Object.entries(state.masteryPool).map(([id, pool]) => [id, { ...pool }])) as GameState["masteryPool"],
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
    weaponClasses: Object.fromEntries(
      Object.entries(state.weaponClasses).map(([id, weaponClass]) => [id, { ...weaponClass, milestones: { ...weaponClass.milestones } }]),
    ) as GameState["weaponClasses"],
    weaponLoadouts: Object.fromEntries(
      Object.entries(state.weaponLoadouts).map(([id, loadout]) => [id, { attachments: { ...loadout.attachments }, mods: [...loadout.mods] }]),
    ),
    dropDiscovery: Object.fromEntries(
      Object.entries(state.dropDiscovery).map(([id, discovery]) => [id, { revealedDrops: { ...discovery.revealedDrops }, revealedChances: { ...discovery.revealedChances } }]),
    ),
    weaponStatistics: {
      killsByClass: { ...state.weaponStatistics.killsByClass },
      damageByClass: { ...state.weaponStatistics.damageByClass },
      jobsByClass: { ...state.weaponStatistics.jobsByClass },
      operationsByClass: { ...state.weaponStatistics.operationsByClass },
      rareDropsFound: state.weaponStatistics.rareDropsFound,
      attachmentDropsFound: state.weaponStatistics.attachmentDropsFound,
      modsInstalled: state.weaponStatistics.modsInstalled,
      weaponsUpgraded: state.weaponStatistics.weaponsUpgraded,
      dropRatesRevealed: state.weaponStatistics.dropRatesRevealed,
    },
    selectedDistrict: state.selectedDistrict,
    lastVisitedDistrict: state.lastVisitedDistrict,
    districtDiscoveries: Object.fromEntries(
      Object.entries(state.districtDiscoveries).map(([id, discoveries]) => [id, { ...discoveries }]),
    ) as GameState["districtDiscoveries"],
    ripperdocUnlocks: { ...state.ripperdocUnlocks },
    ripperdocHistory: { ...state.ripperdocHistory },
    activeRipperdocEffects: (state.activeRipperdocEffects ?? []).map((effect) => ({
      ...effect,
      modifiers: { ...effect.modifiers, skillXp: { ...effect.modifiers.skillXp } },
    })),
    vendors: Object.fromEntries(
      Object.entries(state.vendors).map(([id, vendor]) => [id, { discovered: vendor.discovered, purchases: { ...vendor.purchases }, limitedStockRefreshAt: vendor.limitedStockRefreshAt }]),
    ),
    blackMarketListings: state.blackMarketListings.map((listing) => ({ ...listing })),
    blackMarketCompletedSales: state.blackMarketCompletedSales.map((listing) => ({ ...listing })),
    blackMarketAutomation: { ...state.blackMarketAutomation },
    marketStatistics: {
      ...state.marketStatistics,
      contractsCompletedByFixer: { ...state.marketStatistics.contractsCompletedByFixer },
      skillActionsCompletedBySkill: { ...state.marketStatistics.skillActionsCompletedBySkill },
      rareDropsBySkill: { ...state.marketStatistics.rareDropsBySkill },
      simCacheRunsBySkill: { ...state.marketStatistics.simCacheRunsBySkill },
    },
    storyArcs: Object.fromEntries(
      Object.entries(state.storyArcs).map(([id, arc]) => [
        id,
        { ...arc, completedSteps: { ...arc.completedSteps }, choices: { ...arc.choices }, outcomeFlags: { ...arc.outcomeFlags } },
      ]),
    ),
    storyFlags: { ...state.storyFlags },
    storyChoices: state.storyChoices.map((choice) => ({ ...choice })),
    operationLeads: { ...state.operationLeads },
    factionConflicts: Object.fromEntries(
      Object.entries(state.factionConflicts).map(([id, conflict]) => [id, { ...conflict, decisions: { ...conflict.decisions } }]),
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
    rewardPopups: (state.rewardPopups ?? []).map((popup) => ({
      ...popup,
      lines: popup.lines.map((line) => ({ ...line })),
    })),
    recentLog: state.recentLog.map((entry) => ({ ...entry })),
    offlineRecap: state.offlineRecap ? { ...state.offlineRecap, resourcesGained: { ...state.offlineRecap.resourcesGained } } : null,
  };
}

export function chooseStartingPath(state: GameState, pathId: StartingPathId) {
  if (state.startingPath) return state;
  const next = cloneState(state);
  next.startingPath = pathId;
  if (pathId === "corporateDefector") next.resources.credits += 1000;
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
