import type { CraftingRecipe, DistrictId, GameState, ItemDefinition, ItemRarity } from "../types";

export type DropRateAmplifierTier = {
  districtId: DistrictId;
  districtName: string;
  itemId: string;
  name: string;
  upgradeStage: number;
  dropRateBonus: number;
  craftingLevel: number;
  rarity: ItemRarity;
  materials: Record<string, number>;
};

type DistrictAmplifier = {
  districtId: DistrictId;
  districtName: string;
  prefix: string;
  craftingLevels: number[];
  materials: Array<Record<string, number>>;
};

const upgradeRarities: ItemRarity[] = ["Common", "Uncommon", "Rare", "Epic"];
const upgradeBonuses = [0.02, 0.04, 0.06, 0.08];

const districtAmplifiers: DistrictAmplifier[] = [
  {
    districtId: "neonRow",
    districtName: "Neon Row",
    prefix: "Neon Row Loot Scanner",
    craftingLevels: [1, 6, 11, 16],
    materials: [
      { scrap: 40, circuitBoards: 8, encryptedData: 6 },
      { circuitBoards: 12, encryptedData: 16, "street-coil": 2 },
      { "neon-circuit-fragment": 6, "street-coil": 4, "lowgrade-optic-lens": 2 },
      { "urban-reflex-chip": 4, "lowgrade-optic-lens": 6, "neon-circuit-fragment": 5, encryptedData: 30 },
    ],
  },
  {
    districtId: "rustYards",
    districtName: "Rust Yards",
    prefix: "Rust Yards Salvage Scanner",
    craftingLevels: [21, 26, 31, 36],
    materials: [
      { vehicleParts: 24, circuitBoards: 8, "salvaged-servo": 5 },
      { circuitBoards: 12, "drone-motor": 5, "rust-plated-frame": 2 },
      { "chrome-jackal-gearset": 3, "rust-plated-frame": 6, "drone-motor": 4 },
      { "drone-motor": 8, "chrome-jackal-gearset": 4, engineCore: 2 },
    ],
  },
  {
    districtId: "underpassMarket",
    districtName: "Underpass Market",
    prefix: "Underpass Contraband Scanner",
    craftingLevels: [41, 46, 51, 56],
    materials: [
      { "contraband-chip": 5, "black-ledger-shard": 3, encryptedData: 25 },
      { "black-ledger-shard": 6, "smuggler-seal": 4, "contraband-chip": 3 },
      { "illegal-mod-core": 4, "contraband-chip": 8, "black-ledger-shard": 4 },
      { "illegal-mod-core": 6, "black-ledger-shard": 10, "smuggler-seal": 7 },
    ],
  },
  {
    districtId: "blacknetQuarter",
    districtName: "Blacknet Quarter",
    prefix: "Blacknet Signal Harvester",
    craftingLevels: [61, 66, 71, 76],
    materials: [
      { encryptedData: 40, "trace-scrambler-chip": 4, "encrypted-memory-stack": 2 },
      { "encrypted-memory-stack": 6, "trace-scrambler-chip": 6, "rogue-packet-core": 2 },
      { "rogue-packet-core": 8, "daemon-fragment": 2, "encrypted-memory-stack": 3 },
      { "daemon-fragment": 4, "rogue-packet-core": 12, "encrypted-memory-stack": 8 },
    ],
  },
  {
    districtId: "helixWard",
    districtName: "Helix Ward",
    prefix: "Helix Recovery Analyzer",
    craftingLevels: [81, 86, 91, 96],
    materials: [
      { "stabilizer-compound": 6, "neural-dampener": 4, "medical-gel-matrix": 2 },
      { "medical-gel-matrix": 7, "bioware-thread": 3, encryptedData: 40 },
      { "bioware-thread": 8, "helix-authorization": 2, "medical-gel-matrix": 4 },
      { "helix-authorization": 4, "bioware-thread": 12, "medical-gel-matrix": 10 },
    ],
  },
  {
    districtId: "glasslineDistrict",
    districtName: "Glassline District",
    prefix: "Glassline Asset Tracker",
    craftingLevels: [101, 106, 111, 116],
    materials: [
      { "glassline-alloy": 5, "security-override-chip": 4, "corporate-optic-lens": 2 },
      { "corporate-optic-lens": 7, "executive-processor": 3, "security-override-chip": 2 },
      { "executive-processor": 5, "glassline-alloy": 8, "corporate-optic-lens": 4 },
      { "security-override-chip": 10, "executive-processor": 7, "corporate-optic-lens": 10 },
    ],
  },
  {
    districtId: "redlineBlocks",
    districtName: "Redline Blocks",
    prefix: "Redline Trophy Scanner",
    craftingLevels: [121, 126, 131, 136],
    materials: [
      { "reinforced-grip": 6, "redline-trigger-kit": 5, "ballistic-core": 2 },
      { "ballistic-core": 5, "armor-breaker-plate": 4, "combat-stim-pack": 3 },
      { "combat-stim-pack": 9, "redline-trigger-kit": 8, "armor-breaker-plate": 4 },
      { "ballistic-core": 10, "armor-breaker-plate": 8, "combat-stim-pack": 12 },
    ],
  },
  {
    districtId: "skylineCore",
    districtName: "Skyline Core",
    prefix: "Skyline Acquisition Matrix",
    craftingLevels: [141, 144, 147, 150],
    materials: [
      { "luxury-processor": 5, "skyline-authorization": 2 },
      { "legendary-chrome-matrix": 2, "luxury-processor": 7, "skyline-authorization": 2 },
      { "relic-circuit": 2, "apex-neural-core": 2, "legendary-chrome-matrix": 1 },
      { "relic-circuit": 4, "apex-neural-core": 4, "legendary-chrome-matrix": 3, "skyline-authorization": 4 },
    ],
  },
];

export const dropRateAmplifierTiers: DropRateAmplifierTier[] = districtAmplifiers.flatMap((district) =>
  district.craftingLevels.map((craftingLevel, upgradeStage) => ({
    districtId: district.districtId,
    districtName: district.districtName,
    itemId: `drop-amplifier-${district.districtId}-${upgradeStage + 1}`,
    name: upgradeStage === 0 ? district.prefix : `${district.prefix} Mk ${["", "II", "III", "IV"][upgradeStage]}`,
    upgradeStage,
    dropRateBonus: upgradeBonuses[upgradeStage],
    craftingLevel,
    rarity: upgradeRarities[upgradeStage],
    materials: district.materials[upgradeStage],
  })),
);

export const dropRateAmplifierItems: ItemDefinition[] = dropRateAmplifierTiers.map((tier) => ({
  id: tier.itemId,
  name: tier.name,
  description: `${tier.upgradeStage === 0 ? "Permanent district scanner" : `Permanent district scanner upgrade ${tier.upgradeStage} of 3`}. Increases all drop chances while operating in ${tier.districtName} by up to ${Math.round(tier.dropRateBonus * 100)} percentage points. Only the strongest scanner applies.`,
  type: "Quest",
  rarity: tier.rarity,
  tags: ["player-upgrade", "drop-rate-amplifier", "district-wide", tier.districtId, `drop-amplifier-tier-${tier.upgradeStage + 1}`],
  stackable: false,
  maxStack: 1,
  sellValue: 0,
  sourceHint: `Craft in ${tier.districtName}. One-time permanent unlock.`,
  requiredSkill: "streetcraft",
  requiredLevel: tier.craftingLevel,
  tier: tier.upgradeStage + 1,
}));

export const dropRateAmplifierRecipes: CraftingRecipe[] = dropRateAmplifierTiers.map((tier) => {
  const districtTiers = dropRateAmplifierTiers.filter((entry) => entry.districtId === tier.districtId);
  const previousItemId = tier.upgradeStage > 0 ? districtTiers[tier.upgradeStage - 1].itemId : undefined;
  return {
    id: `recipe-${tier.itemId}`,
    name: tier.upgradeStage === 0 ? `Craft ${tier.name}` : `Upgrade to ${tier.name}`,
    category: "Player Upgrades",
    requiredSkill: "streetcraft",
    requiredLevel: tier.craftingLevel,
    requiredDistrict: tier.districtId,
    inputCosts: { ...tier.materials, ...(previousItemId ? { [previousItemId]: 1 } : {}) },
    outputItemId: tier.itemId,
    outputQuantity: 1,
    durationMs: 10000 + tier.upgradeStage * 4000,
    xpReward: 40 + tier.craftingLevel * 3,
    masteryXpReward: 20 + tier.craftingLevel,
    tags: ["crafting", "player-upgrade", "upgrades", "streetcraft", "drop-rate-amplifier"],
    unlockRequirements: [previousItemId ? `Previous scanner: ${previousItemId}` : `District: ${tier.districtId}`],
  };
});

export function activeDistrictDropAmplifier(state: GameState) {
  if (!state.selectedDistrict) return undefined;
  return dropRateAmplifierTiers
    .filter((tier) => tier.districtId === state.selectedDistrict && (state.discoveredItems[tier.itemId] || (state.inventory[tier.itemId] ?? 0) > 0))
    .sort((left, right) => right.upgradeStage - left.upgradeStage)[0];
}
