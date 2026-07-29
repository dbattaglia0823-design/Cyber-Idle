import type { ActiveModifiers, CyberwareSlot, DistrictId, ItemRarity } from "../types";

export interface CyberwareSpec {
  id: string;
  name: string;
  description: string;
  slot: CyberwareSlot;
  rarity: ItemRarity;
  tier: number;
  requiredLevel: number;
  districtId: DistrictId;
  modifiers: Partial<ActiveModifiers>;
  instabilityLoad: number;
  tags: string[];
  inputCosts: Record<string, number>;
}

type BuildStyle = "solo" | "scavenger" | "runner" | "gearhead" | "fixer" | "netrunner" | "techie" | "corporate" | "juggernaut" | "apex";

interface CyberwareSuite {
  id: string;
  name: string;
  description: string;
  style: BuildStyle;
  rarity: ItemRarity;
  tier: number;
  requiredLevel: number;
  districtId: DistrictId;
  instabilityLoad: number;
  materials: Record<string, number>;
}

const suites: CyberwareSuite[] = [
  suite("street-solo", "Street Solo", "Direct combat chrome assembled for aspiring fighters.", "solo", "Common", 1, 1, "neonRow", 1, { scrap: 5, cyberwareParts: 3 }),
  suite("alley-scavenger", "Alley Scavenger", "Practical salvage implants that make every run more productive.", "scavenger", "Common", 1, 3, "neonRow", 1, { scrap: 6, circuitBoards: 1, cyberwareParts: 3 }),
  suite("neon-runner", "Neon Runner", "Fast street chrome for jobs, travel, and rapid progression.", "runner", "Common", 1, 6, "neonRow", 2, { scrap: 7, circuitBoards: 2, cyberwareParts: 4 }),
  suite("jackal-gearlink", "Jackal Gearlink", "Rugged Rust Yard implants for machinery and sustained combat.", "gearhead", "Uncommon", 2, 10, "rustYards", 2, { scrap: 12, vehicleParts: 3, cyberwareParts: 6 }),
  suite("ghost-market", "Ghost Market", "Illegal chrome for profitable work that stays below the scanners.", "fixer", "Uncommon", 2, 15, "underpassMarket", 3, { scrap: 10, encryptedData: 5, cyberwareParts: 7 }),
  suite("null-choir", "Null Choir", "Blacknet-linked implants for aggressive data extraction.", "netrunner", "Rare", 3, 20, "blacknetQuarter", 3, { circuitBoards: 7, encryptedData: 12, cyberwareParts: 8, "blacknet-cipher": 1 }),
  suite("helix-synapse", "Helix Synapse", "Clinically stabilized chrome for engineers and resilient operators.", "techie", "Rare", 3, 25, "helixWard", 2, { circuitBoards: 6, cyberwareParts: 12, "medical-gel": 4 }),
  suite("glassline-executive", "Glassline Executive", "Premium corporate implants for precise and profitable operations.", "corporate", "Epic", 4, 30, "glasslineDistrict", 3, { circuitBoards: 10, encryptedData: 14, cyberwareParts: 14, "corporate-access-token": 1 }),
  suite("redline-warform", "Redline Warform", "Championship combat chrome that converts strain into dominance.", "juggernaut", "Epic", 4, 40, "redlineBlocks", 4, { scrap: 24, armorPlating: 4, cyberwareParts: 16, "bounty-token": 2 }),
  suite("skyline-apex", "Skyline Apex", "Singular adaptive chrome capable of supporting any elite build.", "apex", "Legendary", 5, 50, "skylineCore", 4, { circuitBoards: 16, encryptedData: 20, cyberwareParts: 20, "stabilized-chrome-frame": 1, "prototype-neural-core": 1, "boss-data-key": 1 }),
];

const slots: Array<{ id: CyberwareSlot; label: string; parts: number }> = [
  { id: "neural", label: "Neural Lattice", parts: 2 },
  { id: "optics", label: "Optic Array", parts: 1 },
  { id: "arms", label: "Arm Actuators", parts: 3 },
  { id: "legs", label: "Leg Actuators", parts: 3 },
  { id: "skin", label: "Dermal Mesh", parts: 2 },
  { id: "skeleton", label: "Skeletal Frame", parts: 4 },
  { id: "operatingSystem", label: "Operating System", parts: 2 },
  { id: "utility", label: "Utility Module", parts: 1 },
];

// Ten complete suites yield the requested 3/2/2/2/1 rarity distribution in
// every cyberware slot. Slot-specific effects prevent a suite from being eight
// copies of the same bonus and encourage mixed loadouts.
export const cyberwareSpecs: CyberwareSpec[] = suites.flatMap((cyberSuite) =>
  slots.map((slot) => ({
    id: `${cyberSuite.id}-${slot.id}`,
    name: `${cyberSuite.name} ${slot.label}`,
    description: `${cyberSuite.description} ${slotDescription(slot.id)}`,
    slot: slot.id,
    rarity: cyberSuite.rarity,
    tier: cyberSuite.tier,
    requiredLevel: cyberSuite.requiredLevel,
    districtId: cyberSuite.districtId,
    modifiers: suiteModifiers(cyberSuite.style, slot.id, cyberSuite.tier),
    instabilityLoad: cyberSuite.instabilityLoad,
    tags: ["cyberware", cyberSuite.style, cyberSuite.districtId],
    inputCosts: {
      ...cyberSuite.materials,
      cyberwareParts: (cyberSuite.materials.cyberwareParts ?? 0) + slot.parts,
    },
  })),
);

function suite(
  id: string,
  name: string,
  description: string,
  style: BuildStyle,
  rarity: ItemRarity,
  tier: number,
  requiredLevel: number,
  districtId: DistrictId,
  instabilityLoad: number,
  _materials: Record<string, number>,
): CyberwareSuite {
  return {
    id,
    name,
    description,
    style,
    rarity,
    tier,
    requiredLevel: progressionLevel(districtId, requiredLevel),
    districtId,
    instabilityLoad: Math.max(0, tier - 1),
    materials: cyberwareMaterials(districtId),
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

function cyberwareMaterials(districtId: DistrictId): Record<string, number> {
  const districtParts: Record<DistrictId, Record<string, number>> = {
    neonRow: { cyberwareParts: 2, "neon-circuit-fragment": 1 },
    rustYards: { "cyberware-frame": 1, "salvaged-servo": 1, "rust-plated-frame": 1 },
    underpassMarket: { "cyberware-frame": 1, "illegal-mod-core": 1, "contraband-chip": 1 },
    blacknetQuarter: { "neural-connector": 1, "rogue-packet-core": 1, "encrypted-memory-stack": 1 },
    helixWard: { "neural-connector": 1, "neural-dampener": 1, "medical-gel-matrix": 1 },
    glasslineDistrict: { "stabilized-chrome-frame": 1, "glassline-alloy": 1, "executive-processor": 1 },
    redlineBlocks: { "stabilized-chrome-frame": 1, "ballistic-core": 1, "combat-stim-pack": 1 },
    skylineCore: { "legendary-chrome-matrix": 1, "apex-neural-core": 1, "skyline-authorization": 1 },
  };
  return districtParts[districtId];
}

function suiteModifiers(style: BuildStyle, slot: CyberwareSlot, tier: number): Partial<ActiveModifiers> {
  const primary = 0.01 + tier * 0.01;
  const secondary = 0.005 + tier * 0.005;
  const bySlot: Record<CyberwareSlot, Partial<ActiveModifiers>> = {
    neural: {},
    optics: {},
    arms: {},
    legs: {},
    skin: {},
    skeleton: {},
    operatingSystem: {},
    utility: {},
  };

  if (style === "solo" || style === "juggernaut") {
    bySlot.neural = { combatXp: primary };
    bySlot.optics = { combatDamage: secondary, dropChance: secondary };
    bySlot.arms = { combatDamage: primary };
    bySlot.legs = { actionSpeed: secondary };
    bySlot.skin = { combatDefense: primary };
    bySlot.skeleton = { combatDefense: primary };
    bySlot.operatingSystem = { combatDamage: secondary, combatXp: secondary };
    bySlot.utility = { neuralInstabilityRecovery: secondary };
  } else if (style === "scavenger" || style === "gearhead") {
    bySlot.neural = { skillXp: { scavenging: primary } };
    bySlot.optics = { dropChance: primary };
    bySlot.arms = { skillRewards: primary };
    bySlot.legs = { actionSpeed: secondary };
    bySlot.skin = { combatDefense: secondary };
    bySlot.skeleton = { skillRewards: secondary };
    bySlot.operatingSystem = { skillXp: { cyberware: secondary, scavenging: secondary } };
    bySlot.utility = { creditsGained: primary };
  } else if (style === "runner") {
    bySlot.neural = { actionSpeed: primary };
    bySlot.optics = { jobSuccessChance: secondary };
    bySlot.arms = { skillRewards: secondary };
    bySlot.legs = { actionSpeed: primary };
    bySlot.skin = { heatDecay: secondary };
    bySlot.skeleton = { combatDefense: secondary };
    bySlot.operatingSystem = { skillXp: { combat: secondary, hacking: secondary } };
    bySlot.utility = { creditsGained: primary };
  } else if (style === "fixer") {
    bySlot.neural = { fixerTrustGain: primary };
    bySlot.optics = { jobSuccessChance: primary };
    bySlot.arms = { jobRewards: secondary };
    bySlot.legs = { actionSpeed: secondary };
    bySlot.skin = { heatGain: -secondary };
    bySlot.skeleton = { reputationGained: secondary };
    bySlot.operatingSystem = { jobRewards: primary };
    bySlot.utility = { creditsGained: primary };
  } else if (style === "netrunner") {
    bySlot.neural = { skillXp: { hacking: primary } };
    bySlot.optics = { skillRewards: primary };
    bySlot.arms = { actionSpeed: secondary };
    bySlot.legs = { actionSpeed: secondary };
    bySlot.skin = { heatGain: -secondary };
    bySlot.skeleton = { neuralInstabilityRecovery: secondary };
    bySlot.operatingSystem = { skillXp: { hacking: primary }, skillRewards: secondary };
    bySlot.utility = { dropChance: secondary, heatDecay: secondary };
  } else if (style === "techie") {
    bySlot.neural = { neuralInstabilityGain: -secondary };
    bySlot.optics = { skillRewards: secondary };
    bySlot.arms = { skillXp: { cyberware: primary } };
    bySlot.legs = { actionSpeed: secondary };
    bySlot.skin = { neuralInstabilityRecovery: primary };
    bySlot.skeleton = { combatDefense: primary };
    bySlot.operatingSystem = { skillXp: { cyberware: primary } };
    bySlot.utility = { neuralInstabilityGain: -secondary };
  } else if (style === "corporate") {
    bySlot.neural = { jobSuccessChance: primary };
    bySlot.optics = { creditsGained: primary };
    bySlot.arms = { combatDamage: secondary };
    bySlot.legs = { actionSpeed: secondary };
    bySlot.skin = { heatGain: -secondary };
    bySlot.skeleton = { combatDefense: secondary };
    bySlot.operatingSystem = { jobRewards: primary };
    bySlot.utility = { shopPrices: -secondary, reputationGained: secondary };
  } else {
    bySlot.neural = { actionSpeed: primary, neuralInstabilityGain: -secondary };
    bySlot.optics = { skillRewards: primary, dropChance: secondary };
    bySlot.arms = { combatDamage: primary };
    bySlot.legs = { actionSpeed: primary };
    bySlot.skin = { combatDefense: primary, heatGain: -secondary };
    bySlot.skeleton = { combatDefense: primary };
    bySlot.operatingSystem = { skillXp: { hacking: secondary, cyberware: secondary, combat: secondary, scavenging: secondary } };
    bySlot.utility = { jobRewards: primary, creditsGained: secondary };
  }
  return bySlot[slot];
}

function slotDescription(slot: CyberwareSlot) {
  const descriptions: Record<CyberwareSlot, string> = {
    neural: "It accelerates decision-making and skill integration.",
    optics: "It enhances target and resource recognition.",
    arms: "It improves physical execution and tool control.",
    legs: "It optimizes movement and action cadence.",
    skin: "It manages exposure, impact, and physiological strain.",
    skeleton: "It reinforces the operator under sustained workloads.",
    operatingSystem: "It coordinates the suite's specialized routines.",
    utility: "It provides economic and operational support functions.",
  };
  return descriptions[slot];
}
