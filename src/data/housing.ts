import type { ActiveModifiers, HousingOption } from "../types";

export const housingOptions: HousingOption[] = [
  // ===== NEON ROW =====
  {
    id: "capsule-room",
    name: "Capsule Room",
    districtId: "neonRow",
    cost: housingCost("neonRow", 150, 1),
    unlockRequirements: ["Available in Neon Row"],
    passiveBonuses: ["+2% action speed", "Small storage boost", "Basic offline safety"],
    storageBonus: 25,
    offlineCapBonusHours: 1,
    heatDecayBonus: 1,
    neuralRecoveryBonus: 0,
    passiveModifiers: housingPassiveModifiers("capsule-room", { skillRewards: 0.01 }),
  },

  // ===== RUST YARDS =====
  {
    id: "rust-yard-garage",
    name: "Rust Yard Garage",
    districtId: "rustYards",
    cost: housingCost("rustYards", 900, 2, 2),
    unlockRequirements: ["Rust Yards unlocked", "Chrome Jackals reputation 10"],
    passiveBonuses: ["+2% action speed", "Vehicle job speed", "Garage slots"],
    storageBonus: 60,
    offlineCapBonusHours: 2,
    heatDecayBonus: 1,
    neuralRecoveryBonus: 0,
    garageSlots: 2,
    passiveModifiers: housingPassiveModifiers("rust-yard-garage", { skillRewards: 0.05 }),
  },

  // ===== UNDERPASS MARKET =====
  {
    id: "underpass-safehouse",
    name: "Underpass Safehouse",
    districtId: "underpassMarket",
    cost: housingCost("underpassMarket", 1400, 3),
    unlockRequirements: ["Underpass Market unlocked", "Reputation 20"],
    passiveBonuses: ["+2% action speed", "Heat decay", "Protection job access"],
    storageBonus: 80,
    offlineCapBonusHours: 3,
    heatDecayBonus: 3,
    neuralRecoveryBonus: 1,
    passiveModifiers: housingPassiveModifiers("underpass-safehouse", { heatGain: -0.05 }),
  },

  // ===== BLACKNET QUARTER =====
  {
    id: "blacknet-loft",
    name: "Blacknet Loft",
    districtId: "blacknetQuarter",
    cost: housingCost("blacknetQuarter", 2200, 4),
    unlockRequirements: ["Blacknet Quarter unlocked", "Hacking level 10"],
    passiveBonuses: ["+2% action speed", "Hacking bonus", "Longer offline cap"],
    storageBonus: 70,
    offlineCapBonusHours: 4,
    heatDecayBonus: 1,
    neuralRecoveryBonus: 1,
    hackingBonus: 0.05,
    passiveModifiers: housingPassiveModifiers("blacknet-loft", { skillXp: { hacking: 0.05 }, skillRewards: 0.05 }),
  },

  // ===== GLASSLINE DISTRICT =====
  {
    id: "glassline-apartment",
    name: "Glassline Apartment",
    districtId: "glasslineDistrict",
    cost: housingCost("glasslineDistrict", 3500, 5),
    unlockRequirements: ["Glassline District unlocked", "Helix Order reputation 15"],
    passiveBonuses: ["+2% action speed", "Neural recovery", "Crafting bonus"],
    storageBonus: 100,
    offlineCapBonusHours: 5,
    heatDecayBonus: 2,
    neuralRecoveryBonus: 3,
    craftingBonus: 0.05,
    passiveModifiers: housingPassiveModifiers("glassline-apartment", { jobSuccessChance: 0.05, skillXp: { cyberware: 0.05 } }),
  },

  // ===== SKYLINE CORE =====
  {
    id: "skyline-penthouse",
    name: "Skyline Penthouse",
    districtId: "glasslineDistrict",
    cost: housingCost("skylineCore", 25000, 12, 4),
    unlockRequirements: ["Late-game luxury", "Reputation 100"],
    passiveBonuses: ["+2% action speed", "Large storage", "Major offline cap", "Heat decay"],
    storageBonus: 300,
    offlineCapBonusHours: 12,
    heatDecayBonus: 5,
    neuralRecoveryBonus: 4,
    garageSlots: 4,
    passiveModifiers: housingPassiveModifiers("skyline-penthouse", { reputationGained: 0.05, creditsGained: 0.05 }),
  },
  ...makeExpandedHousing(),
];

function makeExpandedHousing(): HousingOption[] {
  return [
  // ===== NEON ROW =====
  house("neon-rooftop-den", "Rooftop Den", "neonRow", 2800, ["Clear Neon Rooftop Chase"], ["Combat staging", "Low Heat routes"], 120, 4, 4, 2),
  house("neon-sleeper-pod", "Sleeper Pod Stack", "neonRow", 320, ["Streetcraft level 2"], ["Cheap heat decay", "Starter stash"], 35, 1, 2, 0),
  house("neon-signmaker-loft", "Signmaker Loft", "neonRow", 780, ["Neon Row standing 10"], ["Scavenging prep", "Better offline cap"], 55, 2, 2, 1),
  house("neon-backroom-safehouse", "Backroom Safehouse", "neonRow", 1600, ["Sable Quinn trust 25"], ["Starter fixer safety", "Heat recovery"], 90, 3, 4, 1),

  // ===== RUST YARDS =====
  house("rust-container-bunk", "Container Bunk", "rustYards", 450, ["Rust Yards unlocked"], ["Vehicle salvage storage"], 70, 1, 1, 0, 1),
  house("rust-fortress-bay", "Scrap Fortress Bay", "rustYards", 7200, ["Clear Warden's Scrap Fortress"], ["Premium garage", "Travel prep"], 260, 6, 3, 1, 4),
  house("rust-chopshop-corner", "Chopshop Corner", "rustYards", 1400, ["Chrome Jackals reputation 15"], ["Garage slots", "Vehicle parts storage"], 110, 3, 1, 0, 2),
  house("rust-hauler-yard", "Hauler Yard", "rustYards", 3200, ["Vehicle Tuning level 15"], ["Large vehicle storage", "Smuggling staging"], 180, 4, 2, 1, 3),

  // ===== UNDERPASS MARKET =====
  house("underpass-curtain-room", "Curtain Room", "underpassMarket", 650, ["Underpass Market unlocked"], ["Contraband cache"], 65, 2, 3, 0),
  house("underpass-smuggler-suite", "Smuggler Suite", "underpassMarket", 4200, ["Smuggling contracts completed"], ["Private buyer prep", "Storage"], 190, 5, 5, 1, 1),
  house("underpass-vault-flat", "Vault Flat", "underpassMarket", 9000, ["Clear Underpass Kingpin"], ["Rare market safety", "Offline cap"], 280, 7, 6, 2, 1),
  house("underpass-ledger-nook", "Ledger Nook", "underpassMarket", 1850, ["Ghost Market reputation 20"], ["Black Market staging", "Heat decay"], 115, 4, 4, 1),

  // ===== BLACKNET QUARTER =====
  house("blacknet-choir-sanctum", "Choir Sanctum", "blacknetQuarter", 13500, ["Clear Deep Static Collapse"], ["Major hacking base", "Neural recovery"], 280, 9, 3, 4),
  house("blacknet-router-cot", "Router Cot", "blacknetQuarter", 900, ["Blacknet Quarter unlocked"], ["Hacking rest node"], 70, 3, 1, 1),
  house("blacknet-signal-loft", "Signal Loft", "blacknetQuarter", 2600, ["Hacking level 20"], ["Blacknet action prep"], 120, 5, 2, 2),
  house("blacknet-dead-drop-flat", "Dead Drop Flat", "blacknetQuarter", 6200, ["Null Choir reputation 25"], ["Trace cleanup", "Encrypted storage"], 190, 6, 3, 2),

  // ===== HELIX WARD =====
  house("helix-observation-bed", "Observation Bed", "helixWard", 700, ["Helix Ward unlocked"], ["Medical recovery"], 60, 2, 1, 3),
  house("helix-private-ward", "Private Ward", "helixWard", 12500, ["Clear Neural Quietus"], ["Major recovery", "Cyberware safety"], 260, 9, 3, 8),
  house("helix-recovery-capsule", "Recovery Capsule", "helixWard", 1900, ["Medical Knowledge level 8"], ["Fast recovery", "Stabilizer access"], 100, 4, 2, 4),
  house("helix-clinic-suite", "Clinic Suite", "helixWard", 5200, ["Helix Order reputation 25"], ["Neural treatment base", "Medical stash"], 170, 6, 2, 6),
  house("helix-surgical-loft", "Surgical Loft", "helixWard", 22000, ["Cyberware Engineering level 60"], ["Premium treatment", "Crafting bonus"], 320, 12, 4, 10),

  // ===== GLASSLINE DISTRICT =====
  house("glassline-corporate-room", "Corporate Room", "glasslineDistrict", 1800, ["Glassline District unlocked"], ["Clean rest", "Vendor access"], 90, 3, 2, 2),
  house("glassline-executive-lease", "Executive Lease", "glasslineDistrict", 11000, ["Corporate Extraction cleared"], ["Corporate discounts", "Offline cap"], 230, 8, 4, 3, 1),
  house("glassline-quiet-apartment", "Quiet Apartment", "glasslineDistrict", 5200, ["Helix Order reputation 20"], ["Crafting prep", "Neural recovery"], 150, 5, 3, 3),
  house("glassline-clean-room-suite", "Clean-Room Suite", "glasslineDistrict", 18000, ["Cyberware Engineering level 45"], ["Cyberware crafting suite", "Recovery"], 300, 10, 4, 5, 1),

  // ===== REDLINE BLOCKS =====
  house("redline-blockhouse", "Blockhouse", "redlineBlocks", 13000, ["Clear Redline Execution"], ["High-risk combat staging"], 300, 7, 3, 3, 1),
  house("redline-crew-bunk", "Crew Bunk", "redlineBlocks", 850, ["Redline Blocks unlocked"], ["Combat staging"], 80, 2, 1, 0),
  house("redline-bounty-room", "Bounty Room", "redlineBlocks", 2300, ["Street Combat level 20"], ["Bounty board prep", "Armor storage"], 130, 4, 2, 1),
  house("redline-arena-flat", "Arena Flat", "redlineBlocks", 5600, ["Redline Saints reputation 25"], ["Combat recovery", "Weapon storage"], 210, 5, 2, 2),
  house("redline-war-room", "War Room", "redlineBlocks", 21000, ["Street Combat level 80"], ["Boss prep", "Bounty logistics"], 380, 10, 4, 4, 1),

  // ===== SKYLINE CORE =====
  house("skyline-orbital-lease", "Orbital Lease", "skylineCore", 85000, ["Clear Skyline Blackout"], ["Endgame prestige", "Massive offline cap"], 650, 18, 8, 8, 5),
  house("skyline-service-suite", "Service Suite", "skylineCore", 6500, ["Skyline Core unlocked"], ["Luxury recovery", "Executive storage"], 160, 5, 4, 3, 1),
  house("skyline-broker-loft", "Broker Loft", "skylineCore", 15000, ["Vale Syn trust 40"], ["Private buyer prep", "Offline cap"], 260, 8, 5, 4, 2),
  house("skyline-executive-penthouse", "Executive Penthouse", "skylineCore", 42000, ["Reputation 1500"], ["Major storage", "Luxury access"], 450, 14, 6, 6, 4),
  ];
}

function house(
  id: string,
  name: string,
  districtId: HousingOption["districtId"],
  cost: number,
  unlockRequirements: string[],
  passiveBonuses: string[],
  storageBonus: number,
  offlineCapBonusHours: number,
  heatDecayBonus: number,
  neuralRecoveryBonus: number,
  garageSlots?: number,
): HousingOption {
  return { id, name, districtId, cost: housingCost(districtId, cost, offlineCapBonusHours, garageSlots), unlockRequirements, passiveBonuses: ["+2% action speed", ...passiveBonuses], storageBonus, offlineCapBonusHours, heatDecayBonus, neuralRecoveryBonus, garageSlots, passiveModifiers: housingPassiveModifiers(id) };
}

function housingCost(districtId: HousingOption["districtId"], baseCost: number, offlineCapBonusHours: number, garageSlots = 0) {
  const districtMultiplier: Record<HousingOption["districtId"], number> = {
    neonRow: 12,
    rustYards: 13,
    underpassMarket: 14,
    blacknetQuarter: 15,
    glasslineDistrict: 16,
    helixWard: 16,
    redlineBlocks: 16,
    skylineCore: 20,
  };
  const utilityMultiplier = 1 + Math.max(0, offlineCapBonusHours - 2) * 0.08 + garageSlots * 0.12;
  return Math.round(baseCost * (districtMultiplier[districtId] ?? 14) * utilityMultiplier);
}

function housingPassiveModifiers(id: string, override?: Partial<ActiveModifiers>): Partial<ActiveModifiers> {
  const base = housingStatModifiers(id);
  const utility =
    override ??
    (id.includes("blacknet") ? { skillXp: { hacking: 0.04 }, heatGain: -0.02 } :
    id.includes("helix") ? { healingReceived: 0.04, neuralInstabilityRecovery: 0.03 } :
    id.includes("rust") ? { skillXp: { vehicleTuning: 0.04 }, jobRewards: 0.03 } :
    id.includes("underpass") ? { shopPrices: -0.03, jobSuccessChance: 0.03 } :
    id.includes("glassline") ? { skillXp: { cyberware: 0.04 }, craftingCostReduction: 0.03 } :
    id.includes("redline") ? { combatDamage: 0.03, combatXp: 0.04 } :
    id.includes("skyline") ? { creditsGained: 0.04, reputationGained: 0.04 } :
    { skillRewards: 0.02 });
  return combineHousingModifiers(base, utility);
}

function housingStatModifiers(id: string): Partial<ActiveModifiers> {
  const tier = housingStatTier(id);
  return {
    combatMaxHp: 0.02 + tier * 0.01,
    combatDefense: 0.01 + tier * 0.005,
    combatDamage: 0.005 + tier * 0.004,
    combatAttackSpeed: 0.003 + tier * 0.003,
  };
}

function housingStatTier(id: string) {
  if (id.includes("orbital") || id.includes("penthouse")) return 8;
  if (id.includes("war-room") || id.includes("surgical") || id.includes("clean-room") || id.includes("sanctum") || id.includes("fortress")) return 7;
  if (id.includes("executive") || id.includes("private") || id.includes("blockhouse") || id.includes("vault")) return 6;
  if (id.includes("suite") || id.includes("hauler") || id.includes("dead-drop") || id.includes("arena")) return 5;
  if (id.includes("loft") || id.includes("safehouse") || id.includes("capsule")) return 4;
  if (id.includes("corner") || id.includes("ledger") || id.includes("signal") || id.includes("bounty")) return 3;
  if (id.includes("pod") || id.includes("bunk") || id.includes("room") || id.includes("cot") || id.includes("bed") || id.includes("garage")) return 2;
  return 1;
}

function combineHousingModifiers(...mods: Array<Partial<ActiveModifiers>>): Partial<ActiveModifiers> {
  return mods.reduce<Partial<ActiveModifiers>>((total, mod) => {
    Object.entries(mod.skillXp ?? {}).forEach(([skill, value]) => {
      total.skillXp = total.skillXp ?? {};
      total.skillXp[skill as keyof NonNullable<Partial<ActiveModifiers>["skillXp"]>] = (total.skillXp[skill as keyof NonNullable<Partial<ActiveModifiers>["skillXp"]>] ?? 0) + (value ?? 0);
    });
    Object.entries(mod).forEach(([key, value]) => {
      if (key === "skillXp" || typeof value !== "number") return;
      const typedKey = key as keyof ActiveModifiers;
      const current = total[typedKey];
      if (typeof current === "number" || current === undefined) {
        (total as Record<string, number>)[key] = (typeof current === "number" ? current : 0) + value;
      }
    });
    return total;
  }, {});
}
