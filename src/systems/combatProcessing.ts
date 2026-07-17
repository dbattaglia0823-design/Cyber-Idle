import { combatZones } from "../data/combat";
import { resourceNames } from "../data/resources";
import { addSkillXp } from "./actionProcessing";
import { calculateCombatRewards, calculateDropChance, calculatePlayerCombatStats } from "./balanceFormulas";
import { addItem, discoverItem } from "./collectionSystem";
import { clampRiskStat } from "./formulas";
import { cloneState, pushCategorizedLog } from "./gameState";
import { changeLocalStanding, discoverDistrictContent } from "./districtProgression";
import { applyXpModifier } from "./modifiers";
import { updateWorldUnlocks } from "./worldUnlocks";
import { markEnemyManual } from "./manualDiscovery";
import { processPercentDrops } from "./percentDrops";
import { addWeaponClassXp, equippedWeaponClass } from "./weaponSystem";
import { combatEffectivenessForEnemy, combatTagsForEnemy } from "./combatMatchups";
import { emitRewardPopupGroup } from "./rewardPopups";
import { clearActiveActivityForSwitch } from "./activitySwitching";
import { applyDamage, clampPlayerHP, maybeAutoHeal } from "./healthSystem";
import { addDistrictMasteryXp, districtMasteryDropBonus, districtMasteryRewardBonus, hasDistrictMasteryUnlock } from "./districtMasteryProcessor";
import type { CurrentCombat, Enemy, GameState, ResourceId } from "../types";

export function allEnemies() {
  return combatZones.flatMap((zone) => zone.enemies);
}

export function getEnemy(enemyId: string) {
  return allEnemies().find((enemy) => enemy.id === enemyId);
}

export function startCombat(state: GameState, enemyId: string, now = Date.now()) {
  const enemy = getEnemy(enemyId);
  if (!enemy) return state;
  if (state.health.lifeState === "downed") return state;
  if (!canFightEnemy(state, enemy)) return state;
  const next = cloneState(state);
  clampPlayerHP(next);
  clearActiveActivityForSwitch(state, next, enemy.name);
  next.currentCombat = createCombatState(next, enemy, now);
  return next;
}

export function canFightEnemy(state: GameState, enemy: Enemy) {
  if (state.skills.combat.level < (enemy.requiredCombatLevel ?? 1)) return false;
  const districtId = enemyDistrict(enemy.id);
  if (!districtId) return true;
  if (!enemy.behaviorTags?.includes("highThreat")) return true;
  return (state.districtThreat[districtId]?.level ?? 0) >= 35 || hasDistrictMasteryUnlock(state, districtId, "district-hardened-enemies");
}

export function stopCombat(state: GameState) {
  return { ...state, currentCombat: null };
}

export function processCombat(state: GameState, now = Date.now()) {
  if (!state.currentCombat) return state;

  const next = cloneState(state);
  let guard = 0;

  while (next.currentCombat && guard < 100) {
    const enemy = getEnemy(next.currentCombat.enemyId);
    if (!enemy) {
      next.currentCombat = null;
      break;
    }

    next.currentCombat = normalizeCombatState(next, enemy, now);
    const combat = next.currentCombat;
    const nextPlayerAttackAt = combat.nextPlayerAttackAt ?? now;
    const nextEnemyAttackAt = combat.nextEnemyAttackAt ?? now;
    const playerActsNext = nextPlayerAttackAt <= nextEnemyAttackAt;

    if (nextPlayerAttackAt > now && nextEnemyAttackAt > now) break;

    if (playerActsNext && nextPlayerAttackAt <= now) {
      const stats = calculatePlayerCombatStats(next);
      const damage = Math.max(1, stats.damage);
      combat.enemyCurrentHp = Math.max(0, (combat.enemyCurrentHp ?? combat.enemyMaxHp ?? enemy.hp) - damage);
      combat.lastPlayerAttackAt = nextPlayerAttackAt;
      combat.lastPlayerHit = { amount: damage, at: nextPlayerAttackAt };
      combat.nextPlayerAttackAt = nextPlayerAttackAt + stats.attackSpeedMs;
      if (combat.enemyCurrentHp <= 0) {
        const killDuration = Math.max(1, nextPlayerAttackAt - combat.startedAt);
        completeKill(next, enemy, killDuration);
        if (next.health.lifeState === "downed") break;
        const healed = maybeAutoHeal(next, enemy.name);
        next.currentCombat = createCombatState(next, enemy, nextPlayerAttackAt);
        if (healed) next.currentCombat.lastHealingReceived = next.health.lastHealingReceived;
      }
    } else if (nextEnemyAttackAt <= now) {
      const rawDamage = enemyAttackDamage(enemy);
      const damageTaken = applyDamage(next, rawDamage, enemy.name);
      if (next.currentCombat) {
        next.currentCombat.lastDamageTaken = damageTaken;
        next.currentCombat.lastEnemyAttackAt = nextEnemyAttackAt;
        next.currentCombat.lastEnemyHit = { amount: damageTaken, at: nextEnemyAttackAt };
        next.currentCombat.nextEnemyAttackAt = nextEnemyAttackAt + enemy.attackSpeedMs;
      }
      if (next.health.lifeState === "downed") {
        next.healthStatistics.deathsByEnemy[enemy.id] = (next.healthStatistics.deathsByEnemy[enemy.id] ?? 0) + 1;
        pushCategorizedLog(next, "Warning", `${enemy.name} downed you. Combat stopped.`);
        break;
      }
      const healed = maybeAutoHeal(next, enemy.name);
      if (healed && next.currentCombat) next.currentCombat.lastHealingReceived = next.health.lastHealingReceived;
    } else {
      break;
    }

    guard += 1;
  }

  next.lastSavedAt = Date.now();
  return next;
}

function createCombatState(state: GameState, enemy: Enemy, now: number): CurrentCombat {
  const matchup = combatEffectivenessForEnemy(state, enemy);
  const stats = calculatePlayerCombatStats(state);
  return {
    enemyId: enemy.id,
    startedAt: now,
    durationMs: matchup.expectedKillMs,
    enemyCurrentHp: matchup.effectiveHp,
    enemyMaxHp: matchup.effectiveHp,
    nextPlayerAttackAt: now + stats.attackSpeedMs,
    nextEnemyAttackAt: now + enemy.attackSpeedMs,
  };
}

function normalizeCombatState(state: GameState, enemy: Enemy, now: number): CurrentCombat {
  const current = state.currentCombat;
  if (!current) return createCombatState(state, enemy, now);
  const matchup = combatEffectivenessForEnemy(state, enemy);
  const stats = calculatePlayerCombatStats(state);
  const enemyMaxHp = current.enemyMaxHp ?? matchup.effectiveHp;
  return {
    ...current,
    durationMs: matchup.expectedKillMs,
    enemyMaxHp,
    enemyCurrentHp: Math.max(0, Math.min(enemyMaxHp, current.enemyCurrentHp ?? enemyMaxHp)),
    nextPlayerAttackAt: current.nextPlayerAttackAt ?? current.startedAt + stats.attackSpeedMs,
    nextEnemyAttackAt: current.nextEnemyAttackAt ?? current.startedAt + enemy.attackSpeedMs,
  };
}

function enemyAttackDamage(enemy: Enemy) {
  const threatScale = 1 + (enemy.threatScaling ?? 0) * 0.08;
  return Math.max(1, Math.round(enemy.damage * threatScale));
}

function completeKill(state: GameState, enemy: Enemy, durationMs: number) {
  const matchup = combatEffectivenessForEnemy(state, enemy);
  const districtId = enemyDistrict(enemy.id);
  const rewards = calculateCombatRewards(state, { credits: enemy.creditsReward, reputation: Math.max(0, enemy.reputationReward) }, matchup.tags, matchup.rewardMultiplier + districtMasteryRewardBonus(state, districtId));
  const xpReward = applyXpModifier(state, "combat", Math.round(enemy.xpReward * matchup.rewardMultiplier));
  state.resources.credits += rewards.credits ?? 0;
  state.resources.reputation += rewards.reputation ?? 0;
  state.resources.heat = clampRiskStat(state.resources.heat + matchup.heatChange);
  addSkillXp(state, "combat", xpReward);

  const log = state.enemyLog[enemy.id] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
  log.kills += 1;
  log.bestKillMs = log.bestKillMs === null ? durationMs : Math.min(log.bestKillMs, durationMs);

  const dropMessages: string[] = [];
  const weaponClass = equippedWeaponClass(state);
  const enemyTags = combatTagsForEnemy(enemy);
  if (weaponClass) {
    addWeaponClassXp(state, weaponClass, Math.max(5, Math.round(enemy.xpReward * 0.35)), true);
    state.weaponStatistics.killsByClass[weaponClass] = (state.weaponStatistics.killsByClass[weaponClass] ?? 0) + 1;
    state.weaponStatistics.damageByClass[weaponClass] = (state.weaponStatistics.damageByClass[weaponClass] ?? 0) + enemy.hp;
    if ((state.weaponStatistics.killsByClass[weaponClass] ?? 0) >= 1000) state.achievements[`weapon-${weaponClass}-1000-kills`] = true;
  }
  enemy.drops.forEach((drop) => {
    const chance = calculateDropChance(drop.chance, state, matchup.tags, matchup.dropChance + districtMasteryDropBonus(state, districtId));
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
  processPercentDrops(state, enemy.id, enemyTags, enemy.drops.map((drop) => drop.id)).forEach((message) => dropMessages.push(message));

  state.enemyLog[enemy.id] = log;
  markEnemyManual(state, enemy.id);
  if (districtId) {
    discoverDistrictContent(state, districtId, `enemy:${enemy.id}`);
    changeLocalStanding(state, districtId, 1, `${enemy.name} defeated`);
    addDistrictMasteryXp(state, districtId, "combat", Math.max(5, Math.round(enemy.xpReward * 0.65)));
  }
  pushCategorizedLog(
    state,
    "Combat",
    `${enemy.name} defeated: +${rewards.credits ?? 0} ${resourceNames.credits}, +${xpReward} Street Combat XP${
      dropMessages.length ? `, loot ${dropMessages.join(", ")}` : ""
    }. ${matchup.rating}${matchup.heatChange ? ` (${matchup.heatChange >= 0 ? "+" : ""}${matchup.heatChange} Heat)` : ""}.`,
  );
  emitRewardPopupGroup(state, {
    title: `${enemy.name} Defeated`,
    xp: { combat: xpReward },
    resources: rewards,
    rareDrops: dropMessages,
    heat: matchup.heatChange,
    neuralInstability: 0,
  });
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
