import { percentDropTables } from "../data/percentDrops";
import { getItem } from "../data/items";
import { resourceNames } from "../data/resources";
import { addItem, discoverItem } from "./collectionSystem";
import { calculateDropChance } from "./balanceFormulas";
import type { GameState, PercentDropEntry, ResourceId } from "../types";

export function processPercentDrops(state: GameState, sourceId: string, sourceTags: string[] = [], excludedItemIds: string[] = []) {
  const excluded = new Set(excludedItemIds);
  const table = (percentDropTables[sourceId] ?? []).filter((entry) => !excluded.has(entry.itemId));
  const gained: string[] = [];
  table.forEach((entry) => {
    const chance = entry.affectedByDropModifiers || entry.affectedByScenarioModifiers
      ? calculateDropChance(entry.chancePercent / 100, state, entry.affectedByScenarioModifiers ? sourceTags : []) * 100
      : entry.chancePercent;
    revealDropFromAttempts(state, sourceId, entry);
    if (Math.random() * 100 > chance) return;
    const quantity = randomQuantity(entry);
    if (isResource(entry.itemId)) state.resources[entry.itemId] += quantity;
    else addItem(state, entry.itemId, quantity);
    markDropFound(state, sourceId, entry, quantity);
    gained.push(`${quantity} ${getItem(entry.itemId)?.name ?? resourceNames[entry.itemId as ResourceId] ?? entry.itemId}`);
    if (entry.rarity !== "Common") state.weaponStatistics.rareDropsFound += 1;
    if (getItem(entry.itemId)?.type === "WeaponAttachment") state.weaponStatistics.attachmentDropsFound += 1;
  });
  return gained;
}

export function dropRevealState(state: GameState, sourceId: string, entry: PercentDropEntry, kills: number) {
  const discovery = state.dropDiscovery[sourceId];
  const scanner = hasScanner(state);
  return {
    known: Boolean(discovery?.revealedDrops[entry.itemId]) || kills >= 10 || scanner,
    chanceKnown: Boolean(discovery?.revealedChances[entry.itemId]) || kills >= 250 || scanner,
    rareHint: kills >= 100 || scanner,
  };
}

export function revealDropFromAttempts(state: GameState, sourceId: string, entry: PercentDropEntry) {
  const discovery = state.dropDiscovery[sourceId] ?? { revealedDrops: {}, revealedChances: {} };
  const kills = Object.values(state.enemyLog).find((log) => state.enemyLog[sourceId] === log)?.kills ?? state.enemyLog[sourceId]?.kills ?? 0;
  if (kills >= 10 || hasScanner(state)) discovery.revealedDrops[entry.itemId] = true;
  if (kills >= 250 || hasScanner(state)) {
    if (!discovery.revealedChances[entry.itemId]) state.weaponStatistics.dropRatesRevealed += 1;
    discovery.revealedChances[entry.itemId] = true;
  }
  state.dropDiscovery[sourceId] = discovery;
}

function markDropFound(state: GameState, sourceId: string, entry: PercentDropEntry, quantity: number) {
  const log = state.enemyLog[sourceId];
  if (log) log.discoveredDrops[entry.itemId] = (log.discoveredDrops[entry.itemId] ?? 0) + quantity;
  const discovery = state.dropDiscovery[sourceId] ?? { revealedDrops: {}, revealedChances: {} };
  discovery.revealedDrops[entry.itemId] = true;
  if (!discovery.revealedChances[entry.itemId]) state.weaponStatistics.dropRatesRevealed += 1;
  discovery.revealedChances[entry.itemId] = true;
  state.dropDiscovery[sourceId] = discovery;
  discoverItem(state, entry.itemId);
}

function randomQuantity(entry: PercentDropEntry) {
  return entry.minQuantity + Math.floor(Math.random() * (entry.maxQuantity - entry.minQuantity + 1));
}

function hasScanner(state: GameState) {
  const equipped = [
    ...Object.values(state.equippedCyberware),
    ...Object.values(state.equippedGear),
    ...Object.values(state.weaponLoadouts[state.equippedGear.weapon ?? ""]?.attachments ?? {}),
  ];
  return equipped.some((id) => id === "basic-optic-scanner" || id === "threat-scanner-scope");
}

function isResource(id: string): id is ResourceId {
  return id in resourceNames;
}
