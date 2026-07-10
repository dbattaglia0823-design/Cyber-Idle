export type ResourceId =
  | "credits"
  | "scrap"
  | "circuitBoards"
  | "encryptedData"
  | "cyberwareParts"
  | "reputation"
  | "heat"
  | "vehicleParts"
  | "engineCore"
  | "armorPlating"
  | "fuelCell"
  | "navigationChip"
  | "smugglerCompartment"
  | "prototypeDriveUnit";

export type SkillId = "scavenging" | "hacking" | "cyberware" | "combat";
export type StartingPathId = "outrider" | "streetborn" | "corporateDefector";
export type ArchetypeId = "solo" | "netrunner" | "techie" | "outrider" | "fixer" | "ghost";
export type PerkTreeId = ArchetypeId | "core";
export type DistrictId =
  | "neonRow"
  | "rustYards"
  | "glasslineDistrict"
  | "underpassMarket"
  | "blacknetQuarter"
  | "helixWard"
  | "redlineBlocks"
  | "skylineCore";
export type FactionId = "chromeJackals" | "nullChoir" | "redlineSaints" | "ghostMarket" | "helixOrder";
export type LogCategory = "Skill" | "Combat" | "Job" | "Loot" | "World" | "Warning";

export type CyberwareSlot =
  | "neural"
  | "optics"
  | "arms"
  | "legs"
  | "skin"
  | "skeleton"
  | "operatingSystem"
  | "utility";
export type GearSlot = "weapon" | "head" | "chest" | "hands" | "legs" | "boots" | "accessory1" | "accessory2";
export type ItemType = "Resource" | "Material" | "Component" | "Cyberware" | "Weapon" | "Armor" | "Consumable" | "Blueprint" | "Quest";
export type ItemRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Prototype" | "Relic";

export type RewardBundle = Partial<Record<ResourceId, number>>;

export interface SkillState {
  level: number;
  xp: number;
}

export interface MasteryState {
  level: number;
  xp: number;
}

export interface SkillAction {
  id: string;
  skillId: Exclude<SkillId, "combat">;
  name: string;
  district: string;
  description: string;
  levelReq: number;
  durationMs: number;
  xpReward: number;
  masteryXpReward: number;
  rewards: RewardBundle;
  heatChange?: number;
  neuralInstabilityChange?: number;
  tags?: string[];
}

export interface EnemyDrop {
  id: string;
  name: string;
  chance: number;
  quantity: number;
}

export interface ItemStats {
  maxHp?: number;
  damage?: number;
  attackSpeed?: number;
  armor?: number;
  accuracy?: number;
  dodge?: number;
  critChance?: number;
  critDamage?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  tags: string[];
  stackable: boolean;
  maxStack?: number;
  sellValue: number;
  sourceHint: string;
  discovered?: boolean;
  slot?: CyberwareSlot | GearSlot;
  tier?: number;
  requiredSkill?: SkillId;
  requiredLevel?: number;
  modifiers?: Partial<ActiveModifiers>;
  instabilityLoad?: number;
  stats?: ItemStats;
  setName?: string;
  maxUpgradeLevel?: number;
  useEffect?: "reduceNeuralInstability" | "heal";
}

export interface CraftingRecipe {
  id: string;
  name: string;
  category: "Components" | "Cyberware" | "Weapons" | "Armor" | "Consumables" | "Upgrades";
  requiredSkill: SkillId;
  requiredLevel: number;
  requiredBlueprint?: string;
  inputCosts: Record<string, number>;
  outputItemId: string;
  outputQuantity: number;
  durationMs: number;
  xpReward: number;
  masteryXpReward: number;
  tags: string[];
  unlockRequirements: string[];
}

export interface Enemy {
  id: string;
  name: string;
  description: string;
  hp: number;
  damage: number;
  attackSpeedMs: number;
  creditsReward: number;
  xpReward: number;
  reputationReward: number;
  drops: EnemyDrop[];
}

export interface Boss extends Enemy {
  armor: number;
  mechanics: string[];
  firstClearRewards: RewardBundle;
  repeatRewards: RewardBundle;
}

export interface CombatZone {
  id: string;
  name: string;
  description: string;
  enemies: Enemy[];
}

export interface PlayerCombatStats {
  maxHp: number;
  damage: number;
  attackSpeedMs: number;
  armor: number;
}

export interface ActiveAction {
  actionId: string;
  startedAt: number;
  durationMs: number;
}

export interface ActiveJob {
  jobId: string;
  startedAt: number;
  durationMs: number;
  repeats: boolean;
}

export interface ActiveCraft {
  recipeId: string;
  startedAt: number;
  durationMs: number;
}

export interface ActiveOperation {
  operationId: string;
  startedAt: number;
  durationMs: number;
  stageIndex: number;
}

export interface CurrentCombat {
  enemyId: string;
  startedAt: number;
  durationMs: number;
}

export interface EnemyLog {
  kills: number;
  bestKillMs: number | null;
  discoveredDrops: Record<string, number>;
}

export interface OfflineRecap {
  timeAwayMs: number;
  actionName: string;
  completions: number;
  xpGained: number;
  resourcesGained: RewardBundle;
  levelsGained: number;
  masteryXpGained: number;
  masteryLevelsGained: number;
  heatGained: number;
  neuralInstabilityGained: number;
  message?: string;
}

export interface ManualDiscovery {
  skillActions: Record<string, boolean>;
  recipes: Record<string, boolean>;
  enemies: Record<string, boolean>;
  jobs: Record<string, boolean>;
  bosses: Record<string, boolean>;
}

export interface MasteryPoolState {
  xp: number;
  spent: number;
}

export interface SimulationEfficiency {
  skillXp: number;
  resources: number;
  credits: number;
  masteryXp: number;
  rareDrops: number;
  factionTrust: number;
  heat: number;
  neuralInstability: number;
}

export interface SimulationRecap {
  cacheType: "basic" | "combat" | "blacknet" | "fixer";
  simulatedMs: number;
  activityName: string;
  completions: number;
  efficiency: SimulationEfficiency;
  xpGained: number;
  masteryXpGained: number;
  poolXpGained: number;
  resourcesGained: RewardBundle;
  dropsGained: Record<string, number>;
  heatChange: number;
  neuralInstabilityChange: number;
  stoppedReason: string;
  warnings: string[];
}

export interface OperationStage {
  name: string;
  enemyIds: string[];
}

export interface OperationDefinition {
  id: string;
  name: string;
  districtId: DistrictId;
  description: string;
  unlockRequirements: string[];
  recommendedStats: string[];
  requiredItems?: Record<string, number>;
  stages: OperationStage[];
  bossId: string;
  completionRewards: RewardBundle;
  rareDrops: EnemyDrop[];
  firstClearRewards: RewardBundle;
  repeatClearRewards: RewardBundle;
  heatChange: number;
  neuralInstabilityChange?: number;
  factionReputation: Partial<Record<FactionId, number>>;
  fixerTrust?: Record<string, number>;
}

export interface OperationLog {
  clears: number;
  bestClearMs: number | null;
  firstClear: boolean;
  drops: Record<string, number>;
}

export interface OperationRecap {
  operationId: string;
  success: boolean;
  clearMs: number;
  enemiesDefeated: number;
  bossDefeated: boolean;
  xpGained: number;
  rewards: RewardBundle;
  itemsGained: Record<string, number>;
  heatChange: number;
  neuralInstabilityChange: number;
  firstClear: boolean;
  message: string;
}

export interface VehicleStats {
  speed: number;
  armor: number;
  storage: number;
  stealth: number;
  heatReduction: number;
  jobEfficiency: number;
  smugglingRewardBonus: number;
  districtAccessBonus: number;
}

export interface VehicleDefinition {
  id: string;
  name: string;
  rarity: ItemRarity;
  type: string;
  districtId: DistrictId;
  unlockRequirements: string[];
  cost: RewardBundle;
  stats: VehicleStats;
  passiveModifiers: Partial<ActiveModifiers>;
  maxUpgradeLevel: number;
  garageSlotsRequired: number;
  sourceHint: string;
}

export interface RipperdocService {
  id: string;
  name: string;
  description: string;
  districtId: DistrictId;
  cost: RewardBundle;
  requirements: string[];
  factionDiscount?: FactionId;
  heatChange?: number;
  neuralInstabilityChange?: number;
  risk?: string;
  effects?: string[];
  repeatable: boolean;
  serviceType:
    | "install"
    | "remove"
    | "upgrade"
    | "treatment"
    | "stabilizer"
    | "prototypeInstall"
    | "calibration"
    | "slotOptimization"
    | "loadReduction"
    | "unique";
}

export interface VendorItemEntry {
  itemId: string;
  price: number;
  stockType: "infinite" | "limited" | "unlock";
  stock?: number;
  requiredFactionRank?: Partial<Record<FactionId, number>>;
  requiredDistrictUnlock?: DistrictId;
  requiredUnlock?: string;
  sourceHint: string;
}

export interface VendorDefinition {
  id: string;
  name: string;
  districtId: DistrictId;
  description: string;
  unlockRequirements: string[];
  inventory: VendorItemEntry[];
  priceModifier: number;
  factionDiscounts?: Partial<Record<FactionId, number>>;
  startingPathModifiers?: Partial<Record<StartingPathId, number>>;
  refreshBehavior: string;
  canBuy: boolean;
  canSell: boolean;
  specialServices?: string[];
}

export interface VendorState {
  discovered: boolean;
  purchases: Record<string, number>;
}

export interface DistrictStandingState {
  standing: number;
}

export interface DistrictCompletionBreakdown {
  combat: number;
  jobs: number;
  collection: number;
  housing: number;
  factions: number;
  services: number;
  operations: number;
  vendors: number;
  total: number;
}

export interface DistrictEventDefinition {
  id: string;
  districtId: DistrictId;
  name: string;
  trigger: string;
  description: string;
  effects: string[];
  logCategory: LogCategory;
}

export interface DistrictThreatState {
  level: number;
  controllingForce: string;
}

export interface ModifierSet {
  scavengingRewards?: number;
  hackingXp?: number;
  cyberwareXp?: number;
  combatXp?: number;
  reputationGain?: number;
  heatGain?: number;
  neuralInstabilityGain?: number;
  dataTheftRewards?: number;
  corporateJobRewards?: number;
  vehicleJobSpeed?: number;
  smugglingHeat?: number;
  corporatePrices?: number;
  blackMarketPrices?: number;
  streetTrustGain?: number;
  gangTrustGain?: number;
  corporateTrustGain?: number;
  corporateJobSuccess?: number;
}

export interface StartingPath {
  id: StartingPathId;
  name: string;
  theme: string;
  bonuses: string[];
  penalties: string[];
  modifiers: ModifierSet;
  startingCredits?: number;
}

export interface District {
  id: DistrictId;
  name: string;
  description: string;
  unlockRequirements: string[];
  associatedFixers: string[];
  associatedFactions: FactionId[];
  housingOptions: string[];
  enemyZones: string[];
  jobModifiers: string[];
  shopModifiers: string[];
  heatModifier?: number;
  completionTarget?: number;
  travelRequirements?: string[];
  modifiers?: Partial<ActiveModifiers>;
}

export interface DistrictState {
  unlocked: boolean;
  unlockProgress: number;
}

export interface Faction {
  id: FactionId;
  name: string;
  description: string;
  districtInfluence: DistrictId[];
  uniqueBonuses: string[];
  uniqueShop: string;
  jobModifiers: string[];
  rivals: FactionId[];
}

export interface FactionState {
  reputation: number;
  hostility: number;
  affiliated: boolean;
}

export interface HousingOption {
  id: string;
  name: string;
  districtId: DistrictId;
  cost: number;
  unlockRequirements: string[];
  passiveBonuses: string[];
  storageBonus: number;
  offlineCapBonusHours: number;
  heatDecayBonus: number;
  neuralRecoveryBonus: number;
  craftingBonus?: number;
  hackingBonus?: number;
  garageSlots?: number;
}

export interface Companion {
  id: string;
  name: string;
  role: string;
  districtId: DistrictId;
  factionId: FactionId;
  romanceEligible: boolean;
  preferredGiftTypes: string[];
  passiveBonus: string;
  questPlaceholder: string;
  unlockRequirements: string[];
}

export interface CompanionState {
  unlocked: boolean;
  relationship: number;
  route?: "Friendship" | "Romance";
  spendTimeAt?: number;
}

export interface Fixer {
  id: string;
  name: string;
  districtId: DistrictId;
  factionId: FactionId;
  specialty: string;
  startingPathNotes: Partial<Record<StartingPathId, string>>;
  companionUnlocks: string[];
  housingUnlocks: string[];
  jobChains: string[];
}

export interface FixerState {
  trust: number;
  completedJobs: number;
}

export interface JobContract {
  id: string;
  name: string;
  fixerId: string;
  districtId: DistrictId;
  factionId: FactionId;
  tags: string[];
  description: string;
  durationMs: number;
  requirements: string[];
  baseSuccessChance: number;
  heatChange: number;
  neuralInstabilityChange?: number;
  rewards: RewardBundle;
  skillXp?: Partial<Record<SkillId, number>>;
  factionReputation: Partial<Record<FactionId, number>>;
  companionRelationship?: Record<string, number>;
  fixerTrustReward: number;
  rareReward?: string;
  repeatable: boolean;
  autoRepeatTrustReq?: number;
  factionConflict?: boolean;
}

export interface ActiveModifiers {
  skillXp: Partial<Record<SkillId, number>>;
  skillRewards: number;
  actionSpeed: number;
  combatDamage: number;
  combatDefense: number;
  combatXp: number;
  dropChance: number;
  creditsGained: number;
  reputationGained: number;
  heatGain: number;
  heatDecay: number;
  neuralInstabilityGain: number;
  neuralInstabilityRecovery: number;
  jobSuccessChance: number;
  jobRewards: number;
  shopPrices: number;
  offlineProgressCapHours: number;
  fixerTrustGain: number;
  masteryXpGain: number;
  craftingCostReduction: number;
  upgradeCostReduction: number;
  vehicleUpgradeCostReduction: number;
  ripperdocCostReduction: number;
  localStandingGain: number;
  companionRelationshipGain: number;
  factionReputationGain: number;
  simCacheEfficiency: number;
  activeSources: string[];
}

export interface PerkDefinition {
  id: string;
  name: string;
  description: string;
  tree: PerkTreeId;
  tier: number;
  cost: number;
  prerequisites: string[];
  maxRanks: number;
  modifiers: Partial<ActiveModifiers>;
  unlockRequirements: string[];
}

export interface SpecializationMilestone {
  tree: PerkTreeId;
  points: number;
  name: string;
  description: string;
}

export interface ArchetypeScore {
  id: ArchetypeId;
  name: string;
  score: number;
  percent: number;
}

export interface SignatureBuild {
  id: string;
  name: string;
  description: string;
  requiredArchetypes: ArchetypeId[];
}

export interface GameLogEntry {
  category: LogCategory;
  message: string;
  timestamp: number;
}

export interface GameState {
  saveVersion: number;
  startingPath: StartingPathId | null;
  resources: Record<ResourceId, number>;
  neuralInstability: number;
  skills: Record<SkillId, SkillState>;
  actionMastery: Record<string, MasteryState>;
  inventory: Record<string, number>;
  activeAction: ActiveAction | null;
  activeJob: ActiveJob | null;
  activeCraft: ActiveCraft | null;
  activeOperation: ActiveOperation | null;
  currentCombat: CurrentCombat | null;
  enemyLog: Record<string, EnemyLog>;
  unlocks: Record<string, boolean>;
  districts: Record<DistrictId, DistrictState>;
  factions: Record<FactionId, FactionState>;
  fixerTrust: Record<string, FixerState>;
  ownedHousing: Record<string, boolean>;
  activeResidence: string | null;
  companions: Record<string, CompanionState>;
  activeCompanion: string | null;
  worldUnlocks: Record<string, boolean>;
  equippedGear: Partial<Record<GearSlot, string>>;
  equippedCyberware: Partial<Record<CyberwareSlot, string>>;
  upgradeLevels: Record<string, number>;
  unlockedBlueprints: Record<string, boolean>;
  discoveredItems: Record<string, boolean>;
  manualDiscovery: ManualDiscovery;
  masteryPool: Record<SkillId, MasteryPoolState>;
  claimedTierRewards: Record<string, boolean>;
  simulationEfficiency: Partial<SimulationEfficiency>;
  simulationRecap: SimulationRecap | null;
  operationLogs: Record<string, OperationLog>;
  bossLogs: Record<string, EnemyLog>;
  operationRecap: OperationRecap | null;
  ownedVehicles: Record<string, boolean>;
  activeVehicle: string | null;
  vehicleUpgradeLevels: Record<string, number>;
  districtThreat: Record<DistrictId, DistrictThreatState>;
  achievements: Record<string, boolean>;
  perkPointsEarned: number;
  perkRanks: Record<string, number>;
  specializationMilestones: Record<string, boolean>;
  respecCount: number;
  signatureBuildCache: string | null;
  selectedDistrict: DistrictId | null;
  lastVisitedDistrict: DistrictId | null;
  districtDiscoveries: Record<DistrictId, Record<string, boolean>>;
  ripperdocUnlocks: Record<string, boolean>;
  vendors: Record<string, VendorState>;
  districtStanding: Record<DistrictId, DistrictStandingState>;
  districtEvents: Record<string, boolean>;
  travelUnlocks: Record<string, boolean>;
  equipmentPresets: Record<string, {
    name: string;
    gear: Partial<Record<GearSlot, string>>;
    cyberware: Partial<Record<CyberwareSlot, string>>;
  }>;
  recentLog: GameLogEntry[];
  offlineRecap: OfflineRecap | null;
  lastSavedAt: number;
}
