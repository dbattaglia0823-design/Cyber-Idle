import { getItem } from "../data/items";
import { housingOptions } from "../data/housing";
import { removeItem } from "./collectionSystem";
import { calculatePlayerCombatStats } from "./balanceFormulas";
import { combatEffectivenessForEnemy } from "./combatMatchups";
import { getActiveModifiers } from "./modifiers";
import { emitRewardPopupGroup } from "./rewardPopups";
import { clampRiskStat } from "./formulas";
import type { Enemy, GameState } from "../types";

export const defaultHealingItemId = "basic-med-injector";

export const healingItems: Record<string, { label: string; flat?: number; percent?: number; autoEligible: boolean; instability?: number; revive?: boolean }> = {
  "basic-med-injector": { label: "Basic Med Injector", flat: 25, autoEligible: true },
  "trauma-patch": { label: "Trauma Patch", percent: 0.2, autoEligible: true },
  "combat-stim": { label: "Combat Stim", flat: 20, percent: 0.1, autoEligible: true, instability: 1 },
  "advanced-med-injector": { label: "Advanced Med Injector", percent: 0.5, autoEligible: true },
  "emergency-reboot-kit": { label: "Emergency Reboot Kit", percent: 0.35, autoEligible: true, revive: true },
};

export function calculateMaxHP(state: GameState) {
  return calculatePlayerCombatStats(state).maxHp;
}

export function calculateCurrentHP(state: GameState) {
  return clampPlayerHP(state).health.currentHp;
}

export function clampPlayerHP(state: GameState) {
  const maxHp = calculateMaxHP(state);
  state.health.currentHp = Math.max(0, Math.min(maxHp, Math.round(state.health.currentHp || maxHp)));
  if (state.health.currentHp > 0 && state.health.lifeState === "downed") state.health.lifeState = "alive";
  return state;
}

export function applyDamage(state: GameState, rawAmount: number, source: string) {
  const stats = calculatePlayerCombatStats(state);
  const modifiers = getActiveModifiers(state);
  const armorReduction = Math.min(rawAmount * 0.7, stats.armor * 0.85);
  const percentReduction = Math.min(0.75, modifiers.damageReduction + modifiers.combatDefense * 0.35);
  const afterArmor = Math.max(1, rawAmount - armorReduction);
  const damage = Math.max(1, Math.round(afterArmor * (1 - percentReduction)));
  state.health.currentHp = Math.max(0, state.health.currentHp - damage);
  state.health.lastDamageTaken = damage;
  state.health.lastDamageSource = source;
  state.healthStatistics.totalDamageTaken += damage;
  state.healthStatistics.damageReducedByArmor += Math.max(0, Math.round(rawAmount - damage));
  if (state.health.currentHp > 0) {
    state.healthStatistics.lowestHpSurvived =
      state.healthStatistics.lowestHpSurvived === null ? state.health.currentHp : Math.min(state.healthStatistics.lowestHpSurvived, state.health.currentHp);
  }
  if (state.health.currentHp <= 0) markDowned(state, source);
  return damage;
}

export function applyHealing(state: GameState, amount: number, source: string) {
  const maxHp = calculateMaxHP(state);
  const modifiers = getActiveModifiers(state);
  const adjusted = Math.max(1, Math.round(amount * (1 + modifiers.healingReceived)));
  const before = state.health.currentHp;
  state.health.currentHp = Math.min(maxHp, state.health.currentHp + adjusted);
  state.health.lastHealingReceived = state.health.currentHp - before;
  state.health.lastHealingSource = source;
  state.healthStatistics.totalHealingReceived += Math.max(0, state.health.lastHealingReceived);
  if (state.health.currentHp > 0) state.health.lifeState = "alive";
  return state.health.lastHealingReceived;
}

export function useHealingItem(state: GameState, itemId: string, source = "Manual healing") {
  const item = getItem(itemId);
  const healing = healingItems[itemId];
  if (!item || !healing || (state.inventory[itemId] ?? 0) <= 0) return { used: false, healed: 0 };
  if (state.health.lifeState === "downed" && !healing.revive) return { used: false, healed: 0 };
  if (!removeItem(state, itemId, 1)) return { used: false, healed: 0 };
  const maxHp = calculateMaxHP(state);
  const amount = (healing.flat ?? 0) + Math.round(maxHp * (healing.percent ?? 0));
  if (healing.revive && state.health.lifeState === "downed") state.health.lifeState = "alive";
  const healed = applyHealing(state, amount, item.name);
  state.healthStatistics.healingItemsUsed += 1;
  if (source === "Auto Heal") state.healthStatistics.autoHealsTriggered += 1;
  state.achievements["used-first-healing-item"] = true;
  if (source === "Auto Heal") state.achievements["auto-heal-triggered"] = true;
  emitRewardPopupGroup(state, {
    title: source,
    category: "resource",
    story: [`${item.name} restored ${healed} HP`],
    neuralInstability: 0,
  });
  return { used: true, healed };
}

export function maybeAutoHeal(state: GameState, source: string) {
  unlockAutoHeal(state);
  if (!state.autoHeal.unlocked || !state.autoHeal.enabled || state.health.lifeState === "downed") return false;
  const maxHp = calculateMaxHP(state);
  if (state.health.currentHp > maxHp * (state.autoHeal.threshold / 100)) return false;
  const preferred = state.autoHeal.itemId;
  const fallback = Object.keys(healingItems).find((id) => healingItems[id].autoEligible && (state.inventory[id] ?? 0) > 0);
  const itemId = (state.inventory[preferred] ?? 0) > 0 ? preferred : fallback;
  if (!itemId) {
    if (state.autoHeal.stopIfNoHealing) {
      state.currentCombat = null;
      state.activeOperation = null;
    }
    emitRewardPopupGroup(state, { title: "Auto Heal Failed", category: "warning", warnings: [`No healing item available after ${source}`] });
    return false;
  }
  return useHealingItem(state, itemId, "Auto Heal").used;
}

export function applyPassiveRecovery(state: GameState, elapsedMs: number) {
  if (state.currentCombat || state.activeOperation || state.health.lifeState === "downed") return state;
  const maxHp = calculateMaxHP(state);
  if (state.health.currentHp >= maxHp) return state;
  const residence = housingOptions.find((housing) => housing.id === state.activeResidence);
  const modifiers = getActiveModifiers(state);
  const basePerSecond = 1 / 1.5;
  const bonusPerSecond = Math.max(0, (state.skills.medical.level * 0.08 + (residence?.neuralRecoveryBonus ?? 0) * 0.4 + modifiers.hpRegen) / 60);
  const healing = (elapsedMs / 1000) * (basePerSecond + bonusPerSecond);
  if (healing <= 0) return state;
  const before = state.health.currentHp;
  state.health.currentHp = Math.min(maxHp, state.health.currentHp + healing);
  state.health.lastHealingReceived = state.health.currentHp - before;
  state.health.lastHealingSource = "Passive recovery";
  state.healthStatistics.totalHealingReceived += Math.max(0, state.health.lastHealingReceived);
  return state;
}

export function recoverFromDowned(state: GameState, mode: "basic" | "paid" | "full" = "basic") {
  if (state.health.lifeState !== "downed") return state;
  const maxHp = calculateMaxHP(state);
  const cost = mode === "full" ? Math.min(state.resources.credits, Math.ceil(maxHp * 1.2)) : mode === "paid" ? Math.min(state.resources.credits, Math.ceil(maxHp * 0.5)) : 0;
  state.resources.credits -= cost;
  state.health.lifeState = "alive";
  state.health.currentHp = Math.max(1, Math.round(maxHp * (mode === "full" ? 1 : mode === "paid" ? 0.75 : 0.2)));
  state.health.lastHealingReceived = state.health.currentHp;
  state.health.lastHealingSource = mode === "basic" ? "Basic Recovery" : "Medical Recovery";
  if (mode !== "basic") state.healthStatistics.ripperdocRecoveries += 1;
  emitRewardPopupGroup(state, {
    title: mode === "basic" ? "Basic Recovery" : "Medical Recovery",
    category: "resource",
    story: [`Recovered to ${state.health.currentHp}/${maxHp} HP${cost ? ` for ${cost} Credits` : ""}`],
  });
  return state;
}

export function estimateCombatSafety(state: GameState, enemy: Enemy) {
  const matchup = combatEffectivenessForEnemy(state, enemy);
  const damage = estimateIncomingDamage(state, enemy, matchup.expectedKillMs);
  const maxHp = calculateMaxHP(state);
  const currentHp = Math.max(1, state.health.currentHp);
  const healingReserve = Object.entries(healingItems).reduce((sum, [id, healing]) => {
    const count = state.inventory[id] ?? 0;
    return sum + count * ((healing.flat ?? 0) + Math.round(maxHp * (healing.percent ?? 0)));
  }, 0);
  const effectiveHp = currentHp + (state.autoHeal.enabled ? healingReserve : 0);
  const ratio = damage / Math.max(1, effectiveHp);
  const rating = ratio < 0.25 ? "Safe" : ratio < 0.55 ? "Risky" : ratio < 0.9 ? "Dangerous" : "Deadly";
  return {
    rating,
    estimatedDamage: damage,
    recommendedHp: Math.min(maxHp, Math.ceil(damage * 1.25)),
    healingItem: Object.keys(healingItems).find((id) => (state.inventory[id] ?? 0) > 0) ?? defaultHealingItemId,
  };
}

export function estimateIncomingDamage(state: GameState, enemy: Enemy, durationMs: number) {
  const attacks = Math.max(1, Math.floor(durationMs / Math.max(600, enemy.attackSpeedMs)));
  const modifiers = getActiveModifiers(state);
  const dodge = Math.min(0.65, modifiers.dodgeChance + equippedDodge(state));
  const expectedHits = attacks * (1 - dodge);
  const threatScale = 1 + (enemy.threatScaling ?? 0) * 0.08;
  return Math.max(1, Math.round(enemy.damage * expectedHits * threatScale));
}

export function unlockAutoHeal(state: GameState) {
  if (state.autoHeal.unlocked) return;
  if (state.skills.combat.level >= 5 || Object.keys(healingItems).some((id) => (state.inventory[id] ?? 0) > 0)) {
    state.autoHeal.unlocked = true;
  }
}

function markDowned(state: GameState, source: string) {
  state.health.lifeState = "downed";
  state.health.downedAt = Date.now();
  state.health.recoveryAvailableAt = Date.now();
  state.currentCombat = null;
  state.activeOperation = null;
  const penalty = Math.min(state.resources.credits, Math.max(5, Math.round(state.resources.credits * 0.04)));
  state.resources.credits -= penalty;
  state.resources.heat = clampRiskStat(state.resources.heat + 2);
  state.healthStatistics.deaths += 1;
  state.achievements["first-downed"] = true;
  emitRewardPopupGroup(state, {
    title: "Runner Downed",
    category: "warning",
    warnings: [`${source} dropped you to 0 HP`, penalty ? `Medical fallout cost ${penalty} Credits` : "No Credits lost"],
    heat: 2,
    durationMs: 6000,
  });
}

function equippedDodge(state: GameState) {
  return [...Object.values(state.equippedGear), ...Object.values(state.equippedCyberware)].reduce((sum, itemId) => {
    if (!itemId) return sum;
    return sum + (getItem(itemId)?.stats?.dodge ?? 0);
  }, 0);
}
