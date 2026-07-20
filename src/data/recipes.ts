import type { CraftingRecipe } from "../types";

export const recipes: CraftingRecipe[] = [
  recipe("recipe-circuit-bundle", "Circuit Bundle", "Components", 1, { scrap: 4, circuitBoards: 1 }, "circuit-bundle", 1, 4500, 12),
  recipe("recipe-neural-connector", "Neural Connector", "Components", 2, { circuitBoards: 2, encryptedData: 2 }, "neural-connector", 1, 6500, 20),
  recipe("recipe-cyberware-frame", "Cyberware Frame", "Components", 3, { scrap: 6, cyberwareParts: 2 }, "cyberware-frame", 1, 7000, 24),
  recipe("recipe-weapon-frame", "Weapon Frame", "Upgrade Parts", 1, { scrap: 8, circuitBoards: 1 }, "weapon-frame", 1, 5200, 14),
  recipe("recipe-precision-parts", "Precision Parts", "Upgrade Parts", 2, { scrap: 6, circuitBoards: 2 }, "precision-parts", 1, 6500, 20),
  recipe("recipe-grip-polymer", "Grip Polymer", "Upgrade Parts", 2, { scrap: 5, cyberwareParts: 1 }, "grip-polymer", 1, 6200, 18),
  recipe("recipe-optic-lens", "Optic Lens", "Upgrade Parts", 3, { circuitBoards: 2, scrap: 4 }, "optic-lens", 1, 7000, 22),
  recipe("recipe-barrel-assembly", "Barrel Assembly", "Upgrade Parts", 3, { scrap: 10, "precision-parts": 1 }, "barrel-assembly", 1, 8000, 26),
  recipe("recipe-suppressor-baffles", "Suppressor Baffles", "Upgrade Parts", 4, { scrap: 8, "precision-parts": 1 }, "suppressor-baffles", 1, 9000, 30),
  recipe("recipe-mod-core", "Mod Core", "Weapon Mods", 5, { circuitBoards: 3, encryptedData: 2, "precision-parts": 1 }, "mod-core", 1, 10500, 36),
  recipe("recipe-basic-optic-scanner", "Basic Optic Scanner", "Cyberware", 2, { "circuit-bundle": 1, cyberwareParts: 2 }, "basic-optic-scanner", 1, 9000, 34),
  recipe("recipe-reflex-wiring", "Reflex Wiring", "Cyberware", 3, { "neural-connector": 1, cyberwareParts: 3 }, "reflex-wiring", 1, 10500, 42),
  recipe("recipe-entry-cyberdeck", "Entry Cyberdeck", "Cyberware", 4, { "neural-connector": 1, encryptedData: 5, circuitBoards: 2 }, "entry-cyberdeck", 1, 12000, 48),
  recipe("recipe-subdermal-mesh", "Subdermal Mesh", "Cyberware", 4, { "cyberware-frame": 1, scrap: 10, cyberwareParts: 3 }, "subdermal-mesh", 1, 11500, 46),
  recipe("recipe-rusted-pistol", "Rusted Pistol", "Weapons", 1, { scrap: 8, circuitBoards: 1 }, "rusted-pistol", 1, 7000, 22),
  recipe("recipe-street-knife", "Street Knife", "Weapons", 1, { scrap: 6 }, "street-knife", 1, 5200, 16),
  recipe("recipe-scrap-baton", "Scrap Baton", "Weapons", 2, { scrap: 8, "grip-polymer": 1 }, "scrap-baton", 1, 6500, 20),
  recipe("recipe-junk-smg", "Junk SMG", "Weapons", 3, { "weapon-frame": 1, "barrel-assembly": 1, circuitBoards: 2 }, "junk-smg", 1, 12000, 42),
  recipe("recipe-street-rifle", "Street Rifle", "Weapons", 5, { "weapon-frame": 1, "barrel-assembly": 1, "precision-parts": 2 }, "street-rifle", 1, 16000, 58),
  recipe("recipe-crude-suppressor", "Crude Suppressor", "Attachments", 2, { "suppressor-baffles": 1, scrap: 4 }, "crude-suppressor", 1, 8000, 24),
  recipe("recipe-reflex-sight", "Reflex Sight", "Attachments", 2, { "optic-lens": 1, circuitBoards: 1 }, "reflex-sight", 1, 7600, 24),
  recipe("recipe-stability-grip", "Stability Grip", "Attachments", 1, { "grip-polymer": 1, scrap: 3 }, "stability-grip", 1, 6000, 18),
  recipe("recipe-armor-piercer", "Armor Piercer", "Weapon Mods", 5, { "mod-core": 1, "precision-parts": 2 }, "armor-piercer", 1, 13000, 46),
  recipe("recipe-quiet-routine", "Quiet Routine", "Weapon Mods", 6, { "mod-core": 1, encryptedData: 4, "suppressor-baffles": 1 }, "quiet-routine", 1, 14500, 52),
  recipe("recipe-scrap-jacket", "Scrap Jacket", "Armor", 1, { scrap: 10 }, "scrap-jacket", 1, 6500, 18),
  recipe("recipe-reinforced-hoodie", "Reinforced Hoodie", "Armor", 2, { scrap: 8, "circuit-bundle": 1 }, "reinforced-hoodie", 1, 8200, 26),
  recipe("recipe-basic-med-injector", "Basic Med Injector", "Consumables", 1, { scrap: 2, cyberwareParts: 1 }, "basic-med-injector", 1, 4000, 10),
  recipe("recipe-trauma-patch", "Trauma Patch", "Consumables", 2, { scrap: 2, "medical-gel": 1 }, "trauma-patch", 1, 5200, 16),
  recipe("recipe-combat-stim", "Combat Stim", "Consumables", 4, { encryptedData: 1, "medical-gel": 1, cyberwareParts: 1 }, "combat-stim", 1, 7200, 26),
  recipe("recipe-neural-stabilizer", "Neural Stabilizer", "Consumables", 3, { encryptedData: 2, "neural-connector": 1 }, "neural-stabilizer", 1, 8000, 28),
  recipe("recipe-advanced-med-injector", "Advanced Med Injector", "Consumables", 8, { "medical-gel": 2, "neural-connector": 1, cyberwareParts: 2 }, "advanced-med-injector", 1, 12000, 44),
  recipe("recipe-emergency-reboot-kit", "Emergency Reboot Kit", "Consumables", 16, { "medical-gel": 4, "prototype-neural-core": 1, "neural-connector": 2 }, "emergency-reboot-kit", 1, 24000, 95),
  recipe("recipe-basic-sim-cache", "Basic Sim Cache", "Consumables", 4, { encryptedData: 3, circuitBoards: 1 }, "basic-sim-cache", 1, 10000, 32),
  recipe("recipe-precision-grip", "Precision Grip Actuators", "Cyberware", 5, { "cyberware-frame": 1, "neural-connector": 1, cyberwareParts: 6 }, "precision-grip-actuators", 1, 15000, 64, "bp-precision-grip"),
  recipe("recipe-stabilized-buffer", "Stabilized Neural Buffer", "Cyberware", 6, { "neural-connector": 2, encryptedData: 6, cyberwareParts: 4 }, "stabilized-neural-buffer", 1, 17000, 72, "bp-stabilized-buffer"),
  recipe("recipe-dampener-weave", "Dampener Weave", "Cyberware", 8, { "cyberware-frame": 1, "neural-dampener": 1, cyberwareParts: 5 }, "dampener-weave", 1, 18000, 78, "neural-dampener-blueprint"),
  recipe("recipe-helix-governor-os", "Helix Governor OS", "Cyberware", 14, { "neural-connector": 2, "stabilizer-compound": 3, encryptedData: 8 }, "helix-governor-os", 1, 26000, 110, "neural-dampener-blueprint"),
  ...expandedEquipmentRecipes(),
  ...expandedHighTierWeaponRecipes(),
].sort(sortRecipes);

function sortRecipes(a: CraftingRecipe, b: CraftingRecipe) {
  return a.requiredLevel - b.requiredLevel || a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
}

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

function expandedEquipmentRecipes(): CraftingRecipe[] {
  return [
    recipe("recipe-street-visor", "Street Visor", "Armor", 1, { scrap: 4, "lowgrade-optic-lens": 1 }, "street-visor", 1, 5200, 16),
    recipe("recipe-padded-street-vest", "Padded Street Vest", "Armor", 1, { scrap: 8 }, "padded-street-vest", 1, 5600, 18),
    recipe("recipe-street-runner-pants", "Street Runner Pants", "Armor", 1, { scrap: 5, "grip-polymer": 1 }, "street-runner-pants", 1, 5400, 17),
    recipe("recipe-reinforced-treads", "Reinforced Treads", "Armor", 4, { scrap: 10, "rust-plated-frame": 1 }, "reinforced-treads", 1, 9200, 32),
    recipe("recipe-patchwork-combat-helm", "Patchwork Combat Helm", "Armor", 5, { scrap: 12, "armorPlating": 1, "circuit-bundle": 1 }, "patchwork-combat-helm", 1, 9800, 34),
    recipe("recipe-subdermal-plate-carrier", "Subdermal Plate Carrier", "Armor", 16, { "armorPlating": 3, "rust-plated-frame": 1, "cyberware-frame": 1 }, "subdermal-plate-carrier", 1, 20000, 82, "bp-corporate-cyberware"),
    recipe("recipe-servo-lined-gloves", "Servo-Lined Gloves", "Armor", 15, { "salvaged-servo": 2, "grip-polymer": 3, "precision-parts": 1 }, "servo-lined-gloves", 1, 18000, 72),
    recipe("recipe-silent-step-boots", "Silent Step Boots", "Armor", 16, { "smuggler-seal": 1, "grip-polymer": 4, "suppressor-baffles": 2 }, "silent-step-boots", 1, 19000, 76),
    recipe("recipe-chromeweave-armor", "Chromeweave Armor", "Armor", 30, { "glassline-alloy": 3, "bioware-thread": 2, "armorPlating": 5 }, "chromeweave-armor", 1, 36000, 150, "bp-corporate-cyberware"),
    recipe("recipe-adaptive-combat-plating", "Adaptive Combat Plating", "Armor", 68, { "legendary-chrome-matrix": 2, "apex-neural-core": 1, "armor-breaker-plate": 4, "boss-data-key": 1 }, "adaptive-combat-plating", 1, 76000, 320, "bp-prototype-implant"),

    recipe("recipe-compact-holdout", "Compact Holdout", "Weapons", 1, { scrap: 5, "weapon-frame": 1 }, "compact-holdout", 1, 6200, 19),
    recipe("recipe-sprayline-smg", "Sprayline SMG", "Weapons", 2, { "weapon-frame": 1, "barrel-assembly": 1, "redline-wire": 1 }, "sprayline-smg", 1, 9200, 32),
    recipe("recipe-redline-burst-pistol", "Redline Burst Pistol", "Weapons", 8, { "weapon-frame": 1, "redline-trigger-kit": 1, "precision-parts": 2 }, "redline-burst-pistol", 1, 15000, 58),
    recipe("recipe-swarmtag-carbine", "Swarmtag Carbine", "Weapons", 20, { "weapon-frame": 1, "smartlink-chip": 2, "drone-motor": 2, "barrel-assembly": 1 }, "swarmtag-carbine", 1, 24000, 98, "bp-blacknet-tool"),
    recipe("recipe-coil-lance", "Coil Lance", "Weapons", 24, { "weapon-frame": 1, "barrel-assembly": 2, "security-override-chip": 1, "glassline-alloy": 2 }, "coil-lance", 1, 28000, 110, "bp-corporate-cyberware"),
    recipe("recipe-yard-lmg", "Yard LMG", "Weapons", 28, { "weapon-frame": 2, "barrel-assembly": 3, "chrome-jackal-gearset": 1, "armorPlating": 3 }, "yard-lmg", 1, 32000, 126, "bp-scavenger-rig"),
    recipe("recipe-glassline-sniper", "Glassline Sniper", "Weapons", 38, { "barrel-assembly": 3, "optic-lens": 2, "executive-processor": 1, "precision-parts": 4 }, "glassline-sniper", 1, 42000, 170, "bp-corporate-cyberware"),
    recipe("recipe-phase-katana", "Phase Katana", "Weapons", 72, { "prototype-weapon-core": 2, "illegal-mod-core": 2, "relic-circuit": 1, "daemon-fragment": 2 }, "phase-katana", 1, 85000, 360, "bp-prototype-implant"),

    recipe("recipe-basic-reflex-chip", "Basic Reflex Chip", "Cyberware", 1, { "neural-connector": 1, "street-coil": 1 }, "basic-reflex-chip", 1, 7200, 24),
    recipe("recipe-basic-med-port", "Basic Med Port", "Cyberware", 1, { "cyberware-frame": 1, "medical-gel": 1 }, "basic-med-port", 1, 7600, 26),
    recipe("recipe-salvage-filter", "Salvage Filter", "Cyberware", 7, { "cyberware-frame": 1, "neon-circuit-fragment": 2, "drone-recovery-kit": 1 }, "salvage-filter", 1, 15000, 62),
    recipe("recipe-trace-buffer-os", "Trace Buffer OS", "Cyberware", 12, { "neural-connector": 1, "trace-scrambler-chip": 1, encryptedData: 8 }, "trace-buffer-os", 1, 19000, 80, "bp-blacknet-tool"),
    recipe("recipe-weakpoint-analyzer", "Weakpoint Analyzer", "Cyberware", 18, { "optic-lens": 2, "drone-eye": 1, "smartlink-chip": 1 }, "weakpoint-analyzer", 1, 23000, 94, "bp-precision-grip"),
    recipe("recipe-ghoststep-joint-kit", "Ghoststep Joint Kit", "Cyberware", 24, { "salvaged-servo": 2, "smuggler-seal": 1, "trace-scrambler-chip": 1 }, "ghoststep-joint-kit", 1, 27000, 112),
    recipe("recipe-adaptive-skin-plating", "Adaptive Skin Plating", "Cyberware", 44, { "stabilized-chrome-frame": 1, "glassline-alloy": 3, "neural-dampener": 2 }, "adaptive-skin-plating", 1, 46000, 190, "bp-corporate-cyberware"),
    recipe("recipe-ghostline-command-os", "Ghostline Command OS", "Cyberware", 68, { "prototype-neural-core": 1, "daemon-fragment": 3, "encrypted-memory-stack": 4, "blacknet-cipher": 2 }, "ghostline-command-os", 1, 72000, 310, "bp-blacknet-tool"),
    recipe("recipe-adaptive-utility-core", "Adaptive Utility Core", "Cyberware", 86, { "prototype-neural-core": 2, "legendary-chrome-matrix": 1, "relic-circuit": 1, "luxury-processor": 2 }, "adaptive-utility-core", 1, 92000, 420, "bp-prototype-implant"),
  ];
}

function expandedHighTierWeaponRecipes(): CraftingRecipe[] {
  return [
    recipe("recipe-redline-viper", "Redline Viper", "Weapons", 34, { "weapon-frame": 1, "redline-trigger-kit": 2, "precision-parts": 4, "ballistic-core": 1 }, "redline-viper", 1, 32000, 135),
    recipe("recipe-glassline-judge", "Glassline Judge", "Weapons", 58, { "weapon-frame": 1, "executive-processor": 2, "corporate-access-token": 1, "precision-parts": 6, "rare-blueprint-fragment": 4 }, "glassline-judge", 1, 62000, 260, "bp-corporate-cyberware"),
    recipe("recipe-pulse-repeater", "Pulse Repeater", "Weapons", 76, { "prototype-weapon-core": 2, "relic-circuit": 1, "blacknet-cipher": 2, "barrel-assembly": 4 }, "pulse-repeater", 1, 82000, 360, "bp-prototype-implant"),
    recipe("recipe-neon-splitter", "Neon Splitter", "Weapons", 30, { "weapon-frame": 1, "redline-wire": 3, "street-coil": 2, "barrel-assembly": 2 }, "neon-splitter", 1, 30000, 126),
    recipe("recipe-vector-bloom", "Vector Bloom", "Weapons", 78, { "prototype-weapon-core": 2, "smartlink-chip": 4, "mod-core": 3, "daemon-fragment": 2 }, "vector-bloom", 1, 85000, 370, "bp-prototype-implant"),
    recipe("recipe-chrome-jackal-ar", "Chrome Jackal AR", "Weapons", 32, { "weapon-frame": 1, "chrome-jackal-gearset": 2, "rust-plated-frame": 2, "barrel-assembly": 2 }, "chrome-jackal-ar", 1, 34000, 142, "bp-scavenger-rig"),
    recipe("recipe-overwatch-helix", "Overwatch Helix", "Weapons", 82, { "prototype-weapon-core": 2, "helix-authorization": 2, "medical-gel-matrix": 4, "boss-data-key": 1 }, "overwatch-helix", 1, 88000, 390, "bp-prototype-implant"),
    recipe("recipe-scrapstorm-lmg", "Scrapstorm LMG", "Weapons", 36, { "weapon-frame": 2, engineCore: 1, "rust-plated-frame": 3, "armorPlating": 5 }, "scrapstorm-lmg", 1, 39000, 156, "bp-scavenger-rig"),
    recipe("recipe-apex-rotary-frame", "Apex Rotary Frame", "Weapons", 88, { "prototype-weapon-core": 2, prototypeDriveUnit: 1, "legendary-chrome-matrix": 1, "ballistic-core": 4 }, "apex-rotary-frame", 1, 94000, 430, "bp-prototype-implant"),
    recipe("recipe-backroom-breacher", "Backroom Breacher", "Weapons", 28, { "weapon-frame": 1, "smuggler-seal": 2, "barrel-assembly": 2, "reinforced-grip": 2 }, "backroom-breacher", 1, 28000, 118),
    recipe("recipe-thundercoil-scattergun", "Thundercoil Scattergun", "Weapons", 80, { "prototype-weapon-core": 2, "security-override-chip": 2, "armor-breaker-plate": 3, "relic-circuit": 1 }, "thundercoil-scattergun", 1, 87000, 385, "bp-prototype-implant"),
    recipe("recipe-glassline-marksman", "Glassline Marksman", "Weapons", 36, { "weapon-frame": 1, "corporate-optic-lens": 2, "executive-processor": 1, "barrel-assembly": 3 }, "glassline-marksman", 1, 38000, 158, "bp-corporate-cyberware"),
    recipe("recipe-midnight-protocol", "Midnight Protocol", "Weapons", 66, { "weapon-frame": 1, "black-ledger-shard": 3, "suppressor-baffles": 4, "rare-blueprint-fragment": 5 }, "midnight-protocol", 1, 70000, 305, "bp-blacknet-tool"),
    recipe("recipe-red-horizon-tac", "Red Horizon TAC", "Weapons", 90, { "prototype-weapon-core": 2, "legendary-chrome-matrix": 1, "relic-circuit": 2, "executive-processor": 3 }, "red-horizon-tac", 1, 98000, 455, "bp-prototype-implant"),
    recipe("recipe-neon-fang", "Neon Fang", "Weapons", 30, { "weapon-frame": 1, "redline-wire": 3, "urban-reflex-chip": 2, "grip-polymer": 4 }, "neon-fang", 1, 30000, 126),
    recipe("recipe-phase-edge", "Phase Edge", "Weapons", 84, { "prototype-neural-core": 2, "blacknet-cipher": 3, "daemon-fragment": 2, "prototype-weapon-core": 1 }, "phase-edge", 1, 90000, 405, "bp-prototype-implant"),
    recipe("recipe-impact-driver", "Impact Driver", "Weapons", 32, { "weapon-frame": 1, "salvaged-servo": 3, engineCore: 1, "reinforced-grip": 2 }, "impact-driver", 1, 34000, 142, "bp-scavenger-rig"),
    recipe("recipe-grav-piston-hammer", "Grav-Piston Hammer", "Weapons", 86, { engineCore: 2, prototypeDriveUnit: 1, "prototype-weapon-core": 2, "armor-breaker-plate": 4 }, "grav-piston-hammer", 1, 92000, 420, "bp-prototype-implant"),
    recipe("recipe-railspike-vx", "Railspike VX", "Weapons", 34, { "weapon-frame": 1, "smartlink-chip": 2, "barrel-assembly": 3, "security-override-chip": 1 }, "railspike-vx", 1, 36000, 150, "bp-corporate-cyberware"),
    recipe("recipe-nullbreaker-coilgun", "Nullbreaker Coilgun", "Weapons", 92, { "prototype-weapon-core": 2, "relic-circuit": 2, "glassline-alloy": 4, "boss-data-key": 1 }, "nullbreaker-coilgun", 1, 100000, 470, "bp-prototype-implant"),
    recipe("recipe-streetseeker-c9", "Streetseeker C-9", "Weapons", 32, { "weapon-frame": 1, "smartlink-chip": 3, "drone-motor": 2, circuitBoards: 6 }, "streetseeker-c9", 1, 34000, 142, "bp-blacknet-tool"),
    recipe("recipe-hive-oracle", "Hive Oracle", "Weapons", 88, { "prototype-weapon-core": 2, "corporate-optic-lens": 3, "daemon-fragment": 2, "apex-neural-core": 1 }, "hive-oracle", 1, 95000, 435, "bp-prototype-implant"),
  ];
}
