import { getItem } from "../data/items";
import type { GameState, ItemDefinition, ItemStats } from "../types";

export function upgradeCost(itemId: string, level: number) {
  const item = getItem(itemId);
  const tier = item?.tier ?? 1;
  const rarityMultiplier = rarityMaterialMultiplier(item?.rarity ?? "Common");
  const step = level + 1;
  const cost: Record<string, number> = {
    scrap: Math.ceil(5 * tier * step * rarityMultiplier),
    cyberwareParts: item?.type === "Cyberware" ? Math.ceil(tier * step * rarityMultiplier) : 0,
    circuitBoards: item?.type === "Weapon" || item?.type === "Cyberware" ? Math.ceil((step / 2) * rarityMultiplier) : 0,
  };
  if (step >= 4) cost[item?.type === "Weapon" ? "precision-parts" : item?.type === "Cyberware" ? "neural-connector" : "circuit-bundle"] = Math.ceil((step - 3) * rarityMultiplier);
  if (step >= 7) cost[item?.type === "Weapon" ? "mod-core" : item?.type === "Cyberware" ? "cyberware-upgrade-core" : "armorPlating"] = Math.ceil((step - 6) * rarityMultiplier);
  if (step >= 9) cost["rare-blueprint-fragment"] = Math.ceil((step - 8) * Math.max(1, rarityMultiplier - 0.5));
  if (step >= 10 && ["Epic", "Legendary", "Prototype", "Relic"].includes(item?.rarity ?? "Common")) {
    cost[item?.type === "Weapon" ? "prototype-weapon-core" : item?.type === "Cyberware" ? "prototype-neural-core" : "boss-data-key"] = 1;
  }
  return cost;
}

function rarityMaterialMultiplier(rarity: string) {
  if (rarity === "Relic") return 8;
  if (rarity === "Prototype") return 6;
  if (rarity === "Legendary") return 5;
  if (rarity === "Epic") return 3.5;
  if (rarity === "Rare") return 2.2;
  if (rarity === "Uncommon") return 1.4;
  return 1;
}

export function scaledStats(state: GameState, itemId: string): ItemStats {
  const item = getItem(itemId);
  const level = state.upgradeLevels[itemId] ?? 0;
  const scale = 1 + level * 0.08;
  const stats = item?.stats ?? {};
  return Object.fromEntries(Object.entries(stats).map(([key, value]) => {
    if (typeof value !== "number") return [key, value];
    const scaled = value * scale;
    if (Math.abs(value) < 1 || key.toLowerCase().includes("chance") || key.toLowerCase().includes("modifier")) {
      return [key, Number(scaled.toFixed(3))];
    }
    return [key, Math.round(scaled)];
  }));
}

export function scaledSellValue(state: GameState, itemId: string) {
  const item = getItem(itemId);
  return Math.round((item?.sellValue ?? 0) * (1 + (state.upgradeLevels[itemId] ?? 0) * 0.12));
}

export function cyberwareLoad(state: GameState) {
  return Math.max(0, Math.round(Object.values(state.equippedCyberware).reduce((sum, itemId) => {
    const item = getItem(itemId);
    return sum + cyberwareInstabilityLoad(item);
  }, 0)));
}

export function effectiveNeuralInstability(state: GameState) {
  return Math.min(100, cyberwareLoad(state));
}

export function cyberwareInstabilityLoad(item?: ItemDefinition) {
  if (!item || item.type !== "Cyberware") return 0;
  if ((item.instabilityLoad ?? 0) < 0) return item.instabilityLoad ?? 0;
  const rarityBase: Record<string, number> = {
    Common: 1,
    Uncommon: 2,
    Rare: 4,
    Epic: 7,
    Legendary: 11,
    Prototype: 14,
    Relic: 18,
  };
  const modifierLoad = cyberwareModifierLoad(item.modifiers);
  const explicitLoad = item.instabilityLoad ?? 0;
  return Math.max(0, Math.round((rarityBase[item.rarity] ?? 2) + (item.tier ?? 1) + explicitLoad + modifierLoad));
}

function cyberwareModifierLoad(modifiers: ItemDefinition["modifiers"]) {
  if (!modifiers) return 0;
  let load = 0;
  load += Math.max(0, modifiers.actionSpeed ?? 0) * 90;
  load += Math.max(0, modifiers.combatDamage ?? 0) * 80;
  load += Math.max(0, modifiers.combatDefense ?? 0) * 60;
  load += Math.max(0, modifiers.dropChance ?? 0) * 70;
  load += Math.max(0, modifiers.skillRewards ?? 0) * 70;
  load += Object.values(modifiers.skillXp ?? {}).reduce((sum, value) => sum + Math.max(0, value ?? 0) * 60, 0);
  load -= Math.max(0, -(modifiers.neuralInstabilityGain ?? 0)) * 120;
  load -= Math.max(0, modifiers.neuralInstabilityRecovery ?? 0) * 90;
  return load;
}
