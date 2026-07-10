import type { CraftingRecipe } from "../types";

export const recipes: CraftingRecipe[] = [
  recipe("recipe-circuit-bundle", "Circuit Bundle", "Components", 1, { scrap: 4, circuitBoards: 1 }, "circuit-bundle", 1, 4500, 12),
  recipe("recipe-neural-connector", "Neural Connector", "Components", 2, { circuitBoards: 2, encryptedData: 2 }, "neural-connector", 1, 6500, 20),
  recipe("recipe-cyberware-frame", "Cyberware Frame", "Components", 3, { scrap: 6, cyberwareParts: 2 }, "cyberware-frame", 1, 7000, 24),
  recipe("recipe-basic-optic-scanner", "Basic Optic Scanner", "Cyberware", 2, { "circuit-bundle": 1, cyberwareParts: 2 }, "basic-optic-scanner", 1, 9000, 34),
  recipe("recipe-reflex-wiring", "Reflex Wiring", "Cyberware", 3, { "neural-connector": 1, cyberwareParts: 3 }, "reflex-wiring", 1, 10500, 42),
  recipe("recipe-entry-cyberdeck", "Entry Cyberdeck", "Cyberware", 4, { "neural-connector": 1, encryptedData: 5, circuitBoards: 2 }, "entry-cyberdeck", 1, 12000, 48),
  recipe("recipe-subdermal-mesh", "Subdermal Mesh", "Cyberware", 4, { "cyberware-frame": 1, scrap: 10, cyberwareParts: 3 }, "subdermal-mesh", 1, 11500, 46),
  recipe("recipe-rusted-pistol", "Rusted Pistol", "Weapons", 1, { scrap: 8, circuitBoards: 1 }, "rusted-pistol", 1, 7000, 22),
  recipe("recipe-street-knife", "Street Knife", "Weapons", 1, { scrap: 6 }, "street-knife", 1, 5200, 16),
  recipe("recipe-scrap-jacket", "Scrap Jacket", "Armor", 1, { scrap: 10 }, "scrap-jacket", 1, 6500, 18),
  recipe("recipe-reinforced-hoodie", "Reinforced Hoodie", "Armor", 2, { scrap: 8, "circuit-bundle": 1 }, "reinforced-hoodie", 1, 8200, 26),
  recipe("recipe-basic-med-injector", "Basic Med Injector", "Consumables", 1, { scrap: 2, cyberwareParts: 1 }, "basic-med-injector", 1, 4000, 10),
  recipe("recipe-neural-stabilizer", "Neural Stabilizer", "Consumables", 3, { encryptedData: 2, "neural-connector": 1 }, "neural-stabilizer", 1, 8000, 28),
  recipe("recipe-basic-sim-cache", "Basic Sim Cache", "Consumables", 4, { encryptedData: 3, circuitBoards: 1 }, "basic-sim-cache", 1, 10000, 32),
  recipe("recipe-precision-grip", "Precision Grip Actuators", "Cyberware", 5, { "cyberware-frame": 1, "neural-connector": 1, cyberwareParts: 6 }, "precision-grip-actuators", 1, 15000, 64, "bp-precision-grip"),
  recipe("recipe-stabilized-buffer", "Stabilized Neural Buffer", "Cyberware", 6, { "neural-connector": 2, encryptedData: 6, cyberwareParts: 4 }, "stabilized-neural-buffer", 1, 17000, 72, "bp-stabilized-buffer"),
];

function recipe(id: string, name: string, category: CraftingRecipe["category"], requiredLevel: number, inputCosts: Record<string, number>, outputItemId: string, outputQuantity: number, durationMs: number, xpReward: number, requiredBlueprint?: string): CraftingRecipe {
  return {
    id,
    name,
    category,
    requiredSkill: "cyberware",
    requiredLevel,
    requiredBlueprint,
    inputCosts,
    outputItemId,
    outputQuantity,
    durationMs,
    xpReward,
    masteryXpReward: Math.ceil(xpReward * 0.45),
    tags: ["crafting", category.toLowerCase()],
    unlockRequirements: requiredBlueprint ? [`Blueprint: ${requiredBlueprint}`] : ["Unlocked by default"],
  };
}
