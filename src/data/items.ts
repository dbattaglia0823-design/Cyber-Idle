import type { CyberwareSlot, GearSlot, ItemDefinition } from "../types";

export const cyberwareSlots: Array<{ id: CyberwareSlot; label: string }> = [
  { id: "neural", label: "Neural" },
  { id: "optics", label: "Optics" },
  { id: "arms", label: "Arms" },
  { id: "legs", label: "Legs" },
  { id: "skin", label: "Skin" },
  { id: "skeleton", label: "Skeleton" },
  { id: "operatingSystem", label: "Operating System" },
  { id: "utility", label: "Utility" },
];

export const gearSlots: Array<{ id: GearSlot; label: string }> = [
  { id: "weapon", label: "Weapon" },
  { id: "head", label: "Head" },
  { id: "chest", label: "Chest" },
  { id: "hands", label: "Hands" },
  { id: "legs", label: "Legs" },
  { id: "boots", label: "Boots" },
  { id: "accessory1", label: "Accessory 1" },
  { id: "accessory2", label: "Accessory 2" },
];

export const items: ItemDefinition[] = [
  resource("scrap", "Scrap", "Recovered metal, wire, and useful trash.", "Material", 1),
  resource("circuitBoards", "Circuit Boards", "Reusable boards stripped from dead electronics.", "Material", 8),
  resource("encryptedData", "Encrypted Data", "Locked packets pulled from exposed systems.", "Material", 12),
  resource("cyberwareParts", "Cyberware Parts", "Servos, connectors, housings, and implant scraps.", "Material", 16),
  resource("vehicleParts", "Vehicle Parts", "Chassis bolts, actuators, mounts, and salvageable vehicle systems.", "Material", 18),
  resource("engineCore", "Engine Core", "A compact engine core used in vehicle builds.", "Material", 90),
  resource("armorPlating", "Armor Plating", "Heavy plating for vehicles and courier armor.", "Material", 45),
  resource("fuelCell", "Fuel Cell", "A volatile but efficient power cell.", "Material", 40),
  resource("navigationChip", "Navigation Chip", "A route chip for hostile districts.", "Material", 55),
  resource("smugglerCompartment", "Smuggler Compartment", "A hidden vehicle storage system.", "Material", 110),
  resource("prototypeDriveUnit", "Prototype Drive Unit", "A rare late-game vehicle drive core.", "Material", 350),
  component("circuit-bundle", "Circuit Bundle", "Bundled boards ready for clean assembly.", 22),
  component("neural-connector", "Neural Connector", "A shielded bridge for implant signal routing.", 35),
  component("cyberware-frame", "Cyberware Frame", "A basic frame for street-grade cyberware.", 42),
  consumable("basic-med-injector", "Basic Med Injector", "A cheap emergency injector. Manual use for now.", 20, "heal"),
  consumable("neural-stabilizer", "Neural Stabilizer", "Reduces current Neural Instability by 8.", 45, "reduceNeuralInstability"),
  consumable("basic-sim-cache", "Basic Sim Cache", "Stores 5 minutes of simulated work for discovered skill actions or crafting.", 80, undefined),
  consumable("combat-sim-cache", "Combat Sim Cache", "Future cache type for already-cleared combat farming.", 100, undefined),
  consumable("blacknet-sim-cache", "Blacknet Sim Cache", "Future cache type for discovered hacking loops.", 100, undefined),
  consumable("fixer-sim-cache", "Fixer Sim Cache", "Future cache type for repeatable safe fixer jobs.", 100, undefined),
  component("prototype-neural-core", "Prototype Neural Core", "High-tier bottleneck for unstable implant projects.", 350),
  component("blacknet-cipher", "Blacknet Cipher", "A rare encrypted key for advanced Blacknet recipes.", 320),
  component("stabilized-chrome-frame", "Stabilized Chrome Frame", "A hardened frame for prototype chrome.", 300),
  component("boss-data-key", "Boss Data Key", "Future boss and dungeon unlock bottleneck.", 400),
  component("faction-authorization", "Faction Authorization", "A permit token for faction-gated unlocks.", 250),
  component("district-permit", "District Permit", "A district access bottleneck for later progression.", 250),
  component("rare-blueprint-fragment", "Rare Blueprint Fragment", "Fragments used to reconstruct rare blueprints.", 180),
  component("neural-stabilizer-compound", "Neural Stabilizer Compound", "A compound needed for better stabilizers.", 160),
  component("rust-access-key", "Rust Access Key", "Entry key for Junkyard Lockdown.", 80),
  component("market-pass", "Market Pass", "Contraband route pass for Underpass Market operations.", 100),
  component("glassline-access-token", "Glassline Access Token", "Corporate access token for extraction operations.", 180),
  component("medical-access-pass", "Medical Access Pass", "Clinic clearance for Helix Ward services.", 160),
  component("bounty-token", "Bounty Token", "Proof marker for Redline bounty boards.", 140),
  component("corporate-access-token", "Corporate Access Token", "Temporary corporate credential for Glassline work.", 220),
  component("hacking-script", "Hacking Script", "Single-use exploit package for future Blacknet automations.", 95),
  component("data-job-pass", "Data Job Pass", "Broker-signed packet that opens higher-risk data contracts.", 130),
  component("medical-gel", "Medical Gel", "Sterile gel used by clinics and emergency patch kits.", 65),
  consumable("advanced-stabilizer", "Advanced Neural Stabilizer", "Reduces current Neural Instability by a larger amount in later systems.", 120, "reduceNeuralInstability"),
  consumable("job-success-booster", "Contract Assurance Chip", "A corporate consumable placeholder for safer high-pay jobs.", 180, undefined),
  consumable("illegal-overclock", "Illegal Overclock", "A dangerous black-market boost placeholder.", 140, undefined),
  blueprint("bp-starter-weapon", "Starter Weapon Blueprint", "Unlocks future starter weapon upgrades.", "Rare Backstreet Sweep reward."),
  blueprint("bp-scavenger-rig", "Scavenger Rig Blueprint", "Unlocks future scavenging gear.", "Junkyard Lockdown reward."),
  blueprint("bp-blacknet-tool", "Blacknet Tool Blueprint", "Unlocks future hacking tools.", "Ghost Signal Dive reward."),
  blueprint("bp-corporate-cyberware", "Corporate Cyberware Blueprint", "Unlocks future corporate implants.", "Corporate Extraction reward."),
  blueprint("bp-precision-grip", "Precision Grip Blueprint", "Unlocks Precision Grip Actuators.", "Rare drop from Scrap Drone."),
  blueprint("bp-stabilized-buffer", "Stabilized Buffer Blueprint", "Unlocks Stabilized Neural Buffer.", "Rare hacking or Helix job reward."),
  cyberware("basic-optic-scanner", "Basic Optic Scanner", "Highlights useful salvage and weak seams.", "optics", 1, 1, { skillRewards: 0.03 }, 1, ["scavenging"]),
  cyberware("reflex-wiring", "Reflex Wiring", "Shortens the gap between seeing and moving.", "neural", 1, 2, { actionSpeed: 0.02, combatDamage: 0.03 }, 2, ["combat"]),
  cyberware("subdermal-mesh", "Subdermal Mesh", "Thin armored mesh under the skin.", "skin", 1, 2, { combatDefense: 0.05 }, 2, ["combat"]),
  cyberware("entry-cyberdeck", "Entry Cyberdeck", "A starter deck wired directly into your OS port.", "operatingSystem", 1, 3, { skillXp: { hacking: 0.05 } }, 3, ["hacking"]),
  cyberware("synthetic-tendons", "Synthetic Tendons", "Cheap but effective mobility boosters.", "legs", 1, 4, { actionSpeed: 0.03 }, 2, ["speed"]),
  cyberware("precision-grip-actuators", "Precision Grip Actuators", "Armature grip motors for delicate implant work.", "arms", 2, 5, { skillXp: { cyberware: 0.05 } }, 2, ["cyberware"]),
  cyberware("stabilized-neural-buffer", "Stabilized Neural Buffer", "A conservative implant that dampens instability spikes.", "neural", 2, 6, { neuralInstabilityGain: -0.05 }, 1, ["medical"]),
  weapon("rusted-pistol", "Rusted Pistol", "Ugly, loud, and still better than harsh words.", 1, { damage: 5, accuracy: 2 }),
  weapon("street-knife", "Street Knife", "A fast blade for close work.", 1, { damage: 3, attackSpeed: -80, critChance: 0.03 }),
  armor("scrap-jacket", "Scrap Jacket", "Patchwork armor made from flexible plates.", "chest", 1, { armor: 3, maxHp: 8 }),
  armor("reinforced-hoodie", "Reinforced Hoodie", "Looks casual. Stops cheap blades.", "chest", 1, { armor: 2, dodge: 0.02 }),
  armor("cracked-visor", "Cracked Visor", "A damaged visor with a working threat tint.", "head", 1, { armor: 1, accuracy: 2 }),
  armor("grip-gloves", "Grip Gloves", "Textured gloves with conductive knuckles.", "hands", 1, { damage: 1, accuracy: 1 }),
  armor("runner-boots", "Runner Boots", "Soft boots built for wet concrete.", "boots", 1, { dodge: 0.03, armor: 1 }),
  armor("patched-jacket", "Patched Jacket", "A trophy jacket with a few useful plates left.", "chest", 1, { armor: 1, maxHp: 4 }),
  weapon("servo-knuckles", "Servo Knuckles", "Boosted knuckles stripped from a street bruiser.", 1, { damage: 4, critChance: 0.02 }),
  component("drone-eye", "Drone Eye", "A cracked optical unit useful for scanner work.", 30),
];

export const itemNames = Object.fromEntries(items.map((item) => [item.id, item.name]));

export function getItem(id: string) {
  return items.find((item) => item.id === id);
}

function resource(id: string, name: string, description: string, type: "Resource" | "Material", sellValue: number): ItemDefinition {
  return { id, name, description, type, rarity: "Common", tags: [type.toLowerCase()], stackable: true, maxStack: 999999, sellValue, sourceHint: "Core resource.", discovered: true } as ItemDefinition & { discovered: boolean };
}

function component(id: string, name: string, description: string, sellValue: number): ItemDefinition {
  return { id, name, description, type: "Component", rarity: "Uncommon", tags: ["component", "crafting"], stackable: true, maxStack: 9999, sellValue, sourceHint: "Crafted from components." };
}

function consumable(id: string, name: string, description: string, sellValue: number, useEffect: ItemDefinition["useEffect"]): ItemDefinition {
  return { id, name, description, type: "Consumable", rarity: "Common", tags: ["consumable"], stackable: true, maxStack: 99, sellValue, sourceHint: "Crafted or bought.", useEffect };
}

function blueprint(id: string, name: string, description: string, sourceHint: string): ItemDefinition {
  return { id, name, description, type: "Blueprint", rarity: "Rare", tags: ["blueprint"], stackable: false, sellValue: 150, sourceHint };
}

function cyberware(id: string, name: string, description: string, slot: CyberwareSlot, tier: number, requiredLevel: number, modifiers: ItemDefinition["modifiers"], instabilityLoad: number, tags: string[]): ItemDefinition {
  return { id, name, description, type: "Cyberware", rarity: tier >= 2 ? "Rare" : "Uncommon", tags: ["cyberware", ...tags], stackable: false, sellValue: 120 * tier, sourceHint: "Crafted from cyberware recipes.", slot, tier, requiredSkill: "cyberware", requiredLevel, modifiers, instabilityLoad, maxUpgradeLevel: 10 };
}

function weapon(id: string, name: string, description: string, tier: number, stats: ItemDefinition["stats"]): ItemDefinition {
  return { id, name, description, type: "Weapon", rarity: "Common", tags: ["weapon", "combat"], stackable: false, sellValue: 65 * tier, sourceHint: "Crafted or dropped in Neon Row.", slot: "weapon", tier, requiredSkill: "combat", requiredLevel: 1, stats, maxUpgradeLevel: 10 };
}

function armor(id: string, name: string, description: string, slot: GearSlot, tier: number, stats: ItemDefinition["stats"]): ItemDefinition {
  return { id, name, description, type: "Armor", rarity: "Common", tags: ["armor", "combat"], stackable: false, sellValue: 55 * tier, sourceHint: "Crafted or dropped in Neon Row.", slot, tier, requiredSkill: "combat", requiredLevel: 1, stats, maxUpgradeLevel: 10 };
}
