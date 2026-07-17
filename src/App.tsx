import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
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
import { ripperdocClinics } from "./data/ripperdocClinics";
import { housingOptions } from "./data/housing";
import { cyberwareSlots, itemNames } from "./data/items";
import { cyberwareOverlaySlots, type CyberwareOverlaySlot } from "./data/cyberwareOverlayData";
import { percentDropTables } from "./data/percentDrops";
import { weaponClasses, weaponClassOrder } from "./data/weaponClasses";
import { resourceNames, resourceOrder } from "./data/resources";
import { skillActions, skillDescriptions, skillNames, skillOrder } from "./data/skills";
import { startingPaths } from "./data/startingPaths";
import {
  canAffordRewards,
  formatRewards,
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
import { adjustedDurationMs, getActiveModifiers } from "./systems/modifiers";
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
import { canAffordItemUpgrade, itemUpgradeCost, upgradeItem } from "./systems/upgradeSystem";
import { scaledCraftingCosts } from "./systems/craftingCosts";
import { compatibleAttachments, compatibleMods, installAttachment, installWeaponMod, removeAttachment, removeWeaponMod, weaponXpForNextLevel } from "./systems/weaponSystem";
import { dropRevealState } from "./systems/percentDrops";
import { loadPreset, savePreset } from "./systems/presetSystem";
import { runBasicSimCache, simCacheEligibility } from "./systems/simCacheEngine";
import { getSimulationEfficiency } from "./systems/simulationEfficiency";
import { masteryPoolPercent, masteryPoolCheckpoints } from "./systems/masteryPool";
import { progressionTiers, tierProgress } from "./data/progressionTiers";
import { perkTrees, perks, specializationMilestones } from "./data/perks";
import { districtSpecificMaterials, nextDistrictMasteryMilestone } from "./data/districtMastery";
import { nextActionMasteryMilestone } from "./data/actionMasteryMilestones";
import { canStartOperation, operationRequirementDetails, operationRouteSuccessChance, processOperation, startOperation, stopOperation } from "./systems/operationProcessor";
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
  vendorPrice,
} from "./systems/vendorSystem";
import { ActivityCard, FactionBadge, LockedOverlay, ModifierList, NeonPanel, RequirementList, TerminalLog, ThreatMeter } from "./components/cyberpunk";
import { DistrictMap } from "./components/DistrictMap";
import { RewardPopupContainer } from "./components/RewardPopups";
import { InfoButton, ScreenHelpPanel } from "./components/InfoPopover";
import { ClickableItemRequirement, ItemSourcePopover, RequirementBulletList } from "./components/ItemSourcePopover";
import { contractType, failureOutcomes, fixerTrustRank, fixerTrustRewards, fixerUnlockSummary, recommendedLoadoutTags } from "./systems/fixerContracts";
import { archetypeScores, detectedSignatureBuild } from "./systems/archetypeScoring";
import { availablePerkPoints, buyPerk, canBuyPerk, earnedPerkPoints, respecCost, respecPerks, spentPerkPoints, treeInvestment, updatePerkProgress } from "./systems/perkSystem";
import { combatEffectivenessForEnemy } from "./systems/combatMatchups";
import {
  calculateDropChance,
  calculateEstimatedKillTime,
  calculateHeatEffects,
  calculateInstabilityEffects,
  calculateJobRewards,
  calculateJobSuccessChance,
  calculatePlayerCombatStats,
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
import type { AttachmentCategory, BlackMarketStrategy, CombatZone, CraftingRecipe, CyberwareSlot, DistrictId, Enemy, GameState, GearSlot, JobContract, OperationDefinition, OperationRoute, OperationRouteId, PerkDefinition, PerkTreeId, ResourceId, RewardBundle, SkillAction, SkillId, StartingPathId, VendorDefinition, VendorItemEntry } from "./types";

type TabId = "city" | "inventory" | "character" | "loadout" | "progress" | "more";
type CharacterSectionId = "profile" | "health" | "build" | "skills";
type TabNotice = { key: string; title: string; detail: string };

const tabs: Array<{ id: TabId; label: string; Icon: typeof Activity }> = [
  { id: "city", label: "Map", Icon: Activity },
  { id: "inventory", label: "Inventory", Icon: Backpack },
  { id: "character", label: "Character", Icon: UserRound },
  { id: "loadout", label: "Loadout", Icon: Shield },
  { id: "progress", label: "Progress", Icon: Sword },
  { id: "more", label: "Menu", Icon: MoreHorizontal },
];

const characterSections: Array<{ id: CharacterSectionId; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "health", label: "Health" },
  { id: "build", label: "Build" },
  { id: "skills", label: "Skills" },
];

const isDevBuild = Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);

const startingPathImages: Record<StartingPathId, string> = {
  outrider: outriderPathImage,
  streetborn: streetbornPathImage,
  corporateDefector: corporateDefectorPathImage,
};

function runnerLevelProgress(state: GameState) {
  const currentTotalLevel = totalLevel(state);
  const completedMilestones = Math.floor(currentTotalLevel / 10);
  const level = completedMilestones + 1;
  const previousMilestone = completedMilestones * 10;
  const nextMilestone = (completedMilestones + 1) * 10;
  const percent = Math.min(100, Math.max(0, ((currentTotalLevel - previousMilestone) / 10) * 100));
  return { level, currentTotalLevel, nextMilestone, percent };
}

function App() {
  const [activeSaveSlot, setActiveSaveSlotState] = useState<SaveSlotId>(() => getActiveSaveSlot());
  const [state, setState] = useState<GameState>(() => loadInitialGameState(getActiveSaveSlot()));
  const [reviewedNoticeKeys, setReviewedNoticeKeys] = useState<Set<string>>(() => loadReviewedNoticeKeys(getActiveSaveSlot()));
  const [tabNoticesEnabled, setTabNoticesEnabled] = useState(loadTabNoticesEnabled);
  const [tab, setTab] = useState<TabId>("city");
  const [now, setNow] = useState(Date.now());
  const [exported, setExported] = useState("");
  const [importPayload, setImportPayload] = useState("");
  const [characterSection, setCharacterSection] = useState<CharacterSectionId>("profile");
  const [moreSection, setMoreSection] = useState<MoreSection>("story");
  const [simMenuOpen, setSimMenuOpen] = useState(false);
  const [cityOpenRequest, setCityOpenRequest] = useState<{ districtId: DistrictId; token: number } | null>(null);

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
      updatePerkProgress(progressState);
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

  useEffect(() => {
    const timer = window.setInterval(() => saveGame(state, activeSaveSlot), 5000);
    return () => window.clearInterval(timer);
  }, [state, activeSaveSlot]);

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
  const perkPointsAvailable = availablePerkPoints(state);
  const runnerProgress = runnerLevelProgress(state);
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
  const markTabNoticesReviewed = (id: TabId) => {
    setReviewedNoticeKeys((current) => {
      const next = new Set(current);
      tabNotices(state, id).forEach((notice) => next.add(notice.key));
      saveReviewedNoticeKeys(activeSaveSlot, next);
      return next;
    });
  };
  const openCityTab = () => {
    setCityOpenRequest(active?.districtId ? { districtId: active.districtId, token: Date.now() } : null);
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
        <div>
          <p className="eyebrow">Neon Row Idle</p>
          <h1>{activeOperation ? activeOperation.name : activeCraft ? activeCraft.name : activeJob ? activeJob.name : activeEnemy ? `Fighting ${activeEnemy.name}` : activeAction?.name ?? "Ready"}</h1>
        </div>
        <button className={`player-level-alert ${perkPointsAvailable > 0 ? "has-points" : ""}`} onClick={() => {
            setCharacterSection("build");
            setTab("character");
          }}>
          <span>Runner Lv {runnerProgress.level}</span>
          <strong>
            {perkPointsAvailable > 0
              ? `${perkPointsAvailable} skill point${perkPointsAvailable === 1 ? "" : "s"} available`
              : `${runnerProgress.currentTotalLevel} / ${runnerProgress.nextMilestone} total levels`}
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
      <CompactActiveIndicator activity={active} onOpen={openCityTab} onStop={() => setState((current) => stopOperation(stopCombat(stopJob(stopCraft(stopSkillAction(current))))))} />

      <main>
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
            onStartOperation={(id, routeId) => setState((current) => startOperation(current, id, routeId))}
            onStartJob={(id) => setState((current) => startJob(current, id))}
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
        {tab === "inventory" && (
          <InventoryTab
            state={state}
            onEquip={(id) => setState((current) => equipItem(current, id))}
            onUnequipGear={(slot) => setState((current) => unequipGear(current, slot))}
            onUnequipCyberware={(slot) => setState((current) => unequipCyberware(current, slot))}
            onUse={(id) => setState((current) => useItem(current, id))}
            onUpgrade={(id) => setState((current) => upgradeItem(current, id))}
            onInstallAttachment={(weaponId, attachmentId) => setState((current) => installAttachment(current, weaponId, attachmentId))}
            onRemoveAttachment={(weaponId, category) => setState((current) => removeAttachment(current, weaponId, category))}
            onInstallWeaponMod={(weaponId, modId) => setState((current) => installWeaponMod(current, weaponId, modId))}
            onRemoveWeaponMod={(weaponId, modId) => setState((current) => removeWeaponMod(current, weaponId, modId))}
            notices={inventoryNotices}
            onReviewNotice={markNoticeReviewed}
            onReviewAllNotices={() => markTabNoticesReviewed("inventory")}
          />
        )}
        {tab === "character" && (
          <CharacterTab
            state={state}
            section={characterSection}
            onSection={setCharacterSection}
            onBuyPerk={(id) => setState((current) => buyPerk(current, id))}
            onRecover={(mode) => setState((current) => {
              const next = cloneState(current);
              recoverFromDowned(next, mode);
              return next;
            })}
            onAutoHealChange={(patch) => setState((current) => ({ ...current, autoHeal: { ...current.autoHeal, ...patch } }))}
            onRespecPerks={() => {
              setState((current) => {
                const cost = respecCost(current);
                if (!window.confirm(`Respec all perk points for ${cost} Credits? Starting path remains permanent.`)) return current;
                return respecPerks(current);
              });
            }}
          />
        )}
        {tab === "loadout" && (
          <LoadoutTab
            state={state}
            onEquip={(id) => setState((current) => equipItem(current, id))}
            onUnequipCyberware={(slot) => setState((current) => unequipCyberware(current, slot))}
            onUpgrade={(id) => setState((current) => upgradeItem(current, id))}
            onSavePreset={(name) => setState((current) => savePreset(current, name))}
            onLoadPreset={(name) => setState((current) => loadPreset(current, name))}
            onAutoEquip={(mode) => setState((current) => autoEquip(current, mode))}
          />
        )}
        {tab === "progress" && <ProgressTab state={state} />}
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
          <button key={id} className={tab === id ? "active" : ""} onClick={() => id === "city" ? openCityTab() : setTab(id)}>
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

type MoreSection = "story" | "companions" | "simCache" | "balance" | "settings";

function tabIndicator(state: GameState, id: TabId, reviewed: Set<string>, enabled: boolean) {
  if (!enabled) return "";
  if (id === "inventory" && unreviewedTabNotices(state, id, reviewed).length > 0) return "New";
  if (id === "city" && unreviewedTabNotices(state, id, reviewed).length > 0) return "Next";
  return "";
}

function tabNotices(state: GameState, id: TabId): TabNotice[] {
  if (id === "inventory") return inventoryTabNotices(state);
  if (id === "city") return cityTabNotices(state);
  return [];
}

function unreviewedTabNotices(state: GameState, id: TabId, reviewed: Set<string>) {
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
            <h1>Choose Your Starting Path</h1>
            <p className="muted">Your origin changes the rhythm of the whole run: rewards, risks, faction friction, and long-term build identity. Resetting the save is the only way to choose again.</p>
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
            {(state.resources.heat >= 75 || effectiveNeuralInstability(state) >= 75) && <p className="fine warning-text">Safety warning: Heat or equipped Neural Instability is high.</p>}
            <button className="primary-button full" onClick={onOpenFull}>Full Details</button>
          </div>
        )}
      </aside>
    </>
  );
}

function CompactActiveIndicator({ activity, onOpen, onStop }: { activity: ActiveActivity | null; onOpen: () => void; onStop: () => void }) {
  if (!activity) return null;
  return (
    <div className="compact-active-indicator">
      <button className="compact-active-main" onClick={onOpen}>
        <div className="compact-active-labels">
          <span>{activity.type}</span>
          <strong>{activity.name}</strong>
          {activity.detail && <small>{activity.detail}</small>}
        </div>
        <em>{Math.round(activity.progress)}%</em>
        <div className="compact-active-bars">
          <div className="compact-action-progress">
            <Progress value={activity.progress} />
          </div>
          {activity.skillProgress !== undefined && (
            <div className="compact-skill-progress">
              <Progress
                value={activity.skillProgress}
                label={`${activity.type} Lv ${activity.skillLevel}: ${Math.floor(activity.skillXp ?? 0)} / ${activity.skillNextXp ?? 0} XP`}
              />
            </div>
          )}
        </div>
      </button>
      <button className="icon-button danger" onClick={onStop} aria-label="Stop active activity">
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

function CityTab({
  state,
  openRequest,
  onSelectDistrict,
  onStartSkill,
  onStartCombat,
  onStartOperation,
  onStartJob,
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
  openRequest: { districtId: DistrictId; token: number } | null;
  onSelectDistrict: (id: DistrictId) => void;
  onStartSkill: (id: string) => void;
  onStartCombat: (id: string) => void;
  onStartOperation: (id: string, routeId?: OperationRouteId) => void;
  onStartJob: (id: string) => void;
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
  const active = activeActivity(state);
  const openHub = (districtId: DistrictId) => {
    onSelectDistrict(districtId);
    setOpenDistrict(districtId);
  };
  useEffect(() => {
    if (!openRequest?.districtId) return;
    openHub(openRequest.districtId);
  }, [openRequest?.token]);
  if (!openDistrict) {
    return (
      <section className="stack">
        <TabNoticePanel title="Map Updates" notices={notices} onReviewNotice={onReviewNotice} onReviewAll={onReviewAllNotices} />
        <DistrictMap state={state} activeDistrictId={active?.districtId ?? null} activeActivityName={active?.name} onOpenDistrict={openHub} />
      </section>
    );
  }
  return (
    <section className="stack">
      <TabNoticePanel title="Map Updates" notices={notices} onReviewNotice={onReviewNotice} onReviewAll={onReviewAllNotices} />
      <DistrictHub
        state={state}
        districtId={openDistrict}
        activeActivity={active}
        onBack={() => setOpenDistrict(null)}
        onStartSkill={onStartSkill}
        onStartCombat={onStartCombat}
        onStartOperation={onStartOperation}
        onStartJob={onStartJob}
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

function DistrictHub({
  state,
  districtId,
  activeActivity,
  onBack,
  onStartSkill,
  onStartCombat,
  onStartOperation,
  onStartJob,
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
  onBack: () => void;
  onStartSkill: (id: string) => void;
  onStartCombat: (id: string) => void;
  onStartOperation: (id: string, routeId?: OperationRouteId) => void;
  onStartJob: (id: string) => void;
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
  const [infoOpen, setInfoOpen] = useState(false);
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
  return (
    <section className="district-hub stack">
      <article className={`district-header district-banner-${districtId} ${unlocked ? "" : "locked-card"}`}>
        <div className="district-header-main">
          <button className="secondary-button" onClick={onBack}>Back to Map</button>
          <button className="secondary-button" onClick={() => setInfoOpen((value) => !value)}>District Info</button>
        </div>
        <div>
          <p className="eyebrow">District Hub</p>
          <h2>{district.name}</h2>
          <p className="fine">{threatTier(threat)} threat / Standing {localStanding} / {completion.total}% complete</p>
          <p className="fine">Dominant faction: {factions.find((faction) => faction.id === dominantFaction)?.name ?? "Contested"}</p>
          {activeActivity?.districtId === districtId && <p className="warning-badge inline">Live: {activeActivity.name}</p>}
        </div>
        <DistrictMasteryPanel state={state} districtId={districtId} />
        <DistrictReturnGoalsPanel state={state} districtId={districtId} />
        <ThreatMeter value={threat} tier={threatTier(threat)} />
        {!unlocked && <CompactRequirementList state={state} districtId={districtId} requirements={district.unlockRequirements} />}
      </article>

      {infoOpen && <DistrictInfoPanel state={state} districtId={districtId} />}

      <div className="district-tab-stack">
        <div className="district-tabs district-skill-tabs">
          {skillTabs.map((skillTab) => (
            <button key={skillTab.id} className={category === skillTab.id ? "active" : ""} onClick={() => setCategory(skillTab.id)}>
              {skillTab.label}
              <span>Lv {state.skills[skillTab.skillId].level}</span>
            </button>
          ))}
        </div>
        <div className="district-tabs district-system-tabs">
          <button className={category === "overview" ? "active" : ""} onClick={() => setCategory("overview")}>Overview</button>
          {systemSummaries.map((summary) => (
            <button key={summary.id} className={category === summary.id ? "active" : ""} onClick={() => setCategory(summary.id)}>
              {summary.label}
            </button>
          ))}
        </div>
      </div>

      {category === "overview" ? (
        <>
          <DistrictIntelPanel state={state} districtId={districtId} />
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
          onStartOperation={onStartOperation}
          onStartJob={onStartJob}
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

      <NextStepsPanel
        state={state}
        districtId={districtId}
        onOpenCategory={setCategory}
      />
    </section>
  );
}

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
        <InfoBlock title="Systems" lines={[`${content.actions.length} actions`, `${content.contracts.length} contracts`, `${content.enemies.length} enemies`, `${content.operations.length} operations`, `${content.vendors.length} vendors`, `${content.ripperdocClinics.length + content.ripperdocServices.length} ripperdoc entries`]} />
      </div>
      <div className="inventory-grid">
        <Metric label="Combat" value={completion.combat} />
        <Metric label="Jobs" value={completion.jobs} />
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
  const challenges = challengeContracts.filter((challenge) => challenge.districtId === districtId);
  const highThreat = highThreatOperations.filter((operation) => operation.districtId === districtId);
  const materials = districtSpecificMaterials[districtId] ?? [];
  const missingMaterials = materials.filter((id) => !state.discoveredItems[id] && (state.inventory[id] ?? 0) <= 0).slice(0, 5);
  const bossMilestones = operations
    .filter((operation) => operation.districtId === districtId)
    .map((operation) => bosses.find((boss) => boss.id === operation.bossId))
    .filter(Boolean)
    .map((boss) => {
      const kills = state.bossLogs[boss!.id]?.kills ?? 0;
      const next = [1, 5, 10, 25, 50, 100, 250, 500, 1000].find((milestone) => kills < milestone);
      return next ? `${boss!.name} ${kills}/${next}` : `${boss!.name} complete`;
    });

  return (
    <details className="district-return-goals">
      <summary>Return Goals</summary>
      <p className="fine">Missing rares: {missingMaterials.map((id) => getItem(id)?.name ?? id).join(", ") || "None tracked"}</p>
      <p className="fine">Challenges: {challenges.map((challenge) => challenge.name).join(", ") || "No district-specific challenge yet"}</p>
      <p className="fine">High-threat operations: {highThreat.map((operation) => operation.name).join(", ") || "No high-threat route yet"}</p>
      <p className="fine">Boss milestones: {bossMilestones.join(", ") || "No boss route yet"}</p>
      <p className="fine">Legacy materials: {materials.slice(0, 4).map((id) => getItem(id)?.name ?? id).join(", ") || "None"}</p>
    </details>
  );
}

function LocalFactionCards({ state, districtId, context }: { state: GameState; districtId: DistrictId; context: string }) {
  const localFactions = factions.filter((faction) => faction.districtInfluence.includes(districtId));
  if (!localFactions.length) return null;
  return (
    <div className="local-faction-grid">
      {localFactions.map((faction) => {
        const factionState = state.factions[faction.id];
        const reputation = factionState?.reputation ?? 0;
        return (
          <article className="compact-run-card" key={faction.id}>
            <div>
              <p className="eyebrow">{context}</p>
              <h3>{faction.name}</h3>
              <p className="fine">Rank {factionRankNumber(reputation)} {factionRankLabel(reputation)} / Rep {reputation} / Hostility {factionState?.hostility ?? 0}</p>
              <p className="muted">{faction.uniqueBonuses.slice(0, 2).join(", ")}</p>
              <div className="terminal-log">
                {factionMilestones.filter((milestone) => milestone.districtId === districtId && milestone.factionId === faction.id).slice(0, 5).map((milestone) => (
                  <p key={`${milestone.factionId}-${milestone.districtId}-${milestone.rank}`}>Rank {milestone.rank}: {milestone.title} - {milestone.reward}</p>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
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
      <p className="fine">Faction reputation is earned mostly from Contracts and Operations in this district.</p>
    </article>
  );
}

function NextStepsPanel({ state, districtId, onOpenCategory }: { state: GameState; districtId: DistrictId; onOpenCategory: (category: DistrictHubCategory) => void }) {
  const steps = recommendedDistrictSteps(state, districtId);
  const unlocks = nextUnlockTargets(state).slice(0, 3);
  return (
    <details className="panel next-steps-panel">
      <summary className="next-steps-summary">
        <div>
          <p className="eyebrow">Recommended Route</p>
          <h2>Next Steps</h2>
        </div>
        <span className="status-chip">Skill-gated</span>
      </summary>
      <div className="next-step-grid">
        {steps.map((step) => (
          <button key={`${step.category}-${step.title}`} className="next-step-card" onClick={() => onOpenCategory(step.category)}>
            <span>{step.label}</span>
            <strong>{step.title}</strong>
            <em>{step.reason}</em>
          </button>
        ))}
      </div>
      <details className="card-details">
        <summary className="details-button">Next Unlocks</summary>
        {unlocks.map((unlock) => (
          <p className="fine" key={unlock.title}>
            <strong>{unlock.title}</strong>: {unlock.requirement}
          </p>
        ))}
      </details>
    </details>
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
  if (bestJob) steps.push({ category: "contracts", label: "Reliable contract", title: bestJob.job.name, reason: `${bestJob.chance.guaranteed ? "Guaranteed" : `${Math.round(bestJob.chance.chance * 100)}%`} success, ${formatRewards(bestJob.rewards)}` });
  if (bestOperation && playerStats.damage >= 18 && playerStats.armor >= 3) steps.push({ category: "operations", label: "Operation ready", title: bestOperation.name, reason: `Stats look ready: ${playerStats.damage} damage, ${playerStats.armor} armor. First clear ${formatRewards(bestOperation.completionRewards)}.` });
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
  onStartOperation,
  onStartJob,
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
  onStartOperation: (id: string, routeId?: OperationRouteId) => void;
  onStartJob: (id: string) => void;
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
  if (category === "contracts") {
    return (
      <FocusedPanel title="Contracts">
        <LocalFactionCards state={state} districtId={districtId} context="Contract reputation" />
        {districtFixers(districtId).map((fixer) => (
          <article className="fixer-contract-group" key={fixer.id}>
            <div>
              <p className="eyebrow">Fixer / Trust {state.fixerTrust[fixer.id]?.trust ?? 0}</p>
              <h3>{fixer.name}</h3>
              <p className="muted">{fixer.specialty}</p>
            </div>
            <div className="contract-card-grid">
              {districtJobs(districtId).filter((job) => job.fixerId === fixer.id).map((job) => (
                <ContractMissionCard
                  key={job.id}
                  state={state}
                  job={job}
                  onStart={() => onStartJob(job.id)}
                  onStop={onStopActive}
                />
              ))}
            </div>
          </article>
        ))}
      </FocusedPanel>
    );
  }
  if (category === "combat") {
    return <FocusedPanel title="Combat">{districtCombatZones(districtId).flatMap((zone) => zone.enemies.map((enemy) => <EnemyCard key={enemy.id} state={state} zone={zone} enemy={enemy} onStart={() => onStartCombat(enemy.id)} onStop={onStopActive} onUseHealingItem={onUseHealingItem} />))}</FocusedPanel>;
  }
  if (category === "crafting") {
    return <FocusedPanel title="Crafting"><CraftingPanel state={state} onCraft={onCraft} onStopCraft={onStopCraft} /></FocusedPanel>;
  }
  if (category === "operations") {
    return (
      <FocusedPanel title="Operations">
        <LocalFactionCards state={state} districtId={districtId} context="Operation reputation" />
        {districtOperations(districtId).map((operation) => {
          const boss = bosses.find((entry) => entry.id === operation.bossId);
          const active = state.activeOperation?.operationId === operation.id;
          const progress = active && state.activeOperation ? activityProgress(state.activeOperation.startedAt, state.activeOperation.durationMs) : null;
          const available = canStartOperation(state, operation);
          return (
            <article className={`action-card vertical ${active ? "active-card" : ""} ${available ? "" : "locked-card"}`} key={operation.id}>
              <div>
                <p className="eyebrow">Operation / {state.operationLogs[operation.id]?.firstClear ? "Cleared" : "Uncleared"}</p>
                <h3>{operation.name}</h3>
                <p className="muted">{operation.description}</p>
                <p className="fine">Boss {boss?.name ?? "Unknown"} / Rewards {formatRewards(operation.completionRewards)}</p>
                {active && <HealthBar label="Runner HP" current={state.health.currentHp} max={calculateMaxHP(state)} kind="player" />}
                <RequirementStatusList requirements={operationRequirementDetails(state, operation)} />
              </div>
              <div className="card-list compact">
                {active ? (
                  <CardActionFooter active progress={progress} startLabel="Launch" stopLabel="Retreat" onStart={() => onStartOperation(operation.id)} onStop={onStopActive} />
                ) : (
                  <>
                    {(operation.routes ?? []).map((route) => <button className="primary-button full" key={route.id} disabled={!available} onClick={() => onStartOperation(operation.id, route.id)}>{operationRouteButtonLabel(state, operation, route)}</button>)}
                    {!operation.routes?.length && <button className="primary-button full" disabled={!available} onClick={() => onStartOperation(operation.id)}>{operationRouteButtonLabel(state, operation)}</button>}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </FocusedPanel>
    );
  }
  if (category === "ripperdoc") {
    return (
      <FocusedPanel title="Ripperdoc">
        {ripperdocClinics.filter((clinic) => clinic.districtId === districtId).map((clinic) => (
          <VendorLikeRipperdoc key={clinic.id} state={state} clinicId={clinic.id} onBuy={onBuyRipperdocCyberware} />
        ))}
        {districtRipperdocs(districtId).map((service) => (
          <ActivityCard key={service.id} locked={!canUseRipperdocService(state, service.id)}>
            <div>
              <p className="eyebrow">{service.category ?? service.serviceType}</p>
              <h3>{service.name}</h3>
              <p className="muted">{service.description}</p>
              <p className="fine">Cost {formatRewards(service.cost)}{service.heatChange ? ` / Heat ${service.heatChange}` : ""}</p>
              {service.temporaryEffect && <p className="fine">Effect: {service.temporaryEffect.description}</p>}
            </div>
            <button className="primary-button full" disabled={!canUseRipperdocService(state, service.id)} onClick={() => onUseRipperdoc(service.id)}>Use Service</button>
          </ActivityCard>
        ))}
      </FocusedPanel>
    );
  }
  if (category === "market") {
    return (
      <FocusedPanel title="Market">
        {districtVendors(districtId).map((vendor) => <VendorCard key={vendor.id} state={state} vendor={vendor} onBuy={(itemId) => onBuyVendorItem(vendor.id, itemId)} onSell={(itemId) => onSellVendorItem(vendor.id, itemId)} />)}
        {(districtId === "underpassMarket" || districtId === "blacknetQuarter") && <BlackMarketPanel state={state} onListItem={onListBlackMarket} />}
      </FocusedPanel>
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
            <ActivityCard key={vehicle.id}>
              <div>
                <p className="eyebrow">{vehicle.rarity} / {vehicle.type}</p>
                <h3>{vehicle.name}{owned ? ` +${level}` : ""}</h3>
                <p className="fine">Cost {formatRewards(vehicle.cost)}</p>
                <RequirementStatusList requirements={textRequirementDetails(state, vehicle.unlockRequirements)} />
              </div>
              {owned ? <div className="card-list compact"><button className="secondary-button full" onClick={() => onSetVehicle(vehicle.id)}>Set Active</button><button className="primary-button full" disabled={level >= vehicle.maxUpgradeLevel} onClick={() => onUpgradeVehicle(vehicle.id)}>Upgrade</button></div> : <button className="primary-button full" disabled={!canBuyVehicle(state, vehicle.id)} onClick={() => onBuyVehicle(vehicle.id)}>Buy Vehicle</button>}
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
        <p className="fine">This tab only shows work that trains {skillNames[skillId]}.</p>
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
        <FocusedPanel title="Street Combat Fights">
          {enemies.flatMap((zone) => zone.enemies.map((enemy) => (
            <EnemyCard
              key={enemy.id}
              state={state}
              zone={zone}
              enemy={enemy}
              onStart={() => onStartCombat(enemy.id)}
              onStop={onStopActive}
              onUseHealingItem={onUseHealingItem}
            />
          )))}
        </FocusedPanel>
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
  const skillMatch = requirement.match(/^(Scavenging|Hacking|Cyberware Engineering|Street Combat|Vehicle Tuning|Black Market Trading|Medical Knowledge|Streetcraft) level (\d+)/i);
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
      progress: progressPercent(now, state.activeAction.startedAt, state.activeAction.durationMs),
      skillId: action.skillId,
      skillLevel: skill.level,
      skillXp: skill.xp,
      skillNextXp: nextXp,
      skillProgress: Math.min(100, (skill.xp / Math.max(1, nextXp)) * 100),
    };
  }
  if (state.activeJob) {
    const job = jobs.find((entry) => entry.id === state.activeJob?.jobId);
    return job ? { name: job.name, type: "Contract", districtId: job.districtId, progress: progressPercent(now, state.activeJob.startedAt, state.activeJob.durationMs) } : null;
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
          progress: combatAttackProgress(state.currentCombat, now),
          detail: `HP ${Math.ceil(state.health.currentHp)}/${calculateMaxHP(state)} / Enemy ${Math.ceil(enemyHp)}/${Math.ceil(enemyMaxHp)}`,
        }
      : null;
  }
  if (state.activeOperation) {
    const operation = operations.find((entry) => entry.id === state.activeOperation?.operationId);
    return operation ? { name: operation.name, type: "Operation", districtId: operation.districtId, progress: progressPercent(now, state.activeOperation.startedAt, state.activeOperation.durationMs) } : null;
  }
  if (state.activeCraft) {
    const recipe = recipes.find((entry) => entry.id === state.activeCraft?.recipeId);
    return recipe ? { name: recipe.name, type: "Crafting", districtId: state.selectedDistrict, progress: progressPercent(now, state.activeCraft.startedAt, state.activeCraft.durationMs) } : null;
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

function DistrictHubLegacy({
  state,
  districtId,
  onStartSkill,
  onStartCombat,
  onStartOperation,
  onStartJob,
  onUseRipperdoc,
  onBuyRipperdocCyberware,
  onBuyVendorItem,
  onSellVendorItem,
  onListBlackMarket,
  onBuyHousing,
  onSetResidence,
  onBuyVehicle,
  onSetVehicle,
  onUpgradeVehicle,
}: {
  state: GameState;
  districtId: DistrictId;
  onStartSkill: (id: string) => void;
  onStartCombat: (id: string) => void;
  onStartOperation: (id: string, routeId?: OperationRouteId) => void;
  onStartJob: (id: string) => void;
  onUseRipperdoc: (id: string) => void;
  onBuyRipperdocCyberware: (clinicId: string, itemId: string) => void;
  onBuyVendorItem: (vendorId: string, itemId: string) => void;
  onSellVendorItem: (vendorId: string, itemId: string) => void;
  onListBlackMarket: (itemId: string, strategy: "quickSale" | "standard" | "highBid" | "privateBuyer") => void;
  onBuyHousing: (id: string) => void;
  onSetResidence: (id: string) => void;
  onBuyVehicle: (id: string) => void;
  onSetVehicle: (id: string) => void;
  onUpgradeVehicle: (id: string) => void;
}) {
  const district = getDistrict(districtId)!;
  const unlocked = Boolean(state.districts[districtId]?.unlocked);
  const threat = state.districtThreat[districtId]?.level ?? 0;
  const districtMods = getDistrictModifiers(state, districtId);
  const completion = districtCompletionBreakdown(state, districtId);
  const localStanding = state.districtStanding[districtId]?.standing ?? 0;
  const localStoryArcs = availableStoryArcsForDistrict(state, districtId);
  return (
    <section className="stack">
      <NeonPanel className={unlocked ? "" : "locked-card"}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">District Hub</p>
            <h2>{district.name}</h2>
          </div>
          <FactionBadge label={district.associatedFactions.map((id) => factions.find((faction) => faction.id === id)?.name ?? id).join(" / ")} />
        </div>
        <p className="muted">{district.description}</p>
        <DistrictMasteryPanel state={state} districtId={districtId} />
        <DistrictReturnGoalsPanel state={state} districtId={districtId} />
        <ThreatMeter value={threat} tier={threatTier(threat)} />
        <RequirementStatusList requirements={textRequirementDetails(state, district.travelRequirements ?? district.unlockRequirements)} />
        <ModifierList items={Object.entries(districtMods).filter(([, value]) => value).map(([key, value]) => `${titleCase(key)} ${Math.round(Number(value) * 100)}%`)} />
        <div className="inventory-grid">
          <Metric label="Completion" value={completion.total} />
          <Metric label="Local Standing" value={localStanding} />
          <Metric label="Threat" value={threat} />
          <Metric label="Heat Mod" value={Math.round((district.heatModifier ?? 0) * 100)} />
        </div>
        <TerminalLog>
          <p>Threat effects: high threat raises combat rewards and rare drop chance, but increases vendor prices, lowers job success, and adds Heat pressure.</p>
          <p>Standing effects: local trust lowers market prices, improves service relationships, and counts toward district completion.</p>
        </TerminalLog>
        <div className="inventory-grid">
          <Metric label="Combat" value={completion.combat} />
          <Metric label="Jobs" value={completion.jobs} />
          <Metric label="Collection" value={completion.collection} />
          <Metric label="Housing" value={completion.housing} />
          <Metric label="Factions" value={completion.factions} />
          <Metric label="Services" value={completion.services} />
          <Metric label="Operations" value={completion.operations} />
          <Metric label="Vendors" value={completion.vendors} />
        </div>
        {!unlocked && <LockedOverlay text={district.unlockRequirements.join(", ")} />}
      </NeonPanel>

      {localStoryArcs.length > 0 && (
        <ActivityGroup title="Local Intel">
          {localStoryArcs.slice(0, 3).map((arc) => {
            const arcState = storyArcState(state, arc);
            const step = activeStoryStep(state, arc);
            return (
              <ActivityCard key={arc.id} locked={arcState.status === "locked"}>
                <div>
                  <p className="eyebrow">{arc.category} / {arcState.status}</p>
                  <h3>{arc.name}</h3>
                  {step && <p className="fine">{step.title}: {storyObjectiveProgress(state, step.objective)} / {step.objective.requiredCount}</p>}
                  {step?.choices?.length && !arcState.completedSteps[step.id] && (step.objective.type === "makeChoice" || storyObjectiveProgress(state, step.objective) >= step.objective.requiredCount) ? <p className="fine">Choice available in Menu / Story.</p> : null}
                </div>
              </ActivityCard>
            );
          })}
        </ActivityGroup>
      )}

      <ActivityGroup title="Skill Actions">
        {districtSkillActions(districtId).map((action) => {
          const requirementsMet = Object.entries(action.requiredItems ?? {}).every(([id, amount]) => (id in resourceNames ? state.resources[id as ResourceId] >= amount : (state.inventory[id] ?? 0) >= amount));
          const accessMet = meetsActionAccessRequirement(state, action);
          const actionUnlocked = unlocked && accessMet && requirementsMet;
          return (
            <ActivityCard key={action.id} locked={!actionUnlocked}>
              <div>
                <p className="eyebrow">{skillNames[action.skillId]} XP</p>
                <h3>{action.name}</h3>
                <p className={`fine ${!accessMet ? "warning-text" : ""}`}>
                  {actionAccessRequirementText(state, action)}
                </p>
                <p className="fine">Levels {skillNames[action.skillId]} / Current {state.skills[action.skillId].level}</p>
                <p className="fine">Rewards {formatRewards(action.rewards)}</p>
                {action.traceChance ? <p className="fine">Trace {Math.round(action.traceChance * 100)}% / Heat {action.heatChange ?? 0}</p> : null}
                <TagList tags={[action.skillId, ...(action.tags ?? [])]} />
              </div>
              <button className="primary-button full" disabled={!actionUnlocked} onClick={() => onStartSkill(action.id)}>Start</button>
            </ActivityCard>
          );
        })}
      </ActivityGroup>

      <ActivityGroup title="Combat Zones">
        {districtCombatZones(districtId).flatMap((zone) => zone.enemies.map((enemy) => (
          <ActivityCard key={enemy.id} locked={!unlocked}>
            <div>
              {(() => {
                const matchup = combatEffectivenessForEnemy(state, enemy);
                return (
                  <>
              <p className="eyebrow">{zone.name}</p>
              <h3>{enemy.name}</h3>
                    <p className="fine">{matchup.rating} / {matchup.difficulty} / {formatDuration(matchup.expectedKillMs)}</p>
                    <p className="fine">HP {enemy.hp} / Effective {matchup.effectiveHp} / XP {enemy.xpReward} / Kills {state.enemyLog[enemy.id]?.kills ?? 0}</p>
                    <TagList tags={[...(enemy.traits ?? []), ...(enemy.recommendedLoadoutTags ?? [])].slice(0, 8)} />
                  </>
                );
              })()}
            </div>
            <button className="primary-button full" disabled={!unlocked} onClick={() => onStartCombat(enemy.id)}>Fight</button>
          </ActivityCard>
        )))}
      </ActivityGroup>

      <ActivityGroup title="Operations & Bosses">
        {districtOperations(districtId).map((operation) => {
          const boss = bosses.find((entry) => entry.id === operation.bossId);
          const available = canStartOperation(state, operation);
          return (
            <ActivityCard key={operation.id} locked={!available}>
              <div>
                <p className="eyebrow">Operation</p>
                <h3>{operation.name}</h3>
                <p className="fine">Boss {boss?.name} / Clears {state.operationLogs[operation.id]?.clears ?? 0}</p>
                <p className="fine">Mechanics: {(operation.mechanics ?? []).map((mechanic) => mechanic.name).join(", ") || "Standard route"}</p>
                <RequirementStatusList requirements={operationRequirementDetails(state, operation)} />
                <TagList tags={operation.recommendedLoadoutTags ?? []} />
              </div>
              <div className="card-list compact">
                {(operation.routes ?? [{ id: operation.defaultRouteId ?? "directAssault", name: "Launch", description: "", requirements: [], recommendedTags: [], successModifier: 0 }]).map((route) => (
                  <button className="primary-button full" key={route.id} disabled={!available} onClick={() => onStartOperation(operation.id, route.id)}>
                    {operationRouteButtonLabel(state, operation, route)}
                  </button>
                ))}
              </div>
            </ActivityCard>
          );
        })}
      </ActivityGroup>

      <ActivityGroup title="Fixer Jobs">
        {districtJobs(districtId).map((job) => {
          const chance = calculateJobSuccessChance(job, state);
          return (
            <ActivityCard key={job.id} locked={!canAttemptJob(state, job)}>
              <div>
                <p className="eyebrow">{fixers.find((fixer) => fixer.id === job.fixerId)?.name ?? "Fixer"}</p>
                <h3>{job.name}</h3>
                <p className="fine">Success {chance.guaranteed ? "Guaranteed" : `${Math.round(chance.chance * 100)}%`} / {formatRewards(job.rewards)}</p>
                <details>
                  <summary className="fine">Success breakdown</summary>
                  <p className="fine">{chance.breakdown.map((entry) => `${entry.label}: ${typeof entry.value === "number" ? `${Math.round(entry.value * 100)}%` : entry.value}`).join(" / ")}</p>
                </details>
                <TagList tags={job.tags} />
              </div>
              <button className="primary-button full" disabled={!canAttemptJob(state, job)} onClick={() => onStartJob(job.id)}>Contract</button>
            </ActivityCard>
          );
        })}
      </ActivityGroup>

      <ActivityGroup title="Ripperdoc">
        {ripperdocClinics.filter((clinic) => clinic.districtId === districtId).map((clinic) => (
          <ActivityCard key={clinic.id} locked={!unlocked}>
            <div>
              <p className="eyebrow">{clinic.legalOnly ? "Licensed Clinic" : "Street Clinic"} / Buy x{clinic.priceModifier}</p>
              <h3>{clinic.name}</h3>
              <p className="muted">{clinic.description}</p>
              <TagList tags={clinic.specialties} />
              <RequirementStatusList requirements={textRequirementDetails(state, clinic.unlockRequirements)} />
            </div>
            <div className="card-list compact">
              {clinic.cyberwareInventory.map((itemId) => (
                <button key={itemId} className="secondary-button full" disabled={!canBuyCyberwareFromRipperdoc(state, clinic.id, itemId)} onClick={() => onBuyRipperdocCyberware(clinic.id, itemId)}>
                  Buy {getItem(itemId)?.name ?? itemId} {ripperdocBuyPrice(state, clinic.id, itemId)}
                </button>
              ))}
            </div>
          </ActivityCard>
        ))}
        {districtRipperdocs(districtId).map((service) => (
          <ActivityCard key={service.id} locked={!canUseRipperdocService(state, service.id)}>
            <div>
              <p className="eyebrow">{service.category ?? service.serviceType} / Risk {service.riskLevel ?? 1} / {service.ripperdocId}</p>
              <h3>{service.name}</h3>
              <p className="muted">{service.description}</p>
              <p className="fine">Cost {formatRewards(service.cost)}</p>
              {service.materialRequirements && <p className="fine">Materials: {Object.entries(service.materialRequirements).map(([id, amount]) => `${amount} ${resourceNames[id as ResourceId] ?? getItem(id)?.name ?? id}`).join(", ") || "None"}</p>}
              {service.effects?.length ? <p className="fine">Effects: {service.effects.join(", ")}</p> : null}
              {service.risk ? <p className="fine">Risk: {service.risk}</p> : null}
              {service.heatChange ? <p className="fine">Heat {service.heatChange > 0 ? "+" : ""}{service.heatChange}</p> : null}
              {service.temporaryEffect && <p className="fine">Bonus: {service.temporaryEffect.description}{service.temporaryEffect.downside ? ` Downside: ${service.temporaryEffect.downside}.` : ""}</p>}
              <RequirementStatusList requirements={textRequirementDetails(state, service.requirements)} />
            </div>
            <button className="primary-button full" disabled={!canUseRipperdocService(state, service.id)} onClick={() => onUseRipperdoc(service.id)}>Use Service</button>
          </ActivityCard>
        ))}
      </ActivityGroup>

      <ActivityGroup title="Vendors & Markets">
        {districtVendors(districtId).map((vendor) => (
          <VendorCard
            key={vendor.id}
            state={state}
            vendor={vendor}
            onBuy={(itemId) => onBuyVendorItem(vendor.id, itemId)}
            onSell={(itemId) => onSellVendorItem(vendor.id, itemId)}
          />
        ))}
      </ActivityGroup>

      {(districtId === "underpassMarket" || districtId === "blacknetQuarter") && (
        <BlackMarketPanel state={state} onListItem={onListBlackMarket} />
      )}

      <ActivityGroup title="Garage & Vehicles">
        {districtVehicles(districtId).map((vehicle) => {
          const owned = Boolean(state.ownedVehicles[vehicle.id]);
          const level = state.vehicleUpgradeLevels[vehicle.id] ?? 0;
          return (
            <ActivityCard key={vehicle.id} locked={!unlocked}>
              <div>
                <p className="eyebrow">{vehicle.rarity} / {vehicle.type} / Slots {garageSlots(state)}</p>
                <h3>{vehicle.name}{owned ? ` +${level}` : ""}</h3>
                <p className="muted">{vehicle.sourceHint}</p>
                <p className="fine">Cost {formatRewards(vehicle.cost)}</p>
                <p className="fine">Stats: Speed {vehicle.stats.speed}, Armor {vehicle.stats.armor}, Storage {vehicle.stats.storage}, Stealth {vehicle.stats.stealth}, Heat -{vehicle.stats.heatReduction}%</p>
                <RequirementStatusList requirements={textRequirementDetails(state, vehicle.unlockRequirements)} />
              </div>
              {owned ? (
                <div className="card-list compact">
                  <button className="secondary-button full" onClick={() => onSetVehicle(vehicle.id)}>Set Active</button>
                  <button className="primary-button full" disabled={level >= vehicle.maxUpgradeLevel} onClick={() => onUpgradeVehicle(vehicle.id)}>Upgrade</button>
                </div>
              ) : (
                <button className="primary-button full" disabled={!unlocked || !canBuyVehicle(state, vehicle.id)} onClick={() => onBuyVehicle(vehicle.id)}>Buy Vehicle</button>
              )}
            </ActivityCard>
          );
        })}
      </ActivityGroup>

      <ActivityGroup title="District Events">
        {districtEvents.filter((event) => event.districtId === districtId).map((event) => (
          <ActivityCard key={event.id} locked={!state.districtEvents[event.id]}>
            <div>
              <p className="eyebrow">{state.districtEvents[event.id] ? "Logged" : "Event Hook"} / {event.trigger}</p>
              <h3>{event.name}</h3>
              <p className="muted">{event.description}</p>
              <p className="fine">Effects: {event.effects.join(", ")}</p>
            </div>
          </ActivityCard>
        ))}
      </ActivityGroup>

      <ActivityGroup title="Housing, Factions, Companions">
        {districtHousing(districtId).map((housing) => (
          <ActivityCard key={housing.id} locked={!state.districts[housing.districtId]?.unlocked}>
            <div>
              <p className="eyebrow">Housing</p>
              <h3>{housing.name}</h3>
              <p className="fine">Cost {housing.cost} Credits / {state.ownedHousing[housing.id] ? "Owned" : "For Sale"}</p>
              <RequirementStatusList requirements={textRequirementDetails(state, housing.unlockRequirements ?? [])} />
            </div>
            {state.ownedHousing[housing.id] ? (
              <button className="secondary-button full" onClick={() => onSetResidence(housing.id)}>Set Active</button>
            ) : (
              <button className="primary-button full" disabled={state.resources.credits < housing.cost} onClick={() => onBuyHousing(housing.id)}>Buy</button>
            )}
          </ActivityCard>
        ))}
        {districtFixers(districtId).map((fixer) => <ActivityCard key={fixer.id}><h3>{fixer.name}</h3><p className="fine">{fixer.specialty}</p></ActivityCard>)}
        {districtCompanions(districtId).map((companion) => <ActivityCard key={companion.id}><h3>{companion.name}</h3><p className="fine">{companion.passiveBonus}</p></ActivityCard>)}
      </ActivityGroup>
    </section>
  );
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
  const bought = state.vendors[vendor.id]?.purchases[entry.itemId] ?? 0;
  const stockText = entry.stockType === "limited" ? `${Math.max(0, (entry.stock ?? 0) - bought)} left` : entry.stockType === "unlock" ? "unlock stock" : "infinite";
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
            .filter((action) => action.skillId === skillId)
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
  const manuallyDone = Boolean(state.manualDiscovery.skillActions[action.id]);
  const active = state.activeAction?.actionId === action.id;
  const nextMasteryMilestone = nextActionMasteryMilestone(mastery.level);
  const progress = active && state.activeAction ? activityProgress(state.activeAction.startedAt, state.activeAction.durationMs) : null;
  const badges = actionRecommendationBadges(state, action, displayedRewards);
  const duration = adjustedDurationMs(state, action.durationMs, [action.skillId, ...(action.tags ?? [])]);
  const displayedXpReward = actionXpRewardWithMastery(state, action);
  const districtMasteryXp = action.districtReq ? Math.max(4, Math.round(action.xpReward * 0.55 + action.masteryXpReward * 0.35)) : 0;
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
        {locked && <p className="mission-lockout">{actionLockHint(state, action, { accessMet, districtUnlocked, unlocksMet, requiredItemsMet, affordable })}</p>}

        <div className="mission-section-stack">
          <InfoSectionRow icon={<Target size={22} />} title="Requirements">
            <RequirementSummary
              state={state}
              action={action}
              accessMet={accessMet}
              districtUnlocked={districtUnlocked}
              unlocksMet={unlocksMet}
              requiredItemsMet={requiredItemsMet}
              duration={duration}
            />
          </InfoSectionRow>

          <InfoSectionRow icon={<TrendingUp size={22} />} title="Gains">
            <div className="mission-gain-grid">
              <strong>+{displayedXpReward}</strong>
              <span>{skillNames[action.skillId]} XP</span>
              <strong>+{action.masteryXpReward}</strong>
              <span>Mastery XP</span>
            </div>
          </InfoSectionRow>

          <InfoSectionRow icon={<Star size={22} />} title="Mastery">
            <MasteryProgressBar mastery={mastery} />
          </InfoSectionRow>

          <InfoSectionRow icon={<Shield size={22} />} title="Next Milestone" tone="gold">
            {nextMasteryMilestone ? (
              <div className="mission-copy-block">
                <strong>Mastery {nextMasteryMilestone.level}: {nextMasteryMilestone.name}</strong>
                <span>{nextMasteryMilestone.description}</span>
              </div>
            ) : (
              <span className="muted">All listed mastery milestones unlocked.</span>
            )}
          </InfoSectionRow>

          <InfoSectionRow icon={<MapPinned size={22} />} title="District">
            <span>District Mastery XP: <strong>{districtMasteryXp ? `+${districtMasteryXp}` : "None"}</strong></span>
          </InfoSectionRow>

          <InfoSectionRow icon={<Gift size={22} />} title="Rewards">
            <div className="reward-chip-grid">
              {Object.entries(displayedRewards).filter(([, amount]) => amount).map(([id, amount]) => (
                <RewardChip key={id} id={id} amount={amount ?? 0} />
              ))}
            </div>
          </InfoSectionRow>
        </div>

        <details className="card-details mission-details">
          <summary className="details-button mission-details-button"><FileText size={16} /> Details</summary>
          <div className="mission-details-body">
            {action.requiredItems && <p className="fine">Required items: {Object.entries(action.requiredItems).map(([id, amount]) => `${amount} ${resourceNames[id as ResourceId] ?? getItem(id)?.name ?? id}`).join(", ")}</p>}
            {action.rareDrops?.length ? <p className="fine">Drops: {action.rareDrops.map((drop) => `${drop.name} ${formatOneInChance(drop.chance)}`).join(", ")}</p> : null}
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

function StatusBadge({ locked, active }: { locked: boolean; active: boolean }) {
  return (
    <span className={`mission-badge status-badge ${active ? "active" : locked ? "locked" : "unlocked"}`}>
      {active ? <Timer size={15} /> : locked ? <Lock size={15} /> : <Unlock size={15} />}
      {active ? "Running" : locked ? "Locked" : "Unlocked"}
    </span>
  );
}

function ContractMissionCard({ state, job, onStart, onStop }: { state: GameState; job: JobContract; onStart: () => void; onStop: () => void }) {
  const chance = calculateJobSuccessChance(job, state);
  const rewards = calculateJobRewards(state, job);
  const active = state.activeJob?.jobId === job.id;
  const progress = active && state.activeJob ? activityProgress(state.activeJob.startedAt, state.activeJob.durationMs) : null;
  const locked = !canAttemptJob(state, job);
  const requirements = jobRequirementDetails(state, job);
  const fixer = fixers.find((entry) => entry.id === job.fixerId);
  return (
    <article className={`contract-mission-card ${active ? "active-card" : ""} ${locked ? "locked-card" : ""}`}>
      <header className="contract-mission-header">
        <div>
          <p className="eyebrow">Fixer Contract / {contractType(job)}</p>
          <h3>{job.name}</h3>
        </div>
        <div className="mission-header-tools">
          <StatusBadge locked={locked} active={active} />
          <RiskBadge action={{ heatChange: job.heatChange, traceChance: job.tags.includes("hacking") ? 0.12 : 0, skillId: "streetcraft", id: job.id, name: job.name, district: "", description: "", levelReq: 1, durationMs: job.durationMs, xpReward: 0, masteryXpReward: 0, rewards: {} }} />
        </div>
      </header>
      <p className="muted">{job.description}</p>
      <div className="contract-section">
        <h4><Gift size={16} /> Rewards</h4>
        <div className="reward-chip-grid">
          {Object.entries(rewards).filter(([, amount]) => amount).map(([id, amount]) => <RewardChip key={id} id={id} amount={amount ?? 0} />)}
          <span className="reward-chip"><b className="reward-chip-icon">TR</b><strong>+{job.fixerTrustReward}</strong><em>Fixer Trust</em></span>
        </div>
      </div>
      <div className="contract-section">
        <h4><Target size={16} /> Requirements</h4>
        <RequirementStatusList requirements={requirements} emptyLabel="None - open to all operatives." />
      </div>
      <div className="contract-section">
        <h4><FileText size={16} /> Notes</h4>
        <p className="fine">Fixer: {fixer?.name ?? "Unknown"} / Success {chance.guaranteed ? "Guaranteed" : `${Math.round(chance.chance * 100)}%`} / Duration {formatDuration(adjustedDurationMs(state, job.durationMs, job.tags))}</p>
        <p className="fine">Tags: {job.tags.join(", ") || "None"}</p>
      </div>
      <CardActionFooter
        active={active}
        progress={progress}
        locked={locked}
        disabled={false}
        startLabel="Accept Contract"
        stopLabel="Stop Contract"
        onStart={onStart}
        onStop={onStop}
      />
    </article>
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
  districtUnlocked,
  unlocksMet,
  requiredItemsMet,
  duration,
}: {
  state: GameState;
  action: SkillAction;
  accessMet: boolean;
  districtUnlocked: boolean | undefined;
  unlocksMet: boolean;
  requiredItemsMet: boolean;
  duration: number;
}) {
  return (
    <div className="requirement-summary">
      <span className={accessMet ? "" : "missing"}>{actionAccessRequirementText(state, action)}</span>
      {!accessMet && <span className="missing">Need {skillNames[action.skillId]} {action.levelReq}. Current {state.skills[action.skillId].level}</span>}
      {!districtUnlocked && action.districtReq && <span className="missing">Unlock {getDistrict(action.districtReq)?.name ?? action.districtReq}</span>}
      {!unlocksMet && <span className="missing">Needs {action.requiredUnlocks?.join(", ") ?? "unlock"}</span>}
      {!requiredItemsMet && action.requiredItems && <span className="missing">Missing required items</span>}
      <span><Timer size={14} /> {formatDuration(duration)}</span>
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

function operationRouteButtonLabel(state: GameState, operation: OperationDefinition, route?: OperationRoute) {
  const chance = Math.round(operationRouteSuccessChance(state, operation, route) * 100);
  return `${route?.name ?? "Start Operation"} (${chance}%)`;
}

function textRequirementDetails(state: GameState, requirements: string[]) {
  return requirements.map((requirement) => ({ text: requirement, met: textRequirementMet(state, requirement) }));
}

function textRequirementMet(state: GameState, requirement: string) {
  const lower = requirement.toLowerCase();
  const skillMatch = lower.match(/(scavenging|hacking|cyberware engineering|cyberware|street combat|combat|vehicle tuning|black market trading|black market|medical knowledge|medical|streetcraft)\s+level\s+(\d+)/);
  if (skillMatch) {
    const label = skillMatch[1];
    const skillId: SkillId | null =
      label.includes("scavenging") ? "scavenging" :
      label.includes("hacking") ? "hacking" :
      label.includes("cyberware") ? "cyberware" :
      label.includes("vehicle") ? "vehicleTuning" :
      label.includes("black market") ? "blackMarket" :
      label.includes("medical") ? "medical" :
      label.includes("streetcraft") ? "streetcraft" :
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

function actionLockHint(
  state: GameState,
  action: SkillAction,
  checks: { accessMet: boolean; districtUnlocked: boolean | undefined; unlocksMet: boolean; requiredItemsMet: boolean; affordable: boolean },
) {
  if (!checks.districtUnlocked && action.districtReq) return `Locked: unlock ${getDistrict(action.districtReq)?.name ?? action.districtReq}.`;
  if (!checks.accessMet) return `Locked: raise ${skillNames[action.skillId]} to level ${action.levelReq}. Fastest path: run your best available ${skillNames[action.skillId]} action.`;
  if (!checks.requiredItemsMet && action.requiredItems) return `Locked: missing ${Object.entries(action.requiredItems).map(([id, amount]) => `${amount} ${resourceNames[id as ResourceId] ?? getItem(id)?.name ?? id}`).join(", ")}.`;
  if (!checks.unlocksMet) return `Locked: needs ${action.requiredUnlocks?.join(", ") ?? "another unlock"}.`;
  if (!checks.affordable) return "Locked: not enough resources to pay the action cost.";
  return "Locked: requirements not met.";
}

function CombatTab({
  state,
  onStart,
  onStartOperation,
}: {
  state: GameState;
  onStart: (enemyId: string) => void;
  onStartOperation: (operationId: string, routeId?: OperationRouteId) => void;
}) {
  const zone = combatZones[0];
  return (
    <section className="stack">
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Starter zone</p>
            <h2>{zone.name}</h2>
          </div>
          <Sword size={22} />
        </div>
        <p className="muted">{zone.description}</p>
        <Progress
          value={(state.skills.combat.xp / xpForNextLevel(state.skills.combat.level)) * 100}
          label={`Street Combat ${state.skills.combat.level}: ${state.skills.combat.xp} / ${xpForNextLevel(state.skills.combat.level)} XP`}
        />
      </article>
      <div className="card-list">
        {zone.enemies.map((enemy) => (
          <EnemyCard key={enemy.id} state={state} zone={zone} enemy={enemy} onStart={() => onStart(enemy.id)} />
        ))}
      </div>
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Dungeon-like chains</p>
            <h2>Operations</h2>
          </div>
          <Sword size={22} />
        </div>
        <div className="card-list">
          {operations.map((operation) => {
            const boss = bosses.find((entry) => entry.id === operation.bossId);
            const log = state.operationLogs[operation.id] ?? { clears: 0, bestClearMs: null, firstClear: false, drops: {} };
            const available = canStartOperation(state, operation);
            const bossMatchup = boss ? combatEffectivenessForEnemy(state, boss, ["operation", operation.districtId, ...(operation.recommendedLoadoutTags ?? [])]) : null;
            return (
              <article className="action-card vertical" key={operation.id}>
                <div>
                  <p className="eyebrow">{districts.find((district) => district.id === operation.districtId)?.name} / Threat {state.districtThreat[operation.districtId]?.level ?? 0}</p>
                  <h3>{operation.name}</h3>
                  <p className="muted">{operation.description}</p>
                  <RequirementStatusList requirements={operationRequirementDetails(state, operation)} />
                  <p className="fine">Recommended: {operation.recommendedStats.join(", ")}</p>
                  <p className="fine">Loadout tags: {(operation.recommendedLoadoutTags ?? []).join(", ") || "Any"}</p>
                  {operation.requiredItems && <p className="fine">Keys: {Object.entries(operation.requiredItems).map(([id, amount]) => `${amount} ${getItem(id)?.name ?? id}`).join(", ")}</p>}
                  <p className="fine">Stages: {operation.stages.map((stage) => stage.name).join(", ")}</p>
                  <p className="fine">Boss: {boss?.name} / {bossMatchup?.rating ?? "Unknown"} / {boss?.mechanics.join(", ")}</p>
                  {boss?.phases?.length ? <p className="fine">Phases: {boss.phases.map((phase) => `${phase.name} ${phase.thresholdPercent}%`).join(", ")}</p> : null}
                  {operation.mechanics?.length ? <p className="fine">Operation mechanics: {operation.mechanics.map((mechanic) => mechanic.name).join(", ")}</p> : null}
                  <p className="fine">Rewards: {formatRewards(operation.completionRewards)}</p>
                  <p className="fine">Clears {log.clears} / Best {log.bestClearMs ? formatDuration(log.bestClearMs) : "--"} / Sim Cache {log.firstClear ? "Eligible later" : "Manual clear required"}</p>
                  <TagList tags={["operation", operation.districtId, ...(operation.recommendedLoadoutTags ?? [])]} />
                </div>
                <div className="card-list compact">
                  {(operation.routes ?? []).map((route) => (
                    <button className="primary-button full" key={route.id} disabled={!available} onClick={() => onStartOperation(operation.id, route.id)}>
                      {operationRouteButtonLabel(state, operation, route)}
                    </button>
                  ))}
                  {!operation.routes?.length && (
                    <button className="primary-button full" disabled={!available} onClick={() => onStartOperation(operation.id)}>
                      {operationRouteButtonLabel(state, operation)}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </article>
      {state.operationRecap && (
        <article className="panel recap">
          <p className="eyebrow">Operation recap</p>
          <h2>{operations.find((operation) => operation.id === state.operationRecap?.operationId)?.name}</h2>
          <p className="muted">{state.operationRecap.message}</p>
          <div className="inventory-grid">
            <Metric label="Success" value={state.operationRecap.success ? 1 : 0} />
            <Metric label="Enemies" value={state.operationRecap.enemiesDefeated} />
            <Metric label="XP" value={state.operationRecap.xpGained} />
            <Metric label="Heat" value={state.operationRecap.heatChange} />
          </div>
          <p className="fine">Rewards: {formatRewards(state.operationRecap.rewards)}</p>
          <p className="fine">Items: {Object.entries(state.operationRecap.itemsGained).map(([id, amount]) => `${amount} ${getItem(id)?.name ?? id}`).join(", ") || "None"}</p>
        </article>
      )}
    </section>
  );
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
  const safety = estimateCombatSafety(state, enemy);
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
        <p className={`fine safety-${safety.rating.toLowerCase()}`}>Safety {safety.rating} / Est. damage {safety.estimatedDamage} / Recommended HP {safety.recommendedHp}</p>
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

type InventoryFilter = "All" | "Resources" | "Materials" | "Cyberware" | "Weapons" | "Attachments" | "Mods" | "Armor" | "Consumables" | "Blueprints";
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
  onUpgrade: (id: string) => void;
  onInstallAttachment: (weaponId: string, attachmentId: string) => void;
  onRemoveAttachment: (weaponId: string, category: AttachmentCategory) => void;
  onInstallWeaponMod: (weaponId: string, modId: string) => void;
  onRemoveWeaponMod: (weaponId: string, modId: string) => void;
  notices: TabNotice[];
  onReviewNotice: (key: string) => void;
  onReviewAllNotices: () => void;
}) {
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
    if (filter === "All") return true;
    if (filter === "Resources") return item?.type === "Resource" && !["credits", "reputation", "heat"].includes(id);
    if (filter === "Materials") return item?.type === "Material" || item?.type === "Component";
    if (filter === "Weapons") return item?.type === "Weapon";
    if (filter === "Attachments") return item?.type === "WeaponAttachment";
    if (filter === "Mods") return item?.type === "WeaponMod";
    if (filter === "Cyberware") return item?.type === "Cyberware";
    if (filter === "Armor") return item?.type === "Armor";
    if (filter === "Consumables") return item?.type === "Consumable";
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
  const selectedGearSlot = selectedItem && (selectedItem.type === "Weapon" || selectedItem.type === "Armor") ? selectedItem.slot as GearSlot | undefined : undefined;
  const selectedCyberwareSlot = selectedItem?.type === "Cyberware" ? selectedItem.slot as CyberwareSlot | undefined : undefined;
  const equippedGearId = selectedGearSlot ? state.equippedGear[selectedGearSlot] : undefined;
  const equippedCyberwareId = selectedCyberwareSlot ? state.equippedCyberware[selectedCyberwareSlot] : undefined;
  return (
    <section className="stack">
      <TabNoticePanel
        title="Inventory Updates"
        notices={notices}
        onReviewNotice={(key) => {
          const itemId = key.replace(/^inventory:/, "");
          if (getItem(itemId)) setSelectedId(itemId);
          onReviewNotice(key);
        }}
        onReviewAll={onReviewAllNotices}
      />
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">One item, one stash slot</p>
            <h2>Inventory</h2>
          </div>
          <Backpack size={22} />
        </div>
        <ResourceWallet state={state} />
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
          {(["All", "Resources", "Materials", "Cyberware", "Weapons", "Attachments", "Mods", "Armor", "Consumables", "Blueprints"] as InventoryFilter[]).map((entry) => (
            <button key={entry} className={filter === entry ? "active" : ""} onClick={() => setFilter(entry)}>
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
          }) : <p className="muted">No items in this filter yet.</p>}
        </div>
      </article>
      <article className="panel">
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
            <p className="fine">Used for: {itemUseSummary(selectedItem.id)}</p>
            <p className="fine">Source: {selectedItem.sourceHint}</p>
            <p className="fine">Sell value: {selectedItem.sellValue}</p>
            {selectedItem.stats && <p className="fine">Stats: {formatStats(scaledStats(state, activeId))}</p>}
            {selectedItem.modifiers && <p className="fine">Modifiers: {formatItemModifiers(selectedItem.modifiers)}</p>}
            {selectedItem.maxUpgradeLevel && (
              <div className="upgrade-cost-box">
                <p className="fine">
                  {(state.upgradeLevels[activeId] ?? 0) >= selectedItem.maxUpgradeLevel
                    ? `Upgrade: Max level +${selectedItem.maxUpgradeLevel}`
                    : `Upgrade +${(state.upgradeLevels[activeId] ?? 0) + 1}/${selectedItem.maxUpgradeLevel}: ${formatItemCost(selectedUpgradeCost)}`}
                </p>
                {Object.entries(selectedUpgradeCost).map(([id, amount]) => {
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
                <button className="primary-button full" onClick={() => onEquip(activeId)}>Equip</button>
              )}
              {selectedGearSlot && equippedGearId && (
                <button className="secondary-button full" onClick={() => onUnequipGear(selectedGearSlot)}>
                  Unequip {getItem(equippedGearId)?.name ?? "current gear"}
                </button>
              )}
              {selectedCyberwareSlot && equippedCyberwareId && (
                <button className="secondary-button full" onClick={() => onUnequipCyberware(selectedCyberwareSlot)}>
                  Unequip {getItem(equippedCyberwareId)?.name ?? "current cyberware"}
                </button>
              )}
              {selectedItem.useEffect && <button className="secondary-button full" onClick={() => onUse(activeId)}>Use</button>}
              {selectedItem.maxUpgradeLevel && <button className="secondary-button full" disabled={!selectedCanUpgrade} onClick={() => onUpgrade(activeId)}>Upgrade</button>}
            </div>
          </div>
        ) : (
          <p className="muted">Select an item slot to inspect its stats and options.</p>
        )}
      </article>
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
            "Rare items may require bosses, operations, factions, or Black Market sources.",
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
      <div className="card-list">
        {sortedRecipes.map((recipe) => {
          const output = getItem(recipe.outputItemId);
          const levelLocked = state.skills[recipe.requiredSkill].level < recipe.requiredLevel;
          const blueprintLocked = Boolean(recipe.requiredBlueprint && !state.unlockedBlueprints[recipe.requiredBlueprint]);
          const locked = levelLocked || blueprintLocked;
          const costs = scaledCraftingCosts(state, recipe);
          const missingEntries = Object.entries(costs).filter(([id, amount]) => getOwnedCount(state, id) < amount);
          const missing = missingEntries.length > 0;
          const active = state.activeCraft?.recipeId === recipe.id;
          const craftable = !locked && !missing;
          const progress = active && state.activeCraft ? activityProgress(state.activeCraft.startedAt, state.activeCraft.durationMs) : null;
          const lockReasons = [
            levelLocked ? `Requires ${skillNames[recipe.requiredSkill]} level ${recipe.requiredLevel}. Current ${state.skills[recipe.requiredSkill].level}.` : null,
            blueprintLocked && recipe.requiredBlueprint ? `Requires ${getItem(recipe.requiredBlueprint)?.name ?? recipe.requiredBlueprint}.` : null,
            missing ? `Missing ${missingEntries.map(([id, amount]) => `${(amount - getOwnedCount(state, id)).toLocaleString()} ${getItem(id)?.name ?? resourceNames[id as ResourceId] ?? id}`).join(", ")}.` : null,
          ].filter(Boolean) as string[];
          return (
            <article className={`action-card vertical crafting-recipe-card rarity-${(output?.rarity ?? "Common").toLowerCase()} ${active ? "active-card" : ""} ${craftable ? "craftable-card" : ""} ${locked ? "locked-card" : ""} ${missing ? "missing-card" : ""}`} key={recipe.id}>
              <div>
                <p className="eyebrow">{output?.rarity ?? "Common"} / {recipe.category} / {formatDuration(adjustedDurationMs(state, recipe.durationMs, recipe.tags))}</p>
                <h3>{recipe.name}</h3>
                <p className="muted">Creates {recipe.outputQuantity} {output?.name ?? recipe.outputItemId}.</p>
                {lockReasons.length > 0 && (
                  <div className="craft-lockout">
                    {lockReasons.map((reason) => <p key={reason}>{reason}</p>)}
                  </div>
                )}
                <RequirementBulletList title="Skill Requirement">
                  <span className={levelLocked ? "requirement-row missing" : "requirement-row met"}>{skillNames[recipe.requiredSkill]} Level {state.skills[recipe.requiredSkill].level} / {recipe.requiredLevel}</span>
                </RequirementBulletList>
                {recipe.requiredBlueprint && (
                  <RequirementBulletList title="Blueprint Requirement" warning={blueprintLocked}>
                    <ClickableItemRequirement state={state} itemId={recipe.requiredBlueprint} required={1} warning={blueprintLocked} onOpen={(itemId, usedAmount) => setSourceItem({ itemId, usedAmount })} />
                  </RequirementBulletList>
                )}
                <RequirementBulletList title="Required Materials">
                  {Object.entries(costs).map(([id, amount]) => (
                    <ClickableItemRequirement key={id} state={state} itemId={id} required={amount} warning={getOwnedCount(state, id) < amount} onOpen={(itemId, usedAmount) => setSourceItem({ itemId, usedAmount })} />
                  ))}
                </RequirementBulletList>
                {missing && (
                  <RequirementBulletList title="Missing" warning>
                    {missingEntries.map(([id, amount]) => (
                      <ClickableItemRequirement key={id} state={state} itemId={id} required={amount} warning onOpen={(itemId, usedAmount) => setSourceItem({ itemId, usedAmount })} />
                    ))}
                  </RequirementBulletList>
                )}
                <RequirementBulletList title="Rewards">
                  <span className="requirement-row">{recipe.outputQuantity} {output?.name ?? recipe.outputItemId}</span>
                  <span className="requirement-row">+{recipe.xpReward} XP</span>
                  <span className="requirement-row">+{recipe.masteryXpReward} Mastery XP</span>
                </RequirementBulletList>
                <TagList tags={recipe.tags} />
              </div>
              <CardActionFooter
                active={active}
                progress={progress}
                locked={locked}
                disabled={missing}
                startLabel={locked ? "Locked" : missing ? "Missing" : "Start"}
                stopLabel="Stop Craft"
                onStart={() => onCraft(recipe.id)}
                onStop={onStopCraft}
              />
            </article>
          );
        })}
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

function PerksPanel({
  state,
  onBuyPerk,
  onRespecPerks,
}: {
  state: GameState;
  onBuyPerk: (id: string) => void;
  onRespecPerks: () => void;
}) {
  const [tree, setTree] = useState<PerkTreeId>("core");
  const [selectedPerkId, setSelectedPerkId] = useState<string | null>(null);
  const treeInfo = perkTrees.find((entry) => entry.id === tree)!;
  const spent = spentPerkPoints(state);
  const available = availablePerkPoints(state);
  const treePoints = treeInvestment(state, tree);
  const treePerks = perks.filter((perk) => perk.tree === tree);
  const tiers = [...new Set(treePerks.map((perk) => perk.tier))].sort((a, b) => a - b);
  const selectedPerk = selectedPerkId ? perks.find((perk) => perk.id === selectedPerkId) ?? null : null;
  return (
    <article className="panel perk-tree-panel">
      <PerkPointSummary state={state} selectedTree={tree} onRespecPerks={onRespecPerks} />
      <PerkTreeTabs state={state} selectedTree={tree} onSelectTree={(nextTree) => {
        setTree(nextTree);
        setSelectedPerkId(null);
      }} />
      <PerkTreeHeader tree={tree} available={available} treePoints={treePoints} />
      {tiers.map((tier) => (
        <PerkTierSection
          key={tier}
          state={state}
          tree={tree}
          tier={tier}
          perks={treePerks.filter((perk) => perk.tier === tier)}
          selectedPerkId={selectedPerkId}
          onSelectPerk={setSelectedPerkId}
          onBuyPerk={onBuyPerk}
        />
      ))}
      <PerkDetailsDrawer state={state} perk={selectedPerk} onClose={() => setSelectedPerkId(null)} onBuyPerk={onBuyPerk} />
    </article>
  );
}

function PerkPointSummary({ state, selectedTree, onRespecPerks }: { state: GameState; selectedTree: PerkTreeId; onRespecPerks: () => void }) {
  const earned = Math.max(state.perkPointsEarned, earnedPerkPoints(state));
  const spent = spentPerkPoints(state);
  const available = availablePerkPoints(state);
  const selectedTreeInfo = perkTrees.find((tree) => tree.id === selectedTree)!;
  return (
    <div className="perk-point-summary">
      <span><b>Available</b> {available}</span>
      <span><b>Total</b> {earned}</span>
      <span><b>Spent</b> {spent}</span>
      <span><b>{selectedTreeInfo.name}</b> {treeInvestment(state, selectedTree)}</span>
      <button className="secondary-button" disabled={spent <= 0 || state.resources.credits < respecCost(state)} onClick={onRespecPerks}>
        Respec {respecCost(state)}
      </button>
    </div>
  );
}

function PerkTreeTabs({ state, selectedTree, onSelectTree }: { state: GameState; selectedTree: PerkTreeId; onSelectTree: (tree: PerkTreeId) => void }) {
  return (
    <div className="perk-tree-tabs" role="tablist" aria-label="Perk trees">
      {perkTrees.map((tree) => {
        const points = treeInvestment(state, tree.id);
        const isActive = selectedTree === tree.id;
        return (
          <button
            key={tree.id}
            role="tab"
            aria-selected={isActive}
            className={`perk-tree-tab ${isActive ? "active" : ""} tree-${tree.color}`}
            onClick={() => onSelectTree(tree.id)}
          >
            <span className="perk-tree-icon"><BrainCircuit size={16} /></span>
            <span>{tree.name}</span>
            <strong>{points}</strong>
          </button>
        );
      })}
    </div>
  );
}

function PerkTreeHeader({ tree, available, treePoints }: { tree: PerkTreeId; available: number; treePoints: number }) {
  const treeInfo = perkTrees.find((entry) => entry.id === tree)!;
  const nextMilestone = specializationMilestones.filter((milestone) => milestone.tree === tree && milestone.points > treePoints).sort((a, b) => a.points - b.points)[0]
    ?? specializationMilestones.filter((milestone) => milestone.tree === tree).sort((a, b) => b.points - a.points)[0];
  const currentMilestone = specializationMilestones.filter((milestone) => milestone.tree === tree && milestone.points <= treePoints).sort((a, b) => b.points - a.points)[0];
  return (
    <div className={`perk-tree-header tree-${treeInfo.color}`}>
      <div>
        <p className="eyebrow">Selected Archetype</p>
        <h2>{treeInfo.name}</h2>
        <p className="muted">{treeInfo.identity}</p>
      </div>
      <div className="perk-header-stats">
        <span><b>{treePoints}</b> Tree Points</span>
        <span><b>{available}</b> Available</span>
      </div>
      <TreeMilestoneBar tree={tree} treePoints={treePoints} />
      <div className="perk-milestone-copy">
        <span>Next Milestone: <strong>{nextMilestone ? `${nextMilestone.points} points - ${nextMilestone.name}` : "Complete"}</strong></span>
        <span>Current Bonus: <strong>{currentMilestone ? currentMilestone.description : "No tree milestone unlocked yet"}</strong></span>
      </div>
    </div>
  );
}

function TreeMilestoneBar({ tree, treePoints }: { tree: PerkTreeId; treePoints: number }) {
  const treeMilestones = specializationMilestones.filter((milestone) => milestone.tree === tree).sort((a, b) => a.points - b.points);
  const next = treeMilestones.find((milestone) => milestone.points > treePoints) ?? treeMilestones[treeMilestones.length - 1];
  const previous = [...treeMilestones].reverse().find((milestone) => milestone.points <= treePoints);
  const start = previous && previous.points !== next.points ? previous.points : 0;
  const target = Math.max(next.points, 1);
  const progress = next.points <= treePoints ? 100 : Math.min(100, Math.max(0, ((treePoints - start) / (target - start)) * 100));
  return (
    <div className="tree-milestone-bar">
      <div className="tree-milestone-track"><span style={{ width: `${progress}%` }} /></div>
      <div className="tree-milestone-pips">
        {treeMilestones.map((milestone) => (
          <span key={milestone.points} className={treePoints >= milestone.points ? "complete" : ""}>{milestone.points}</span>
        ))}
      </div>
    </div>
  );
}

function PerkTierSection({
  state,
  tree,
  tier,
  perks: tierPerks,
  selectedPerkId,
  onSelectPerk,
  onBuyPerk,
}: {
  state: GameState;
  tree: PerkTreeId;
  tier: number;
  perks: PerkDefinition[];
  selectedPerkId: string | null;
  onSelectPerk: (id: string) => void;
  onBuyPerk: (id: string) => void;
}) {
  const treeInfo = perkTrees.find((entry) => entry.id === tree)!;
  const requiredPoints = tier <= 1 ? 0 : (tier - 1) * 3;
  return (
    <section className="perk-tier-section">
      <div className="perk-tier-heading">
        <div>
          <p className="eyebrow">Tier {tier}</p>
          <h3>{tier <= 1 ? "Open Access" : `Requires ${requiredPoints} points spent in ${treeInfo.name}`}</h3>
        </div>
      </div>
      <div className="perk-card-grid">
        {tierPerks.map((perk) => (
          <PerkCard
            key={perk.id}
            state={state}
            perk={perk}
            selected={selectedPerkId === perk.id}
            onSelect={() => onSelectPerk(perk.id)}
            onBuyPerk={onBuyPerk}
          />
        ))}
      </div>
    </section>
  );
}

function PerkCard({ state, perk, selected, onSelect, onBuyPerk }: { state: GameState; perk: PerkDefinition; selected: boolean; onSelect: () => void; onBuyPerk: (id: string) => void }) {
  const rank = state.perkRanks[perk.id] ?? 0;
  const canBuy = canBuyPerk(state, perk);
  const maxed = rank >= perk.maxRanks;
  const status = maxed ? "maxed" : rank > 0 ? "purchased" : canBuy ? "available" : "locked";
  return (
    <button type="button" className={`perk-card ${status} ${selected ? "selected" : ""}`} onClick={onSelect}>
      <div className="perk-card-top">
        <span className="perk-card-icon">{status === "locked" ? <Lock size={16} /> : <Star size={16} />}</span>
        <div>
          <h3>{perk.name}</h3>
          <p>{perk.description}</p>
        </div>
      </div>
      <div className="perk-badge-row">
        <PerkStatusBadge label={status === "available" ? "Available" : status === "purchased" ? "Purchased" : status === "maxed" ? "Maxed" : "Locked"} tone={status === "locked" ? "danger" : status === "maxed" ? "gold" : "cyan"} />
        <span className="perk-mini-badge">Tier {perk.tier}</span>
        <span className="perk-mini-badge">Rank {rank}/{perk.maxRanks}</span>
        <span className="perk-mini-badge">Cost {perk.cost}</span>
      </div>
      <div className="modifier-chip-row">
        {modifierChipLabels(perk.modifiers as Record<string, unknown>).slice(0, 4).map((label) => <ModifierChip key={label} label={label} />)}
      </div>
      <RequirementChip state={state} perk={perk} />
      <PerkSpendButton state={state} perk={perk} onBuyPerk={onBuyPerk} />
    </button>
  );
}

function PerkSpendButton({ state, perk, onBuyPerk }: { state: GameState; perk: PerkDefinition; onBuyPerk: (id: string) => void }) {
  const rank = state.perkRanks[perk.id] ?? 0;
  const canBuy = canBuyPerk(state, perk);
  const maxed = rank >= perk.maxRanks;
  const needsPoints = !maxed && availablePerkPoints(state) < perk.cost;
  const label = maxed ? "Maxed" : canBuy ? "Spend Point" : needsPoints ? "Need Point" : "Locked";
  return (
    <span
      role="button"
      tabIndex={canBuy ? 0 : -1}
      className={`perk-spend-button ${canBuy ? "can-spend" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        if (canBuy) onBuyPerk(perk.id);
      }}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && canBuy) {
          event.preventDefault();
          event.stopPropagation();
          onBuyPerk(perk.id);
        }
      }}
    >
      {label}
    </span>
  );
}

function PerkStatusBadge({ label, tone }: { label: string; tone: "cyan" | "danger" | "gold" }) {
  return <span className={`perk-status-badge ${tone}`}>{label}</span>;
}

function ModifierChip({ label }: { label: string }) {
  return <span className="modifier-chip">{label}</span>;
}

function RequirementChip({ state, perk }: { state: GameState; perk: PerkDefinition }) {
  const rank = state.perkRanks[perk.id] ?? 0;
  const maxed = rank >= perk.maxRanks;
  const canBuy = canBuyPerk(state, perk);
  const label = maxed ? "Fully ranked" : canBuy ? "Requirements met" : perkLockReason(state, perk);
  return <span className={`perk-requirement-chip ${canBuy || maxed ? "met" : "locked"}`}>{label}</span>;
}

function PerkDetailsDrawer({ state, perk, onClose, onBuyPerk }: { state: GameState; perk: PerkDefinition | null; onClose: () => void; onBuyPerk: (id: string) => void }) {
  if (!perk) return null;
  const rank = state.perkRanks[perk.id] ?? 0;
  const nextRank = Math.min(perk.maxRanks, rank + 1);
  return (
    <div className="perk-details-drawer">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Perk Details / Rank {rank}/{perk.maxRanks}</p>
          <h2>{perk.name}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close perk details"><X size={18} /></button>
      </div>
      <p className="muted">{perk.description}</p>
      <div className="modifier-chip-row">
        {modifierChipLabels(perk.modifiers as Record<string, unknown>).map((label) => <ModifierChip key={label} label={label} />)}
      </div>
      <div className="perk-detail-grid">
        <span><b>Requirements</b>{perk.unlockRequirements.join(", ") || "None"}</span>
        <span><b>Prerequisites</b>{perk.prerequisites.length ? perk.prerequisites.map((id) => perks.find((entry) => entry.id === id)?.name ?? id).join(", ") : "None"}</span>
        <span><b>Next Rank</b>{rank >= perk.maxRanks ? "Maxed" : `Rank ${nextRank} improves listed effects again`}</span>
        <span><b>Affected Systems</b>{affectedSystems(perk.modifiers as Record<string, unknown>).join(", ") || "General progression"}</span>
      </div>
      <PerkSpendButton state={state} perk={perk} onBuyPerk={onBuyPerk} />
    </div>
  );
}

function perkLockReason(state: GameState, perk: PerkDefinition) {
  const rank = state.perkRanks[perk.id] ?? 0;
  if (rank >= perk.maxRanks) return "Maxed";
  if (availablePerkPoints(state) < perk.cost) return `Needs ${perk.cost} skill point${perk.cost === 1 ? "" : "s"}`;
  const missingPrereq = perk.prerequisites.find((id) => !state.perkRanks[id]);
  if (missingPrereq) return `Requires ${perks.find((entry) => entry.id === missingPrereq)?.name ?? missingPrereq}`;
  const neededTreePoints = perk.tier >= 2 ? (perk.tier - 1) * 3 : 0;
  if (neededTreePoints && treeInvestment(state, perk.tree) < neededTreePoints) {
    const treeName = perkTrees.find((entry) => entry.id === perk.tree)?.name ?? perk.tree;
    return `Requires ${neededTreePoints} ${treeName} points`;
  }
  return perk.unlockRequirements.join(", ") || "Locked";
}

function CharacterTab({
  state,
  section,
  onSection,
  onBuyPerk,
  onRecover,
  onAutoHealChange,
  onRespecPerks,
}: {
  state: GameState;
  section: CharacterSectionId;
  onSection: (section: CharacterSectionId) => void;
  onBuyPerk: (id: string) => void;
  onRecover: (mode: "basic" | "paid" | "full") => void;
  onAutoHealChange: (patch: Partial<GameState["autoHeal"]>) => void;
  onRespecPerks: () => void;
}) {
  const stats = playerCombatStats(state);
  const maxHp = calculateMaxHP(state);
  const path = startingPaths.find((entry) => entry.id === state.startingPath);
  const scores = archetypeScores(state);
  const signature = detectedSignatureBuild(state);
  return (
    <section className="stack character-tab">
      <div className="district-tabs character-tabs">
        {characterSections.map((tabSection) => (
          <button
            key={tabSection.id}
            className={section === tabSection.id ? "active" : ""}
            onClick={() => onSection(tabSection.id)}
          >
            {tabSection.label}
          </button>
        ))}
      </div>

      {section === "profile" && (
        <>
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Runner profile</p>
            <h2>Character</h2>
          </div>
          <UserRound size={22} />
        </div>
        {path && (
          <div className="character-path-card">
            <img src={startingPathImages[path.id]} alt="" />
            <div>
              <p className="eyebrow">Starting Path</p>
              <h3>{path.name}</h3>
              <p className="muted">{path.theme}</p>
            </div>
          </div>
        )}
        <div className="inventory-grid">
          <Metric label="Current HP" value={state.health.currentHp} />
          <Metric label="Max HP" value={stats.maxHp} />
          <Metric label="Damage" value={stats.damage} />
          <Metric label="Attack Speed" value={stats.attackSpeedMs / 1000} />
          <Metric label="Armor" value={stats.armor} />
          <Metric label="Total Level" value={totalLevel(state)} />
          <Metric label="Heat" value={state.resources.heat} />
        </div>
      </article>
        </>
      )}

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
              <span className="muted">{state.autoHeal.unlocked ? "Consumes selected healing items in combat." : "Unlocks at Street Combat level 5 or after finding healing items."}</span>
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

      {section === "build" && (
        <>
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Detected identity</p>
            <h2>{signature?.name ?? scores[0]?.name ?? "Unshaped Runner"}</h2>
          </div>
          <BrainCircuit size={22} />
        </div>
        <p className="muted">{signature?.description ?? "Your strongest archetypes update from skills, gear, cyberware, housing, factions, companions, vehicles, and perks."}</p>
        <div className="card-list compact">
          {scores.map((score) => (
            <div className="resource-card" key={score.id}>
              <span>{score.name}</span>
              <strong>{score.percent}%</strong>
              <Progress value={score.percent} />
            </div>
          ))}
        </div>
      </article>
      <PerksPanel state={state} onBuyPerk={onBuyPerk} onRespecPerks={onRespecPerks} />
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

      {section === "skills" && (
        <>
      <article className="panel">
        <h2>Skills</h2>
        <div className="inventory-grid">
          {skillOrder.map((skill) => <Metric key={skill} label={skillNames[skill]} value={state.skills[skill].level} />)}
        </div>
      </article>
      <article className="panel">
        <h2>Weapon Classes</h2>
        <div className="card-list">
          {weaponClassOrder.map((classId) => {
            const weaponClass = weaponClasses.find((entry) => entry.id === classId)!;
            const progress = state.weaponClasses[classId] ?? { level: 1, xp: 0, manuallyUsed: false, milestones: {} };
            const bestOwned = Object.keys(state.inventory).map((id) => getItem(id)).find((item) => item?.type === "Weapon" && item.weaponClass === classId);
            return (
              <ActivityCard key={classId} locked={!progress.manuallyUsed && progress.level <= 1}>
                <div>
                  <p className="eyebrow">Level {progress.level} / Kills {state.weaponStatistics.killsByClass[classId] ?? 0}</p>
                  <h3>{weaponClass.name}</h3>
                  <p className="muted">{weaponClass.description}</p>
                  <Progress value={(progress.xp / weaponXpForNextLevel(progress.level)) * 100} label={`${progress.xp} / ${weaponXpForNextLevel(progress.level)} XP`} />
                  <p className="fine">Milestones: {weaponClass.milestones.filter((milestone) => progress.milestones[milestone.level]).map((milestone) => milestone.name).join(", ") || "None"}</p>
                  <p className="fine">Best owned: {bestOwned?.name ?? "None"}</p>
                </div>
              </ActivityCard>
            );
          })}
        </div>
      </article>
        </>
      )}

    </section>
  );
}

type LoadoutSectionId = "gear" | "cyberware" | "presets";

const loadoutSections: Array<{ id: LoadoutSectionId; label: string }> = [
  { id: "gear", label: "Gear" },
  { id: "cyberware", label: "Cyberware" },
  { id: "presets", label: "Presets" },
];

function LoadoutTab({
  state,
  onEquip,
  onUnequipCyberware,
  onUpgrade,
  onSavePreset,
  onLoadPreset,
  onAutoEquip,
}: {
  state: GameState;
  onEquip: (id: string) => void;
  onUnequipCyberware: (slot: CyberwareSlot) => void;
  onUpgrade: (id: string) => void;
  onSavePreset: (name: string) => void;
  onLoadPreset: (name: string) => void;
  onAutoEquip: (mode: "combat" | "hacking" | "scavenging" | "lowInstability") => void;
}) {
  const [loadoutSection, setLoadoutSection] = useState<LoadoutSectionId>("gear");
  const [inspectedEquipment, setInspectedEquipment] = useState<
    { kind: "gear"; slot: GearSlot } | { kind: "cyberware"; slot: CyberwareSlot } | null
  >(null);
  const inspectedItemId = inspectedEquipment
    ? inspectedEquipment.kind === "gear"
      ? state.equippedGear[inspectedEquipment.slot]
      : state.equippedCyberware[inspectedEquipment.slot]
    : undefined;

  return (
    <section className="stack character-tab">
      <div className="district-tabs character-tabs">
        {loadoutSections.map((section) => (
          <button
            key={section.id}
            className={loadoutSection === section.id ? "active" : ""}
            onClick={() => setLoadoutSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {loadoutSection === "gear" && (
        <>
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Equipment loadout</p>
                <h2>Gear</h2>
              </div>
              <Shield size={22} />
            </div>
            <div className="slot-grid">
              {gearSlots.map((slot) => {
                const itemId = state.equippedGear[slot.id];
                const item = itemId ? getItem(itemId) : undefined;
                const active = inspectedEquipment?.kind === "gear" && inspectedEquipment.slot === slot.id;
                return (
                  <button className={`slot-card ${active ? "active" : ""}`} key={slot.id} onClick={() => setInspectedEquipment({ kind: "gear", slot: slot.id })}>
                    <EquipmentTypeIconBadge item={item} fallbackSlot={slot.id} fallbackKind="gear" />
                    <span>{slot.label}</span>
                    <strong>{itemId ? `${item?.name ?? itemId}${state.upgradeLevels[itemId] ? ` +${state.upgradeLevels[itemId]}` : ""}` : "Empty"}</strong>
                  </button>
                );
              })}
            </div>
          </article>
          {inspectedEquipment?.kind === "gear" && (
            <EquipmentInspectPanel
              state={state}
              kind={inspectedEquipment.kind}
              slot={inspectedEquipment.slot}
              itemId={inspectedItemId}
            />
          )}
        </>
      )}

      {loadoutSection === "cyberware" && (
        <CyberwareScreen
          state={state}
          selectedSlot={inspectedEquipment?.kind === "cyberware" ? inspectedEquipment.slot : null}
          onSelectSlot={(slot) => setInspectedEquipment({ kind: "cyberware", slot })}
          onClose={() => setInspectedEquipment(null)}
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
            <button className="primary-button full" onClick={() => onAutoEquip("combat")}>Best Combat</button>
            <button className="primary-button full" onClick={() => onAutoEquip("hacking")}>Best Hacking</button>
            <button className="primary-button full" onClick={() => onAutoEquip("scavenging")}>Best Scavenging</button>
            <button className="primary-button full" onClick={() => onAutoEquip("lowInstability")}>Low Instability</button>
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
                  <button className="secondary-button full" onClick={() => onLoadPreset(name)}>Load</button>
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
              <button className="secondary-button full" disabled={!canAffordItemUpgrade(state, equippedItem.id)} onClick={() => onUpgrade(equippedItem.id)}>
                Upgrade {formatItemCost(itemUpgradeCost(state, equippedItem.id))}
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
                {item.requiredSkill && <small>Requires {skillNames[item.requiredSkill]} Lv {item.requiredLevel ?? 1}</small>}
              </div>
              <div className="card-list compact">
                <button className="primary-button full" disabled={installed || !canInstall} onClick={() => onEquip(itemId)}>
                  {installed ? "Installed" : "Equip"}
                </button>
                {item.maxUpgradeLevel && (
                  <button className="secondary-button full" disabled={!canAffordItemUpgrade(state, itemId)} onClick={() => onUpgrade(itemId)}>
                    Upgrade
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
  if (item.requiredSkill && state.skills[item.requiredSkill].level < (item.requiredLevel ?? 1)) return false;
  return true;
}

function EquipmentInspectPanel({
  state,
  kind,
  slot,
  itemId,
}: {
  state: GameState;
  kind: "gear" | "cyberware";
  slot: GearSlot | CyberwareSlot;
  itemId?: string;
}) {
  const item = itemId ? getItem(itemId) : undefined;
  const slotLabel = kind === "gear"
    ? gearSlots.find((entry) => entry.id === slot)?.label
    : cyberwareSlots.find((entry) => entry.id === slot)?.label;

  return (
    <article className={`equipment-inspect-panel ${item ? `rarity-${item.rarity.toLowerCase()}` : ""}`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{slotLabel ?? titleCase(String(slot))}</p>
          <h2>{item ? `${item.name}${state.upgradeLevels[item.id] ? ` +${state.upgradeLevels[item.id]}` : ""}` : "Empty Slot"}</h2>
        </div>
        <EquipmentTypeIconBadge item={item} fallbackSlot={slot} fallbackKind={kind} />
      </div>
      {item ? (
        <div className="equipment-inspect-body">
          <p className="muted">{item.description}</p>
          <p className="fine">Type: {item.rarity} {item.type}</p>
          {item.stats && <p className="fine">Stats: {formatStats(scaledStats(state, item.id))}</p>}
          {item.modifiers && <p className="fine">Modifiers: {formatItemModifiers(item.modifiers)}</p>}
          {item.type === "Cyberware" ? <p className="fine">Equipped Instability {formatSigned(cyberwareInstabilityLoad(item))}</p> : null}
          <p className="fine">Used for: {itemUseSummary(item.id)}</p>
          <p className="fine">Source: {item.sourceHint}</p>
        </div>
      ) : (
        <p className="muted">Tap an equipped item slot to inspect its stats. Unequip from the Inventory tab.</p>
      )}
    </article>
  );
}

function MoreTab({
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
    <section className="stack">
      <article className="panel">
        <div className="segmented">
          {(["story", "companions", "simCache", ...(isDevBuild ? ["balance" as MoreSection] : []), "settings"] as MoreSection[]).map((id) => (
            <button key={id} className={section === id ? "active" : ""} onClick={() => onSection(id)}>
              {titleCase(id)}
            </button>
          ))}
        </div>
      </article>
      {section === "story" && <StorySection state={state} onChoice={onStoryChoice} />}
      {section === "companions" && <CompanionsSection state={state} onGift={onGift} onSpendTime={onSpendTime} onSetCompanion={onSetCompanion} />}
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
      <RecentLog state={state} />
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
              value={`A${district.actions} C${district.contracts} E${district.combatEnemies} O${district.operations}`}
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
          <p>Story files update from normal idle progress: skill actions, contracts, enemies, operations, district standing, Heat cleanup, and choices.</p>
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

      <ActivityGroup title="Operation Leads">
        {operations.map((operation) => (
          <ActivityCard key={operation.id} locked={!state.operationLeads[operation.id]}>
            <div>
              <p className="eyebrow">{getDistrict(operation.districtId)?.name ?? operation.districtId}</p>
              <h3>{operation.name}</h3>
              <p className="fine">{state.operationLeads[operation.id] || state.operationLogs[operation.id]?.firstClear ? "Lead discovered" : "Lead unknown"}</p>
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

function FixersSection({ state, onStartJob, onStopActive }: { state: GameState; onStartJob: (id: string) => void; onStopActive: () => void }) {
  const path = startingPaths.find((entry) => entry.id === state.startingPath);
  return (
    <section className="stack">
      {fixers.map((fixer) => {
        const district = districts.find((entry) => entry.id === fixer.districtId);
        const faction = factions.find((entry) => entry.id === fixer.factionId);
        const trust = state.fixerTrust[fixer.id]?.trust ?? 0;
        const rank = fixerTrustRank(state, fixer.id);
        const fixerJobs = jobs.filter((job) => job.fixerId === fixer.id);
        return (
          <article className="panel" key={fixer.id}>
            <p className="eyebrow">{district?.name} / {faction?.name} / Trust Rank {rank} / {trust}</p>
            <h2>{fixer.name}</h2>
            <p className="muted">{fixer.specialty}</p>
            <p className="fine">Path note: {path ? fixer.startingPathNotes[path.id] ?? "No special modifier yet." : "Choose a path."}</p>
            <p className="fine">Companions: {fixer.companionUnlocks.join(", ")}</p>
            <p className="fine">Housing: {fixer.housingUnlocks.join(", ")}</p>
            <p className="fine">Job chains: {fixer.jobChains.join(", ")}</p>
            <p className="fine">Leads: {fixerUnlockSummary(fixer).join(", ") || "None"}</p>
            <div className="terminal-log">
              {fixerTrustRewards(fixer).map((reward) => (
                <p key={reward.rank}>{rank >= reward.rank ? "[unlocked]" : "[locked]"} Rank {reward.rank}: {reward.description}</p>
              ))}
            </div>
            <div className="card-list">
              {fixerJobs.map((job) => {
                return (
                  <ContractMissionCard
                    key={job.id}
                    state={state}
                    job={job}
                    onStart={() => onStartJob(job.id)}
                    onStop={onStopActive}
                  />
                );
              })}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function DistrictsSection({ state }: { state: GameState }) {
  return (
    <section className="stack">
      {districts.map((district) => {
        const districtState = state.districts[district.id];
        return (
          <article className="panel" key={district.id}>
            <p className="eyebrow">{districtState?.unlocked ? "Unlocked" : "Locked"} / {districtState?.unlockProgress ?? 0}%</p>
            <h2>{district.name}</h2>
            <p className="muted">{district.description}</p>
            <p className="fine">Threat: {state.districtThreat[district.id]?.level ?? 0} / {threatTier(state.districtThreat[district.id]?.level ?? 0)}</p>
            <p className="fine">Threat effects: higher rewards and rare drops, lower job success, higher Heat, higher shop prices.</p>
            <p className="fine">Unlock: {district.unlockRequirements.join(", ")}</p>
            <p className="fine">Factions: {district.associatedFactions.map((id) => factions.find((faction) => faction.id === id)?.name ?? id).join(", ")}</p>
            <p className="fine">Housing: {district.housingOptions.join(", ")}</p>
            <p className="fine">Operations: {operations.filter((operation) => operation.districtId === district.id).map((operation) => operation.name).join(", ") || "None yet"}</p>
            <p className="fine">Jobs: {district.jobModifiers.join(", ")}</p>
            <p className="fine">Shops: {district.shopModifiers.join(", ")}</p>
            <p className="fine">Lower threat: clear operations, complete cleanup jobs, gain faction support, or settle into safer housing.</p>
          </article>
        );
      })}
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
            </div>
            <div className="card-list compact">
              {owned ? (
                <>
                  <button className="primary-button full" disabled={active} onClick={() => onSetVehicle(vehicle.id)}>
                    {active ? "Active" : "Set Active"}
                  </button>
                  <button className="secondary-button full" disabled={level >= vehicle.maxUpgradeLevel} onClick={() => onUpgradeVehicle(vehicle.id)}>
                    Upgrade
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
        <Metric label="Operations" value={Object.values(state.operationLogs).filter((log) => log.firstClear).length} />
        <Metric label="Boss Kills" value={Object.values(state.bossLogs).reduce((sum, log) => sum + log.kills, 0)} />
        <Metric label="Vehicles" value={Object.values(state.ownedVehicles).filter(Boolean).length} />
        <Metric label="Achievements" value={Object.values(state.achievements).filter(Boolean).length} />
      </div>
    </article>
  );
}

type EndgameTab = "legend" | "challenges" | "threat" | "legacy" | "collection" | "prestige";
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

function ProgressTab({ state }: { state: GameState }) {
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
      <ProgressDropdown id="endgame" title="Street Legend" eyebrow="Long-term account progression" open={openSections.endgame} onOpenChange={setSectionOpen}>
        <EndgameSection state={state} activeTab={endgameTab} onTab={setEndgameTab} />
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
      <ProgressDropdown id="operations" title="Operation Logs" eyebrow="Clears, best times, and drops" open={openSections.operations} onOpenChange={setSectionOpen}>
        <OperationLogsPanel state={state} />
      </ProgressDropdown>
      <ProgressDropdown id="bosses" title="Boss Logs" eyebrow="Kills, matchups, and mechanics" open={openSections.bosses} onOpenChange={setSectionOpen}>
        <BossLogsPanel state={state} />
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
                <p className="fine">Housing {completion.housing}% / Factions {completion.factions}% / Operations {completion.operations}% / Vendors {completion.vendors}%</p>
              </div>
            </ActivityCard>
          );
        })}
      </div>
    </NeonPanel>
  );
}

function OperationLogsPanel({ state }: { state: GameState }) {
  return (
    <NeonPanel>
      <h2>Operation Logs</h2>
      <div className="card-list">
        {operations.map((operation) => {
          const log = state.operationLogs[operation.id] ?? { clears: 0, bestClearMs: null, firstClear: false, drops: {} };
          return (
            <ActivityCard key={operation.id}>
              <div>
                <p className="eyebrow">{getDistrict(operation.districtId)?.name}</p>
                <h3>{operation.name}</h3>
                <p className="fine">Clears {log.clears} / Best {log.bestClearMs ? formatDuration(log.bestClearMs) : "--"} / First clear {log.firstClear ? "Yes" : "No"}</p>
                <p className="fine">Drops: {Object.entries(log.drops).map(([id, amount]) => `${amount} ${getItem(id)?.name ?? id}`).join(", ") || "None"}</p>
              </div>
            </ActivityCard>
          );
        })}
      </div>
    </NeonPanel>
  );
}

function BossLogsPanel({ state }: { state: GameState }) {
  return (
    <NeonPanel>
      <h2>Boss Logs</h2>
      <div className="card-list">
        {bosses.map((boss) => {
          const log = state.bossLogs[boss.id] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
          const matchup = combatEffectivenessForEnemy(state, boss, ["operation", "boss"]);
          return (
            <ActivityCard key={boss.id}>
              <div>
                <p className="eyebrow">{boss.mechanics.join(", ")} / {matchup.rating}</p>
                <h3>{boss.name}</h3>
                <p className="fine">Kills {log.kills} / Best {log.bestKillMs ? formatDuration(log.bestKillMs) : "--"}</p>
                <p className="fine">Weak: {(boss.weaknesses ?? []).map((entry) => entry.id).join(", ") || "None"} / Resist: {(boss.resistances ?? []).map((entry) => entry.id).join(", ") || "None"}</p>
                {boss.phases?.length ? <p className="fine">Phases: {boss.phases.map((phase) => `${phase.name} ${phase.thresholdPercent}%`).join(", ")}</p> : null}
                <TagList tags={[...(boss.traits ?? []), ...(boss.recommendedLoadoutTags ?? [])].slice(0, 10)} />
              </div>
            </ActivityCard>
          );
        })}
      </div>
    </NeonPanel>
  );
}

function EndgameSection({ state, activeTab, onTab }: { state: GameState; activeTab: EndgameTab; onTab: (tab: EndgameTab) => void }) {
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
        {(["legend", "challenges", "threat", "legacy", "collection", "prestige"] as EndgameTab[]).map((tab) => (
          <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => onTab(tab)}>
            {titleCase(tab)}
          </button>
        ))}
      </div>
      {activeTab === "legend" && <LegendPanel state={state} />}
      {activeTab === "challenges" && <ChallengesPanel state={state} />}
      {activeTab === "threat" && <HighThreatPanel state={state} />}
      {activeTab === "legacy" && <LegacyCraftingPanel state={state} />}
      {activeTab === "collection" && <CollectionRewardsPanel state={state} />}
      {activeTab === "prestige" && <PrestigePanel state={state} />}
    </NeonPanel>
  );
}

function LegendPanel({ state }: { state: GameState }) {
  return (
    <div className="stack compact-stack">
      <div className="inventory-grid">
        <Metric label="Legend Rank" value={state.streetLegend.rank} />
        <Metric label="Challenge Tiers" value={state.endgameStatistics.challengeContractsCompleted} />
        <Metric label="Boss Kills" value={Object.values(state.bossLogs).reduce((sum, log) => sum + log.kills, 0)} />
        <Metric label="High Threat Clears" value={state.endgameStatistics.highThreatClears} />
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
            <p className="eyebrow">{challenge.districtId ? getDistrict(challenge.districtId)?.name : "Account"} / Challenge Contract</p>
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

function HighThreatPanel({ state }: { state: GameState }) {
  return (
    <div className="card-list">
      {highThreatOperations.map((entry) => {
        const unlocked = highThreatOperationUnlocked(state, entry);
        return (
          <ActivityCard key={entry.id} locked={!unlocked}>
            <div>
              <p className="eyebrow">{getDistrict(entry.districtId)?.name} / {unlocked ? "Available" : "Locked"}</p>
              <h3>{entry.name}</h3>
              <p className="fine">Base operation: {operations.find((operation) => operation.id === entry.baseOperationId)?.name ?? entry.baseOperationId}</p>
              <p className="fine">Requirements: {entry.unlockRequirements.join(", ")}</p>
              <p className="fine">Rewards: {entry.rewards.join(", ")}</p>
            </div>
          </ActivityCard>
        );
      })}
    </div>
  );
}

function LegacyCraftingPanel({ state }: { state: GameState }) {
  return (
    <div className="card-list">
      {legacyCraftingGoals.map((goal) => (
        <ActivityCard key={goal.id} locked={state.streetLegend.rank < 30}>
          <div>
            <p className="eyebrow">{goal.category}</p>
            <h3>{goal.name}</h3>
            <p className="fine">Requirements: {goal.requirements.join(", ")}</p>
            <div className="requirement-list">
              {Object.entries(goal.materials).slice(0, 6).map(([id, amount]) => (
                <span key={id} className={`requirement-row ${getOwnedCount(state, id) < amount ? "missing" : ""}`}>
                  {getItem(id)?.name ?? resourceNames[id as ResourceId] ?? id}
                  <strong>{getOwnedCount(state, id).toLocaleString()} / {amount.toLocaleString()}</strong>
                </span>
              ))}
            </div>
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

function CollectionRewardsPanel({ state }: { state: GameState }) {
  const discovered = Object.values(state.discoveredItems).filter(Boolean).length;
  const totalKnown = Math.max(1, Object.keys(itemNames).length);
  const percent = Math.min(100, Math.round((discovered / totalKnown) * 100));
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
            </div>
          </ActivityCard>
        ))}
      </div>
    </div>
  );
}

function PrestigePanel({ state }: { state: GameState }) {
  return (
    <div className="stack compact-stack">
      <div className="inventory-grid">
        <Metric label="Unlocked" value={state.prestigeProtocol.unlocked ? 1 : 0} />
        <Metric label="Prestige Count" value={state.endgameStatistics.prestigeCount} />
        <Metric label="Skill 99s" value={Object.values(state.skills).filter((skill) => skill.level >= 99).length} />
        <Metric label="District 99s" value={Object.values(state.districtMastery).filter((mastery) => mastery.level >= 99).length} />
      </div>
      <TerminalLog>
        {prestigeProtocolNotes.map((note) => <p key={note}>{note}</p>)}
      </TerminalLog>
    </div>
  );
}

function highThreatOperationUnlocked(state: GameState, entry: (typeof highThreatOperations)[number]) {
  return Boolean(state.operationLogs[entry.baseOperationId]?.firstClear) &&
    state.streetLegend.rank >= 25 &&
    (state.districtMastery[entry.districtId]?.level ?? 1) >= 15;
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
          <Metric label="Operation Clears" value={Object.values(state.operationLogs).reduce((sum, log) => sum + log.clears, 0)} />
          <Metric label="Boss Kills" value={Object.values(state.bossLogs).reduce((sum, log) => sum + log.kills, 0)} />
          <Metric label="Vehicles Owned" value={Object.values(state.ownedVehicles).filter(Boolean).length} />
          <Metric label="Vehicle +10" value={Object.values(state.vehicleUpgradeLevels).filter((level) => level >= 10).length} />
          <Metric label="Stable Districts" value={Object.values(state.districtThreat).filter((threat) => threat.level < 25).length} />
          <Metric label="Threat Lockdowns" value={Object.values(state.districtThreat).filter((threat) => threat.level >= 100).length} />
        </div>
      </article>
      <article className="panel">
        <h2>Build Progression</h2>
        <div className="inventory-grid">
          <Metric label="Perk Points Earned" value={Math.max(state.perkPointsEarned, earnedPerkPoints(state))} />
          <Metric label="Perk Points Spent" value={spentPerkPoints(state)} />
          <Metric label="Perks Ranked" value={Object.values(state.perkRanks).filter(Boolean).length} />
          <Metric label="Milestones" value={Object.values(state.specializationMilestones).filter(Boolean).length} />
          <Metric label="Respecs" value={state.respecCount} />
          <Metric label="Signature" value={detectedSignatureBuild(state) ? 1 : 0} />
        </div>
        <div className="card-list">
          {perkTrees.map((tree) => (
            <ActivityCard key={tree.id}>
              <div>
                <p className="eyebrow">{tree.identity}</p>
                <h3>{tree.name}</h3>
                <Progress value={Math.min(100, (treeInvestment(state, tree.id) / 75) * 100)} label={`${treeInvestment(state, tree.id)} / 75 points`} />
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
    if (key.includes("job") || key.includes("fixer")) return "Contracts";
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
    const candidates = owned.filter((item) => item?.slot === slot.id);
    const best = candidates.sort((a, b) => score(b!.id) - score(a!.id))[0];
    if (!best) return;
    if (best.type === "Cyberware") next.equippedCyberware[slot.id as CyberwareSlot] = best.id;
    if (best.type === "Weapon" || best.type === "Armor") next.equippedGear[slot.id as GearSlot] = best.id;
  });
  return next;
}

export default App;
