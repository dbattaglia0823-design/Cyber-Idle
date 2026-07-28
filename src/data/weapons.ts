import type { DistrictId, ItemRarity, ItemStats } from "../types";

export type WeaponClass = "Pistol" | "SMG" | "Rifle" | "Shotgun" | "Melee";

export interface WeaponSpec {
  id: string;
  name: string;
  description: string;
  weaponClass: WeaponClass;
  rarity: ItemRarity;
  tier: number;
  requiredLevel: number;
  districtId: DistrictId;
  stats: ItemStats;
  inputCosts: Record<string, number>;
}

// Weapon damage is additive with the player's level-scaled base damage. Faster weapons
// trade raw damage for negative attackSpeed; heavy weapons trade speed/accuracy for damage.
export const weaponSpecs: WeaponSpec[] = [
  // Common — Neon Row, combat/crafting levels 1–6.
  w("zip-pistol", "Zip Pistol", "A disposable alley pistol built from stamped scrap.", "Pistol", "Common", 1, 1, "neonRow", { damage: 4, accuracy: 3 }, { scrap: 7, circuitBoards: 1 }),
  w("vendor-nine", "Vendor Nine", "A dependable pawn-counter sidearm with clean sights.", "Pistol", "Common", 1, 3, "neonRow", { damage: 5, accuracy: 4 }, { scrap: 9, circuitBoards: 1 }),
  w("copperhead-revolver", "Copperhead Revolver", "A slow hand cannon chambered for reclaimed rounds.", "Pistol", "Common", 1, 6, "neonRow", { damage: 8, attackSpeed: 120, accuracy: 1 }, { scrap: 12, circuitBoards: 1 }),
  w("rattle-smg", "Rattle SMG", "A compact automatic that shakes harder than it should.", "SMG", "Common", 1, 1, "neonRow", { damage: 3, attackSpeed: -130, accuracy: -1 }, { scrap: 8, circuitBoards: 1 }),
  w("metro-sweeper", "Metro Sweeper", "A station-gang spray gun made for crowded corridors.", "SMG", "Common", 1, 3, "neonRow", { damage: 4, attackSpeed: -150 }, { scrap: 10, circuitBoards: 2 }),
  w("neon-hail", "Neon Hail", "A bright, fast machine pistol with a reinforced feed.", "SMG", "Common", 1, 6, "neonRow", { damage: 5, attackSpeed: -170, critChance: 0.01 }, { scrap: 13, circuitBoards: 2 }),
  w("pipe-rifle", "Pipe Rifle", "A long barrel, a crude stock, and surprising reach.", "Rifle", "Common", 1, 1, "neonRow", { damage: 6, attackSpeed: 70, accuracy: 4 }, { scrap: 9, circuitBoards: 1 }),
  w("alley-carbine", "Alley Carbine", "A light carbine assembled for rooftop lookouts.", "Rifle", "Common", 1, 3, "neonRow", { damage: 6, accuracy: 5 }, { scrap: 11, circuitBoards: 2 }),
  w("watchman-rifle", "Watchman Rifle", "A patient shooter's rifle with a salvaged optic rail.", "Rifle", "Common", 1, 6, "neonRow", { damage: 8, attackSpeed: 80, accuracy: 7, critChance: 0.01 }, { scrap: 14, circuitBoards: 2 }),
  w("breach-pipe", "Breach Pipe", "A single-shot scattergun for locks and close problems.", "Shotgun", "Common", 1, 1, "neonRow", { damage: 8, attackSpeed: 180, accuracy: -3 }, { scrap: 10 }),
  w("stoop-sweeper", "Stoop Sweeper", "A cut-down shotgun common behind Neon Row counters.", "Shotgun", "Common", 1, 3, "neonRow", { damage: 9, attackSpeed: 160, accuracy: -2 }, { scrap: 12, circuitBoards: 1 }),
  w("scrap-breacher", "Scrap Breacher", "A reinforced pump gun that turns salvage into recoil.", "Shotgun", "Common", 1, 6, "neonRow", { damage: 11, attackSpeed: 190, accuracy: -2 }, { scrap: 16, circuitBoards: 1 }),
  w("chain-club", "Chain Club", "A length of drive chain wrapped around a steel core.", "Melee", "Common", 1, 1, "neonRow", { damage: 5, attackSpeed: -60 }, { scrap: 6 }),
  w("razor-machete", "Razor Machete", "A sharpened panel cutter balanced for street work.", "Melee", "Common", 1, 3, "neonRow", { damage: 6, attackSpeed: -80, critChance: 0.02 }, { scrap: 8 }),
  w("street-shock-baton", "Street Shock Baton", "A security baton with one live capacitor remaining.", "Melee", "Common", 1, 6, "neonRow", { damage: 7, attackSpeed: -90, accuracy: 2 }, { scrap: 9, circuitBoards: 2 }),

  // Uncommon — Rust Yards and Underpass Market, levels 10–15.
  w("jackal-sidearm", "Jackal Sidearm", "A chop-shop pistol rebuilt around a vehicle-grade action.", "Pistol", "Uncommon", 2, 10, "rustYards", { damage: 11, accuracy: 6, critChance: 0.02 }, { scrap: 18, circuitBoards: 3, vehicleParts: 2 }),
  w("market-enforcer", "Market Enforcer", "A discreet heavy pistol favored by Underpass collectors.", "Pistol", "Uncommon", 2, 15, "underpassMarket", { damage: 14, attackSpeed: 60, accuracy: 5, critChance: 0.03 }, { scrap: 20, circuitBoards: 4, encryptedData: 4 }),
  w("yard-dog-smg", "Yard Dog SMG", "A sealed automatic built to survive metal dust and bad fuel.", "SMG", "Uncommon", 2, 10, "rustYards", { damage: 8, attackSpeed: -210, accuracy: 1 }, { scrap: 20, circuitBoards: 4, vehicleParts: 2 }),
  w("underpass-viper", "Underpass Viper", "A suppressed market SMG with an illegally tuned bolt.", "SMG", "Uncommon", 2, 15, "underpassMarket", { damage: 10, attackSpeed: -230, accuracy: 2, critChance: 0.02 }, { scrap: 22, circuitBoards: 5, encryptedData: 5 }),
  w("hauler-carbine", "Hauler Carbine", "A durable rifle built from cargo-rig structural parts.", "Rifle", "Uncommon", 2, 10, "rustYards", { damage: 13, accuracy: 7 }, { scrap: 22, circuitBoards: 4, vehicleParts: 3 }),
  w("contraband-lancer", "Contraband Lancer", "A smuggled marksman's rifle with scrubbed serials.", "Rifle", "Uncommon", 2, 15, "underpassMarket", { damage: 16, attackSpeed: 70, accuracy: 9, critChance: 0.03 }, { scrap: 24, circuitBoards: 5, encryptedData: 6 }),
  w("yardbreaker", "Yardbreaker", "A brutal scattergun made to punch through vehicle panels.", "Shotgun", "Uncommon", 2, 10, "rustYards", { damage: 17, attackSpeed: 190, accuracy: -2 }, { scrap: 25, vehicleParts: 3, armorPlating: 1 }),
  w("tollkeeper", "Tollkeeper", "The preferred answer to unpaid Underpass protection fees.", "Shotgun", "Uncommon", 2, 15, "underpassMarket", { damage: 20, attackSpeed: 170, accuracy: -1, critChance: 0.02 }, { scrap: 27, circuitBoards: 3, encryptedData: 5 }),
  w("jackal-wrenchblade", "Jackal Wrenchblade", "A heavy yard tool ground into a hooked fighting blade.", "Melee", "Uncommon", 2, 10, "rustYards", { damage: 12, attackSpeed: -120, armor: 1 }, { scrap: 16, vehicleParts: 3 }),
  w("silk-wire", "Silk Wire", "A near-invisible monowire rig sold beneath the market.", "Melee", "Uncommon", 2, 15, "underpassMarket", { damage: 13, attackSpeed: -180, critChance: 0.05 }, { scrap: 14, circuitBoards: 4, cyberwareParts: 3 }),

  // Rare — Blacknet Quarter and Helix Ward, levels 20–25.
  w("cipher-pistol", "Cipher Pistol", "A smart sidearm fed by Blacknet targeting predictions.", "Pistol", "Rare", 3, 20, "blacknetQuarter", { damage: 20, accuracy: 10, critChance: 0.04 }, { scrap: 30, circuitBoards: 8, encryptedData: 12, "blacknet-cipher": 1 }),
  w("helix-mender", "Helix Mender", "A surgical defense pistol with immaculate recoil control.", "Pistol", "Rare", 3, 25, "helixWard", { damage: 23, accuracy: 12, critChance: 0.05, maxHp: 6 }, { scrap: 28, circuitBoards: 8, cyberwareParts: 8, "medical-gel": 3 }),
  w("daemon-swarm", "Daemon Swarm", "A network-linked SMG that corrects its burst in real time.", "SMG", "Rare", 3, 20, "blacknetQuarter", { damage: 15, attackSpeed: -280, accuracy: 4, critChance: 0.03 }, { scrap: 32, circuitBoards: 10, encryptedData: 14, "blacknet-cipher": 1 }),
  w("sterile-vector", "Sterile Vector", "A clinic-security SMG with biofeedback stabilization.", "SMG", "Rare", 3, 25, "helixWard", { damage: 17, attackSpeed: -300, accuracy: 6, maxHp: 5 }, { scrap: 30, circuitBoards: 10, cyberwareParts: 10, "medical-gel": 4 }),
  w("null-choir-rifle", "Null Choir Rifle", "A predictive rifle that whispers corrections through an optic link.", "Rifle", "Rare", 3, 20, "blacknetQuarter", { damage: 24, accuracy: 13, critChance: 0.05 }, { scrap: 34, circuitBoards: 10, encryptedData: 16, "blacknet-cipher": 1 }),
  w("helix-pulse-rifle", "Helix Pulse Rifle", "A clean-room rifle calibrated to anatomical weak points.", "Rifle", "Rare", 3, 25, "helixWard", { damage: 27, attackSpeed: 40, accuracy: 14, critChance: 0.06 }, { scrap: 34, circuitBoards: 10, cyberwareParts: 12, "medical-gel": 4 }),
  w("packet-loss", "Packet Loss", "A Blacknet scattergun that scrambles nearby targeting feeds.", "Shotgun", "Rare", 3, 20, "blacknetQuarter", { damage: 29, attackSpeed: 170, accuracy: 1, dodge: 0.02 }, { scrap: 38, circuitBoards: 8, encryptedData: 15, "blacknet-cipher": 1 }),
  w("trauma-response", "Trauma Response", "A clinic breacher designed to end emergencies immediately.", "Shotgun", "Rare", 3, 25, "helixWard", { damage: 33, attackSpeed: 190, accuracy: 2, maxHp: 8 }, { scrap: 38, armorPlating: 3, cyberwareParts: 10, "medical-gel": 5 }),
  w("logic-edge", "Logic Edge", "A vibrating blade driven by a stolen Blacknet processor.", "Melee", "Rare", 3, 20, "blacknetQuarter", { damage: 22, attackSpeed: -220, critChance: 0.07 }, { scrap: 24, circuitBoards: 9, encryptedData: 12, "blacknet-cipher": 1 }),
  w("helix-bonesaw", "Helix Bonesaw", "A repurposed surgical cutter with adaptive resistance sensing.", "Melee", "Rare", 3, 25, "helixWard", { damage: 25, attackSpeed: -240, critChance: 0.06, maxHp: 5 }, { scrap: 25, cyberwareParts: 12, "medical-gel": 5 }),

  // Epic — Glassline District and Redline Blocks, levels 30–40.
  w("glassline-executive", "Glassline Executive", "A corporate sidearm whose authorization costs more than most homes.", "Pistol", "Epic", 4, 30, "glasslineDistrict", { damage: 33, accuracy: 16, critChance: 0.07 }, { scrap: 42, circuitBoards: 14, cyberwareParts: 12, "corporate-access-token": 1 }),
  w("saintmaker", "Saintmaker", "A Redline dueling pistol earned through blood and reputation.", "Pistol", "Epic", 4, 40, "redlineBlocks", { damage: 38, accuracy: 14, critChance: 0.1, critDamage: 0.2 }, { scrap: 48, circuitBoards: 12, armorPlating: 4, "bounty-token": 2 }),
  w("glassline-needle", "Glassline Needle", "A premium compact weapon with corporate-grade burst logic.", "SMG", "Epic", 4, 30, "glasslineDistrict", { damage: 25, attackSpeed: -340, accuracy: 8, critChance: 0.05 }, { scrap: 44, circuitBoards: 16, encryptedData: 18, "corporate-access-token": 1 }),
  w("redline-tempest", "Redline Tempest", "A championship SMG tuned to outrun its own muzzle flash.", "SMG", "Epic", 4, 40, "redlineBlocks", { damage: 29, attackSpeed: -370, accuracy: 7, critChance: 0.08 }, { scrap: 50, circuitBoards: 15, armorPlating: 3, "bounty-token": 2 }),
  w("corporate-verdict", "Corporate Verdict", "A precision rifle issued when negotiation has already failed.", "Rifle", "Epic", 4, 30, "glasslineDistrict", { damage: 40, accuracy: 18, critChance: 0.08 }, { scrap: 48, circuitBoards: 16, encryptedData: 20, "corporate-access-token": 1 }),
  w("redline-dominion", "Redline Dominion", "A ranked battle rifle carrying the marks of a dozen challengers.", "Rifle", "Epic", 4, 40, "redlineBlocks", { damage: 46, attackSpeed: 40, accuracy: 16, critChance: 0.1 }, { scrap: 54, circuitBoards: 15, armorPlating: 4, "bounty-token": 2 }),
  w("hostile-takeover", "Hostile Takeover", "A corporate breaching system disguised as a luxury shotgun.", "Shotgun", "Epic", 4, 30, "glasslineDistrict", { damage: 49, attackSpeed: 170, accuracy: 4, armor: 2 }, { scrap: 55, circuitBoards: 12, armorPlating: 5, "corporate-access-token": 1 }),
  w("redline-riot", "Redline Riot", "A crew-forged automatic shotgun built for title fights.", "Shotgun", "Epic", 4, 40, "redlineBlocks", { damage: 56, attackSpeed: 190, accuracy: 3, critChance: 0.07 }, { scrap: 60, circuitBoards: 14, armorPlating: 6, "bounty-token": 2 }),
  w("golden-parachute", "Golden Parachute", "A mono-katana carried by executives expecting a difficult exit.", "Melee", "Epic", 4, 30, "glasslineDistrict", { damage: 37, attackSpeed: -280, critChance: 0.11, dodge: 0.03 }, { scrap: 36, circuitBoards: 14, cyberwareParts: 14, "corporate-access-token": 1 }),
  w("redline-crown", "Redline Crown", "A thermal greatblade reserved for proven Saints champions.", "Melee", "Epic", 4, 40, "redlineBlocks", { damage: 43, attackSpeed: -260, critChance: 0.13, armor: 2 }, { scrap: 42, cyberwareParts: 16, armorPlating: 4, "bounty-token": 2 }),

  // Legendary — Skyline Core, level 50.
  w("last-word-protocol", "Last Word Protocol", "A unique executive pistol that chooses the decisive shot.", "Pistol", "Legendary", 5, 50, "skylineCore", { damage: 55, accuracy: 22, critChance: 0.14, critDamage: 0.35 }, { scrap: 75, circuitBoards: 24, encryptedData: 30, "prototype-neural-core": 1, "boss-data-key": 1 }),
  w("city-of-static", "City of Static", "A prototype SMG that turns Skyline telemetry into a storm of lead.", "SMG", "Legendary", 5, 50, "skylineCore", { damage: 42, attackSpeed: -430, accuracy: 12, critChance: 0.1 }, { scrap: 80, circuitBoards: 28, encryptedData: 35, "prototype-neural-core": 1, "boss-data-key": 1 }),
  w("skyline-zero", "Skyline Zero", "A peerless rifle built to erase targets across the city haze.", "Rifle", "Legendary", 5, 50, "skylineCore", { damage: 66, accuracy: 24, critChance: 0.15, critDamage: 0.4 }, { scrap: 85, circuitBoards: 26, encryptedData: 32, "prototype-neural-core": 1, "boss-data-key": 1 }),
  w("event-horizon", "Event Horizon", "A prototype gravitic shotgun whose recoil arrives after the target falls.", "Shotgun", "Legendary", 5, 50, "skylineCore", { damage: 82, attackSpeed: 160, accuracy: 6, critChance: 0.1, armor: 3 }, { scrap: 90, circuitBoards: 22, armorPlating: 10, "prototype-neural-core": 1, "boss-data-key": 1 }),
  w("neon-eclipse", "Neon Eclipse", "A singular mono-edge forged from the city's rarest stolen technology.", "Melee", "Legendary", 5, 50, "skylineCore", { damage: 62, attackSpeed: -330, critChance: 0.18, critDamage: 0.45, dodge: 0.04 }, { scrap: 65, cyberwareParts: 24, "stabilized-chrome-frame": 1, "prototype-neural-core": 1, "boss-data-key": 1 }),
];

function w(
  id: string,
  name: string,
  description: string,
  weaponClass: WeaponClass,
  rarity: ItemRarity,
  tier: number,
  requiredLevel: number,
  districtId: DistrictId,
  stats: ItemStats,
  _inputCosts: Record<string, number>,
): WeaponSpec {
  return {
    id,
    name,
    description,
    weaponClass,
    rarity,
    tier,
    requiredLevel: progressionLevel(districtId, requiredLevel),
    districtId,
    stats: modernWeaponStats(weaponClass, stats, tier),
    inputCosts: weaponCosts(districtId, weaponClass),
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

function modernWeaponStats(weaponClass: WeaponClass, stats: ItemStats, tier: number): ItemStats {
  if (weaponClass === "Pistol") return { ...stats, critChance: Math.max(stats.critChance ?? 0, 0.02 * tier), heatModifier: -0.01 * tier };
  if (weaponClass === "SMG") return { ...stats, dodge: 0.01 * tier, heatModifier: 0.02 * tier };
  if (weaponClass === "Rifle") return { ...stats, armorPenetration: 2 * tier };
  if (weaponClass === "Shotgun") return { ...stats, armorPenetration: 3 * tier, heatModifier: 0.025 * tier };
  return { ...stats, critChance: Math.max(stats.critChance ?? 0, 0.025 * tier), heatModifier: -0.02 * tier };
}

function weaponCosts(districtId: DistrictId, weaponClass: WeaponClass): Record<string, number> {
  const classPart = weaponClass === "Melee" ? "grip-polymer" : weaponClass === "Rifle" || weaponClass === "Shotgun" ? "barrel-assembly" : "precision-parts";
  const districtParts: Record<DistrictId, Record<string, number>> = {
    neonRow: { "weapon-frame": 1, "street-coil": 1 },
    rustYards: { "weapon-frame": 1, "salvaged-servo": 1, "rust-plated-frame": 1 },
    underpassMarket: { "weapon-frame": 1, "contraband-chip": 1, "illegal-mod-core": 1 },
    blacknetQuarter: { "weapon-frame": 1, "rogue-packet-core": 1, "trace-scrambler-chip": 1 },
    helixWard: { "weapon-frame": 1, "bioware-thread": 1, "stabilizer-compound": 1 },
    glasslineDistrict: { "weapon-frame": 1, "glassline-alloy": 1, "executive-processor": 1 },
    redlineBlocks: { "weapon-frame": 1, "ballistic-core": 1, "redline-trigger-kit": 1 },
    skylineCore: { "prototype-weapon-core": 1, "luxury-processor": 1, "skyline-authorization": 1 },
  };
  return { ...districtParts[districtId], [classPart]: 1 };
}
