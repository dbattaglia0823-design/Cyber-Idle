import { combatZones } from "../data/combat";
import { resourceNames } from "../data/resources";
import { addSkillXp } from "./actionProcessing";
import { addItem, discoverItem } from "./collectionSystem";
import { expectedKillTimeMs } from "./formulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import { applyRewardModifiers, applyXpModifier, getActiveModifiers } from "./modifiers";
import { updateWorldUnlocks } from "./worldUnlocks";
import { markEnemyManual } from "./manualDiscovery";
import type { Enemy, GameState, ResourceId } from "../types";

export function allEnemies() {
  return combatZones.flatMap((zone) => zone.enemies);
}

export function getEnemy(enemyId: string) {
  return allEnemies().find((enemy) => enemy.id === enemyId);
}

export function startCombat(state: GameState, enemyId: string, now = Date.now()) {
  const enemy = getEnemy(enemyId);
  if (!enemy) return state;
  return {
    ...state,
    currentCombat: {
      enemyId,
      startedAt: now,
      durationMs: expectedKillTimeMs(state, enemy.hp),
    },
  };
}

export function stopCombat(state: GameState) {
  return { ...state, currentCombat: null };
}

export function processCombat(state: GameState, now = Date.now()) {
  if (!state.currentCombat) return state;
  if (now - state.currentCombat.startedAt < state.currentCombat.durationMs) return state;

  const next = cloneState(state);
  let guard = 0;

  while (next.currentCombat && now - next.currentCombat.startedAt >= next.currentCombat.durationMs && guard < 50) {
    const enemy = getEnemy(next.currentCombat.enemyId);
    if (!enemy) {
      next.currentCombat = null;
      break;
    }

    completeKill(next, enemy, next.currentCombat.durationMs);
    next.currentCombat = {
      enemyId: enemy.id,
      startedAt: next.currentCombat.startedAt + next.currentCombat.durationMs,
      durationMs: expectedKillTimeMs(next, enemy.hp),
    };
    guard += 1;
  }

  next.lastSavedAt = Date.now();
  return next;
}

function completeKill(state: GameState, enemy: Enemy, durationMs: number) {
  const rewards = applyRewardModifiers(state, { credits: enemy.creditsReward, reputation: enemy.reputationReward }, ["street"]);
  const xpReward = applyXpModifier(state, "combat", enemy.xpReward);
  state.resources.credits += rewards.credits ?? 0;
  state.resources.reputation += rewards.reputation ?? 0;
  addSkillXp(state, "combat", xpReward);

  const log = state.enemyLog[enemy.id] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
  log.kills += 1;
  log.bestKillMs = log.bestKillMs === null ? durationMs : Math.min(log.bestKillMs, durationMs);

  const dropMessages: string[] = [];
  enemy.drops.forEach((drop) => {
    const chance = Math.min(0.95, drop.chance + getActiveModifiers(state).dropChance);
    if (Math.random() > chance) return;
    if (isResource(drop.id)) {
      state.resources[drop.id] += drop.quantity;
    } else {
      addItem(state, drop.id, drop.quantity);
    }
    log.discoveredDrops[drop.id] = (log.discoveredDrops[drop.id] ?? 0) + drop.quantity;
    discoverItem(state, drop.id);
    dropMessages.push(`${drop.quantity} ${drop.name}`);
    pushCategorizedLog(state, "Loot", `Loot found: ${drop.name}.`);
  });

  state.enemyLog[enemy.id] = log;
  markEnemyManual(state, enemy.id);
  const districtId = enemyDistrict(enemy.id);
  if (districtId) {
    discoverDistrictContent(state, districtId, `enemy:${enemy.id}`);
    changeLocalStanding(state, districtId, 1, `${enemy.name} defeated`);
  }
  pushCategorizedLog(
    state,
    "Combat",
    `${enemy.name} defeated: +${rewards.credits ?? 0} ${resourceNames.credits}, +${xpReward} Street Combat XP${
      dropMessages.length ? `, loot ${dropMessages.join(", ")}` : ""
    }.`,
  );
  updateWorldUnlocks(state);
}

function isResource(id: string): id is ResourceId {
  return id in resourceNames;
}

function enemyDistrict(enemyId: string) {
  const zone = combatZones.find((entry) => entry.enemies.some((enemy) => enemy.id === enemyId));
  if (zone?.id === "neon-row") return "neonRow";
  if (zone?.id === "rust-yards") return "rustYards";
  if (zone?.id === "underpass-market") return "underpassMarket";
  if (zone?.id === "blacknet-quarter") return "blacknetQuarter";
  if (zone?.id === "glassline-district") return "glasslineDistrict";
  if (zone?.id === "redline-blocks") return "redlineBlocks";
  return null;
}
