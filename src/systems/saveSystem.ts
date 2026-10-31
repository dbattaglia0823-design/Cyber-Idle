import { skillActions } from "../data/skills";
import { grantStarterQuickhacks } from "./quickhackSystem";
import { spentPerkPoints } from "./perkSystem";
import { startingResources } from "../data/resources";
import { normalizeRpgState } from "./rpgState";
import { createInitialState, normalizeLogEntries, SAVE_VERSION } from "./gameState";
import { calculateMaxHP } from "./healthSystem";
import type { GameState } from "../types";

export const SAVE_KEY = "neon-row-idle-save";
export const SAVE_SLOT_COUNT = 3;
export const ACTIVE_SAVE_SLOT_KEY = "neon-row-idle-active-save-slot";
export type SaveSlotId = 1 | 2 | 3;
let saveWarning: string | null = null;
let recoveryNotice: string | null = null;
export function getSaveWarning() { return saveWarning ?? recoveryNotice; }
export function dismissSaveRecoveryNotice() { recoveryNotice=null; }
function parseStoredSave(raw: string) {
  const parsed=JSON.parse(raw);
  if(!parsed || typeof parsed!=="object" || Array.isArray(parsed) || (!parsed.resources && !parsed.inventory && !parsed.saveVersion)) throw Error("Invalid save record");
  return normalizeSave(parsed as Partial<GameState>);
}

export interface SaveSlotSummary {
  slot: SaveSlotId;
  exists: boolean;
  startingPath: GameState["startingPath"] | null;
  credits: number;
  totalLevel: number;
  lastSavedAt: number | null;
}

export function saveGame(state: GameState, slot: SaveSlotId = getActiveSaveSlot()) {
  const key=saveKeyForSlot(slot);
  try {
    const previous=localStorage.getItem(key);
    if(previous){
      let valid=false;try{parseStoredSave(previous);valid=true;}catch{/* Keep an existing good backup. */}
      if(valid){try{localStorage.setItem(key+"-backup",previous);}catch{/* Still attempt the primary save if backup storage is full. */}}
      else {try{parseStoredSave(localStorage.getItem(key+"-backup")??"");}catch{saveWarning="Unreadable save preserved. Export this session before resetting the slot to enable saving.";return false;}}
    }
    localStorage.setItem(key,JSON.stringify({...state,lastSavedAt:Date.now(),saveVersion:SAVE_VERSION}));
    saveWarning=null;return true;
  }catch{saveWarning="Saving failed. Your current session is still running; export your save before closing.";return false;}
}

export function loadGame(slot: SaveSlotId = getActiveSaveSlot()) {
  try {
    const raw = localStorage.getItem(saveKeyForSlot(slot));
    if (raw) return parseStoredSave(raw);
    const backup=localStorage.getItem(saveKeyForSlot(slot)+"-backup");
    if(backup){recoveryNotice="Recovered a backup save. Some recent progress may be missing.";return parseStoredSave(backup);}
    return null;
  } catch (error) {
    try{const backup=localStorage.getItem(saveKeyForSlot(slot)+"-backup");if(backup){const restored=parseStoredSave(backup);recoveryNotice="Recovered a backup save. Some recent progress may be missing.";return restored;}}catch{/* Both records are unavailable. */}
    saveWarning="The saved game could not be read. Check your exported saves before overwriting this slot.";
    return null;
  }
}

export function exportSave(state: GameState) {
  // Escape Unicode inside JSON so base64 remains compatible with older exports.
  const json = JSON.stringify({ ...state, lastSavedAt: Date.now(), saveVersion: SAVE_VERSION });
  return btoa(json.replace(/[\u007f-\uffff]/g, char => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0")));
}

export function importSave(payload: string) {
  return normalizeSave(JSON.parse(atob(payload)) as Partial<GameState>);
}

export function resetSave(slot: SaveSlotId = getActiveSaveSlot()) {
  localStorage.removeItem(saveKeyForSlot(slot));
  localStorage.removeItem(saveKeyForSlot(slot)+"-backup");
  saveWarning=null;
  recoveryNotice=null;
  return createInitialState();
}

export function getActiveSaveSlot(): SaveSlotId {
  try{const value = Number(localStorage.getItem(ACTIVE_SAVE_SLOT_KEY) ?? 1);return value === 2 || value === 3 ? value : 1;}catch{return 1;}
}

export function setActiveSaveSlot(slot: SaveSlotId) {
  try{localStorage.setItem(ACTIVE_SAVE_SLOT_KEY, String(slot));}catch{saveWarning="Save storage is unavailable. Export your session before closing.";}
}

export function saveKeyForSlot(slot: SaveSlotId) {
  return slot === 1 ? SAVE_KEY : `${SAVE_KEY}-${slot}`;
}

const summaryCache=new Map<SaveSlotId,{raw:string|null;backup:string|null;summary:SaveSlotSummary}>();
export function saveSlotSummaries(): SaveSlotSummary[] {
  return ([1,2,3] as SaveSlotId[]).map(slot=>{
    const empty:SaveSlotSummary={slot,exists:false,startingPath:null,credits:0,totalLevel:0,lastSavedAt:null};
    try{
      const raw=localStorage.getItem(saveKeyForSlot(slot)),backup=localStorage.getItem(saveKeyForSlot(slot)+"-backup");
      const cached=summaryCache.get(slot);if(cached&&cached.raw===raw&&cached.backup===backup)return cached.summary;
      let parsed:Partial<GameState>|null=null;
      for(const record of [raw,backup]){if(!record)continue;try{const value=JSON.parse(record);if(value&&typeof value==="object"&&!Array.isArray(value)&&(value.resources||value.inventory||value.saveVersion)){parsed=value;break;}}catch{/* Try backup. */}}
      const summary:SaveSlotSummary=parsed?{slot,exists:true,startingPath:parsed.startingPath??null,credits:parsed.resources?.credits??0,totalLevel:Object.values(parsed.skills??{}).reduce((sum,s)=>sum+(s?.level??0),0),lastSavedAt:parsed.lastSavedAt??null}:{...empty,exists:Boolean(raw||backup)};
      summaryCache.set(slot,{raw,backup,summary});return summary;
    }catch{return empty;}
  });
}

export function normalizeSave(saved: Partial<GameState>): GameState {
  const initial = createInitialState();
  const normalized: GameState = {
    ...initial,
    ...saved,
    saveVersion: SAVE_VERSION,
    rpg: normalizeRpgState(saved.rpg),
    startingPath: saved.startingPath ?? null,
    resources: { ...startingResources, ...saved.resources },
    neuralInstability: 0,
    skills: { ...initial.skills, ...saved.skills },
    actionMastery: { ...initial.actionMastery, ...saved.actionMastery },
    inventory: { ...initial.inventory, ...saved.inventory },
    inventoryLocks: Object.fromEntries(Object.entries(saved.inventoryLocks && typeof saved.inventoryLocks === "object" ? saved.inventoryLocks : {}).filter(([, value]) => value === true)),
    activeAction: saved.activeAction ?? null,
    activeJob: null,
    activeCraft: saved.activeCraft ?? null,
    activeOperation: null,
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
    operationRecap: null,
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
    vendors: Object.fromEntries(
      Object.entries({ ...initial.vendors, ...saved.vendors }).map(([id, vendor]) => [
        id,
        {
          discovered: vendor.discovered,
          purchases: { ...vendor.purchases },
          limitedStockRefreshAt: vendor.limitedStockRefreshAt,
        },
      ]),
    ) as GameState["vendors"],
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
  // Retired skills transfer to active disciplines once; remove old keys so
  // level totals, unlocks and modifiers cannot continue counting them.
  const legacy = saved.skills as Record<string, { level: number; xp: number }> | undefined;
  const skillMap = normalized.skills as Record<string, { level: number; xp: number }>;
  const pools = normalized.masteryPool as Record<string, { xp: number; spent: number }>;
  for (const [retired, target] of [["blackMarket", "hacking"], ["streetcraft", "cyberware"]]) {
    const old = legacy?.[retired];
    if (old && Number.isFinite(old.level)) {
      if (old.level > skillMap[target].level || (old.level === skillMap[target].level && old.xp > skillMap[target].xp)) skillMap[target] = { level: Math.min(150, Math.max(1, old.level)), xp: Number.isFinite(old.xp) ? Math.max(0, old.xp) : 0 };
    }
    const oldPool = (saved.masteryPool as Record<string, { xp: number; spent: number }> | undefined)?.[retired];
    if (oldPool) { pools[target].xp += Number.isFinite(oldPool.xp) ? Math.max(0, oldPool.xp) : 0; pools[target].spent += Number.isFinite(oldPool.spent) ? Math.max(0, oldPool.spent) : 0; }
    delete skillMap[retired]; delete pools[retired];
  }
  if (normalized.activeAction && !skillActions.some(action => action.id === normalized.activeAction!.actionId)) normalized.activeAction = null;
  // Transfer legacy character investment once, before recalculating health.
  if (!saved.rpg?.attributeProgressionVersion) {
    const runnerLevel = Math.min(30, Math.max(normalized.rpg.level, 1 + Math.ceil((normalized.skills.combat.level - 1) / 5)));
    const gained = runnerLevel - normalized.rpg.level;
    normalized.rpg.level = runnerLevel;
    normalized.rpg.attributePoints = Math.min(65, normalized.rpg.attributePoints + gained * 2);
    normalized.rpg.perkPoints = Math.min(31, normalized.rpg.perkPoints + gained + spentPerkPoints(normalized));
    normalized.rpg.attributeProgressionVersion = 1;
  }
  const maxHp = calculateMaxHP(normalized);
  if (!saved.health) normalized.health.currentHp = maxHp;
  normalized.health.currentHp = Math.max(0, Math.min(maxHp, Number.isFinite(normalized.health.currentHp) ? normalized.health.currentHp : maxHp));
  normalized.health.lifeState = normalized.health.currentHp <= 0 ? "downed" : "alive";
  // Earlier operation drops stored currencies in the backpack. Merge them once.
  for (const id of Object.keys(normalized.resources) as Array<keyof GameState["resources"]>) {
    if ((normalized.inventory[id] ?? 0) > 0) {
      normalized.resources[id] += normalized.inventory[id];
      delete normalized.inventory[id];
    }
  }
  // Old armor and leg implants shared IDs. Keep armor ownership and restore the
  // separate implant whenever a save proves it was installed.
  for (const id of ["neon-runner-legs", "skyline-apex-legs"]) {
    if (normalized.equippedCyberware.legs === id) {
      normalized.equippedCyberware.legs = `${id}-implant`;
      normalized.inventory[`${id}-implant`] = Math.max(1, normalized.inventory[id] ?? 1);
      normalized.discoveredItems[`${id}-implant`] = true;
    }
  }
  if (normalized.rpg.starterClaimed && !saved.rpg?.quickhackVersion) grantStarterQuickhacks(normalized);
  return normalized;
}
