import type { DistrictId, GearSlot, ItemRarity, ItemStats } from "../types";

export type ArmorClass = "Light" | "Medium" | "Heavy" | "Adaptive";

export interface ArmorSpec {
  id: string;
  name: string;
  description: string;
  slot: Exclude<GearSlot, "weapon" | "accessory1" | "accessory2">;
  armorClass: ArmorClass;
  rarity: ItemRarity;
  tier: number;
  requiredLevel: number;
  districtId: DistrictId;
  stats: ItemStats;
  inputCosts: Record<string, number>;
}

type ArmorSlot = ArmorSpec["slot"];

interface ArmorSetSpec {
  id: string;
  name: string;
  description: string;
  armorClass: ArmorClass;
  rarity: ItemRarity;
  tier: number;
  requiredLevel: number;
  districtId: DistrictId;
  materials: Record<string, number>;
}

const armorSets: ArmorSetSpec[] = [
  // Three starter sets keep light, balanced, and tank builds available immediately.
  set("neon-runner", "Neon Runner", "Flexible street gear built for relentless movement.", "Light", "Common", 1, 1, "neonRow", { scrap: 6, circuitBoards: 1 }),
  set("street-operator", "Street Operator", "Reliable protection for an adaptable street fighter.", "Medium", "Common", 1, 3, "neonRow", { scrap: 8, circuitBoards: 1 }),
  set("scrap-bulwark", "Scrap Bulwark", "Welded plates for runners who expect to be hit.", "Heavy", "Common", 1, 6, "neonRow", { scrap: 11, armorPlating: 1 }),

  // Each midgame district adds a complete set with a distinct build identity.
  set("jackal-plate", "Jackal Plate", "Vehicle-grade plating cut down by Rust Yard armorers.", "Heavy", "Uncommon", 2, 10, "rustYards", { scrap: 16, vehicleParts: 3, armorPlating: 2 }),
  set("ghostweave", "Ghostweave", "Contraband reactive cloth made for fast, quiet operators.", "Light", "Uncommon", 2, 15, "underpassMarket", { scrap: 14, circuitBoards: 4, encryptedData: 5 }),
  set("null-shroud", "Null Shroud", "Signal-dampening combat wear linked to predictive movement routines.", "Light", "Rare", 3, 20, "blacknetQuarter", { scrap: 22, circuitBoards: 7, encryptedData: 12, "blacknet-cipher": 1 }),
  set("helix-aegis", "Helix Aegis", "A bio-monitored suit balancing protection and trauma control.", "Medium", "Rare", 3, 25, "helixWard", { scrap: 24, cyberwareParts: 9, "medical-gel": 4 }),
  set("glassline-tactical", "Glassline Tactical", "Corporate combat tailoring with immaculate targeting integration.", "Medium", "Epic", 4, 30, "glasslineDistrict", { scrap: 34, circuitBoards: 12, encryptedData: 16, "corporate-access-token": 1 }),
  set("redline-juggernaut", "Redline Juggernaut", "Championship plate designed to advance through incoming fire.", "Heavy", "Epic", 4, 40, "redlineBlocks", { scrap: 42, cyberwareParts: 12, armorPlating: 5, "bounty-token": 2 }),
  set("skyline-apex", "Skyline Apex", "A unique adaptive armor system built from city-defining technology.", "Adaptive", "Legendary", 5, 50, "skylineCore", { scrap: 60, circuitBoards: 18, cyberwareParts: 18, armorPlating: 7, "prototype-neural-core": 1, "boss-data-key": 1 }),
];

const slots: Array<{ id: ArmorSlot; label: string; costScale: number }> = [
  { id: "head", label: "Visor", costScale: 0 },
  { id: "chest", label: "Jacket", costScale: 5 },
  { id: "hands", label: "Gloves", costScale: 1 },
  { id: "legs", label: "Leggings", costScale: 3 },
  { id: "boots", label: "Boots", costScale: 2 },
];

// Ten full five-piece sets produce the requested 3/2/2/2/1 rarity curve for
// every wearable slot, while set classes keep multiple builds viable.
export const armorSpecs: ArmorSpec[] = armorSets.flatMap((armorSet) =>
  slots.map((slot) => ({
    id: `${armorSet.id}-${slot.id}`,
    name: `${armorSet.name} ${slot.label}`,
    description: `${armorSet.description} ${slotDescription(slot.id)}`,
    slot: slot.id,
    armorClass: armorSet.armorClass,
    rarity: armorSet.rarity,
    tier: armorSet.tier,
    requiredLevel: armorSet.requiredLevel,
    districtId: armorSet.districtId,
    stats: armorStats(armorSet.armorClass, slot.id, armorSet.tier),
    inputCosts: addScrapCost(armorSet.materials, slot.costScale),
  })),
);

function set(
  id: string,
  name: string,
  description: string,
  armorClass: ArmorClass,
  rarity: ItemRarity,
  tier: number,
  requiredLevel: number,
  districtId: DistrictId,
  _materials: Record<string, number>,
): ArmorSetSpec {
  return {
    id,
    name,
    description,
    armorClass,
    rarity,
    tier,
    requiredLevel: progressionLevel(districtId, requiredLevel),
    districtId,
    materials: armorMaterials(districtId, armorClass),
  };
}

function progressionLevel(districtId: DistrictId, originalLevel: number) {
  if (districtId === "neonRow") return originalLevel <= 1 ? 1 : originalLevel <= 3 ? 10 : 18;
  const levels: Record<Exclude<DistrictId, "neonRow">, number> = {
    rustYards: 24,
    underpassMarket: 44,
    blacknetQuarter: 64,
    helixWard: 84,
    glasslineDistrict: 104,
    redlineBlocks: 124,
    skylineCore: 144,
  };
  return levels[districtId];
}

function armorMaterials(districtId: DistrictId, armorClass: ArmorClass): Record<string, number> {
  const frame: Record<string, number> =
    districtId === "neonRow"
      ? armorClass === "Medium" ? { circuitBoards: 1 } : { scrap: 1 }
      : armorClass === "Heavy" ? { armorPlating: 1 } : armorClass === "Light" ? { "grip-polymer": 1 } : { "circuit-bundle": 1 };
  const districtParts: Record<DistrictId, Record<string, number>> = {
    neonRow: { scrap: 2, "redline-wire": 1 },
    rustYards: { "rust-plated-frame": 1, "salvaged-servo": 1 },
    underpassMarket: { "smuggler-seal": 1, "contraband-chip": 1 },
    blacknetQuarter: { "trace-scrambler-chip": 1, "encrypted-memory-stack": 1 },
    helixWard: { "medical-gel-matrix": 1, "bioware-thread": 1 },
    glasslineDistrict: { "glassline-alloy": 1, "corporate-optic-lens": 1 },
    redlineBlocks: { "armor-breaker-plate": 1, "reinforced-grip": 1 },
    skylineCore: { "legendary-chrome-matrix": 1, "luxury-processor": 1, "skyline-authorization": 1 },
  };
  return { ...districtParts[districtId], ...frame };
}

function armorStats(armorClass: ArmorClass, slot: ArmorSlot, tier: number): ItemStats {
  const armorWeight = { head: 1, chest: 3, hands: 1, legs: 2, boots: 1 }[slot];
  const healthWeight = { head: 1, chest: 4, hands: 1, legs: 3, boots: 2 }[slot];
  const speedWeight = { head: 8, chest: 16, hands: 20, legs: 24, boots: 32 }[slot];
  const offenseWeight = { head: 1, chest: 1, hands: 2, legs: 0, boots: 0 }[slot];

  if (armorClass === "Light") {
    return compact({
      armor: Math.max(1, Math.round(armorWeight * tier * 0.65)),
      maxHp: Math.round(healthWeight * tier * 0.7),
      damage: offenseWeight * tier,
      attackSpeed: -speedWeight * tier,
      accuracy: slot === "head" || slot === "hands" ? tier * 2 : 0,
      dodge: (slot === "legs" || slot === "boots" ? 0.01 : 0.005) * tier,
    });
  }
  if (armorClass === "Heavy") {
    return compact({
      armor: Math.round(armorWeight * tier * 1.45),
      maxHp: Math.round(healthWeight * tier * 1.8),
      damage: slot === "hands" ? tier : 0,
      attackSpeed: speedWeight * tier * 0.45,
    });
  }
  if (armorClass === "Adaptive") {
    return compact({
      armor: armorWeight * tier,
      maxHp: healthWeight * tier,
      damage: offenseWeight * tier,
      attackSpeed: -Math.round(speedWeight * tier * 0.5),
      accuracy: slot === "head" || slot === "hands" ? tier * 2 : 0,
      dodge: (slot === "legs" || slot === "boots" ? 0.01 : 0.005) * tier,
      critChance: slot === "head" || slot === "hands" ? 0.01 * tier : 0,
    });
  }
  return compact({
    armor: armorWeight * tier,
    maxHp: healthWeight * tier,
    damage: offenseWeight * tier,
    attackSpeed: -Math.round(speedWeight * tier * 0.25),
    accuracy: slot === "head" || slot === "hands" ? tier : 0,
  });
}

function compact(stats: ItemStats): ItemStats {
  return Object.fromEntries(Object.entries(stats).filter(([, value]) => value !== 0));
}

function addScrapCost(materials: Record<string, number>, extraScrap: number) {
  return { ...materials, scrap: (materials.scrap ?? 0) + Math.ceil(extraScrap / 3) };
}

function slotDescription(slot: ArmorSlot) {
  const descriptions: Record<ArmorSlot, string> = {
    head: "The visor protects perception and targeting systems.",
    chest: "The reinforced core carries the set's primary protection.",
    hands: "The gloves stabilize weapon handling and close combat.",
    legs: "The articulated legs preserve mobility under pressure.",
    boots: "The grounded soles control movement across hostile terrain.",
  };
  return descriptions[slot];
}
