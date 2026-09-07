import type { CraftingRecipe, DistrictId, GameState, ItemDefinition, ItemRarity, SkillAction } from "../types";

type CountermeasureTier = {
  districtId: DistrictId;
  districtName: string;
  itemId: string;
  name: string;
  upgradeStage: number;
  protectedLevel: number;
  craftingLevel: number;
  rarity: ItemRarity;
  materials: Record<string, number>;
};

type DistrictCountermeasure = {
  districtId: DistrictId;
  districtName: string;
  prefix: string;
  protectedLevels: number[];
  craftingLevels: number[];
  materials: Array<Record<string, number>>;
};

const upgradeRarities: ItemRarity[] = ["Common", "Uncommon", "Rare"];

const districtTiers: DistrictCountermeasure[] = [
  { districtId: "neonRow", districtName: "Neon Row", prefix: "Neon Row Heat Veil", protectedLevels: [1, 10, 15], craftingLevels: [1, 10, 15], materials: [{ scrap: 25, circuitBoards: 6, encryptedData: 8 }, { circuitBoards: 10, encryptedData: 18, "street-coil": 2 }, { "neon-circuit-fragment": 6, "urban-reflex-chip": 2, encryptedData: 30 }] },
  { districtId: "rustYards", districtName: "Rust Yards", prefix: "Rust Yards Heat Veil", protectedLevels: [20, 30, 35], craftingLevels: [21, 30, 35], materials: [{ circuitBoards: 12, vehicleParts: 15, "drone-motor": 3 }, { encryptedData: 24, "drone-motor": 5, "rust-plated-frame": 2 }, { "chrome-jackal-gearset": 3, "drone-motor": 6, engineCore: 1, encryptedData: 30 }] },
  { districtId: "underpassMarket", districtName: "Underpass Market", prefix: "Underpass Market Heat Veil", protectedLevels: [40, 50, 55], craftingLevels: [41, 50, 55], materials: [{ "black-ledger-shard": 4, "contraband-chip": 2, encryptedData: 24 }, { "contraband-chip": 6, "smuggler-seal": 3, encryptedData: 32 }, { "illegal-mod-core": 4, "black-ledger-shard": 7, "smuggler-seal": 3 }] },
  { districtId: "blacknetQuarter", districtName: "Blacknet Quarter", prefix: "Blacknet Quarter Heat Veil", protectedLevels: [60, 70, 75], craftingLevels: [61, 70, 75], materials: [{ "trace-scrambler-chip": 4, "encrypted-memory-stack": 2, encryptedData: 36 }, { "encrypted-memory-stack": 6, "trace-scrambler-chip": 5, "rogue-packet-core": 2 }, { "daemon-fragment": 2, "rogue-packet-core": 8, "encrypted-memory-stack": 4 }] },
  { districtId: "helixWard", districtName: "Helix Ward", prefix: "Helix Ward Heat Veil", protectedLevels: [80, 90, 95], craftingLevels: [81, 90, 95], materials: [{ "helix-authorization": 1, "neural-dampener": 4, "stabilizer-compound": 4 }, { "medical-gel-matrix": 6, "bioware-thread": 3, encryptedData: 40 }, { "helix-authorization": 3, "bioware-thread": 8, "medical-gel-matrix": 5 }] },
  { districtId: "glasslineDistrict", districtName: "Glassline District", prefix: "Glassline District Heat Veil", protectedLevels: [100, 110, 115], craftingLevels: [101, 110, 115], materials: [{ "security-override-chip": 4, "executive-processor": 2, "glassline-alloy": 3 }, { "corporate-optic-lens": 6, "executive-processor": 2, encryptedData: 48 }, { "glassline-alloy": 8, "executive-processor": 4, "security-override-chip": 4 }] },
  { districtId: "redlineBlocks", districtName: "Redline Blocks", prefix: "Redline Blocks Heat Veil", protectedLevels: [120, 130, 135], craftingLevels: [121, 130, 135], materials: [{ "redline-trigger-kit": 5, "ballistic-core": 3, "reinforced-grip": 4 }, { "armor-breaker-plate": 5, "ballistic-core": 3, encryptedData: 54 }, { "combat-stim-pack": 10, "ballistic-core": 7, "armor-breaker-plate": 4 }] },
  { districtId: "skylineCore", districtName: "Skyline Core", prefix: "Skyline Core Heat Veil", protectedLevels: [140, 145, 150], craftingLevels: [141, 145, 150], materials: [{ "luxury-processor": 4, "skyline-authorization": 2 }, { "legendary-chrome-matrix": 2, "luxury-processor": 6, "skyline-authorization": 1 }, { "relic-circuit": 2, "apex-neural-core": 2, "skyline-authorization": 4, "legendary-chrome-matrix": 1 }] },
];

export const heatCountermeasureTiers: CountermeasureTier[] = districtTiers.flatMap((district) =>
  district.protectedLevels.map((protectedLevel, index) => ({
    districtId: district.districtId,
    districtName: district.districtName,
    itemId: `heat-countermeasure-${district.districtId}-${index + 1}`,
    name: index === 0 ? district.prefix : `${district.prefix} Mk ${index === 1 ? "II" : "III"}`,
    upgradeStage: index,
    protectedLevel,
    craftingLevel: district.craftingLevels[index],
    rarity: upgradeRarities[index],
    materials: district.materials[index],
  })),
);

export const heatCountermeasureItems: ItemDefinition[] = heatCountermeasureTiers.map((tier) => {
  const districtTier = heatCountermeasureTiers.filter((entry) => entry.districtId === tier.districtId);
  const tierIndex = districtTier.findIndex((entry) => entry.itemId === tier.itemId);
  return {
    id: tier.itemId,
    name: tier.name,
    description: `${tier.upgradeStage === 0 ? "Base" : tier.upgradeStage === 1 ? "First-upgrade" : "Second-upgrade"} district countermeasure. Prevents action and trace Heat from every ${tier.districtName} skill action requiring level ${tier.protectedLevel} or lower.`,
    type: "Quest",
    rarity: tier.rarity,
    tags: ["player-upgrade", "heat-countermeasure", "district-wide", tier.districtId, `countermeasure-tier-${tierIndex + 1}`],
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    sourceHint: `Craft in ${tier.districtName}. One-time permanent unlock.`,
    requiredSkill: "streetcraft",
    requiredLevel: tier.protectedLevel,
    tier: tier.upgradeStage + 1,
  };
});

export const heatCountermeasureRecipes: CraftingRecipe[] = heatCountermeasureTiers.map((tier) => {
  const districtTier = heatCountermeasureTiers.filter((entry) => entry.districtId === tier.districtId);
  const tierIndex = districtTier.findIndex((entry) => entry.itemId === tier.itemId);
  const previousItemId = tierIndex > 0 ? districtTier[tierIndex - 1].itemId : undefined;
  return {
    id: `recipe-${tier.itemId}`,
    name: tierIndex === 0 ? `Craft ${tier.name}` : `Upgrade to ${tier.name}`,
    category: "Player Upgrades",
    requiredSkill: "streetcraft",
    requiredLevel: tier.craftingLevel,
    requiredDistrict: tier.districtId,
    inputCosts: { ...tier.materials, ...(previousItemId ? { [previousItemId]: 1 } : {}) },
    outputItemId: tier.itemId,
    outputQuantity: 1,
    durationMs: 8000 + tierIndex * 4000,
    xpReward: 30 + tier.craftingLevel * 3,
    masteryXpReward: 15 + tier.craftingLevel,
    tags: ["crafting", "player-upgrade", "upgrades", "streetcraft", "heat-countermeasure"],
    unlockRequirements: [previousItemId ? `Previous countermeasure: ${previousItemId}` : `District: ${tier.districtId}`],
  };
});

export function actionHeatSuppressed(state: GameState, action: Pick<SkillAction, "districtReq" | "levelReq" | "heatChange" | "traceChance">) {
  if (!action.districtReq || ((action.heatChange ?? 0) <= 0 && !action.traceChance)) return false;
  return heatCountermeasureTiers.some((tier) =>
    tier.districtId === action.districtReq
    && tier.protectedLevel >= action.levelReq
    && (state.discoveredItems[tier.itemId] || (state.inventory[tier.itemId] ?? 0) > 0),
  );
}
