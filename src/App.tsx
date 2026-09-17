import { MobileSectionMenu } from "./components/MobileSectionMenu";
import { rpgMissions, rpgSideGigs } from "./data/rpgCampaign";
import { QuickhackPanel } from "./components/QuickhackPanel";
import { NetworkHero } from "./components/NetworkHero";
import { NetworkHeader } from "./components/NetworkHeader";
import { itemAttributeRequirement, meetsItemAttributeRequirement, upgradeTechnicalRequirement } from "./systems/runnerProgression";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  Cpu,
  Wrench,
  HeartPulse,
  Store,
  ChevronRight,
  ChevronDown,
  MapPin,
  Zap,
  ArrowDown,
  ArrowUp,
  Backpack,
  BrainCircuit,
  FileText,
  Gift,
  Lock,
  MapPinned,
  Download,
  MoreHorizontal,
  PackageSearch,
  Play,
  RotateCcw,
  Save,
  Shield,
  ShieldAlert,
  Square,
  Star,
  Sword,
  Target,
  Timer,
  TrendingUp,
  Unlock,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import cyberwareBackgroundImage from "./assets/cyberware/CyberwareBackground.png";
import corporateDefectorPathImage from "./assets/starting-paths/CorporateDefector.png";
import outriderPathImage from "./assets/starting-paths/Outrider.png";
import streetbornPathImage from "./assets/starting-paths/Streetborn.png";
import { companions } from "./data/companions";
import { combatZones } from "./data/combat";
import { districtEvents } from "./data/districtEvents";
import { districts } from "./data/districts";
import { factions } from "./data/factions";
import { factionMilestones } from "./data/factionMilestones";
import { fixers } from "./data/fixers";
import { ripperdocClinics, type RipperdocClinic } from "./data/ripperdocClinics";
import { housingOptions } from "./data/housing";
import { cyberwareSlots, items, itemNames } from "./data/items";
import { cyberwareOverlaySlots, type CyberwareOverlaySlot } from "./data/cyberwareOverlayData";
import { percentDropTables } from "./data/percentDrops";
import { weaponClasses, weaponClassOrder } from "./data/weaponClasses";
import { resourceNames, resourceOrder } from "./data/resources";
import { skillActions, skillDescriptions, skillNames, skillOrder } from "./data/skills";
import { startingPaths } from "./data/startingPaths";
import {
  canAffordRewards,
  formatRewards,
  actionMasteryXpReward,
  actionXpRewardWithMastery,
  startSkillAction,
  stopSkillAction,
  processActionCompletion,
} from "./systems/actionProcessing";
import { canFightEnemy, getEnemy, processCombat, startCombat, stopCombat } from "./systems/combatProcessing";
import { processCrafting, startCraft, stopCraft } from "./systems/craftingProcessing";
import { chooseStartingPath, cloneState, createInitialState } from "./systems/gameState";
import { canAttemptJob, jobRequirementDetails, processJobCompletion, startJob, stopJob } from "./systems/jobProcessing";
import { jobs } from "./data/jobs";
import { bosses } from "./data/bosses";
import { operations } from "./data/operations";
import { vehicles } from "./data/vehicles";
import { adjustedActionDurationMs, adjustedDurationMs, getActiveModifiers } from "./systems/modifiers";
import { heatTier, neuralInstabilityTierName } from "./systems/riskEvents";
import {
  playerCombatStats,
  totalLevel,
  xpForNextLevel,
  xpForNextMastery,
  xpForNextDistrictMastery,
} from "./systems/formulas";
import { applyOfflineProgress } from "./systems/offlineProgress";
import { exportSave, getActiveSaveSlot, importSave, loadGame, resetSave, saveGame, saveSlotSummaries, setActiveSaveSlot, type SaveSlotId, type SaveSlotSummary } from "./systems/saveSystem";
import { buyHousing, giveCompanionGift, setActiveCompanion, setActiveResidence, spendTimeWithCompanion } from "./systems/worldProgression";
import { recipes } from "./data/recipes";
import { getItem, gearSlots } from "./data/items";
import { cyberwareInstabilityLoad, cyberwareLoad, effectiveNeuralInstability, scaledStats } from "./systems/itemFormulas";
import { equipItem, unequipCyberware, unequipGear, useItem } from "./systems/equipmentSystem";
import { canQuickSellInventoryItem, inventoryQuickSellValue, inventorySellAllButOneCount, quickSellAllButOne, quickSellInventoryItem } from "./systems/inventorySellSystem";
import { canAffordItemUpgrade, itemUpgradeCost, upgradeItem } from "./systems/upgradeSystem";
import { scaledCraftingCosts } from "./systems/craftingCosts";
import { compatibleAttachments, compatibleMods, equippedWeaponClass, installAttachment, installWeaponMod, removeAttachment, removeWeaponMod, weaponXpForNextLevel } from "./systems/weaponSystem";
import { dropRevealState } from "./systems/percentDrops";
import { loadPreset, savePreset } from "./systems/presetSystem";
import { runBasicSimCache, simCacheEligibility } from "./systems/simCacheEngine";
import { getSimulationEfficiency } from "./systems/simulationEfficiency";
import { masteryPoolPercent, masteryPoolCheckpoints } from "./systems/masteryPool";
import { progressionTiers, tierProgress } from "./data/progressionTiers";
import { attributeDefinitions, rpgPerks } from "./data/rpgCampaign";
import { districtSpecificMaterials, nextDistrictMasteryMilestone } from "./data/districtMastery";
import { nextActionMasteryMilestone } from "./data/actionMasteryMilestones";
import { canStartOperation, operationRequirementDetails, operationLoadoutReadiness, processOperation, startOperation, stopOperation } from "./systems/operationProcessor";
import { buyVehicle, canBuyVehicle, garageSlots, setActiveVehicle, upgradeVehicle } from "./systems/vehicleSystem";
import { threatTier } from "./systems/districtThreat";
import { cityDistrictOrder, districtCompletionBreakdown, districtCompletionDebug, districtCompletionPercent, getDistrict } from "./data/cityMap";
import {
  districtCombatZones,
  districtCompanions,
  districtFixers,
  districtHousing,
  districtJobs,
  districtOperations,
  districtRipperdocs,
  districtSkillActions,
} from "./systems/districtActivities";
import { getDistrictModifiers } from "./systems/districtModifiers";
import { districtThreatPenalty } from "./systems/districtThreat";
import { travelToDistrict } from "./systems/travelSystem";
import { districtActivitySummaries, districtContentMap, type DistrictActivityCategory, type DistrictCategorySummary } from "./systems/districtActivityMap";
import { equipmentIconForItem } from "./systems/equipmentIcons";
import {
  buyCyberwareFromRipperdoc,
  canBuyCyberwareFromRipperdoc,
  canUseRipperdocService,
  ripperdocBuyPrice,
  useRipperdocService,
} from "./systems/ripperdocSystem";
import {
  blackMarketEligibleItems,
  expectedBlackMarketValue,
  listBlackMarketItem,
  processBlackMarketListings,
} from "./systems/blackMarketSystem";
import {
  buyVendorItem,
  canBuyVendorItem,
  canSellVendorItem,
  canUseVendor,
  districtVendors,
  sellValue,
  sellVendorItem,
  vendorItemUnlocked,
  vendorLimitedStockRefreshAt,
  vendorLimitedStockRemaining,
  vendorPrice,
} from "./systems/vendorSystem";
import { ActivityCard, FactionBadge, LockedOverlay, ModifierList, NeonPanel, RequirementList, TerminalLog, ThreatMeter } from "./components/cyberpunk";
import { DistrictMap } from "./components/DistrictMap";
import { ProgressionGuide } from "./components/ProgressionGuide";
import { RpgHub, BuildPanel, type MainSection } from "./components/RpgHub";
import { rpgXpNeeded, missionById } from "./systems/rpgSystem";
import { RewardPopupContainer } from "./components/RewardPopups";
import { InfoButton, ScreenHelpPanel } from "./components/InfoPopover";
import { ClickableItemRequirement, ItemSourcePopover, RequirementBulletList } from "./components/ItemSourcePopover";
import { contractType, failureOutcomes, fixerTrustRank, fixerTrustRewards, fixerUnlockSummary, jobRiskTier, recommendedLoadoutTags } from "./systems/fixerContracts";
import { archetypeScores, detectedSignatureBuild } from "./systems/archetypeScoring";
import { combatEffectivenessForEnemy } from "./systems/combatMatchups";
import {
  calculateDropChance,
  calculateEstimatedKillTime,
  calculateHeatEffects,
  calculateInstabilityEffects,
  calculateJobRewards,
  calculateJobSuccessChance,
  calculatePlayerCombatStats,
  calculateRarityAdjustedShopBasePrice,
  calculateRipperdocServiceCost,
  calculateSkillActionRewards,
  calculateSimulationEfficiency,
  calculateVendorPrice,
} from "./systems/balanceFormulas";
import {
  calculateMaxHP,
  defaultHealingItemId,
  estimateCombatSafety,
  healingItems,
  recoverFromDowned,
  useHealingItem,
  applyPassiveRecovery,
  unlockAutoHeal,
} from "./systems/healthSystem";
import { balanceConfig, BALANCE_VERSION } from "./data/balanceConfig";
import { districtLevelBandLabel, hasAnyMainSkillLevel, MAX_MAIN_SKILL_LEVEL } from "./data/levelBands";
import { storyArcs } from "./data/storyArcs";
import { activeStoryStep, availableStoryArcsForDistrict, chooseStoryChoice, storyArcState, storyObjectiveProgress, storyProgressForArc, updateStoryProgress } from "./systems/storySystem";
import { getContentValidationReport, reportContentValidation } from "./systems/contentValidation";
import { syncChallengeProgress, challengeObjectiveProgress, challengeObjectiveText } from "./systems/challengeProgressProcessor";
import { streetLegendRankProgress, syncStreetLegend } from "./systems/streetLegendProcessor";
import { challengeContracts } from "./data/challengeContracts";
import { highThreatOperations, legacyCraftingGoals, iconicCyberwareGoals, collectionRewardMilestones, prestigeProtocolNotes } from "./data/endgameSystems";
import { nextStreetLegendMilestone, streetLegendMilestones } from "./data/streetLegendData";
import { actionAccessRequirementText, meetsActionAccessRequirement } from "./systems/actionAccess";
import { updateWorldUnlocks } from "./systems/worldUnlocks";
import { campaignOperations } from "./data/campaign";
import { campaignProgress, canAssembleLegacy, assembleLegacy, highThreatUnlocked, startHighThreat, prestigeSkill, collectionPercent, claimCollectionReward } from "./systems/endgameProgress";
import { startAutoSave } from "./systems/autoSave";
import { getItemSources } from "./systems/itemSourceLookup";
import type { ActiveModifiers, AttachmentCategory, BlackMarketStrategy, CombatZone, CraftingRecipe, CyberwareSlot, DistrictId, Enemy, EnemyDrop, FactionId, GameState, GearSlot, ItemDefinition, ItemRarity, ItemStats, ItemType, JobContract, OperationDefinition, OperationRoute, OperationRouteId, ResourceId, RewardBundle, RipperdocService, SkillAction, SkillId, StartingPathId, VendorDefinition, VendorItemEntry, WeaponClassId } from "./types";

type TabId = "field" | "city" | "more";
type NoticeTabId = TabId | "inventory";
type CharacterSectionId = "gear" | "cyberware" | "quickhacks" | "attributes" | "health" | "presets";
type TabNotice = { key: string; title: string; detail: string };

const tabs: Array<{ id: TabId; label: string; Icon: typeof Activity }> = [
  { id: "city", label: "Map", Icon: Activity },
  { id: "field", label: "Main", Icon: FileText },
  { id: "more", label: "Menu", Icon: MoreHorizontal },
];

const characterSections: Array<{ id: CharacterSectionId; label: string }> = [
  { id: "gear", label: "Gear & inventory" },
  { id: "cyberware", label: "Cyberware" },
  { id: "quickhacks", label: "Quickhacks" },
  { id: "attributes", label: "Attributes & perks" },
  { id: "health", label: "Health" },
  { id: "presets", label: "Presets" },
];

const isDevBuild = Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);

const startingPathImages: Record<StartingPathId, string> = {
  outrider: outriderPathImage,
  streetborn: streetbornPathImage,
  corporateDefector: corporateDefectorPathImage,
};

function App() {
  const [activeSaveSlot, setActiveSaveSlotState] = useState<SaveSlotId>(() => getActiveSaveSlot());
  const [state, setState] = useState<GameState>(() => loadInitialGameState(getActiveSaveSlot()));
  const latestSave = useRef({ state, slot: activeSaveSlot });
  latestSave.current = { state, slot: activeSaveSlot };
  const [reviewedNoticeKeys, setReviewedNoticeKeys] = useState<Set<string>>(() => loadReviewedNoticeKeys(getActiveSaveSlot()));
  const [tabNoticesEnabled, setTabNoticesEnabled] = useState(loadTabNoticesEnabled);
  const [tab, setTab] = useState<TabId>("field");
  const [mainSection, setMainSection] = useState<MainSection>("home");
  const [now, setNow] = useState(Date.now());
  const [exported, setExported] = useState("");
  const [importPayload, setImportPayload] = useState("");
  const [characterSection, setCharacterSection] = useState<CharacterSectionId>("gear");
  const [moreSection, setMoreSection] = useState<MoreSection>("story");
  const [simMenuOpen, setSimMenuOpen] = useState(false);
  const [cityOpenRequest, setCityOpenRequest] = useState<{ districtId: DistrictId | null; category?: DistrictHubCategory; token: number } | null>(null);

  useEffect(() => {
    if (isDevBuild) reportContentValidation();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setState((current) => {
      const now = Date.now();
      const recovered = cloneState(current);
      applyPassiveRecovery(recovered, Math.max(0, now - current.lastSavedAt));
      unlockAutoHeal(recovered);
      recovered.lastSavedAt = now;
      const next = updateStoryProgress(processBlackMarketListings(processOperation(processCombat(processJobCompletion(processCrafting(processActionCompletion(recovered, now), now), now), now), now), now));
      const progressState = next === current ? cloneState(current) : next;

      syncChallengeProgress(progressState);
      syncStreetLegend(progressState);
      const signature = detectedSignatureBuild(progressState);
      if (signature && progressState.signatureBuildCache !== signature.id) {
        progressState.signatureBuildCache = signature.id;
        progressState.achievements["first-signature-build"] = true;
      }
      return progressState;
    });
  }, [now]);

  useEffect(() => startAutoSave(() => latestSave.current), []);

  useEffect(() => {
    saveGame(state, activeSaveSlot);
  }, [
    activeSaveSlot,
    state.startingPath,
    state.activeAction,
    state.currentCombat,
    state.activeOperation,
    state.activeCraft,
    state.resources.credits,
    state.resources.heat,
    state.neuralInstability,
    state.activeResidence,
    state.equippedGear,
    state.equippedCyberware,
    state.activeVehicle,
    state.vendors,
    state.districtStanding,
    state.districtEvents,
    state.perkPointsEarned,
    state.perkRanks,
    state.respecCount,
    state.signatureBuildCache,
    state.blackMarketListings,
    state.blackMarketCompletedSales,
    state.marketStatistics,
    state.storyArcs,
    state.storyFlags,
    state.storyChoices,
    state.operationLeads,
    state.factionConflicts,
  ]);

  const activeAction = state.activeAction ? skillActions.find((action) => action.id === state.activeAction?.actionId) : null;
  const activeEnemy = state.currentCombat ? getEnemy(state.currentCombat.enemyId) : null;
  const activeJob = state.activeJob ? jobs.find((job) => job.id === state.activeJob?.jobId) : null;
  const activeCraft = state.activeCraft ? recipes.find((recipe) => recipe.id === state.activeCraft?.recipeId) : null;
  const activeOperation = state.activeOperation ? operations.find((operation) => operation.id === state.activeOperation?.operationId) : null;
  const active = activeActivity(state, now);
  const selectedStartingPath = state.startingPath ? startingPaths.find((path) => path.id === state.startingPath) : null;
  const perkPointsAvailable = state.rpg.attributePoints + state.rpg.perkPoints;
  const runnerProgress = { level: state.rpg.level, currentTotalLevel: state.rpg.xp, nextMilestone: rpgXpNeeded(state.rpg.level), percent: state.rpg.level >= 30 ? 100 : state.rpg.xp / rpgXpNeeded(state.rpg.level) * 100 };
  const cityNotices = tabNoticesEnabled ? unreviewedTabNotices(state, "city", reviewedNoticeKeys) : [];
  const inventoryNotices = tabNoticesEnabled ? unreviewedTabNotices(state, "inventory", reviewedNoticeKeys) : [];
  const setTabNoticePreference = (enabled: boolean) => {
    setTabNoticesEnabled(enabled);
    saveTabNoticesEnabled(enabled);
  };
  const markNoticeReviewed = (key: string) => {
    setReviewedNoticeKeys((current) => {
      const next = new Set(current);
      next.add(key);
      saveReviewedNoticeKeys(activeSaveSlot, next);
      return next;
    });
  };
  const markTabNoticesReviewed = (id: NoticeTabId) => {
    setReviewedNoticeKeys((current) => {
      const next = new Set(current);
      tabNotices(state, id).forEach((notice) => next.add(notice.key));
      saveReviewedNoticeKeys(activeSaveSlot, next);
      return next;
    });
  };
  const openCityTab = () => {
    setCityOpenRequest(active?.districtId ? { districtId: active.districtId, category: active.category, token: Date.now() } : null);
    setTab("city");
  };

  if (!state.startingPath) {
    return (
      <StartingPathScreen
        activeSaveSlot={activeSaveSlot}
        saveSlots={saveSlotSummaries()}
        onChoose={(pathId) => setState((current) => chooseStartingPath(current, pathId))}
        onSwitchSave={(slot) => {
          saveGame(state, activeSaveSlot);
          setActiveSaveSlot(slot);
          setActiveSaveSlotState(slot);
          setReviewedNoticeKeys(loadReviewedNoticeKeys(slot));
          setState(loadInitialGameState(slot));
        }}
        onNewSave={(slot) => {
          saveGame(state, activeSaveSlot);
          setActiveSaveSlot(slot);
          setActiveSaveSlotState(slot);
          setReviewedNoticeKeys(loadReviewedNoticeKeys(slot));
          setState(createInitialState());
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        {state.rpg.active ? <button className="topbar-activity-progress" onClick={() => { setTab("field"); setMainSection("journal"); }}><p className="eyebrow">Field Mission / Awaiting Your Move</p><h1>{missionById(state.rpg.active.missionId)?.title ?? "Active mission"}</h1></button> : <TopbarActivityProgress activity={active} onOpen={openCityTab} onStop={() => setState((current) => stopOperation(stopCombat(stopJob(stopCraft(stopSkillAction(current))))))} />}
        <button className={`player-level-alert ${perkPointsAvailable > 0 ? "has-points" : ""}`} onClick={() => {
            setTab("field");
            setMainSection("character");
            setCharacterSection("attributes");
          }}>
          <span>Runner Lv {runnerProgress.level}</span>
          <strong>
            {perkPointsAvailable > 0
              ? `${perkPointsAvailable} RPG build point${perkPointsAvailable === 1 ? "" : "s"} available`
              : `${runnerProgress.currentTotalLevel} / ${runnerProgress.nextMilestone} character XP`}
          </strong>
          <i aria-hidden="true">
            <b style={{ width: `${runnerProgress.percent}%` }} />
          </i>
        </button>
        <div className="topbar-right">
          {selectedStartingPath && <StartingPathBadge pathId={selectedStartingPath.id} name={selectedStartingPath.name} />}
          <div className="top-stats">
            <StatPill label="Credits" value={state.resources.credits} />
            <StatPill label="HP" value={`${Math.floor(state.health.currentHp)}/${calculateMaxHP(state)}`} />
            <StatPill label="Rep" value={state.resources.reputation} />
            <StatPill label="Heat" value={state.resources.heat} />
            <StatPill label="IN" value={effectiveNeuralInstability(state)} />
          </div>
        </div>
      </header>

      <main className={`app-main app-main-${tab}`}>
        {state.offlineRecap && (
          <OfflineRecap
            state={state}
            onClose={() => setState((current) => ({ ...current, offlineRecap: null }))}
          />
        )}
        {tab === "city" && (
          <CityTab
            state={state}
            openRequest={cityOpenRequest}
            onSelectDistrict={(id) => setState((current) => travelToDistrict(current, id))}
            onStartSkill={(id) => setState((current) => startSkillAction(current, id))}
            onStartCombat={(id) => setState((current) => startCombat(current, id))}
            onUseRipperdoc={(id) => setState((current) => useRipperdocService(current, id))}
            onBuyRipperdocCyberware={(clinicId, itemId) => setState((current) => buyCyberwareFromRipperdoc(current, clinicId, itemId))}
            onBuyVendorItem={(vendorId, itemId) => setState((current) => buyVendorItem(current, vendorId, itemId))}
            onSellVendorItem={(vendorId, itemId) => setState((current) => sellVendorItem(current, vendorId, itemId))}
            onListBlackMarket={(itemId, strategy) => setState((current) => listBlackMarketItem(current, itemId, strategy))}
            onCraft={(id) => setState((current) => startCraft(current, id))}
            onStopCraft={() => setState(stopCraft)}
            onBuyHousing={(id) => setState((current) => buyHousing(current, id))}
            onSetResidence={(id) => setState((current) => setActiveResidence(current, id))}
            onBuyVehicle={(id) => setState((current) => buyVehicle(current, id))}
            onSetVehicle={(id) => setState((current) => setActiveVehicle(current, id))}
            onUpgradeVehicle={(id) => setState((current) => upgradeVehicle(current, id))}
            onUseHealingItem={(id) => setState((current) => {
              const next = cloneState(current);
              useHealingItem(next, id, "Manual Healing");
              return next;
            })}
            onStopActive={() => setState((current) => stopOperation(stopCombat(stopJob(stopCraft(stopSkillAction(current))))))}
            notices={cityNotices}
            onReviewNotice={markNoticeReviewed}
            onReviewAllNotices={() => markTabNoticesReviewed("city")}
          />
        )}
        {tab === "field" && <RpgHub state={state} onUpdate={setState} onServices={openCityTab} page={mainSection} onPage={setMainSection} onCharacterTool={setCharacterSection} inventoryNoticeCount={inventoryNotices.length}>
          {mainSection === "character" && (
            <CharacterTab
              state={state}
              onUpdate={setState}
              notices={inventoryNotices}
              onReviewNotice={markNoticeReviewed}
              onReviewAllNotices={() => markTabNoticesReviewed("inventory")}
              section={characterSection}
              onSection={setCharacterSection}
              onRecover={(mode) => setState((current) => {
                const next = cloneState(current);
                recoverFromDowned(next, mode);
                return next;
              })}
              onAutoHealChange={(patch) => setState((current) => ({ ...current, autoHeal: { ...current.autoHeal, ...patch } }))}
            />
          )}
          {mainSection === "progress" && <ProgressTab state={state} onUpdate={setState} />}
        </RpgHub>}
        {tab === "more" && (
          <MoreTab
            state={state}
            section={moreSection}
            onSection={setMoreSection}
            exported={exported}
            importPayload={importPayload}
            onGift={(id) => setState((current) => giveCompanionGift(current, id))}
            onSpendTime={(id) => setState((current) => spendTimeWithCompanion(current, id))}
            onSetCompanion={(id) => setState((current) => setActiveCompanion(current, id))}
            onStoryChoice={(arcId, stepId, choiceId) => setState((current) => chooseStoryChoice(current, arcId, stepId, choiceId))}
            onRunSimCache={(count) => setState((current) => runBasicSimCache(current, count))}
            onDebugGrantCache={() => setState((current) => ({ ...current, inventory: { ...current.inventory, "basic-sim-cache": (current.inventory["basic-sim-cache"] ?? 0) + 3 } }))}
            onDebugSetRisk={(heat, neuralInstability) => setState((current) => ({ ...current, resources: { ...current.resources, heat }, neuralInstability }))}
            onDebugGrantCredits={() => setState((current) => ({ ...current, resources: { ...current.resources, credits: current.resources.credits + 5000 } }))}
            onExport={() => setExported(exportSave(state))}
            onImportPayload={setImportPayload}
            onImport={() => {
              try {
                setState(importSave(importPayload));
                setImportPayload("");
              } catch {
                setImportPayload("Invalid save payload");
              }
            }}
            onReset={() => {
              if (window.confirm(`Reset save slot ${activeSaveSlot} and start over?`)) setState(resetSave(activeSaveSlot));
            }}
            onSave={() => saveGame(state, activeSaveSlot)}
            activeSaveSlot={activeSaveSlot}
            saveSlots={saveSlotSummaries()}
            onSwitchSave={(slot) => {
              saveGame(state, activeSaveSlot);
              setActiveSaveSlot(slot);
              setActiveSaveSlotState(slot);
              setReviewedNoticeKeys(loadReviewedNoticeKeys(slot));
              setState(loadInitialGameState(slot));
              setExported("");
              setImportPayload("");
            }}
            onNewSave={(slot) => {
              if (!window.confirm(`Start a new character in save slot ${slot}? Existing data in that slot will be overwritten.`)) return;
              saveGame(state, activeSaveSlot);
              setActiveSaveSlot(slot);
              setActiveSaveSlotState(slot);
              setReviewedNoticeKeys(loadReviewedNoticeKeys(slot));
              setState(createInitialState());
              setExported("");
              setImportPayload("");
            }}
            tabNoticesEnabled={tabNoticesEnabled}
            onTabNoticesEnabledChange={setTabNoticePreference}
          />
        )}
      </main>

      <FloatingSimCacheButton
        state={state}
        open={simMenuOpen}
        onToggle={() => setSimMenuOpen((value) => !value)}
        onClose={() => setSimMenuOpen(false)}
        onRun={(count) => {
          setState((current) => runBasicSimCache(current, count));
          setSimMenuOpen(false);
        }}
        onOpenFull={() => {
          setTab("more");
          setMoreSection("simCache");
          setSimMenuOpen(false);
        }}
      />

      <RewardPopupContainer
        popups={state.rewardPopups ?? []}
        now={now}
        onDismiss={(id) => setState((current) => ({ ...current, rewardPopups: (current.rewardPopups ?? []).filter((popup) => popup.id !== id) }))}
      />

      <nav className="bottom-nav" aria-label="Primary">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} className={tab === id ? "active" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => { if (id === "city") setCityOpenRequest({ districtId: null, token: Date.now() }); if (id === "field") setMainSection("home"); setTab(id); }}>
            <Icon size={20} />
            <span>{label}</span>
            {tabIndicator(state, id, reviewedNoticeKeys, tabNoticesEnabled) && <b className="tab-indicator">{tabIndicator(state, id, reviewedNoticeKeys, tabNoticesEnabled)}</b>}
          </button>
        ))}
      </nav>
    </div>
  );
}

function loadInitialGameState(slot: SaveSlotId = getActiveSaveSlot()) {
  try {
    const restored = applyOfflineProgress(loadGame(slot) ?? createInitialState());
    updateWorldUnlocks(restored);
    return restored;
  } catch (error) {
    console.warn("Startup state could not be restored. Starting clean.", error);
    const fresh = createInitialState();
    updateWorldUnlocks(fresh);
    return fresh;
  }
}

type MoreSection = "story" | "companions" | "itemIndex" | "simCache" | "balance" | "settings";

function tabIndicator(state: GameState, id: NoticeTabId, reviewed: Set<string>, enabled: boolean) {
  if (!enabled) return "";
  if ((id === "inventory" || id === "field") && unreviewedTabNotices(state, "inventory", reviewed).length > 0) return "New";
  if (id === "city" && unreviewedTabNotices(state, id, reviewed).length > 0) return "Next";
  return "";
}

function tabNotices(state: GameState, id: NoticeTabId): TabNotice[] {
  if (id === "inventory") return inventoryTabNotices(state);
  if (id === "city") return cityTabNotices(state);
  return [];
}

function unreviewedTabNotices(state: GameState, id: NoticeTabId, reviewed: Set<string>) {
  return tabNotices(state, id).filter((notice) => !reviewed.has(notice.key));
}

function inventoryTabNotices(state: GameState): TabNotice[] {
  return Object.entries(state.inventory)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      const item = getItem(id);
      if (!item || !["Weapon", "Armor", "Cyberware", "Consumable", "Blueprint"].includes(item.type)) return null;
      const action =
        item.type === "Blueprint" ? "Blueprint found" :
        item.type === "Consumable" ? "Consumable available" :
        item.type === "Cyberware" ? "Cyberware ready to inspect" :
        "Equipment ready to inspect";
      return {
        key: `inventory:${id}`,
        title: item.name,
        detail: `${action}. Qty ${count.toLocaleString()} in Inventory.`,
      };
    })
    .filter(Boolean) as TabNotice[];
}

function cityTabNotices(state: GameState): TabNotice[] {
  return nextUnlockTargets(state).slice(0, 6).map((target) => ({
    key: `city:${target.title}:${target.requirement}`,
    title: target.title,
    detail: target.requirement,
  }));
}

function loadReviewedNoticeKeys(slot: SaveSlotId) {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(reviewedNoticeStorageKey(slot)) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

function saveReviewedNoticeKeys(slot: SaveSlotId, keys: Set<string>) {
  localStorage.setItem(reviewedNoticeStorageKey(slot), JSON.stringify([...keys]));
}

function reviewedNoticeStorageKey(slot: SaveSlotId) {
  return `neon-idle-reviewed-notices-${slot}`;
}

function loadTabNoticesEnabled() {
  return localStorage.getItem("neon-idle-tab-notices-enabled") !== "false";
}

function saveTabNoticesEnabled(enabled: boolean) {
  localStorage.setItem("neon-idle-tab-notices-enabled", String(enabled));
}

function StartingPathScreen({
  activeSaveSlot,
  saveSlots,
  onChoose,
  onSwitchSave,
  onNewSave,
}: {
  activeSaveSlot: SaveSlotId;
  saveSlots: SaveSlotSummary[];
  onChoose: (pathId: StartingPathId) => void;
  onSwitchSave: (slot: SaveSlotId) => void;
  onNewSave: (slot: SaveSlotId) => void;
}) {
  const [selectedPath, setSelectedPath] = useState<StartingPathId>("streetborn");
  const selected = startingPaths.find((path) => path.id === selectedPath) ?? startingPaths[0];
  return (
    <div className="app-shell path-screen">
      <main className="path-select-main">
        <section className="path-save-slots">
          {saveSlots.map((slot) => (
            <button key={slot.slot} className={activeSaveSlot === slot.slot ? "active" : ""} onClick={() => (slot.exists ? onSwitchSave(slot.slot) : onNewSave(slot.slot))}>
              <span>Slot {slot.slot}{activeSaveSlot === slot.slot ? " / Active" : ""}</span>
              <strong>{slot.exists ? startingPaths.find((path) => path.id === slot.startingPath)?.name ?? "No Path" : "Empty"}</strong>
            </button>
          ))}
        </section>
        <section className="path-hero">
          <div>
            <p className="eyebrow">Permanent origin</p>
            <h1>Choose Your Lifepath</h1>
            <p className="muted">Your origin opens unique mission approaches and shapes your contacts, rewards, and risks. Build your attributes, answer your fixer's call, and decide what the city remembers. Your lifepath is permanent for this save.</p>
          </div>
          <div className="path-selected-chip">
            <StartingPathBadge pathId={selected.id} name={selected.name} />
            <span>{selected.name}</span>
          </div>
        </section>
        <section className="path-choice-grid">
          {startingPaths.map((path) => (
            <article className={`path-choice-card ${selectedPath === path.id ? "selected" : ""}`} key={path.id} onClick={() => setSelectedPath(path.id)}>
              <button className="path-image-button" type="button" aria-label={`Select ${path.name}`}>
                <img src={startingPathImages[path.id]} alt="" />
                <span className="path-image-vignette" />
                <strong>{path.name}</strong>
              </button>
              <div className="path-choice-copy">
                <p className="eyebrow">Origin Profile</p>
                <h2>{path.name}</h2>
                <p className="muted">{path.theme}</p>
                <div className="path-trait-list">
                  <div>
                    <span>Advantages</span>
                    {path.bonuses.map((bonus) => <p key={bonus}>{bonus}</p>)}
                  </div>
                  <div>
                    <span>Complications</span>
                    {path.penalties.map((penalty) => <p key={penalty}>{penalty}</p>)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
        <section className="path-lockbar">
          <div>
            <p className="eyebrow">Selected</p>
            <h2>{selected.name}</h2>
            <p className="muted">{selected.theme}</p>
          </div>
          <button className="primary-button" onClick={() => onChoose(selected.id)}>Lock In {selected.name}</button>
        </section>
      </main>
    </div>
  );
}

function StartingPathBadge({ pathId, name }: { pathId: StartingPathId; name: string }) {
  return (
    <span className="starting-path-badge" title={name} aria-label={name}>
      <img src={startingPathImages[pathId]} alt="" />
    </span>
  );
}

function FloatingSimCacheButton({
  state,
  open,
  onToggle,
  onClose,
  onRun,
  onOpenFull,
}: {
  state: GameState;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onRun: (count: number) => void;
  onOpenFull: () => void;
}) {
  const available = state.inventory["basic-sim-cache"] ?? 0;
  const eligibility = simCacheEligibility(state);
  const active = activeActivity(state);
  const options = [
    { label: "5 min", count: 1 },
    { label: "15 min", count: 3 },
    { label: "1 hour", count: 12 },
    { label: "Max", count: available },
  ];
  return (
    <>
      {open && <button className="sim-cache-scrim" aria-label="Close Sim Cache menu" onClick={onClose} />}
      <aside className="floating-sim-cache">
        <button className={`sim-cache-button ${available > 0 ? "ready" : ""}`} onClick={onToggle} aria-expanded={open}>
          <span>SIM</span>
          <strong>{available}</strong>
        </button>
        {open && (
          <div className="sim-cache-menu">
            <p className="eyebrow">Sim Cache</p>
            <h3>{active?.name ?? "No active loop"}</h3>
            <p className="muted">{eligibility.reason}</p>
            <div className="card-list compact">
              {options.map((option) => (
                <button key={option.label} className="secondary-button full" disabled={!eligibility.eligible || option.count <= 0 || available < option.count} onClick={() => onRun(option.count)}>
                  {option.label}
                </button>
              ))}
            </div>
            <button className="primary-button full" onClick={onOpenFull}>Full Details</button>
          </div>
        )}
      </aside>
    </>
  );
}

function TopbarActivityProgress({ activity, onOpen, onStop }: { activity: ActiveActivity | null; onOpen: () => void; onStop: () => void }) {
  if (!activity) {
    return (
      <div className="topbar-activity-progress idle">
        <p className="eyebrow">Current Job</p>
        <h1>Ready</h1>
      </div>
    );
  }
  return (
    <div className="topbar-activity-progress has-stop">
      <button className="topbar-activity-open" onClick={onOpen} title="Open active activity">
        <p className="eyebrow">{activity.type}</p>
        <h1>{activity.name}</h1>
      </button>
      <strong>{Math.round(activity.progress)}%</strong>
      <span aria-hidden="true">
        <b style={{ width: `${activity.progress}%` }} />
      </span>
      <button className="icon-button danger topbar-activity-stop" onClick={onStop} aria-label="Stop active activity" title="Stop active activity">
        <Square size={16} />
      </button>
    </div>
  );
}

function TabNoticePanel({ title, notices, onReviewNotice, onReviewAll }: { title: string; notices: TabNotice[]; onReviewNotice: (key: string) => void; onReviewAll: () => void }) {
  if (!notices.length) return null;
  return (
    <article className="tab-notice-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">New Attention</p>
          <h2>{title}</h2>
        </div>
        <button className="secondary-button" onClick={onReviewAll}>Mark All Reviewed</button>
      </div>
      <div className="tab-notice-list">
        {notices.map((notice) => (
          <button key={notice.key} onClick={() => onReviewNotice(notice.key)}>
            <strong>{notice.title}</strong>
            <span>{notice.detail}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

export function CityTab({
  state,
  openRequest,
  onSelectDistrict,
  onStartSkill,
  onStartCombat,
  onUseRipperdoc,
  onBuyRipperdocCyberware,
  onBuyVendorItem,
  onSellVendorItem,
  onListBlackMarket,
  onCraft,
  onStopCraft,
  onBuyHousing,
  onSetResidence,
  onBuyVehicle,
  onSetVehicle,
  onUpgradeVehicle,
  onUseHealingItem,
  onStopActive,
  notices,
  onReviewNotice,
  onReviewAllNotices,
}: {
  state: GameState;
  openRequest: { districtId: DistrictId | null; category?: DistrictHubCategory; token: number } | null;
  onSelectDistrict: (id: DistrictId) => void;
  onStartSkill: (id: string) => void;
  onStartCombat: (id: string) => void;
  onUseRipperdoc: (id: string) => void;
  onBuyRipperdocCyberware: (clinicId: string, itemId: string) => void;
  onBuyVendorItem: (vendorId: string, itemId: string) => void;
  onSellVendorItem: (vendorId: string, itemId: string) => void;
  onListBlackMarket: (itemId: string, strategy: "quickSale" | "standard" | "highBid" | "privateBuyer") => void;
  onCraft: (id: string) => void;
  onStopCraft: () => void;
  onBuyHousing: (id: string) => void;
  onSetResidence: (id: string) => void;
  onBuyVehicle: (id: string) => void;
  onSetVehicle: (id: string) => void;
  onUpgradeVehicle: (id: string) => void;
  onUseHealingItem: (id: string) => void;
  onStopActive: () => void;
  notices: TabNotice[];
  onReviewNotice: (key: string) => void;
  onReviewAllNotices: () => void;
}) {
  const [openDistrict, setOpenDistrict] = useState<DistrictId | null>(null);
  const [mapSection, setMapSection] = useState<"districts" | "training">("districts");
  const active = activeActivity(state);
  const entryDistrict = districts.find(district => district.id === state.selectedDistrict && state.districts[district.id]?.unlocked)?.id ?? districts.find(district => state.districts[district.id]?.unlocked)?.id ?? "neonRow";
  const openHub = (districtId: DistrictId) => {
    if (!state.districts[districtId]?.unlocked) return;
    onSelectDistrict(districtId);
    setOpenDistrict(districtId);
  };
  useEffect(() => {
    if (!openRequest?.districtId) { setOpenDistrict(null); return; }
    openHub(openRequest.districtId);
  }, [openRequest?.token]);
  if (!openDistrict) {
    return (
      <section className="rpg-shell map-network">
        <NetworkHero title={["NEON", "CITY"]} eyebrow="YOUR CITY. YOUR WORK. YOUR NEXT MOVE." description="Choose a district to find work, train your skills and prepare for your next mission." status={`RUNNER LEVEL ${state.rpg.level}`} progress={{ label: "CITY ATLAS / DISTRICTS", value: districts.filter(district => state.districts[district.id]?.unlocked).length, maximum: 8, suffix: "/08", note: active ? `LIVE: ${active.name.toUpperCase()}` : "CHOOSE YOUR NEXT DESTINATION" }} actions={<><button className="rpg-primary" onClick={() => openHub(entryDistrict)}>Enter {getDistrict(entryDistrict)?.name}<ArrowUpRight size={17} /></button><button className="rpg-text-button" onClick={() => setMapSection("training")}>Training & supplies <ChevronRight size={15} /></button></>} />
        <nav className="rpg-section-nav" aria-label="Map sections">
          <button className={mapSection === "districts" ? "selected" : ""} aria-current={mapSection === "districts" ? "page" : undefined} onClick={() => setMapSection("districts")}><MapPin size={16} />City districts</button>
          <button className={mapSection === "training" ? "selected" : ""} aria-current={mapSection === "training" ? "page" : undefined} onClick={() => setMapSection("training")}><Zap size={16} />Training & supplies</button>
        </nav>
        <TabNoticePanel title="Map Updates" notices={notices} onReviewNotice={onReviewNotice} onReviewAll={onReviewAllNotices} />
        {mapSection === "districts" ? <DistrictMap state={state} activeDistrictId={active?.districtId ?? null} activeActivityName={active?.name} onOpenDistrict={openHub} /> : <div className="network-body"><ProgressionGuide state={state} onStartSkill={onStartSkill} onCraft={onCraft} onOpenDistrict={openHub} /></div>}
      </section>
    );
  }
  return (
    <section className="stack">
      <TabNoticePanel title="Map Updates" notices={notices} onReviewNotice={onReviewNotice} onReviewAll={onReviewAllNotices} />
      <DistrictHub
        state={state}
        districtId={openDistrict}
        openCategoryRequest={openRequest?.districtId === openDistrict ? { category: openRequest.category, token: openRequest.token } : null}
        activeActivity={active}
        onBack={() => { setOpenDistrict(null); setMapSection("districts"); }}
        onStartSkill={onStartSkill}
        onStartCombat={onStartCombat}
        onUseRipperdoc={onUseRipperdoc}
        onBuyRipperdocCyberware={onBuyRipperdocCyberware}
        onBuyVendorItem={onBuyVendorItem}
        onSellVendorItem={onSellVendorItem}
        onListBlackMarket={onListBlackMarket}
        onCraft={onCraft}
        onStopCraft={onStopCraft}
        onBuyHousing={onBuyHousing}
        onSetResidence={onSetResidence}
        onBuyVehicle={onBuyVehicle}
        onSetVehicle={onSetVehicle}
        onUpgradeVehicle={onUpgradeVehicle}
        onUseHealingItem={onUseHealingItem}
        onStopActive={onStopActive}
      />
    </section>
  );
}

function ActivityPill({ label, title, dimmed = false, active = false }: { label: string; title: string; dimmed?: boolean; active?: boolean }) {
  return <b className={`activity-pill ${dimmed ? "dimmed" : ""} ${active ? "active" : ""}`} title={title}>{label}</b>;
}

type DistrictHubCategory = DistrictActivityCategory | `skill-${SkillId}`;

export function DistrictHub({
  state,
  districtId,
  activeActivity,
  openCategoryRequest,
  onBack,
  onStartSkill,
  onStartCombat,
  onUseRipperdoc,
  onBuyRipperdocCyberware,
  onBuyVendorItem,
  onSellVendorItem,
  onListBlackMarket,
  onCraft,
  onStopCraft,
  onBuyHousing,
  onSetResidence,
  onBuyVehicle,
  onSetVehicle,
  onUpgradeVehicle,
  onUseHealingItem,
  onStopActive,
}: {
  state: GameState;
  districtId: DistrictId;
  activeActivity: ActiveActivity | null;
  openCategoryRequest: { category?: DistrictHubCategory; token: number } | null;
  onBack: () => void;
  onStartSkill: (id: string) => void;
  onStartCombat: (id: string) => void;
  onUseRipperdoc: (id: string) => void;
  onBuyRipperdocCyberware: (clinicId: string, itemId: string) => void;
  onBuyVendorItem: (vendorId: string, itemId: string) => void;
  onSellVendorItem: (vendorId: string, itemId: string) => void;
  onListBlackMarket: (itemId: string, strategy: "quickSale" | "standard" | "highBid" | "privateBuyer") => void;
  onCraft: (id: string) => void;
  onStopCraft: () => void;
  onBuyHousing: (id: string) => void;
  onSetResidence: (id: string) => void;
  onBuyVehicle: (id: string) => void;
  onSetVehicle: (id: string) => void;
  onUpgradeVehicle: (id: string) => void;
  onUseHealingItem: (id: string) => void;
  onStopActive: () => void;
}) {
  const [category, setCategory] = useState<DistrictHubCategory>("overview");

  const district = getDistrict(districtId)!;
  const unlocked = Boolean(state.districts[districtId]?.unlocked);
  const summaries = districtActivitySummaries(state, districtId);
  const skillTabs = districtSkillTabs(state, districtId);
  const systemSummaries = summaries.filter((summary) => !["actions", "blacknet", "combat"].includes(summary.id));
  const threat = state.districtThreat[districtId]?.level ?? 0;
  const completion = districtCompletionBreakdown(state, districtId);
  const localStanding = state.districtStanding[districtId]?.standing ?? 0;
  const dominantFaction = district.associatedFactions[0];
  useEffect(() => setCategory("overview"), [districtId]);
  useEffect(() => {
    if (openCategoryRequest?.category) setCategory(openCategoryRequest.category);
  }, [openCategoryRequest?.token]);
  return (
    <section className="district-hub rpg-shell">
      <NetworkHero title={[district.name.split(" ")[0].toUpperCase(), district.name.split(" ").slice(1).join(" ").toUpperCase()]} eyebrow="YOUR DISTRICT. YOUR CONTACTS. YOUR OPPORTUNITIES." description={district.description} status={`${threatTier(threat).toUpperCase()} THREAT / STANDING ${localStanding}`} progress={{ label: "DISTRICT / COMPLETION", value: completion.total, maximum: 100, suffix: "%", note: activeActivity?.districtId === districtId ? `LIVE: ${activeActivity.name.toUpperCase()}` : `${factions.find(faction => faction.id === dominantFaction)?.name.toUpperCase() ?? "CONTESTED TERRITORY"}` }} actions={<><button className="rpg-primary" onClick={() => setCategory(skillTabs[0]?.id ?? "overview")}>Find local work <ArrowUpRight size={17} /></button><button className="rpg-text-button" onClick={onBack}>Back to city <ChevronRight size={15} /></button></>} />
      <nav className="rpg-section-nav district-primary-tabs" aria-label="District activities">
        <button className={category === "overview" ? "selected" : ""} aria-current={category === "overview" ? "page" : undefined} onClick={() => setCategory("overview")}><MapPin size={16} />Overview</button>
        {skillTabs.map(skillTab => {
          const Icon = districtSkillIcons[skillTab.skillId];
          return <button key={skillTab.id} className={category === skillTab.id ? "selected" : ""} aria-current={category === skillTab.id ? "page" : undefined} onClick={() => setCategory(skillTab.id)}><Icon size={16} />{skillTab.label}<small>Lv {state.skills[skillTab.skillId].level}</small></button>;
        })}
        {systemSummaries.length > 0 && <button className={systemSummaries.some(summary => summary.id === category) ? "selected" : ""} aria-current={systemSummaries.some(summary => summary.id === category) ? "page" : undefined} onClick={() => setCategory(systemSummaries[0].id)}><Store size={16} />Services</button>}
      </nav>
      {systemSummaries.some(summary => summary.id === category) && <nav className="network-tabs district-service-tabs" aria-label="District services">{systemSummaries.map(summary => <button key={summary.id} className={category === summary.id ? "active" : ""} aria-current={category === summary.id ? "page" : undefined} onClick={() => setCategory(summary.id)}>{summary.label}</button>)}</nav>}
      {!unlocked && <CompactRequirementList state={state} districtId={districtId} requirements={district.unlockRequirements} />}
      <div className="network-workspace-content stack">
      <details className="section-disclosure district-intel-disclosure" key={districtId}>
        <summary><span><strong>District intel</strong><small>Factions, standing, mastery and threat</small></span><ChevronDown size={22} /></summary>
        <div className="stack">
          <DistrictIntelPanel state={state} districtId={districtId} />
          <DistrictInfoPanel state={state} districtId={districtId} />
          <DistrictMasteryPanel state={state} districtId={districtId} />
          <DistrictReturnGoalsPanel state={state} districtId={districtId} />
          <ThreatMeter value={threat} tier={threatTier(threat)} />
        </div>
      </details>
      {category === "overview" ? (
        <>
          <DistrictSkillGrid state={state} tabs={skillTabs} onOpen={setCategory} />
          <DistrictActivityGrid summaries={systemSummaries} onOpen={setCategory} />
        </>
      ) : (
        <DistrictActivityMenu
          state={state}
          districtId={districtId}
          category={category}
          onStartSkill={onStartSkill}
          onStartCombat={onStartCombat}
          onUseRipperdoc={onUseRipperdoc}
          onBuyRipperdocCyberware={onBuyRipperdocCyberware}
          onBuyVendorItem={onBuyVendorItem}
          onSellVendorItem={onSellVendorItem}
          onListBlackMarket={onListBlackMarket}
          onCraft={onCraft}
          onStopCraft={onStopCraft}
          onBuyHousing={onBuyHousing}
          onSetResidence={onSetResidence}
          onBuyVehicle={onBuyVehicle}
          onSetVehicle={onSetVehicle}
          onUpgradeVehicle={onUpgradeVehicle}
          onUseHealingItem={onUseHealingItem}
          onStopActive={onStopActive}
        />
      )}

      </div>
    </section>
  );
}

const districtSkillIcons: Record<SkillId, typeof Activity> = {
  scavenging: Backpack, hacking: Cpu, cyberware: Shield, vehicleTuning: Wrench,
  medical: HeartPulse, combat: Sword,
};

function skillCategoryFor(skillId: SkillId): DistrictHubCategory {
  return `skill-${skillId}` as DistrictHubCategory;
}

function skillFromCategory(category: DistrictHubCategory): SkillId | null {
  if (!category.startsWith("skill-")) return null;
  const skillId = category.replace("skill-", "") as SkillId;
  return skillOrder.includes(skillId) ? skillId : null;
}

function districtSkillTabs(state: GameState, districtId: DistrictId) {
  return skillOrder
    .map((skillId) => {
      const localActions = skillId === "combat" ? [] : districtSkillActions(districtId).filter((action) => action.skillId === skillId);
      const localEnemies = skillId === "combat" ? districtCombatZones(districtId).flatMap((zone) => zone.enemies) : [];
      const localRecipes = skillId === "cyberware" ? recipes.filter((recipe) => recipe.requiredSkill === skillId) : [];
      const count = localActions.length + localEnemies.length + localRecipes.length;
      const availableActions = localActions.filter((action) => meetsActionAccessRequirement(state, action)).length;
      const availableEnemies = localEnemies.filter((enemy) => canFightEnemy(state, enemy)).length;
      const availableRecipes = localRecipes.filter((recipe) => state.skills[recipe.requiredSkill].level >= recipe.requiredLevel).length;
      return {
        id: skillCategoryFor(skillId),
        skillId,
        label: skillNames[skillId],
        count,
        available: availableActions + availableEnemies + availableRecipes,
      };
    })
    .filter((tab) => tab.count > 0);
}

type ActiveActivity = {
  name: string;
  type: string;
  districtId: DistrictId | null;
  category?: DistrictHubCategory;
  progress: number;
  detail?: string;
  skillId?: SkillId;
  skillLevel?: number;
  skillXp?: number;
  skillNextXp?: number;
  skillProgress?: number;
};

function ActiveActivityBanner({ state, activity, onOpen, onStop }: { state: GameState; activity: ActiveActivity | null; onOpen: (districtId: DistrictId) => void; onStop: () => void }) {
  if (!activity) return null;
  return (
    <article className="active-activity-banner">
      <div>
        <p className="eyebrow">{activity.type}</p>
        <h3>{activity.name}</h3>
        <Progress value={activity.progress} label={`${Math.round(activity.progress)}%`} />
      </div>
      <div className="banner-actions">
        {activity.districtId && <button className="secondary-button" onClick={() => onOpen(activity.districtId!)}>Open</button>}
        <button className="secondary-button" onClick={onStop}><Square size={16} /> Stop</button>
      </div>
    </article>
  );
}

function DistrictInfoPanel({ state, districtId }: { state: GameState; districtId: DistrictId }) {
  const district = getDistrict(districtId)!;
  const mods = getDistrictModifiers(state, districtId);
  const completion = districtCompletionBreakdown(state, districtId);
  const content = districtContentMap(state, districtId);
  return (
    <article className="district-info-panel">
      <div>
        <p className="eyebrow">Identity</p>
        <h3>{district.name}</h3>
        <p className="muted">{district.description}</p>
      </div>
      <div className="info-columns">
        <InfoBlock title="Requirements" lines={[...(district.unlockRequirements ?? []), ...(district.travelRequirements ?? [])]} />
        <InfoBlock title="Modifiers" lines={[...district.jobModifiers, ...district.shopModifiers, ...Object.entries(mods).filter(([, value]) => value).map(([key, value]) => `${titleCase(key)} ${Math.round(Number(value) * 100)}%`)]} />
        <InfoBlock title="Influence" lines={district.associatedFactions.map((id) => factions.find((faction) => faction.id === id)?.name ?? id)} />
        <InfoBlock title="Systems" lines={[`${content.actions.length} actions`, `${content.enemies.length} enemies`, `${content.vendors.length} vendors`, `${content.ripperdocClinics.length + content.ripperdocServices.length} ripperdoc entries`]} />
      </div>
      <div className="inventory-grid">
        <Metric label="Combat" value={completion.combat} />
        <Metric label="Local gigs" value={completion.jobs} />
        <Metric label="Collection" value={completion.collection} />
        <Metric label="Services" value={completion.services} />
      </div>
      {isDevBuild && (
        <details className="terminal-log">
          <summary>Completion Debug</summary>
          {districtCompletionDebug(state, districtId).map((line) => <p key={line}>{line}</p>)}
        </details>
      )}
    </article>
  );
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="terminal-log">
      <strong>{title}</strong>
      {lines.length ? lines.map((line) => <p key={line}>{line}</p>) : <p>None logged.</p>}
    </div>
  );
}

function DistrictMasteryPanel({ state, districtId }: { state: GameState; districtId: DistrictId }) {
  const mastery = state.districtMastery[districtId] ?? { level: 1, xp: 0, milestones: {} };
  const nextMilestone = nextDistrictMasteryMilestone(mastery.level);
  const rareMaterials = districtSpecificMaterials[districtId] ?? [];
  const missingMaterials = rareMaterials.filter((id) => !state.discoveredItems[id] && (state.inventory[id] ?? 0) <= 0).slice(0, 3);
  const reason = nextMilestone
    ? `Return goal: ${nextMilestone.name} at mastery ${nextMilestone.level}`
    : "Return goal: finish collection logs and title passives.";

  return (
    <div className="district-mastery-panel">
      <div>
        <p className="eyebrow">District Mastery</p>
        <strong>Lv {mastery.level}</strong>
      </div>
      <Progress value={(mastery.xp / xpForNextDistrictMastery(mastery.level)) * 100} label={`${mastery.xp} / ${xpForNextDistrictMastery(mastery.level)} XP`} />
      <p className="fine">{reason}</p>
      {nextMilestone && <p className="fine">Next: {nextMilestone.description}</p>}
      <p className="fine">Missing rares: {missingMaterials.map((id) => getItem(id)?.name ?? id).join(", ") || "None currently tracked"}</p>
    </div>
  );
}

function DistrictReturnGoalsPanel({ state, districtId }: { state: GameState; districtId: DistrictId }) {
  const main = rpgMissions.find(mission => mission.district === districtId)!;
  const gig = rpgSideGigs.find(mission => mission.district === districtId)!;
  return <details className="district-return-goals"><summary>Mission goals</summary><p className="fine">Main job: {main.title} / {state.rpg.completed[main.id] ? "Complete" : "Open Missions to progress"}</p><p className="fine">Local gig: {gig.title} / {state.rpg.completed[gig.id]?.clears ?? 0} clears. Replay for credits and rotating equipment and supplies.</p></details>;
}

function FactionReputationCard({
  faction,
  reputation,
  hostility,
  context,
  milestones,
}: {
  faction: (typeof factions)[number];
  reputation: number;
  hostility: number;
  context: string;
  milestones: typeof factionMilestones;
}) {
  const rank = factionRankNumber(reputation);
  const nextMilestone = milestones.find((milestone) => milestone.rank > rank);
  const currentBenefits = milestones.filter((milestone) => milestone.rank <= rank);
  return (
    <article className="faction-reputation-card">
      <FactionHeader faction={faction} reputation={reputation} hostility={hostility} context={context} />
      <RankProgressBar reputation={reputation} rank={rank} nextMilestone={nextMilestone} />
      {currentBenefits.length > 0 && <CurrentBenefitsPanel milestones={currentBenefits} />}
      <FactionRewardTrack milestones={milestones} currentRank={rank} reputation={reputation} />
    </article>
  );
}

function FactionHeader({
  faction,
  reputation,
  hostility,
  context,
}: {
  faction: (typeof factions)[number];
  reputation: number;
  hostility: number;
  context: string;
}) {
  const rank = factionRankNumber(reputation);
  return (
    <div className="faction-header">
      <div>
        <p className="eyebrow">{context}</p>
        <h3>{faction.name}</h3>
        <p className="fine">Rank {rank} • {factionRankLabel(reputation)}</p>
        <p className="fine">Rep {reputation} / Hostility {hostility}</p>
      </div>
      <div className="faction-bonus-summary">
        <span>Bonuses</span>
        <strong>{faction.uniqueBonuses.slice(0, 3).join(", ")}</strong>
      </div>
    </div>
  );
}

function RankProgressBar({
  reputation,
  rank,
  nextMilestone,
}: {
  reputation: number;
  rank: number;
  nextMilestone?: (typeof factionMilestones)[number];
}) {
  const nextRank = nextMilestone?.rank ?? Math.min(5, rank + 1);
  const currentRankRep = Math.max(0, rank * 10);
  const nextRankRep = Math.max(currentRankRep + 10, nextRank * 10);
  const progress = nextMilestone ? ((reputation - currentRankRep) / Math.max(1, nextRankRep - currentRankRep)) * 100 : 100;
  return (
    <div className="rank-progress-panel">
      <div className="rank-progress-copy">
        <span>Rank Progress</span>
        <strong>{nextMilestone ? `${Math.max(0, reputation - currentRankRep)} / ${nextRankRep - currentRankRep}` : "Local rewards complete"}</strong>
      </div>
      <Progress value={Math.max(0, Math.min(100, progress))} label={nextMilestone ? `Next Unlock: Rank ${nextMilestone.rank} - ${nextMilestone.title}` : "All listed rank rewards unlocked"} />
      <p className="fine">Standing: {factionRankLabel(reputation)}</p>
    </div>
  );
}

function FactionRewardTrack({
  milestones,
  currentRank,
  reputation,
}: {
  milestones: typeof factionMilestones;
  currentRank: number;
  reputation: number;
}) {
  return (
    <div className="faction-reward-track">
      {milestones.map((milestone) => (
        <FactionRewardCard key={`${milestone.factionId}-${milestone.districtId}-${milestone.rank}`} milestone={milestone} currentRank={currentRank} reputation={reputation} />
      ))}
      {!milestones.length && <p className="muted">No local faction milestones are listed for this district yet.</p>}
    </div>
  );
}

function FactionRewardCard({
  milestone,
  currentRank,
  reputation,
}: {
  milestone: (typeof factionMilestones)[number];
  currentRank: number;
  reputation: number;
}) {
  const status = milestone.rank <= currentRank ? "unlocked" : milestone.rank === currentRank + 1 ? "next" : "locked";
  const categories = factionRewardCategories(milestone);
  return (
    <article className={`faction-reward-card ${status}`}>
      <div className="faction-reward-icon">{status === "unlocked" ? <Unlock size={18} /> : <Lock size={18} />}</div>
      <div className="faction-reward-body">
        <div className="faction-reward-head">
          <div>
            <p className="eyebrow">Rank {milestone.rank}</p>
            <h4>{milestone.title}</h4>
          </div>
          <RewardStatusBadge status={status} />
        </div>
        <p className="muted">{milestone.reward}</p>
        <div className="faction-reward-foot">
          <span className={status === "locked" ? "missing" : "met"}>{status === "unlocked" ? "Active" : `Requires ${milestone.requirement} (${reputation}/${milestone.rank * 10} rep)`}</span>
          <div>{categories.map((category) => <RewardCategoryChip key={category} category={category} />)}</div>
        </div>
      </div>
    </article>
  );
}

function RewardStatusBadge({ status }: { status: "unlocked" | "next" | "locked" }) {
  const label = status === "unlocked" ? "Unlocked" : status === "next" ? "Next" : "Locked";
  return <span className={`reward-status-badge ${status}`}>{label}</span>;
}

function RewardCategoryChip({ category }: { category: string }) {
  return <span className={`reward-category-chip ${category.toLowerCase()}`}>{category}</span>;
}

function CurrentBenefitsPanel({ milestones }: { milestones: typeof factionMilestones }) {
  return (
    <div className="current-benefits-panel">
      <p className="eyebrow">Current Benefits</p>
      {milestones.map((milestone) => (
        <span key={`${milestone.factionId}-${milestone.districtId}-${milestone.rank}`}>{milestone.title}: {milestone.reward}</span>
      ))}
    </div>
  );
}

function factionRewardCategories(milestone: (typeof factionMilestones)[number]) {
  const text = `${milestone.title} ${milestone.reward}`.toLowerCase();
  const categories: string[] = [];
  if (text.includes("vendor") || text.includes("shop") || text.includes("market") || text.includes("prices") || text.includes("broker")) categories.push("Vendor");
  if (text.includes("discount") || text.includes("prices") || text.includes("cost")) categories.push("Discount");
  if (text.includes("garage") || text.includes("vehicle") || text.includes("yard")) categories.push("Garage");
  if (text.includes("housing")) categories.push("Housing");
  if (text.includes("operation") || text.includes("boss")) categories.push("Missions");
  if (text.includes("route")) categories.push("Routes");
  if (text.includes("contract") || text.includes("bounty") || text.includes("job")) categories.push("Local gigs");
  if (text.includes("parts") || text.includes("plating") || text.includes("stabilizer") || text.includes("cipher")) categories.push("Materials");
  return categories.length ? categories.slice(0, 3) : ["Reward"];
}

function DistrictIntelPanel({ state, districtId }: { state: GameState; districtId: DistrictId }) {
  const district = getDistrict(districtId);
  const localFactions = factions.filter((faction) => faction.districtInfluence.includes(districtId));
  const threat = state.districtThreat[districtId]?.level ?? 0;
  const standing = state.districtStanding[districtId]?.standing ?? 0;
  if (!district) return null;

  return (
    <article className="panel district-intel-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">District Intel</p>
          <h2>{district.name}</h2>
        </div>
        <span className="status-chip">{threatTier(threat)}</span>
      </div>
      <div className="intel-summary-grid">
        <Metric label="Standing" value={standing} />
        <Metric label="Threat" value={threat} />
        <Metric label="Factions" value={localFactions.length} />
      </div>
      <div className="local-faction-grid compact">
        {localFactions.map((faction) => {
          const factionState = state.factions[faction.id];
          const reputation = factionState?.reputation ?? 0;
          const rank = factionRankNumber(reputation);
          const nextMilestone = factionMilestones
            .filter((milestone) => milestone.factionId === faction.id && milestone.districtId === districtId && milestone.rank > rank)
            .sort((a, b) => a.rank - b.rank)[0];
          return (
            <article className="compact-run-card intel-faction-card" key={faction.id}>
              <div>
                <p className="eyebrow">{faction.uniqueBonuses[0] ?? "District influence"}</p>
                <h3>{faction.name}</h3>
                <p className="fine">Rank {rank} {factionRankLabel(reputation)} / Rep {reputation}</p>
                <Progress value={Math.min(100, ((reputation % 20) / 20) * 100)} label={`Next rank in ${Math.max(0, 20 - (reputation % 20))} rep`} />
                <p className="fine">Next: {nextMilestone ? `Rank ${nextMilestone.rank} - ${nextMilestone.reward}` : "Local rewards complete for now"}</p>
              </div>
            </article>
          );
        })}
      </div>
      <p className="fine">Main jobs and local gigs build reputation with district factions.</p>
    </article>
  );
}

function recommendedDistrictSteps(state: GameState, districtId: DistrictId) {
  const unlocked = Boolean(state.districts[districtId]?.unlocked);
  const actions = districtSkillActions(districtId);
  const availableActions = actions.filter((action) => unlocked && meetsActionAccessRequirement(state, action) && canAffordRewards(state, action.rewards));
  const lockedActions = actions.filter((action) => unlocked && !meetsActionAccessRequirement(state, action));
  const jobsInDistrict = districtJobs(districtId).filter((job) => canAttemptJob(state, job));
  const enemies = districtCombatZones(districtId).flatMap((zone) => zone.enemies).filter((enemy) => canFightEnemy(state, enemy));
  const operationsInDistrict = districtOperations(districtId).filter((operation) => canStartOperation(state, operation));
  const playerStats = calculatePlayerCombatStats(state);
  const safestEnemy = [...enemies]
    .map((enemy) => ({ enemy, safety: estimateCombatSafety(state, enemy) }))
    .filter((entry) => entry.safety.rating !== "Deadly")
    .sort((a, b) => {
      const safetyRank: Record<string, number> = { Safe: 0, Risky: 1, Dangerous: 2, Deadly: 3 };
      return safetyRank[a.safety.rating] - safetyRank[b.safety.rating] || b.enemy.xpReward - a.enemy.xpReward;
    })[0];
  const riskyEnemy = enemies.find((enemy) => estimateCombatSafety(state, enemy).rating === "Deadly");
  const nextLockedAction = [...lockedActions].sort((a, b) => a.levelReq - b.levelReq || b.xpReward - a.xpReward)[0];
  const bestAction = [...availableActions].sort((a, b) => {
    const aGap = nextLockedAction ? Math.abs(nextLockedAction.levelReq - state.skills[a.skillId].level) : 0;
    const bGap = nextLockedAction ? Math.abs(nextLockedAction.levelReq - state.skills[b.skillId].level) : 0;
    return b.xpReward - a.xpReward || aGap - bGap;
  })[0];
  const weakestSkillAction = [...availableActions].sort((a, b) => state.skills[a.skillId].level - state.skills[b.skillId].level || b.xpReward - a.xpReward)[0];
  const bestJob = [...jobsInDistrict]
    .map((job) => ({ job, chance: calculateJobSuccessChance(job, state), rewards: calculateJobRewards(state, job) }))
    .filter((entry) => entry.chance.guaranteed || entry.chance.chance >= 0.65)
    .sort((a, b) => b.chance.chance - a.chance.chance || (b.rewards.credits ?? 0) - (a.rewards.credits ?? 0))[0];
  const bestOperation = operationsInDistrict[0];
  const steps: Array<{ category: DistrictHubCategory; label: string; title: string; reason: string }> = [];
  if (!unlocked) {
    steps.push({ category: "overview", label: "Unlock district", title: getDistrict(districtId)?.name ?? "District", reason: getDistrict(districtId)?.unlockRequirements.join(", ") ?? "Meet district requirements." });
  }
  if (nextLockedAction && bestAction) {
    steps.push({ category: skillCategoryFor(bestAction.skillId), label: "Unlock progress", title: bestAction.name, reason: `Run this to push ${skillNames[nextLockedAction.skillId]} ${state.skills[nextLockedAction.skillId].level}/${nextLockedAction.levelReq} toward ${nextLockedAction.name}.` });
  } else if (bestAction) {
    steps.push({ category: skillCategoryFor(bestAction.skillId), label: "Best skill loop", title: bestAction.name, reason: `${skillNames[bestAction.skillId]} Lv ${state.skills[bestAction.skillId].level}, ${formatRewards(calculateSkillActionRewards(state, bestAction))}` });
  }
  if (weakestSkillAction && weakestSkillAction.id !== bestAction?.id) {
    steps.push({ category: skillCategoryFor(weakestSkillAction.skillId), label: "Balance skills", title: weakestSkillAction.name, reason: `${skillNames[weakestSkillAction.skillId]} is Lv ${state.skills[weakestSkillAction.skillId].level}; this keeps later district tabs opening smoothly.` });
  }
  if (safestEnemy) {
    steps.push({ category: skillCategoryFor("combat"), label: `${safestEnemy.safety.rating} fight`, title: safestEnemy.enemy.name, reason: `Damage expected ${safestEnemy.safety.estimatedDamage}, HP ${state.health.currentHp}/${playerStats.maxHp}, ${safestEnemy.enemy.xpReward} XP.` });
  } else if (riskyEnemy) {
    steps.push({ category: skillCategoryFor("combat"), label: "Gear check", title: riskyEnemy.name, reason: `Current HP/gear looks weak. Equip armor or healing before farming this fight.` });
  }
  if (!steps.length) steps.push({ category: "overview", label: "Locked path", title: "Build requirements", reason: nextUnlockTargets(state)[0]?.requirement ?? "Raise the matching skill, reputation, gear, or district access." });
  return steps.slice(0, 4);
}

function nextUnlockTargets(state: GameState) {
  const lockedDistricts = cityDistrictOrder
    .filter((districtId) => !state.districts[districtId]?.unlocked)
    .map((districtId) => {
      const district = getDistrict(districtId)!;
      return { title: district.name, requirement: district.unlockRequirements.join(", ") };
    });
  const nextActions = skillActions
    .filter((action) => action.districtReq && state.districts[action.districtReq]?.unlocked && !meetsActionAccessRequirement(state, action))
    .sort((a, b) => a.levelReq - b.levelReq)
    .slice(0, 2)
    .map((action) => ({ title: action.name, requirement: `${skillNames[action.skillId]} level ${action.levelReq}` }));
  return [...lockedDistricts, ...nextActions];
}

function DistrictSkillGrid({ state, tabs, onOpen }: { state: GameState; tabs: ReturnType<typeof districtSkillTabs>; onOpen: (category: DistrictHubCategory) => void }) {
  if (!tabs.length) return null;
  return (
    <article className="panel district-skill-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Skill Work</p>
          <h2>Train by Specialty</h2>
        </div>
        <BrainCircuit size={22} />
      </div>
      <div className="activity-category-grid">
        {tabs.map((tab) => (
          <button className="category-card skill-category-card" key={tab.id} onClick={() => onOpen(tab.id)}>
            <span className="eyebrow">Level {state.skills[tab.skillId].level}</span>
            <strong>{tab.label}</strong>
            <small>{skillDescriptions[tab.skillId]}</small>
            <span>{tab.available} available / {tab.count} total</span>
          </button>
        ))}
      </div>
    </article>
  );
}

function DistrictActivityGrid({ summaries, onOpen }: { summaries: DistrictCategorySummary[]; onOpen: (category: DistrictHubCategory) => void }) {
  return (
    <div className="activity-category-grid">
      {summaries.map((summary) => (
        <button className="category-card" key={summary.id} onClick={() => onOpen(summary.id)}>
          <span className="eyebrow">{summary.reward}</span>
          <strong>{summary.label}</strong>
          <small>{summary.summary}</small>
          <span>{summary.available} available / {summary.locked} locked</span>
          {summary.warning && <b className="warning-badge">{summary.warning}</b>}
        </button>
      ))}
    </div>
  );
}

function DistrictActivityMenu({
  state,
  districtId,
  category,
  onStartSkill,
  onStartCombat,
  onUseRipperdoc,
  onBuyRipperdocCyberware,
  onBuyVendorItem,
  onSellVendorItem,
  onListBlackMarket,
  onCraft,
  onStopCraft,
  onBuyHousing,
  onSetResidence,
  onBuyVehicle,
  onSetVehicle,
  onUpgradeVehicle,
  onUseHealingItem,
  onStopActive,
}: {
  state: GameState;
  districtId: DistrictId;
  category: DistrictHubCategory;
  onStartSkill: (id: string) => void;
  onStartCombat: (id: string) => void;
  onUseRipperdoc: (id: string) => void;
  onBuyRipperdocCyberware: (clinicId: string, itemId: string) => void;
  onBuyVendorItem: (vendorId: string, itemId: string) => void;
  onSellVendorItem: (vendorId: string, itemId: string) => void;
  onListBlackMarket: (itemId: string, strategy: "quickSale" | "standard" | "highBid" | "privateBuyer") => void;
  onCraft: (id: string) => void;
  onStopCraft: () => void;
  onBuyHousing: (id: string) => void;
  onSetResidence: (id: string) => void;
  onBuyVehicle: (id: string) => void;
  onSetVehicle: (id: string) => void;
  onUpgradeVehicle: (id: string) => void;
  onUseHealingItem: (id: string) => void;
  onStopActive: () => void;
}) {
  const skillId = skillFromCategory(category);
  if (skillId) {
    return (
      <DistrictSkillWorkPanel
        state={state}
        districtId={districtId}
        skillId={skillId}
        onStartSkill={onStartSkill}
        onStartCombat={onStartCombat}
        onCraft={onCraft}
        onStopCraft={onStopCraft}
        onUseHealingItem={onUseHealingItem}
        onStopActive={onStopActive}
      />
    );
  }
  if (category === "actions" || category === "blacknet") {
    const actions = districtSkillActions(districtId).filter((action) => category === "actions" || action.skillId === "hacking" || action.tags?.includes("blacknet"));
    return <FocusedPanel title={category === "blacknet" ? "Blacknet" : "Actions"}>{actions.map((action) => <ActionCard key={action.id} state={state} action={action} disabled={false} onStart={() => onStartSkill(action.id)} onStop={onStopActive} />)}</FocusedPanel>;
  }
  if (category === "combat") {
    return (
      <CombatDashboard
        state={state}
        districtId={districtId}
        zones={districtCombatZones(districtId)}
        onStartCombat={onStartCombat}
        onStopActive={onStopActive}
        onUseHealingItem={onUseHealingItem}
      />
    );
  }
  if (category === "crafting") {
    return (
      <section className="stack">
        <details className="network-disclosure" open>
          <summary>Component processing</summary>
          <p className="fine">Turn local supplies into crafting materials. These routes still train their listed skill.</p>
          <div className="card-list">
            {skillActions
              .filter(action => action.districtReq === districtId && action.tags?.includes("supply"))
              .map(action => (
                <ActionCard
                  key={action.id}
                  state={state}
                  action={action}
                  disabled={false}
                  onStart={() => onStartSkill(action.id)}
                  onStop={onStopActive}
                />
              ))}
          </div>
        </details>
        <FocusedPanel title="Crafting">
          <CraftingPanel state={state} onCraft={onCraft} onStopCraft={onStopCraft} />
        </FocusedPanel>
      </section>
    );
  }
  if (category === "ripperdoc") {
    return (
      <RipperdocClinicScreen
        state={state}
        districtId={districtId}
        onUseRipperdoc={onUseRipperdoc}
        onBuyRipperdocCyberware={onBuyRipperdocCyberware}
      />
    );
  }
  if (category === "market") {
    return (
      <MarketScreen
        state={state}
        districtId={districtId}
        onBuyVendorItem={onBuyVendorItem}
        onSellVendorItem={onSellVendorItem}
        onListBlackMarket={onListBlackMarket}
      />
    );
  }
  if (category === "housing") {
    return (
      <FocusedPanel title="Housing">
        {districtHousing(districtId).map((housing) => (
          <ActivityCard key={housing.id} locked={!state.districts[housing.districtId]?.unlocked}>
            <div>
              <p className="eyebrow">Housing</p>
              <h3>{housing.name}</h3>
              <p className="fine">Cost {housing.cost} Credits / {state.ownedHousing[housing.id] ? "Owned" : "For Sale"}</p>
              <p className="fine">Active bonus: +2% action speed, {modifierSummary(housing.passiveModifiers ?? {})}</p>
              <RequirementStatusList requirements={textRequirementDetails(state, housing.unlockRequirements ?? [])} />
            </div>
            {state.ownedHousing[housing.id] ? <button className="secondary-button full" onClick={() => onSetResidence(housing.id)}>Set Active</button> : <button className="primary-button full" disabled={state.resources.credits < housing.cost} onClick={() => onBuyHousing(housing.id)}>Buy</button>}
          </ActivityCard>
        ))}
      </FocusedPanel>
    );
  }
  if (category === "garage") {
    return (
      <FocusedPanel title="Garage">
        {districtVehicles(districtId).map((vehicle) => {
          const owned = Boolean(state.ownedVehicles[vehicle.id]);
          const level = state.vehicleUpgradeLevels[vehicle.id] ?? 0;
          return (
            <ActivityCard key={vehicle.id} className={`rarity-${vehicle.rarity.toLowerCase()}`}>
              <div>
                <p className="eyebrow">{vehicle.rarity} / {vehicle.type}</p>
                <h3>{vehicle.name}{owned ? ` +${level}` : ""}</h3>
                <p className="fine">Cost {formatRewards(vehicle.cost)}</p>
                <p className="fine">Active bonus: +2% action speed, {modifierSummary(vehicle.passiveModifiers)}</p>
                <RequirementStatusList requirements={textRequirementDetails(state, vehicle.unlockRequirements)} />
              </div>
              {owned ? <div className="card-list compact"><button className="secondary-button full" onClick={() => onSetVehicle(vehicle.id)}>Set Active</button><button className="primary-button full" disabled={level >= vehicle.maxUpgradeLevel} onClick={() => onUpgradeVehicle(vehicle.id)}>{level >= vehicle.maxUpgradeLevel ? "Max Upgrade" : "Upgrade"}</button></div> : <button className="primary-button full" disabled={!canBuyVehicle(state, vehicle.id)} onClick={() => onBuyVehicle(vehicle.id)}>Buy Vehicle</button>}
            </ActivityCard>
          );
        })}
      </FocusedPanel>
    );
  }
  return (
    <FocusedPanel title="Story">
      {availableStoryArcsForDistrict(state, districtId).map((arc) => {
        const arcState = storyArcState(state, arc);
        const step = activeStoryStep(state, arc);
        return <ActivityCard key={arc.id} locked={arcState.status === "locked"}><div><p className="eyebrow">{arc.category} / {arcState.status}</p><h3>{arc.name}</h3><p className="muted">{arc.description}</p>{step && <p className="fine">{step.title}: {storyObjectiveProgress(state, step.objective)} / {step.objective.requiredCount}</p>}</div></ActivityCard>;
      })}
      {districtEvents.filter((event) => event.districtId === districtId).map((event) => <ActivityCard key={event.id}><div><p className="eyebrow">District Event</p><h3>{event.name}</h3><p className="muted">{event.description}</p></div></ActivityCard>)}
    </FocusedPanel>
  );
}

function DistrictSkillWorkPanel({
  state,
  districtId,
  skillId,
  onStartSkill,
  onStartCombat,
  onCraft,
  onStopCraft,
  onUseHealingItem,
  onStopActive,
}: {
  state: GameState;
  districtId: DistrictId;
  skillId: SkillId;
  onStartSkill: (id: string) => void;
  onStartCombat: (id: string) => void;
  onCraft: (id: string) => void;
  onStopCraft: () => void;
  onUseHealingItem: (id: string) => void;
  onStopActive: () => void;
}) {
  const skill = state.skills[skillId];
  const actions = skillId === "combat"
    ? []
    : districtSkillActions(districtId).filter((action) => action.skillId === skillId);
  const enemies = skillId === "combat" ? districtCombatZones(districtId) : [];
  const hasCombatWork = enemies.some((zone) => zone.enemies.length > 0);
  const empty = !actions.length && !hasCombatWork;
  return (
    <section className="stack">
      <article className="panel skill-work-header">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{getDistrict(districtId)?.name ?? "District"} Skill Work</p>
            <h2>{skillNames[skillId]} Lv {skill.level}</h2>
          </div>
          <BrainCircuit size={22} />
        </div>
        <p className="muted">{skillDescriptions[skillId]}</p>
        <Progress value={(skill.xp / xpForNextLevel(skill.level)) * 100} label={`${skill.xp} / ${xpForNextLevel(skill.level)} XP`} />
        <p className="fine">Three training actions per district. Component processing is available under Services / Crafting.</p>
      </article>

      {actions.length > 0 && (
        <FocusedPanel title={`${skillNames[skillId]} Actions`}>
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              state={state}
              action={action}
              disabled={false}
              onStart={() => onStartSkill(action.id)}
              onStop={onStopActive}
            />
          ))}
        </FocusedPanel>
      )}

      {hasCombatWork && (
        <CombatDashboard
          state={state}
          districtId={districtId}
          zones={enemies}
          onStartCombat={onStartCombat}
          onStopActive={onStopActive}
          onUseHealingItem={onUseHealingItem}
        />
      )}

      {empty && (
        <FocusedPanel title={`${skillNames[skillId]} Work`}>
          <p className="muted">No district work currently trains this skill here. Raise district access, mastery, or other skills to reveal more routes.</p>
        </FocusedPanel>
      )}
    </section>
  );
}

function FocusedPanel({ title, children }: { title: string; children: ReactNode }) {
  return <NeonPanel className="focused-panel"><h2>{title}</h2><div className="card-list focused-panel-content">{children}</div></NeonPanel>;
}

function VendorLikeRipperdoc({ state, clinicId, onBuy }: { state: GameState; clinicId: string; onBuy: (clinicId: string, itemId: string) => void }) {
  const clinic = ripperdocClinics.find((entry) => entry.id === clinicId)!;
  return (
    <ActivityCard locked={!state.districts[clinic.districtId]?.unlocked}>
      <div><p className="eyebrow">{clinic.legalOnly ? "Licensed Clinic" : "Street Clinic"}</p><h3>{clinic.name}</h3><p className="muted">{clinic.description}</p><TagList tags={clinic.specialties} /></div>
      <div className="card-list compact">
        {clinic.cyberwareInventory.map((itemId) => <button key={itemId} className="secondary-button full" disabled={!canBuyCyberwareFromRipperdoc(state, clinic.id, itemId)} onClick={() => onBuy(clinic.id, itemId)}>Buy {getItem(itemId)?.name ?? itemId} {ripperdocBuyPrice(state, clinic.id, itemId)}</button>)}
      </div>
    </ActivityCard>
  );
}

type RipperdocTab = "Shop" | "Treat" | "Install" | "Calibrate" | "Upgrade";

const ripperdocTabs: RipperdocTab[] = ["Shop", "Treat", "Install", "Calibrate", "Upgrade"];

function RipperdocClinicScreen({
  state,
  districtId,
  onUseRipperdoc,
  onBuyRipperdocCyberware,
}: {
  state: GameState;
  districtId: DistrictId;
  onUseRipperdoc: (id: string) => void;
  onBuyRipperdocCyberware: (clinicId: string, itemId: string) => void;
}) {
  const clinic = ripperdocClinics.find((entry) => entry.districtId === districtId);
  const services = districtRipperdocs(districtId);
  const [activeTab, setActiveTab] = useState<RipperdocTab>("Shop");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(clinic?.cyberwareInventory[0] ?? null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(services[0]?.id ?? null);
  const tabServices = services.filter((service) => ripperdocTabForService(service) === activeTab);
  const selectedItem = activeTab === "Shop" && selectedItemId ? getItem(selectedItemId) : null;
  const selectedService = activeTab !== "Shop" ? tabServices.find((service) => service.id === selectedServiceId) ?? tabServices[0] ?? null : null;

  if (!clinic && !services.length) {
    return <FocusedPanel title="Ripperdoc"><p className="muted">No ripperdoc clinic is active in this district yet.</p></FocusedPanel>;
  }

  return (
    <section className="ripperdoc-screen">
      <RipperdocHeader state={state} clinic={clinic} districtId={districtId} />
      <RipperdocTabs activeTab={activeTab} onTab={setActiveTab} services={services} shopCount={clinic?.cyberwareInventory.length ?? 0} />
      <RipperdocStatusBar state={state} />
      <ActiveEffectPanel state={state} />
      <div className="ripperdoc-workspace">
        <div className="ripperdoc-list-panel">
          <div className="operation-section-heading">
            <span>{activeTab === "Shop" ? "Cyberware Shop" : `${activeTab} Services`}</span>
            <b>{activeTab === "Shop" ? clinic?.cyberwareInventory.length ?? 0 : tabServices.length}</b>
          </div>
          {activeTab === "Shop" ? (
            <div className="ripperdoc-card-list">
              {(clinic?.cyberwareInventory ?? []).map((itemId) => (
                <CyberwareShopCard
                  key={itemId}
                  state={state}
                  clinic={clinic!}
                  itemId={itemId}
                  selected={selectedItemId === itemId}
                  onSelect={() => setSelectedItemId(itemId)}
                  onBuy={() => onBuyRipperdocCyberware(clinic!.id, itemId)}
                />
              ))}
            </div>
          ) : (
            <div className="ripperdoc-card-list">
              {tabServices.map((service) => (
                <RipperdocServiceCard
                  key={service.id}
                  state={state}
                  service={service}
                  selected={(selectedService?.id ?? selectedServiceId) === service.id}
                  onSelect={() => setSelectedServiceId(service.id)}
                  onUse={() => onUseRipperdoc(service.id)}
                />
              ))}
              {!tabServices.length && <p className="muted">No {activeTab.toLowerCase()} services available in this clinic.</p>}
            </div>
          )}
        </div>
        <RipperdocDetailPanel
          state={state}
          clinic={clinic}
          item={selectedItem ?? undefined}
          service={selectedService ?? undefined}
          onBuy={selectedItem && clinic ? () => onBuyRipperdocCyberware(clinic.id, selectedItem.id) : undefined}
          onUse={selectedService ? () => onUseRipperdoc(selectedService.id) : undefined}
        />
      </div>
    </section>
  );
}

function RipperdocHeader({ state, clinic, districtId }: { state: GameState; clinic?: RipperdocClinic; districtId: DistrictId }) {
  const district = getDistrict(districtId);
  return (
    <article className="ripperdoc-header">
      <div className="ripperdoc-clinic-mark"><ShieldAlert size={28} /></div>
      <div>
        <p className="eyebrow">Ripperdoc</p>
        <h2>{clinic?.name ?? `${district?.name ?? "District"} Clinic`}</h2>
        <p className="fine">{clinic?.legalOnly ? "Licensed Clinic" : "Street Clinic"} • {clinic?.specialties[0] ?? "General cyberware"}</p>
        <p className="muted">{clinic?.description ?? "Local implant service access is limited in this district."}</p>
      </div>
      <div className="ripperdoc-tag-row">
        {(clinic?.specialties ?? ["Install", "Calibrate"]).map((tag) => <span key={tag}>{tag}</span>)}
        <span>IN {effectiveNeuralInstability(state)}</span>
      </div>
    </article>
  );
}

function RipperdocTabs({ activeTab, onTab, services, shopCount }: { activeTab: RipperdocTab; onTab: (tab: RipperdocTab) => void; services: RipperdocService[]; shopCount: number }) {
  return (
    <div className="ripperdoc-tabs">
      {ripperdocTabs.map((tab) => {
        const count = tab === "Shop" ? shopCount : services.filter((service) => ripperdocTabForService(service) === tab).length;
        return <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => onTab(tab)}>{tab}<span>{count}</span></button>;
      })}
    </div>
  );
}

function CyberwareShopCard({ state, clinic, itemId, selected, onSelect, onBuy }: { state: GameState; clinic: RipperdocClinic; itemId: string; selected: boolean; onSelect: () => void; onBuy: () => void }) {
  const item = getItem(itemId);
  if (!item) return null;
  const price = ripperdocBuyPrice(state, clinic.id, itemId);
  return (
    <article className={`ripperdoc-shop-card rarity-${item.rarity.toLowerCase()} ${selected ? "selected" : ""}`} onClick={onSelect}>
      <EquipmentTypeIconBadge item={item} />
      <div>
        <h3>{item.name}</h3>
        <p className="fine">{titleCase(String(item.slot ?? item.type))} • {item.rarity}</p>
        <p className="muted">{item.modifiers ? formatItemModifiers(item.modifiers) : item.stats ? formatStats(item.stats) : item.description}</p>
      </div>
      <div className="ripperdoc-price-block">
        <strong>{price.toLocaleString()}</strong>
        <span>Credits</span>
        <button className="primary-button" disabled={!canBuyCyberwareFromRipperdoc(state, clinic.id, itemId)} onClick={(event) => { event.stopPropagation(); onBuy(); }}>Buy</button>
      </div>
    </article>
  );
}

function RipperdocServiceCard({ state, service, selected, onSelect, onUse }: { state: GameState; service: RipperdocService; selected: boolean; onSelect: () => void; onUse: () => void }) {
  const canUse = canUseRipperdocService(state, service.id);
  return (
    <article className={`ripperdoc-service-card ${canUse ? "" : "locked"} ${selected ? "selected" : ""}`} onClick={onSelect}>
      <div className="ripperdoc-service-head">
        <div><p className="eyebrow">{service.category ?? service.serviceType}</p><h3>{service.name}</h3></div>
        <span className={service.riskLevel && service.riskLevel > 2 ? "danger-text" : ""}>Risk {service.riskLevel ?? 1}</span>
      </div>
      <p className="muted">{service.description}</p>
      <ServiceCostRow state={state} service={service} />
      <ServiceEffectRow service={service} />
      <InfoRow label="Duration" value={service.temporaryEffect?.durationMs ? formatDuration(service.temporaryEffect.durationMs) : "Immediate"} />
      {service.requirements.length ? <InfoRow label="Requirements" value={service.requirements.join(", ")} warning={!canUse} /> : null}
      <button className="primary-button full" disabled={!canUse} onClick={(event) => { event.stopPropagation(); onUse(); }}>Use Service</button>
    </article>
  );
}

function ServiceCostRow({ state, service }: { state: GameState; service: RipperdocService }) {
  return <InfoRow label="Cost" value={formatServiceCost(state, service)} warning={!canUseRipperdocService(state, service.id)} />;
}

function ServiceEffectRow({ service }: { service: RipperdocService }) {
  const effects = [
    service.temporaryEffect?.description,
    service.neuralInstabilityChange ? `IN ${formatSigned(service.neuralInstabilityChange)}` : null,
    service.heatChange ? `Heat ${formatSigned(service.heatChange)}` : null,
    ...(service.effects ?? []),
  ].filter(Boolean).join(" • ");
  return <InfoRow label="Effect" value={effects || "Service completion"} />;
}

function InfoRow({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return <div className={`ripperdoc-info-row ${warning ? "warning" : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}

function ActiveEffectPanel({ state }: { state: GameState }) {
  const now = Date.now();
  const effects = (state.activeRipperdocEffects ?? []).filter((effect) => !effect.expiresAt || effect.expiresAt > now);
  if (!effects.length) return null;
  return (
    <article className="ripperdoc-active-effects">
      <p className="eyebrow">Active Clinic Effects</p>
      <div>
        {effects.map((effect) => (
          <span key={effect.serviceId}>
            <b>{effect.name}</b>
            <em>{effect.description}</em>
            <strong>{effect.expiresAt ? `${formatDuration(effect.expiresAt - now)} remaining` : `${effect.remainingUses ?? 0} uses`}</strong>
          </span>
        ))}
      </div>
    </article>
  );
}

function RipperdocStatusBar({ state }: { state: GameState }) {
  return (
    <div className="ripperdoc-status-bar">
      <span><b>Credits</b>{state.resources.credits.toLocaleString()}</span>
      <span><b>Scrap</b>{state.resources.scrap.toLocaleString()}</span>
      <span><b>Cyberware Parts</b>{state.resources.cyberwareParts.toLocaleString()}</span>
      <span><b>IN</b>{effectiveNeuralInstability(state)}</span>
      <span><b>Load</b>{cyberwareLoad(state)}</span>
    </div>
  );
}

function RipperdocDetailPanel({ state, clinic, item, service, onBuy, onUse }: { state: GameState; clinic?: RipperdocClinic; item?: ReturnType<typeof getItem>; service?: RipperdocService; onBuy?: () => void; onUse?: () => void }) {
  if (!item && !service) return <aside className="ripperdoc-detail-panel"><p className="muted">Select a shop item or service to inspect details.</p></aside>;
  if (item && clinic) {
    return (
      <aside className={`ripperdoc-detail-panel rarity-${item.rarity.toLowerCase()}`}>
        <div className="panel-heading"><div><p className="eyebrow">{item.type} / {item.rarity}</p><h2>{item.name}</h2></div><EquipmentTypeIconBadge item={item} /></div>
        <p className="muted">{item.description}</p>
        <InfoRow label="Slot" value={titleCase(String(item.slot ?? "Cyberware"))} />
        <InfoRow label="Price" value={`${ripperdocBuyPrice(state, clinic.id, item.id).toLocaleString()} Credits`} warning={!canBuyCyberwareFromRipperdoc(state, clinic.id, item.id)} />
        {item.modifiers && <InfoRow label="Modifiers" value={formatItemModifiers(item.modifiers)} />}
        {item.stats && <StatComparisonLine state={state} itemId={item.id} compareItemId={equippedComparisonItemId(state, item)} />}
        <InfoRow label="Instability Load" value={formatSigned(cyberwareInstabilityLoad(item))} />
        <button className="primary-button full" disabled={!canBuyCyberwareFromRipperdoc(state, clinic.id, item.id)} onClick={onBuy}>Buy Cyberware</button>
      </aside>
    );
  }
  return (
    <aside className="ripperdoc-detail-panel">
      <div className="panel-heading"><div><p className="eyebrow">{service?.category ?? service?.serviceType}</p><h2>{service?.name}</h2></div><BrainCircuit size={22} /></div>
      <p className="muted">{service?.description}</p>
      {service && <ServiceCostRow state={state} service={service} />}
      {service && <ServiceEffectRow service={service} />}
      {service?.risk && <p className="fine danger-text">{service.risk}</p>}
      {service && <button className="primary-button full" disabled={!canUseRipperdocService(state, service.id)} onClick={onUse}>Use Service</button>}
    </aside>
  );
}

function ripperdocTabForService(service: RipperdocService): RipperdocTab {
  if (service.serviceType === "treatment" || service.serviceType === "stabilizer") return "Treat";
  if (service.serviceType === "install" || service.serviceType === "prototypeInstall" || service.serviceType === "remove" || service.serviceType === "loadReduction") return "Install";
  if (service.serviceType === "calibration" || service.serviceType === "slotOptimization") return "Calibrate";
  if (service.serviceType === "upgrade") return "Upgrade";
  return "Calibrate";
}

function formatServiceCost(state: GameState, service: RipperdocService) {
  const entries = Object.entries(service.cost).filter(([, amount]) => Number(amount) > 0).map(([id, amount]) => {
    const adjusted = calculateRipperdocServiceCost(state, Number(amount));
    return `${adjusted.toLocaleString()} ${resourceNames[id as ResourceId] ?? id}`;
  });
  return entries.length ? entries.join(", ") : "No cost";
}

type MarketTab = "Buy" | "Sell" | "Special Stock" | "Limited Stock" | "Trade Info";

function MarketScreen({
  state,
  districtId,
  onBuyVendorItem,
  onSellVendorItem,
  onListBlackMarket,
}: {
  state: GameState;
  districtId: DistrictId;
  onBuyVendorItem: (vendorId: string, itemId: string) => void;
  onSellVendorItem: (vendorId: string, itemId: string) => void;
  onListBlackMarket: (itemId: string, strategy: BlackMarketStrategy) => void;
}) {
  const vendorsForDistrict = districtVendors(districtId);
  const [activeVendorId, setActiveVendorId] = useState(vendorsForDistrict[0]?.id ?? "");
  const vendor = vendorsForDistrict.find((entry) => entry.id === activeVendorId) ?? vendorsForDistrict[0];
  const tabs = marketTabsForVendor(vendor);
  const [activeTab, setActiveTab] = useState<MarketTab>(tabs[0] ?? "Trade Info");
  const visibleItems = vendor ? marketItemsForTab(state, vendor, activeTab) : [];
  const [selectedItemId, setSelectedItemId] = useState(visibleItems[0]?.itemId ?? "");

  useEffect(() => {
    if (!vendor && vendorsForDistrict[0]) setActiveVendorId(vendorsForDistrict[0].id);
  }, [vendor, vendorsForDistrict]);

  useEffect(() => {
    if (!tabs.includes(activeTab)) setActiveTab(tabs[0] ?? "Trade Info");
  }, [activeTab, tabs]);

  useEffect(() => {
    if (!visibleItems.some((entry) => entry.itemId === selectedItemId)) setSelectedItemId(visibleItems[0]?.itemId ?? "");
  }, [selectedItemId, visibleItems]);

  if (!vendor) {
    return (
      <FocusedPanel title="Market">
        <p className="muted">No vendor has set up shop in this district yet.</p>
      </FocusedPanel>
    );
  }

  const selectedEntry = visibleItems.find((entry) => entry.itemId === selectedItemId) ?? visibleItems[0];
  const selectedItem = selectedEntry ? getItem(selectedEntry.itemId) : undefined;
  const district = getDistrict(districtId);
  const unlocked = canUseVendor(state, vendor);

  return (
    <section className="market-screen">
      <MarketHeader state={state} vendor={vendor} districtName={district?.name ?? "District"} unlocked={unlocked} />
      {vendorsForDistrict.length > 1 && (
        <div className="market-vendor-selector">
          {vendorsForDistrict.map((entry) => (
            <button key={entry.id} className={entry.id === vendor.id ? "active" : ""} onClick={() => setActiveVendorId(entry.id)}>
              {entry.name}
            </button>
          ))}
        </div>
      )}
      <MarketTabs activeTab={activeTab} tabs={tabs} onTab={setActiveTab} vendor={vendor} state={state} />
      <MarketResourceStrip state={state} vendor={vendor} />
      <div className="market-layout">
        <div className="market-main-panel">
          {activeTab === "Trade Info" ? (
            <MarketTradeInfo state={state} vendor={vendor} />
          ) : (
            <div className="market-item-grid">
              {visibleItems.map((entry) => (
                <MarketItemCard
                  key={`${activeTab}-${entry.itemId}`}
                  state={state}
                  vendor={vendor}
                  entry={entry}
                  mode={activeTab === "Sell" ? "sell" : "buy"}
                  selected={entry.itemId === selectedEntry?.itemId}
                  onSelect={() => setSelectedItemId(entry.itemId)}
                  onBuy={() => onBuyVendorItem(vendor.id, entry.itemId)}
                  onSell={() => onSellVendorItem(vendor.id, entry.itemId)}
                />
              ))}
              {!visibleItems.length && <p className="muted">No listings match this vendor tab yet.</p>}
            </div>
          )}
        </div>
        <MarketDetailPanel
          state={state}
          vendor={vendor}
          entry={selectedEntry}
          item={selectedItem}
          mode={activeTab === "Sell" ? "sell" : "buy"}
          onBuy={selectedEntry ? () => onBuyVendorItem(vendor.id, selectedEntry.itemId) : undefined}
          onSell={selectedEntry ? () => onSellVendorItem(vendor.id, selectedEntry.itemId) : undefined}
        />
      </div>
      {(districtId === "underpassMarket" || districtId === "blacknetQuarter") && <BlackMarketPanel state={state} onListItem={onListBlackMarket} />}
    </section>
  );
}

function MarketHeader({ state, vendor, districtName, unlocked }: { state: GameState; vendor: VendorDefinition; districtName: string; unlocked: boolean }) {
  const standing = state.districtStanding[vendor.districtId]?.standing ?? 0;
  const threat = state.districtThreat[vendor.districtId]?.level ?? 0;
  return (
    <article className="market-header">
      <div className="market-sign"><Backpack size={26} /></div>
      <div>
        <p className="eyebrow">District Market</p>
        <h2>{vendor.name}</h2>
        <p className="fine">{districtName} • {vendor.canSell ? "Buyback Desk" : "Purchasing Only"} • Standing {standing} • Threat {threat}</p>
        <p className="muted">{vendor.description}</p>
      </div>
      <div className="market-header-badges">
        <span className={unlocked ? "unlocked" : "locked"}>{unlocked ? "Unlocked" : "Locked"}</span>
        <span>{Math.round(vendor.priceModifier * 100)}% Base</span>
        {vendor.specialServices?.map((service) => <span key={service}>{service}</span>)}
      </div>
    </article>
  );
}

function MarketTabs({ activeTab, tabs, onTab, vendor, state }: { activeTab: MarketTab; tabs: MarketTab[]; onTab: (tab: MarketTab) => void; vendor: VendorDefinition; state: GameState }) {
  return (
    <div className="market-tabs">
      {tabs.map((tab) => (
        <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => onTab(tab)}>
          {tab}
          <span>{marketItemsForTab(state, vendor, tab).length}</span>
        </button>
      ))}
    </div>
  );
}

function MarketResourceStrip({ state, vendor }: { state: GameState; vendor: VendorDefinition }) {
  const resources: ResourceId[] = ["credits", "scrap", "cyberwareParts", "vehicleParts", "armorPlating", "encryptedData"];
  return (
    <div className="market-resource-strip">
      {resources.filter((id) => id in state.resources).map((id) => (
        <span key={id}>
          <b>{resourceNames[id]}</b>
          {state.resources[id].toLocaleString()}
        </span>
      ))}
      <span><b>Standing</b>{state.districtStanding[vendor.districtId]?.standing ?? 0}</span>
      <span><b>Threat</b>{state.districtThreat[vendor.districtId]?.level ?? 0}</span>
    </div>
  );
}

function MarketItemCard({
  state,
  vendor,
  entry,
  mode,
  selected,
  onSelect,
  onBuy,
  onSell,
}: {
  state: GameState;
  vendor: VendorDefinition;
  entry: VendorItemEntry;
  mode: "buy" | "sell";
  selected: boolean;
  onSelect: () => void;
  onBuy: () => void;
  onSell: () => void;
}) {
  const item = getItem(entry.itemId);
  const owned = getOwnedCount(state, entry.itemId);
  const price = mode === "sell" ? sellValue(state, vendor, entry.itemId) : vendorPrice(state, vendor, entry);
  const unlocked = vendorItemUnlocked(state, entry);
  const canTrade = mode === "sell" ? canSellVendorItem(state, vendor.id, entry.itemId) : canBuyVendorItem(state, vendor.id, entry.itemId);
  const rarity = item?.rarity ?? "Common";
  return (
    <article className={`market-item-card rarity-${rarity.toLowerCase()} ${selected ? "selected" : ""} ${unlocked ? "" : "locked-card"}`} onClick={onSelect}>
      <div className="market-item-icon">{item ? <EquipmentTypeIconBadge item={item} /> : <span>{resourceIconLabel(entry.itemId)}</span>}</div>
      <div className="market-item-copy">
        <p className="eyebrow">{mode === "sell" ? "Sell" : marketStockLabel(state, vendor, entry)}</p>
        <h3>{item?.name ?? resourceNames[entry.itemId as ResourceId] ?? entry.itemId}</h3>
        <p className="fine">{item ? `${item.type} • ${rarity}` : "Resource"}</p>
        <p className="muted">{item?.description ?? entry.sourceHint}</p>
        {!unlocked && <p className="danger-text">Requires {vendorRequirementHint(entry)}</p>}
      </div>
      <div className="market-card-trade">
        <strong>{price.toLocaleString()}</strong>
        <span>{mode === "sell" ? "Sell Value" : "Credits"}</span>
        <em>Owned {owned.toLocaleString()}</em>
        <button className={mode === "sell" ? "secondary-button" : "primary-button"} disabled={!canTrade} onClick={(event) => { event.stopPropagation(); mode === "sell" ? onSell() : onBuy(); }}>
          {mode === "sell" ? "Sell 1" : "Buy"}
        </button>
      </div>
    </article>
  );
}

function MarketDetailPanel({
  state,
  vendor,
  entry,
  item,
  mode,
  onBuy,
  onSell,
}: {
  state: GameState;
  vendor: VendorDefinition;
  entry?: VendorItemEntry;
  item?: ReturnType<typeof getItem>;
  mode: "buy" | "sell";
  onBuy?: () => void;
  onSell?: () => void;
}) {
  if (!entry) {
    return <aside className="market-detail-panel"><p className="muted">Select a listing to inspect price, stock, requirements, and use cases.</p></aside>;
  }
  const unlocked = vendorItemUnlocked(state, entry);
  const price = vendorPrice(state, vendor, entry);
  const sell = sellValue(state, vendor, entry.itemId);
  const owned = getOwnedCount(state, entry.itemId);
  const limitedRestockAt = entry.stockType === "limited" ? vendorLimitedStockRefreshAt(state, vendor.id) : undefined;
  const limitedRestockLabel = limitedRestockAt ? formatDuration(Math.max(0, limitedRestockAt - Date.now())) : "15m";
  return (
    <aside className={`market-detail-panel rarity-${(item?.rarity ?? "Common").toLowerCase()}`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{item?.rarity ?? "Resource"} / {item?.type ?? "Market Good"} / Owned {owned.toLocaleString()}</p>
          <h2>{item?.name ?? resourceNames[entry.itemId as ResourceId] ?? entry.itemId}</h2>
        </div>
        {item ? <EquipmentTypeIconBadge item={item} /> : <span className="resource-detail-icon">{resourceIconLabel(entry.itemId)}</span>}
      </div>
      <p className="muted">{item?.description ?? entry.sourceHint}</p>
      <div className="market-detail-rows">
        <InfoRow label="Stock" value={marketStockLabel(state, vendor, entry)} warning={!unlocked} />
        {entry.stockType === "limited" && <InfoRow label="Restock" value={limitedRestockLabel} />}
        <InfoRow label="Source" value={entry.sourceHint} />
        <InfoRow label="Buy Price" value={`${price.toLocaleString()} Credits`} warning={!canBuyVendorItem(state, vendor.id, entry.itemId)} />
        <InfoRow label="Sell Value" value={`${sell.toLocaleString()} Credits`} warning={!canSellVendorItem(state, vendor.id, entry.itemId)} />
        {!unlocked && <InfoRow label="Requirements" value={vendorRequirementHint(entry)} warning />}
        {item?.stats && <StatComparisonLine state={state} itemId={item.id} compareItemId={equippedComparisonItemId(state, item)} />}
        {item?.modifiers && <InfoRow label="Effects" value={formatItemModifiers(item.modifiers)} />}
      </div>
      <MarketPriceBreakdown state={state} vendor={vendor} entry={entry} />
      <div className="market-detail-actions">
        <button className="primary-button full" disabled={!canBuyVendorItem(state, vendor.id, entry.itemId)} onClick={onBuy}>Buy 1</button>
        {vendor.canSell && <button className="secondary-button full" disabled={!canSellVendorItem(state, vendor.id, entry.itemId)} onClick={onSell}>Sell 1</button>}
      </div>
      {mode === "sell" && <p className="fine">Selling removes one owned copy. Equipped gear stays visible in inventory and should be unequipped there first when needed.</p>}
    </aside>
  );
}

function MarketPriceBreakdown({ state, vendor, entry }: { state: GameState; vendor: VendorDefinition; entry: VendorItemEntry }) {
  const finalPrice = vendorPrice(state, vendor, entry);
  const item = getItem(entry.itemId);
  const adjustedBase = calculateRarityAdjustedShopBasePrice(item, entry.price);
  const factionDiscount = Object.entries(vendor.factionDiscounts ?? {})
    .filter(([factionId]) => factionRankNumber(state.factions[factionId as FactionId]?.reputation ?? 0) > 0)
    .map(([factionId, discount]) => `${titleCase(factionId)} -${Math.round((discount ?? 0) * 100)}%`);
  const pathDiscount = state.startingPath ? vendor.startingPathModifiers?.[state.startingPath] ?? 0 : 0;
  const factionDiscountTotal = Object.entries(vendor.factionDiscounts ?? {}).reduce((sum, [factionId, discount]) => {
    return sum + (factionRankNumber(state.factions[factionId as FactionId]?.reputation ?? 0) > 0 ? discount ?? 0 : 0);
  }, 0);
  const vendorRate = Math.max(0.35, vendor.priceModifier - factionDiscountTotal - pathDiscount);
  const standingDiscount = Math.min(0.18, (state.districtStanding[vendor.districtId]?.standing ?? 0) / 600);
  const threatMarkup = districtThreatPenalty(state, vendor.districtId);
  const shopModifier = getActiveModifiers(state).shopPrices;
  const districtRate = 1 + threatMarkup - standingDiscount + shopModifier;
  return (
    <div className="market-price-breakdown">
      <p className="eyebrow">Price Breakdown</p>
      <span><b>Listed Base</b>{entry.price.toLocaleString()} Credits</span>
      {adjustedBase !== entry.price && <span><b>Rarity Floor</b>{adjustedBase.toLocaleString()} Credits</span>}
      <span><b>Vendor Rate</b>{Math.round(vendorRate * 100)}%</span>
      {pathDiscount > 0 && <span><b>Life Path</b>-{Math.round(pathDiscount * 100)}%</span>}
      {factionDiscount.map((label) => <span key={label}><b>Faction</b>{label}</span>)}
      {(standingDiscount !== 0 || threatMarkup !== 0 || shopModifier !== 0) && (
        <span><b>District/Global</b>{Math.round(districtRate * 100)}%</span>
      )}
      <span><b>Final</b>{finalPrice.toLocaleString()} Credits</span>
    </div>
  );
}

function MarketTradeInfo({ state, vendor }: { state: GameState; vendor: VendorDefinition }) {
  const standing = state.districtStanding[vendor.districtId]?.standing ?? 0;
  const threat = state.districtThreat[vendor.districtId]?.level ?? 0;
  return (
    <div className="market-info-grid">
      <article>
        <p className="eyebrow">Vendor Rules</p>
        <h3>Trading Access</h3>
        <RequirementStatusList requirements={textRequirementDetails(state, vendor.unlockRequirements)} />
        <p className="muted">{vendor.refreshBehavior}</p>
      </article>
      <article>
        <p className="eyebrow">Pricing</p>
        <h3>Risk and Standing</h3>
        <p className="fine">Standing {standing} improves local trade confidence. Threat {threat} can make prices harsher through the central balance formulas.</p>
        <p className="fine">Faction and life path discounts apply when the vendor supports them.</p>
      </article>
      <article>
        <p className="eyebrow">Item Sources</p>
        <h3>Where Stock Comes From</h3>
        <p className="muted">Each listing keeps its source hint on the card and detail panel so the player can connect vendors to districts, unlocks, and future collection goals.</p>
      </article>
    </div>
  );
}

function marketTabsForVendor(vendor?: VendorDefinition): MarketTab[] {
  if (!vendor) return ["Trade Info"];
  const tabs: MarketTab[] = ["Buy"];
  if (vendor.canSell) tabs.push("Sell");
  if (vendor.inventory.some((entry) => entry.stockType === "unlock" || entry.requiredUnlock || entry.requiredDistrictUnlock || Object.keys(entry.requiredFactionRank ?? {}).length)) tabs.push("Special Stock");
  if (vendor.inventory.some((entry) => entry.stockType === "limited")) tabs.push("Limited Stock");
  tabs.push("Trade Info");
  return tabs;
}

function marketItemsForTab(state: GameState, vendor: VendorDefinition, tab: MarketTab): VendorItemEntry[] {
  if (tab === "Trade Info") return [];
  if (tab === "Sell") {
    const sellableIds = [...Object.keys(state.inventory), ...resourceOrder.filter((id) => (state.resources[id] ?? 0) > 0)]
      .filter((itemId) => canSellVendorItem(state, vendor.id, itemId));
    return sellableIds.map((itemId) => ({ itemId, price: sellValue(state, vendor, itemId), stockType: "infinite" as const, sourceHint: "Owned item" }));
  }
  return vendor.inventory.filter((entry) => {
    if (tab === "Special Stock") return entry.stockType === "unlock" || Boolean(entry.requiredUnlock || entry.requiredDistrictUnlock || Object.keys(entry.requiredFactionRank ?? {}).length);
    if (tab === "Limited Stock") return entry.stockType === "limited";
    return entry.stockType === "infinite";
  });
}

function marketStockLabel(state: GameState, vendor: VendorDefinition, entry: VendorItemEntry) {
  if (entry.stockType === "infinite") return "Infinite Stock";
  if (entry.stockType === "unlock") return vendorItemUnlocked(state, entry) ? "Special Stock" : "Locked Stock";
  return `${vendorLimitedStockRemaining(state, vendor.id, entry)} / ${entry.stock ?? 0} left`;
}

function resourceIconLabel(itemId: string) {
  return (resourceNames[itemId as ResourceId] ?? itemId).slice(0, 3).toUpperCase();
}

function CompactRequirementList({ state, districtId, requirements }: { state: GameState; districtId: DistrictId; requirements: string[] }) {
  return (
    <div className="compact-requirements">
      {requirements.map((requirement) => {
        const met = state.districts[districtId]?.unlocked || textRequirementMet(state, requirement);
        return <span key={requirement} className={met ? "met" : "missing"}>{met ? "ok" : "lock"} {requirementHint(state, requirement)}</span>;
      })}
    </div>
  );
}

function requirementHint(state: GameState, requirement: string) {
  const skillMatch = requirement.match(/^(Scavenging|Hacking|Cyberware Engineering|Engineering|Street Combat|Vehicle Tuning|Medical Knowledge) level (\d+)/i);
  if (skillMatch) {
    const [, label, target] = skillMatch;
    const skillId = (Object.entries(skillNames).find(([, name]) => name.toLowerCase() === label.toLowerCase())?.[0] ?? null) as SkillId | null;
    if (skillId) return `${label} ${state.skills[skillId].level}/${target}`;
  }
  const reputationMatch = requirement.match(/^Reputation (\d+)/i);
  if (reputationMatch) return `Reputation ${state.resources.reputation}/${reputationMatch[1]}`;
  return requirement;
}

function activeActivity(state: GameState, now = Date.now()): ActiveActivity | null {
  if (state.activeAction) {
    const action = skillActions.find((entry) => entry.id === state.activeAction?.actionId);
    if (!action) return null;
    const skill = state.skills[action.skillId];
    const nextXp = xpForNextLevel(skill.level);
    return {
      name: action.name,
      type: skillNames[action.skillId],
      districtId: action.districtReq ?? state.selectedDistrict,
      category: action.tags?.includes("supply") ? "crafting" : skillCategoryFor(action.skillId),
      progress: progressPercent(now, state.activeAction.startedAt, state.activeAction.durationMs),
      skillId: action.skillId,
      skillLevel: skill.level,
      skillXp: skill.xp,
      skillNextXp: nextXp,
      skillProgress: Math.min(100, (skill.xp / Math.max(1, nextXp)) * 100),
    };
  }

  if (state.currentCombat) {
    const enemy = getEnemy(state.currentCombat.enemyId);
    const matchup = enemy ? combatEffectivenessForEnemy(state, enemy) : null;
    const enemyHp = state.currentCombat.enemyCurrentHp ?? matchup?.effectiveHp ?? 0;
    const enemyMaxHp = state.currentCombat.enemyMaxHp ?? matchup?.effectiveHp ?? 1;
    return enemy
      ? {
          name: enemy.name,
          type: "Combat",
          districtId: districtForEnemy(enemy.id),
          category: skillCategoryFor("combat"),
          progress: combatAttackProgress(state.currentCombat, now),
          detail: `HP ${Math.ceil(state.health.currentHp)}/${calculateMaxHP(state)} / Enemy ${Math.ceil(enemyHp)}/${Math.ceil(enemyMaxHp)}`,
        }
      : null;
  }

  if (state.activeCraft) {
    const recipe = recipes.find((entry) => entry.id === state.activeCraft?.recipeId);
    return recipe ? { name: recipe.name, type: "Crafting", districtId: state.selectedDistrict, category: "crafting", progress: progressPercent(now, state.activeCraft.startedAt, state.activeCraft.durationMs) } : null;
  }
  return null;
}

function progressPercent(now: number, startedAt: number, durationMs: number) {
  return Math.max(0, Math.min(100, ((now - startedAt) / Math.max(1, durationMs)) * 100));
}

function combatAttackProgress(combat: NonNullable<GameState["currentCombat"]>, now: number) {
  const last = combat.lastPlayerAttackAt ?? combat.startedAt;
  const next = combat.nextPlayerAttackAt ?? combat.startedAt + combat.durationMs;
  return progressPercent(now, last, Math.max(1, next - last));
}

function districtForEnemy(enemyId: string): DistrictId | null {
  for (const districtId of cityDistrictOrder) {
    if (districtCombatZones(districtId).some((zone) => zone.enemies.some((enemy) => enemy.id === enemyId))) return districtId;
  }
  return null;
}

function districtVehicles(districtId: DistrictId) {
  const rarityScore = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5, Prototype: 6, Relic: 7 } as const;
  return vehicles
    .filter((vehicle) => vehicle.districtId === districtId)
    .sort((a, b) => rarityScore[a.rarity] - rarityScore[b.rarity] || (a.cost.credits ?? 0) - (b.cost.credits ?? 0) || a.name.localeCompare(b.name));
}

function ActivityGroup({ title, children }: { title: string; children: ReactNode }) {
  const list = Array.isArray(children) ? children.filter(Boolean) : children;
  if (Array.isArray(list) && list.length === 0) return null;
  return (
    <NeonPanel>
      <h2>{title}</h2>
      <div className="card-list">{list}</div>
    </NeonPanel>
  );
}

function VendorCard({
  state,
  vendor,
  onBuy,
  onSell,
}: {
  state: GameState;
  vendor: VendorDefinition;
  onBuy: (itemId: string) => void;
  onSell: (itemId: string) => void;
}) {
  const unlocked = canUseVendor(state, vendor);
  const standing = state.districtStanding[vendor.districtId]?.standing ?? 0;
  const threat = state.districtThreat[vendor.districtId]?.level ?? 0;
  return (
    <ActivityCard locked={!unlocked}>
      <div>
        <p className="eyebrow">Market / Standing {standing} / Threat {threat}</p>
        <h3>{vendor.name}</h3>
        <p className="muted">{vendor.description}</p>
        <p className="fine">Pricing: base {Math.round(vendor.priceModifier * 100)}%, faction and path discounts apply, threat raises prices.</p>
        <p className="fine">Refresh: {vendor.refreshBehavior}</p>
        {vendor.specialServices?.length ? <TagList tags={vendor.specialServices} /> : null}
        <RequirementStatusList requirements={textRequirementDetails(state, vendor.unlockRequirements)} />
      </div>
      <div className="card-list compact">
        {vendor.inventory.map((entry) => (
          <VendorItemRow
            key={entry.itemId}
            state={state}
            vendor={vendor}
            entry={entry}
            onBuy={() => onBuy(entry.itemId)}
            onSell={() => onSell(entry.itemId)}
          />
        ))}
      </div>
    </ActivityCard>
  );
}

function BlackMarketPanel({
  state,
  onListItem,
}: {
  state: GameState;
  onListItem: (itemId: string, strategy: BlackMarketStrategy) => void;
}) {
  const eligible = blackMarketEligibleItems(state);
  const heat = state.resources.heat;
  const strategies: BlackMarketStrategy[] = ["quickSale", "standard", "highBid", "privateBuyer"];
  return (
    <NeonPanel>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Ghost Market Terminal / Heat {heat}</p>
          <h2>Black Market Board</h2>
        </div>
        <span className="warning-badge">{heat >= 100 ? "LOCKDOWN" : heat >= 75 ? "HUNTED" : heat >= 50 ? "WANTED" : "OPEN"}</span>
      </div>
      <TerminalLog>
        <p>Role: rare, illegal, prototype, high-value sales. Normal vendors are safer; Ripperdocs are better for instant cyberware sales.</p>
        <p>Heat effects: low Heat sells cleanly, Wanted slows sales, Hunted adds sting risk, Lockdown pauses listings when automation is enabled.</p>
      </TerminalLog>
      <h3>List Item</h3>
      <div className="card-list">
        {eligible.slice(0, 6).map((itemId) => {
          const item = getItem(itemId);
          return (
            <ActivityCard key={itemId}>
              <div>
                <p className="eyebrow">{item?.rarity} / Qty {state.inventory[itemId] ?? 0}</p>
                <h3>{item?.name ?? itemId}</h3>
                <p className="fine">Generic value {item?.sellValue ?? 0} / Black Market expected {expectedBlackMarketValue(state, itemId, "standard")} / Risk {heat >= 75 ? "High" : heat >= 50 ? "Medium" : "Low"}</p>
                <p className="fine">Recommended: {item?.type === "Cyberware" && heat >= 50 ? "Ripperdoc instant sale" : item?.rarity === "Common" ? "Vendor" : "Black Market"}</p>
              </div>
              <div className="card-list compact">
                {strategies.map((strategy) => (
                  <button key={strategy} className="secondary-button full" disabled={strategy === "privateBuyer" && (state.factions.ghostMarket.reputation < 40 && Object.values(state.fixerTrust).every((trust) => trust.trust < 80))} onClick={() => onListItem(itemId, strategy)}>
                    {titleCase(strategy)} {expectedBlackMarketValue(state, itemId, strategy)}
                  </button>
                ))}
              </div>
            </ActivityCard>
          );
        })}
        {!eligible.length && <p className="muted">No eligible rare, illegal, prototype, cyberware, attachment, mod, or blueprint items to list.</p>}
      </div>
      <h3>Active Listings</h3>
      <div className="card-list">
        {state.blackMarketListings.map((listing) => (
          <ActivityCard key={listing.id}>
            <div>
              <p className="eyebrow">{titleCase(listing.strategy)} / {listing.status}</p>
              <h3>{getItem(listing.itemId)?.name ?? listing.itemId}</h3>
              <Progress value={listing.progress} label={`${Math.round(listing.progress)}%`} />
              <p className="fine">Ask {listing.askingPrice} / Sale {Math.round(listing.saleChance * 100)}% / Heat risk {Math.round(listing.heatRisk * 100)}% / Buyer risk {Math.round(listing.buyerRisk * 100)}%</p>
              {listing.outcome && <p className="fine">{listing.outcome}</p>}
            </div>
          </ActivityCard>
        ))}
        {!state.blackMarketListings.length && <p className="muted">No active listings.</p>}
      </div>
      <h3>Completed Sales</h3>
      <div className="terminal-log">
        {state.blackMarketCompletedSales.slice(0, 6).map((listing) => (
          <p key={listing.id}>{listing.status}: {getItem(listing.itemId)?.name ?? listing.itemId} / {listing.outcome}</p>
        ))}
        {!state.blackMarketCompletedSales.length && <p>No completed outcomes yet.</p>}
      </div>
    </NeonPanel>
  );
}

function VendorItemRow({
  state,
  vendor,
  entry,
  onBuy,
  onSell,
}: {
  state: GameState;
  vendor: VendorDefinition;
  entry: VendorItemEntry;
  onBuy: () => void;
  onSell: () => void;
}) {
  const item = getItem(entry.itemId);
  const owned = getOwnedCount(state, entry.itemId);
  const price = vendorPrice(state, vendor, entry);
  const stockText = entry.stockType === "limited" ? `${vendorLimitedStockRemaining(state, vendor.id, entry)} left` : entry.stockType === "unlock" ? "unlock stock" : "infinite";
  const unlocked = vendorItemUnlocked(state, entry);
  return (
    <article className={`enemy-card vendor-item ${unlocked ? "" : "locked-card"}`}>
      <div>
        <strong>{item?.name ?? resourceNames[entry.itemId as ResourceId] ?? entry.itemId}</strong>
        <span>{entry.sourceHint}</span>
        <span>Owned {owned} / {stockText}</span>
        {!unlocked && <span>Requires {vendorRequirementHint(entry)}</span>}
      </div>
      <div className="vendor-actions">
        <button className="primary-button" disabled={!canBuyVendorItem(state, vendor.id, entry.itemId)} onClick={onBuy}>
          Buy {price}
        </button>
        {vendor.canSell && (
          <button className="secondary-button" disabled={!canSellVendorItem(state, vendor.id, entry.itemId)} onClick={onSell}>
            Sell {sellValue(state, vendor, entry.itemId)}
          </button>
        )}
      </div>
    </article>
  );
}

function SkillsTab({ state, onStart }: { state: GameState; onStart: (actionId: string) => void }) {
  return (
    <section className="stack">
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Skill action unlocks</p>
            <h2>Train the Matching Skill</h2>
          </div>
          <Activity size={22} />
        </div>
        <p className="muted">Each action unlocks from the skill it trains. Hacking opens better hacks, Scavenging opens better salvage routes, and Cyberware opens better crafting and implant work.</p>
      </article>
      {skillOrder.filter((skillId) => skillId !== "combat").map((skillId) => (
        <SkillPanel key={skillId} state={state} skillId={skillId} onStart={onStart} />
      ))}
    </section>
  );
}

function SkillPanel({
  state,
  skillId,
  onStart,
}: {
  state: GameState;
  skillId: Exclude<SkillId, "combat">;
  onStart: (actionId: string) => void;
}) {
  const skill = state.skills[skillId];
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Level {skill.level}</p>
          <h2>{skillNames[skillId]}</h2>
        </div>
        <BrainCircuit size={22} />
      </div>
      <p className="muted">{skillDescriptions[skillId]}</p>
      <Progress value={(skill.xp / xpForNextLevel(skill.level)) * 100} label={`${skill.xp} / ${xpForNextLevel(skill.level)} XP`} />
      <details className="inline-dropdown">
        <summary className="details-button">Actions</summary>
        <div className="card-list">
          {skillActions
            .filter((action) => action.skillId === skillId && !action.tags?.includes("supply"))
            .sort((a, b) => a.levelReq - b.levelReq || a.durationMs - b.durationMs || a.name.localeCompare(b.name))
            .map((action) => (
              <ActionCard
                key={action.id}
                state={state}
                action={action}
                disabled={false}
                onStart={() => onStart(action.id)}
              />
            ))}
        </div>
      </details>
    </article>
  );
}

function ActionCard({
  state,
  action,
  disabled,
  onStart,
  onStop,
}: {
  state: GameState;
  action: SkillAction;
  disabled: boolean;
  onStart: () => void;
  onStop?: () => void;
}) {
  const mastery = state.actionMastery[action.id] ?? { level: 1, xp: 0 };
  const requiredItemsMet = Object.entries(action.requiredItems ?? {}).every(([id, amount]) => {
    if (id in resourceNames) return state.resources[id as ResourceId] >= amount;
    return (state.inventory[id] ?? 0) >= amount;
  });
  const districtUnlocked = !action.districtReq || state.districts[action.districtReq]?.unlocked;
  const unlocksMet = (action.requiredUnlocks ?? []).every((id) => state.unlocks[id] || state.worldUnlocks[id] || state.unlockedBlueprints[id] || Boolean(state.inventory[id]));
  const accessMet = meetsActionAccessRequirement(state, action);
  const locked = !accessMet || !districtUnlocked || !unlocksMet || !requiredItemsMet;
  const affordable = canAffordRewards(state, action.rewards);
  const displayedRewards = calculateSkillActionRewards(state, action);
  const displayedCosts = actionRewardCosts(displayedRewards);
  const positiveRewards = positiveRewardBundle(displayedRewards);
  const manuallyDone = Boolean(state.manualDiscovery.skillActions[action.id]);
  const active = state.activeAction?.actionId === action.id;
  const nextMasteryMilestone = nextActionMasteryMilestone(mastery.level);
  const progress = active && state.activeAction ? activityProgress(state.activeAction.startedAt, state.activeAction.durationMs) : null;
  const badges = actionRecommendationBadges(state, action, displayedRewards);
  const duration = adjustedActionDurationMs(state, action.durationMs, action.id, [action.skillId, ...(action.tags ?? [])]);
  const displayedXpReward = actionXpRewardWithMastery(state, action);
  const displayedMasteryXpReward = Math.round(actionMasteryXpReward(state, action) * (1 + getActiveModifiers(state).masteryXpGain));
  const districtMasteryXp = action.districtReq ? Math.max(4, Math.round(action.xpReward * 0.55 + displayedMasteryXpReward * 0.35)) : 0;
  return (
    <article className={`action-card action-mission-card ${active ? "active-card" : ""} ${locked ? "locked-card" : ""}`}>
      <div className="mission-card-frame">
        <header className="mission-header">
          <div className="mission-title-block">
            <p className="eyebrow">{action.district} / {skillNames[action.skillId]}</p>
            <h3>{action.name}</h3>
          </div>
          <div className="mission-header-tools">
            <StatusBadge locked={locked} active={active} />
            <RiskBadge action={action} />
            <ActionIconPlaceholder action={action} />
          </div>
        </header>

        <p className="mission-description">{action.description}</p>
        <RecommendationBadges badges={badges} />

        <div className="mission-section-stack">
          <InfoSectionRow icon={<Target size={22} />} title="Requirements">
            <RequirementSummary
              state={state}
              action={action}
              accessMet={accessMet}
              unlocksMet={unlocksMet}
              requiredItemsMet={requiredItemsMet}
              displayedCosts={displayedCosts}
              duration={duration}
              baseDuration={action.durationMs}
            />
          </InfoSectionRow>

          <InfoSectionRow icon={<TrendingUp size={22} />} title="Gains">
            <div className="mission-gain-grid">
              <strong>+{displayedXpReward}</strong>
              <span>{skillNames[action.skillId]} XP</span>
              <strong>+{displayedMasteryXpReward}</strong>
              <span>Mastery XP</span>
            </div>
          </InfoSectionRow>

          <MissionProgressSummary
            mastery={mastery}
            nextMasteryMilestone={nextMasteryMilestone}
            districtMasteryXp={districtMasteryXp}
          />

          <InfoSectionRow icon={<Gift size={22} />} title="Rewards">
            <div className="reward-chip-grid">
              {Object.entries(positiveRewards).filter(([, amount]) => amount).map(([id, amount]) => (
                <RewardChip key={id} id={id} amount={amount ?? 0} />
              ))}
              {Object.entries(action.itemRewards ?? {}).map(([id, amount]) => <RewardChip key={id} id={id} amount={amount} />)}
              {!Object.values(positiveRewards).some(Boolean) && !Object.keys(action.itemRewards ?? {}).length && <span className="muted">No direct resource reward.</span>}
            </div>
          </InfoSectionRow>

          {action.rareDrops?.length ? (
            <InfoSectionRow icon={<PackageSearch size={22} />} title="Drops">
              <div className="reward-chip-grid drop-chip-grid">
                {action.rareDrops.map((drop) => <DropChip key={drop.id} drop={drop} />)}
              </div>
            </InfoSectionRow>
          ) : null}
        </div>

        <details className="card-details mission-details">
          <summary className="details-button mission-details-button"><FileText size={16} /> Details</summary>
          <div className="mission-details-body">
            {action.requiredItems && <p className="fine">Required items: {Object.entries(action.requiredItems).map(([id, amount]) => `${amount} ${resourceNames[id as ResourceId] ?? getItem(id)?.name ?? id}`).join(", ")}</p>}
            {action.recommendedTools?.length ? <p className="fine">Tools: {action.recommendedTools.map((id) => getItem(id)?.name ?? id).join(", ")}</p> : null}
            {action.recommendedPrograms?.length ? <p className="fine">Programs: {action.recommendedPrograms.map((id) => getItem(id)?.name ?? id).join(", ")}</p> : null}
            {action.requiredUnlocks?.length ? <p className="fine">Blueprints/Unlocks: {action.requiredUnlocks.join(", ")}</p> : null}
            {action.traceChance ? <p className="fine">Trace {formatOneInChance(action.traceChance)} / Severity {action.traceSeverity ?? 1}</p> : null}
            <p className="fine">Tags: {[action.skillId, ...(action.tags ?? [])].join(", ") || "None"}</p>
            <p className="fine">Manual {manuallyDone ? "Complete" : "Needed"} / Sim Cache {manuallyDone && action.simCacheEligible !== false ? "Ready" : "Locked"}</p>
            <p className="fine">Active modifiers: {getActiveModifiers(state).activeSources.join(", ") || "None"}</p>
          </div>
        </details>

        <ActionStartStopButton
        active={active}
        progress={progress}
        locked={locked}
        disabled={disabled || !affordable}
        startLabel={locked ? "Locked" : "Start"}
        stopLabel="Stop"
        onStart={onStart}
        onStop={onStop}
      />
      </div>
    </article>
  );
}

function InfoSectionRow({ icon, title, tone = "cyan", children }: { icon: ReactNode; title: string; tone?: "cyan" | "gold"; children: ReactNode }) {
  return (
    <section className={`mission-section mission-section-${tone}`}>
      <div className="mission-section-label">
        <span className="mission-section-icon">{icon}</span>
        <strong>{title}</strong>
      </div>
      <div className="mission-section-content">{children}</div>
    </section>
  );
}

function MissionProgressSummary({
  mastery,
  nextMasteryMilestone,
  districtMasteryXp,
}: {
  mastery: { level: number; xp: number };
  nextMasteryMilestone?: ReturnType<typeof nextActionMasteryMilestone>;
  districtMasteryXp: number;
}) {
  return (
    <section className="mission-section mission-progress-summary">
      <div className="mission-section-label">
        <span className="mission-section-icon"><Star size={22} /></span>
        <strong>Progress</strong>
      </div>
      <div className="mission-section-content mission-progress-summary-content">
        <div className="mission-progress-row">
          <span className="mission-progress-label"><Star size={15} /> Mastery</span>
          <MasteryProgressBar mastery={mastery} />
        </div>
        <div className="mission-progress-row mission-progress-row-gold">
          <span className="mission-progress-label"><Shield size={15} /> Next</span>
          {nextMasteryMilestone ? (
            <div className="mission-copy-block">
              <strong>Mastery {nextMasteryMilestone.level}: {nextMasteryMilestone.name}</strong>
              <span>{nextMasteryMilestone.description}</span>
            </div>
          ) : (
            <span className="muted">All listed mastery milestones unlocked.</span>
          )}
        </div>
        <div className="mission-progress-row">
          <span className="mission-progress-label"><MapPinned size={15} /> District</span>
          <span>District Mastery XP: <strong>{districtMasteryXp ? `+${districtMasteryXp}` : "None"}</strong></span>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ locked, active }: { locked: boolean; active: boolean }) {
  return (
    <span className={`mission-badge status-badge ${active ? "active" : locked ? "locked" : "unlocked"}`}>
      {active ? <Timer size={15} /> : locked ? <Lock size={15} /> : <Unlock size={15} />}
      {active ? "Running" : locked ? "Locked" : "Unlocked"}
    </span>
  );
}

function RiskBadge({ action }: { action: SkillAction }) {
  const heat = Math.max(0, action.heatChange ?? 0);
  const trace = action.traceChance ?? 0;
  const instability = 0;
  const score = heat + trace * 100 + instability * 2;
  const label = score >= 35 ? "High Risk" : score >= 14 ? "Med Risk" : "Low Risk";
  const tone = score >= 35 ? "high" : score >= 14 ? "medium" : "low";
  return (
    <span className={`mission-badge risk-badge risk-${tone}`}>
      <ShieldAlert size={15} />
      {label}
    </span>
  );
}

function ActionIconPlaceholder({ action }: { action: SkillAction }) {
  const initials = skillNames[action.skillId].split(/\s+/).map((word) => word[0]).join("").slice(0, 2);
  return <span className={`mission-action-icon skill-${action.skillId}`}>{initials}</span>;
}

function RequirementSummary({
  state,
  action,
  accessMet,
  unlocksMet,
  requiredItemsMet,
  displayedCosts,
  duration,
  baseDuration,
}: {
  state: GameState;
  action: SkillAction;
  accessMet: boolean;
  unlocksMet: boolean;
  requiredItemsMet: boolean;
  displayedCosts: RewardBundle;
  duration: number;
  baseDuration: number;
}) {
  const costEntries = Object.entries(displayedCosts).filter(([, amount]) => (amount ?? 0) > 0);
  const durationDelta = duration - baseDuration;
  const durationModifier = baseDuration > 0 ? Math.round((durationDelta / baseDuration) * 100) : 0;
  return (
    <div className="requirement-summary">
      <RequirementSummaryRow
        met={accessMet}
        label="Skill"
        text={`${skillNames[action.skillId]} level ${action.levelReq}`}
        value={`${state.skills[action.skillId].level} / ${action.levelReq}`}
      />
      {(action.requiredUnlocks?.length ?? 0) > 0 && (
        <RequirementSummaryRow
          met={unlocksMet}
          label="Unlock"
          text={action.requiredUnlocks?.join(", ") ?? "Required unlock"}
          value={unlocksMet ? "Ready" : "Needed"}
        />
      )}
      {action.requiredItems && (
        <RequirementSummaryRow
          met={requiredItemsMet}
          label="Items"
          text={Object.entries(action.requiredItems).map(([id, amount]) => `${amount} ${getItem(id)?.name ?? resourceNames[id as ResourceId] ?? id}`).join(", ")}
          value={requiredItemsMet ? "Ready" : "Missing"}
        />
      )}
      {costEntries.map(([id, amount]) => {
        const owned = getOwnedCount(state, id);
        const met = owned >= (amount ?? 0);
        return (
          <RequirementSummaryRow
            key={id}
            met={met}
            label="Cost"
            text={getItem(id)?.name ?? resourceNames[id as ResourceId] ?? id}
            value={`${owned.toLocaleString()} / ${(amount ?? 0).toLocaleString()}`}
          />
        );
      })}
      <div className="requirement-time-grid">
        <span><Timer size={14} /> Base <strong>{formatDuration(baseDuration)}</strong></span>
        <span className={durationModifier < 0 ? "success-text" : durationModifier > 0 ? "missing" : ""}>Mods <strong>{durationModifier > 0 ? "+" : ""}{durationModifier}%</strong></span>
        <span><Timer size={14} /> Final <strong>{formatDuration(duration)}</strong></span>
      </div>
    </div>
  );
}

function RequirementSummaryRow({ met, label, text, value }: { met: boolean; label: string; text: string; value: string }) {
  return (
    <div className={`requirement-summary-row ${met ? "met" : "missing"}`}>
      <span className="requirement-state">{met ? "Met" : "Need"}</span>
      <span className="requirement-main"><b>{label}</b>{text}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RequirementStatusList({ requirements, emptyLabel = "No requirements." }: { requirements: Array<{ text: string; met: boolean }>; emptyLabel?: string }) {
  if (!requirements.length) return <p className="requirement-status-row met">{emptyLabel}</p>;
  return (
    <div className="requirement-status-list">
      {requirements.map((requirement) => (
        <p key={requirement.text} className={`requirement-status-row ${requirement.met ? "met" : "missing"}`}>
          {requirement.met ? "Met" : "Needs"}: {requirement.text}
        </p>
      ))}
    </div>
  );
}

function textRequirementDetails(state: GameState, requirements: string[]) {
  return requirements.map((requirement) => ({ text: requirement, met: textRequirementMet(state, requirement) }));
}

function textRequirementMet(state: GameState, requirement: string) {
  if (requirement.startsWith("Complete ")) return rpgMissions.some(mission => requirement === `Complete ${mission.title}` && Boolean(state.rpg.completed[mission.id]));
  const lower = requirement.toLowerCase();
  if (lower.startsWith("complete main job:")) return rpgMissions.some(m => lower.endsWith(m.title.toLowerCase()) && Boolean(state.rpg.completed[m.id]));
  const anySkillMatch = lower.match(/any main skill\s+level\s+(\d+)/);
  if (anySkillMatch) return hasAnyMainSkillLevel(state, Number(anySkillMatch[1]));
  const skillMatch = lower.match(/(scavenging|hacking|cyberware engineering|engineering|cyberware|street combat|combat|vehicle tuning|medical knowledge|medical)\s+level\s+(\d+)/);
  if (skillMatch) {
    const label = skillMatch[1];
    const skillId: SkillId | null =
      label.includes("scavenging") ? "scavenging" :
      label.includes("hacking") ? "hacking" :
      (label.includes("cyberware") || label.includes("engineering")) ? "cyberware" :
      label.includes("vehicle") ? "vehicleTuning" :
      label.includes("medical") ? "medical" :
      label.includes("combat") ? "combat" : null;
    return skillId ? state.skills[skillId].level >= Number(skillMatch[2]) : true;
  }
  const reputationMatch = lower.match(/reputation\s+(\d+)/);
  if (reputationMatch) return state.resources.reputation >= Number(reputationMatch[1]);
  const district = districts.find((entry) => lower.includes(entry.name.toLowerCase()) && lower.includes("unlocked"));
  if (district) return Boolean(state.districts[district.id]?.unlocked);
  const faction = factions.find((entry) => lower.includes(entry.name.toLowerCase()));
  const rankMatch = lower.match(/rank\s+(\d+)/);
  if (faction && rankMatch) return factionRankNumber(state.factions[faction.id].reputation) >= Number(rankMatch[1]);
  return true;
}

function MasteryProgressBar({ mastery }: { mastery: { level: number; xp: number } }) {
  const required = xpForNextMastery(mastery.level);
  return (
    <div className="mastery-progress-block">
      <div>
        <strong>Mastery {mastery.level}</strong>
        <span>{mastery.xp.toLocaleString()} / {required.toLocaleString()}</span>
      </div>
      <Progress value={(mastery.xp / required) * 100} />
    </div>
  );
}

function RewardChip({ id, amount }: { id: string; amount: number }) {
  const item = getItem(id);
  const label = item?.name ?? resourceNames[id as ResourceId] ?? id;
  return (
    <span className={`reward-chip rarity-${(item?.rarity ?? "Common").toLowerCase()}`}>
      {item ? <EquipmentTypeIconBadge item={item} /> : <b className="reward-chip-icon">{itemInitials(id)}</b>}
      <strong>{amount > 0 ? "+" : ""}{amount.toLocaleString()}</strong>
      <em>{label}</em>
    </span>
  );
}

function DropChip({ drop }: { drop: EnemyDrop }) {
  const item = getItem(drop.id);
  const label = item?.name ?? drop.name;
  return (
    <span className={`reward-chip drop-chip rarity-${(item?.rarity ?? "Common").toLowerCase()}`}>
      {item ? <EquipmentTypeIconBadge item={item} /> : <b className="reward-chip-icon">{itemInitials(drop.id)}</b>}
      <strong>{formatOneInChance(drop.chance)}</strong>
      <em>{label}{drop.quantity > 1 ? ` x${drop.quantity}` : ""}</em>
    </span>
  );
}

function modifierSummary(modifiers: Partial<ActiveModifiers>) {
  const parts: string[] = [];
  Object.entries(modifiers.skillXp ?? {}).forEach(([skill, value]) => {
    if (value) parts.push(`+${Math.round(value * 100)}% ${skillNames[skill as SkillId]} XP`);
  });
  const labels: Partial<Record<keyof ActiveModifiers, string>> = {
    skillRewards: "resources",
    combatMaxHp: "max HP",
    combatDamage: "damage",
    combatDefense: "defense",
    combatAttackSpeed: "attack speed",
    dodgeChance: "dodge",
    heatGain: "Heat gain",
    jobRewards: "job rewards",
    jobSuccessChance: "job success",
    healingReceived: "healing",
    craftingCostReduction: "crafting cost",
    creditsGained: "credits",
    reputationGained: "reputation",
  };
  Object.entries(labels).forEach(([key, label]) => {
    const value = modifiers[key as keyof ActiveModifiers];
    if (typeof value !== "number" || value === 0) return;
    const sign = value > 0 ? "+" : "";
    parts.push(`${sign}${Math.round(value * 100)}% ${label}`);
  });
  return parts.join(", ") || "unique role bonus";
}

function ActionStartStopButton({
  active,
  progress,
  locked,
  disabled,
  startLabel,
  stopLabel,
  onStart,
  onStop,
}: {
  active: boolean;
  progress: ReturnType<typeof activityProgress> | null;
  locked?: boolean;
  disabled?: boolean;
  startLabel: string;
  stopLabel: string;
  onStart: () => void;
  onStop?: () => void;
}) {
  return (
    <footer className="mission-footer">
      {active && progress && <Progress value={progress.percent} label={`${Math.round(progress.percent)}% / ${formatDuration(progress.remainingMs)} left`} />}
      <button className={active ? "mission-stop-button" : "mission-start-button"} disabled={active ? !onStop : locked || disabled} onClick={active ? onStop : onStart}>
        {active ? <Square size={22} /> : <Play size={24} />}
        {active ? stopLabel : startLabel}
      </button>
    </footer>
  );
}

function RecommendationBadges({ badges }: { badges: string[] }) {
  if (!badges.length) return null;
  return (
    <div className="recommendation-row">
      {badges.map((badge) => <span key={badge}>{badge}</span>)}
    </div>
  );
}

function actionRecommendationBadges(state: GameState, action: SkillAction, rewards: RewardBundle) {
  const badges: string[] = [];
  if (!state.manualDiscovery.skillActions[action.id]) badges.push("New");
  if (action.xpReward >= 100 || action.levelReq >= state.skills[action.skillId].level - 2) badges.push("Best XP");
  if ((rewards.credits ?? 0) >= 50) badges.push("Credits");
  if (action.requiredUnlocks?.length || action.rareDrops?.some((drop) => drop.id.includes("bp") || drop.id.includes("blueprint"))) badges.push("Unlock");
  if ((action.heatChange ?? 0) <= 0 && (action.traceChance ?? 0) <= 0.12) badges.push("Low Risk");
  if (action.rareDrops?.some((drop) => !state.discoveredItems[drop.id])) badges.push("New Drop");
  return badges.slice(0, 3);
}

function positiveRewardBundle(rewards: RewardBundle): RewardBundle {
  return Object.fromEntries(Object.entries(rewards).filter(([, amount]) => (amount ?? 0) > 0)) as RewardBundle;
}

function actionRewardCosts(rewards: RewardBundle): RewardBundle {
  return Object.fromEntries(
    Object.entries(rewards)
      .filter(([, amount]) => (amount ?? 0) < 0)
      .map(([id, amount]) => [id, Math.abs(amount ?? 0)]),
  ) as RewardBundle;
}

function actionLockHint(
  state: GameState,
  action: SkillAction,
  checks: { accessMet: boolean; districtUnlocked: boolean | undefined; unlocksMet: boolean; requiredItemsMet: boolean; affordable: boolean },
) {
  if (!checks.districtUnlocked && action.districtReq) return `Locked: unlock ${getDistrict(action.districtReq)?.name ?? action.districtReq}.`;
  if (!checks.accessMet) return `Locked: raise ${skillNames[action.skillId]} to level ${action.levelReq}.`;
  if (!checks.requiredItemsMet && action.requiredItems) return `Locked: missing ${Object.entries(action.requiredItems).map(([id, amount]) => `${amount} ${resourceNames[id as ResourceId] ?? getItem(id)?.name ?? id}`).join(", ")}.`;
  if (!checks.unlocksMet) return `Locked: needs ${action.requiredUnlocks?.join(", ") ?? "another unlock"}.`;
  if (!checks.affordable) return "Locked: not enough resources to pay the action cost.";
  return "Locked: requirements not met.";
}

function CombatDashboard({
  state,
  districtId,
  zones,
  onStartCombat,
  onStopActive,
  onUseHealingItem,
}: {
  state: GameState;
  districtId: DistrictId;
  zones: CombatZone[];
  onStartCombat: (enemyId: string) => void;
  onStopActive: () => void;
  onUseHealingItem: (itemId: string) => void;
}) {
  const enemies = zones.flatMap((zone) => zone.enemies.map((enemy) => ({ zone, enemy })));
  const activeEnemy = state.currentCombat ? enemies.find((entry) => entry.enemy.id === state.currentCombat?.enemyId) : null;
  const [selectedEnemyId, setSelectedEnemyId] = useState(activeEnemy?.enemy.id ?? enemies[0]?.enemy.id ?? "");
  const selected = activeEnemy ?? enemies.find((entry) => entry.enemy.id === selectedEnemyId) ?? enemies[0] ?? null;
  const [mobilePanel, setMobilePanel] = useState<"Enemies" | "Drops" | "Stats" | "Log">("Enemies");

  if (!selected) {
    return <FocusedPanel title="Street Combat"><p className="muted">No combat encounters are available in this district yet.</p></FocusedPanel>;
  }

  return (
    <section className="combat-dashboard">
      <CombatAreaHeader state={state} districtId={districtId} zones={zones} selectedEnemy={selected.enemy} />
      <ActiveCombatPanel
        state={state}
        zone={selected.zone}
        enemy={selected.enemy}
        onStart={() => onStartCombat(selected.enemy.id)}
        onStop={onStopActive}
        onUseHealingItem={onUseHealingItem}
      />
      <div className="combat-mobile-tabs">
        {(["Enemies", "Drops", "Stats", "Log"] as const).map((tab) => (
          <button key={tab} className={mobilePanel === tab ? "active" : ""} onClick={() => setMobilePanel(tab)}>{tab}</button>
        ))}
      </div>
      <div className="combat-dashboard-grid">
        <div className={`combat-panel combat-enemy-panel ${mobilePanel === "Enemies" ? "mobile-open" : ""}`}>
          <div className="combat-section-heading">
            <span><Target size={16} /> Enemy Selection</span>
            <b>{enemies.length}</b>
          </div>
          <EnemySelectionGrid
            state={state}
            entries={enemies}
            selectedEnemyId={selected.enemy.id}
            onSelect={setSelectedEnemyId}
            onStart={onStartCombat}
          />
        </div>
        <div className="combat-side-panels">
          <div className={`combat-panel ${mobilePanel === "Drops" ? "mobile-open" : ""}`}>
            <DropsPanel state={state} enemy={selected.enemy} />
          </div>
          <div className={`combat-panel ${mobilePanel === "Stats" ? "mobile-open" : ""}`}>
            <CombatStatsPanel state={state} enemy={selected.enemy} />
          </div>
          <div className={`combat-panel ${mobilePanel === "Stats" ? "mobile-open" : ""}`}>
            <LoadoutInteractionPanel state={state} enemy={selected.enemy} />
          </div>
          <div className={`combat-panel ${mobilePanel === "Log" ? "mobile-open" : ""}`}>
            <CombatLogPanel state={state} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CombatAreaHeader({ state, districtId, zones, selectedEnemy }: { state: GameState; districtId: DistrictId; zones: CombatZone[]; selectedEnemy: Enemy }) {
  const district = getDistrict(districtId);
  const allEnemies = zones.flatMap((zone) => zone.enemies);
  const minLevel = Math.min(...allEnemies.map((enemy) => enemy.requiredCombatLevel ?? 1));
  const maxLevel = Math.max(...allEnemies.map((enemy) => enemy.requiredCombatLevel ?? 1));
  const safety = estimateCombatSafety(state, selectedEnemy);
  const playerStats = calculatePlayerCombatStats(state);
  return (
    <article className="combat-area-header">
      <div>
        <p className="eyebrow">{district?.name ?? "District"} Combat</p>
        <h2>{zones.map((zone) => zone.name).join(" / ")}</h2>
        <p className="muted">Street Threat {minLevel}-{maxLevel} / Recommended HP {safety.recommendedHp} / Combat Lv {minLevel}</p>
      </div>
      <div className="combat-summary-strip">
        <span><b>HP</b>{Math.ceil(state.health.currentHp)}/{playerStats.maxHp}</span>
        <span><b>Damage</b>{playerStats.damage}</span>
        <span><b>Attack</b>{formatDuration(playerStats.attackSpeedMs)}</span>
        <span><b>Armor</b>{playerStats.armor}</span>
        <span className={`safety-${safety.rating.toLowerCase()}`}><b>Safety</b>{combatSafetyLabel(safety.rating)}</span>
      </div>
    </article>
  );
}

function ActiveCombatPanel({
  state,
  zone,
  enemy,
  onStart,
  onStop,
  onUseHealingItem,
}: {
  state: GameState;
  zone: CombatZone;
  enemy: Enemy;
  onStart: () => void;
  onStop: () => void;
  onUseHealingItem: (itemId: string) => void;
}) {
  const active = state.currentCombat?.enemyId === enemy.id;
  const combat = active ? state.currentCombat : null;
  const now = Date.now();
  const respawning = Boolean(combat?.respawnAt && combat.respawnAt > now);
  const playerStats = calculatePlayerCombatStats(state);
  const matchup = combatEffectivenessForEnemy(state, enemy);
  const enemyMaxHp = combat?.enemyMaxHp ?? matchup.effectiveHp;
  const enemyCurrentHp = combat?.enemyCurrentHp ?? enemyMaxHp;
  const playerAttackProgress = combat ? timerProgress(now, combat.lastPlayerAttackAt ?? combat.startedAt, combat.nextPlayerAttackAt ?? combat.startedAt + playerStats.attackSpeedMs) : null;
  const enemyAttackProgress = combat ? timerProgress(now, combat.lastEnemyAttackAt ?? combat.startedAt, combat.nextEnemyAttackAt ?? combat.startedAt + enemy.attackSpeedMs) : null;
  const fightUnlocked = canFightEnemy(state, enemy);
  const quickHealId = Object.keys(healingItems).find((id) => (state.inventory[id] ?? 0) > 0) ?? state.autoHeal.itemId ?? defaultHealingItemId;

  return (
    <article className={`active-combat-panel ${active ? "fighting" : ""}`}>
      <div className="active-combat-title">
        <div>
          <p className="eyebrow">{active ? "Active Fight" : "Selected Target"} / {zone.name}</p>
          <h2>{active ? "Engaged" : "Ready to Engage"}</h2>
        </div>
        <div className="combat-fight-timer">{respawning && combat?.respawnAt ? `Respawn ${formatDuration(combat.respawnAt - now)}` : active && combat ? `Fight ${formatDuration(now - combat.startedAt)}` : "Idle"}</div>
      </div>
      <div className="combatant-row">
        <CombatantCard
          title="Runner"
          subtitle={`${equippedWeaponClass(state) ? weaponClassName(equippedWeaponClass(state)!) : "Unarmed"} / Auto Heal ${state.autoHeal.enabled ? "On" : "Off"}`}
          hpCurrent={state.health.currentHp}
          hpMax={playerStats.maxHp}
          attackProgress={playerAttackProgress}
          damage={playerStats.damage}
          attackSpeedMs={playerStats.attackSpeedMs}
          armor={playerStats.armor}
          kind="player"
          damagePopup={combat?.lastEnemyHit}
        />
        <div className="vs-divider">VS</div>
        <CombatantCard
          title={enemy.name}
          subtitle={`${enemy.archetype ?? "Enemy"} / ${matchup.difficulty}${respawning ? " / Respawning" : ""}`}
          hpCurrent={enemyCurrentHp}
          hpMax={enemyMaxHp}
          attackProgress={enemyAttackProgress}
          damage={enemy.damage}
          attackSpeedMs={enemy.attackSpeedMs}
          armor={enemy.armor ?? enemy.armorType ?? "none"}
          kind="enemy"
          damagePopup={combat?.lastPlayerHit}
          notes={[`Weak: ${(enemy.weaknesses ?? []).map((entry) => entry.id).join(", ") || "None"}`, `Resist: ${(enemy.resistances ?? []).map((entry) => entry.id).join(", ") || "None"}`]}
        />
      </div>
      <div className="combat-utility-row">
        <AutoHealPanel state={state} quickHealId={quickHealId} onUseHealingItem={onUseHealingItem} />
        <FightControls active={active} selectedEnemy={enemy} fightUnlocked={fightUnlocked} onStart={onStart} onStop={onStop} />
      </div>
    </article>
  );
}

function CombatantCard({
  title,
  subtitle,
  hpCurrent,
  hpMax,
  attackProgress,
  damage,
  attackSpeedMs,
  armor,
  kind,
  damagePopup,
  notes = [],
}: {
  title: string;
  subtitle: string;
  hpCurrent: number;
  hpMax: number;
  attackProgress: ReturnType<typeof timerProgress> | null;
  damage: number;
  attackSpeedMs: number;
  armor: ReactNode;
  kind: "player" | "enemy";
  damagePopup?: { amount: number; at: number };
  notes?: string[];
}) {
  return (
    <div className={`combatant-card ${kind}`}>
      <div className="combatant-heading">
        <div>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
      </div>
      <HealthBar label="HP" current={hpCurrent} max={hpMax} kind={kind} damagePopup={damagePopup} />
      <AttackProgressBar progress={attackProgress} attackSpeedMs={attackSpeedMs} />
      <div className="combatant-stat-grid">
        <span><b>{damage}</b>Damage</span>
        <span><b>{formatDuration(attackSpeedMs)}</b>Attack</span>
        <span><b>{armor}</b>Armor</span>
      </div>
      {notes.length > 0 && <div className="combatant-notes">{notes.map((note) => <span key={note}>{note}</span>)}</div>}
    </div>
  );
}

function AttackProgressBar({ progress, attackSpeedMs }: { progress: ReturnType<typeof timerProgress> | null; attackSpeedMs: number }) {
  return (
    <div className="attack-progress">
      <div className="attack-progress-label">
        <span>Attack Bar</span>
        <strong>{progress ? `${formatDuration(progress.remainingMs)} next` : `${formatDuration(attackSpeedMs)} speed`}</strong>
      </div>
      <Progress value={progress?.percent ?? 0} />
    </div>
  );
}

function EnemySelectionGrid({
  state,
  entries,
  selectedEnemyId,
  onSelect,
  onStart,
}: {
  state: GameState;
  entries: Array<{ zone: CombatZone; enemy: Enemy }>;
  selectedEnemyId: string;
  onSelect: (enemyId: string) => void;
  onStart: (enemyId: string) => void;
}) {
  return (
    <div className="enemy-selection-grid">
      {entries.map(({ zone, enemy }) => (
        <EnemySelectionCard
          key={enemy.id}
          state={state}
          zone={zone}
          enemy={enemy}
          selected={selectedEnemyId === enemy.id || state.currentCombat?.enemyId === enemy.id}
          onSelect={() => onSelect(enemy.id)}
          onStart={() => onStart(enemy.id)}
        />
      ))}
    </div>
  );
}

function EnemySelectionCard({ state, zone, enemy, selected, onSelect, onStart }: { state: GameState; zone: CombatZone; enemy: Enemy; selected: boolean; onSelect: () => void; onStart: () => void }) {
  const log = state.enemyLog[enemy.id] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
  const safety = estimateCombatSafety(state, enemy);
  const matchup = combatEffectivenessForEnemy(state, enemy);
  const unlocked = canFightEnemy(state, enemy);
  const drops = combatDisplayDrops(enemy);
  const discovered = drops.filter((drop) => Boolean(log.discoveredDrops[drop.id])).length;
  return (
    <article className={`enemy-selection-card rarity-${(enemy.difficulty ?? "Common").toLowerCase()} ${selected ? "selected" : ""} ${unlocked ? "" : "locked-card"}`} onClick={onSelect}>
      <div className="enemy-selection-top">
        <div>
          <p className="eyebrow">{zone.name} / {enemy.archetype ?? "Enemy"}</p>
          <h3>{enemy.name}</h3>
        </div>
        <SafetyBadge safety={safety.rating} />
      </div>
      <div className="enemy-stat-line">
        <span>HP {matchup.effectiveHp}</span>
        <span>Damage {enemy.damage}</span>
        <span>Attack {formatDuration(enemy.attackSpeedMs)}</span>
        <span>Armor {enemy.armorType ?? enemy.armor ?? "none"}</span>
      </div>
      <div className="enemy-log-line">
        <span>Kills {log.kills}</span>
        <span>Best {log.bestKillMs ? formatDuration(log.bestKillMs) : "--"}</span>
        <span>Drops {discovered}/{drops.length}</span>
      </div>
      {!unlocked && <p className="combat-lockout">Requires Street Combat level {enemy.requiredCombatLevel ?? 1}. Current {state.skills.combat.level}.</p>}
      <button className="primary-button full" disabled={!unlocked} onClick={(event) => { event.stopPropagation(); onStart(); }}>
        {state.currentCombat?.enemyId === enemy.id ? "Fighting" : state.currentCombat ? "Switch Enemy" : "Start Fight"}
      </button>
    </article>
  );
}

function SafetyBadge({ safety }: { safety: ReturnType<typeof estimateCombatSafety>["rating"] }) {
  return <span className={`safety-badge safety-${safety.toLowerCase()}`}>{combatSafetyLabel(safety)}</span>;
}

function DropsPanel({ state, enemy }: { state: GameState; enemy: Enemy }) {
  const log = state.enemyLog[enemy.id] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
  const drops = combatDisplayDrops(enemy);
  const discovered = drops.filter((drop) => Boolean(log.discoveredDrops[drop.id])).length;
  return (
    <>
      <div className="combat-section-heading">
        <span><Gift size={16} /> Drops</span>
        <b>{discovered}/{drops.length}</b>
      </div>
      <div className="drop-row-list">
        {drops.map((drop) => {
          const reveal = dropRevealState(state, enemy.id, { itemId: drop.id, chancePercent: drop.chance, minQuantity: drop.min, maxQuantity: drop.max, rarity: drop.rarity as never, affectedByDropModifiers: true, affectedByScenarioModifiers: true }, log.kills);
          const found = Boolean(log.discoveredDrops[drop.id]);
          return <DropRow key={drop.id} drop={drop} known={Boolean(reveal.known || found)} chanceKnown={Boolean(reveal.chanceKnown || found)} foundCount={log.discoveredDrops[drop.id] ?? 0} rareHint={Boolean(reveal.rareHint)} />;
        })}
      </div>
    </>
  );
}

function DropRow({ drop, known, chanceKnown, foundCount, rareHint }: { drop: CombatDisplayDrop; known: boolean; chanceKnown: boolean; foundCount: number; rareHint: boolean }) {
  const item = getItem(drop.id);
  return (
    <div className={`combat-drop-row rarity-${(item?.rarity ?? drop.rarity).toLowerCase()}`}>
      <div className="drop-icon">{item?.type?.slice(0, 3).toUpperCase() ?? "???"}</div>
      <div>
        <strong>{known ? drop.name : rareHint ? "Unknown rare" : "???"}</strong>
        <span>{chanceKnown ? formatOneInChance(drop.chance / 100) : "Chance hidden"} / Qty {drop.min}-{drop.max}</span>
      </div>
      <b>{foundCount ? `Found x${foundCount}` : "New"}</b>
    </div>
  );
}

function CombatStatsPanel({ state, enemy }: { state: GameState; enemy: Enemy }) {
  const log = state.enemyLog[enemy.id] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
  const matchup = combatEffectivenessForEnemy(state, enemy);
  const safety = estimateCombatSafety(state, enemy);
  const active = state.currentCombat?.enemyId === enemy.id ? state.currentCombat : null;
  const currentKillMs = active ? Date.now() - active.startedAt : 0;
  return (
    <>
      <div className="combat-section-heading">
        <span><Activity size={16} /> Combat Stats</span>
      </div>
      <div className="combat-stat-panel-grid">
        <Metric label="Kills" value={log.kills} />
        <Stat label="Best" value={log.bestKillMs ? formatDuration(log.bestKillMs) : "--"} />
        <Stat label="Current" value={active ? formatDuration(currentKillMs) : "--"} />
        <Metric label="Kills / Min" value={Math.max(0.1, 60000 / matchup.expectedKillMs)} />
        <Metric label="XP / Kill" value={enemy.xpReward} />
        <Metric label="Credits / Kill" value={enemy.creditsReward} />
        <Metric label="Est. Damage" value={safety.estimatedDamage} />
        <Metric label="Rec. HP" value={safety.recommendedHp} />
        <Metric label="Effective HP" value={matchup.effectiveHp} />
      </div>
    </>
  );
}

function LoadoutInteractionPanel({ state, enemy }: { state: GameState; enemy: Enemy }) {
  const matchup = combatEffectivenessForEnemy(state, enemy);
  const weaponClass = equippedWeaponClass(state);
  const weaponLabel = weaponClass ? weaponClassName(weaponClass) : "Unarmed";
  const weaknessClasses = [...new Set((enemy.weaknesses ?? []).flatMap((weakness) => weakness.weaponClasses ?? []))];
  const resistanceClasses = [...new Set((enemy.resistances ?? []).flatMap((resistance) => resistance.weaponClasses ?? []))];
  return (
    <>
      <div className="combat-section-heading">
        <span><ShieldAlert size={16} /> Loadout Interaction</span>
        <b>{matchup.rating}</b>
      </div>
      <div className={`loadout-matchup-card ${matchup.rating.toLowerCase().replace(/\s+/g, "-")}`}>
        <strong>{matchup.rating}</strong>
        <span>Current weapon class: {weaponLabel}</span>
        <span>Enemy weakness: {weaknessClasses.length ? weaknessClasses.map(weaponClassName).join(", ") : "None listed"}</span>
        <span>Enemy resistance: {resistanceClasses.length ? resistanceClasses.map(weaponClassName).join(", ") : "None listed"}</span>
        <p className="fine">{matchup.notes.join(" / ")}</p>
      </div>
    </>
  );
}

function CombatLogPanel({ state }: { state: GameState }) {
  const combatLog = state.recentLog.filter((entry) => ["Combat", "Loot", "Warning"].includes(entry.category)).slice(0, 8);
  return (
    <details className="combat-log-panel" open>
      <summary className="details-button">Combat Log</summary>
      <div className="combat-log-list">
        {combatLog.length ? combatLog.map((entry) => (
          <p key={`${entry.timestamp}-${entry.message}`}><b>{entry.category}</b>{entry.message}</p>
        )) : <p className="muted">Combat events will appear here once fighting starts.</p>}
      </div>
    </details>
  );
}

function AutoHealPanel({ state, quickHealId, onUseHealingItem }: { state: GameState; quickHealId: string; onUseHealingItem: (itemId: string) => void }) {
  const count = state.inventory[quickHealId] ?? 0;
  return (
    <div className="auto-heal-panel">
      <div>
        <p className="eyebrow">Combat Utility</p>
        <h3>Auto Heal: {state.autoHeal.enabled ? "On" : "Off"}</h3>
      </div>
      <p className="fine">{getItem(state.autoHeal.itemId)?.name ?? state.autoHeal.itemId}: {state.inventory[state.autoHeal.itemId] ?? 0} / Threshold {state.autoHeal.threshold}%</p>
      <button className="secondary-button full" disabled={count <= 0} onClick={() => onUseHealingItem(quickHealId)}>
        Use {getItem(quickHealId)?.name ?? "Healing Item"} ({count})
      </button>
    </div>
  );
}

function FightControls({ active, selectedEnemy, fightUnlocked, onStart, onStop }: { active: boolean; selectedEnemy: Enemy; fightUnlocked: boolean; onStart: () => void; onStop: () => void }) {
  return (
    <div className="fight-controls">
      {active ? (
        <button className="secondary-button danger-button full" onClick={onStop}>Stop Fight</button>
      ) : (
        <button className="primary-button full" disabled={!fightUnlocked} onClick={onStart}>Start {selectedEnemy.name}</button>
      )}
      <div className="combat-control-hints">
        <span>Auto Repeat: Idle loop</span>
        <span>Sim Cache: Manual kills first</span>
      </div>
    </div>
  );
}

function combatSafetyLabel(rating: ReturnType<typeof estimateCombatSafety>["rating"]) {
  return rating === "Deadly" ? "Lethal" : rating;
}

function weaponClassName(id: WeaponClassId) {
  return weaponClasses.find((entry) => entry.id === id)?.name ?? titleCase(id);
}

function EnemyCard({
  state,
  zone,
  enemy,
  onStart,
  onStop,
  onUseHealingItem,
}: {
  state: GameState;
  zone: CombatZone;
  enemy: Enemy;
  onStart: () => void;
  onStop?: () => void;
  onUseHealingItem?: (itemId: string) => void;
}) {
  const log = state.enemyLog[enemy.id] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
  const active = state.currentCombat?.enemyId === enemy.id;
  const combat = active ? state.currentCombat : null;
  const matchup = combatEffectivenessForEnemy(state, enemy);
  const playerStats = calculatePlayerCombatStats(state);
  const maxHp = calculateMaxHP(state);
  const quickHealId = Object.keys(healingItems).find((id) => (state.inventory[id] ?? 0) > 0) ?? state.autoHeal.itemId ?? defaultHealingItemId;
  const renderNow = Date.now();
  const enemyMaxHp = combat?.enemyMaxHp ?? matchup.effectiveHp;
  const enemyCurrentHp = combat?.enemyCurrentHp ?? enemyMaxHp;
  const playerAttackProgress = combat
    ? timerProgress(renderNow, combat.lastPlayerAttackAt ?? combat.startedAt, combat.nextPlayerAttackAt ?? combat.startedAt + playerStats.attackSpeedMs)
    : null;
  const enemyAttackProgress = combat
    ? timerProgress(renderNow, combat.lastEnemyAttackAt ?? combat.startedAt, combat.nextEnemyAttackAt ?? combat.startedAt + enemy.attackSpeedMs)
    : null;
  const fightUnlocked = canFightEnemy(state, enemy);
  const combatLevelLocked = state.skills.combat.level < (enemy.requiredCombatLevel ?? 1);
  const highThreatLocked = !combatLevelLocked && enemy.behaviorTags?.includes("highThreat") && !fightUnlocked;
  const displayDrops = combatDisplayDrops(enemy);
  return (
    <article className={`action-card vertical ${active ? "active-card" : ""} ${fightUnlocked ? "" : "locked-card"}`}>
      <div>
        <p className="eyebrow">{zone.name} / {enemy.archetype ?? "enemy"} / {matchup.difficulty}</p>
        <h3>{enemy.name}</h3>
        <p className="muted">{enemy.description}</p>
        <p className="fine">{matchup.rating} / Kill {formatDuration(matchup.expectedKillMs)} / Effective HP {matchup.effectiveHp}</p>
        <p className="fine">HP {enemy.hp} / Damage {enemy.damage} / Attack {formatDuration(enemy.attackSpeedMs)} / Armor {enemy.armorType ?? "none"}</p>
        <p className="fine">Rewards +{enemy.creditsReward} Credits, +{enemy.xpReward} XP, +{enemy.reputationReward} Rep</p>
        <p className="fine">Kills {log.kills} / Best {log.bestKillMs ? formatDuration(log.bestKillMs) : "--"}</p>
        <p className="fine">Weak: {(enemy.weaknesses ?? []).map((entry) => entry.id).join(", ") || "None"} / Resist: {(enemy.resistances ?? []).map((entry) => entry.id).join(", ") || "None"}</p>
        <p className="fine">{matchup.notes.join(" / ")}</p>
        {!fightUnlocked && (
          <p className="combat-lockout">
            {combatLevelLocked
              ? `Requires Street Combat level ${enemy.requiredCombatLevel ?? 1}. Current ${state.skills.combat.level}.`
              : highThreatLocked
                ? "Requires District Mastery 15 or Threat 35."
                : "Combat requirements not met."}
          </p>
        )}
        <TagList tags={[...(enemy.traits ?? []), ...(enemy.behaviorTags ?? [])].slice(0, 10)} />
      </div>
      {active && (
        <div className="combat-health-panel">
          <HealthBar label="Runner HP" current={state.health.currentHp} max={maxHp} kind="player" damagePopup={combat?.lastEnemyHit} />
          <HealthBar label={`${enemy.name} HP`} current={enemyCurrentHp} max={enemyMaxHp} kind="enemy" damagePopup={combat?.lastPlayerHit} />
          <div className="combat-timers">
            {playerAttackProgress && <Progress value={playerAttackProgress.percent} label={`Runner attack / ${formatDuration(playerAttackProgress.remainingMs)}`} />}
            {enemyAttackProgress && <Progress value={enemyAttackProgress.percent} label={`${enemy.name} attack / ${formatDuration(enemyAttackProgress.remainingMs)}`} />}
          </div>
          <p className="fine">Last damage {state.health.lastDamageTaken || 0} / Last heal {state.health.lastHealingReceived || 0}</p>
          <p className="fine">Auto Heal {state.autoHeal.enabled ? `${state.autoHeal.threshold}% using ${getItem(state.autoHeal.itemId)?.name ?? state.autoHeal.itemId}` : "Off"}</p>
          <button className="secondary-button full" disabled={!onUseHealingItem || (state.inventory[quickHealId] ?? 0) <= 0} onClick={() => onUseHealingItem?.(quickHealId)}>
            Use {getItem(quickHealId)?.name ?? "Healing Item"} ({state.inventory[quickHealId] ?? 0})
          </button>
        </div>
      )}
      <div className="enemy-list">
        {displayDrops.map((drop) => {
          const reveal = dropRevealState(state, enemy.id, { itemId: drop.id, chancePercent: drop.chance, minQuantity: drop.min, maxQuantity: drop.max, rarity: drop.rarity as never, affectedByDropModifiers: true, affectedByScenarioModifiers: true }, log.kills);
          const found = Boolean(log.discoveredDrops[drop.id]);
          const rarity = (getItem(drop.id)?.rarity ?? drop.rarity).toLowerCase();
          return (
            <div className={`enemy-card rarity-${rarity}`} key={drop.id}>
              <strong>{reveal.known || found ? drop.name : reveal.rareHint ? "Unknown rare" : "???"}</strong>
              <span>{reveal.chanceKnown || found ? formatOneInChance(drop.chance / 100) : "Chance hidden"}</span>
              <span>{log.discoveredDrops[drop.id] ? `Found x${log.discoveredDrops[drop.id]}` : `Qty ${drop.min}-${drop.max}`}</span>
            </div>
          );
        })}
      </div>
      <CardActionFooter
        active={active}
        progress={playerAttackProgress}
        disabled={!fightUnlocked}
        startLabel="Fight"
        stopLabel="Stop Fight"
        onStart={onStart}
        onStop={onStop}
      />
    </article>
  );
}

type CombatDisplayDrop = { id: string; name: string; chance: number; min: number; max: number; rarity: string };

function combatDisplayDrops(enemy: Enemy): CombatDisplayDrop[] {
  const merged = new Map<string, CombatDisplayDrop>();
  const addDrop = (drop: CombatDisplayDrop) => {
    const existing = merged.get(drop.id);
    if (!existing) {
      merged.set(drop.id, drop);
      return;
    }
    merged.set(drop.id, {
      ...existing,
      name: existing.name !== drop.id ? existing.name : drop.name,
      chance: Math.max(existing.chance, drop.chance),
      min: Math.min(existing.min, drop.min),
      max: Math.max(existing.max, drop.max),
      rarity: rarityRank(drop.rarity) > rarityRank(existing.rarity) ? drop.rarity : existing.rarity,
    });
  };
  enemy.drops.forEach((drop) => addDrop({ id: drop.id, name: drop.name, chance: drop.chance * 100, min: drop.quantity, max: drop.quantity, rarity: getItem(drop.id)?.rarity ?? "Common" }));
  (percentDropTables[enemy.id] ?? []).forEach((drop) => addDrop({ id: drop.itemId, name: getItem(drop.itemId)?.name ?? drop.itemId, chance: drop.chancePercent, min: drop.minQuantity, max: drop.maxQuantity, rarity: drop.rarity }));
  return [...merged.values()].sort((left, right) => rarityRank(right.rarity) - rarityRank(left.rarity) || right.chance - left.chance || left.name.localeCompare(right.name));
}

function rarityRank(rarity: string) {
  return inventoryRarityRanks[rarity] ?? 0;
}

type InventoryFilter = "Quickhacks" | "All" | "Resources" | "Components" | "Cyberware" | "Weapons" | "Attachments" | "Mods" | "Armor" | "Consumables" | "Blueprints";
type InventorySortMode = "rarity" | "quantity" | "price";
type InventorySortDirection = "asc" | "desc";
type CraftingSortMode = "rarity" | "level" | "duration" | "name";
type CraftingFilter = "All" | CraftingRecipe["category"];

const inventorySortModes: InventorySortMode[] = ["rarity", "quantity", "price"];
const craftingSortModes: CraftingSortMode[] = ["rarity", "level", "duration", "name"];
const craftingFilters: CraftingFilter[] = ["All", "Components", "Upgrade Parts", "Weapons", "Armor", "Cyberware", "Attachments", "Weapon Mods", "Consumables"];
const inventoryRarityRanks: Record<string, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
  Relic: 5,
  Prototype: 6,
  Iconic: 6,
};

function InventoryTab({
  state,
  onEquip,
  onUnequipGear,
  onUnequipCyberware,
  onUse,
  onSell,
  onSellAllButOne,
  onUpgrade,
  onInstallAttachment,
  onRemoveAttachment,
  onInstallWeaponMod,
  onRemoveWeaponMod,
  notices,
  onReviewNotice,
  onReviewAllNotices,
}: {
  state: GameState;
  onEquip: (id: string) => void;
  onUnequipGear: (slot: GearSlot) => void;
  onUnequipCyberware: (slot: CyberwareSlot) => void;
  onUse: (id: string) => void;
  onSell: (id: string) => void;
  onSellAllButOne: (id: string) => void;
  onUpgrade: (id: string) => void;
  onInstallAttachment: (weaponId: string, attachmentId: string) => void;
  onRemoveAttachment: (weaponId: string, category: AttachmentCategory) => void;
  onInstallWeaponMod: (weaponId: string, modId: string) => void;
  onRemoveWeaponMod: (weaponId: string, modId: string) => void;
  notices: TabNotice[];
  onReviewNotice: (key: string) => void;
  onReviewAllNotices: () => void;
}) {
  const [query, setQuery] = useState("");
  const [gearSlot, setGearSlot] = useState<GearSlot | null>(null);
  const [filter, setFilter] = useState<InventoryFilter>("All");
  const [sortMode, setSortMode] = useState<InventorySortMode>("rarity");
  const [sortDirection, setSortDirection] = useState<InventorySortDirection>("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inventoryIds = new Set(Object.entries(state.inventory).filter(([, count]) => count > 0).map(([id]) => id));
  Object.values(state.equippedGear).forEach((id) => {
    if (id) inventoryIds.add(id);
  });
  Object.values(state.equippedCyberware).forEach((id) => {
    if (id) inventoryIds.add(id);
  });
  const drops = [...inventoryIds].map((id) => [id, Math.max(state.inventory[id] ?? 0, equippedItemLabel(state, id) ? 1 : 0)] as [string, number]);
  const filtered = drops.filter(([id]) => {
    const item = getItem(id);
    if (query.trim() && !(item?.name ?? itemNames[id] ?? id).toLowerCase().includes(query.trim().toLowerCase())) return false;
    if (gearSlot && (!(item?.type === "Weapon" || item?.type === "Armor") || item.slot !== gearSlot)) return false;
    if (filter === "All") return true;
    if (filter === "Resources") return item?.type === "Resource" && !["credits", "reputation", "heat"].includes(id);
    if (filter === "Components") return item?.type === "Material" || item?.type === "Component";
    if (filter === "Weapons") return item?.type === "Weapon";
    if (filter === "Attachments") return item?.type === "WeaponAttachment";
    if (filter === "Mods") return item?.type === "WeaponMod";
    if (filter === "Cyberware") return item?.type === "Cyberware";
    if (filter === "Armor") return item?.type === "Armor";
    if (filter === "Consumables") return item?.type === "Consumable";
    if (filter === "Quickhacks") return item?.type === "Quickhack";
    if (filter === "Blueprints") return item?.type === "Blueprint";
    return false;
  });
  const sorted = [...filtered].sort(([leftId, leftCount], [rightId, rightCount]) => {
    const leftItem = getItem(leftId);
    const rightItem = getItem(rightId);
    const leftValue = sortMode === "rarity"
      ? inventoryRarityRanks[leftItem?.rarity ?? "Common"] ?? 0
      : sortMode === "quantity"
        ? leftCount
        : leftItem?.sellValue ?? 0;
    const rightValue = sortMode === "rarity"
      ? inventoryRarityRanks[rightItem?.rarity ?? "Common"] ?? 0
      : sortMode === "quantity"
        ? rightCount
        : rightItem?.sellValue ?? 0;
    const direction = sortDirection === "asc" ? 1 : -1;
    const sortedValue = (leftValue - rightValue) * direction;
    if (sortedValue !== 0) return sortedValue;
    return (leftItem?.name ?? itemNames[leftId] ?? leftId).localeCompare(rightItem?.name ?? itemNames[rightId] ?? rightId);
  });
  const activeId = selectedId && sorted.some(([id]) => id === selectedId) ? selectedId : sorted[0]?.[0] ?? null;
  const selectedItem = activeId ? getItem(activeId) : null;
  const selectedCount = activeId ? state.inventory[activeId] ?? 0 : 0;
  const selectedUpgradeCost = activeId && selectedItem?.maxUpgradeLevel ? itemUpgradeCost(state, activeId) : {};
  const selectedCanUpgrade = activeId ? canAffordItemUpgrade(state, activeId) : false;
  const selectedQuickSellValue = activeId ? inventoryQuickSellValue(state, activeId) : 0;
  const selectedCanSell = activeId ? canQuickSellInventoryItem(state, activeId) : false;
  const selectedBulkSellCount = activeId ? inventorySellAllButOneCount(state, activeId) : 0;
  const selectedUpgradeLevel = activeId ? state.upgradeLevels[activeId] ?? 0 : 0;
  const selectedMaxUpgrade = Boolean(selectedItem?.maxUpgradeLevel && selectedUpgradeLevel >= selectedItem.maxUpgradeLevel);
  const selectedEquippedGearSlot = activeId ? gearSlots.find((slot) => state.equippedGear[slot.id] === activeId)?.id : undefined;
  const selectedEquippedCyberwareSlot = activeId ? cyberwareSlots.find((slot) => state.equippedCyberware[slot.id] === activeId)?.id : undefined;
  const selectedIsEquipped = Boolean(selectedEquippedGearSlot || selectedEquippedCyberwareSlot);
  const selectedComparisonItemId = selectedItem && (selectedItem.type === "Weapon" || selectedItem.type === "Armor")
    ? state.equippedGear[selectedItem.slot as GearSlot]
    : selectedItem?.type === "Cyberware"
      ? state.equippedCyberware[selectedItem.slot as CyberwareSlot]
      : undefined;
  return (
    <section className="stack gear-workspace">
      <article className="panel runner-equipment">
        <div className="panel-heading"><div><p className="eyebrow">CURRENT LOADOUT</p><h2>Equipped gear</h2><p className="muted">Choose a slot to inspect it and compare replacements from your stash.</p></div><Shield size={22} /></div>
        <div className="slot-grid">{gearSlots.map(slot => {
          const id = state.equippedGear[slot.id];
          const item = id ? getItem(id) : undefined;
          return <button key={slot.id} className={"slot-card " + (gearSlot === slot.id ? "active" : "")} aria-pressed={gearSlot === slot.id} onClick={() => { setGearSlot(slot.id); setFilter("All"); setQuery(""); setSelectedId(id ?? null); }}>
            <EquipmentTypeIconBadge item={item} fallbackSlot={slot.id} fallbackKind="gear" /><span>{slot.label}</span><strong>{item?.name ?? "Empty slot"}{id && state.upgradeLevels[id] ? " +" + state.upgradeLevels[id] : ""}</strong><small>{item ? "Inspect / replace" : "Find equipment"}</small>
          </button>;
        })}</div>
      </article>
      <TabNoticePanel
        title="Inventory Updates"
        notices={notices}
        onReviewNotice={(key) => {
          const itemId = key.replace(/^inventory:/, "");
          if (getItem(itemId)) { setSelectedId(itemId); setFilter("All"); setGearSlot(null); setQuery(""); }
          onReviewNotice(key);
        }}
        onReviewAll={onReviewAllNotices}
      />
      <div className="runner-stash-layout">
      <article className="panel runner-stash">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">STASH / {sorted.length} ITEMS</p>
            <h2>Inventory</h2>
          </div>
          <Backpack size={22} />
        </div>
        <details className="network-disclosure runner-wallet"><summary>Resources &amp; currencies</summary><ResourceWallet state={state} /></details>
        <label className="runner-search">Search inventory<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by item name" /></label>
        {gearSlot && <div className="runner-slot-filter"><span>Slot: {gearSlots.find(slot => slot.id === gearSlot)?.label}</span><button className="rpg-text-button" onClick={() => setGearSlot(null)}>Show all slots</button></div>}
        <div className="inventory-sort-row">
          <button
            className="inventory-sort-cycle"
            onClick={() => setSortMode((current) => inventorySortModes[(inventorySortModes.indexOf(current) + 1) % inventorySortModes.length])}
          >
            Sort: {titleCase(sortMode)}
          </button>
          <button
            className="inventory-sort-direction"
            aria-label={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
            title={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
            onClick={() => setSortDirection((current) => current === "asc" ? "desc" : "asc")}
          >
            {sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </button>
        </div>
        <div className="inventory-filter-row">
          {(["All", "Resources", "Components", "Cyberware", "Weapons", "Attachments", "Mods", "Armor", "Consumables", "Blueprints", "Quickhacks"] as InventoryFilter[]).map((entry) => (
            <button key={entry} className={filter === entry ? "active" : ""} aria-pressed={filter === entry && !gearSlot} onClick={() => { setFilter(entry); setGearSlot(null); }}>
              {entry}
            </button>
          ))}
        </div>
        <div className="item-slot-grid">
          {sorted.length ? sorted.map(([id, count]) => {
            const item = getItem(id);
            const active = activeId === id;
            const equippedLabel = equippedItemLabel(state, id);
            return (
              <button key={id} className={`inventory-slot ${active ? "active" : ""} ${item ? `rarity-${item.rarity.toLowerCase()}` : ""}`} onClick={() => setSelectedId(id)}>
                {item ? <EquipmentTypeIconBadge item={item} /> : <span className="slot-fallback">{itemInitials(id)}</span>}
                {equippedLabel && <span className="equipped-marker">{equippedLabel}</span>}
                <strong>{item?.name ?? itemNames[id] ?? id}</strong>
                <span>Qty {count}</span>
              </button>
            );
          }) : <p className="muted">No matching items. Try another category or clear your search.</p>}
        </div>
      </article>
      <article className="panel runner-item-inspector" aria-label="Selected item">
        {activeId && selectedItem ? (
          <div className={`inventory-detail rarity-${selectedItem.rarity.toLowerCase()}`}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{selectedItem.rarity} / {selectedItem.type} / Qty {selectedCount}</p>
                <h2>{selectedItem.name} {state.upgradeLevels[activeId] ? `+${state.upgradeLevels[activeId]}` : ""}</h2>
              </div>
              <EquipmentTypeIconBadge item={selectedItem} />
            </div>
            <p className="muted">{selectedItem.description}</p>
            {selectedItem.slot && <p className="fine">Equip requirement: {itemAttributeRequirement(selectedItem).label}</p>}
            <p className="fine">Used for: {itemUseSummary(selectedItem.id)}</p>
            <p className="fine">Source: {selectedItem.sourceHint}</p>
            <p className="fine">Market value: {selectedItem.sellValue} / Quick sell: {selectedQuickSellValue.toLocaleString()} Credits</p>
            {selectedItem.stats && <StatComparisonLine state={state} itemId={activeId} compareItemId={selectedComparisonItemId} />}
            {selectedItem.modifiers && <p className="fine">Modifiers: {formatItemModifiers(selectedItem.modifiers)}</p>}
            {selectedItem.maxUpgradeLevel && (
              <div className="upgrade-cost-box">
                <p className="fine">Upgrade requirement: Technical {upgradeTechnicalRequirement(state, selectedUpgradeLevel + 1)} / Yours: {state.rpg.attributes.technical}</p>
                <p className="fine">
                  {selectedMaxUpgrade
                    ? `Upgrade: Max level +${selectedItem.maxUpgradeLevel}`
                    : `Upgrade +${selectedUpgradeLevel + 1}/${selectedItem.maxUpgradeLevel}: ${formatItemCost(selectedUpgradeCost)}`}
                </p>
                {!selectedMaxUpgrade && Object.entries(selectedUpgradeCost).map(([id, amount]) => {
                  const required = id === activeId ? amount + 1 : amount;
                  const owned = getOwnedCount(state, id);
                  const hasRequired = owned >= required;
                  return (
                    <span key={id} className={`requirement-row upgrade-requirement-row ${hasRequired ? "met" : "missing"} rarity-${(getItem(id)?.rarity ?? "Common").toLowerCase()}`}>
                      {getItem(id)?.name ?? resourceNames[id as ResourceId] ?? id}
                      <strong>{owned.toLocaleString()} / {required.toLocaleString()}{id === activeId ? " total" : ""}</strong>
                    </span>
                  );
                })}
              </div>
            )}
            {selectedItem.type === "Weapon" && <WeaponDetail state={state} weaponId={activeId} onInstallAttachment={onInstallAttachment} onRemoveAttachment={onRemoveAttachment} onInstallWeaponMod={onInstallWeaponMod} onRemoveWeaponMod={onRemoveWeaponMod} />}
            {selectedItem.type === "WeaponAttachment" && <p className="fine">Attachment: {titleCase(selectedItem.attachmentCategory ?? "")} / Compatible {selectedItem.compatibleWeaponClasses?.join(", ")}</p>}
            {selectedItem.type === "WeaponMod" && <p className="fine">Mod: {selectedItem.specialEffect} / Compatible {selectedItem.compatibleWeaponClasses?.join(", ")}</p>}
            {selectedItem.type === "Cyberware" ? <p className="fine">Equipped Instability {formatSigned(cyberwareInstabilityLoad(selectedItem))}</p> : null}
            <div className="inventory-actions">
              {(selectedItem.type === "Weapon" || selectedItem.type === "Armor" || selectedItem.type === "Cyberware") && (
                <button
                  className="primary-button full"
                  disabled={Boolean(state.rpg.active && selectedItem.slot === "operatingSystem") || (!selectedIsEquipped && !meetsItemAttributeRequirement(state, selectedItem))}
                  title={selectedIsEquipped ? "Unequip item" : `Requires ${itemAttributeRequirement(selectedItem).label}`}
                  onClick={() => {
                    if (selectedEquippedGearSlot) {
                      onUnequipGear(selectedEquippedGearSlot);
                      return;
                    }
                    if (selectedEquippedCyberwareSlot) {
                      onUnequipCyberware(selectedEquippedCyberwareSlot);
                      return;
                    }
                    onEquip(activeId);
                  }}
                >
                  {selectedIsEquipped ? `Unequip ${selectedItem.name}` : "Equip"}
                </button>
              )}
              {selectedItem.useEffect && <button className="secondary-button full" onClick={() => onUse(activeId)}>Use</button>}
              <button className="secondary-button full" disabled={!selectedCanSell} onClick={() => onSell(activeId)}>
                Sell 1 for {selectedQuickSellValue.toLocaleString()} Credits
              </button>
              <button className="secondary-button full" disabled={!selectedCanSell || selectedBulkSellCount === 0} onClick={() => onSellAllButOne(activeId)}>
                Sell all but 1 for {(selectedQuickSellValue * selectedBulkSellCount).toLocaleString()} Credits
              </button>
              {selectedItem.maxUpgradeLevel && <button className="secondary-button full" disabled={!selectedCanUpgrade} onClick={() => onUpgrade(activeId)}>{selectedMaxUpgrade ? "Max Upgrade" : "Upgrade"}</button>}
            </div>
          </div>
        ) : (
          <p className="muted">Select an item slot to inspect its stats and options.</p>
        )}
      </article>
      </div>
    </section>
  );
}

function ResourceWallet({ state }: { state: GameState }) {
  const visibleResources = resourceOrder.filter((id) => !["credits", "reputation", "heat"].includes(id));
  return (
    <div className="resource-wallet">
      <div>
        <p className="eyebrow">Materials Wallet</p>
        <p className="fine">Bulk resources used for crafting, services, upgrades, and district progression.</p>
      </div>
      <div className="resource-wallet-grid">
        {visibleResources.map((id) => {
          const item = getItem(id);
          return (
            <div key={id} className={`resource-wallet-card rarity-${(item?.rarity ?? "Common").toLowerCase()}`}>
              <div className="resource-wallet-card-heading">
                {item ? <EquipmentTypeIconBadge item={item} /> : <b className="reward-chip-icon">{itemInitials(id)}</b>}
                <span>{item?.name ?? resourceNames[id]}</span>
              </div>
              <strong>{state.resources[id].toLocaleString()}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const statComparisonOrder: Array<keyof ItemStats> = ["damage", "armor", "maxHp", "attackSpeed", "accuracy", "dodge", "critChance", "critDamage", "armorPenetration", "heatModifier", "neuralInstabilityModifier"];

function StatComparisonLine({ state, itemId, compareItemId }: { state: GameState; itemId: string; compareItemId?: string }) {
  const stats = scaledStats(state, itemId);
  const compareStats = compareItemId ? scaledStats(state, compareItemId) : {};
  const keys = statComparisonOrder.filter((key) => stats[key]);
  if (!keys.length) return <p className="fine">Stats: None</p>;
  return (
    <p className="fine stat-comparison-line">
      <span>Stats: </span>
      {keys.map((key, index) => {
        const value = Number(stats[key] ?? 0);
        const compareValue = Number(compareStats[key] ?? 0);
        const delta = value - compareValue;
        const trend = statComparisonTrend(key, delta);
        return (
          <span className="stat-comparison-entry" key={key}>
            {index > 0 ? ", " : ""}
            {titleCase(key)} {formatStatValue(key, value)}{" "}
            <b className={trend}>({formatDeltaValue(key, delta)})</b>
          </span>
        );
      })}
    </p>
  );
}

function formatStatValue(key: keyof ItemStats, value: number) {
  const sign = value > 0 ? "+" : "";
  if (statIsPercentLike(key)) return `${sign}${Math.round(value * 100)}%`;
  return `${sign}${Number.isInteger(value) ? value : Number(value.toFixed(2))}`;
}

function formatDeltaValue(key: keyof ItemStats, value: number) {
  if (value === 0) return "0";
  const formatted = statIsPercentLike(key) ? `${Math.round(Math.abs(value) * 100)}%` : `${Number.isInteger(value) ? Math.abs(value) : Number(Math.abs(value).toFixed(2))}`;
  return `${value > 0 ? "+" : "-"}${formatted}`;
}

function statIsPercentLike(key: keyof ItemStats) {
  return ["dodge", "critChance", "critDamage", "heatModifier", "neuralInstabilityModifier"].includes(key);
}

function statComparisonTrend(key: keyof ItemStats, delta: number) {
  if (delta === 0) return "same";
  const lowerIsBetter: Array<keyof ItemStats> = ["attackSpeed", "heatModifier", "neuralInstabilityModifier"];
  const beneficial = lowerIsBetter.includes(key) ? delta < 0 : delta > 0;
  return beneficial ? "better" : "worse";
}

function itemInitials(id: string) {
  return id.split(/[-_\s]/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

function equippedItemLabel(state: GameState, itemId: string) {
  const gearSlot = gearSlots.find((slot) => state.equippedGear[slot.id] === itemId);
  if (gearSlot) return "Equipped";
  const cyberwareSlot = cyberwareSlots.find((slot) => state.equippedCyberware[slot.id] === itemId);
  if (cyberwareSlot) return "Equipped";
  return null;
}

function equippedComparisonItemId(state: GameState, item: ItemDefinition) {
  if (!item.slot) return undefined;
  if (item.type === "Cyberware") return state.equippedCyberware[item.slot as CyberwareSlot] ?? undefined;
  if (item.type === "Weapon" || item.type === "Armor") return state.equippedGear[item.slot as GearSlot] ?? undefined;
  return undefined;
}

function itemUseSummary(itemId: string) {
  const item = getItem(itemId);
  const recipeUses = recipes.filter((recipe) => recipe.inputCosts[itemId] || recipe.requiredBlueprint === itemId).map((recipe) => recipe.name);
  const baseUses = [
    item?.type === "Weapon" ? "equippable weapon" : null,
    item?.type === "Armor" ? "equippable armor" : null,
    item?.type === "Cyberware" ? `installable ${titleCase(String(item.slot ?? "cyberware"))} cyberware` : null,
    item?.type === "WeaponAttachment" ? "weapon attachment" : null,
    item?.type === "WeaponMod" ? "weapon mod" : null,
    item?.useEffect ? "consumable use" : null,
    item?.type === "Blueprint" ? "recipe unlock" : null,
    item?.type === "Material" || item?.type === "Component" ? "crafting material" : null,
  ].filter(Boolean) as string[];
  const uses = [...baseUses, ...recipeUses.slice(0, 3).map((name) => `craft ${name}`)];
  return uses.length ? uses.join(", ") : "collection, sale, or future unlocks";
}

function CraftingPanel({ state, onCraft, onStopCraft }: { state: GameState; onCraft: (id: string) => void; onStopCraft: () => void }) {
  const [sourceItem, setSourceItem] = useState<{ itemId: string; usedAmount: number } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [filter, setFilter] = useState<CraftingFilter>("All");
  const [sortMode, setSortMode] = useState<CraftingSortMode>("level");
  const [sortDirection, setSortDirection] = useState<InventorySortDirection>("asc");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const filteredRecipes = recipes.filter((recipe) => filter === "All" || recipe.category === filter);
  const sortedRecipes = [...filteredRecipes].sort((left, right) => {
    const leftItem = getItem(left.outputItemId);
    const rightItem = getItem(right.outputItemId);
    let value = 0;
    if (sortMode === "rarity") value = (inventoryRarityRanks[leftItem?.rarity ?? "Common"] ?? 0) - (inventoryRarityRanks[rightItem?.rarity ?? "Common"] ?? 0);
    if (sortMode === "level") value = left.requiredLevel - right.requiredLevel;
    if (sortMode === "duration") value = left.durationMs - right.durationMs;
    if (sortMode === "name") value = left.name.localeCompare(right.name);
    if (!value) value = left.requiredLevel - right.requiredLevel || left.name.localeCompare(right.name);
    return sortDirection === "asc" ? value : -value;
  });
  const selectedRecipe = (selectedRecipeId ? sortedRecipes.find((recipe) => recipe.id === selectedRecipeId) : null) ?? sortedRecipes[0] ?? null;
  const selectedOutput = selectedRecipe ? getItem(selectedRecipe.outputItemId) : null;
  const selectedCosts = selectedRecipe ? scaledCraftingCosts(state, selectedRecipe) : {};
  const selectedMissingEntries = Object.entries(selectedCosts).filter(([id, amount]) => getOwnedCount(state, id) < amount);
  const selectedLevelLocked = selectedRecipe ? state.skills[selectedRecipe.requiredSkill].level < selectedRecipe.requiredLevel : false;
  const selectedBlueprintLocked = Boolean(selectedRecipe?.requiredBlueprint && !state.unlockedBlueprints[selectedRecipe.requiredBlueprint]);
  const selectedDistrictLocked = Boolean(selectedRecipe?.requiredDistrict && !state.districts[selectedRecipe.requiredDistrict]?.unlocked);
  const selectedLocked = selectedLevelLocked || selectedBlueprintLocked || selectedDistrictLocked;
  const selectedMissing = selectedMissingEntries.length > 0;
  const selectedActive = selectedRecipe ? state.activeCraft?.recipeId === selectedRecipe.id : false;
  const selectedProgress = selectedActive && state.activeCraft ? activityProgress(state.activeCraft.startedAt, state.activeCraft.durationMs) : null;
  const selectedComparisonItemId = selectedOutput ? equippedComparisonItemId(state, selectedOutput) : undefined;
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Repeats while materials are available</p>
          <h2>Crafting</h2>
        </div>
        <div className="panel-actions">
          <InfoButton open={helpOpen} onToggle={() => setHelpOpen((value) => !value)} label="Crafting help" />
          <BrainCircuit size={22} />
        </div>
      </div>
      {helpOpen && (
        <ScreenHelpPanel
          title="Crafting"
          lines={[
            "Crafting repeats while materials are available.",
            "Starting a new activity automatically stops the previous one.",
            "Required materials can be tapped to see where to get them.",
            "Blueprints unlock higher-tier recipes.",
            "Rare items come from mission rewards, local-gig rotations, crafting, or shops.",
          ]}
          onClose={() => setHelpOpen(false)}
        />
      )}
      {sourceItem && <ItemSourcePopover state={state} itemId={sourceItem.itemId} usedAmount={sourceItem.usedAmount} onClose={() => setSourceItem(null)} />}
      <div className="inventory-sort-row crafting-sort-row">
        <button
          className="inventory-sort-cycle"
          onClick={() => setSortMode((current) => craftingSortModes[(craftingSortModes.indexOf(current) + 1) % craftingSortModes.length])}
        >
          Sort: {titleCase(sortMode)}
        </button>
        <button
          className="inventory-sort-direction"
          aria-label={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
          title={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
          onClick={() => setSortDirection((current) => current === "asc" ? "desc" : "asc")}
        >
          {sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        </button>
      </div>
      <div className="inventory-filter-row crafting-filter-row">
        {craftingFilters.map((entry) => (
          <button key={entry} className={filter === entry ? "active" : ""} onClick={() => setFilter(entry)}>
            {entry}
          </button>
        ))}
      </div>
      <div className="crafting-workbench-layout">
        <div className="crafting-recipe-list">
          {sortedRecipes.map((recipe) => {
            const output = getItem(recipe.outputItemId);
            const levelLocked = state.skills[recipe.requiredSkill].level < recipe.requiredLevel;
            const blueprintLocked = Boolean(recipe.requiredBlueprint && !state.unlockedBlueprints[recipe.requiredBlueprint]);
            const districtLocked = Boolean(recipe.requiredDistrict && !state.districts[recipe.requiredDistrict]?.unlocked);
            const locked = levelLocked || blueprintLocked || districtLocked;
            const costs = scaledCraftingCosts(state, recipe);
            const missing = Object.entries(costs).some(([id, amount]) => getOwnedCount(state, id) < amount);
            const active = state.activeCraft?.recipeId === recipe.id;
            const craftable = !locked && !missing;
            const selected = selectedRecipe?.id === recipe.id;
            return (
              <button
                type="button"
                className={`crafting-recipe-tile rarity-${(output?.rarity ?? "Common").toLowerCase()} ${selected ? "active" : ""} ${active ? "running" : ""} ${craftable ? "craftable-card" : ""} ${locked ? "locked-card" : ""} ${missing ? "missing-card" : ""}`}
                key={recipe.id}
                onClick={() => setSelectedRecipeId(recipe.id)}
              >
                {output ? <EquipmentTypeIconBadge item={output} /> : <span className="slot-fallback">{itemInitials(recipe.outputItemId)}</span>}
                <span className="eyebrow">{output?.rarity ?? "Common"} / {recipe.category} / {formatDuration(adjustedDurationMs(state, recipe.durationMs, recipe.tags))}</span>
                <strong>{recipe.name}</strong>
                <em>{skillNames[recipe.requiredSkill]} {recipe.requiredLevel} / {missing ? "Missing" : locked ? "Locked" : active ? "Running" : "Ready"}</em>
              </button>
            );
          })}
          {!sortedRecipes.length && <p className="muted">No recipes in this filter yet.</p>}
        </div>
        <aside className={`crafting-detail-panel inventory-detail rarity-${(selectedOutput?.rarity ?? "Common").toLowerCase()}`}>
          {selectedRecipe ? (
            <>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{selectedOutput?.rarity ?? "Common"} / {selectedRecipe.category} / Owned {getOwnedCount(state, selectedRecipe.outputItemId)}</p>
                  <h2>{selectedRecipe.name}</h2>
                </div>
                {selectedOutput ? <EquipmentTypeIconBadge item={selectedOutput} /> : <span className="slot-fallback">{itemInitials(selectedRecipe.outputItemId)}</span>}
              </div>
              <p className="muted">Creates {selectedRecipe.outputQuantity} {selectedOutput?.name ?? selectedRecipe.outputItemId}.</p>
              {selectedOutput?.description && <p className="fine">{selectedOutput.description}</p>}
              {selectedOutput?.stats && <StatComparisonLine state={state} itemId={selectedRecipe.outputItemId} compareItemId={selectedComparisonItemId} />}
              {selectedOutput?.modifiers && <p className="fine">Modifiers: {formatItemModifiers(selectedOutput.modifiers)}</p>}
              {selectedOutput && <p className="fine">Used for: {itemUseSummary(selectedOutput.id)}</p>}
              <RequirementBulletList title="Skill Requirement">
                <span className={selectedLevelLocked ? "requirement-row missing" : "requirement-row met"}>{skillNames[selectedRecipe.requiredSkill]} Level {state.skills[selectedRecipe.requiredSkill].level} / {selectedRecipe.requiredLevel}</span>
              </RequirementBulletList>
              {selectedRecipe.requiredBlueprint && (
                <RequirementBulletList title="Blueprint Requirement" warning={selectedBlueprintLocked}>
                  <ClickableItemRequirement state={state} itemId={selectedRecipe.requiredBlueprint} required={1} warning={selectedBlueprintLocked} onOpen={(itemId, usedAmount) => setSourceItem({ itemId, usedAmount })} />
                </RequirementBulletList>
              )}
              {selectedRecipe.requiredDistrict && (
                <RequirementBulletList title="District Requirement" warning={selectedDistrictLocked}>
                  <span className={selectedDistrictLocked ? "requirement-row missing" : "requirement-row met"}>
                    {districts.find((district) => district.id === selectedRecipe.requiredDistrict)?.name ?? selectedRecipe.requiredDistrict} {selectedDistrictLocked ? "Locked" : "Unlocked"}
                  </span>
                </RequirementBulletList>
              )}
              <RequirementBulletList title="Required Materials" warning={selectedMissing}>
                {Object.entries(selectedCosts).map(([id, amount]) => (
                  <ClickableItemRequirement key={id} state={state} itemId={id} required={amount} warning={getOwnedCount(state, id) < amount} onOpen={(itemId, usedAmount) => setSourceItem({ itemId, usedAmount })} />
                ))}
              </RequirementBulletList>
              <RequirementBulletList title="Rewards">
                <span className="requirement-row">{selectedRecipe.outputQuantity} {selectedOutput?.name ?? selectedRecipe.outputItemId}</span>
                <span className="requirement-row">+{selectedRecipe.xpReward} XP</span>
                <span className="requirement-row">+{selectedRecipe.masteryXpReward} Mastery XP</span>
              </RequirementBulletList>
              <TagList tags={selectedRecipe.tags} />
              <CardActionFooter
                active={selectedActive}
                progress={selectedProgress}
                locked={selectedLocked}
                disabled={selectedMissing}
                startLabel={selectedLocked ? "Locked" : selectedMissing ? "Missing" : "Start"}
                stopLabel="Stop Craft"
                onStart={() => onCraft(selectedRecipe.id)}
                onStop={onStopCraft}
              />
            </>
          ) : (
            <p className="muted">Select a recipe to inspect requirements, stats, and output details.</p>
          )}
        </aside>
      </div>
    </article>
  );
}

function WeaponDetail({
  state,
  weaponId,
  onInstallAttachment,
  onRemoveAttachment,
  onInstallWeaponMod,
  onRemoveWeaponMod,
}: {
  state: GameState;
  weaponId: string;
  onInstallAttachment: (weaponId: string, attachmentId: string) => void;
  onRemoveAttachment: (weaponId: string, category: AttachmentCategory) => void;
  onInstallWeaponMod: (weaponId: string, modId: string) => void;
  onRemoveWeaponMod: (weaponId: string, modId: string) => void;
}) {
  const weapon = getItem(weaponId);
  const loadout = state.weaponLoadouts[weaponId] ?? { attachments: {}, mods: [] };
  const attachments = compatibleAttachments(state, weaponId);
  const mods = compatibleMods(state, weaponId);
  if (!weapon) return null;
  return (
    <div className="terminal-log">
      <p>Class: {weaponClasses.find((entry) => entry.id === weapon.weaponClass)?.name ?? "Unknown"} / Slots: {weapon.attachmentSlots?.map(titleCase).join(", ") || "None"} / Mods {loadout.mods.length}/{weapon.modSlots ?? 0}</p>
      <p>Weapon tags: {weapon.tags.join(", ")}</p>
      {weapon.attachmentSlots?.map((category) => {
        const installed = loadout.attachments[category];
        return (
          <p key={category}>
            {titleCase(category)}: {installed ? getItem(installed)?.name ?? installed : "Empty"}
            {installed ? <button className="inline-button" onClick={() => onRemoveAttachment(weaponId, category)}>Remove</button> : null}
          </p>
        );
      })}
      {loadout.mods.map((modId) => (
        <p key={modId}>Mod: {getItem(modId)?.name ?? modId}<button className="inline-button" onClick={() => onRemoveWeaponMod(weaponId, modId)}>Remove</button></p>
      ))}
      {attachments.length > 0 && (
        <div className="card-list compact">
          {attachments.slice(0, 4).map((attachmentId) => <button key={attachmentId} className="secondary-button full" onClick={() => onInstallAttachment(weaponId, attachmentId)}>Install {getItem(attachmentId)?.name}</button>)}
        </div>
      )}
      {mods.length > 0 && (
        <div className="card-list compact">
          {mods.slice(0, 4).map((modId) => <button key={modId} className="secondary-button full" disabled={loadout.mods.length >= (weapon.modSlots ?? 0)} onClick={() => onInstallWeaponMod(weaponId, modId)}>Install {getItem(modId)?.name}</button>)}
        </div>
      )}
    </div>
  );
}

export function CharacterTab({
  state,
  onUpdate,
  section,
  onSection,
  onRecover,
  onAutoHealChange,
  notices = [],
  onReviewNotice = () => {},
  onReviewAllNotices = () => {},
}: {
  notices?: TabNotice[];
  onReviewNotice?: (key: string) => void;
  onReviewAllNotices?: () => void;
  state: GameState;
  onUpdate: UpdateGame;
  section: CharacterSectionId;
  onSection: (section: CharacterSectionId) => void;
  onRecover: (mode: "basic" | "paid" | "full") => void;
  onAutoHealChange: (patch: Partial<GameState["autoHeal"]>) => void;
}) {
  const stats = playerCombatStats(state);
  const maxHp = calculateMaxHP(state);
  const path = startingPaths.find((entry) => entry.id === state.startingPath);
  return (
    <section className="stack character-tab runner-workspace" aria-label="Character workspace">
      <header className="runner-summary">
        <div className="runner-identity">{path && <img src={startingPathImages[path.id]} alt="" />}<div><p className="eyebrow">RUNNER / LEVEL {state.rpg.level}</p><h2>{path?.name ?? "Your character"}</h2><p className="muted">Equipment, progression and recovery in one place.</p></div></div>
        <div className="runner-vitals"><span>HEALTH<strong>{Math.ceil(state.health.currentHp)} / {maxHp}</strong></span><span>DAMAGE<strong>{stats.damage}</strong></span><span>ARMOR<strong>{stats.armor}</strong></span><span>ATTACK INTERVAL<strong>{(stats.attackSpeedMs / 1000).toFixed(2)}s</strong></span></div>
      </header>
      <MobileSectionMenu label="Character tools" value={section} options={characterSections} onChange={onSection} />
      <div className="district-tabs character-tabs" aria-label="Character sections">
        {characterSections.map((tabSection) => (
          <button
            key={tabSection.id}
            aria-pressed={section === tabSection.id}
            className={section === tabSection.id ? "active" : ""}
            onClick={() => onSection(tabSection.id)}
          >
            {tabSection.label}{tabSection.id === "gear" && notices.length > 0 && <b className="runner-tab-count">{notices.length}</b>}{tabSection.id === "attributes" && state.rpg.attributePoints + state.rpg.perkPoints > 0 && <b className="runner-tab-count">{state.rpg.attributePoints + state.rpg.perkPoints}</b>}
          </button>
        ))}
      </div>

      {section === "gear" && (
            <InventoryTab
              state={state}
              onEquip={(id) => onUpdate((current) => equipItem(current, id))}
              onUnequipGear={(slot) => onUpdate((current) => unequipGear(current, slot))}
              onUnequipCyberware={(slot) => onUpdate((current) => unequipCyberware(current, slot))}
              onUse={(id) => onUpdate((current) => useItem(current, id))}
              onSell={(id) => onUpdate((current) => quickSellInventoryItem(current, id))}
              onSellAllButOne={(id) => onUpdate((current) => quickSellAllButOne(current, id))}
              onUpgrade={(id) => onUpdate((current) => upgradeItem(current, id))}
              onInstallAttachment={(weaponId, attachmentId) => onUpdate((current) => installAttachment(current, weaponId, attachmentId))}
              onRemoveAttachment={(weaponId, category) => onUpdate((current) => removeAttachment(current, weaponId, category))}
              onInstallWeaponMod={(weaponId, modId) => onUpdate((current) => installWeaponMod(current, weaponId, modId))}
              onRemoveWeaponMod={(weaponId, modId) => onUpdate((current) => removeWeaponMod(current, weaponId, modId))}
              notices={notices}
              onReviewNotice={onReviewNotice}
              onReviewAllNotices={onReviewAllNotices}
            />
      )}
      {(section === "cyberware" || section === "presets") && (
            <CharacterEquipmentTools section={section}
              state={state}
              onEquip={(id) => onUpdate((current) => equipItem(current, id))}
              onUnequipCyberware={(slot) => onUpdate((current) => unequipCyberware(current, slot))}
              onUpgrade={(id) => onUpdate((current) => upgradeItem(current, id))}
              onSavePreset={(name) => onUpdate((current) => savePreset(current, name))}
              onLoadPreset={(name) => onUpdate((current) => loadPreset(current, name))}
              onAutoEquip={(mode) => onUpdate((current) => autoEquip(current, mode))}
            />
      )}
      {section === "quickhacks" && <QuickhackPanel state={state} onUpdate={onUpdate} />}
      {section === "attributes" && <BuildPanel state={state} onUpdate={onUpdate} />}
      {section === "health" && (
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{state.health.lifeState === "downed" ? "Downed" : "Vitals online"}</p>
            <h2>Health</h2>
          </div>
          <span className={state.health.currentHp / Math.max(1, maxHp) <= 0.25 ? "warning-badge" : "status-chip"}>{Math.round((state.health.currentHp / Math.max(1, maxHp)) * 100)}%</span>
        </div>
        <HealthBar label="Runner HP" current={state.health.currentHp} max={maxHp} kind="player" />
        <div className="inventory-grid">
          <Metric label="Last Damage" value={state.health.lastDamageTaken} />
          <Metric label="Last Heal" value={state.health.lastHealingReceived} />
          <Metric label="Deaths" value={state.healthStatistics.deaths} />
          <Metric label="Armor Reduced" value={state.healthStatistics.damageReducedByArmor} />
        </div>
        {state.health.lifeState === "downed" && (
          <div className="card-list compact">
            <button className="primary-button full" onClick={() => onRecover("basic")}>Basic Recovery</button>
            <button className="secondary-button full" onClick={() => onRecover("paid")}>Pay Medical Bill</button>
            <button className="secondary-button full" disabled={(state.inventory["emergency-reboot-kit"] ?? 0) <= 0} onClick={() => onRecover("full")}>Emergency Recovery</button>
          </div>
        )}
        <div className="auto-heal-box">
          <div className="action-row">
            <div>
              <strong>Auto Heal</strong>
              <span className="muted">{state.autoHeal.unlocked ? "Consumes selected healing items in combat." : "Unlocks at Body 5, with Field Medic, or after finding healing items."}</span>
            </div>
            <button className="secondary-button" disabled={!state.autoHeal.unlocked} onClick={() => onAutoHealChange({ enabled: !state.autoHeal.enabled })}>{state.autoHeal.enabled ? "On" : "Off"}</button>
          </div>
          <div className="inventory-filter-row">
            {([25, 40, 60, 75] as const).map((threshold) => (
              <button key={threshold} className={state.autoHeal.threshold === threshold ? "active" : ""} disabled={!state.autoHeal.unlocked} onClick={() => onAutoHealChange({ threshold })}>{threshold}%</button>
            ))}
          </div>
          <div className="inventory-filter-row">
            {Object.keys(healingItems).map((itemId) => (
              <button key={itemId} className={state.autoHeal.itemId === itemId ? "active" : ""} disabled={!state.autoHeal.unlocked} onClick={() => onAutoHealChange({ itemId })}>
                {getItem(itemId)?.name ?? itemId} ({state.inventory[itemId] ?? 0})
              </button>
            ))}
          </div>
        </div>
      </article>
      )}

      {section === "health" && (
        <>
      <article className="panel">
        <h2>Risk State</h2>
        <p className="muted">Equipped Cyberware Instability: {cyberwareLoad(state)}%</p>
        <p className="muted">Status: {effectiveNeuralInstability(state)}% / {neuralInstabilityTierName(effectiveNeuralInstability(state))}</p>
        <Progress value={effectiveNeuralInstability(state)} />
        <p className="muted">Heat: {state.resources.heat}% / {heatTier(state.resources.heat)}</p>
        <Progress value={state.resources.heat} />
      </article>
      {state.activeRipperdocEffects?.length ? (
        <article className="panel">
          <h2>Active Ripperdoc Effects</h2>
          <div className="card-list">
            {state.activeRipperdocEffects.filter((effect) => !effect.expiresAt || effect.expiresAt > Date.now()).map((effect) => (
              <article className="compact-run-card" key={`${effect.serviceId}-${effect.startedAt}`}>
                <div>
                  <p className="eyebrow">{effect.sourceName}</p>
                  <h3>{effect.name}</h3>
                  <p className="muted">{effect.description}</p>
                  <p className="fine">{formatModifierSummary(effect.modifiers)}</p>
                  <p className="fine">Remaining: {effect.expiresAt ? formatDuration(Math.max(0, effect.expiresAt - Date.now())) : `${effect.remainingUses ?? 0} uses`}</p>
                </div>
              </article>
            ))}
          </div>
        </article>
      ) : null}
        </>
      )}


    </section>
  );
}

function CharacterEquipmentTools({
  state,
  section: loadoutSection,
  onEquip,
  onUnequipCyberware,
  onUpgrade,
  onSavePreset,
  onLoadPreset,
  onAutoEquip,
}: {
  state: GameState;
  section: "cyberware" | "presets";
  onEquip: (id: string) => void;
  onUnequipCyberware: (slot: CyberwareSlot) => void;
  onUpgrade: (id: string) => void;
  onSavePreset: (name: string) => void;
  onLoadPreset: (name: string) => void;
  onAutoEquip: (mode: "combat" | "hacking" | "scavenging" | "lowInstability") => void;
}) {
  const [selectedSlot, setSelectedSlot] = useState<CyberwareSlot | null>(null);
  return (
    <section className="stack character-tab">
      {loadoutSection === "cyberware" && (
        <CyberwareScreen
          state={state}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          onClose={() => setSelectedSlot(null)}
          onEquip={onEquip}
          onUnequip={onUnequipCyberware}
          onUpgrade={onUpgrade}
        />
      )}

      {loadoutSection === "presets" && (
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Activity switching</p>
              <h2>Presets</h2>
            </div>
            <Activity size={22} />
          </div>
          <div className="card-list compact">
            <button className="primary-button full" disabled={Boolean(state.rpg.active)} onClick={() => onAutoEquip("combat")}>Best Combat</button>
            <button className="primary-button full" disabled={Boolean(state.rpg.active)} onClick={() => onAutoEquip("hacking")}>Best Hacking</button>
            <button className="primary-button full" disabled={Boolean(state.rpg.active)} onClick={() => onAutoEquip("scavenging")}>Best Scavenging</button>
            <button className="primary-button full" disabled={Boolean(state.rpg.active)} onClick={() => onAutoEquip("lowInstability")}>Low Instability</button>
          </div>
          <div className="card-list">
            {Object.keys(state.equipmentPresets).map((name) => (
              <article className="action-card" key={name}>
                <div>
                  <p className="eyebrow">Preset</p>
                  <h3>{name}</h3>
                </div>
                <div className="card-list compact">
                  <button className="secondary-button full" onClick={() => onSavePreset(name)}>Save</button>
                  <button className="secondary-button full" disabled={Boolean(state.rpg.active)} onClick={() => onLoadPreset(name)}>Load</button>
                </div>
              </article>
            ))}
          </div>
        </article>
      )}
    </section>
  );
}

function CyberwareScreen({
  state,
  selectedSlot,
  onSelectSlot,
  onClose,
  onEquip,
  onUnequip,
  onUpgrade,
}: {
  state: GameState;
  selectedSlot: CyberwareSlot | null;
  onSelectSlot: (slot: CyberwareSlot) => void;
  onClose: () => void;
  onEquip: (id: string) => void;
  onUnequip: (slot: CyberwareSlot) => void;
  onUpgrade: (id: string) => void;
}) {
  const [debugAlign, setDebugAlign] = useState(false);
  const selectedOverlay = selectedSlot ? cyberwareOverlaySlots.find((slot) => slot.slotId === selectedSlot) ?? null : null;
  const installedItems = Object.values(state.equippedCyberware).map((id) => id ? getItem(id) : undefined).filter(Boolean) as NonNullable<ReturnType<typeof getItem>>[];
  const modifierSummary = installedItems
    .flatMap((item) => item.modifiers ? formatItemModifiers(item.modifiers).split(", ") : [])
    .slice(0, 4);

  return (
    <article className="cyberware-screen">
      <div className="cyberware-screen-heading">
        <div>
          <p className="eyebrow">Implant interface</p>
          <h2>Cyberware</h2>
        </div>
        {isDevBuild && (
          <button className="secondary-button" onClick={() => setDebugAlign((current) => !current)}>
            Align
          </button>
        )}
      </div>
      <div className="cyberware-frame">
        <CyberwareBackgroundLayer />
        <CyberwareOverlayLayer
          state={state}
          selectedSlot={selectedSlot}
          debugAlign={debugAlign}
          onSelectSlot={onSelectSlot}
        />
        <div className="cyberware-summary-panel cyberware-summary-risk">
          <span>IN {effectiveNeuralInstability(state)}%</span>
          <strong>{neuralInstabilityTierName(effectiveNeuralInstability(state))}</strong>
          <em>Static load from equipped cyberware</em>
        </div>
        <details className="cyberware-summary-panel cyberware-summary-bonuses">
          <summary>Bonuses</summary>
          <p>{installedItems.length} installed / Load {cyberwareLoad(state)}%</p>
          <p>{modifierSummary.length ? modifierSummary.join(" / ") : "No installed cyberware bonuses yet."}</p>
        </details>
        {selectedOverlay && (
          <CyberwareDetailsDrawer
            state={state}
            overlay={selectedOverlay}
            onClose={onClose}
            onEquip={onEquip}
            onUnequip={onUnequip}
            onUpgrade={onUpgrade}
          />
        )}
      </div>
    </article>
  );
}

function CyberwareBackgroundLayer() {
  return <img className="cyberware-background-layer" src={cyberwareBackgroundImage} alt="" />;
}

function CyberwareOverlayLayer({
  state,
  selectedSlot,
  debugAlign,
  onSelectSlot,
}: {
  state: GameState;
  selectedSlot: CyberwareSlot | null;
  debugAlign: boolean;
  onSelectSlot: (slot: CyberwareSlot) => void;
}) {
  return (
    <div className={`cyberware-overlay-layer ${debugAlign ? "debug" : ""}`}>
      {cyberwareOverlaySlots.map((slot) => (
        <CyberwareSlotOverlay
          key={slot.slotId}
          state={state}
          overlay={slot}
          active={selectedSlot === slot.slotId}
          debugAlign={debugAlign}
          onSelect={() => onSelectSlot(slot.slotId)}
        />
      ))}
    </div>
  );
}

function CyberwareSlotOverlay({
  state,
  overlay,
  active,
  debugAlign,
  onSelect,
}: {
  state: GameState;
  overlay: CyberwareOverlaySlot;
  active: boolean;
  debugAlign: boolean;
  onSelect: () => void;
}) {
  const itemId = state.equippedCyberware[overlay.slotId];
  const item = itemId ? getItem(itemId) : undefined;
  const availableCount = compatibleCyberwareIds(state, overlay.slotId).filter((id) => id !== itemId).length;

  return (
    <button
      className={`cyberware-slot-overlay ${active ? "active" : ""} ${item ? `rarity-${item.rarity.toLowerCase()}` : "empty"}`}
      style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, width: `${overlay.width}%`, height: `${overlay.height}%` }}
      onClick={onSelect}
    >
      <CyberwareSlotPanel state={state} overlay={overlay} itemId={itemId} availableCount={availableCount} />
      {debugAlign && (
        <span className="cyberware-debug-label">
          {overlay.slotId}: {overlay.x}/{overlay.y}/{overlay.width}/{overlay.height}
        </span>
      )}
    </button>
  );
}

function CyberwareSlotPanel({ state, overlay, itemId, availableCount }: { state: GameState; overlay: CyberwareOverlaySlot; itemId?: string; availableCount: number }) {
  const item = itemId ? getItem(itemId) : undefined;
  const mainBonus = item?.modifiers ? formatItemModifiers(item.modifiers).split(", ")[0] : "";

  return (
    <span className="cyberware-slot-panel">
      <span className="cyberware-slot-title">{overlay.label}</span>
      {item ? (
        <>
          <EquipmentTypeIconBadge item={item} fallbackSlot={overlay.slotId} fallbackKind="cyberware" />
          <strong>{item.name}</strong>
          <span>Tier {item.tier ?? 1} / IN {formatSigned(cyberwareInstabilityLoad(item))}</span>
          {mainBonus && <em>{mainBonus}</em>}
          <b>Installed</b>
        </>
      ) : (
        <>
          <strong>Empty</strong>
          <span>Not installed</span>
          <em>+ Install</em>
          {availableCount > 0 && <b>{availableCount} owned</b>}
        </>
      )}
    </span>
  );
}

function CyberwareDetailsDrawer({
  state,
  overlay,
  onClose,
  onEquip,
  onUnequip,
  onUpgrade,
}: {
  state: GameState;
  overlay: CyberwareOverlaySlot;
  onClose: () => void;
  onEquip: (id: string) => void;
  onUnequip: (slot: CyberwareSlot) => void;
  onUpgrade: (id: string) => void;
}) {
  const equippedId = state.equippedCyberware[overlay.slotId];
  const equippedItem = equippedId ? getItem(equippedId) : undefined;
  const compatibleIds = compatibleCyberwareIds(state, overlay.slotId, equippedId);
  const sourceClinic = ripperdocClinics.find((clinic) =>
    state.districts[clinic.districtId]?.unlocked &&
    clinic.cyberwareInventory.some((itemId) => getItem(itemId)?.slot === overlay.slotId)
  );

  return (
    <aside className="cyberware-details-drawer">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{overlay.label}</p>
          <h2>{equippedItem ? equippedItem.name : "Empty Slot"}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close cyberware details">
          <X size={16} />
        </button>
      </div>
      {equippedItem ? (
        <div className={`cyberware-equipped-detail rarity-${equippedItem.rarity.toLowerCase()}`}>
          <EquipmentTypeIconBadge item={equippedItem} fallbackSlot={overlay.slotId} fallbackKind="cyberware" />
          <p className="muted">{equippedItem.description}</p>
          <p className="fine">{equippedItem.rarity} / Tier {equippedItem.tier ?? 1} / Upgrade +{state.upgradeLevels[equippedItem.id] ?? 0}</p>
          <p className="fine">Equipped Instability {formatSigned(cyberwareInstabilityLoad(equippedItem))}</p>
          {equippedItem.stats && <p className="fine">Stats: {formatStats(scaledStats(state, equippedItem.id))}</p>}
          {equippedItem.modifiers && <p className="fine">Modifiers: {formatItemModifiers(equippedItem.modifiers)}</p>}
          <p className="fine">Source: {equippedItem.sourceHint}</p>
          <div className="inventory-actions">
            <button className="secondary-button full" onClick={() => onUnequip(overlay.slotId)}>Unequip</button>
            {equippedItem.maxUpgradeLevel && (
              <button className="secondary-button full" title={`Requires Technical ${upgradeTechnicalRequirement(state, (state.upgradeLevels[equippedItem.id] ?? 0) + 1)} and upgrade materials`} disabled={!canAffordItemUpgrade(state, equippedItem.id)} onClick={() => onUpgrade(equippedItem.id)}>
                {(state.upgradeLevels[equippedItem.id] ?? 0) >= equippedItem.maxUpgradeLevel
                  ? "Max Upgrade"
                  : `Upgrade ${formatItemCost(itemUpgradeCost(state, equippedItem.id))}`}
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="muted">No implant installed in this slot. Choose compatible cyberware below.</p>
      )}
      <div className="cyberware-compatible-list">
        <h3>Compatible Cyberware</h3>
        {compatibleIds.length ? compatibleIds.map((itemId) => {
          const item = getItem(itemId);
          if (!item) return null;
          const installed = equippedId === itemId;
          const canInstall = canEquipCyberwareFromInventory(state, itemId);
          return (
            <article className={`cyberware-compatible-card rarity-${item.rarity.toLowerCase()} ${installed ? "installed" : ""}`} key={itemId}>
              <EquipmentTypeIconBadge item={item} fallbackSlot={overlay.slotId} fallbackKind="cyberware" />
              <div>
                <strong>{item.name}</strong>
                <span>{item.rarity} / Tier {item.tier ?? 1} / IN {formatSigned(cyberwareInstabilityLoad(item))}</span>
                {item.modifiers && <em>{formatItemModifiers(item.modifiers)}</em>}
                <small>Requires {itemAttributeRequirement(item).label}</small>
              </div>
              <div className="card-list compact">
                <button className="primary-button full" disabled={installed || !canInstall} onClick={() => onEquip(itemId)}>
                  {installed ? "Installed" : "Equip"}
                </button>
                {item.maxUpgradeLevel && (
                  <button className="secondary-button full" title={`Requires Technical ${upgradeTechnicalRequirement(state, (state.upgradeLevels[itemId] ?? 0) + 1)} and upgrade materials`} disabled={!canAffordItemUpgrade(state, itemId)} onClick={() => onUpgrade(itemId)}>
                    {(state.upgradeLevels[itemId] ?? 0) >= item.maxUpgradeLevel ? "Max Upgrade" : "Upgrade"}
                  </button>
                )}
              </div>
            </article>
          );
        }) : (
          <div className="compact-run-card">
            <p className="muted">No compatible cyberware owned for this slot.</p>
            {sourceClinic ? (
              <p className="fine">Visit Ripperdoc: {sourceClinic.name}. Prices start around {Math.min(...sourceClinic.cyberwareInventory.filter((itemId) => getItem(itemId)?.slot === overlay.slotId).map((itemId) => ripperdocBuyPrice(state, sourceClinic.id, itemId))).toLocaleString()} Credits.</p>
            ) : (
              <p className="fine">Find compatible drops, blueprints, or unlock a Ripperdoc with {overlay.label} inventory.</p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function compatibleCyberwareIds(state: GameState, slot: CyberwareSlot, equippedId?: string) {
  const ids = new Set<string>();
  Object.entries(state.inventory).forEach(([itemId, count]) => {
    const item = getItem(itemId);
    if (count > 0 && item?.type === "Cyberware" && item.slot === slot) ids.add(itemId);
  });
  if (equippedId) ids.add(equippedId);
  return [...ids].sort((leftId, rightId) => {
    if (leftId === equippedId) return -1;
    if (rightId === equippedId) return 1;
    const left = getItem(leftId);
    const right = getItem(rightId);
    const leftCan = canEquipCyberwareFromInventory(state, leftId) ? 1 : 0;
    const rightCan = canEquipCyberwareFromInventory(state, rightId) ? 1 : 0;
    if (leftCan !== rightCan) return rightCan - leftCan;
    const rarityDiff = (inventoryRarityRanks[right?.rarity ?? "Common"] ?? 0) - (inventoryRarityRanks[left?.rarity ?? "Common"] ?? 0);
    if (rarityDiff !== 0) return rarityDiff;
    const tierDiff = (right?.tier ?? 0) - (left?.tier ?? 0);
    if (tierDiff !== 0) return tierDiff;
    const loadDiff = cyberwareInstabilityLoad(left) - cyberwareInstabilityLoad(right);
    if (loadDiff !== 0) return loadDiff;
    return (left?.name ?? leftId).localeCompare(right?.name ?? rightId);
  });
}

function canEquipCyberwareFromInventory(state: GameState, itemId: string) {
  const item = getItem(itemId);
  if (!item || item.type !== "Cyberware" || (state.inventory[itemId] ?? 0) <= 0) return false;
  if (!meetsItemAttributeRequirement(state, item)) return false;
  return true;
}

export function MoreTab({
  state,
  section,
  onSection,
  exported,
  importPayload,
  onGift,
  onSpendTime,
  onSetCompanion,
  onStoryChoice,
  onRunSimCache,
  onDebugGrantCache,
  onDebugSetRisk,
  onDebugGrantCredits,
  onExport,
  onImportPayload,
  onImport,
  onReset,
  onSave,
  activeSaveSlot,
  saveSlots,
  onSwitchSave,
  onNewSave,
  tabNoticesEnabled,
  onTabNoticesEnabledChange,
}: {
  state: GameState;
  section: MoreSection;
  onSection: (section: MoreSection) => void;
  exported: string;
  importPayload: string;
  onGift: (id: string) => void;
  onSpendTime: (id: string) => void;
  onSetCompanion: (id: string) => void;
  onStoryChoice: (arcId: string, stepId: string, choiceId: string) => void;
  onRunSimCache: (count: number) => void;
  onDebugGrantCache: () => void;
  onDebugSetRisk: (heat: number, neuralInstability: number) => void;
  onDebugGrantCredits: () => void;
  onExport: () => void;
  onImportPayload: (value: string) => void;
  onImport: () => void;
  onReset: () => void;
  onSave: () => void;
  activeSaveSlot: SaveSlotId;
  saveSlots: SaveSlotSummary[];
  onSwitchSave: (slot: SaveSlotId) => void;
  onNewSave: (slot: SaveSlotId) => void;
  tabNoticesEnabled: boolean;
  onTabNoticesEnabledChange: (enabled: boolean) => void;
}) {
  return (
    <section className="network-shell menu-network">
      <NetworkHeader eyebrow="PERSONAL TERMINAL / CONNECTIONS & ARCHIVE" title="Your network." description="Follow city stories, check your contacts, browse the archive and manage your save." />
        <MobileSectionMenu label="Menu sections" value={section} onChange={onSection} options={([
          { id: "story", label: "City stories" }, { id: "companions", label: "Companions" },
          { id: "itemIndex", label: "Item index" }, { id: "simCache", label: "Simulation cache" },
          ...(isDevBuild ? [{ id: "balance", label: "Balance tools" }] : []), { id: "settings", label: "Settings & saves" },
        ] as Array<{ id: MoreSection; label: string }>)} />
        <nav className="network-tabs" aria-label="Menu sections">
          {(["story", "companions", "itemIndex", "simCache", ...(isDevBuild ? ["balance" as MoreSection] : []), "settings"] as MoreSection[]).map((id) => (
            <button key={id} className={section === id ? "active" : ""} onClick={() => onSection(id)}>
              {id === "itemIndex" ? "Item Index" : titleCase(id)}
            </button>
          ))}
        </nav>
      <div className="network-body stack">
      {section === "story" && <StorySection state={state} onChoice={onStoryChoice} />}
      {section === "companions" && <CompanionsSection state={state} onGift={onGift} onSpendTime={onSpendTime} onSetCompanion={onSetCompanion} />}
      {section === "itemIndex" && <ItemIndexPanel state={state} />}
      {section === "simCache" && <SimCacheSection state={state} onRun={onRunSimCache} />}
      {section === "balance" && isDevBuild && <BalanceDebugSection state={state} onGrantCache={onDebugGrantCache} onSetRisk={onDebugSetRisk} onGrantCredits={onDebugGrantCredits} />}
      {section === "settings" && (
        <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Save version {state.saveVersion}</p>
            <h2>Settings</h2>
          </div>
          <Save size={22} />
        </div>
        <div className="settings-option-row">
          <div>
            <h3>Tab Notification Dots</h3>
            <p className="muted">Show yellow tab dots and the in-tab explanation panels for new inventory and map updates.</p>
          </div>
          <button className={`toggle-button ${tabNoticesEnabled ? "active" : ""}`} onClick={() => onTabNoticesEnabledChange(!tabNoticesEnabled)}>
            {tabNoticesEnabled ? "On" : "Off"}
          </button>
        </div>
        <h2>Saves</h2>
        <div className="save-slot-grid">
          {saveSlots.map((slot) => (
            <article key={slot.slot} className={`save-slot-card ${activeSaveSlot === slot.slot ? "active" : ""}`}>
              <div>
                <p className="eyebrow">Slot {slot.slot}{activeSaveSlot === slot.slot ? " / Active" : ""}</p>
                <h3>{slot.exists ? startingPaths.find((path) => path.id === slot.startingPath)?.name ?? "No Life Path" : "Empty Slot"}</h3>
                <p className="fine">
                  {slot.exists
                    ? `${slot.credits.toLocaleString()} Credits / Total Lv ${slot.totalLevel} / ${slot.lastSavedAt ? new Date(slot.lastSavedAt).toLocaleString() : "No timestamp"}`
                    : "Start a separate character here."}
                </p>
              </div>
              <div className="save-slot-actions">
                <button className="secondary-button full" disabled={activeSaveSlot === slot.slot || !slot.exists} onClick={() => onSwitchSave(slot.slot)}>
                  Load
                </button>
                <button className="primary-button full" disabled={activeSaveSlot === slot.slot && !slot.exists} onClick={() => onNewSave(slot.slot)}>
                  New
                </button>
              </div>
            </article>
          ))}
        </div>
        <button className="primary-button full" onClick={onSave}>
          <Save size={18} />
          Save Slot {activeSaveSlot}
        </button>
        <button className="secondary-button full" onClick={onExport}>
          <Download size={18} />
          Export Save
        </button>
        {exported && <textarea readOnly value={exported} rows={5} />}
        <textarea value={importPayload} onChange={(event) => onImportPayload(event.target.value)} rows={5} placeholder="Paste exported save here" />
        <button className="primary-button full" onClick={onImport}>
          <Upload size={18} />
          Import Save
        </button>
        <button className="secondary-button full danger-text" onClick={onReset}>
          <RotateCcw size={18} />
          Reset Save
        </button>
        </article>
      )}
      <details className="network-disclosure"><summary>Recent activity</summary><RecentLog state={state} /></details>
      </div>
    </section>
  );
}

function BalanceDebugSection({
  state,
  onGrantCache,
  onSetRisk,
  onGrantCredits,
}: {
  state: GameState;
  onGrantCache: () => void;
  onSetRisk: (heat: number, neuralInstability: number) => void;
  onGrantCredits: () => void;
}) {
  const sampleAction = skillActions.find((action) => meetsActionAccessRequirement(state, action)) ?? skillActions[0];
  const sampleEnemy = combatZones[0]?.enemies[0];
  const sampleJob = jobs[0];
  const sampleVendorPrice = calculateVendorPrice(state, 100, state.selectedDistrict ?? "neonRow", 1);
  const actionRewards = sampleAction ? calculateSkillActionRewards(state, sampleAction) : {};
  const jobChance = sampleJob ? calculateJobSuccessChance(sampleJob, state) : undefined;
  const heatEffects = calculateHeatEffects(state.resources.heat);
  const instabilityEffects = calculateInstabilityEffects(effectiveNeuralInstability(state));
  const simEfficiency = calculateSimulationEfficiency(state);
  const killTime = sampleEnemy ? calculateEstimatedKillTime(state, sampleEnemy.hp) : 0;
  const firstDrop = sampleEnemy?.drops[0];
  const dropChance = firstDrop ? calculateDropChance(firstDrop.chance, state, combatEffectivenessForEnemy(state, sampleEnemy).tags) : 0;
  const contentReport = getContentValidationReport();
  const contentWarningCount = contentReport.warnings.length + contentReport.missingReferences.length + contentReport.duplicateIds.length + contentReport.balanceWarnings.length;
  const contentPreview = [
    ...contentReport.missingReferences,
    ...contentReport.duplicateIds,
    ...contentReport.balanceWarnings,
    ...contentReport.warnings,
  ].slice(0, 10);
  const fmtPct = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <section className="stack">
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Dev only / Balance v{BALANCE_VERSION}</p>
            <h2>Formula Console</h2>
          </div>
          <Activity size={22} />
        </div>
        <div className="stat-grid">
          <Stat label="Skill XP L10" value={xpForNextLevel(10)} />
          <Stat label="Mastery XP L50" value={xpForNextMastery(50)} />
          <Stat label="Vendor 100c" value={sampleVendorPrice} />
          <Stat label="Drop cap" value={fmtPct(balanceConfig.rewards.maxDropChance)} />
        </div>
        <div className="card-list compact">
          <button className="secondary-button full" onClick={onGrantCache}>Grant 3 Basic Sim Caches</button>
          <button className="secondary-button full" onClick={onGrantCredits}>Grant 5,000 Credits</button>
          <button className="secondary-button full" onClick={() => onSetRisk(0, 0)}>Clear Heat / IN</button>
          <button className="secondary-button full" onClick={() => onSetRisk(75, 75)}>Set High Risk</button>
        </div>
      </article>

      <article className="panel">
        <h2>Content Validation</h2>
        <div className="stat-grid">
          <Stat label="Warnings" value={contentWarningCount} />
          <Stat label="Missing refs" value={contentReport.missingReferences.length} />
          <Stat label="Duplicates" value={contentReport.duplicateIds.length} />
          <Stat label="Balance flags" value={contentReport.balanceWarnings.length} />
        </div>
        <div className="inventory-grid">
          {contentReport.districtCounts.map((district) => (
            <Stat
              key={district.districtId}
              label={district.districtId}
              value={`Actions ${district.actions} / Enemies ${district.combatEnemies} / Main jobs ${rpgMissions.filter(mission => mission.district === district.districtId).length} / Gigs ${rpgSideGigs.filter(gig => gig.district === district.districtId).length}`}
            />
          ))}
        </div>
        {contentPreview.length > 0 ? (
          <TerminalLog>
            {contentPreview.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </TerminalLog>
        ) : (
          <p className="muted">No content validation warnings detected.</p>
        )}
      </article>

      <article className="panel">
        <h2>Activity Math</h2>
        {sampleAction && (
          <article className="action-card">
            <div>
              <p className="eyebrow">{skillNames[sampleAction.skillId]} action</p>
              <h3>{sampleAction.name}</h3>
              <p className="muted">{sampleAction.durationMs / 1000}s base / {adjustedDurationMs(state, sampleAction.durationMs, [sampleAction.skillId, ...(sampleAction.tags ?? [])]) / 1000}s adjusted</p>
            </div>
            <p>{formatRewards(actionRewards)}</p>
          </article>
        )}
        {sampleEnemy && (
          <article className="action-card">
            <div>
              <p className="eyebrow">Combat estimate</p>
              <h3>{sampleEnemy.name}</h3>
              <p className="muted">Kill time {Math.round(killTime / 100) / 10}s / {firstDrop?.name ?? "first drop"} {fmtPct(dropChance)}</p>
            </div>
          </article>
        )}
        {sampleJob && jobChance && (
          <article className="action-card">
            <div>
              <p className="eyebrow">Fixer success</p>
              <h3>{sampleJob.name}</h3>
              <p className="muted">{jobChance.guaranteed ? "Guaranteed" : fmtPct(jobChance.chance)}</p>
            </div>
            <details>
              <summary>Breakdown</summary>
              {jobChance.breakdown.map((line) => (
                <p className="muted" key={line.label}>{line.label}: {typeof line.value === "number" ? (Math.abs(line.value) <= 1 ? fmtPct(line.value) : line.value) : line.value}</p>
              ))}
            </details>
          </article>
        )}
      </article>

      <article className="panel">
        <h2>Risk And Simulation</h2>
        <div className="stat-grid">
          <Stat label={`Heat ${heatEffects.tier}`} value={`${fmtPct(heatEffects.blackMarketRisk)} BM risk`} />
          <Stat label={`IN ${instabilityEffects.tier}`} value={`${fmtPct(instabilityEffects.combatDamage)} damage`} />
          <Stat label="Sim XP" value={fmtPct(simEfficiency.skillXp)} />
          <Stat label="Sim Drops" value={fmtPct(simEfficiency.rareDrops)} />
        </div>
      </article>
    </section>
  );
}

function StorySection({ state, onChoice }: { state: GameState; onChoice: (arcId: string, stepId: string, choiceId: string) => void }) {
  const visibleArcs = storyArcs.filter((arc) => !arc.roadmap || storyArcState(state, arc).status !== "locked");
  const roadmapArcs = storyArcs.filter((arc) => arc.roadmap);
  return (
    <section className="stack">
      <NeonPanel>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Encrypted Intel / Case Files</p>
            <h2>Story Progression</h2>
          </div>
          <BrainCircuit size={22} />
        </div>
        <div className="inventory-grid">
          <Metric label="Steps" value={Object.values(state.storyArcs).reduce((sum, arc) => sum + Object.keys(arc.completedSteps).length, 0)} />
          <Metric label="Choices" value={state.storyChoices.length} />
          <Metric label="Leads" value={Object.values(state.operationLeads).filter(Boolean).length} />
          <Metric label="Flags" value={Object.values(state.storyFlags).filter(Boolean).length} />
        </div>
        <TerminalLog>
          <p>Case files update from main missions, local gigs, skill actions, district standing, and choices.</p>
          <p>Major choices show known consequences before you confirm. Hidden fallout is tracked as world flags for later arcs.</p>
        </TerminalLog>
      </NeonPanel>

      <ActivityGroup title="Active Case Files">
        {visibleArcs.map((arc) => {
          const arcState = storyArcState(state, arc);
          const step = activeStoryStep(state, arc);
          const progress = storyProgressForArc(state, arc);
          const objectiveProgress = step ? storyObjectiveProgress(state, step.objective) : 0;
          const choiceReady = Boolean(step && (step.objective.type === "makeChoice" || objectiveProgress >= step.objective.requiredCount));
          return (
            <ActivityCard key={arc.id} locked={arcState.status === "locked"}>
              <div>
                <p className="eyebrow">{arc.category} / {arcState.status} / {progress}%</p>
                <h3>{arc.name}</h3>
                <p className="muted">{arc.description}</p>
                {step && (
                  <>
                    <p className="fine">Current: {step.title}</p>
                    <p className="fine">{step.description}</p>
                    <Progress value={(objectiveProgress / Math.max(1, step.objective.requiredCount)) * 100} label={`${objectiveProgress} / ${step.objective.requiredCount}`} />
                    {step.rewards && <p className="fine">Step rewards: {formatRewards(step.rewards)}</p>}
                    {choiceReady && step.choices?.length && !arcState.completedSteps[step.id] ? (
                      <div className="card-list compact">
                        {step.choices.map((choice) => (
                          <button
                            className="secondary-button full"
                            key={choice.id}
                            onClick={() => {
                              const warning = `${choice.label}\n\n${choice.knownConsequences.join("\n")}${choice.permanent ? "\n\nThis choice is permanent." : ""}`;
                              if (!choice.permanent || window.confirm(warning)) onChoice(arc.id, step.id, choice.id);
                            }}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {step.choices?.length ? <p className="fine">{choiceReady ? "Choices" : "Choices locked until objective completes"}: {step.choices.map((choice) => `${choice.label}: ${choice.knownConsequences.join("; ")}`).join(" / ")}</p> : null}
                  </>
                )}
                <TagList tags={[arc.category, ...(arc.districtId ? [arc.districtId] : []), ...arc.involvedFactions, ...arc.involvedFixers].slice(0, 10)} />
              </div>
            </ActivityCard>
          );
        })}
      </ActivityGroup>

      <ActivityGroup title="Faction Conflicts">
        {Object.entries(state.factionConflicts).map(([id, conflict]) => (
          <ActivityCard key={id}>
            <div>
              <p className="eyebrow">{conflict.status} / Leaning {conflict.playerLeaning}</p>
              <h3>{titleCase(id)}</h3>
              <p className="fine">Conflict score {conflict.score} / Decisions {Object.keys(conflict.decisions).length}</p>
              <p className="muted">Early choices nudge access, reputation, and district pressure. Larger lockouts are reserved for later arcs.</p>
            </div>
          </ActivityCard>
        ))}
      </ActivityGroup>


      <ActivityGroup title="Choice History">
        {state.storyChoices.slice(0, 8).map((choice) => (
          <ActivityCard key={`${choice.timestamp}-${choice.choiceId}`}>
            <div>
              <p className="eyebrow">{new Date(choice.timestamp).toLocaleString()}</p>
              <h3>{choice.label}</h3>
              <p className="fine">{choice.arcId} / {choice.stepId}</p>
            </div>
          </ActivityCard>
        ))}
        {!state.storyChoices.length && <p className="muted">No major choices made yet.</p>}
      </ActivityGroup>

      <ActivityGroup title="Locked Roadmap Files">
        {roadmapArcs.map((arc) => (
          <ActivityCard key={arc.id} locked>
            <div>
              <p className="eyebrow">{arc.category}</p>
              <h3>{arc.name}</h3>
              <p className="muted">{arc.description}</p>
              <RequirementStatusList requirements={textRequirementDetails(state, arc.unlockRequirements)} />
            </div>
          </ActivityCard>
        ))}
      </ActivityGroup>
    </section>
  );
}

function FactionsSection({ state }: { state: GameState }) {
  return (
    <section className="stack">
      {factions.map((faction) => {
        const factionState = state.factions[faction.id];
        return (
          <article className="panel" key={faction.id}>
            <p className="eyebrow">Rank {factionRankNumber(factionState?.reputation ?? 0)} {factionRankLabel(factionState?.reputation ?? 0)} / Hostility {factionState?.hostility ?? 0}</p>
            <h2>{faction.name}</h2>
            <p className="muted">{faction.description}</p>
            <p className="fine">Influence: {faction.districtInfluence.map((id) => districts.find((district) => district.id === id)?.name ?? id).join(", ")}</p>
            <p className="fine">Bonuses: {faction.uniqueBonuses.join(", ")}</p>
            <p className="fine">Shop: {faction.uniqueShop}</p>
            <p className="fine">Consequences: high rank unlocks jobs/shops/housing; hostility may raise Heat, prices, and encounters.</p>
            <p className="fine">Rivals: {faction.rivals.map((id) => factions.find((rival) => rival.id === id)?.name ?? id).join(", ")}</p>
          </article>
        );
      })}
    </section>
  );
}

function HousingSection({
  state,
  onBuy,
  onSetResidence,
}: {
  state: GameState;
  onBuy: (id: string) => void;
  onSetResidence: (id: string) => void;
}) {
  return (
    <section className="stack">
      {housingOptions.map((housing) => {
        const owned = Boolean(state.ownedHousing[housing.id]);
        const districtUnlocked = state.districts[housing.districtId]?.unlocked;
        const active = state.activeResidence === housing.id;
        return (
          <article className="action-card vertical" key={housing.id}>
            <div>
              <p className="eyebrow">{districts.find((district) => district.id === housing.districtId)?.name} / {owned ? "Owned" : "For Sale"}</p>
              <h2>{housing.name}</h2>
              <p className="muted">{housing.passiveBonuses.join(", ")}</p>
              <p className="fine">Cost {housing.cost} Credits / Unlock {housing.unlockRequirements.join(", ")}</p>
              <p className="fine">Active bonus: +2% action speed, {modifierSummary(housing.passiveModifiers ?? {})}</p>
              <p className="fine">Storage +{housing.storageBonus}, offline cap +{housing.offlineCapBonusHours}h, Heat decay +{housing.heatDecayBonus}, IN recovery +{housing.neuralRecoveryBonus}</p>
            </div>
            {owned ? (
              <button className="primary-button full" disabled={active} onClick={() => onSetResidence(housing.id)}>
                {active ? "Active Residence" : "Set Active"}
              </button>
            ) : (
              <button className="primary-button full" disabled={!districtUnlocked || state.resources.credits < housing.cost} onClick={() => onBuy(housing.id)}>
                Buy
              </button>
            )}
          </article>
        );
      })}
    </section>
  );
}

function GarageSection({
  state,
  onBuy,
  onSetVehicle,
  onUpgradeVehicle,
}: {
  state: GameState;
  onBuy: (id: string) => void;
  onSetVehicle: (id: string) => void;
  onUpgradeVehicle: (id: string) => void;
}) {
  const ownedCount = Object.values(state.ownedVehicles).filter(Boolean).length;
  return (
    <section className="stack">
      <article className="panel">
        <p className="eyebrow">Garage slots</p>
        <h2>{ownedCount} / {garageSlots(state)}</h2>
        <p className="muted">Only one active vehicle applies bonuses at a time. Housing can add garage slots.</p>
      </article>
      {vehicles.map((vehicle) => {
        const owned = Boolean(state.ownedVehicles[vehicle.id]);
        const active = state.activeVehicle === vehicle.id;
        const level = state.vehicleUpgradeLevels[vehicle.id] ?? 0;
        const canBuy = !owned && ownedCount < garageSlots(state);
        return (
          <article className={`action-card vertical rarity-${vehicle.rarity.toLowerCase()}`} key={vehicle.id}>
            <div>
              <p className="eyebrow">{vehicle.rarity} / {districts.find((district) => district.id === vehicle.districtId)?.name}</p>
              <h3>{vehicle.name} {owned ? `+${level}` : ""}</h3>
              <p className="muted">{vehicle.sourceHint}</p>
              <p className="fine">Unlock: {vehicle.unlockRequirements.join(", ")}</p>
              <p className="fine">Cost: {formatRewards(vehicle.cost)}</p>
              <p className="fine">Speed {vehicle.stats.speed}, Armor {vehicle.stats.armor}, Storage {vehicle.stats.storage}, Stealth {vehicle.stats.stealth}</p>
              <p className="fine">Heat Reduction {vehicle.stats.heatReduction}%, Job Efficiency {vehicle.stats.jobEfficiency}%, Smuggling Bonus {vehicle.stats.smugglingRewardBonus}%</p>
              <p className="fine">Active bonus: +2% action speed, {modifierSummary(vehicle.passiveModifiers)}</p>
            </div>
            <div className="card-list compact">
              {owned ? (
                <>
                  <button className="primary-button full" disabled={active} onClick={() => onSetVehicle(vehicle.id)}>
                    {active ? "Active" : "Set Active"}
                  </button>
                  <button className="secondary-button full" disabled={level >= vehicle.maxUpgradeLevel} onClick={() => onUpgradeVehicle(vehicle.id)}>
                    {level >= vehicle.maxUpgradeLevel ? "Max Upgrade" : "Upgrade"}
                  </button>
                </>
              ) : (
                <button className="primary-button full" disabled={!canBuy} onClick={() => onBuy(vehicle.id)}>
                  Buy
                </button>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function CompanionsSection({
  state,
  onGift,
  onSpendTime,
  onSetCompanion,
}: {
  state: GameState;
  onGift: (id: string) => void;
  onSpendTime: (id: string) => void;
  onSetCompanion: (id: string) => void;
}) {
  return (
    <section className="stack">
      {companions.map((companion) => {
        const companionState = state.companions[companion.id];
        return (
          <article className="action-card vertical" key={companion.id}>
            <div>
              <p className="eyebrow">{companion.role} / {companion.romanceEligible ? "Friendship or romance route" : "Friendship route"}</p>
              <h2>{companion.name}</h2>
              <p className="muted">{companion.passiveBonus}</p>
              <p className="fine">District: {districts.find((district) => district.id === companion.districtId)?.name}</p>
              <p className="fine">Faction: {factions.find((faction) => faction.id === companion.factionId)?.name}</p>
              <p className="fine">Relationship {companionState?.relationship ?? 0} / 100 {state.activeCompanion === companion.id ? "/ Active" : ""}</p>
              <p className="fine">Gifts: {companion.preferredGiftTypes.join(", ")}</p>
              <p className="fine">Quest: {companion.questPlaceholder}</p>
              {!companionState?.unlocked && <p className="fine">Unlock: {companion.unlockRequirements.join(", ")}</p>}
            </div>
            <div className="card-list compact">
              <button className="primary-button full" disabled={!companionState?.unlocked || state.resources.credits < 25} onClick={() => onGift(companion.id)}>
                Gift 25
              </button>
              <button className="secondary-button full" disabled={!companionState?.unlocked || state.resources.credits < 15} onClick={() => onSpendTime(companion.id)}>
                Spend Time
              </button>
              <button className="secondary-button full" disabled={!companionState?.unlocked || state.activeCompanion === companion.id} onClick={() => onSetCompanion(companion.id)}>
                Set Active
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function CollectionSection({ state }: { state: GameState }) {
  const discoveredDrops = Object.values(state.enemyLog).reduce(
    (sum, log) => sum + Object.keys(log.discoveredDrops).length,
    0,
  );
  const kills = Object.values(state.enemyLog).reduce((sum, log) => sum + log.kills, 0);
  const discovered = Object.keys(state.discoveredItems).map((id) => getItem(id)).filter(Boolean);
  return (
    <article className="panel">
      <p className="eyebrow">Long-term logs</p>
      <h2>Collection</h2>
      <div className="inventory-grid">
        <Metric label="Enemy Kills" value={kills} />
        <Metric label="Drop Entries" value={discoveredDrops} />
        <Metric label="Owned Homes" value={Object.values(state.ownedHousing).filter(Boolean).length} />
        <Metric label="Unlocked Companions" value={Object.values(state.companions).filter((entry) => entry.unlocked).length} />
        <Metric label="Cyberware" value={discovered.filter((item) => item?.type === "Cyberware").length} />
        <Metric label="Weapons" value={discovered.filter((item) => item?.type === "Weapon").length} />
        <Metric label="Armor" value={discovered.filter((item) => item?.type === "Armor").length} />
        <Metric label="Blueprints" value={discovered.filter((item) => item?.type === "Blueprint").length} />
        <Metric label="Local gigs" value={rpgSideGigs.reduce((sum, gig) => sum + (state.rpg.completed[gig.id]?.clears ?? 0), 0)} />
        <Metric label="Main jobs" value={campaignProgress(state).cleared} />
        <Metric label="Vehicles" value={Object.values(state.ownedVehicles).filter(Boolean).length} />
        <Metric label="Achievements" value={Object.values(state.achievements).filter(Boolean).length} />
      </div>
    </article>
  );
}

type EndgameTab = "legend" | "challenges" | "legacy" | "collection" | "prestige";
type ProgressDropdownId = "endgame" | "goals" | "collection" | "districts" | "operations" | "bosses" | "log";

const PROGRESS_DROPDOWN_KEY = "neon-row-idle-progress-dropdowns";
const defaultProgressDropdowns: Record<ProgressDropdownId, boolean> = {
  endgame: true,
  goals: true,
  collection: true,
  districts: true,
  operations: false,
  bosses: false,
  log: false,
};

type UpdateGame = (update: (state: GameState) => GameState) => void;

function ProgressTab({ state, onUpdate }: { state: GameState; onUpdate: UpdateGame }) {
  const [endgameTab, setEndgameTab] = useState<EndgameTab>("legend");
  const [openSections, setOpenSections] = useState<Record<ProgressDropdownId, boolean>>(loadProgressDropdowns);

  const setSectionOpen = (id: ProgressDropdownId, open: boolean) => {
    setOpenSections((current) => {
      const next = { ...current, [id]: open };
      saveProgressDropdowns(next);
      return next;
    });
  };

  return (
    <section className="stack progress-stack">
      <CampaignPanel state={state} />
      <ProgressDropdown id="endgame" title="Street Legend" eyebrow="Long-term account progression" open={openSections.endgame} onOpenChange={setSectionOpen}>
        <EndgameSection state={state} activeTab={endgameTab} onTab={setEndgameTab} onUpdate={onUpdate} />
      </ProgressDropdown>
      <ProgressDropdown id="goals" title="Progression Goals" eyebrow="Tiers, mastery pools, build milestones" open={openSections.goals} onOpenChange={setSectionOpen}>
        <GoalsSection state={state} />
      </ProgressDropdown>
      <ProgressDropdown id="collection" title="Collection" eyebrow="Long-term logs and discovered content" open={openSections.collection} onOpenChange={setSectionOpen}>
        <CollectionSection state={state} />
      </ProgressDropdown>
      <ProgressDropdown id="districts" title="District Progress" eyebrow="City completion by district" open={openSections.districts} onOpenChange={setSectionOpen}>
        <DistrictProgressPanel state={state} />
      </ProgressDropdown>
      <ProgressDropdown id="log" title="Event Log" eyebrow="Recent world and reward messages" open={openSections.log} onOpenChange={setSectionOpen}>
        <RecentLog state={state} />
      </ProgressDropdown>
    </section>
  );
}

function ProgressDropdown({
  id,
  title,
  eyebrow,
  open,
  onOpenChange,
  children,
}: {
  id: ProgressDropdownId;
  title: string;
  eyebrow: string;
  open: boolean;
  onOpenChange: (id: ProgressDropdownId, open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <details className="progress-dropdown" open={open} onToggle={(event) => onOpenChange(id, event.currentTarget.open)}>
      <summary>
        <span>
          <em>{eyebrow}</em>
          <strong>{title}</strong>
        </span>
        <b>{open ? "Hide" : "Show"}</b>
      </summary>
      <div className="progress-dropdown-body">{children}</div>
    </details>
  );
}

type ItemIndexCategory = "Resources" | "Components" | "Cyberware" | "Weapons" | "Attachments" | "Mods" | "Armor" | "Consumables";
type ItemIndexSortMode = "name" | "rarity" | "price" | "tier" | "requiredLevel" | "owned" | "category" | "slot" | "instability" | "damage" | "armor";
type ItemIndexSortDirection = "asc" | "desc";

const itemIndexCategories: ItemIndexCategory[] = ["Resources", "Components", "Cyberware", "Weapons", "Attachments", "Mods", "Armor", "Consumables"];
const itemIndexSortModes: ItemIndexSortMode[] = ["name", "rarity", "price", "tier", "requiredLevel", "owned", "category", "slot", "instability", "damage", "armor"];
const itemIndexValidation = getContentValidationReport();

function ItemIndexPanel({ state }: { state: GameState }) {
  const [category, setCategory] = useState<ItemIndexCategory>("Resources");
  const [secondary, setSecondary] = useState("All");
  const [sortMode, setSortMode] = useState<ItemIndexSortMode>("rarity");
  const [sortDirection, setSortDirection] = useState<ItemIndexSortDirection>("desc");
  const [query, setQuery] = useState("");
  const [showHidden, setShowHidden] = useState(isDevBuild);
  const [showIds, setShowIds] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const categoryItems = items.filter((item) => itemIndexCategoryFor(item) === category);
  const secondaryOptions = itemIndexSecondaryFilters(category, categoryItems);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = categoryItems
    .filter((item) => secondary === "All" || itemIndexSecondaryValue(item, category) === secondary)
    .filter((item) => showHidden || itemDiscoveredForIndex(state, item))
    .filter((item) => !normalizedQuery || itemIndexSearchText(item, state).includes(normalizedQuery));
  const sorted = [...filtered].sort((left, right) => itemIndexSortValue(left, state, sortMode).localeCompare(itemIndexSortValue(right, state, sortMode), undefined, { numeric: true }) * (sortDirection === "asc" ? 1 : -1) || left.name.localeCompare(right.name));
  const activeId = selectedId && sorted.some((item) => item.id === selectedId) ? selectedId : sorted[0]?.id ?? null;
  const selectedItem = activeId ? getItem(activeId) : undefined;
  const ownedCount = categoryItems.filter((item) => getOwnedCount(state, item.id) > 0).length;
  const discoveredCount = categoryItems.filter((item) => itemDiscoveredForIndex(state, item)).length;
  const rarityCounts = categoryItems.reduce<Record<string, number>>((counts, item) => ({ ...counts, [item.rarity]: (counts[item.rarity] ?? 0) + 1 }), {});

  return (
    <NeonPanel>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Database / Balancing Review</p>
          <h2>Item Index</h2>
        </div>
        <FileText size={22} />
      </div>
      <div className="item-index-summary">
        <Metric label="Total" value={items.length} />
        <Metric label={category} value={categoryItems.length} />
        <Metric label="Owned" value={ownedCount} />
        <Metric label="Discovered" value={discoveredCount} />
      </div>
      <div className="item-index-rarity-row">
        {Object.entries(rarityCounts).map(([rarity, count]) => <span key={rarity} className={`rarity-pill rarity-${rarity.toLowerCase()}`}>{rarity} {count}</span>)}
      </div>
      <div className="inventory-filter-row item-index-tabs">
        {itemIndexCategories.map((entry) => (
          <button key={entry} className={category === entry ? "active" : ""} onClick={() => { setCategory(entry); setSecondary("All"); setSelectedId(null); }}>
            {entry}
          </button>
        ))}
      </div>
      <div className="item-index-controls">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, slot, rarity, tags, source..." aria-label="Search item index" />
        <select value={secondary} onChange={(event) => { setSecondary(event.target.value); setSelectedId(null); }}>
          {secondaryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <button className="inventory-sort-cycle" onClick={() => setSortMode((current) => itemIndexSortModes[(itemIndexSortModes.indexOf(current) + 1) % itemIndexSortModes.length])}>
          Sort: {titleCase(sortMode)}
        </button>
        <button className="inventory-sort-direction" aria-label="Reverse item index sort" onClick={() => setSortDirection((current) => current === "asc" ? "desc" : "asc")}>
          {sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        </button>
        <button className={`secondary-button ${showHidden ? "active" : ""}`} onClick={() => setShowHidden((value) => !value)}>Hidden Data</button>
        <button className={`secondary-button ${showIds ? "active" : ""}`} onClick={() => setShowIds((value) => !value)}>IDs</button>
      </div>
      <div className="item-index-layout">
        <div className="item-slot-grid item-index-grid">
          {sorted.length ? sorted.map((item) => (
            <ItemIndexCard key={item.id} item={item} state={state} active={activeId === item.id} showIds={showIds} onSelect={() => setSelectedId(item.id)} />
          )) : <p className="muted">No items match this filter.</p>}
        </div>
        <ItemIndexDetailPanel state={state} item={selectedItem} showIds={showIds} showHidden={showHidden} />
      </div>
    </NeonPanel>
  );
}

function ItemIndexCard({ item, state, active, showIds, onSelect }: { item: ItemDefinition; state: GameState; active: boolean; showIds: boolean; onSelect: () => void }) {
  const owned = getOwnedCount(state, item.id);
  const discovered = itemDiscoveredForIndex(state, item);
  return (
    <button className={`inventory-slot item-index-card ${active ? "active" : ""} rarity-${item.rarity.toLowerCase()} ${!discovered ? "undiscovered-card" : ""}`} onClick={onSelect}>
      <EquipmentTypeIconBadge item={item} />
      <strong>{discovered ? item.name : "Unknown Item"}</strong>
      <span>{item.rarity} / {itemIndexTypeLabel(item)}</span>
      <span>Owned {owned.toLocaleString()} / Value {item.sellValue.toLocaleString()}</span>
      <span>{itemIndexMainStat(item)}</span>
      {showIds && <em>{item.id}</em>}
    </button>
  );
}

function ItemIndexDetailPanel({ state, item, showIds, showHidden }: { state: GameState; item?: ItemDefinition; showIds: boolean; showHidden: boolean }) {
  if (!item) return <article className="panel item-index-detail"><p className="muted">Select an item to inspect full database details.</p></article>;
  const sources = getItemSources(item.id, state);
  const craftRecipes = recipes.filter((recipe) => recipe.outputItemId === item.id);
  const usedIn = recipes.filter((recipe) => Object.prototype.hasOwnProperty.call(recipe.inputCosts, item.id));
  const warnings = itemIndexWarnings(item.id);
  const discovered = itemDiscoveredForIndex(state, item);
  const owned = getOwnedCount(state, item.id);
  return (
    <article className={`panel item-index-detail rarity-${item.rarity.toLowerCase()}`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{item.rarity} / {item.type} / Owned {owned.toLocaleString()}</p>
          <h2>{discovered || showHidden ? item.name : "Unknown Item"}</h2>
        </div>
        <EquipmentTypeIconBadge item={item} />
      </div>
      {(discovered || showHidden) ? (
        <>
          <p className="muted">{item.description}</p>
          <div className="item-index-chip-row">
            <span>{itemIndexTypeLabel(item)}</span>
            {item.slot && <span>Slot {titleCase(item.slot)}</span>}
            {item.tier && <span>Tier {item.tier}</span>}
            {item.slot && <span>Requires {itemAttributeRequirement(item).label}</span>}
            {item.type === "Cyberware" && <span>IN {formatSigned(cyberwareInstabilityLoad(item))}</span>}
            <span>Sell {item.sellValue.toLocaleString()}</span>
          </div>
          {item.stats && <DetailSection title="Stats" lines={[formatStats(item.stats)]} />}
          {item.modifiers && <DetailSection title="Modifiers" lines={[formatItemModifiers(item.modifiers)]} />}
          {item.specialEffect && <DetailSection title="Special" lines={[item.specialEffect]} />}
          {item.weaponClass && <DetailSection title="Weapon Profile" lines={[`Class: ${weaponClassLabel(item.weaponClass)}`, `Attachment slots: ${item.attachmentSlots?.map(titleCase).join(", ") || "None"}`, `Mod slots: ${item.modSlots ?? 0}`]} />}
          {item.compatibleWeaponClasses?.length ? <DetailSection title="Compatibility" lines={[item.compatibleWeaponClasses.map(weaponClassLabel).join(", ")]} /> : null}
          {craftRecipes.length ? <DetailSection title="Crafting Recipe" lines={craftRecipes.map((recipe) => `${recipe.name}: ${formatItemCost(recipe.inputCosts)} / ${skillNames[recipe.requiredSkill]} ${recipe.requiredLevel}`)} /> : null}
          <DetailSection title="Sources" lines={sources.map((source) => `${source.type}: ${source.name} - ${source.detail}${source.requirement ? ` (${source.requirement})` : ""}`)} />
          <DetailSection title="Used In" lines={usedIn.length ? usedIn.map((recipe) => `${recipe.name}: requires ${(recipe.inputCosts[item.id] ?? 0).toLocaleString()}`) : ["No recipe use found yet."]} />
          <DetailSection title="Tags" lines={[item.tags.join(", ") || "None"]} />
          {showIds && <DetailSection title="Developer" lines={[`ID: ${item.id}`, `Source hint: ${item.sourceHint}`, `Stackable: ${item.stackable ? "Yes" : "No"}`, `Validation: ${warnings.length ? warnings.join(" / ") : "Clean"}`]} />}
        </>
      ) : (
        <p className="muted">This item has not been discovered yet. Enable Hidden Data to review its full stats and sources.</p>
      )}
    </article>
  );
}

function DetailSection({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="item-index-detail-section">
      <p className="eyebrow">{title}</p>
      {lines.map((line) => <span key={line}>{line}</span>)}
    </div>
  );
}

function itemIndexCategoryFor(item: ItemDefinition): ItemIndexCategory | null {
  if (item.id in resourceNames) return "Resources";
  if (item.type === "Material" || item.type === "Component") return "Components";
  if (item.type === "Cyberware") return "Cyberware";
  if (item.type === "Weapon") return "Weapons";
  if (item.type === "WeaponAttachment") return "Attachments";
  if (item.type === "WeaponMod") return "Mods";
  if (item.type === "Armor") return "Armor";
  if (item.type === "Consumable") return "Consumables";
  return null;
}

function itemIndexSecondaryFilters(category: ItemIndexCategory, categoryItems: ItemDefinition[]) {
  const values = categoryItems.map((item) => itemIndexSecondaryValue(item, category)).filter(Boolean);
  return ["All", ...Array.from(new Set(values)).sort()];
}

function itemIndexSecondaryValue(item: ItemDefinition, category: ItemIndexCategory) {
  if (category === "Cyberware") return item.slot ? titleCase(item.slot) : "Utility";
  if (category === "Weapons") return item.weaponClass ? weaponClassLabel(item.weaponClass) : "Unknown Class";
  if (category === "Armor") return item.slot ? armorSlotLabel(item.slot) : "Unknown Slot";
  if (category === "Components") return componentTierLabel(item);
  if (category === "Attachments") return item.attachmentCategory ? titleCase(item.attachmentCategory) : "Attachment";
  if (category === "Mods") return item.compatibleWeaponClasses?.[0] ? weaponClassLabel(item.compatibleWeaponClasses[0]) : "Universal";
  return item.type;
}

function itemIndexSearchText(item: ItemDefinition, state: GameState) {
  const sourceNames = getItemSources(item.id, state).map((source) => `${source.type} ${source.name} ${source.detail}`).join(" ");
  return [item.name, item.description, item.type, item.rarity, item.slot, item.weaponClass, item.attachmentCategory, item.sourceHint, item.tags.join(" "), sourceNames].filter(Boolean).join(" ").toLowerCase();
}

function itemIndexSortValue(item: ItemDefinition, state: GameState, sortMode: ItemIndexSortMode) {
  const numeric = (value: number) => value.toString().padStart(10, "0");
  if (sortMode === "name") return item.name;
  if (sortMode === "rarity") return numeric(inventoryRarityRanks[item.rarity] ?? 0);
  if (sortMode === "price") return numeric(item.sellValue);
  if (sortMode === "tier") return numeric(item.tier ?? 0);
  if (sortMode === "requiredLevel") return numeric(item.requiredLevel ?? 0);
  if (sortMode === "owned") return numeric(getOwnedCount(state, item.id));
  if (sortMode === "category") return itemIndexCategoryFor(item) ?? item.type;
  if (sortMode === "slot") return item.slot ?? item.weaponClass ?? item.type;
  if (sortMode === "instability") return numeric(item.type === "Cyberware" ? cyberwareInstabilityLoad(item) + 1000 : 0);
  if (sortMode === "damage") return numeric(item.stats?.damage ?? 0);
  if (sortMode === "armor") return numeric(item.stats?.armor ?? 0);
  return item.name;
}

function itemDiscoveredForIndex(state: GameState, item: ItemDefinition) {
  return Boolean(item.discovered || state.discoveredItems[item.id] || getOwnedCount(state, item.id) > 0 || item.id in resourceNames);
}

function itemIndexTypeLabel(item: ItemDefinition) {
  if (item.type === "Weapon") return item.weaponClass ? weaponClassLabel(item.weaponClass) : "Weapon";
  if (item.type === "Armor") return item.slot ? armorSlotLabel(item.slot) : "Armor";
  if (item.type === "Cyberware") return item.slot ? titleCase(item.slot) : "Cyberware";
  if (item.type === "WeaponAttachment") return item.attachmentCategory ? `${titleCase(item.attachmentCategory)} Attachment` : "Attachment";
  if (item.type === "WeaponMod") return "Weapon Mod";
  return item.type;
}

function itemIndexMainStat(item: ItemDefinition) {
  if (item.type === "Cyberware") return item.modifiers ? formatItemModifiers(item.modifiers).split(", ")[0] : `IN ${formatSigned(cyberwareInstabilityLoad(item))}`;
  if (item.type === "Weapon") return `Damage ${item.stats?.damage ?? 0} / Speed ${item.stats?.attackSpeed ?? 0}`;
  if (item.type === "Armor") return `Armor ${item.stats?.armor ?? 0} / HP ${item.stats?.maxHp ?? 0}`;
  if (item.type === "Consumable") return item.useEffect ? `Use: ${titleCase(item.useEffect)}` : "Consumable";
  return item.sourceHint;
}

function componentTierLabel(item: ItemDefinition) {
  if (item.rarity === "Prototype") return "Prototype";
  if (item.rarity === "Relic" || item.rarity === "Legendary") return "Relic";
  if ((item.tier ?? 1) >= 4 || item.rarity === "Epic") return "Advanced";
  if ((item.tier ?? 1) >= 2 || item.rarity === "Rare") return "Rare";
  if (item.rarity === "Uncommon") return "Refined";
  return "Basic";
}

function armorSlotLabel(slot: CyberwareSlot | GearSlot) {
  if (slot === "accessory1" || slot === "accessory2") return "Accessory";
  return titleCase(slot);
}

function weaponClassLabel(id: WeaponClassId) {
  return weaponClasses.find((weaponClass) => weaponClass.id === id)?.name ?? titleCase(id);
}

function itemIndexWarnings(itemId: string) {
  return [
    ...itemIndexValidation.warnings,
    ...itemIndexValidation.missingReferences,
    ...itemIndexValidation.duplicateIds,
    ...itemIndexValidation.balanceWarnings,
  ].filter((warning) => warning.toLowerCase().includes(itemId.toLowerCase()));
}

function loadProgressDropdowns(): Record<ProgressDropdownId, boolean> {
  try {
    const raw = localStorage.getItem(PROGRESS_DROPDOWN_KEY);
    if (!raw) return defaultProgressDropdowns;
    return { ...defaultProgressDropdowns, ...JSON.parse(raw) };
  } catch {
    return defaultProgressDropdowns;
  }
}

function saveProgressDropdowns(value: Record<ProgressDropdownId, boolean>) {
  try {
    localStorage.setItem(PROGRESS_DROPDOWN_KEY, JSON.stringify(value));
  } catch {
    // UI preference only; ignore storage failures.
  }
}

function DistrictProgressPanel({ state }: { state: GameState }) {
  return (
    <NeonPanel>
      <h2>District Progress</h2>
      <div className="card-list">
        {cityDistrictOrder.map((districtId) => {
          const district = getDistrict(districtId)!;
          const completion = districtCompletionBreakdown(state, districtId);
          return (
            <ActivityCard key={districtId} locked={!state.districts[districtId]?.unlocked}>
              <div>
                <p className="eyebrow">{state.districts[districtId]?.unlocked ? "Unlocked" : "Locked"} / Standing {state.districtStanding[districtId]?.standing ?? 0}</p>
                <h3>{district.name}</h3>
                <Progress value={completion.total} label={`${completion.total}% complete`} />
                <p className="fine">Combat {completion.combat}% / Jobs {completion.jobs}% / Collection {completion.collection}% / Services {completion.services}%</p>
                <p className="fine">Housing {completion.housing}% / Factions {completion.factions}% / Main jobs {completion.operations}% / Vendors {completion.vendors}%</p>
              </div>
            </ActivityCard>
          );
        })}
      </div>
    </NeonPanel>
  );
}

function EndgameSection({ state, activeTab, onTab, onUpdate }: { state: GameState; activeTab: EndgameTab; onTab: (tab: EndgameTab) => void; onUpdate: UpdateGame }) {
  const legend = streetLegendRankProgress(state);
  const nextMilestone = nextStreetLegendMilestone(state.streetLegend.rank);
  return (
    <NeonPanel>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Long-term account progression</p>
          <h2>Street Legend</h2>
        </div>
        <span className="status-chip">Rank {state.streetLegend.rank}</span>
      </div>
      <Progress value={(legend.xp / Math.max(1, legend.nextXp)) * 100} label={`${legend.xp} / ${legend.nextXp} XP`} />
      <p className="fine">Total Legend XP {state.streetLegend.totalXp.toLocaleString()} / Next milestone {nextMilestone ? `Rank ${nextMilestone.rank}: ${nextMilestone.name}` : "All listed milestones complete"}</p>
      <div className="inventory-filter-row endgame-tabs">
        {(["legend", "challenges", "legacy", "collection", "prestige"] as EndgameTab[]).map((tab) => (
          <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => onTab(tab)}>
            {titleCase(tab)}
          </button>
        ))}
      </div>
      {activeTab === "legend" && <LegendPanel state={state} />}
      {activeTab === "challenges" && <ChallengesPanel state={state} />}
      {activeTab === "legacy" && <LegacyCraftingPanel state={state} onUpdate={onUpdate} />}
      {activeTab === "collection" && <CollectionRewardsPanel state={state} onUpdate={onUpdate} />}
      {activeTab === "prestige" && <PrestigePanel state={state} onUpdate={onUpdate} />}
    </NeonPanel>
  );
}

function CampaignPanel({ state }: { state: GameState }) {
  const campaign = campaignProgress(state);
  return <article className="panel">
    <p className="eyebrow">Main missions / Afterimage</p>
    <h2>{campaign.complete ? "Your story is complete" : "From Neon Row to Skyline Core"}</h2>
    <p className="muted">Main jobs open districts and award major payouts and unique equipment. Replay local gigs for money, supplies, and rotating item rewards.</p>
    <Progress value={campaign.cleared / campaign.total * 100} label={`${campaign.cleared} / ${campaign.total} main jobs cleared`} />
    <div className="requirement-list">{rpgMissions.map(mission => <div className={`requirement-row ${state.rpg.completed[mission.id] ? "met" : "missing"}`} key={mission.id}><span>{mission.title} / {getDistrict(mission.district)?.name}</span><strong>{state.rpg.completed[mission.id] ? "Completed" : mission.id === campaign.next ? "Next objective" : "Pending"}</strong></div>)}</div>
  </article>;
}

function LegendPanel({ state }: { state: GameState }) {
  return (
    <div className="stack compact-stack">
      <div className="inventory-grid">
        <Metric label="Legend Rank" value={state.streetLegend.rank} />
        <Metric label="Challenge Tiers" value={state.endgameStatistics.challengeContractsCompleted} />
        <Metric label="Main jobs" value={campaignProgress(state).cleared} />
        <Metric label="Local gig clears" value={rpgSideGigs.reduce((sum, gig) => sum + (state.rpg.completed[gig.id]?.clears ?? 0), 0)} />
      </div>
      <div className="card-list">
        {streetLegendMilestones.map((milestone) => (
          <ActivityCard key={milestone.rank} locked={state.streetLegend.rank < milestone.rank}>
            <div>
              <p className="eyebrow">Rank {milestone.rank} / {state.streetLegend.claimedMilestones[milestone.rank] ? "Unlocked" : "Locked"}</p>
              <h3>{milestone.name}</h3>
              <p className="fine">{milestone.description}</p>
            </div>
          </ActivityCard>
        ))}
      </div>
    </div>
  );
}

function ChallengesPanel({ state }: { state: GameState }) {
  return (
    <div className="card-list">
      {challengeContracts.map((challenge) => (
        <article className="action-card vertical" key={challenge.id}>
          <div>
            <p className="eyebrow">{challenge.districtId ? getDistrict(challenge.districtId)?.name : "Account"} / Challenge</p>
            <h3>{challenge.name}</h3>
            <p className="muted">{challenge.description}</p>
          </div>
          <div className="challenge-tier-list">
            {challenge.tiers.map((tier) => {
              const progress = challengeObjectiveProgress(state, tier.objective);
              const complete = Boolean(state.challengeProgress[challenge.id]?.completedTiers[tier.tier]);
              return (
                <div className={`challenge-tier ${complete ? "complete" : ""}`} key={tier.tier}>
                  <strong>{tier.tier}</strong>
                  <span>{challengeObjectiveText(tier.objective)}</span>
                  <em>{Math.min(progress.current, progress.target).toLocaleString()} / {progress.target.toLocaleString()}</em>
                  <b>{tier.streetLegendXp} Legend XP</b>
                </div>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}

function LegacyCraftingPanel({ state, onUpdate }: { state: GameState; onUpdate: UpdateGame }) {
  return (
    <div className="card-list">
      {legacyCraftingGoals.map((goal) => (
        <ActivityCard key={goal.id} locked={!canAssembleLegacy(state, goal.id)}>
          <div>
            <p className="eyebrow">{goal.category}</p>
            <h3>{goal.name}</h3>
            <p className="fine">Requirements: {goal.requirements.join(", ")}</p>
            <p className="fine">Produces {goal.id === "legacy-reflex-core" ? "Reflex Spine: Ghostline" : goal.id === "legacy-blacknet-processor" ? "Null Eye" : "12 Prototype Drive Units"}.</p>
            <div className="requirement-list">
              {Object.entries(goal.materials).map(([id, amount]) => (
                <span key={id} className={`requirement-row ${getOwnedCount(state, id) < amount ? "missing" : ""}`}>
                  {getItem(id)?.name ?? resourceNames[id as ResourceId] ?? id}
                  <strong>{getOwnedCount(state, id).toLocaleString()} / {amount.toLocaleString()}</strong>
                </span>
              ))}
            </div>
            <button className="primary-button" disabled={!canAssembleLegacy(state, goal.id)} onClick={() => onUpdate(current => assembleLegacy(current, goal.id))}>Assemble</button>
          </div>
        </ActivityCard>
      ))}
      {iconicCyberwareGoals.map((goal) => (
        <ActivityCard key={goal.id} locked={state.streetLegend.rank < 30}>
          <div>
            <p className="eyebrow">Iconic Cyberware / {goal.slot}</p>
            <h3>{goal.name}</h3>
            <p className="fine">IN Load +{goal.instabilityLoad} / Source: {goal.source}</p>
            <p className="fine">Requirements: {goal.requirements.join(", ")}</p>
          </div>
        </ActivityCard>
      ))}
    </div>
  );
}

function CollectionRewardsPanel({ state, onUpdate }: { state: GameState; onUpdate: UpdateGame }) {
  const percent = collectionPercent(state);
  return (
    <div className="stack compact-stack">
      <Progress value={percent} label={`${percent}% item collection discovered`} />
      <div className="card-list compact">
        {collectionRewardMilestones.map((milestone) => (
          <ActivityCard key={milestone.percent} locked={percent < milestone.percent}>
            <div>
              <p className="eyebrow">{milestone.percent}% Collection</p>
              <h3>{percent >= milestone.percent ? "Unlocked" : "Locked"}</h3>
              <p className="fine">{milestone.reward}</p>
              <button className="secondary-button" disabled={percent < milestone.percent || state.collectionRewardsClaimed[milestone.percent]} onClick={() => onUpdate(current => claimCollectionReward(current, milestone.percent))}>{state.collectionRewardsClaimed[milestone.percent] ? "Claimed" : "Claim reward"}</button>
            </div>
          </ActivityCard>
        ))}
      </div>
    </div>
  );
}

function PrestigePanel({ state, onUpdate }: { state: GameState; onUpdate: UpdateGame }) {
  return (
    <div className="stack compact-stack">
      <div className="inventory-grid">
        <Metric label="Unlocked" value={state.prestigeProtocol.unlocked ? 1 : 0} />
        <Metric label="Prestige Count" value={state.endgameStatistics.prestigeCount} />
        <Metric label="Skill 150s" value={Object.values(state.skills).filter((skill) => skill.level >= MAX_MAIN_SKILL_LEVEL).length} />
        <Metric label="District 99s" value={Object.values(state.districtMastery).filter((mastery) => mastery.level >= 99).length} />
      </div>
      <TerminalLog>
        {prestigeProtocolNotes.map((note) => <p key={note}>{note}</p>)}
      </TerminalLog>
      <div className="card-list">
        {skillOrder.map(skill => <div className="action-card" key={skill}>
          <div><strong>{skillNames[skill]}</strong><p className="fine">Level {state.skills[skill].level} / Permanent XP bonus +{(state.prestigeProtocol.skillPrestiges[skill] ?? 0) * 10}%</p></div>
          <button className="secondary-button" disabled={!state.prestigeProtocol.unlocked || state.skills[skill].level < 150} onClick={() => {
            if (window.confirm(`Reset ${skillNames[skill]} to level 1 for permanent +10% XP? Your equipment, city access and story progress are kept.`)) onUpdate(current => prestigeSkill(current, skill));
          }}>Prestige to level 1</button>
        </div>)}
      </div>
    </div>
  );
}

function SimCacheSection({ state, onRun }: { state: GameState; onRun: (count: number) => void }) {
  const eligibility = simCacheEligibility(state);
  const efficiency = getSimulationEfficiency(state);
  const cacheCount = state.inventory["basic-sim-cache"] ?? 0;
  const current = state.activeAction
    ? skillActions.find((action) => action.id === state.activeAction?.actionId)?.name
    : state.activeCraft
      ? recipes.find((recipe) => recipe.id === state.activeCraft?.recipeId)?.name
      : state.currentCombat
        ? "Combat target"
        : state.activeJob
          ? "Fixer job"
          : "No activity";
  return (
    <section className="stack">
      <article className="panel">
        <p className="eyebrow">Useful QoL, not progression bypass</p>
        <h2>Sim Cache</h2>
        <div className="inventory-grid">
          <Metric label="Basic Sim Caches" value={cacheCount} />
          <Metric label="Minutes Each" value={5} />
          <Metric label="Mastery Efficiency" value={efficiency.masteryXp * 100} />
          <Metric label="Rare Drop Efficiency" value={efficiency.rareDrops * 100} />
        </div>
        <p className="muted">Current activity: {current}</p>
        <p className="fine">Eligibility: {eligibility.reason}</p>
        <p className="fine">Manual discovery required: skill actions and recipes must be completed manually once before Basic Sim Cache can repeat them.</p>
        <p className="fine">Safety: stops early for missing materials, high Heat, or high Neural Instability.</p>
        <button className="primary-button full" disabled={!eligibility.eligible || cacheCount <= 0} onClick={() => onRun(1)}>
          Simulate 5m
        </button>
      </article>
      {state.simulationRecap && (
        <article className="panel recap">
          <p className="eyebrow">Simulation recap</p>
          <h2>{state.simulationRecap.activityName}</h2>
          <div className="inventory-grid">
            <Metric label="Completions" value={state.simulationRecap.completions} />
            <Metric label="XP" value={state.simulationRecap.xpGained} />
            <Metric label="Mastery XP" value={state.simulationRecap.masteryXpGained} />
            <Metric label="Pool XP" value={state.simulationRecap.poolXpGained} />
            <Metric label="Heat" value={state.simulationRecap.heatChange} />
            <Metric label="IN" value={state.simulationRecap.neuralInstabilityChange} />
          </div>
          <p className="fine">Resources: {formatRewards(state.simulationRecap.resourcesGained)}</p>
          <p className="fine">Drops: {Object.entries(state.simulationRecap.dropsGained).map(([id, amount]) => `${amount} ${getItem(id)?.name ?? id}`).join(", ") || "None"}</p>
          <p className="fine">Stopped: {state.simulationRecap.stoppedReason}</p>
        </article>
      )}
    </section>
  );
}

function GoalsSection({ state }: { state: GameState }) {
  return (
    <section className="stack">
      <article className="panel">
        <p className="eyebrow">Balanced by progression tiers, not exact time played</p>
        <h2>Progression Goals</h2>
        <div className="card-list">
          {progressionTiers.map((tier) => {
            const progress = tierProgress(state, tier.id);
            return (
              <article className="action-card vertical" key={tier.id}>
                <div>
                  <p className="eyebrow">{progress.complete}/{progress.total}</p>
                  <h3>{tier.name}</h3>
                  <p className="fine">{tier.goals.join(", ")}</p>
                </div>
                <Progress value={(progress.complete / Math.max(1, progress.total)) * 100} />
              </article>
            );
          })}
        </div>
      </article>
      <article className="panel">
        <h2>Mastery Pools</h2>
        <div className="card-list">
          {skillOrder.map((skill) => {
            const percent = masteryPoolPercent(state, skill);
            return (
              <article className="action-card vertical" key={skill}>
                <div>
                  <p className="eyebrow">{skillNames[skill]}</p>
                  <h3>{percent}% Pool</h3>
                  <p className="fine">Checkpoints: {masteryPoolCheckpoints.join("%, ")}%</p>
                </div>
                <Progress value={percent} />
              </article>
            );
          })}
        </div>
      </article>
      <article className="panel">
        <h2>Major Progression</h2>
        <div className="inventory-grid">
          <Metric label="Local gig clears" value={rpgSideGigs.reduce((sum, gig) => sum + (state.rpg.completed[gig.id]?.clears ?? 0), 0)} />
          <Metric label="Main jobs" value={campaignProgress(state).cleared} />
          <Metric label="Vehicles Owned" value={Object.values(state.ownedVehicles).filter(Boolean).length} />
          <Metric label="Vehicle +10" value={Object.values(state.vehicleUpgradeLevels).filter((level) => level >= 10).length} />
          <Metric label="Stable Districts" value={Object.values(state.districtThreat).filter((threat) => threat.level < 25).length} />
          <Metric label="Threat Lockdowns" value={Object.values(state.districtThreat).filter((threat) => threat.level >= 100).length} />
        </div>
      </article>
      <article className="panel">
        <h2>Attribute & perk progression</h2>
        <div className="inventory-grid">
          <Metric label="Runner Level" value={state.rpg.level} />
          <Metric label="Attribute Points Available" value={state.rpg.attributePoints} />
          <Metric label="Perk Points Available" value={state.rpg.perkPoints} />
          <Metric label="Perks Owned" value={rpgPerks.filter(perk => state.rpg.perks[perk.id]).length} />
        </div>
        <div className="card-list">
          {attributeDefinitions.map(attribute => (
            <ActivityCard key={attribute.id}>
              <div>
                <h3>{attribute.name}</h3>
                <p className="fine">{attribute.bonusDescription}</p>
                <Progress value={(state.rpg.attributes[attribute.id] - 3) / 17 * 100} label={`${state.rpg.attributes[attribute.id]} / 20`} />
              </div>
            </ActivityCard>
          ))}
        </div>
      </article>
    </section>
  );
}

function OfflineRecap({ state, onClose }: { state: GameState; onClose: () => void }) {
  const recap = state.offlineRecap!;
  return (
    <div className="offline-recap-backdrop" role="presentation">
      <article className="panel recap offline-recap-modal" role="dialog" aria-modal="true" aria-labelledby="offline-recap-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Offline Progress</p>
            <h2 id="offline-recap-title">{formatAway(recap.timeAwayMs)} away</h2>
          </div>
          <button className="icon-button offline-recap-close" onClick={onClose} aria-label="Close offline progress recap">
            <X size={18} />
          </button>
        </div>
        <p className="muted">{recap.message ?? `${recap.actionName} continued while you were away.`}</p>
        <div className="inventory-grid">
          <Metric label="Completions" value={recap.completions} />
          <Metric label="XP" value={recap.xpGained} />
          <Metric label="Levels" value={recap.levelsGained} />
          <Metric label="Mastery XP" value={recap.masteryXpGained} />
          <Metric label="Heat" value={recap.heatGained} />
          <Metric label="IN" value={recap.neuralInstabilityGained} />
        </div>
        <p className="fine">Resources: {formatRewards(recap.resourcesGained)}</p>
        {Object.keys(recap.itemsGained ?? {}).length > 0 && <p className="fine">Items: {Object.entries(recap.itemsGained ?? {}).map(([id, quantity]) => `${quantity} ${getItem(id)?.name ?? id}`).join(", ")}</p>}
        <button className="primary-button full-width" onClick={onClose}>Close</button>
      </article>
    </div>
  );
}

function RecentLog({ state }: { state: GameState }) {
  return (
    <article className="panel">
      <h2>Event Log</h2>
      <div className="log-list">
        {state.recentLog.map((entry, index) => (
          <p key={`${entry.timestamp}-${index}`}>
            <b>{entry.category}</b> {entry.message}
          </p>
        ))}
      </div>
    </article>
  );
}

function TagList({ tags }: { tags: string[] }) {
  void tags;
  return null;
}

function EquipmentTypeIconBadge({ item, fallbackSlot, fallbackKind }: { item?: ReturnType<typeof getItem>; fallbackSlot?: GearSlot | CyberwareSlot; fallbackKind?: "gear" | "cyberware" }) {
  const icon = equipmentIconForItem(item, fallbackSlot, fallbackKind);
  if (!icon) return null;
  return (
    <span className={`equipment-icon-badge equipment-icon-${icon.className}`} title={icon.title} aria-label={icon.title}>
      {icon.src ? <img src={icon.src} alt="" /> : icon.label}
    </span>
  );
}

function CardActionFooter({
  active,
  progress,
  locked,
  disabled,
  startLabel,
  stopLabel,
  onStart,
  onStop,
}: {
  active: boolean;
  progress: ReturnType<typeof activityProgress> | null;
  locked?: boolean;
  disabled?: boolean;
  startLabel: string;
  stopLabel: string;
  onStart: () => void;
  onStop?: () => void;
}) {
  return (
    <div className="card-action-footer">
      {active && progress && <Progress value={progress.percent} label={`${Math.round(progress.percent)}% / ${formatDuration(progress.remainingMs)} left`} />}
      <button className={active ? "secondary-button full danger-text" : "primary-button full"} disabled={active ? !onStop : locked || disabled} onClick={active ? onStop : onStart}>
        {active ? <Square size={18} /> : <Play size={18} />}
        {active ? stopLabel : startLabel}
      </button>
    </div>
  );
}

function activityProgress(startedAt: number, durationMs: number) {
  const elapsed = Math.max(0, Date.now() - startedAt);
  return {
    percent: Math.min(100, (elapsed / Math.max(1, durationMs)) * 100),
    remainingMs: Math.max(0, durationMs - elapsed),
  };
}

function timerProgress(now: number, startedAt: number, completesAt: number) {
  const durationMs = Math.max(1, completesAt - startedAt);
  const elapsed = Math.max(0, now - startedAt);
  return {
    percent: Math.min(100, (elapsed / durationMs) * 100),
    remainingMs: Math.max(0, completesAt - now),
  };
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="stat-pill">
      <span>{label}</span>
      <strong>{typeof value === "number" ? Math.floor(value).toLocaleString() : value}</strong>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="resource-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="resource-card">
      <span>{label}</span>
      <strong>{Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)}</strong>
    </div>
  );
}

function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      {label && <span>{label}</span>}
    </div>
  );
}

function HealthBar({
  label,
  current,
  max,
  kind,
  damagePopup,
}: {
  label: string;
  current: number;
  max: number;
  kind: "player" | "enemy";
  damagePopup?: { amount: number; at: number };
}) {
  const percent = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  const showDamage = damagePopup && Date.now() - damagePopup.at < 1200;
  return (
    <div className={`health-bar health-bar-${kind} ${percent <= 25 ? "critical" : ""}`}>
      <div className="health-bar-label">
        <span>{label}</span>
        <strong>{Math.ceil(current)} / {Math.ceil(max)}</strong>
      </div>
      <div className="health-track">
        <div className="health-fill" style={{ width: `${percent}%` }} />
        {showDamage && <span key={`${damagePopup.at}-${damagePopup.amount}`} className="damage-popup">-{damagePopup.amount}</span>}
      </div>
    </div>
  );
}

function formatDuration(ms: number) {
  return `${Math.max(1, Math.round(ms / 1000))}s`;
}

function formatOneInChance(chance: number) {
  if (chance <= 0) return "Unavailable";
  return `1/${Math.max(1, Math.round(1 / chance))}`;
}

function formatAway(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatModifierSummary(modifiers: Partial<ReturnType<typeof getActiveModifiers>>) {
  const parts: string[] = [];
  Object.entries(modifiers.skillXp ?? {}).forEach(([skill, value]) => {
    if (value) parts.push(`${skillNames[skill as SkillId]} XP ${formatPercent(value)}`);
  });
  ([
    ["actionSpeed", "Action speed"],
    ["combatDamage", "Combat damage"],
    ["neuralInstabilityGain", "Instability gain"],
    ["neuralInstabilityRecovery", "Instability recovery"],
    ["upgradeCostReduction", "Upgrade cost"],
  ] as const).forEach(([key, label]) => {
    const value = modifiers[key];
    if (value) parts.push(`${label} ${formatPercent(value)}`);
  });
  return parts.join(" / ") || "Temporary support effect";
}

function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${Math.round(value * 100)}%`;
}

function formatSigned(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

function getOwnedCount(state: GameState, id: string) {
  if (id in state.resources) return state.resources[id as ResourceId];
  return state.inventory[id] ?? 0;
}

function formatItemCost(cost: Record<string, number>) {
  const parts = Object.entries(cost)
    .filter(([, amount]) => amount > 0)
    .map(([id, amount]) => `${amount.toLocaleString()} ${getItem(id)?.name ?? resourceNames[id as ResourceId] ?? id}`);
  return parts.length ? parts.join(", ") : "No cost";
}

function formatStats(stats: object) {
  const entries = Object.entries(stats).filter(([, value]) => value);
  return entries.length
    ? entries.map(([key, value]) => `${titleCase(key)} ${value! > 0 ? "+" : ""}${Number(value).toFixed(Number.isInteger(value) ? 0 : 2)}`).join(", ")
    : "None";
}

function formatItemModifiers(modifiers: Record<string, unknown>) {
  const entries = Object.entries(modifiers).filter(([, value]) => value && typeof value !== "object");
  const skillXp = modifiers.skillXp && typeof modifiers.skillXp === "object"
    ? Object.entries(modifiers.skillXp as Record<string, number>).map(([skill, value]) => `${skill} XP +${Math.round(value * 100)}%`)
    : [];
  return [...entries.map(([key, value]) => `${titleCase(key)} ${Math.round(Number(value) * 100)}%`), ...skillXp].join(", ") || "None";
}

function modifierChipLabels(modifiers: Record<string, unknown>) {
  const labels: string[] = [];
  Object.entries(modifiers).forEach(([key, value]) => {
    if (!value) return;
    if (typeof value === "object") {
      Object.entries(value as Record<string, number>).forEach(([nestedKey, nestedValue]) => {
        if (!nestedValue) return;
        labels.push(key === "skillXp"
          ? `${titleCase(nestedKey)} XP ${formatPercentModifier(nestedValue)}`
          : `${titleCase(nestedKey)} ${titleCase(key)} ${formatPercentModifier(nestedValue)}`);
      });
      return;
    }
    labels.push(`${titleCase(key)} ${formatPercentModifier(Number(value))}`);
  });
  return labels.length ? labels : ["No modifier"];
}

function affectedSystems(modifiers: Record<string, unknown>) {
  return [...new Set(Object.keys(modifiers).map((key) => {
    if (key === "skillXp") return "Skills";
    if (key.includes("combat")) return "Combat";
    if (key.includes("job") || key.includes("fixer")) return "Missions";
    if (key.includes("vehicle")) return "Garage";
    if (key.includes("crafting") || key.includes("upgrade") || key.includes("ripperdoc")) return "Crafting";
    if (key.includes("heat") || key.includes("drop") || key.includes("simulation")) return "Risk";
    return titleCase(key);
  }))];
}

function formatPercentModifier(value: number) {
  return `${value > 0 ? "+" : ""}${Math.round(value * 100)}%`;
}

function vendorRequirementHint(entry: VendorItemEntry) {
  const parts = [
    entry.requiredDistrictUnlock ? `district ${entry.requiredDistrictUnlock}` : "",
    entry.requiredUnlock ? `unlock ${entry.requiredUnlock}` : "",
    ...Object.entries(entry.requiredFactionRank ?? {}).map(([id, rank]) => `${id} rank ${rank}`),
  ].filter(Boolean);
  return parts.join(", ") || "future unlock";
}

function titleCase(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function factionRankNumber(reputation: number) {
  return Math.max(0, Math.min(10, Math.floor(reputation / 10)));
}

function factionRankLabel(reputation: number) {
  if (reputation >= 80) return "Inner Circle";
  if (reputation >= 40) return "Trusted";
  if (reputation >= 15) return "Known";
  if (reputation <= -20) return "Hostile";
  return "Neutral";
}

function autoEquip(state: GameState, mode: "combat" | "hacking" | "scavenging" | "lowInstability") {
  if (state.rpg.active) return state;
  const next = { ...state, equippedGear: { ...state.equippedGear }, equippedCyberware: { ...state.equippedCyberware } };
  const owned = Object.keys(state.inventory).filter((id) => state.inventory[id] > 0).map((id) => getItem(id)).filter(Boolean);
  const score = (id: string) => {
    const item = getItem(id);
    if (!item) return -Infinity;
    const stats = scaledStats(state, id);
    if (mode === "combat") return (stats.damage ?? 0) * 5 + (stats.armor ?? 0) * 3 + (stats.maxHp ?? 0) + (item.modifiers?.combatDamage ?? 0) * 100;
    if (mode === "hacking") return (item.modifiers?.skillXp?.hacking ?? 0) * 100 + (item.modifiers?.heatGain ? -item.modifiers.heatGain * 100 : 0);
    if (mode === "scavenging") return (item.modifiers?.skillRewards ?? 0) * 100 + (item.modifiers?.actionSpeed ?? 0) * 80;
    return -cyberwareInstabilityLoad(item);
  };
  [...gearSlots, ...cyberwareSlots].forEach((slot) => {
    const candidates = owned.filter((item) => item?.slot === slot.id && meetsItemAttributeRequirement(state, item));
    const best = candidates.sort((a, b) => score(b!.id) - score(a!.id))[0];
    if (!best) return;
    if (best.type === "Cyberware") next.equippedCyberware[slot.id as CyberwareSlot] = best.id;
    if (best.type === "Weapon" || best.type === "Armor") next.equippedGear[slot.id as GearSlot] = best.id;
  });
  return next;
}

export default App;
