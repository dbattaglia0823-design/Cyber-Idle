import type { AttachmentCategory, CyberwareSlot, GearSlot, ItemDefinition, ItemRarity, WeaponClassId } from "../types";

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
  component("weapon-frame", "Weapon Frame", "A stripped frame used for street weapon builds.", 34),
  districtMaterial("street-coil", "Street Coil", "A compact coil stripped from Neon Row signage and boosted street gear.", "Neon Row actions, high-threat variants, and return contracts.", 80),
  districtMaterial("urban-reflex-chip", "Urban Reflex Chip", "A cheap but responsive combat chip prized by street duelists.", "Neon Row enemy logs and mastery 15+ variants.", 95),
  districtMaterial("lowgrade-optic-lens", "Lowgrade Optic Lens", "A serviceable optic lens used in starter implants and scopes.", "Neon Row scavenging, clinics, and lookout drops.", 72),
  districtMaterial("redline-wire", "Redline Wire", "Heat-resistant wire used in unstable street modifications.", "Neon Row and Redline Blocks combat routes.", 88),
  districtMaterial("neon-circuit-fragment", "Neon Circuit Fragment", "A bright fragment used in low-tier cyberdeck and cyberware chains.", "Neon Row mastery drops and old-district Sim Cache.", 66),
  districtMaterial("salvaged-servo", "Salvaged Servo", "A reusable actuator recovered from yard machinery.", "Rust Yards enemies and scavenging.", 105),
  districtMaterial("rust-plated-frame", "Rust-Plated Frame", "A reinforced frame used in durable low-cost chrome.", "Rust Yards high-threat variants and operations.", 130),
  districtMaterial("drone-motor", "Drone Motor", "A compact motor recovered from hostile drones.", "Rust Yards drone combat and wreck recovery.", 120),
  districtMaterial("chrome-jackal-gearset", "Chrome Jackal Gearset", "A faction-marked gearset for vehicles and heavy weapons.", "Rust Yards contracts and Chrome Jackals reputation content.", 170),
  districtMaterial("contraband-chip", "Contraband Chip", "A banned market chip used in illegal mods and black-market contracts.", "Underpass Market jobs and vendors.", 120),
  districtMaterial("illegal-mod-core", "Illegal Mod Core", "A compact illegal modifier core used in risky upgrades.", "Underpass Market contracts and high-threat routes.", 185),
  districtMaterial("black-ledger-shard", "Black Ledger Shard", "A shard of encrypted buyer data from an under-market ledger.", "Underpass Market hacking and return contracts.", 145),
  districtMaterial("smuggler-seal", "Smuggler Seal", "A stamped seal used to certify underpass cargo chains.", "Underpass Market fixer work and operations.", 155),
  districtMaterial("rogue-packet-core", "Rogue Packet Core", "A volatile packet core used in Blacknet processors.", "Blacknet Quarter hacking and daemon variants.", 180),
  districtMaterial("trace-scrambler-chip", "Trace Scrambler Chip", "A chip that helps stabilize noisy intrusion hardware.", "Blacknet Quarter traces, rare drops, and cyberdeck crafting.", 190),
  districtMaterial("encrypted-memory-stack", "Encrypted Memory Stack", "A dense memory stack used in advanced data gear.", "Blacknet Quarter and corporate hacks.", 170),
  districtMaterial("daemon-fragment", "Daemon Fragment", "A dangerous fragment of hostile Blacknet logic.", "Blacknet Quarter operations and bosses.", 240, "Epic"),
  districtMaterial("executive-processor", "Executive Processor", "A corporate processor used in clean-room tech.", "Glassline District elite guards and operations.", 230, "Epic"),
  districtMaterial("glassline-alloy", "Glassline Alloy", "A polished alloy used in corporate cyberware frames.", "Glassline District scavenging and security drops.", 210, "Epic"),
  districtMaterial("security-override-chip", "Security Override Chip", "A restricted chip for bypassing corporate locks.", "Glassline District hacks and operation routes.", 220, "Epic"),
  districtMaterial("corporate-optic-lens", "Corporate Optic Lens", "A clean optic lens used in high-tier optics.", "Glassline District enemies and Ripperdoc stock.", 205, "Epic"),
  districtMaterial("stabilizer-compound", "Stabilizer Compound", "A compound used for safe implant calibration.", "Helix Ward clinics and medical actions.", 160),
  districtMaterial("neural-dampener", "Neural Dampener", "A dampener used to control Neural Instability spikes.", "Helix Ward treatment chains and operations.", 185),
  districtMaterial("medical-gel-matrix", "Medical Gel Matrix", "A refined medical matrix used in recovery devices.", "Helix Ward crafting and medical contracts.", 175),
  districtMaterial("bioware-thread", "Bioware Thread", "A sterile thread used in hybrid cyberware repairs.", "Helix Ward rare medical drops.", 195),
  districtMaterial("helix-authorization", "Helix Authorization", "A clean authorization token for restricted clinics.", "Helix Ward reputation and story content.", 260, "Epic"),
  districtMaterial("ballistic-core", "Ballistic Core", "A hardened core used in late combat weapon chains.", "Redline Blocks enemies and operations.", 205, "Epic"),
  districtMaterial("reinforced-grip", "Reinforced Grip", "A high-stability grip used in heavy combat gear.", "Redline Blocks contracts and weapon crafting.", 155),
  districtMaterial("redline-trigger-kit", "Redline Trigger Kit", "A tuned trigger kit for aggressive street weapons.", "Redline Blocks variants and weapon logs.", 190),
  districtMaterial("combat-stim-pack", "Combat Stim Pack", "A risky combat stim pack used in dangerous jobs.", "Redline Blocks drops and fixer contracts.", 165),
  districtMaterial("armor-breaker-plate", "Armor Breaker Plate", "A shaped plate used in armor-breaking ammunition and weapons.", "Redline Blocks operations and bosses.", 215, "Epic"),
  districtMaterial("apex-neural-core", "Apex Neural Core", "An endgame neural core for legendary chrome.", "Skyline Core bosses and relic crafting.", 460, "Legendary"),
  districtMaterial("relic-circuit", "Relic Circuit", "An extremely rare circuit for relic-grade systems.", "Skyline Core bosses and completion rewards.", 520, "Relic"),
  districtMaterial("luxury-processor", "Luxury Processor", "A pristine processor used in elite skyline hardware.", "Skyline Core vendors and executive drops.", 390, "Epic"),
  districtMaterial("skyline-authorization", "Skyline Authorization", "An elite authorization token for Skyline Core systems.", "Skyline Core story and faction gates.", 480, "Legendary"),
  districtMaterial("legendary-chrome-matrix", "Legendary Chrome Matrix", "A legendary matrix for endgame cyberware assembly.", "Skyline Core operations and relic chains.", 640, "Legendary"),
  component("precision-parts", "Precision Parts", "Clean springs, pins, and machined weapon internals.", 46),
  component("smartlink-chip", "Smartlink Chip", "A targeting co-processor for smart weapons and links.", 85),
  component("barrel-assembly", "Barrel Assembly", "A tested barrel assembly for reliable weapon crafting.", 58),
  component("grip-polymer", "Grip Polymer", "Moldable grip material used in handling upgrades.", 26),
  component("optic-lens", "Optic Lens", "A compact optic lens for scopes and scanner attachments.", 52),
  component("suppressor-baffles", "Suppressor Baffles", "Heat-resistant baffles for quiet muzzle work.", 62),
  component("mod-core", "Mod Core", "An internal weapon mod socket and firmware core.", 92),
  component("prototype-weapon-core", "Prototype Weapon Core", "An unstable core for rare weapon projects.", 420, "Epic"),
  consumable("basic-med-injector", "Basic Med Injector", "A cheap emergency injector that restores 25 HP.", 20, "heal"),
  consumable("trauma-patch", "Trauma Patch", "A compressed trauma patch that restores 20% max HP.", 38, "heal"),
  consumable("combat-stim", "Combat Stim", "Restores HP and sharpens combat focus, but adds a little Neural Instability.", 55, "heal"),
  consumable("advanced-med-injector", "Advanced Med Injector", "A military-grade injector that restores 50% max HP.", 105, "heal"),
  consumable("emergency-reboot-kit", "Emergency Reboot Kit", "Rare kit that can reboot a downed runner and restore emergency HP.", 260, "heal"),
  consumable("neural-stabilizer", "Neural Stabilizer", "A clinic-grade stabilizer used in medical recipes and ripperdoc supply chains.", 45, undefined),
  consumable("basic-sim-cache", "Basic Sim Cache", "Stores 5 minutes of simulated work for discovered skill actions or crafting.", 80, undefined),
  consumable("combat-sim-cache", "Combat Sim Cache", "Future cache type for already-cleared combat farming.", 100, undefined),
  consumable("blacknet-sim-cache", "Blacknet Sim Cache", "Future cache type for discovered hacking loops.", 100, undefined),
  consumable("fixer-sim-cache", "Fixer Sim Cache", "Future cache type for repeatable safe fixer jobs.", 100, undefined),
  component("prototype-neural-core", "Prototype Neural Core", "High-tier bottleneck for unstable implant projects.", 350, "Epic"),
  component("blacknet-cipher", "Blacknet Cipher", "A rare encrypted key for advanced Blacknet recipes.", 320, "Epic"),
  component("stabilized-chrome-frame", "Stabilized Chrome Frame", "A hardened frame for prototype chrome.", 300, "Epic"),
  component("boss-data-key", "Boss Data Key", "Future boss and dungeon unlock bottleneck.", 400, "Legendary"),
  component("faction-authorization", "Faction Authorization", "A permit token for faction-gated unlocks.", 250, "Epic"),
  component("district-permit", "District Permit", "A district access bottleneck for later progression.", 250, "Epic"),
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
  component("basic-scanner", "Basic Scanner", "A pocket scanner that improves early salvage reads.", 70),
  component("magnetic-scrapper", "Magnetic Scrapper", "A compact tool for faster metal and board recovery.", 95),
  component("drone-recovery-kit", "Drone Recovery Kit", "Insulated leads and clamps for pulling drone parts cleanly.", 150),
  component("signal-locator", "Signal Locator", "Finds live emitters in wreckage and hidden caches.", 170),
  component("prototype-extractor", "Prototype Extractor", "A dangerous rig for extracting fragile prototype parts.", 360, "Epic"),
  component("starter-breach-program", "Starter Breach Program", "A basic breach routine for public terminals.", 120),
  component("camera-spoof-program", "Camera Spoof Program", "A spoof routine tuned for cheap surveillance grids.", 150),
  component("data-siphon-program", "Data Siphon Program", "A siphon routine for better encrypted payloads.", 210),
  component("trace-scrambler-program", "Trace Scrambler Program", "A program that blurs hostile trace handshakes.", 260, "Rare"),
  component("firewall-cutter-program", "Firewall Cutter Program", "A hard-cut routine for corporate grid intrusion.", 300, "Rare"),
  component("ghost-route-program", "Ghost Route Program", "A quiet routing program for dangerous Blacknet exits.", 380, "Epic"),
  component("daemon-chain-program", "Daemon Chain Program", "A late-game chained daemon routine with high upside.", 520, "Legendary"),
  component("damaged-optic-implant", "Damaged Optic Implant", "A cracked optic implant that can be repaired or sold.", 120),
  component("damaged-reflex-wiring", "Damaged Reflex Wiring", "Twitchy reflex wiring suitable for repair practice.", 140),
  component("load-optimizer", "Load Optimizer", "A calibration aid for reducing implant load.", 220, "Rare"),
  component("cyberware-upgrade-core", "Cyberware Upgrade Core", "A dense upgrade core for higher-tier cyberware work.", 260, "Rare"),
  component("stabilizer-formula", "Stabilizer Formula", "A formula used to improve stabilizer output.", 260, "Rare"),
  component("silent-tire-set", "Silent Tire Set", "Quiet tires for smuggling and low-Heat travel builds.", 240),
  component("ghost-market-token", "Ghost Market Token", "A favor token recognized by private market brokers.", 210),
  component("private-buyer-contact", "Private Buyer Contact", "A vetted contact for high-value black market sales.", 280),
  component("rare-listing-permit", "Rare Listing Permit", "A permit marker for safer rare item listings.", 240),
  component("informant-contact", "Informant Contact", "A street contact who knows which doors are worth knocking on.", 180),
  component("fixer-favor", "Fixer Favor", "A favor marker that can support future fixer unlock chains.", 190),
  consumable("advanced-stabilizer", "Advanced Neural Stabilizer", "A high-grade clinic stabilizer used in advanced medical recipes and services.", 120, undefined),
  consumable("job-success-booster", "Contract Assurance Chip", "A corporate consumable placeholder for safer high-pay jobs.", 180, undefined),
  consumable("illegal-overclock", "Illegal Overclock", "A dangerous black-market boost placeholder.", 140, undefined),
  blueprint("bp-starter-weapon", "Starter Weapon Blueprint", "Unlocks future starter weapon upgrades.", "Rare Backstreet Sweep reward."),
  blueprint("bp-scavenger-rig", "Scavenger Rig Blueprint", "Unlocks future scavenging gear.", "Junkyard Lockdown reward."),
  blueprint("bp-blacknet-tool", "Blacknet Tool Blueprint", "Unlocks future hacking tools.", "Ghost Signal Dive reward."),
  blueprint("bp-corporate-cyberware", "Corporate Cyberware Blueprint", "Unlocks future corporate implants.", "Corporate Extraction reward."),
  blueprint("bp-precision-grip", "Precision Grip Blueprint", "Unlocks Precision Grip Actuators.", "Rare drop from Scrap Drone."),
  blueprint("bp-stabilized-buffer", "Stabilized Buffer Blueprint", "Unlocks Stabilized Neural Buffer.", "Rare hacking or Helix job reward."),
  blueprint("calibration-blueprint", "Calibration Blueprint", "Unlocks deeper calibration recipes and safer implant tuning.", "Cyberware Engineering rare drop."),
  blueprint("bp-prototype-implant", "Prototype Implant Blueprint", "Unlocks future prototype implant assemblies.", "Prototype assembly rare drop."),
  blueprint("neural-dampener-blueprint", "Neural Dampener Blueprint", "Unlocks future Neural Instability treatment cyberware.", "Medical Knowledge rare drop."),
  blueprint("advanced-stabilizer-formula", "Advanced Stabilizer Formula", "Unlocks stronger stabilizer crafting later.", "Medical Knowledge rare drop."),
  cyberware("basic-optic-scanner", "Basic Optic Scanner", "Highlights useful salvage and weak seams.", "optics", 1, 1, { skillRewards: 0.03 }, 1, ["scavenging"]),
  cyberware("reflex-wiring", "Reflex Wiring", "Shortens the gap between seeing and moving.", "neural", 1, 2, { actionSpeed: 0.02, combatDamage: 0.03 }, 2, ["combat"]),
  cyberware("subdermal-mesh", "Subdermal Mesh", "Thin armored mesh under the skin.", "skin", 1, 2, { combatDefense: 0.05 }, 2, ["combat"]),
  cyberware("entry-cyberdeck", "Entry Cyberdeck", "A starter deck wired directly into your OS port.", "operatingSystem", 1, 3, { skillXp: { hacking: 0.05 } }, 3, ["hacking"]),
  cyberware("synthetic-tendons", "Synthetic Tendons", "Cheap but effective mobility boosters.", "legs", 1, 4, { actionSpeed: 0.03 }, 1, ["speed"]),
  cyberware("precision-grip-actuators", "Precision Grip Actuators", "Armature grip motors for delicate implant work.", "arms", 2, 5, { skillXp: { cyberware: 0.05 } }, 2, ["cyberware"]),
  cyberware("stabilized-neural-buffer", "Stabilized Neural Buffer", "A conservative implant that dampens instability spikes.", "neural", 2, 6, { neuralInstabilityRecovery: 0.05 }, -6, ["medical", "stabilizer"]),
  cyberware("dampener-weave", "Dampener Weave", "A skin-layer stabilizer that smooths signal noise from heavier chrome.", "skin", 2, 8, { combatDefense: 0.02, neuralInstabilityRecovery: 0.04 }, -4, ["medical", "stabilizer"]),
  cyberware("helix-governor-os", "Helix Governor OS", "A restrained operating system that limits runaway implant feedback.", "operatingSystem", 3, 14, { skillXp: { medical: 0.04 }, neuralInstabilityRecovery: 0.08 }, -9, ["medical", "stabilizer", "helix"]),
  ...expandedCyberware(),
  weapon("rusted-pistol", "Rusted Pistol", "Ugly, loud, and still better than harsh words.", 1, "pistols", { damage: 5, accuracy: 2, critChance: 0.03 }, ["ranged", "gang"], ["muzzle", "grip"], 1, "Starter sidearm and Neon Row vendor stock."),
  weapon("street-knife", "Street Knife", "A fast blade for close work.", 1, "blades", { damage: 3, attackSpeed: -80, critChance: 0.05, heatModifier: -0.03 }, ["melee", "stealth", "lowHeat"], ["grip"], 1, "Starter blade and Redline drops."),
  weapon("scrap-baton", "Scrap Baton", "A weighted baton made from insulated salvage.", 1, "bluntWeapons", { damage: 4, armorPenetration: 1 }, ["melee", "nonlethal", "gang"], ["grip"], 1, "Crafted from scrap and grip polymer."),
  weapon("junk-smg", "Junk SMG", "A jumpy automatic stitched from pawned parts.", 1, "smgs", { damage: 6, attackSpeed: -120, accuracy: -1, heatModifier: 0.04 }, ["ranged", "loud", "gang"], ["muzzle", "magazine", "grip"], 1, "Street crew drop."),
  weapon("sawed-off-shotgun", "Sawed-Off Shotgun", "Short, brutal, and hard to hide.", 1, "shotguns", { damage: 11, attackSpeed: 220, accuracy: -2, armorPenetration: 2, heatModifier: 0.06 }, ["ranged", "loud", "armorPiercing"], ["muzzle", "barrel", "grip"], 1, "Underpass contraband stock."),
  weapon("modified-smg", "Modified SMG", "Cleaner internals and a better recoil loop.", 2, "smgs", { damage: 9, attackSpeed: -160, accuracy: 1, heatModifier: 0.03 }, ["ranged", "loud", "gang"], ["muzzle", "magazine", "grip", "stock"], 2, "Crafted or Redline Arms stock."),
  weapon("reinforced-blade", "Reinforced Blade", "A quiet edge with a hardened spine.", 2, "blades", { damage: 8, attackSpeed: -100, critChance: 0.08, heatModifier: -0.05 }, ["melee", "stealth", "lowHeat"], ["grip"], 2, "Redline bounty reward."),
  weapon("shock-baton", "Shock Baton", "A nonlethal baton that ruins drones and knees.", 2, "bluntWeapons", { damage: 7, armorPenetration: 3 }, ["melee", "nonlethal", "drone", "mech"], ["grip", "batteryCore"], 2, "Rust Yards rare drop."),
  weapon("street-rifle", "Street Rifle", "A reliable rifle with room for proper tuning.", 2, "assaultRifles", { damage: 10, accuracy: 2 }, ["ranged", "corporate"], ["muzzle", "scope", "magazine", "grip", "barrel"], 2, "Crafted from weapon frames."),
  weapon("cheap-smart-pistol", "Cheap Smart Pistol", "Half smart, half stubborn.", 2, "smartWeapons", { damage: 7, accuracy: 5, critChance: 0.04 }, ["ranged", "smart", "drone"], ["muzzle", "link", "batteryCore"], 2, "Blacknet Data Broker listing."),
  weapon("low-end-tech-pistol", "Low-End Tech Pistol", "A cheap coil pistol that punches armor better than it should.", 2, "techWeapons", { damage: 8, armorPenetration: 5, neuralInstabilityModifier: 1 }, ["ranged", "tech", "armorPiercing", "corporate"], ["barrel", "batteryCore", "grip"], 2, "Glassline supplier parts."),
  weapon("smartlink-revolver", "Smartlink Revolver", "A heavy revolver with clean target handshake.", 3, "smartWeapons", { damage: 14, accuracy: 6, critChance: 0.07 }, ["ranged", "smart", "drone"], ["scope", "link", "barrel", "grip"], 2, "Smart weapon rare craft."),
  weapon("scrap-shotgun", "Scrap Shotgun", "Reinforced close-range punch for high-threat streets.", 3, "shotguns", { damage: 18, attackSpeed: 260, armorPenetration: 4, heatModifier: 0.07 }, ["ranged", "loud", "armorPiercing", "highThreat"], ["muzzle", "barrel", "grip", "stock"], 2, "Rust Yards enemy drop."),
  weapon("blacknet-spike-deck", "Blacknet Spike Deck", "A hostile deck weapon built for relay fights.", 3, "cyberdeckWeapons", { damage: 12, accuracy: 4, heatModifier: -0.02, neuralInstabilityModifier: 2 }, ["blacknet", "illegal", "ranged"], ["link", "batteryCore"], 2, "Blacknet operation reward."),
  weapon("pulse-rifle", "Pulse Rifle", "A balanced rifle with reliable corporate breach performance.", 3, "assaultRifles", { damage: 15, accuracy: 4, armorPenetration: 2 }, ["ranged", "corporate"], ["muzzle", "scope", "magazine", "grip", "barrel", "stock"], 2, "Corporate patrol drop."),
  weapon("monowire-knockoff", "Monowire Knockoff", "Unlicensed filament. Cuts clean, behaves badly.", 3, "exoticWeapons", { damage: 16, attackSpeed: -140, critChance: 0.1, neuralInstabilityModifier: 3 }, ["melee", "stealth", "prototype", "illegal"], ["grip", "batteryCore"], 2, "Underpass prototype listing."),
  weapon("armor-piercing-rifle", "Armor-Piercing Rifle", "A tech rifle that eats corporate armor.", 3, "techWeapons", { damage: 16, accuracy: 3, armorPenetration: 8 }, ["ranged", "tech", "armorPiercing", "corporate"], ["scope", "barrel", "batteryCore", "stock"], 2, "Glassline rare craft."),
  weapon("suppressed-precision-pistol", "Suppressed Precision Pistol", "A clean pistol built for quiet work.", 3, "pistols", { damage: 10, accuracy: 6, critChance: 0.1, heatModifier: -0.08 }, ["ranged", "stealth", "assassination", "lowHeat"], ["muzzle", "scope", "grip"], 2, "Ghost Market rare listing."),
  weapon("heavy-breacher", "Heavy Breacher", "A heavy weapon for bosses, doors, and terrible decisions.", 3, "heavyWeapons", { damage: 24, attackSpeed: 420, armorPenetration: 6, heatModifier: 0.12 }, ["ranged", "loud", "highHeat", "boss"], ["muzzle", "barrel", "stock", "batteryCore"], 2, "Operation drop."),
  ...expandedWeapons(),
  attachment("crude-suppressor", "Crude Suppressor", "Cheap muzzle suppression for stealth jobs.", "muzzle", "Common", ["pistols", "smgs"], { heatGain: -0.03, jobSuccessChance: 0.02 }, ["stealth", "lowHeat"], "Neon Row Street Vendor."),
  attachment("military-suppressor", "Military Suppressor", "Better suppression with cleaner cycling.", "muzzle", "Rare", ["pistols", "smgs", "sniperRifles"], { heatGain: -0.06, jobSuccessChance: 0.03 }, ["stealth", "assassination"], "Rare Underpass market stock."),
  attachment("compensator", "Compensator", "Improves accuracy for loud weapons.", "muzzle", "Uncommon", ["pistols", "smgs", "assaultRifles"], { combatDamage: 0.02 }, ["loud"], "Weapon crafting."),
  attachment("loudener-brake", "Loudener Brake", "More punch, more attention.", "muzzle", "Uncommon", ["shotguns", "heavyWeapons"], { combatDamage: 0.04, heatGain: 0.03 }, ["loud", "boss"], "Redline Arms Dealer."),
  attachment("reflex-sight", "Reflex Sight", "Fast target acquisition.", "scope", "Common", ["pistols", "smgs", "assaultRifles", "shotguns"], { combatDamage: 0.01 }, ["ranged"], "Crafted from optic lenses."),
  attachment("thermal-scope", "Thermal Scope", "Finds hidden targets and rare materials.", "scope", "Rare", ["assaultRifles", "sniperRifles", "techWeapons"], { dropChance: 0.02 }, ["corporate", "stealth"], "Glassline rare stock."),
  attachment("threat-scanner-scope", "Threat Scanner Scope", "Reveals drop intel earlier.", "scope", "Rare", ["pistols", "assaultRifles", "sniperRifles", "smartWeapons"], { dropChance: 0.03 }, ["highThreat", "drone"], "Blacknet/Glassline drop."),
  attachment("longshot-scope", "Longshot Scope", "Assassination and boss opener support.", "scope", "Uncommon", ["sniperRifles", "assaultRifles"], { combatDamage: 0.03 }, ["assassination", "boss"], "Crafted."),
  attachment("extended-mag", "Extended Mag", "More sustained fire.", "magazine", "Common", ["smgs", "assaultRifles"], { actionSpeed: 0.01 }, ["loud"], "Crafted."),
  attachment("quickload-mag", "Quickload Mag", "Faster reload rhythm.", "magazine", "Uncommon", ["pistols", "smgs", "assaultRifles"], { actionSpeed: 0.02 }, ["ranged"], "Redline drop."),
  attachment("smart-feed-mag", "Smart Feed Mag", "Feeds smart rounds with fewer jams.", "magazine", "Rare", ["smartWeapons", "smgs"], { skillXp: { hacking: 0.02 }, combatDamage: 0.02 }, ["smart", "drone"], "Blacknet Data Broker."),
  attachment("stability-grip", "Stability Grip", "Steadier handling.", "grip", "Common", ["pistols", "smgs", "shotguns", "assaultRifles", "techWeapons"], { combatDamage: 0.01 }, ["ranged"], "Crafted."),
  attachment("recoil-grip", "Recoil Grip", "Better recoil recovery.", "grip", "Uncommon", ["smgs", "shotguns", "heavyWeapons"], { combatDamage: 0.02 }, ["loud"], "Rust Yards drop."),
  attachment("silent-handling-grip", "Silent Handling Grip", "Quieter draw and movement.", "grip", "Uncommon", ["pistols", "blades", "sniperRifles"], { heatGain: -0.02, jobSuccessChance: 0.01 }, ["stealth"], "Ghost Market stock."),
  attachment("armor-piercing-barrel", "Armor-Piercing Barrel", "Improves penetration against armor.", "barrel", "Rare", ["assaultRifles", "shotguns", "techWeapons"], { combatDamage: 0.03 }, ["armorPiercing", "corporate"], "Glassline drop."),
  attachment("short-barrel", "Short Barrel", "Faster, louder close-range handling.", "barrel", "Common", ["shotguns", "smgs"], { actionSpeed: 0.02, heatGain: 0.02 }, ["loud"], "Crafted."),
  attachment("precision-barrel", "Precision Barrel", "Cleaner shots and crit setup.", "barrel", "Uncommon", ["pistols", "sniperRifles", "assaultRifles"], { combatDamage: 0.02, dropChance: 0.01 }, ["assassination"], "Crafted."),
  attachment("basic-smartlink", "Basic Smartlink", "A starter targeting link.", "link", "Uncommon", ["smartWeapons", "pistols"], { combatDamage: 0.02, skillXp: { hacking: 0.01 } }, ["smart"], "Crafted."),
  attachment("blacknet-link", "Blacknet Link", "Routes weapon telemetry through hostile relays.", "link", "Rare", ["cyberdeckWeapons", "smartWeapons"], { skillXp: { hacking: 0.03 }, heatGain: -0.02 }, ["blacknet"], "Blacknet operation drop."),
  attachment("trace-scrambler-link", "Trace Scrambler Link", "Scrambles weapon traces during illegal work.", "link", "Rare", ["cyberdeckWeapons", "smartWeapons", "pistols"], { heatGain: -0.04, jobSuccessChance: 0.02 }, ["blacknet", "illegal"], "Null Choir reward."),
  attachment("shock-capacitor", "Shock Capacitor", "Adds disruption against drones and mechs.", "batteryCore", "Uncommon", ["bluntWeapons", "techWeapons", "smartWeapons"], { combatDamage: 0.02 }, ["drone", "mech"], "Rust Yards drop."),
  attachment("thermal-capacitor", "Thermal Capacitor", "Adds heat burst for armor breach.", "batteryCore", "Uncommon", ["techWeapons", "heavyWeapons"], { combatDamage: 0.03, heatGain: 0.01 }, ["armorPiercing"], "Glassline supplier."),
  attachment("prototype-overclock-core", "Prototype Overclock Core", "Unstable power core with strong upside.", "batteryCore", "Prototype", ["exoticWeapons", "heavyWeapons", "cyberdeckWeapons"], { combatDamage: 0.06, neuralInstabilityGain: 0.03 }, ["prototype", "boss"], "Rare operation drop."),
  weaponMod("armor-piercer", "Armor Piercer", "Internal penetrator routine for armored targets.", "Uncommon", ["pistols", "assaultRifles", "techWeapons"], { combatDamage: 0.03 }, "More damage into armored enemies.", ["armorPiercing", "corporate"]),
  weaponMod("loot-seeker", "Loot Seeker", "Sacrifices damage tuning for better extraction.", "Rare", ["pistols", "sniperRifles", "smartWeapons", "cyberdeckWeapons"], { combatDamage: -0.02, dropChance: 0.05 }, "Improves rare drops but lowers damage.", ["highThreat"]),
  weaponMod("trace-scrambler", "Trace Scrambler", "Software routine for Blacknet and illegal jobs.", "Rare", ["smartWeapons", "cyberdeckWeapons"], { heatGain: -0.04, jobSuccessChance: 0.02 }, "Trace and Heat relief.", ["blacknet", "illegal"]),
  weaponMod("thermal-rounds", "Thermal Rounds", "Hot loads for armor and bosses.", "Uncommon", ["shotguns", "assaultRifles", "heavyWeapons"], { combatDamage: 0.04, heatGain: 0.02 }, "More damage, more Heat.", ["boss", "armorPiercing"]),
  weaponMod("shock-rounds", "Shock Rounds", "Disruption loads for drones and mechs.", "Uncommon", ["smgs", "shotguns", "smartWeapons"], { combatDamage: 0.03 }, "Drone and mech control.", ["drone", "mech"]),
  weaponMod("bleed-edge", "Bleed Edge", "Edge treatment for silent melee work.", "Uncommon", ["blades"], { combatDamage: 0.03, heatGain: -0.02 }, "Low-Heat blade kills.", ["stealth", "melee"]),
  weaponMod("boss-breaker", "Boss Breaker", "Reinforced internals for operation bosses.", "Rare", ["heavyWeapons", "sniperRifles", "techWeapons"], { combatDamage: 0.05 }, "Boss and operation damage.", ["boss"]),
  weaponMod("faction-killer", "Faction Killer", "Ugly targeting data for faction enemies.", "Rare", ["assaultRifles", "smgs", "bluntWeapons"], { jobRewards: 0.03, combatDamage: 0.03 }, "Faction job pressure.", ["gang", "corporate"]),
  weaponMod("quiet-routine", "Quiet Routine", "Subsonic timing and low-noise handling.", "Uncommon", ["pistols", "blades", "sniperRifles"], { heatGain: -0.03, jobSuccessChance: 0.02 }, "Stealth job support.", ["stealth", "lowHeat"]),
  weaponMod("prototype-core", "Prototype Core", "Unstable core for strange weapons.", "Prototype", ["exoticWeapons", "techWeapons", "cyberdeckWeapons"], { combatDamage: 0.07, neuralInstabilityGain: 0.04 }, "Power with instability.", ["prototype"]),
  armor("scrap-jacket", "Scrap Jacket", "Patchwork armor made from flexible plates.", "chest", 1, { armor: 3, maxHp: 8 }),
  armor("reinforced-hoodie", "Reinforced Hoodie", "Looks casual. Stops cheap blades.", "chest", 1, { armor: 2, dodge: 0.02 }),
  armor("cracked-visor", "Cracked Visor", "A damaged visor with a working threat tint.", "head", 1, { armor: 1, accuracy: 2 }),
  armor("grip-gloves", "Grip Gloves", "Textured gloves with conductive knuckles.", "hands", 1, { damage: 1, accuracy: 1 }),
  armor("runner-boots", "Runner Boots", "Soft boots built for wet concrete.", "boots", 1, { dodge: 0.03, armor: 1 }),
  armor("patched-jacket", "Patched Jacket", "A trophy jacket with a few useful plates left.", "chest", 1, { armor: 1, maxHp: 4 }),
  ...expandedArmorAndAccessories(),
  weapon("servo-knuckles", "Servo Knuckles", "Boosted knuckles stripped from a street bruiser.", 1, "bluntWeapons", { damage: 4, critChance: 0.02, armorPenetration: 1 }, ["melee", "gang"], ["grip"], 1, "Dropped by boosted street fighters."),
  component("drone-eye", "Drone Eye", "A cracked optical unit useful for scanner work.", 30),
];

export const itemNames = Object.fromEntries(items.map((item) => [item.id, item.name]));

export function getItem(id: string) {
  return items.find((item) => item.id === id);
}

function resource(id: string, name: string, description: string, type: "Resource" | "Material", sellValue: number): ItemDefinition {
  return { id, name, description, type, rarity: "Common", tags: [type.toLowerCase()], stackable: true, maxStack: 999999, sellValue, sourceHint: "Core resource.", discovered: true } as ItemDefinition & { discovered: boolean };
}

function component(id: string, name: string, description: string, sellValue: number, rarity: ItemRarity = "Uncommon"): ItemDefinition {
  return { id, name, description, type: "Component", rarity, tags: ["component", "crafting", rarity.toLowerCase()], stackable: true, maxStack: 9999, sellValue, sourceHint: "Crafted from components." };
}

function districtMaterial(id: string, name: string, description: string, sourceHint: string, sellValue: number, rarity: ItemRarity = "Rare"): ItemDefinition {
  return { id, name, description, type: "Material", rarity, tags: ["district", rarity.toLowerCase(), "crafting"], stackable: true, maxStack: 9999, sellValue, sourceHint };
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

function weapon(
  id: string,
  name: string,
  description: string,
  tier: number,
  weaponClass: WeaponClassId,
  stats: ItemDefinition["stats"],
  tags: string[],
  attachmentSlots: AttachmentCategory[],
  modSlots: number,
  sourceHint: string,
): ItemDefinition {
  return {
    id,
    name,
    description,
    type: "Weapon",
    rarity: tier >= 3 ? "Rare" : tier >= 2 ? "Uncommon" : "Common",
    tags: ["weapon", "combat", ...tags],
    stackable: false,
    sellValue: 65 * tier,
    sourceHint,
    slot: "weapon",
    tier,
    requiredSkill: "combat",
    requiredLevel: Math.max(1, tier * 2 - 1),
    stats,
    maxUpgradeLevel: 10,
    weaponClass,
    attachmentSlots,
    modSlots,
  };
}

function attachment(
  id: string,
  name: string,
  description: string,
  attachmentCategory: AttachmentCategory,
  rarity: ItemDefinition["rarity"],
  compatibleWeaponClasses: WeaponClassId[],
  modifiers: ItemDefinition["modifiers"],
  scenarioTags: string[],
  sourceHint: string,
): ItemDefinition {
  return {
    id,
    name,
    description,
    type: "WeaponAttachment",
    rarity,
    tags: ["attachment", attachmentCategory, ...scenarioTags],
    stackable: false,
    sellValue: rarity === "Rare" ? 180 : rarity === "Uncommon" ? 95 : 45,
    sourceHint,
    modifiers,
    attachmentCategory,
    compatibleWeaponClasses,
    maxUpgradeLevel: 5,
    scenarioModifiers: [{ tags: scenarioTags, description: `${name} scenario tuning.`, modifiers }],
  };
}

function weaponMod(
  id: string,
  name: string,
  description: string,
  rarity: ItemDefinition["rarity"],
  compatibleWeaponClasses: WeaponClassId[],
  modifiers: ItemDefinition["modifiers"],
  specialEffect: string,
  scenarioTags: string[],
): ItemDefinition {
  return {
    id,
    name,
    description,
    type: "WeaponMod",
    rarity,
    tags: ["weapon-mod", ...scenarioTags],
    stackable: false,
    sellValue: rarity === "Prototype" ? 420 : rarity === "Rare" ? 220 : 110,
    sourceHint: "Weapon mod drop, operation reward, or specialist vendor.",
    modifiers,
    compatibleWeaponClasses,
    specialEffect,
    maxUpgradeLevel: 5,
    scenarioModifiers: [{ tags: scenarioTags, description: specialEffect, modifiers }],
  };
}

function armor(id: string, name: string, description: string, slot: GearSlot, tier: number, stats: ItemDefinition["stats"]): ItemDefinition {
  return { id, name, description, type: "Armor", rarity: "Common", tags: ["armor", "combat"], stackable: false, sellValue: 55 * tier, sourceHint: "Crafted or dropped in Neon Row.", slot, tier, requiredSkill: "combat", requiredLevel: 1, stats, maxUpgradeLevel: 10 };
}

function expandedArmorAndAccessories(): ItemDefinition[] {
  return [
    gear("street-visor", "Street Visor", "A cheap visor with a working scan strip.", "head", "Common", 1, 1, { accuracy: 1 }, { dropChance: 0.005 }, ["head", "scanner"], "Neon Row vendor stock and street punk drops."),
    gear("patchwork-combat-helm", "Patchwork Combat Helm", "Scrap shell and wire-mesh lining for brawls.", "head", "Uncommon", 2, 5, { armor: 2, accuracy: 2 }, { combatDefense: 0.01 }, ["head", "combat"], "Crafted from scrap plating or dropped by boosted thugs."),
    gear("threat-id-lens-helmet", "Threat-ID Lens Helmet", "A salvaged lens package that catches hostile movement.", "head", "Rare", 3, 14, { armor: 3, accuracy: 4, critChance: 0.02 }, { dropChance: 0.02 }, ["head", "scanner", "corporate"], "Scrap Drone, Glassline guard, and rare crafting source."),
    gear("glassline-tactical-mask", "Glassline Tactical Mask", "Clean-room mask with threat tags and trace shielding.", "head", "Epic", 4, 28, { armor: 5, accuracy: 6, critChance: 0.03 }, { heatGain: -0.03, jobSuccessChance: 0.02 }, ["head", "corporate", "stealth"], "Glassline operation reward or Helix/Glassline blueprint craft."),
    gear("apex-response-helmet", "Apex Response Helmet", "An elite response helmet built for bosses and operations.", "head", "Legendary", 5, 48, { armor: 8, accuracy: 8, critChance: 0.04 }, { damageReduction: 0.03, dropChance: 0.02 }, ["head", "boss", "operation"], "Skyline Core boss and legendary blueprint source."),

    gear("padded-street-vest", "Padded Street Vest", "Simple street padding for first fights.", "chest", "Common", 1, 1, { armor: 2, maxHp: 10 }, undefined, ["chest", "street"], "Neon Row vendor stock and common combat drops."),
    gear("subdermal-plate-carrier", "Subdermal Plate Carrier", "A low-profile carrier built around implant scars.", "chest", "Rare", 3, 16, { armor: 7, maxHp: 28 }, { damageReduction: 0.02 }, ["chest", "armor"], "Rust Yards and Redline drops; craftable with armor plating."),
    gear("chromeweave-armor", "Chromeweave Armor", "Flexible chrome fabric that resists cuts and heat.", "chest", "Epic", 4, 30, { armor: 11, maxHp: 42, dodge: 0.02 }, { heatGain: -0.03 }, ["chest", "heat", "operation"], "Underpass and Glassline operation source."),
    gear("blacksite-assault-shell", "Blacksite Assault Shell", "Heavy assault shell for sustained operation fights.", "chest", "Legendary", 5, 52, { armor: 17, maxHp: 72, armorPenetration: 2 }, { damageReduction: 0.04 }, ["chest", "boss", "armor"], "Skyline and Redline boss reward."),
    gear("adaptive-combat-plating", "Adaptive Combat Plating", "Prototype plates that stiffen under incoming fire.", "chest", "Prototype", 6, 68, { armor: 22, maxHp: 96, dodge: -0.02 }, { combatDefense: 0.08, actionSpeed: -0.01 }, ["chest", "prototype", "risk"], "Prototype operation craft using legendary chrome matrix."),

    gear("wired-knuckle-wraps", "Wired Knuckle Wraps", "Conductive wraps for fast melee work.", "hands", "Uncommon", 2, 4, { damage: 2, accuracy: 1, critChance: 0.02 }, { actionSpeed: 0.01 }, ["hands", "melee"], "Boosted thug and Redline combat drop."),
    gear("servo-lined-gloves", "Servo-Lined Gloves", "Small servos steady weapon handling.", "hands", "Rare", 3, 15, { damage: 3, accuracy: 4 }, { craftingCostReduction: 0.02 }, ["hands", "weapon", "crafting"], "Rust Yards craft and Redline vendor special."),
    gear("reflex-grip-gauntlets", "Reflex Grip Gauntlets", "Gauntlets tuned for fast reloads and blade draws.", "hands", "Epic", 4, 32, { damage: 5, accuracy: 5, critChance: 0.04 }, { actionSpeed: 0.025 }, ["hands", "reflex"], "Redline operations and rare weapon crafting."),
    gear("precision-combat-gloves", "Precision Combat Gloves", "Elite gloves for calm trigger work.", "hands", "Legendary", 5, 54, { damage: 8, accuracy: 8, critChance: 0.05 }, { combatDamage: 0.03 }, ["hands", "precision"], "Skyline luxury broker and boss drops."),

    gear("street-runner-pants", "Street Runner Pants", "Light reinforced pants for alley movement.", "legs", "Common", 1, 1, { dodge: 0.02, armor: 1 }, { actionSpeed: 0.005 }, ["legs", "movement"], "Starter crafting and Neon Row drops."),
    gear("servo-joint-braces", "Servo Joint Braces", "Braces that help carry gear through long routes.", "legs", "Rare", 3, 18, { armor: 3, dodge: 0.04 }, { actionSpeed: 0.02 }, ["legs", "travel"], "Rust Yards enemy and vehicle salvage source."),
    gear("ghoststep-leg-rig", "Ghoststep Leg Rig", "Quiet leg rig for stealth and low-Heat work.", "legs", "Epic", 4, 34, { dodge: 0.07, armor: 4 }, { heatGain: -0.04, jobSuccessChance: 0.03 }, ["legs", "stealth"], "Underpass private buyer and operation source."),
    gear("redline-pursuit-frame", "Redline Pursuit Frame", "High-end chase frame for violent route control.", "legs", "Legendary", 5, 56, { damage: 4, dodge: 0.08, armor: 5 }, { actionSpeed: 0.04 }, ["legs", "redline"], "Redline boss chain and bounty reward."),

    gear("reinforced-treads", "Reinforced Treads", "Hard boots for scrapyards and quick exits.", "boots", "Uncommon", 2, 5, { armor: 2, dodge: 0.03 }, { jobSuccessChance: 0.01 }, ["boots", "travel"], "Rust Yards vendor and crafted source."),
    gear("silent-step-boots", "Silent Step Boots", "Soft-tread boots for contracts and stealth routes.", "boots", "Rare", 3, 16, { dodge: 0.05 }, { heatGain: -0.04, actionSpeed: 0.01 }, ["boots", "stealth"], "Ghost Market and Underpass cutthroat drops."),
    gear("shock-runner-boots", "Shock Runner Boots", "Insulated boots for drone yards and bad weather.", "boots", "Epic", 4, 34, { armor: 4, dodge: 0.07 }, { combatDefense: 0.02, actionSpeed: 0.02 }, ["boots", "drone"], "Rust Yards operation and drone source."),
    gear("skyline-mobility-boots", "Skyline Mobility Boots", "Executive mobility boots with predictive footwork.", "boots", "Legendary", 5, 58, { armor: 5, dodge: 0.1, accuracy: 2 }, { actionSpeed: 0.04, jobSuccessChance: 0.03 }, ["boots", "skyline"], "Skyline Core broker and elite guard source."),

    gear("fixer-ledger-charm", "Fixer Ledger Charm", "A tiny charm with a dozen contact pings.", "accessory1", "Uncommon", 2, 8, {}, { fixerTrustGain: 0.03, reputationGained: 0.02 }, ["accessory", "fixer"], "Fixer contract reward."),
    gear("heat-sink-broach", "Heat-Sink Broach", "A wearable decoy chip that bleeds off attention.", "accessory2", "Rare", 3, 18, {}, { heatGain: -0.05, heatDecay: 0.02 }, ["accessory", "heat"], "Black Market and Blacknet source."),
    gear("sim-cache-catalyst", "Sim Cache Catalyst", "A small processor that improves simulated work.", "accessory1", "Epic", 4, 36, {}, { simCacheEfficiency: 0.06, masteryXpGain: 0.03 }, ["accessory", "simulation"], "Blacknet Quarter operation reward."),
    gear("relic-runner-sigil", "Relic Runner Sigil", "A strange relic charm recognized by old city systems.", "accessory2", "Relic", 7, 90, { maxHp: 25, accuracy: 4 }, { skillRewards: 0.05, dropChance: 0.04, factionReputationGain: 0.04 }, ["accessory", "relic", "endgame"], "Skyline Core relic chain and completion reward."),
  ];
}

function expandedWeapons(): ItemDefinition[] {
  return [
    customWeapon("compact-holdout", "Compact Holdout", "A tiny pistol that keeps Heat low.", "Common", 1, 1, "pistols", { damage: 4, accuracy: 3, attackSpeed: -90, heatModifier: -0.05 }, ["ranged", "stealth", "lowHeat"], ["muzzle", "grip"], 1, "Neon Row street vendor and street punk drops."),
    customWeapon("redline-burst-pistol", "Redline Burst Pistol", "A tuned pistol for crit-heavy street fights.", "Uncommon", 2, 8, "pistols", { damage: 9, accuracy: 4, critChance: 0.07 }, ["ranged", "gang"], ["muzzle", "scope", "grip"], 2, "Redline Arms limited stock and bounty drops."),
    customWeapon("apex-duelist-pistol", "Apex Duelist Pistol", "A legendary sidearm built for clean boss openers.", "Legendary", 5, 55, "pistols", { damage: 28, accuracy: 10, critChance: 0.16, critDamage: 0.4, heatModifier: -0.08 }, ["ranged", "boss", "lowHeat"], ["muzzle", "scope", "barrel", "grip"], 3, "Skyline boss and private armory source."),

    customWeapon("sprayline-smg", "Sprayline SMG", "A cheap high-rate SMG for messy alleys.", "Common", 1, 2, "smgs", { damage: 5, attackSpeed: -180, accuracy: -1, dodge: 0.01, heatModifier: 0.04 }, ["ranged", "loud", "gang"], ["muzzle", "magazine", "grip"], 1, "Street crew and Neon Row drops."),
    customWeapon("ghost-market-vector", "Ghost Market Vector", "A compact illegal SMG with strong handling.", "Epic", 4, 34, "smgs", { damage: 18, attackSpeed: -220, accuracy: 5, dodge: 0.03, heatModifier: -0.03 }, ["ranged", "blackmarket", "stealth"], ["muzzle", "scope", "magazine", "grip", "stock"], 3, "Underpass operation and private buyer source."),

    customWeapon("yard-lmg", "Yard LMG", "A chopped support weapon that suppresses armor.", "Rare", 3, 22, "heavyWeapons", { damage: 26, attackSpeed: 520, armorPenetration: 7, accuracy: -2, dodge: -0.03, heatModifier: 0.12 }, ["ranged", "heavy", "armorPiercing"], ["muzzle", "barrel", "stock", "batteryCore"], 2, "Rust Yards raider and roadboss drops."),
    customWeapon("blacksite-lmg", "Blacksite LMG", "A legendary heavy weapon for operation bosses.", "Legendary", 5, 62, "heavyWeapons", { damage: 46, attackSpeed: 620, armorPenetration: 14, accuracy: 2, dodge: -0.04, heatModifier: 0.16 }, ["ranged", "heavy", "boss"], ["muzzle", "scope", "barrel", "stock", "batteryCore"], 3, "Redline/Skyline operation boss source."),

    customWeapon("glassline-sniper", "Glassline Sniper", "A clean rifle made for corporate weakpoints.", "Epic", 4, 38, "sniperRifles", { damage: 34, attackSpeed: 460, accuracy: 12, critChance: 0.18, critDamage: 0.55 }, ["ranged", "corporate", "boss"], ["muzzle", "scope", "barrel", "stock"], 3, "Glassline guard captain and operation drop."),
    customWeapon("phase-katana", "Phase Katana", "A prototype edge that rewards stealth and dodge.", "Prototype", 6, 72, "blades", { damage: 38, attackSpeed: -220, critChance: 0.18, dodge: 0.08, neuralInstabilityModifier: 4 }, ["melee", "stealth", "prototype"], ["grip", "batteryCore"], 3, "Underpass prototype listing and relic blade chain."),
    customWeapon("gravity-maul", "Gravity Maul", "A brutal hammer that folds armor around impact.", "Epic", 4, 36, "bluntWeapons", { damage: 31, attackSpeed: 260, armorPenetration: 12, maxHp: 20 }, ["melee", "blunt", "armorPiercing"], ["grip", "batteryCore"], 2, "Redline brawler and Rust Yards boss drop."),
    customWeapon("coil-lance", "Coil Lance", "A rare tech weapon that punches through clean armor.", "Rare", 3, 24, "techWeapons", { damage: 24, accuracy: 5, armorPenetration: 13, neuralInstabilityModifier: 2 }, ["ranged", "tech", "armorPiercing"], ["scope", "barrel", "batteryCore", "stock"], 2, "Glassline craft and corporate guard drop."),
    customWeapon("swarmtag-carbine", "Swarmtag Carbine", "A smart carbine tuned for drones and agile targets.", "Rare", 3, 20, "smartWeapons", { damage: 18, accuracy: 10, critChance: 0.08 }, ["ranged", "smart", "drone"], ["scope", "link", "magazine", "batteryCore"], 2, "Blacknet Data Broker and drone drops."),
    customWeapon("daemon-exec-deck", "Daemon Exec Deck", "A relic-grade weaponized deck for hostile Blacknet entities.", "Relic", 7, 92, "cyberdeckWeapons", { damage: 44, accuracy: 10, critChance: 0.12, neuralInstabilityModifier: 6, heatModifier: -0.06 }, ["blacknet", "relic", "boss"], ["link", "batteryCore"], 3, "Blacknet/Skyline relic operation source."),
    customWeapon("redline-viper", "Redline Viper", "A fast crit street pistol built for Redline crews.", "Epic", 4, 34, "pistols", { damage: 20, attackSpeed: -210, accuracy: 5, critChance: 0.14, critDamage: 0.22 }, ["ranged", "pistol", "crit", "redline", "gang"], ["muzzle", "scope", "magazine", "grip"], 3, "Redline Blocks elite enemies and Redline trigger crafting.", "Viper Chain: crits can briefly increase attack speed.", { skillXp: { combat: 0.04 } }),
    customWeapon("glassline-judge", "Glassline Judge", "A precise corporate sidearm with a clean armor verdict.", "Legendary", 5, 58, "pistols", { damage: 32, attackSpeed: -70, accuracy: 14, critChance: 0.11, critDamage: 0.5, armorPenetration: 9 }, ["ranged", "pistol", "corporate", "armored", "boss"], ["muzzle", "scope", "barrel", "grip"], 3, "Glassline operation boss drop and legendary blueprint path.", "Judgement Shot: first hit against armored enemies has increased armor penetration.", { combatDamage: 0.04 }),
    customWeapon("pulse-repeater", "Pulse Repeater", "An experimental charged burst pistol that hums between shots.", "Prototype", 6, 76, "pistols", { damage: 37, attackSpeed: -180, accuracy: 8, critChance: 0.12, armorPenetration: 10, neuralInstabilityModifier: 3 }, ["ranged", "pistol", "tech", "prototype", "risk"], ["scope", "barrel", "grip", "batteryCore"], 3, "Prototype Weapon Core crafting chain and rare Black Market prototype listing.", "Pulse Burst: chance to double-hit, adding a small Instability pulse.", { combatDamage: 0.06, neuralInstabilityGain: 0.02 }),
    customWeapon("neon-splitter", "Neon Splitter", "A bright farming SMG that walks targets into the sightline.", "Epic", 4, 30, "smgs", { damage: 19, attackSpeed: -270, accuracy: 3, dodge: 0.04, critChance: 0.07 }, ["ranged", "smg", "neon", "farming", "gang"], ["muzzle", "scope", "magazine", "grip", "stock"], 3, "Neon Row high-threat enemies and operation rare drops.", "Split Fire: enemy kills can grant extra XP.", { skillXp: { combat: 0.05 }, dropChance: 0.01 }),
    customWeapon("ghostline-ripper", "Ghostline Ripper", "An illegal stealth SMG with a quiet recoil pattern.", "Legendary", 5, 54, "smgs", { damage: 30, attackSpeed: -250, accuracy: 8, critChance: 0.16, heatModifier: -0.1 }, ["ranged", "smg", "stealth", "blackmarket", "lowHeat"], ["muzzle", "scope", "magazine", "grip", "stock"], 3, "Ghost Market rank reward and Underpass Market operation drop.", "Ghostline Pattern: stealth contracts gain extra rare reward chance.", { jobSuccessChance: 0.05, dropChance: 0.02 }),
    customWeapon("vector-bloom", "Vector Bloom", "A smart-assisted prototype SMG that accelerates in long fights.", "Prototype", 6, 78, "smgs", { damage: 36, attackSpeed: -300, accuracy: 13, critChance: 0.12, neuralInstabilityModifier: 3 }, ["ranged", "smg", "smart", "prototype", "ramping"], ["muzzle", "scope", "magazine", "grip", "link"], 3, "Black Market prototype listing and smartlink prototype crafting.", "Bloom Pattern: gains stacking attack speed during longer fights.", { combatDamage: 0.06, neuralInstabilityGain: 0.02 }),
    customWeapon("chrome-jackal-ar", "Chrome Jackal AR", "A reliable salvage rifle with yard pressure tuning.", "Epic", 4, 32, "assaultRifles", { damage: 25, attackSpeed: 40, accuracy: 7, armorPenetration: 8 }, ["ranged", "assault", "salvage", "rust", "vehicle"], ["muzzle", "scope", "magazine", "grip", "barrel", "stock"], 3, "Rust Yards combat drops and Chrome Jackals contract rewards.", "Jackal Pressure: bonus damage against Rust Yards enemies.", { jobSuccessChance: 0.03 }),
    customWeapon("black-badge-carbine", "Black Badge Carbine", "A corporate security rifle with doctrine-coded recoil.", "Legendary", 5, 60, "assaultRifles", { damage: 38, attackSpeed: 10, accuracy: 15, armor: 4, critChance: 0.08 }, ["ranged", "assault", "corporate", "operation"], ["muzzle", "scope", "magazine", "grip", "barrel", "stock"], 3, "Glassline operation boss drop and corporate fixer high-rank contracts.", "Security Doctrine: improves corporate and operation success.", { jobSuccessChance: 0.04, damageReduction: 0.03 }),
    customWeapon("overwatch-helix", "Overwatch Helix", "A biometric adaptive rifle tuned by clinic telemetry.", "Prototype", 6, 82, "assaultRifles", { damage: 44, attackSpeed: 30, accuracy: 13, critChance: 0.1, maxHp: 24, neuralInstabilityModifier: 2 }, ["ranged", "assault", "medical", "prototype", "boss"], ["scope", "magazine", "grip", "barrel", "stock", "link"], 3, "Helix Ward prototype operation and advanced prototype crafting.", "Biometric Feedback: kills restore HP; boss hits improve with installed cyberware.", { combatDamage: 0.07, healingReceived: 0.04 }),
    customWeapon("scrapstorm-lmg", "Scrapstorm LMG", "A salvaged support weapon that batters armor loose.", "Epic", 4, 36, "heavyWeapons", { damage: 36, attackSpeed: 570, accuracy: -1, armorPenetration: 11, dodge: -0.05, heatModifier: 0.12 }, ["ranged", "lmg", "heavy", "rust", "armorBreak"], ["muzzle", "barrel", "stock", "batteryCore"], 3, "Rust Yards boss drop and engine-core heavy crafting.", "Scrapstorm Suppression: chance to reduce enemy armor for the fight.", { combatDamage: 0.04 }),
    customWeapon("redline-siege-platform", "Redline Siege Platform", "A gang-grade heavy weapon built to hold a block by itself.", "Legendary", 5, 64, "heavyWeapons", { damage: 54, attackSpeed: 650, accuracy: 2, armorPenetration: 15, maxHp: 42, heatModifier: 0.16 }, ["ranged", "lmg", "heavy", "redline", "operation"], ["muzzle", "scope", "barrel", "stock", "batteryCore"], 3, "Redline Blocks operation and Redline Saints high-rank rewards.", "Siege Rhythm: consecutive kills slowly increase damage until combat stops.", { combatDamage: 0.08 }),
    customWeapon("apex-rotary-frame", "Apex Rotary Frame", "An unstable rotary frame with endgame overheat tolerances.", "Prototype", 6, 88, "heavyWeapons", { damage: 70, attackSpeed: 740, accuracy: 4, armorPenetration: 21, dodge: -0.06, neuralInstabilityModifier: 5, heatModifier: 0.2 }, ["ranged", "lmg", "heavy", "prototype", "boss", "risk"], ["muzzle", "scope", "barrel", "stock", "batteryCore"], 3, "Skyline Core endgame crafting with prototype drive hardware.", "Rotary Overheat: ramps damage but long fights can add Heat or Instability.", { combatDamage: 0.1, neuralInstabilityGain: 0.03, heatGain: 0.03 }),
    customWeapon("backroom-breacher", "Backroom Breacher", "A compact contract shotgun made for door frames and debt crews.", "Epic", 4, 28, "shotguns", { damage: 30, attackSpeed: 260, accuracy: 1, critDamage: 0.25, armorPenetration: 7 }, ["ranged", "shotgun", "contract", "breach", "bounty"], ["muzzle", "barrel", "grip", "stock"], 3, "Neon Row fixer chain and Backstreet Sweep route reward.", "Door Kicker: breach, bounty, and protection contracts gain success chance.", { jobSuccessChance: 0.05 }),
    customWeapon("rampage-pattern", "Rampage Pattern", "A heavy armor-breaking shotgun with brutal critical force.", "Legendary", 5, 62, "shotguns", { damage: 48, attackSpeed: 330, accuracy: 2, critChance: 0.1, critDamage: 0.55, armorPenetration: 18, heatModifier: 0.08 }, ["ranged", "shotgun", "redline", "armorBreak", "bruiser"], ["muzzle", "scope", "barrel", "grip", "stock"], 3, "Redline boss drop and high-threat Redline operation.", "Rampage Break: critical hits heavily reduce enemy armor briefly.", { combatDamage: 0.07 }),
    customWeapon("thundercoil-scattergun", "Thundercoil Scattergun", "An unstable charged tech shotgun with extra pellet arcs.", "Prototype", 6, 80, "shotguns", { damage: 55, attackSpeed: 390, accuracy: 3, armorPenetration: 20, neuralInstabilityModifier: 4 }, ["ranged", "shotgun", "tech", "prototype", "multiHit"], ["barrel", "grip", "stock", "batteryCore"], 3, "Prototype Weapon Core crafting chain and rare tech boss material.", "Charged Scatter: unstable extra pellets can add small Instability.", { combatDamage: 0.08, neuralInstabilityGain: 0.02 }),
    customWeapon("glassline-marksman", "Glassline Marksman", "A corporate precision rifle built around opening shots.", "Epic", 4, 36, "sniperRifles", { damage: 37, attackSpeed: 490, accuracy: 16, critChance: 0.14, critDamage: 0.55 }, ["ranged", "sniper", "corporate", "precision"], ["muzzle", "scope", "barrel", "stock"], 3, "Glassline District enemies and corporate vendor special stock.", "Opening Mark: first attack against each enemy deals bonus damage.", { combatDamage: 0.04 }),
    customWeapon("midnight-protocol", "Midnight Protocol", "A black-ops sniper rifle designed for silent operation routes.", "Legendary", 5, 66, "sniperRifles", { damage: 58, attackSpeed: 540, accuracy: 19, critChance: 0.18, critDamage: 0.8, armorPenetration: 13, heatModifier: -0.08 }, ["ranged", "sniper", "stealth", "assassination", "operation"], ["muzzle", "scope", "barrel", "stock"], 3, "High-threat corporate operation and legendary sniper blueprint.", "Silent Protocol: stealth and assassination operation routes improve with a suppressor equipped.", { jobSuccessChance: 0.04, combatDamage: 0.05 }),
    customWeapon("red-horizon-tac", "Red Horizon TAC", "An experimental anti-material rifle with a slow skyline charge.", "Prototype", 6, 90, "sniperRifles", { damage: 82, attackSpeed: 760, accuracy: 18, critChance: 0.16, critDamage: 1.05, armorPenetration: 26, heatModifier: 0.12 }, ["ranged", "sniper", "prototype", "antiArmor", "boss"], ["scope", "barrel", "stock", "batteryCore"], 3, "Skyline Core crafting with prototype weapon and relic components.", "Horizon Shot: rare critical hits ignore most enemy armor.", { combatDamage: 0.09, neuralInstabilityGain: 0.02 }),
    customWeapon("neon-fang", "Neon Fang", "A light cyber-katana made for fast unarmored cuts.", "Epic", 4, 30, "blades", { damage: 25, attackSpeed: -230, accuracy: 5, dodge: 0.06, critChance: 0.15, heatModifier: -0.05 }, ["melee", "katana", "blade", "neon", "stealth"], ["grip", "batteryCore"], 3, "Neon Row rare drop and Redline wire crafting.", "Neon Cut: bonus damage against unarmored gang enemies.", { combatDamage: 0.04 }),
    customWeapon("redline-monowake", "Redline Monowake", "A high-frequency gang blade that leaves a wake in the air.", "Legendary", 5, 64, "blades", { damage: 42, attackSpeed: -210, accuracy: 7, critChance: 0.2, critDamage: 0.45, heatModifier: -0.04 }, ["melee", "katana", "blade", "redline", "bleed"], ["grip", "batteryCore"], 3, "Redline Saints rank reward and Redline Blocks boss drop.", "Wake Slash: chance to apply a bleed-style damage-over-time placeholder.", { skillXp: { combat: 0.06 }, combatDamage: 0.05 }),
    customWeapon("phase-edge", "Phase Edge", "An experimental blade that cuts around armor instead of through it.", "Prototype", 6, 84, "blades", { damage: 52, attackSpeed: -190, accuracy: 8, armorPenetration: 24, dodge: 0.08, critChance: 0.16, neuralInstabilityModifier: 4 }, ["melee", "katana", "blade", "prototype", "stealth"], ["grip", "batteryCore"], 3, "Prototype crafting with Blacknet data and Prototype Neural Core.", "Phase Cut: can ignore enemy armor, adding small Instability on trigger.", { jobSuccessChance: 0.04, neuralInstabilityGain: 0.02 }),
    customWeapon("impact-driver", "Impact Driver", "An industrial hammer repurposed for armor control.", "Epic", 4, 32, "bluntWeapons", { damage: 34, attackSpeed: 310, accuracy: 2, armorPenetration: 14, critChance: 0.06 }, ["melee", "blunt", "industrial", "stun", "armorBreak"], ["grip", "batteryCore"], 3, "Rust Yards enemies and garage vendor special stock.", "Impact Shock: chance to briefly reduce enemy attack speed.", { combatDamage: 0.04 }),
    customWeapon("jackal-maul", "Jackal Maul", "The Chrome Jackals signature hammer, all weight and warning paint.", "Legendary", 5, 60, "bluntWeapons", { damage: 50, attackSpeed: 380, accuracy: 3, armorPenetration: 22, maxHp: 48 }, ["melee", "blunt", "rust", "armored", "mech"], ["grip", "batteryCore"], 3, "Chrome Jackals rank reward and Rust Yards operation boss drop.", "Jackal Crush: bonus damage against armored and mechanical enemies.", { skillXp: { scavenging: 0.04 }, combatDamage: 0.06 }),
    customWeapon("grav-piston-hammer", "Grav-Piston Hammer", "A kinetic piston hammer that feels heavier after impact.", "Prototype", 6, 86, "bluntWeapons", { damage: 66, attackSpeed: 520, accuracy: 2, armorPenetration: 28, neuralInstabilityModifier: 3 }, ["melee", "blunt", "prototype", "boss", "stagger"], ["grip", "batteryCore"], 3, "Prototype crafting with Engine Core, Prototype Drive Unit, and Prototype Weapon Core.", "Gravity Slam: can stagger bosses or heavily reduce armor.", { combatDamage: 0.09, neuralInstabilityGain: 0.02 }),
    customWeapon("railspike-vx", "Railspike VX", "An early charged rifle that loves drones and armor seams.", "Epic", 4, 34, "techWeapons", { damage: 35, attackSpeed: 290, accuracy: 8, armorPenetration: 20, neuralInstabilityModifier: 1 }, ["ranged", "tech", "charged", "drone", "armorPiercing"], ["scope", "barrel", "stock", "batteryCore"], 3, "Glassline and Rust Yards tech drops or smartlink-barrel crafting.", "Charged Spike: charged attacks deal extra damage to armored and drone enemies.", { skillXp: { cyberware: 0.04 }, combatDamage: 0.04 }),
    customWeapon("white-arc-lance", "White Arc Lance", "A clean corporate-grade tech weapon with surgical charge control.", "Legendary", 5, 68, "techWeapons", { damage: 56, attackSpeed: 340, accuracy: 11, armorPenetration: 28, critDamage: 0.35 }, ["ranged", "tech", "charged", "corporate", "operation"], ["scope", "barrel", "stock", "batteryCore"], 3, "Glassline boss drop and Corporate Supplier special stock after requirements.", "Arc Lance: operation bosses take increased damage from charged shots.", { combatDamage: 0.08 }),
    customWeapon("nullbreaker-coilgun", "Nullbreaker Coilgun", "An unstable prototype rail weapon that punches through rules and armor.", "Prototype", 6, 92, "techWeapons", { damage: 76, attackSpeed: 510, accuracy: 10, armorPenetration: 38, critChance: 0.1, neuralInstabilityModifier: 5 }, ["ranged", "tech", "prototype", "armorPiercing", "boss"], ["scope", "barrel", "stock", "batteryCore"], 3, "Blacksite prototype crafting and rare Glassline high-threat operation drop.", "Nullbreak Overcharge: massive armor-piercing shot chance, adding Instability.", { combatDamage: 0.1, neuralInstabilityGain: 0.03 }),
    customWeapon("streetseeker-c9", "Streetseeker C-9", "A basic guided weapon that finds agile targets in neon haze.", "Epic", 4, 32, "smartWeapons", { damage: 27, attackSpeed: -20, accuracy: 17, critChance: 0.09 }, ["ranged", "smart", "guided", "drone"], ["muzzle", "scope", "magazine", "link", "batteryCore"], 3, "Blacknet Quarter vendor and smart weapon enemy drops.", "Street Lock: extra hit chance against agile enemies.", { combatDamage: 0.04 }),
    customWeapon("ghostlink-swarm", "Ghostlink Swarm", "An advanced smart contract weapon with broker-side marking routines.", "Legendary", 5, 62, "smartWeapons", { damage: 43, attackSpeed: -40, accuracy: 21, critChance: 0.17, critDamage: 0.3, heatModifier: -0.03 }, ["ranged", "smart", "contract", "blackmarket", "marked"], ["muzzle", "scope", "magazine", "link", "batteryCore"], 3, "Ghost Market rank reward and Underpass high-risk contracts.", "Swarm Mark: can mark an enemy, increasing crit chance against it.", { jobSuccessChance: 0.05, dropChance: 0.02 }),
    customWeapon("hive-oracle", "Hive Oracle", "A cyberware-linked smart weapon that sees through optic telemetry.", "Prototype", 6, 88, "smartWeapons", { damage: 54, attackSpeed: -60, accuracy: 24, critChance: 0.16, neuralInstabilityModifier: 4 }, ["ranged", "smart", "prototype", "optics", "multiTarget"], ["scope", "magazine", "link", "batteryCore"], 3, "Prototype smart weapon crafting and Blacknet operation rare drop.", "Oracle Link: gains accuracy and crit chance from equipped Optics cyberware tier.", { skillXp: { combat: 0.04 }, combatDamage: 0.08, neuralInstabilityGain: 0.02 }),
  ];
}

function expandedCyberware(): ItemDefinition[] {
  return [
    chrome("basic-reflex-chip", "Basic Reflex Chip", "A starter reflex chip for faster decisions.", "neural", "Common", 1, 1, { actionSpeed: 0.01, combatXp: 0.01 }, 0, ["neural", "reflex"], "Neon Row backroom clinic and basic cyberware craft."),
    chrome("combat-focus-node", "Combat Focus Node", "Filters panic into useful combat motion.", "neural", "Uncommon", 2, 8, { combatDamage: 0.04, combatXp: 0.03 }, 2, ["neural", "combat"], "Redline and Neon Row ripperdoc stock."),
    chrome("neural-accelerator", "Neural Accelerator", "Pushes action loops and mastery training.", "neural", "Rare", 3, 22, { actionSpeed: 0.04, masteryXpGain: 0.04 }, 5, ["neural", "speed"], "Blacknet and Helix recipe source."),
    chrome("reflex-prediction-core", "Reflex Prediction Core", "Predicts incoming hits before muscles commit.", "neural", "Epic", 4, 42, { dodgeChance: 0.04, combatDamage: 0.06 }, 9, ["neural", "reflex", "combat"], "Redline operation and prototype implant craft."),
    chrome("apex-synapse-grid", "Apex Synapse Grid", "Legendary synapse mesh for elite combat tempo.", "neural", "Legendary", 5, 64, { actionSpeed: 0.06, combatDamage: 0.08, masteryXpGain: 0.04 }, 14, ["neural", "legendary"], "Skyline boss and legendary chrome craft."),
    chrome("overclocked-neural-lattice", "Overclocked Neural Lattice", "Prototype neural lattice with dangerous upside.", "neural", "Prototype", 6, 78, { actionSpeed: 0.09, combatDamage: 0.1, neuralInstabilityGain: 0.03 }, 18, ["neural", "prototype", "risk"], "Prototype operation chain."),

    chrome("threat-highlight-lens", "Threat Highlight Lens", "Marks threats earlier in messy fights.", "optics", "Uncommon", 2, 6, { dropChance: 0.01, combatDamage: 0.02 }, 2, ["optics", "scanner"], "Neon Row and Rust Yard clinics."),
    chrome("weakpoint-analyzer", "Weakpoint Analyzer", "Finds armor seams and drone cores.", "optics", "Rare", 3, 18, { dropChance: 0.03, combatDamage: 0.04 }, 5, ["optics", "drone", "armorPiercing"], "Scrap Drone and Glassline craft."),
    chrome("smart-targeting-array", "Smart Targeting Array", "Improves smart weapon tracking and crit setup.", "optics", "Epic", 4, 40, { combatDamage: 0.06, dropChance: 0.03 }, 9, ["optics", "smart"], "Blacknet operation drop."),
    chrome("predictive-vision-core", "Predictive Vision Core", "Prototype optics that anticipate dodges.", "optics", "Prototype", 6, 76, { combatDamage: 0.09, dropChance: 0.05, jobSuccessChance: 0.03 }, 17, ["optics", "prototype"], "Skyline prototype source."),

    chrome("grip-assist-tendons", "Grip Assist Tendons", "Cheap tendon assists for weapons and tools.", "arms", "Common", 1, 1, { skillXp: { cyberware: 0.01 }, combatDamage: 0.01 }, 1, ["arms", "crafting"], "Neon Row cyberware craft."),
    chrome("servo-tendon-array", "Servo Tendon Array", "Servo tendons for melee speed and crafting steadiness.", "arms", "Uncommon", 2, 10, { actionSpeed: 0.02, combatDamage: 0.03 }, 3, ["arms", "melee"], "Boosted thug and Rust chopdoc source."),
    chrome("weapon-handling-actuators", "Weapon Handling Actuators", "Actuators that stabilize recoil and heavy grips.", "arms", "Rare", 3, 24, { combatDamage: 0.05, skillXp: { combat: 0.03 } }, 6, ["arms", "weapon"], "Redline and Rust Yards rare source."),
    chrome("overload-arm-frame", "Overload Arm Frame", "Prototype arm frame with dangerous strength spikes.", "arms", "Prototype", 6, 74, { combatDamage: 0.12, skillRewards: 0.04, neuralInstabilityGain: 0.03 }, 18, ["arms", "prototype"], "Redline prototype operation."),

    chrome("balance-assist", "Balance Assist", "Starter gyros for movement and recovery.", "legs", "Common", 1, 1, { actionSpeed: 0.01 }, 1, ["legs", "movement"], "Rust Yard chopdoc and basic craft."),
    chrome("street-runner-actuators", "Street Runner Actuators", "Street actuators for faster district loops.", "legs", "Uncommon", 2, 10, { actionSpeed: 0.03 }, 3, ["legs", "speed"], "Neon/Rust source."),
    chrome("ghoststep-joint-kit", "Ghoststep Joint Kit", "Quiet joint kit for low-Heat routes.", "legs", "Rare", 3, 24, { actionSpeed: 0.03, heatGain: -0.04, jobSuccessChance: 0.02 }, 6, ["legs", "stealth"], "Underpass market and stealth drop."),
    chrome("phase-step-leg-system", "Phase-Step Leg System", "Prototype leg system that bends route timing.", "legs", "Prototype", 6, 78, { actionSpeed: 0.09, dodgeChance: 0.06, neuralInstabilityGain: 0.02 }, 17, ["legs", "prototype"], "Skyline prototype mobility chain."),

    chrome("dermal-patch-mesh", "Dermal Patch Mesh", "Patch mesh for basic survival.", "skin", "Common", 1, 1, { combatDefense: 0.02, healingReceived: 0.02 }, 1, ["skin", "armor"], "Neon Row clinic."),
    chrome("reinforced-dermal-weave", "Reinforced Dermal Weave", "Affordable skin weave for street fights.", "skin", "Uncommon", 2, 9, { combatDefense: 0.04 }, 3, ["skin", "armor"], "Rust Yard chopdoc."),
    chrome("adaptive-skin-plating", "Adaptive Skin Plating", "Epic skin plating that shifts against incoming impacts.", "skin", "Epic", 4, 44, { combatDefense: 0.08, damageReduction: 0.03 }, 10, ["skin", "plating"], "Helix/Glassline operation source."),
    chrome("reactive-chrome-skin", "Reactive Chrome Skin", "Prototype chrome skin that blooms under fire.", "skin", "Prototype", 6, 80, { combatDefense: 0.12, damageReduction: 0.05, neuralInstabilityGain: 0.02 }, 18, ["skin", "prototype"], "Prototype medical operation source."),

    chrome("bone-brace-kit", "Bone Brace Kit", "Basic skeletal braces for impact survival.", "skeleton", "Common", 1, 1, { combatDefense: 0.01 }, 1, ["skeleton", "bruiser"], "Basic clinic craft."),
    chrome("reinforced-spine-lattice", "Reinforced Spine Lattice", "A reinforced lattice for hauling gear and taking hits.", "skeleton", "Uncommon", 2, 11, { combatDefense: 0.04, skillRewards: 0.01 }, 3, ["skeleton", "carry"], "Rust Yards and Helix source."),
    chrome("load-bearing-frame", "Load-Bearing Frame", "A rare skeletal frame for heavy weapons and armor.", "skeleton", "Rare", 3, 28, { combatDefense: 0.06, combatDamage: 0.03 }, 7, ["skeleton", "heavy"], "Rust Yard lockdown drop."),
    chrome("apex-titanium-frame", "Apex Titanium Frame", "Legendary frame for brutal long fights.", "skeleton", "Legendary", 5, 66, { combatDefense: 0.12, damageReduction: 0.04, combatDamage: 0.05 }, 15, ["skeleton", "legendary"], "Skyline boss source."),

    chrome("streetdeck-os", "Streetdeck OS", "A basic operating system for hacking practice.", "operatingSystem", "Common", 1, 1, { skillXp: { hacking: 0.02 } }, 1, ["os", "hacking"], "Neon Row clinic and crafting."),
    chrome("trace-buffer-os", "Trace Buffer OS", "Buffers trace pressure from simple hacks.", "operatingSystem", "Uncommon", 2, 12, { skillXp: { hacking: 0.04 }, heatGain: -0.02 }, 3, ["os", "trace"], "Blacknet Data Broker."),
    chrome("smartlink-kernel", "Smartlink Kernel", "Kernel tuned for smart weapon handshakes.", "operatingSystem", "Rare", 3, 26, { skillXp: { hacking: 0.04 }, combatDamage: 0.04 }, 7, ["os", "smart"], "Blacknet and Glassline source."),
    chrome("ghostline-command-os", "Ghostline Command OS", "Legendary command OS for automation and Blacknet routes.", "operatingSystem", "Legendary", 5, 68, { skillXp: { hacking: 0.08 }, simCacheEfficiency: 0.06, heatGain: -0.05 }, 15, ["os", "legendary", "blacknet"], "Blacknet/Skyline boss source."),
    chrome("rogue-protocol-kernel", "Rogue Protocol Kernel", "Prototype kernel that trades stability for power.", "operatingSystem", "Prototype", 6, 82, { skillXp: { hacking: 0.1 }, actionSpeed: 0.06, neuralInstabilityGain: 0.04 }, 20, ["os", "prototype", "risk"], "Blacknet relic operation."),

    chrome("basic-med-port", "Basic Med Port", "Utility port for faster field healing.", "utility", "Common", 1, 1, { healingReceived: 0.04 }, 0, ["utility", "medical"], "Neon Row clinic."),
    chrome("salvage-filter", "Salvage Filter", "Utility filter that spots better scrap.", "utility", "Uncommon", 2, 7, { skillRewards: 0.03, skillXp: { scavenging: 0.02 } }, 2, ["utility", "scavenging"], "Rust Yards and Scavenging craft."),
    chrome("auto-injector-link", "Auto-Injector Link", "Links healing items to combat warnings.", "utility", "Rare", 3, 22, { healingReceived: 0.08, jobSuccessChance: 0.02 }, 5, ["utility", "medical"], "Helix Ward clinic."),
    chrome("market-scrubber-chip", "Market Scrubber Chip", "Scrubs bad traces from vendor and market work.", "utility", "Epic", 4, 42, { shopPrices: -0.04, heatGain: -0.05, fixerTrustGain: 0.02 }, 9, ["utility", "market"], "Ghost Market reward."),
    chrome("sim-cache-optimizer", "Sim Cache Optimizer", "Optimizes simulated work and mastery replay.", "utility", "Legendary", 5, 70, { simCacheEfficiency: 0.1, masteryXpGain: 0.06 }, 13, ["utility", "simulation"], "Skyline luxury and Blacknet operation source."),
    chrome("adaptive-utility-core", "Adaptive Utility Core", "Prototype utility core that improves everything a little.", "utility", "Prototype", 6, 86, { skillRewards: 0.06, dropChance: 0.05, simCacheEfficiency: 0.08 }, 18, ["utility", "prototype"], "Endgame prototype crafting chain."),
  ];
}

function gear(id: string, name: string, description: string, slot: GearSlot, rarity: ItemRarity, tier: number, requiredLevel: number, stats: ItemDefinition["stats"], modifiers: ItemDefinition["modifiers"], tags: string[], sourceHint: string): ItemDefinition {
  return { id, name, description, type: "Armor", rarity, tags: ["armor", "equipment", ...tags], stackable: false, sellValue: raritySellValue(rarity, 55, tier), sourceHint, slot, tier, requiredSkill: "combat", requiredLevel, stats, modifiers, maxUpgradeLevel: rarity === "Relic" ? 15 : 10 };
}

function customWeapon(id: string, name: string, description: string, rarity: ItemRarity, tier: number, requiredLevel: number, weaponClass: WeaponClassId, stats: ItemDefinition["stats"], tags: string[], attachmentSlots: AttachmentCategory[], modSlots: number, sourceHint: string, specialEffect?: string, modifiers?: ItemDefinition["modifiers"]): ItemDefinition {
  return { id, name, description, type: "Weapon", rarity, tags: ["weapon", "combat", ...tags], stackable: false, sellValue: raritySellValue(rarity, 70, tier), sourceHint, slot: "weapon", tier, requiredSkill: "combat", requiredLevel, stats, modifiers, specialEffect, maxUpgradeLevel: rarity === "Relic" || rarity === "Prototype" ? 15 : 10, weaponClass, attachmentSlots, modSlots };
}

function chrome(id: string, name: string, description: string, slot: CyberwareSlot, rarity: ItemRarity, tier: number, requiredLevel: number, modifiers: ItemDefinition["modifiers"], instabilityLoad: number, tags: string[], sourceHint: string): ItemDefinition {
  return { id, name, description, type: "Cyberware", rarity, tags: ["cyberware", ...tags], stackable: false, sellValue: raritySellValue(rarity, 125, tier), sourceHint, slot, tier, requiredSkill: "cyberware", requiredLevel, modifiers, instabilityLoad, maxUpgradeLevel: rarity === "Relic" ? 15 : 10 };
}

function raritySellValue(rarity: ItemRarity, base: number, tier: number) {
  const multipliers: Record<ItemRarity, number> = { Common: 1, Uncommon: 1.55, Rare: 2.4, Epic: 4, Legendary: 7, Prototype: 9, Relic: 14 };
  return Math.round(base * tier * multipliers[rarity]);
}
