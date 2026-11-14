import { settleBossIconic } from "./bossIconicLoot";
import { iconicWeaponHit, iconicIncoming, iconicKill, resetIconicTarget } from "./iconicCombat";
import { weaponDropFitsDistrict } from "../data/weaponProgression";
import { rollDistrictWeapon } from "../data/missionRewards";
import { getItem, items, weaponVariantDropId } from "../data/items";
import { combatZones } from "../data/combat";
import { resourceNames } from "../data/resources";
import { addSkillXp } from "./actionProcessing";
import { calculateActionHeatGain, calculateCombatRewards, calculateDropChance, calculatePlayerCombatStats } from "./balanceFormulas";
import { addItem, discoverItem } from "./collectionSystem";
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

const COMBAT_RESPAWN_DELAY_MS = 1000;

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
  if (state.health.lifeState === "downed" || state.health.currentHp <= 0) return false;
  if (state.skills.combat.level < (enemy.requiredCombatLevel ?? 1)) return false;
  const districtId = enemyDistrict(enemy.id);
  if (districtId && !state.districts[districtId]?.unlocked) return false;
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
  advanceCombat(next, now);
  next.lastSavedAt = Date.now();
  return next;
}

export interface CombatAdvanceOptions { simulated?: boolean; preview?: boolean; onKill?: (enemy:Enemy, durationMs:number, earned?:{xp:number;mastery:number})=>void }
// Mutating event processor shared by live ticks and cache simulations.
export function advanceCombat(next:GameState, now:number, options:CombatAdvanceOptions = {}) {
  let guard = 0;

  while (next.currentCombat && guard < 100) {
    const enemy = getEnemy(next.currentCombat.enemyId);
    if (!enemy) {
      next.currentCombat = null;
      break;
    }

    if(options.simulated && !canFightEnemy(next,enemy)){next.currentCombat=null;break;}
    next.currentCombat = normalizeCombatState(next, enemy, now);
    if (next.currentCombat.respawnAt) {
      if (now < next.currentCombat.respawnAt) break;
      const carried = next.currentCombat.iconicMemory;
      next.currentCombat = createCombatState(next, enemy, next.currentCombat.respawnAt);
      next.currentCombat.iconicMemory = carried ? {...carried} : undefined;
    }
    const combat = next.currentCombat;
    const nextPlayerAttackAt = combat.nextPlayerAttackAt ?? now;
    const nextEnemyAttackAt = combat.nextEnemyAttackAt ?? now;
    const playerActsNext = nextPlayerAttackAt <= nextEnemyAttackAt;

    if (nextPlayerAttackAt > now && nextEnemyAttackAt > now) break;

    if (playerActsNext && nextPlayerAttackAt <= now) {
      const stats = calculatePlayerCombatStats(next);
      const iconic = iconicWeaponHit(next,combat,{mode:"idle",damage:stats.damage,maxHp:stats.maxHp,enemyHp:combat.enemyCurrentHp??enemy.hp,enemyMaxHp:combat.enemyMaxHp??enemy.hp,armored:(enemy.armor??0)>0,shielded:enemy.armorType==="shielded" || !!enemy.traits?.includes("shielded")});
      const damage = Math.max(1, Math.round(stats.damage*iconic.multiplier+iconic.extra));
      combat.enemyCurrentHp = Math.max(0, (combat.enemyCurrentHp ?? combat.enemyMaxHp ?? enemy.hp) - damage);
      combat.lastPlayerAttackAt = nextPlayerAttackAt;
      combat.lastPlayerHit = { amount: damage, at: nextPlayerAttackAt };
      combat.nextPlayerAttackAt = nextPlayerAttackAt + Math.max(400,Math.round(stats.attackSpeedMs*iconic.interval));
      if (combat.enemyCurrentHp <= 0) {
        const killDuration = Math.max(1, nextPlayerAttackAt - combat.startedAt);
        iconicKill(next,combat,stats.maxHp);
        resetIconicTarget(next,combat);
        const earned = options.preview ? undefined : completeKill(next, enemy, killDuration, !options.simulated);
        options.onKill?.(enemy,killDuration,earned);
        if (next.health.lifeState === "downed") break;
        const healed = maybeAutoHeal(next, enemy.name);
        if (!next.currentCombat) break;
        next.currentCombat = {
          ...combat,
          enemyCurrentHp: 0,
          respawnAt: nextPlayerAttackAt + COMBAT_RESPAWN_DELAY_MS,
          nextPlayerAttackAt: nextPlayerAttackAt + COMBAT_RESPAWN_DELAY_MS,
          nextEnemyAttackAt: nextPlayerAttackAt + COMBAT_RESPAWN_DELAY_MS,
        };
        if (healed) next.currentCombat.lastHealingReceived = next.health.lastHealingReceived;
        break;
      }
    } else if (nextEnemyAttackAt <= now) {
      const rawDamage = Math.max(1,Math.round(enemyAttackDamage(enemy)*iconicIncoming(next,combat)));
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

function completeKill(state: GameState, enemy: Enemy, durationMs: number, manual = true) {
  const matchup = combatEffectivenessForEnemy(state, enemy);
  const districtId = enemyDistrict(enemy.id);
  const rewards = calculateCombatRewards(state, { credits: enemy.creditsReward, reputation: Math.max(0, enemy.reputationReward) }, matchup.tags, matchup.rewardMultiplier + districtMasteryRewardBonus(state, districtId));
  const xpReward = applyXpModifier(state, "combat", Math.round(enemy.xpReward * matchup.rewardMultiplier));
  state.resources.credits += rewards.credits ?? 0;
  state.resources.reputation += rewards.reputation ?? 0;
  const heatDelta = calculateActionHeatGain(state, matchup.heatChange, durationMs, combatTagsForEnemy(enemy));
  state.resources.heat = Math.max(0, Math.min(100, state.resources.heat + heatDelta));
  addSkillXp(state, "combat", xpReward);
  // Repeatable Street Combat advances combat skill, weapon mastery and loot only.

  const log = state.enemyLog[enemy.id] ?? { kills: 0, bestKillMs: null, discoveredDrops: {} };
  log.kills += 1;
  log.bestKillMs = log.bestKillMs === null ? durationMs : Math.min(log.bestKillMs, durationMs);

  const dropMessages: string[] = [];
  const weaponClass = equippedWeaponClass(state);
  const enemyTags = combatTagsForEnemy(enemy);
  if (weaponClass) {
    addWeaponClassXp(state, weaponClass, Math.max(5, Math.round(enemy.xpReward * 0.35)), manual);
    state.weaponStatistics.killsByClass[weaponClass] = (state.weaponStatistics.killsByClass[weaponClass] ?? 0) + 1;
    state.weaponStatistics.damageByClass[weaponClass] = (state.weaponStatistics.damageByClass[weaponClass] ?? 0) + enemy.hp;
    if ((state.weaponStatistics.killsByClass[weaponClass] ?? 0) >= 1000) state.achievements[`weapon-${weaponClass}-1000-kills`] = true;
  }
  enemy.drops.forEach((drop) => {
    const weapon = getItem(drop.id);
    if (weapon?.type === "Weapon" && weapon.weaponDistrict && districtId && !weaponDropFitsDistrict(weapon, districtId)) return;
    const chance = calculateDropChance(drop.chance, state, matchup.tags, matchup.dropChance + districtMasteryDropBonus(state, districtId));
    if (Math.random() > chance) return;
    const droppedId = weaponVariantDropId(drop.id);
    const droppedName = getItem(droppedId)?.name ?? drop.name;
    if (isResource(drop.id)) {
      state.resources[drop.id] += drop.quantity;
    } else {
      addItem(state, droppedId, drop.quantity);
    }
    log.discoveredDrops[droppedId] = (log.discoveredDrops[droppedId] ?? 0) + drop.quantity;
    discoverItem(state, droppedId);
    dropMessages.push(`${drop.quantity} ${droppedName}`);
    pushCategorizedLog(state, "Loot", `Loot found: ${droppedName}.`);
  });
  processPercentDrops(state, enemy.id, enemyTags,  [...enemy.drops.map((drop) => drop.id), ...items.filter(item => item.type === "Weapon" && (!districtId || !weaponDropFitsDistrict(item, districtId))).map(item => item.id)]).forEach((message) => dropMessages.push(message));

  if (districtId) {
    const weaponDrop = rollDistrictWeapon(districtId, enemy.behaviorTags?.includes("highThreat") ? .06 : .015);
    if (weaponDrop) {
      addItem(state, weaponDrop, 1); discoverItem(state, weaponDrop);
      log.discoveredDrops[weaponDrop] = (log.discoveredDrops[weaponDrop] ?? 0) + 1;
      dropMessages.push(getItem(weaponDrop)!.name);
    }
  }
  state.enemyLog[enemy.id] = log;
  if(manual) markEnemyManual(state, enemy.id);
  const iconic = settleBossIconic(state, enemy.id);
  if(iconic){log.discoveredDrops[iconic]=(log.discoveredDrops[iconic]??0)+1;dropMessages.push(`★ ${getItem(iconic)!.name} · Iconic recovered`);}
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
    }. ${matchup.rating}${heatDelta ? ` (${heatDelta >= 0 ? "+" : ""}${Number(heatDelta.toFixed(2))} Heat)` : ""}.`,
  );
  emitRewardPopupGroup(state, {
    title: `${enemy.name} Defeated`,
    xp: { combat: xpReward },
    resources: rewards,
    rareDrops: dropMessages,
    heat: heatDelta,
    neuralInstability: 0,
  });
  updateWorldUnlocks(state);
  return {xp:xpReward,mastery:weaponClass ? Math.max(5,Math.round(enemy.xpReward*.35)) : 0};
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
  if (zone?.id === "helix-ward") return "helixWard";
  if (zone?.id === "skyline-core") return "skylineCore";
  if (zone?.id === "glassline-district") return "glasslineDistrict";
  if (zone?.id === "redline-blocks") return "redlineBlocks";
  return null;
}
