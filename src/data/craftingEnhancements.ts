import type { CraftingRecipe, DistrictId, GameState, ItemDefinition, ItemRarity } from "../types";

type EnhancementTier = {
  districtId: DistrictId;
  districtName: string;
  requiredLevel: number;
  rarity: ItemRarity;
  materials: Record<string, number>;
};

export type CraftingEnhancementTier = EnhancementTier & {
  itemId: string;
  name: string;
  upgradeStage: number;
  bonus: number;
  kind: "speed" | "double";
};

const districtNames: Record<DistrictId, string> = {
  neonRow: "Neon Row",
  rustYards: "Rust Yards",
  underpassMarket: "Underpass Market",
  blacknetQuarter: "Blacknet Quarter",
  helixWard: "Helix Ward",
  glasslineDistrict: "Glassline District",
  redlineBlocks: "Redline Blocks",
  skylineCore: "Skyline Core",
};

const rarities: ItemRarity[] = ["Common", "Uncommon", "Rare", "Epic", "Epic", "Legendary", "Legendary", "Prototype"];
const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const speedTiers: EnhancementTier[] = [
  { districtId: "neonRow", districtName: districtNames.neonRow, requiredLevel: 5, rarity: rarities[0], materials: { scrap: 35, circuitBoards: 8, "street-coil": 2 } },
  { districtId: "rustYards", districtName: districtNames.rustYards, requiredLevel: 25, rarity: rarities[1], materials: { vehicleParts: 18, "drone-motor": 4, "rust-plated-frame": 2 } },
  { districtId: "underpassMarket", districtName: districtNames.underpassMarket, requiredLevel: 45, rarity: rarities[2], materials: { "contraband-chip": 5, "black-ledger-shard": 4, "smuggler-seal": 2 } },
  { districtId: "blacknetQuarter", districtName: districtNames.blacknetQuarter, requiredLevel: 65, rarity: rarities[3], materials: { encryptedData: 36, "trace-scrambler-chip": 5, "encrypted-memory-stack": 3 } },
  { districtId: "helixWard", districtName: districtNames.helixWard, requiredLevel: 85, rarity: rarities[4], materials: { "stabilizer-compound": 6, "neural-dampener": 5, "medical-gel-matrix": 3 } },
  { districtId: "glasslineDistrict", districtName: districtNames.glasslineDistrict, requiredLevel: 105, rarity: rarities[5], materials: { "glassline-alloy": 7, "corporate-optic-lens": 5, "executive-processor": 3 } },
  { districtId: "redlineBlocks", districtName: districtNames.redlineBlocks, requiredLevel: 125, rarity: rarities[6], materials: { "redline-trigger-kit": 7, "armor-breaker-plate": 5, "ballistic-core": 3 } },
  { districtId: "skylineCore", districtName: districtNames.skylineCore, requiredLevel: 145, rarity: rarities[7], materials: { "luxury-processor": 7, "legendary-chrome-matrix": 3, "relic-circuit": 2 } },
];

const doubleTiers: EnhancementTier[] = [
  { districtId: "neonRow", districtName: districtNames.neonRow, requiredLevel: 10, rarity: rarities[0], materials: { scrap: 45, encryptedData: 10, "lowgrade-optic-lens": 2 } },
  { districtId: "rustYards", districtName: districtNames.rustYards, requiredLevel: 30, rarity: rarities[1], materials: { circuitBoards: 15, "salvaged-servo": 6, "chrome-jackal-gearset": 2 } },
  { districtId: "underpassMarket", districtName: districtNames.underpassMarket, requiredLevel: 50, rarity: rarities[2], materials: { "contraband-chip": 7, "black-ledger-shard": 5, "illegal-mod-core": 2 } },
  { districtId: "blacknetQuarter", districtName: districtNames.blacknetQuarter, requiredLevel: 70, rarity: rarities[3], materials: { "trace-scrambler-chip": 7, "encrypted-memory-stack": 5, "rogue-packet-core": 2 } },
  { districtId: "helixWard", districtName: districtNames.helixWard, requiredLevel: 90, rarity: rarities[4], materials: { "medical-gel-matrix": 7, "bioware-thread": 5, "helix-authorization": 2 } },
  { districtId: "glasslineDistrict", districtName: districtNames.glasslineDistrict, requiredLevel: 110, rarity: rarities[5], materials: { "security-override-chip": 7, "corporate-optic-lens": 6, "executive-processor": 4 } },
  { districtId: "redlineBlocks", districtName: districtNames.redlineBlocks, requiredLevel: 130, rarity: rarities[6], materials: { "combat-stim-pack": 8, "armor-breaker-plate": 6, "ballistic-core": 4 } },
  { districtId: "skylineCore", districtName: districtNames.skylineCore, requiredLevel: 150, rarity: rarities[7], materials: { "luxury-processor": 8, "apex-neural-core": 3, "relic-circuit": 3 } },
];

function buildTiers(kind: CraftingEnhancementTier["kind"], baseName: string, tiers: EnhancementTier[], bonusStep: number): CraftingEnhancementTier[] {
  return tiers.map((tier, upgradeStage) => ({
    ...tier,
    itemId: `crafting-${kind}-${upgradeStage + 1}`,
    name: `${baseName} Mk ${romanNumerals[upgradeStage]}`,
    upgradeStage,
    bonus: bonusStep * (upgradeStage + 1),
    kind,
  }));
}

export const craftingSpeedTiers = buildTiers("speed", "Fabrication Accelerator", speedTiers, 0.03);
export const doubleCraftTiers = buildTiers("double", "Replication Matrix", doubleTiers, 0.02);
export const craftingEnhancementTiers = [...craftingSpeedTiers, ...doubleCraftTiers];

export const craftingEnhancementItems: ItemDefinition[] = craftingEnhancementTiers.map((tier) => ({
  id: tier.itemId,
  name: tier.name,
  description: tier.kind === "speed"
    ? `Permanent fabrication upgrade. Makes all crafting ${Math.round(tier.bonus * 100)}% faster.`
    : `Permanent replication upgrade. Grants a ${Math.round(tier.bonus * 100)}% chance to create a second crafted item without consuming additional materials. Player upgrades cannot be duplicated.`,
  type: "Quest",
  rarity: tier.rarity,
  tags: ["player-upgrade", "crafting-enhancement", tier.kind === "speed" ? "crafting-speed" : "double-craft", `crafting-enhancement-tier-${tier.upgradeStage + 1}`],
  stackable: false,
  maxStack: 1,
  sellValue: 0,
  sourceHint: `Craft in ${tier.districtName}. One-time permanent unlock.`,
  requiredSkill: "streetcraft",
  requiredLevel: tier.requiredLevel,
  tier: tier.upgradeStage + 1,
}));

export const craftingEnhancementRecipes: CraftingRecipe[] = craftingEnhancementTiers.map((tier) => {
  const family = tier.kind === "speed" ? craftingSpeedTiers : doubleCraftTiers;
  const previousItemId = tier.upgradeStage > 0 ? family[tier.upgradeStage - 1].itemId : undefined;
  return {
    id: `recipe-${tier.itemId}`,
    name: tier.upgradeStage === 0 ? `Craft ${tier.name}` : `Upgrade to ${tier.name}`,
    category: "Player Upgrades",
    requiredSkill: "streetcraft",
    requiredLevel: tier.requiredLevel,
    requiredDistrict: tier.districtId,
    inputCosts: { ...tier.materials, ...(previousItemId ? { [previousItemId]: 1 } : {}) },
    outputItemId: tier.itemId,
    outputQuantity: 1,
    durationMs: 12000 + tier.upgradeStage * 2500,
    xpReward: 45 + tier.requiredLevel * 3,
    masteryXpReward: 20 + tier.requiredLevel,
    tags: ["crafting", "player-upgrade", "upgrades", "streetcraft", "crafting-enhancement", tier.kind === "speed" ? "crafting-speed" : "double-craft"],
    unlockRequirements: [previousItemId ? `Previous upgrade: ${previousItemId}` : `District: ${tier.districtId}`],
  };
});

function activeTier(state: GameState, tiers: CraftingEnhancementTier[]) {
  return [...tiers]
    .reverse()
    .find((tier) => state.discoveredItems[tier.itemId] || (state.inventory[tier.itemId] ?? 0) > 0);
}

export function activeCraftingSpeedUpgrade(state: GameState) {
  return activeTier(state, craftingSpeedTiers);
}

export function activeDoubleCraftUpgrade(state: GameState) {
  return activeTier(state, doubleCraftTiers);
}
