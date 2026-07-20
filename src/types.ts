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

export type SkillId = "scavenging" | "hacking" | "cyberware" | "vehicleTuning" | "blackMarket" | "medical" | "streetcraft" | "combat";
export type StartingPathId = "outrider" | "streetborn" | "corporateDefector";
export type ArchetypeId = "solo" | "netrunner" | "techie" | "outrider" | "fixer" | "ghost";
export type PerkTreeId = ArchetypeId | "core";
export type WeaponClassId =
  | "pistols"
  | "smgs"
  | "shotguns"
  | "assaultRifles"
  | "sniperRifles"
  | "blades"
  | "bluntWeapons"
  | "techWeapons"
  | "smartWeapons"
  | "heavyWeapons"
  | "cyberdeckWeapons"
  | "exoticWeapons";
export type AttachmentCategory = "muzzle" | "scope" | "magazine" | "grip" | "barrel" | "stock" | "link" | "batteryCore";
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
export type RewardPopupCategory =
  | "xp"
  | "mastery"
  | "resource"
  | "credits"
  | "item"
  | "rare"
  | "blueprint"
  | "level"
  | "reputation"
  | "heat"
  | "neural"
  | "achievement"
  | "story"
  | "warning";

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
export type ItemType = "Resource" | "Material" | "Component" | "Cyberware" | "Weapon" | "WeaponAttachment" | "WeaponMod" | "Armor" | "Consumable" | "Blueprint" | "Quest";
export type ItemRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Prototype" | "Relic";
export type ContractType =
  | "Courier"
  | "Smuggling"
  | "Bounty"
  | "Data Theft"
  | "Sabotage"
  | "Protection"
  | "Extraction"
  | "Cyberware Recovery"
  | "Vehicle Recovery"
  | "Cleanup"
  | "Faction Conflict"
  | "Corporate Espionage";
export type RipperdocCategory = "Install" | "Remove" | "Upgrade" | "Calibrate" | "Treat" | "Buy" | "Sell" | "Prototype" | "Special";
export type BlackMarketStrategy = "quickSale" | "standard" | "highBid" | "privateBuyer";
export type BlackMarketListingStatus = "active" | "completed" | "delayed" | "failed" | "seized";
export type EnemyTraitId =
  | "armored"
  | "unarmored"
  | "agile"
  | "heavy"
  | "drone"
  | "mech"
  | "human"
  | "cybered"
  | "netrunner"
  | "gang"
  | "corporate"
  | "blacknet"
  | "medical"
  | "vehicle"
  | "elite"
  | "boss"
  | "stealthSensitive"
  | "heatSensitive"
  | "unstable"
  | "prototype"
  | "shielded"
  | "regenerating"
  | "highCrit"
  | "highDodge"
  | "armorBreaker"
  | "signalLinked";
export type DamageType = "ballistic" | "blade" | "blunt" | "shock" | "thermal" | "chemical" | "explosive" | "tech" | "smart" | "blacknet" | "neural";
export type ArmorType = "none" | "streetArmor" | "plated" | "composite" | "shielded" | "digital" | "vehicle";
export type EnemyArchetypeId =
  | "streetGrunt"
  | "bruiser"
  | "gunner"
  | "netrunner"
  | "drone"
  | "mech"
  | "assassin"
  | "cyberpsycho"
  | "corporateAgent"
  | "blacknetConstruct"
  | "medicSupport"
  | "boss";
export type EnemyDifficultyTier = "Common" | "Hardened" | "Elite" | "Mini-Boss" | "Boss" | "Apex";
export type EnemyVariantId = "hardened" | "chromePlated" | "blacknetLinked" | "prototype" | "wanted" | "elite" | "corrupted" | "factionBacked" | "highValueTarget";
export type CombatMatchupRating = "Poor Matchup" | "Neutral Matchup" | "Good Matchup" | "Excellent Matchup";
export type OperationRouteId = "directAssault" | "silentEntry" | "blacknetBreach" | "smugglerRoute" | "corporateDisguise" | "factionFavor" | "fixerSetup";
export type StoryCategory =
  | "Main Arc"
  | "District Arc"
  | "Fixer Chain"
  | "Faction Conflict"
  | "Companion Quest"
  | "Operation Lead"
  | "Ripperdoc Case"
  | "Black Market Deal"
  | "Vehicle Chain"
  | "Neural Instability Arc";
export type StoryObjectiveType =
  | "completeSkillAction"
  | "reachSkillLevel"
  | "killEnemy"
  | "clearOperation"
  | "completeFixerContract"
  | "gainFactionReputation"
  | "buyInstallCyberware"
  | "useRipperdocService"
  | "listSellBlackMarketItem"
  | "buyHousing"
  | "unlockDistrict"
  | "reachLocalStanding"
  | "reduceDistrictThreat"
  | "craftItem"
  | "equipItem"
  | "completeCompanionInteraction"
  | "makeChoice";
export type StoryArcStatus = "locked" | "available" | "active" | "completed";
export type FactionConflictStatus = "cold" | "rising" | "open" | "resolved";

export type RewardBundle = Partial<Record<ResourceId, number>>;

export interface SkillState {
  level: number;
  xp: number;
}

export interface RewardPopupLine {
  id: string;
  label: string;
  category: RewardPopupCategory;
  amount?: number;
}

export interface RewardPopupGroup {
  id: string;
  title: string;
  category: RewardPopupCategory;
  lines: RewardPopupLine[];
  createdAt: number;
  expiresAt: number;
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
  districtReq?: DistrictId;
  requiredItems?: Record<string, number>;
  requiredUnlocks?: string[];
  sourceHint?: string;
  durationMs: number;
  xpReward: number;
  masteryXpReward: number;
  masteryPoolXpReward?: number;
  rewards: RewardBundle;
  rareDrops?: EnemyDrop[];
  traceChance?: number;
  traceSeverity?: number;
  threatChange?: number;
  localStandingChange?: number;
  manualCompletionRequired?: boolean;
  simCacheEligible?: boolean;
  recommendedTools?: string[];
  recommendedPrograms?: string[];
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

export interface CombatModifier {
  id: string;
  label: string;
  description: string;
  damageMultiplier?: number;
  rewardMultiplier?: number;
  dropChance?: number;
  heatChange?: number;
  neuralInstabilityChange?: number;
}

export interface CombatAffinity {
  id: string;
  label: string;
  weaponClasses?: WeaponClassId[];
  weaponTags?: string[];
  damageTypes?: DamageType[];
  attachmentTags?: string[];
  modTags?: string[];
  scenarioTags?: string[];
  cyberwareTags?: string[];
  damageMultiplier: number;
  heatMultiplier?: number;
  dropChance?: number;
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
  armorPenetration?: number;
  heatModifier?: number;
  neuralInstabilityModifier?: number;
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
  useEffect?: "heal";
  weaponClass?: WeaponClassId;
  attachmentSlots?: AttachmentCategory[];
  modSlots?: number;
  attachmentCategory?: AttachmentCategory;
  compatibleWeaponClasses?: WeaponClassId[];
  scenarioModifiers?: ScenarioModifier[];
  specialEffect?: string;
}

export interface WeaponClassDefinition {
  id: WeaponClassId;
  name: string;
  description: string;
  unlockRequirements: string[];
  relatedArchetypes: ArchetypeId[];
  relatedTags: string[];
  milestones: Array<{ level: number; name: string; description: string; modifiers: Partial<ActiveModifiers> }>;
}

export interface WeaponClassState {
  level: number;
  xp: number;
  manuallyUsed: boolean;
  milestones: Record<number, boolean>;
}

export interface WeaponLoadoutState {
  attachments: Partial<Record<AttachmentCategory, string>>;
  mods: string[];
}

export interface ScenarioModifier {
  tags: string[];
  description: string;
  modifiers?: Partial<ActiveModifiers>;
  damageBonus?: number;
  successChance?: number;
  heatChange?: number;
  dropChance?: number;
}

export interface PercentDropEntry {
  itemId: string;
  chancePercent: number;
  minQuantity: number;
  maxQuantity: number;
  rarity: ItemRarity;
  firstTimeBonus?: boolean;
  requirements?: string[];
  affectedByDropModifiers: boolean;
  affectedByScenarioModifiers: boolean;
}

export interface DropDiscoveryState {
  revealedDrops: Record<string, boolean>;
  revealedChances: Record<string, boolean>;
}

export interface WeaponStatistics {
  killsByClass: Partial<Record<WeaponClassId, number>>;
  damageByClass: Partial<Record<WeaponClassId, number>>;
  jobsByClass: Partial<Record<WeaponClassId, number>>;
  operationsByClass: Partial<Record<WeaponClassId, number>>;
  rareDropsFound: number;
  attachmentDropsFound: number;
  modsInstalled: number;
  weaponsUpgraded: number;
  dropRatesRevealed: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  category: "Components" | "Cyberware" | "Weapons" | "Attachments" | "Weapon Mods" | "Ammo/Power Cells" | "Upgrade Parts" | "Armor" | "Consumables" | "Upgrades";
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
  archetype?: EnemyArchetypeId;
  difficulty?: EnemyDifficultyTier;
  variants?: EnemyVariantId[];
  traits?: EnemyTraitId[];
  weaknesses?: CombatAffinity[];
  resistances?: CombatAffinity[];
  armorType?: ArmorType;
  armor?: number;
  behaviorTags?: string[];
  preferredDistrict?: DistrictId;
  factionAlignment?: FactionId;
  threatScaling?: number;
  specialLootCategory?: string;
  combatModifiers?: CombatModifier[];
  operationModifiers?: CombatModifier[];
  damageTypes?: DamageType[];
  recommendedLoadoutTags?: string[];
  requiredCombatLevel?: number;
  creditsReward: number;
  xpReward: number;
  reputationReward: number;
  drops: EnemyDrop[];
}

export interface Boss extends Enemy {
  armor: number;
  mechanics: string[];
  phases?: BossPhase[];
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
  routeId?: OperationRouteId;
  startedAt: number;
  durationMs: number;
  stageIndex: number;
}

export interface CurrentCombat {
  enemyId: string;
  startedAt: number;
  durationMs: number;
  enemyCurrentHp?: number;
  enemyMaxHp?: number;
  nextPlayerAttackAt?: number;
  nextEnemyAttackAt?: number;
  respawnAt?: number;
  lastPlayerAttackAt?: number;
  lastEnemyAttackAt?: number;
  lastPlayerHit?: {
    amount: number;
    at: number;
  };
  lastEnemyHit?: {
    amount: number;
    at: number;
  };
  lastDamageTaken?: number;
  lastHealingReceived?: number;
}

export type PlayerLifeState = "alive" | "downed";
export type AutoHealThreshold = 25 | 40 | 60 | 75;

export interface PlayerHealthState {
  currentHp: number;
  lifeState: PlayerLifeState;
  lastDamageTaken: number;
  lastHealingReceived: number;
  lastDamageSource?: string;
  lastHealingSource?: string;
  downedAt?: number;
  recoveryAvailableAt?: number;
}

export interface AutoHealSettings {
  unlocked: boolean;
  enabled: boolean;
  threshold: AutoHealThreshold;
  itemId: string;
  stopIfNoHealing: boolean;
}

export interface HealthStatistics {
  totalDamageTaken: number;
  totalHealingReceived: number;
  healingItemsUsed: number;
  deaths: number;
  deathsByEnemy: Record<string, number>;
  deathsByOperation: Record<string, number>;
  autoHealsTriggered: number;
  ripperdocRecoveries: number;
  lowestHpSurvived: number | null;
  damageReducedByArmor: number;
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
  modifiers?: CombatModifier[];
  recommendedTags?: string[];
}

export interface OperationRoute {
  id: OperationRouteId;
  name: string;
  description: string;
  requirements: string[];
  recommendedTags: string[];
  successModifier: number;
  enemyDamageMultiplier?: number;
  heatChange?: number;
  neuralInstabilityChange?: number;
  rewardMultiplier?: number;
  rareDropModifier?: number;
  factionConsequences?: Partial<Record<FactionId, number>>;
  bonusDrop?: EnemyDrop;
}

export interface OperationMechanic {
  id: string;
  name: string;
  description: string;
  tags: string[];
  successModifier?: number;
  damageMultiplier?: number;
  heatChange?: number;
  threatChange?: number;
  neuralInstabilityChange?: number;
  rewardMultiplier?: number;
  rareDropModifier?: number;
  warning?: string;
}

export interface BossPhase {
  thresholdPercent: number;
  name: string;
  modifiers: CombatModifier[];
  specialAttack: string;
  heatChange?: number;
  neuralInstabilityChange?: number;
  rareDropModifier?: number;
  logMessage: string;
}

export interface OperationDefinition {
  id: string;
  name: string;
  districtId: DistrictId;
  description: string;
  unlockRequirements: string[];
  recommendedStats: string[];
  recommendedLoadoutTags?: string[];
  requiredItems?: Record<string, number>;
  stages: OperationStage[];
  mechanics?: OperationMechanic[];
  routes?: OperationRoute[];
  defaultRouteId?: OperationRouteId;
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
  routeId?: OperationRouteId;
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
  ripperdocId?: string;
  name: string;
  description: string;
  districtId: DistrictId;
  category?: RipperdocCategory;
  cost: RewardBundle;
  materialRequirements?: Record<string, number>;
  requirements: string[];
  factionDiscount?: FactionId;
  fixerTrustDiscount?: string;
  heatChange?: number;
  neuralInstabilityChange?: number;
  riskLevel?: number;
  risk?: string;
  effects?: string[];
  temporaryEffect?: RipperdocTemporaryEffectDefinition;
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

export interface RipperdocTemporaryEffectDefinition {
  id: string;
  name: string;
  description: string;
  modifiers: Partial<ActiveModifiers>;
  durationMs?: number;
  uses?: number;
  downside?: string;
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
  limitedStockRefreshAt?: number;
}

export interface ActiveRipperdocEffect extends RipperdocTemporaryEffectDefinition {
  serviceId: string;
  sourceName: string;
  startedAt: number;
  expiresAt?: number;
  remainingUses?: number;
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

export interface DistrictMasteryState {
  level: number;
  xp: number;
  milestones: Record<number, boolean>;
}

export interface StreetLegendState {
  rank: number;
  xp: number;
  totalXp: number;
  claimedMilestones: Record<number, boolean>;
}

export interface ChallengeContractProgress {
  completedTiers: Record<string, boolean>;
}

export interface EndgameStatistics {
  streetLegendXpEarned: number;
  challengeContractsCompleted: number;
  highThreatClears: number;
  apexEnemiesKilled: number;
  legacyCraftsCompleted: number;
  iconicCyberwareObtained: number;
  prestigeCount: number;
}

export interface PrestigeProtocolState {
  unlocked: boolean;
  skillPrestiges: Partial<Record<SkillId, number>>;
  districtPrestiges: Partial<Record<DistrictId, number>>;
  weaponClassPrestiges: Partial<Record<WeaponClassId, number>>;
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
  passiveModifiers?: Partial<ActiveModifiers>;
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
  trustRewards?: Array<{ rank: number; description: string }>;
  uniqueUnlocks?: string[];
  operationLeads?: string[];
  districtLeads?: DistrictId[];
  marketConnections?: string[];
  ripperdocConnections?: string[];
}

export interface FixerState {
  trust: number;
  completedJobs: number;
  completedChains?: Record<string, boolean>;
}

export interface JobContract {
  id: string;
  name: string;
  fixerId: string;
  districtId: DistrictId;
  factionId: FactionId;
  contractType?: ContractType;
  tags: string[];
  description: string;
  durationMs: number;
  requirements: string[];
  baseSuccessChance: number;
  recommendedLoadoutTags?: string[];
  heatChange: number;
  neuralInstabilityChange?: number;
  rewards: RewardBundle;
  skillXp?: Partial<Record<SkillId, number>>;
  factionReputation: Partial<Record<FactionId, number>>;
  companionRelationship?: Record<string, number>;
  fixerTrustReward: number;
  rareReward?: string;
  rareRewardTable?: PercentDropEntry[];
  failureOutcomes?: string[];
  repeatable: boolean;
  manualFirstCompletion?: boolean;
  autoRepeatTrustReq?: number;
  factionConflict?: boolean;
}

export interface RipperdocHistory {
  servicesUsed: number;
  cyberwareInstalled: number;
  cyberwareSold: number;
  cyberwareBought: number;
}

export interface BlackMarketListing {
  id: string;
  itemId: string;
  quantity: number;
  askingPrice: number;
  strategy: BlackMarketStrategy;
  progress: number;
  durationMs: number;
  startedAt: number;
  saleChance: number;
  heatRisk: number;
  buyerRisk: number;
  status: BlackMarketListingStatus;
  outcome?: string;
}

export interface MarketStatistics {
  contractsCompletedByFixer: Record<string, number>;
  contractsFailed: number;
  ripperdocServicesUsed: number;
  cyberwareInstalledByRipperdocs: number;
  cyberwareSoldToRipperdocs: number;
  blackMarketListingsCreated: number;
  blackMarketSalesCompleted: number;
  blackMarketItemsSeized: number;
  blackMarketCreditsEarned: number;
  heatFromMarketActivity: number;
  skillActionsCompletedBySkill: Partial<Record<SkillId, number>>;
  rareDropsBySkill: Partial<Record<SkillId, number>>;
  traceEvents: number;
  scavengingFinds: number;
  cyberwareRepaired: number;
  vehicleTuningActions: number;
  medicalTreatments: number;
  streetcraftFavors: number;
  simCacheRunsBySkill: Partial<Record<SkillId, number>>;
}

export interface BlackMarketAutomation {
  autoListRareItems: boolean;
  autoSellCommonCyberware: boolean;
  autoPauseHighHeat: boolean;
  autoQuickSaleHighHeat: boolean;
  autoClaimCompleted: boolean;
}

export interface StoryObjective {
  type: StoryObjectiveType;
  target: string;
  requiredCount: number;
  districtId?: DistrictId;
  activityId?: string;
}

export interface StoryChoice {
  id: string;
  label: string;
  description: string;
  knownConsequences: string[];
  rewards?: RewardBundle;
  heatChange?: number;
  neuralInstabilityChange?: number;
  districtThreat?: Partial<Record<DistrictId, number>>;
  localStanding?: Partial<Record<DistrictId, number>>;
  factionReputation?: Partial<Record<FactionId, number>>;
  fixerTrust?: Record<string, number>;
  companionRelationship?: Record<string, number>;
  worldFlags?: string[];
  operationLeads?: string[];
  permanent?: boolean;
}

export interface StoryStepDefinition {
  id: string;
  title: string;
  description: string;
  objective: StoryObjective;
  choices?: StoryChoice[];
  rewards?: RewardBundle;
  worldFlags?: string[];
  unlocks?: string[];
  nextStepIds?: string[];
}

export interface StoryArcDefinition {
  id: string;
  name: string;
  description: string;
  category: StoryCategory;
  districtId?: DistrictId;
  involvedFixers: string[];
  involvedFactions: FactionId[];
  involvedCompanions: string[];
  requiredProgressionTier?: string;
  unlockRequirements: string[];
  steps: StoryStepDefinition[];
  rewards?: RewardBundle;
  outcomeFlags: string[];
  roadmap?: boolean;
}

export interface StoryChoiceRecord {
  arcId: string;
  stepId: string;
  choiceId: string;
  label: string;
  timestamp: number;
}

export interface StoryArcState {
  status: StoryArcStatus;
  activeStepId: string | null;
  completedSteps: Record<string, boolean>;
  choices: Record<string, string>;
  outcomeFlags: Record<string, boolean>;
  rewardsClaimed: boolean;
}

export interface FactionConflictState {
  status: FactionConflictStatus;
  score: number;
  playerLeaning: FactionId | "neutral";
  decisions: Record<string, string>;
}

export interface ActiveModifiers {
  skillXp: Partial<Record<SkillId, number>>;
  skillRewards: number;
  actionSpeed: number;
  combatMaxHp: number;
  combatDamage: number;
  combatDefense: number;
  combatAttackSpeed: number;
  healingReceived: number;
  hpRegen: number;
  damageReduction: number;
  dodgeChance: number;
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
  health: PlayerHealthState;
  autoHeal: AutoHealSettings;
  healthStatistics: HealthStatistics;
  enemyLog: Record<string, EnemyLog>;
  unlocks: Record<string, boolean>;
  districts: Record<DistrictId, DistrictState>;
  districtMastery: Record<DistrictId, DistrictMasteryState>;
  streetLegend: StreetLegendState;
  challengeProgress: Record<string, ChallengeContractProgress>;
  highThreatOperationClears: Record<string, number>;
  collectionRewardsClaimed: Record<string, boolean>;
  prestigeProtocol: PrestigeProtocolState;
  endgameStatistics: EndgameStatistics;
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
  weaponClasses: Record<WeaponClassId, WeaponClassState>;
  weaponLoadouts: Record<string, WeaponLoadoutState>;
  dropDiscovery: Record<string, DropDiscoveryState>;
  weaponStatistics: WeaponStatistics;
  selectedDistrict: DistrictId | null;
  lastVisitedDistrict: DistrictId | null;
  districtDiscoveries: Record<DistrictId, Record<string, boolean>>;
  ripperdocUnlocks: Record<string, boolean>;
  ripperdocHistory: RipperdocHistory;
  activeRipperdocEffects: ActiveRipperdocEffect[];
  vendors: Record<string, VendorState>;
  blackMarketListings: BlackMarketListing[];
  blackMarketCompletedSales: BlackMarketListing[];
  blackMarketAutomation: BlackMarketAutomation;
  marketStatistics: MarketStatistics;
  storyArcs: Record<string, StoryArcState>;
  storyFlags: Record<string, boolean>;
  storyChoices: StoryChoiceRecord[];
  operationLeads: Record<string, boolean>;
  factionConflicts: Record<string, FactionConflictState>;
  districtStanding: Record<DistrictId, DistrictStandingState>;
  districtEvents: Record<string, boolean>;
  travelUnlocks: Record<string, boolean>;
  equipmentPresets: Record<string, {
    name: string;
    gear: Partial<Record<GearSlot, string>>;
    cyberware: Partial<Record<CyberwareSlot, string>>;
  }>;
  rewardPopups: RewardPopupGroup[];
  recentLog: GameLogEntry[];
  offlineRecap: OfflineRecap | null;
  lastSavedAt: number;
}
