import type { PercentDropEntry } from "../types";

export const percentDropTables: Record<string, PercentDropEntry[]> = {
  "street-punk": [
    drop("crude-suppressor", 2.5, 1, 1, "Common"),
    drop("weapon-frame", 12, 1, 2, "Common"),
  ],
  "boosted-thug": [
    drop("junk-smg", 3, 1, 1, "Common"),
    drop("recoil-grip", 2, 1, 1, "Uncommon"),
  ],
  "scrap-drone": [
    drop("shock-capacitor", 1.5, 1, 1, "Uncommon"),
    drop("smartlink-chip", 5, 1, 1, "Uncommon"),
  ],
  "yard-raider": [
    drop("scrap-shotgun", 1, 1, 1, "Rare"),
    drop("shock-baton", 2, 1, 1, "Uncommon"),
  ],
  "scrap-hound": [
    drop("shock-rounds", 1.2, 1, 1, "Uncommon"),
  ],
  "market-cutthroat": [
    drop("monowire-knockoff", 0.6, 1, 1, "Rare"),
    drop("quiet-routine", 1.5, 1, 1, "Uncommon"),
  ],
  "trace-avatar": [
    drop("trace-scrambler", 0.9, 1, 1, "Rare"),
    drop("blacknet-link", 0.8, 1, 1, "Rare"),
  ],
  "corp-response-guard": [
    drop("armor-piercing-rifle", 1.1, 1, 1, "Rare"),
    drop("armor-piercing-barrel", 2, 1, 1, "Rare"),
  ],
  "redline-brawler": [
    drop("modified-smg", 1.4, 1, 1, "Uncommon"),
    drop("boss-breaker", 0.8, 1, 1, "Rare"),
  ],
};

function drop(
  itemId: string,
  chancePercent: number,
  minQuantity: number,
  maxQuantity: number,
  rarity: PercentDropEntry["rarity"],
): PercentDropEntry {
  return {
    itemId,
    chancePercent,
    minQuantity,
    maxQuantity,
    rarity,
    affectedByDropModifiers: true,
    affectedByScenarioModifiers: true,
  };
}
