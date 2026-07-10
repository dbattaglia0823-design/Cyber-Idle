import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Backpack,
  BrainCircuit,
  Download,
  MoreHorizontal,
  Play,
  RotateCcw,
  Save,
  Square,
  Sword,
  Upload,
  UserRound,
} from "lucide-react";
import { companions } from "./data/companions";
import { combatZones } from "./data/combat";
import { districtEvents } from "./data/districtEvents";
import { districts } from "./data/districts";
import { factions } from "./data/factions";
import { fixers } from "./data/fixers";
import { housingOptions } from "./data/housing";
import { cyberwareSlots, itemNames } from "./data/items";
import { resourceNames, resourceOrder } from "./data/resources";
import { skillActions, skillDescriptions, skillNames, skillOrder } from "./data/skills";
import { startingPaths } from "./data/startingPaths";
import {
  canAffordRewards,
  formatRewards,
  startSkillAction,
  stopSkillAction,
  processActionCompletion,
} from "./systems/actionProcessing";
import { getEnemy, processCombat, startCombat, stopCombat } from "./systems/combatProcessing";
import { processCrafting, startCraft, stopCraft } from "./systems/craftingProcessing";
import { chooseStartingPath, cloneState, createInitialState } from "./systems/gameState";
import { canAttemptJob, processJobCompletion, startJob, stopJob } from "./systems/jobProcessing";
import { jobs } from "./data/jobs";
import { bosses } from "./data/bosses";
import { operations } from "./data/operations";
import { vehicles } from "./data/vehicles";
import { adjustedDurationMs, getActiveModifiers, jobSuccessChance } from "./systems/modifiers";
import { heatTier, neuralInstabilityTierName } from "./systems/riskEvents";
import {
  playerCombatStats,
  totalLevel,
  xpForNextLevel,
  xpForNextMastery,
} from "./systems/formulas";
import { applyOfflineProgress } from "./systems/offlineProgress";
import { exportSave, importSave, loadGame, resetSave, saveGame } from "./systems/saveSystem";
import { buyHousing, giveCompanionGift, setActiveCompanion, setActiveResidence, spendTimeWithCompanion } from "./systems/worldProgression";
import { recipes } from "./data/recipes";
import { getItem, gearSlots } from "./data/items";
import { cyberwareLoad, effectiveNeuralInstability, scaledStats } from "./systems/itemFormulas";
import { equipItem, unequipCyberware, unequipGear, useItem } from "./systems/equipmentSystem";
import { upgradeItem } from "./systems/upgradeSystem";
import { loadPreset, savePreset } from "./systems/presetSystem";
import { runBasicSimCache, simCacheEligibility } from "./systems/simCacheEngine";
import { getSimulationEfficiency } from "./systems/simulationEfficiency";
import { masteryPoolPercent, masteryPoolCheckpoints } from "./systems/masteryPool";
import { progressionTiers, tierProgress } from "./data/progressionTiers";
import { perkTrees, perks, specializationMilestones } from "./data/perks";
import { canStartOperation, processOperation, startOperation, stopOperation } from "./systems/operationProcessor";
import { buyVehicle, canBuyVehicle, garageSlots, setActiveVehicle, upgradeVehicle } from "./systems/vehicleSystem";
import { threatTier } from "./systems/districtThreat";
import { cityDistrictOrder, districtCompletionBreakdown, districtCompletionPercent, getDistrict } from "./data/cityMap";
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
import { canUseRipperdocService, useRipperdocService } from "./systems/ripperdocSystem";
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
import { archetypeScores, detectedSignatureBuild } from "./systems/archetypeScoring";
import { availablePerkPoints, buyPerk, canBuyPerk, earnedPerkPoints, respecCost, respecPerks, spentPerkPoints, treeInvestment, updatePerkProgress } from "./systems/perkSystem";
import type { CombatZone, CyberwareSlot, DistrictId, Enemy, GameState, GearSlot, PerkTreeId, ResourceId, SkillAction, SkillId, StartingPathId, VendorDefinition, VendorItemEntry } from "./types";

type TabId = "city" | "character" | "inventory" | "progress" | "more";

const tabs: Array<{ id: TabId; label: string; Icon: typeof Activity }> = [
  { id: "city", label: "City", Icon: Activity },
  { id: "inventory", label: "Inventory", Icon: Backpack },
  { id: "character", label: "Character", Icon: UserRound },
  { id: "progress", label: "Progress", Icon: Sword },
  { id: "more", label: "More", Icon: MoreHorizontal },
];

function App() {
  const [state, setState] = useState<GameState>(() => applyOfflineProgress(loadGame() ?? createInitialState()));
  const [tab, setTab] = useState<TabId>("city");
  const [now, setNow] = useState(Date.now());
  const [exported, setExported] = useState("");
  const [importPayload, setImportPayload] = useState("");
  const [moreSection, setMoreSection] = useState<MoreSection>("fixers");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setState((current) => {
      const next = processOperation(processCombat(processJobCompletion(processCrafting(processActionCompletion(current, Date.now()), Date.now()), Date.now()), Date.now()), Date.now());
      const progressState = next === current ? cloneState(current) : next;
      updatePerkProgress(progressState);
      const signature = detectedSignatureBuild(progressState);
      if (signature && progressState.signatureBuildCache !== signature.id) {
        progressState.signatureBuildCache = signature.id;
        progressState.achievements["first-signature-build"] = true;
      }
      return progressState;
    });
  }, [now]);

  useEffect(() => {
    const timer = window.setInterval(() => saveGame(state), 5000);
    return () => window.clearInterval(timer);
  }, [state]);

  useEffect(() => {
    saveGame(state);
  }, [
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
  ]);

  const activeAction = state.activeAction ? skillActions.find((action) => action.id === state.activeAction?.actionId) : null;
  const activeEnemy = state.currentCombat ? getEnemy(state.currentCombat.enemyId) : null;
  const activeJob = state.activeJob ? jobs.find((job) => job.id === state.activeJob?.jobId) : null;
  const activeCraft = state.activeCraft ? recipes.find((recipe) => recipe.id === state.activeCraft?.recipeId) : null;
  const activeOperation = state.activeOperation ? operations.find((operation) => operation.id === state.activeOperation?.operationId) : null;
  const actionProgress = state.activeAction
    ? ((now - state.activeAction.startedAt) / state.activeAction.durationMs) * 100
    : 0;
  const combatProgress = state.currentCombat
    ? ((now - state.currentCombat.startedAt) / state.currentCombat.durationMs) * 100
    : 0;
  const jobProgress = state.activeJob ? ((now - state.activeJob.startedAt) / state.activeJob.durationMs) * 100 : 0;
  const craftProgress = state.activeCraft ? ((now - state.activeCraft.startedAt) / state.activeCraft.durationMs) * 100 : 0;
  const operationProgress = state.activeOperation ? ((now - state.activeOperation.startedAt) / state.activeOperation.durationMs) * 100 : 0;

  if (!state.startingPath) {
    return <StartingPathScreen onChoose={(pathId) => setState((current) => chooseStartingPath(current, pathId))} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Neon Row Idle</p>
          <h1>{activeOperation ? activeOperation.name : activeCraft ? activeCraft.name : activeJob ? activeJob.name : activeEnemy ? `Fighting ${activeEnemy.name}` : activeAction?.name ?? "Ready"}</h1>
        </div>
        <div className="top-stats">
          <StatPill label="Credits" value={state.resources.credits} />
          <StatPill label="Rep" value={state.resources.reputation} />
          <StatPill label="Heat" value={state.resources.heat} />
          <StatPill label="NI" value={state.neuralInstability} />
        </div>
      </header>

      <main>
        {state.offlineRecap && (
          <OfflineRecap
            state={state}
            onClose={() => setState((current) => ({ ...current, offlineRecap: null }))}
          />
        )}

        <section className="status-panel">
          <div className="action-row">
            <div>
              <span className="muted">Skill action</span>
              <strong>{activeAction?.name ?? "No skill action"}</strong>
            </div>
            {activeAction ? (
              <button className="icon-button danger" onClick={() => setState(stopSkillAction)} aria-label="Stop action">
                <Square size={18} />
              </button>
            ) : (
              <div className="idle-dot">Idle</div>
            )}
          </div>
          <Progress value={actionProgress} />
          <div className="action-row">
            <div>
              <span className="muted">Combat target</span>
              <strong>{activeEnemy?.name ?? "No target"}</strong>
            </div>
            {activeEnemy && (
              <button className="icon-button danger" onClick={() => setState(stopCombat)} aria-label="Stop combat">
                <Square size={18} />
              </button>
            )}
          </div>
          <Progress value={combatProgress} />
          <div className="action-row">
            <div>
              <span className="muted">Fixer job</span>
              <strong>{activeJob?.name ?? "No contract"}</strong>
            </div>
            {activeJob && (
              <button className="icon-button danger" onClick={() => setState(stopJob)} aria-label="Stop job">
                <Square size={18} />
              </button>
            )}
          </div>
          <Progress value={jobProgress} />
          <div className="action-row">
            <div>
              <span className="muted">Crafting</span>
              <strong>{activeCraft?.name ?? "No craft"}</strong>
            </div>
            {activeCraft && (
              <button className="icon-button danger" onClick={() => setState(stopCraft)} aria-label="Stop crafting">
                <Square size={18} />
              </button>
            )}
          </div>
          <Progress value={craftProgress} />
          <div className="action-row">
            <div>
              <span className="muted">Operation</span>
              <strong>{activeOperation?.name ?? "No operation"}</strong>
            </div>
            {activeOperation && (
              <button className="icon-button danger" onClick={() => setState(stopOperation)} aria-label="Retreat operation">
                <Square size={18} />
              </button>
            )}
          </div>
          <Progress value={operationProgress} />
        </section>

        {tab === "city" && (
          <CityTab
            state={state}
            onSelectDistrict={(id) => setState((current) => travelToDistrict(current, id))}
            onStartSkill={(id) => setState((current) => startSkillAction(current, id))}
            onStartCombat={(id) => setState((current) => startCombat(current, id))}
            onStartOperation={(id) => setState((current) => startOperation(current, id))}
            onStartJob={(id) => setState((current) => startJob(current, id))}
            onUseRipperdoc={(id) => setState((current) => useRipperdocService(current, id))}
            onBuyVendorItem={(vendorId, itemId) => setState((current) => buyVendorItem(current, vendorId, itemId))}
            onSellVendorItem={(vendorId, itemId) => setState((current) => sellVendorItem(current, vendorId, itemId))}
            onBuyHousing={(id) => setState((current) => buyHousing(current, id))}
            onSetResidence={(id) => setState((current) => setActiveResidence(current, id))}
            onBuyVehicle={(id) => setState((current) => buyVehicle(current, id))}
            onSetVehicle={(id) => setState((current) => setActiveVehicle(current, id))}
            onUpgradeVehicle={(id) => setState((current) => upgradeVehicle(current, id))}
          />
        )}
        {tab === "inventory" && (
          <InventoryTab
            state={state}
            onEquip={(id) => setState((current) => equipItem(current, id))}
            onUse={(id) => setState((current) => useItem(current, id))}
            onUpgrade={(id) => setState((current) => upgradeItem(current, id))}
            onCraft={(id) => setState((current) => startCraft(current, id))}
          />
        )}
        {tab === "character" && (
          <CharacterTab
            state={state}
            onUnequipGear={(slot) => setState((current) => unequipGear(current, slot))}
            onUnequipCyberware={(slot) => setState((current) => unequipCyberware(current, slot))}
            onSavePreset={(name) => setState((current) => savePreset(current, name))}
            onLoadPreset={(name) => setState((current) => loadPreset(current, name))}
            onAutoEquip={(mode) => setState((current) => autoEquip(current, mode))}
            onBuyPerk={(id) => setState((current) => buyPerk(current, id))}
            onRespecPerks={() => {
              setState((current) => {
                const cost = respecCost(current);
                if (!window.confirm(`Respec all perk points for ${cost} Credits? Starting path remains permanent.`)) return current;
                return respecPerks(current);
              });
            }}
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
            onBuyHousing={(id) => setState((current) => buyHousing(current, id))}
            onSetResidence={(id) => setState((current) => setActiveResidence(current, id))}
            onGift={(id) => setState((current) => giveCompanionGift(current, id))}
            onSpendTime={(id) => setState((current) => spendTimeWithCompanion(current, id))}
            onSetCompanion={(id) => setState((current) => setActiveCompanion(current, id))}
            onStartJob={(id) => setState((current) => startJob(current, id))}
            onRunSimCache={(count) => setState((current) => runBasicSimCache(current, count))}
            onBuyVehicle={(id) => setState((current) => buyVehicle(current, id))}
            onSetVehicle={(id) => setState((current) => setActiveVehicle(current, id))}
            onUpgradeVehicle={(id) => setState((current) => upgradeVehicle(current, id))}
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
              if (window.confirm("Reset your save and start over?")) setState(resetSave());
            }}
            onSave={() => saveGame(state)}
          />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Primary">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

type MoreSection = "fixers" | "districts" | "factions" | "housing" | "garage" | "companions" | "collection" | "simCache" | "goals" | "settings";

function StartingPathScreen({ onChoose }: { onChoose: (pathId: StartingPathId) => void }) {
  return (
    <div className="app-shell path-screen">
      <main>
        <section className="panel">
          <p className="eyebrow">Permanent origin</p>
          <h1>Choose Your Starting Path</h1>
          <p className="muted">This choice is stored in your save and shapes long-term modifiers. Resetting the save is the only way to choose again.</p>
        </section>
        <section className="stack">
          {startingPaths.map((path) => (
            <article className="action-card vertical" key={path.id}>
              <div>
                <p className="eyebrow">Starting Path</p>
                <h2>{path.name}</h2>
                <p className="muted">{path.theme}</p>
                <p className="fine">Bonuses: {path.bonuses.join(", ")}</p>
                <p className="fine">Penalties: {path.penalties.join(", ")}</p>
              </div>
              <button className="primary-button full" onClick={() => onChoose(path.id)}>
                Lock In {path.name}
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function CityTab({
  state,
  onSelectDistrict,
  onStartSkill,
  onStartCombat,
  onStartOperation,
  onStartJob,
  onUseRipperdoc,
  onBuyVendorItem,
  onSellVendorItem,
  onBuyHousing,
  onSetResidence,
  onBuyVehicle,
  onSetVehicle,
  onUpgradeVehicle,
}: {
  state: GameState;
  onSelectDistrict: (id: DistrictId) => void;
  onStartSkill: (id: string) => void;
  onStartCombat: (id: string) => void;
  onStartOperation: (id: string) => void;
  onStartJob: (id: string) => void;
  onUseRipperdoc: (id: string) => void;
  onBuyVendorItem: (vendorId: string, itemId: string) => void;
  onSellVendorItem: (vendorId: string, itemId: string) => void;
  onBuyHousing: (id: string) => void;
  onSetResidence: (id: string) => void;
  onBuyVehicle: (id: string) => void;
  onSetVehicle: (id: string) => void;
  onUpgradeVehicle: (id: string) => void;
}) {
  const selectedId = state.selectedDistrict ?? "neonRow";
  const selected = getDistrict(selectedId);
  return (
    <section className="stack city-layout">
      <NeonPanel>
        <p className="eyebrow">City Map</p>
        <h2>Metro Grid</h2>
        <p className="muted">Select a district to see local actions, crews, jobs, operations, housing, and ripperdoc services.</p>
        <div className="city-grid">
          {cityDistrictOrder.map((districtId) => {
            const district = getDistrict(districtId);
            const unlocked = Boolean(state.districts[districtId]?.unlocked);
            const threat = state.districtThreat[districtId]?.level ?? 0;
            const active = selectedId === districtId;
            const hasActive =
              Boolean(state.activeOperation && operations.find((op) => op.id === state.activeOperation?.operationId)?.districtId === districtId) ||
              Boolean(state.activeJob && jobs.find((job) => job.id === state.activeJob?.jobId)?.districtId === districtId);
            return (
              <button className={`district-card ${active ? "active" : ""} ${unlocked ? "" : "locked"}`} key={districtId} onClick={() => onSelectDistrict(districtId)}>
                <span className="scanline" />
                <strong>{district?.name ?? districtId}</strong>
                <small>{unlocked ? "Unlocked" : "Locked"} / {threatTier(threat)}</small>
                <small>{district?.associatedFactions.map((id) => factions.find((faction) => faction.id === id)?.name ?? id).join(", ")}</small>
                <small>{districtCompletionPercent(state, districtId)}% complete</small>
                <div className="activity-icons">
                  {districtSkillActions(districtId).length > 0 && <span>SK</span>}
                  {districtJobs(districtId).length > 0 && <span>JB</span>}
                  {districtOperations(districtId).length > 0 && <span>OP</span>}
                  {districtRipperdocs(districtId).length > 0 && <span>RD</span>}
                  {districtVendors(districtId).length > 0 && <span>MK</span>}
                  {hasActive && <span className="warning-badge">LIVE</span>}
                </div>
              </button>
            );
          })}
        </div>
      </NeonPanel>

      {selected && (
        <DistrictHub
          state={state}
          districtId={selectedId}
          onStartSkill={onStartSkill}
          onStartCombat={onStartCombat}
          onStartOperation={onStartOperation}
          onStartJob={onStartJob}
          onUseRipperdoc={onUseRipperdoc}
          onBuyVendorItem={onBuyVendorItem}
          onSellVendorItem={onSellVendorItem}
          onBuyHousing={onBuyHousing}
          onSetResidence={onSetResidence}
          onBuyVehicle={onBuyVehicle}
          onSetVehicle={onSetVehicle}
          onUpgradeVehicle={onUpgradeVehicle}
        />
      )}
    </section>
  );
}

function DistrictHub({
  state,
  districtId,
  onStartSkill,
  onStartCombat,
  onStartOperation,
  onStartJob,
  onUseRipperdoc,
  onBuyVendorItem,
  onSellVendorItem,
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
  onStartOperation: (id: string) => void;
  onStartJob: (id: string) => void;
  onUseRipperdoc: (id: string) => void;
  onBuyVendorItem: (vendorId: string, itemId: string) => void;
  onSellVendorItem: (vendorId: string, itemId: string) => void;
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
        <ThreatMeter value={threat} tier={threatTier(threat)} />
        <RequirementList items={district.travelRequirements ?? district.unlockRequirements} />
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

      <ActivityGroup title="Skill Actions">
        {districtSkillActions(districtId).map((action) => (
          <ActivityCard key={action.id} locked={!unlocked || state.skills[action.skillId].level < action.levelReq}>
            <div>
              <p className="eyebrow">{skillNames[action.skillId]}</p>
              <h3>{action.name}</h3>
              <p className="fine">Rewards {formatRewards(action.rewards)}</p>
              <TagList tags={[action.skillId, ...(action.tags ?? [])]} />
            </div>
            <button className="primary-button full" disabled={!unlocked || Boolean(state.activeAction) || Boolean(state.activeJob) || Boolean(state.activeCraft)} onClick={() => onStartSkill(action.id)}>Start</button>
          </ActivityCard>
        ))}
      </ActivityGroup>

      <ActivityGroup title="Combat Zones">
        {districtCombatZones(districtId).flatMap((zone) => zone.enemies.map((enemy) => (
          <ActivityCard key={enemy.id} locked={!unlocked}>
            <div>
              <p className="eyebrow">{zone.name}</p>
              <h3>{enemy.name}</h3>
              <p className="fine">HP {enemy.hp} / XP {enemy.xpReward} / Kills {state.enemyLog[enemy.id]?.kills ?? 0}</p>
            </div>
            <button className="primary-button full" disabled={!unlocked || Boolean(state.currentCombat)} onClick={() => onStartCombat(enemy.id)}>Fight</button>
          </ActivityCard>
        )))}
      </ActivityGroup>

      <ActivityGroup title="Operations & Bosses">
        {districtOperations(districtId).map((operation) => {
          const boss = bosses.find((entry) => entry.id === operation.bossId);
          return (
            <ActivityCard key={operation.id} locked={!canStartOperation(state, operation)}>
              <div>
                <p className="eyebrow">Operation</p>
                <h3>{operation.name}</h3>
                <p className="fine">Boss {boss?.name} / Clears {state.operationLogs[operation.id]?.clears ?? 0}</p>
                <RequirementList items={operation.unlockRequirements} />
              </div>
              <button className="primary-button full" disabled={!canStartOperation(state, operation) || Boolean(state.activeOperation)} onClick={() => onStartOperation(operation.id)}>Launch</button>
            </ActivityCard>
          );
        })}
      </ActivityGroup>

      <ActivityGroup title="Fixer Jobs">
        {districtJobs(districtId).map((job) => (
          <ActivityCard key={job.id} locked={!canAttemptJob(state, job)}>
            <div>
              <p className="eyebrow">{fixers.find((fixer) => fixer.id === job.fixerId)?.name ?? "Fixer"}</p>
              <h3>{job.name}</h3>
              <p className="fine">Success {Math.round(jobSuccessChance(state, job.baseSuccessChance, job.tags) * 100)}% / {formatRewards(job.rewards)}</p>
              <TagList tags={job.tags} />
            </div>
            <button className="primary-button full" disabled={!canAttemptJob(state, job) || Boolean(state.activeJob)} onClick={() => onStartJob(job.id)}>Contract</button>
          </ActivityCard>
        ))}
      </ActivityGroup>

      <ActivityGroup title="Ripperdoc">
        {districtRipperdocs(districtId).map((service) => (
          <ActivityCard key={service.id} locked={!canUseRipperdocService(state, service.id)}>
            <div>
              <p className="eyebrow">{service.serviceType}</p>
              <h3>{service.name}</h3>
              <p className="muted">{service.description}</p>
              <p className="fine">Cost {formatRewards(service.cost)}</p>
              {service.effects?.length ? <p className="fine">Effects: {service.effects.join(", ")}</p> : null}
              {service.risk ? <p className="fine">Risk: {service.risk}</p> : null}
              <p className="fine">NI {service.neuralInstabilityChange ? `${service.neuralInstabilityChange > 0 ? "+" : ""}${service.neuralInstabilityChange}` : "0"} / Heat {service.heatChange ? `${service.heatChange > 0 ? "+" : ""}${service.heatChange}` : "0"}</p>
              <RequirementList items={service.requirements} />
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

      <ActivityGroup title="Garage & Vehicles">
        {vehicles.filter((vehicle) => vehicle.districtId === districtId).map((vehicle) => {
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
                <RequirementList items={vehicle.unlockRequirements} />
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
        <RequirementList items={vendor.unlockRequirements} />
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
      <div className="card-list">
        {skillActions
          .filter((action) => action.skillId === skillId)
          .map((action) => (
            <ActionCard
              key={action.id}
              state={state}
              action={action}
              disabled={Boolean(state.activeAction) || Boolean(state.activeJob) || Boolean(state.activeCraft)}
              onStart={() => onStart(action.id)}
            />
          ))}
      </div>
    </article>
  );
}

function ActionCard({
  state,
  action,
  disabled,
  onStart,
}: {
  state: GameState;
  action: SkillAction;
  disabled: boolean;
  onStart: () => void;
}) {
  const mastery = state.actionMastery[action.id] ?? { level: 1, xp: 0 };
  const locked = state.skills[action.skillId].level < action.levelReq;
  const affordable = canAffordRewards(state, action.rewards);
  return (
    <article className="action-card">
      <div>
        <p className="eyebrow">{action.district}</p>
        <h3>{action.name}</h3>
        <p className="muted">{action.description}</p>
        <p className="fine">Requires level {action.levelReq} / {formatDuration(adjustedDurationMs(state, action.durationMs, [action.skillId, ...(action.tags ?? [])]))}</p>
        <p className="fine">XP +{action.xpReward} / Mastery +{action.masteryXpReward}</p>
        <p className="fine">Mastery {mastery.level}: {mastery.xp} / {xpForNextMastery(mastery.level)}</p>
        <p className="fine">Rewards {formatRewards(action.rewards)}</p>
        {(action.heatChange || action.neuralInstabilityChange) && (
          <p className="fine">Risk {action.heatChange ? `Heat +${action.heatChange}` : ""} {action.neuralInstabilityChange ? `NI +${action.neuralInstabilityChange}` : ""}</p>
        )}
        <TagList tags={[action.skillId, ...(action.tags ?? [])]} />
        <details>
          <summary className="fine">Details</summary>
          <p className="fine">Active modifiers: {getActiveModifiers(state).activeSources.join(", ") || "None"}</p>
        </details>
      </div>
      <button className="primary-button" disabled={locked || disabled || !affordable} onClick={onStart}>
        <Play size={18} />
        {locked ? "Locked" : "Start"}
      </button>
    </article>
  );
}

function CombatTab({
  state,
  onStart,
  onStartOperation,
}: {
  state: GameState;
  onStart: (enemyId: string) => void;
  onStartOperation: (operationId: string) => void;
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
            return (
              <article className="action-card vertical" key={operation.id}>
                <div>
                  <p className="eyebrow">{districts.find((district) => district.id === operation.districtId)?.name} / Threat {state.districtThreat[operation.districtId]?.level ?? 0}</p>
                  <h3>{operation.name}</h3>
                  <p className="muted">{operation.description}</p>
                  <p className="fine">Unlock: {operation.unlockRequirements.join(", ")}</p>
                  <p className="fine">Recommended: {operation.recommendedStats.join(", ")}</p>
                  {operation.requiredItems && <p className="fine">Keys: {Object.entries(operation.requiredItems).map(([id, amount]) => `${amount} ${getItem(id)?.name ?? id}`).join(", ")}</p>}
                  <p className="fine">Stages: {operation.stages.map((stage) => stage.name).join(", ")}</p>
                  <p className="fine">Boss: {boss?.name} / {boss?.mechanics.join(", ")}</p>
                  <p className="fine">Rewards: {formatRewards(operation.completionRewards)}</p>
                  <p className="fine">Clears {log.clears} / Best {log.bestClearMs ? formatDuration(log.bestClearMs) : "--"} / Sim Cache {log.firstClear ? "Eligible later" : "Manual clear required"}</p>
                  <TagList tags={["operation", operation.districtId]} />
                </div>
                <button className="primary-button full" disabled={!available || Boolean(state.activeOperation)} onClick={() => onStartOperation(operation.id)}>
                  Start Operation
                </button>
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
}: {
  state: GameState;
  zone: CombatZone;
  enemy: Enemy;
  onStart: () => void;
}) {
  const log = state.enemyLog[enemy.id] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
  const active = state.currentCombat?.enemyId === enemy.id;
  return (
    <article className="action-card vertical">
      <div>
        <p className="eyebrow">{zone.name}</p>
        <h3>{enemy.name}</h3>
        <p className="muted">{enemy.description}</p>
        <p className="fine">HP {enemy.hp} / Damage {enemy.damage} / Attack {formatDuration(enemy.attackSpeedMs)}</p>
        <p className="fine">Rewards +{enemy.creditsReward} Credits, +{enemy.xpReward} XP, +{enemy.reputationReward} Rep</p>
        <p className="fine">Kills {log.kills} / Best {log.bestKillMs ? formatDuration(log.bestKillMs) : "--"}</p>
      </div>
      <div className="enemy-list">
        {enemy.drops.map((drop) => (
          <div className="enemy-card" key={drop.id}>
            <strong>{drop.name}</strong>
            <span>{Math.round(drop.chance * 100)}%</span>
            <span>{log.discoveredDrops[drop.id] ? `Found x${log.discoveredDrops[drop.id]}` : "Unknown"}</span>
          </div>
        ))}
      </div>
      <button className="primary-button full" disabled={Boolean(state.currentCombat)} onClick={onStart}>
        <Sword size={18} />
        {active ? "Fighting" : "Fight"}
      </button>
    </article>
  );
}

type InventoryFilter = "All" | "Resources" | "Materials" | "Cyberware" | "Weapons" | "Armor" | "Consumables" | "Blueprints";

function InventoryTab({
  state,
  onEquip,
  onUse,
  onUpgrade,
  onCraft,
}: {
  state: GameState;
  onEquip: (id: string) => void;
  onUse: (id: string) => void;
  onUpgrade: (id: string) => void;
  onCraft: (id: string) => void;
}) {
  const [filter, setFilter] = useState<InventoryFilter>("All");
  const drops = Object.entries(state.inventory);
  const filtered = drops.filter(([id]) => {
    const item = getItem(id);
    if (filter === "All") return true;
    if (filter === "Resources") return false;
    if (filter === "Materials") return item?.type === "Material" || item?.type === "Component";
    if (filter === "Weapons") return item?.type === "Weapon";
    if (filter === "Cyberware") return item?.type === "Cyberware";
    if (filter === "Blueprints") return item?.type === "Blueprint";
    return item?.type === filter.slice(0, -1);
  });
  return (
    <section className="stack">
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Stackable stash</p>
            <h2>Inventory</h2>
          </div>
          <Backpack size={22} />
        </div>
        <div className="inventory-grid">
          {resourceOrder.map((resource) => (
            <Metric key={resource} label={resourceNames[resource]} value={state.resources[resource]} />
          ))}
        </div>
      </article>
      <article className="panel">
        <div className="panel-heading">
          <h2>Items</h2>
          <span className="muted">{filter}</span>
        </div>
        <div className="segmented">
          {(["All", "Resources", "Materials", "Cyberware", "Weapons", "Armor", "Consumables", "Blueprints"] as InventoryFilter[]).map((entry) => (
            <button key={entry} className={filter === entry ? "active" : ""} onClick={() => setFilter(entry)}>
              {entry}
            </button>
          ))}
        </div>
        <div className="card-list">
          {filtered.length ? (
            filtered.map(([id, count]) => {
              const item = getItem(id);
              if (!item) return <Metric key={id} label={itemNames[id] ?? id} value={count} />;
              return (
                <article className={`action-card vertical rarity-${item.rarity.toLowerCase()}`} key={id}>
                  <div>
                    <p className="eyebrow">{item.rarity} / {item.type} / Qty {count}</p>
                    <h3>{item.name} {state.upgradeLevels[id] ? `+${state.upgradeLevels[id]}` : ""}</h3>
                    <p className="muted">{item.description}</p>
                    <p className="fine">Sell {item.sellValue} / Source: {item.sourceHint}</p>
                    {item.stats && <p className="fine">Stats: {formatStats(scaledStats(state, id))}</p>}
                    {item.modifiers && <p className="fine">Modifiers: {formatItemModifiers(item.modifiers)}</p>}
                    {item.instabilityLoad ? <p className="fine">Cyberware Load +{item.instabilityLoad} NI</p> : null}
                    <TagList tags={item.tags} />
                  </div>
                  <div className="card-list compact">
                    {(item.type === "Weapon" || item.type === "Armor" || item.type === "Cyberware") && (
                      <button className="primary-button full" onClick={() => onEquip(id)}>Equip</button>
                    )}
                    {item.useEffect && <button className="secondary-button full" onClick={() => onUse(id)}>Use</button>}
                    {item.maxUpgradeLevel && <button className="secondary-button full" onClick={() => onUpgrade(id)}>Upgrade</button>}
                  </div>
                </article>
              );
            })
          ) : (
            <p className="muted">No items in this filter yet.</p>
          )}
        </div>
      </article>
      <CraftingPanel state={state} onCraft={onCraft} />
      <RecentLog state={state} />
    </section>
  );
}

function CraftingPanel({ state, onCraft }: { state: GameState; onCraft: (id: string) => void }) {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Repeats while materials are available</p>
          <h2>Crafting</h2>
        </div>
        <BrainCircuit size={22} />
      </div>
      <div className="card-list">
        {recipes.map((recipe) => {
          const output = getItem(recipe.outputItemId);
          const locked = state.skills[recipe.requiredSkill].level < recipe.requiredLevel || Boolean(recipe.requiredBlueprint && !state.unlockedBlueprints[recipe.requiredBlueprint]);
          const missing = Object.entries(recipe.inputCosts).some(([id, amount]) => getOwnedCount(state, id) < amount);
          return (
            <article className="action-card vertical" key={recipe.id}>
              <div>
                <p className="eyebrow">{recipe.category} / {formatDuration(adjustedDurationMs(state, recipe.durationMs, recipe.tags))}</p>
                <h3>{recipe.name}</h3>
                <p className="muted">Creates {recipe.outputQuantity} {output?.name ?? recipe.outputItemId}.</p>
                <p className="fine">Requires {recipe.requiredSkill} {recipe.requiredLevel}{recipe.requiredBlueprint ? ` / Blueprint ${getItem(recipe.requiredBlueprint)?.name}` : ""}</p>
                <p className="fine">Costs {Object.entries(recipe.inputCosts).map(([id, amount]) => `${amount} ${getItem(id)?.name ?? resourceNames[id as ResourceId] ?? id}`).join(", ")}</p>
                <p className="fine">XP +{recipe.xpReward} / Mastery +{recipe.masteryXpReward}</p>
                <TagList tags={recipe.tags} />
              </div>
              <button className="primary-button full" disabled={locked || missing || Boolean(state.activeCraft) || Boolean(state.activeAction) || Boolean(state.activeJob)} onClick={() => onCraft(recipe.id)}>
                {locked ? "Locked" : missing ? "Missing" : "Craft"}
              </button>
            </article>
          );
        })}
      </div>
    </article>
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
  const treeInfo = perkTrees.find((entry) => entry.id === tree)!;
  const earned = Math.max(state.perkPointsEarned, earnedPerkPoints(state));
  const spent = spentPerkPoints(state);
  const available = availablePerkPoints(state);
  const treePerks = perks.filter((perk) => perk.tree === tree);
  const tiers = [...new Set(treePerks.map((perk) => perk.tier))].sort((a, b) => a - b);
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Perk Tree / {available} available</p>
          <h2>{treeInfo.name} Specialization</h2>
        </div>
        <button className="secondary-button" disabled={spent <= 0 || state.resources.credits < respecCost(state)} onClick={onRespecPerks}>
          Respec {respecCost(state)}
        </button>
      </div>
      <p className="muted">{treeInfo.identity}</p>
      <div className="inventory-grid">
        <Metric label="Earned" value={earned} />
        <Metric label="Spent" value={spent} />
        <Metric label="Available" value={available} />
        <Metric label={`${treeInfo.name} Points`} value={treeInvestment(state, tree)} />
      </div>
      <div className="segmented tree-tabs">
        {perkTrees.map((entry) => (
          <button key={entry.id} className={tree === entry.id ? "active" : ""} onClick={() => setTree(entry.id)}>
            {entry.name}
          </button>
        ))}
      </div>
      {tiers.map((tier) => (
        <div className="perk-tier" key={tier}>
          <p className="eyebrow">Tier {tier}</p>
          <div className="card-list">
            {treePerks.filter((perk) => perk.tier === tier).map((perk) => {
              const rank = state.perkRanks[perk.id] ?? 0;
              const unlocked = canBuyPerk(state, perk) || rank > 0;
              return (
                <ActivityCard key={perk.id} locked={!unlocked}>
                  <div>
                    <p className="eyebrow">Rank {rank}/{perk.maxRanks} / Cost {perk.cost}</p>
                    <h3>{perk.name}</h3>
                    <p className="muted">{perk.description}</p>
                    <p className="fine">Requirements: {perk.unlockRequirements.join(", ")}{perk.prerequisites.length ? ` / Prereq ${perk.prerequisites.join(", ")}` : ""}</p>
                    <p className="fine">Modifiers: {formatItemModifiers(perk.modifiers as Record<string, unknown>)}</p>
                  </div>
                  <button className="primary-button full" disabled={!canBuyPerk(state, perk)} onClick={() => onBuyPerk(perk.id)}>
                    Spend Point
                  </button>
                </ActivityCard>
              );
            })}
          </div>
        </div>
      ))}
      <div className="terminal-log">
        {specializationMilestones.filter((milestone) => milestone.tree === tree).map((milestone) => {
          const id = `${milestone.tree}-${milestone.points}`;
          return <p key={id}>{state.specializationMilestones[id] ? "[unlocked]" : "[locked]"} {milestone.points} pts: {milestone.name}</p>;
        })}
      </div>
    </article>
  );
}

function CharacterTab({
  state,
  onUnequipGear,
  onUnequipCyberware,
  onSavePreset,
  onLoadPreset,
  onAutoEquip,
  onBuyPerk,
  onRespecPerks,
}: {
  state: GameState;
  onUnequipGear: (slot: GearSlot) => void;
  onUnequipCyberware: (slot: CyberwareSlot) => void;
  onSavePreset: (name: string) => void;
  onLoadPreset: (name: string) => void;
  onAutoEquip: (mode: "combat" | "hacking" | "scavenging" | "lowInstability") => void;
  onBuyPerk: (id: string) => void;
  onRespecPerks: () => void;
}) {
  const stats = playerCombatStats(state);
  const path = startingPaths.find((entry) => entry.id === state.startingPath);
  const scores = archetypeScores(state);
  const signature = detectedSignatureBuild(state);
  return (
    <section className="stack">
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Runner profile</p>
            <h2>Character</h2>
          </div>
          <UserRound size={22} />
        </div>
        {path && (
          <p className="muted">
            Starting Path: {path.name}. {path.theme}
          </p>
        )}
        <div className="inventory-grid">
          <Metric label="Max HP" value={stats.maxHp} />
          <Metric label="Damage" value={stats.damage} />
          <Metric label="Attack Speed" value={stats.attackSpeedMs / 1000} />
          <Metric label="Armor" value={stats.armor} />
          <Metric label="Total Level" value={totalLevel(state)} />
          <Metric label="Heat" value={state.resources.heat} />
        </div>
      </article>
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
        <p className="muted">Current Instability: {state.neuralInstability}%</p>
        <p className="muted">Cyberware Load: {cyberwareLoad(state)}%</p>
        <p className="muted">Effective Instability: {effectiveNeuralInstability(state)}% / {neuralInstabilityTierName(effectiveNeuralInstability(state))}</p>
        <Progress value={effectiveNeuralInstability(state)} />
        <p className="muted">Heat: {state.resources.heat}% / {heatTier(state.resources.heat)}</p>
        <Progress value={state.resources.heat} />
      </article>
      <article className="panel">
        <h2>Skills</h2>
        <div className="inventory-grid">
          {skillOrder.map((skill) => <Metric key={skill} label={skillNames[skill]} value={state.skills[skill].level} />)}
        </div>
      </article>
      <article className="panel">
        <h2>Gear</h2>
        <div className="slot-grid">
          {gearSlots.map((slot) => {
            const itemId = state.equippedGear[slot.id];
            return (
              <button className="slot-card" key={slot.id} onClick={() => onUnequipGear(slot.id)}>
                <span>{slot.label}</span>
                <strong>{itemId ? `${getItem(itemId)?.name ?? itemId}${state.upgradeLevels[itemId] ? ` +${state.upgradeLevels[itemId]}` : ""}` : "Empty"}</strong>
              </button>
            );
          })}
        </div>
      </article>
      <article className="panel">
        <h2>Cyberware Slots</h2>
        <div className="slot-grid">
          {cyberwareSlots.map((slot) => {
            const itemId = state.equippedCyberware[slot.id];
            return (
              <button className="slot-card" key={slot.id} onClick={() => onUnequipCyberware(slot.id)}>
                <span>{slot.label}</span>
                <strong>{itemId ? `${getItem(itemId)?.name ?? itemId} / Load +${getItem(itemId)?.instabilityLoad ?? 0}` : "Empty"}</strong>
              </button>
            );
          })}
        </div>
      </article>
      <article className="panel">
        <h2>Presets</h2>
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
    </section>
  );
}

function MoreTab({
  state,
  section,
  onSection,
  exported,
  importPayload,
  onBuyHousing,
  onSetResidence,
  onGift,
  onSpendTime,
  onSetCompanion,
  onStartJob,
  onRunSimCache,
  onBuyVehicle,
  onSetVehicle,
  onUpgradeVehicle,
  onExport,
  onImportPayload,
  onImport,
  onReset,
  onSave,
}: {
  state: GameState;
  section: MoreSection;
  onSection: (section: MoreSection) => void;
  exported: string;
  importPayload: string;
  onBuyHousing: (id: string) => void;
  onSetResidence: (id: string) => void;
  onGift: (id: string) => void;
  onSpendTime: (id: string) => void;
  onSetCompanion: (id: string) => void;
  onStartJob: (id: string) => void;
  onRunSimCache: (count: number) => void;
  onBuyVehicle: (id: string) => void;
  onSetVehicle: (id: string) => void;
  onUpgradeVehicle: (id: string) => void;
  onExport: () => void;
  onImportPayload: (value: string) => void;
  onImport: () => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <section className="stack">
      <article className="panel">
        <div className="segmented">
          {(["fixers", "districts", "factions", "housing", "garage", "companions", "collection", "simCache", "goals", "settings"] as MoreSection[]).map((id) => (
            <button key={id} className={section === id ? "active" : ""} onClick={() => onSection(id)}>
              {titleCase(id)}
            </button>
          ))}
        </div>
      </article>
      {section === "fixers" && <FixersSection state={state} onStartJob={onStartJob} />}
      {section === "districts" && <DistrictsSection state={state} />}
      {section === "factions" && <FactionsSection state={state} />}
      {section === "housing" && <HousingSection state={state} onBuy={onBuyHousing} onSetResidence={onSetResidence} />}
      {section === "garage" && <GarageSection state={state} onBuy={onBuyVehicle} onSetVehicle={onSetVehicle} onUpgradeVehicle={onUpgradeVehicle} />}
      {section === "companions" && <CompanionsSection state={state} onGift={onGift} onSpendTime={onSpendTime} onSetCompanion={onSetCompanion} />}
      {section === "collection" && <CollectionSection state={state} />}
      {section === "simCache" && <SimCacheSection state={state} onRun={onRunSimCache} />}
      {section === "goals" && <GoalsSection state={state} />}
      {section === "settings" && (
        <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Save version {state.saveVersion}</p>
            <h2>Saves</h2>
          </div>
          <Save size={22} />
        </div>
        <button className="primary-button full" onClick={onSave}>
          <Save size={18} />
          Save Now
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

function FixersSection({ state, onStartJob }: { state: GameState; onStartJob: (id: string) => void }) {
  const path = startingPaths.find((entry) => entry.id === state.startingPath);
  return (
    <section className="stack">
      {fixers.map((fixer) => {
        const district = districts.find((entry) => entry.id === fixer.districtId);
        const faction = factions.find((entry) => entry.id === fixer.factionId);
        const trust = state.fixerTrust[fixer.id]?.trust ?? 0;
        const fixerJobs = jobs.filter((job) => job.fixerId === fixer.id);
        return (
          <article className="panel" key={fixer.id}>
            <p className="eyebrow">{district?.name} / {faction?.name} / Trust {trust}</p>
            <h2>{fixer.name}</h2>
            <p className="muted">{fixer.specialty}</p>
            <p className="fine">Path note: {path ? fixer.startingPathNotes[path.id] ?? "No special modifier yet." : "Choose a path."}</p>
            <p className="fine">Companions: {fixer.companionUnlocks.join(", ")}</p>
            <p className="fine">Housing: {fixer.housingUnlocks.join(", ")}</p>
            <p className="fine">Job chains: {fixer.jobChains.join(", ")}</p>
            <div className="card-list">
              {fixerJobs.map((job) => {
                const available = canAttemptJob(state, job);
                const chance = Math.round(jobSuccessChance(state, job.baseSuccessChance, job.tags) * 100);
                const duration = adjustedDurationMs(state, job.durationMs, job.tags);
                const autoRepeat = Boolean(job.autoRepeatTrustReq && trust >= job.autoRepeatTrustReq);
                return (
                  <article className="action-card vertical" key={job.id}>
                    <div>
                      <p className="eyebrow">{districts.find((entry) => entry.id === job.districtId)?.name} / {chance}% success</p>
                      <h3>{job.name}</h3>
                      <p className="muted">{job.description}</p>
                      <p className="fine">Duration {formatDuration(duration)} / Heat +{job.heatChange} / Trust +{job.fixerTrustReward}</p>
                      <p className="fine">Requires: {job.requirements.join(", ")}</p>
                      <p className="fine">Rewards: {formatRewards(job.rewards)}</p>
                      <TagList tags={job.tags} />
                      <details>
                        <summary className="fine">Details</summary>
                        <p className="fine">Active modifiers: {getActiveModifiers(state).activeSources.join(", ") || "None"}</p>
                        <p className="fine">Auto-repeat: {autoRepeat ? "Unlocked" : job.autoRepeatTrustReq ? `Trust ${job.autoRepeatTrustReq}` : "No"}</p>
                      </details>
                    </div>
                    <button className="primary-button full" disabled={!available || Boolean(state.activeJob)} onClick={() => onStartJob(job.id)}>
                      Start Contract
                    </button>
                  </article>
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
              <p className="fine">Storage +{housing.storageBonus}, offline cap +{housing.offlineCapBonusHours}h, Heat decay +{housing.heatDecayBonus}, NI recovery +{housing.neuralRecoveryBonus}</p>
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

function ProgressTab({ state }: { state: GameState }) {
  return (
    <section className="stack">
      <GoalsSection state={state} />
      <CollectionSection state={state} />
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
      <NeonPanel>
        <h2>Boss Logs</h2>
        <div className="card-list">
          {bosses.map((boss) => {
            const log = state.bossLogs[boss.id] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
            return (
              <ActivityCard key={boss.id}>
                <div>
                  <p className="eyebrow">{boss.mechanics.join(", ")}</p>
                  <h3>{boss.name}</h3>
                  <p className="fine">Kills {log.kills} / Best {log.bestKillMs ? formatDuration(log.bestKillMs) : "--"}</p>
                </div>
              </ActivityCard>
            );
          })}
        </div>
      </NeonPanel>
      <RecentLog state={state} />
    </section>
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
            <Metric label="NI" value={state.simulationRecap.neuralInstabilityChange} />
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
          <Metric label="Controlled Districts" value={Object.values(state.districtThreat).filter((threat) => threat.level < 25).length} />
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
    <article className="panel recap">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Offline Progress</p>
          <h2>{formatAway(recap.timeAwayMs)} away</h2>
        </div>
        <button className="secondary-button" onClick={onClose}>Close</button>
      </div>
      <p className="muted">{recap.message ?? `${recap.actionName} continued while you were away.`}</p>
      <div className="inventory-grid">
        <Metric label="Completions" value={recap.completions} />
        <Metric label="XP" value={recap.xpGained} />
        <Metric label="Levels" value={recap.levelsGained} />
        <Metric label="Mastery XP" value={recap.masteryXpGained} />
        <Metric label="Heat" value={recap.heatGained} />
        <Metric label="NI" value={recap.neuralInstabilityGained} />
      </div>
      <p className="fine">Resources: {formatRewards(recap.resourcesGained)}</p>
    </article>
  );
}

function RecentLog({ state }: { state: GameState }) {
  return (
    <article className="panel">
      <h2>Recent Rewards</h2>
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
  return (
    <div className="tag-row">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-pill">
      <span>{label}</span>
      <strong>{Math.floor(value).toLocaleString()}</strong>
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

function formatDuration(ms: number) {
  return `${Math.max(1, Math.round(ms / 1000))}s`;
}

function formatAway(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function getOwnedCount(state: GameState, id: string) {
  if (id in state.resources) return state.resources[id as ResourceId];
  return state.inventory[id] ?? 0;
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
    return -(item.instabilityLoad ?? 0);
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
