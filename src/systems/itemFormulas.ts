import { getItem } from "../data/items";
import type { GameState, ItemStats } from "../types";

export function upgradeCost(itemId: string, level: number) {
  const item = getItem(itemId);
  const tier = item?.tier ?? 1;
  return {
    scrap: 5 * tier * (level + 1),
    cyberwareParts: item?.type === "Cyberware" ? tier * (level + 1) : 0,
    circuitBoards: item?.type === "Weapon" || item?.type === "Cyberware" ? Math.ceil((level + 1) / 2) : 0,
  };
}

export function scaledStats(state: GameState, itemId: string): ItemStats {
  const item = getItem(itemId);
  const level = state.upgradeLevels[itemId] ?? 0;
  const scale = 1 + level * 0.08;
  const stats = item?.stats ?? {};
  return Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, typeof value === "number" ? value * scale : value]));
}

export function scaledSellValue(state: GameState, itemId: string) {
  const item = getItem(itemId);
  return Math.round((item?.sellValue ?? 0) * (1 + (state.upgradeLevels[itemId] ?? 0) * 0.12));
}

export function cyberwareLoad(state: GameState) {
  return Object.values(state.equippedCyberware).reduce((sum, itemId) => sum + (getItem(itemId)?.instabilityLoad ?? 0), 0);
}

export function effectiveNeuralInstability(state: GameState) {
  return Math.min(100, state.neuralInstability + cyberwareLoad(state));
}
