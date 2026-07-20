import type { DistrictId, FactionId, JobContract, SkillId } from "../types";

export const jobs: JobContract[] = [
  // ===== NEON ROW =====
  {
    id: "job-back-alley-pickup",
    name: "Back Alley Pickup",
    fixerId: "sable-quinn-fixer",
    districtId: "neonRow",
    factionId: "ghostMarket",
    tags: ["job", "street", "illegal", "blackmarket"],
    description: "Move a sealed package through Neon Row without asking what hums inside.",
    durationMs: 18000,
    requirements: ["Neon Row unlocked"],
    baseSuccessChance: 0.92,
    heatChange: 2,
    rewards: { credits: 45, reputation: 2 },
    factionReputation: { ghostMarket: 4 },
    companionRelationship: { "sable-quinn": 2 },
    fixerTrustReward: 5,
    rareReward: "ghost-market-token",
    repeatable: true,
    autoRepeatTrustReq: 20,
  },
  {
    id: "job-data-leak-sale",
    name: "Data Leak Sale",
    fixerId: "sable-quinn-fixer",
    districtId: "neonRow",
    factionId: "ghostMarket",
    tags: ["job", "illegal", "hacking", "blackmarket", "faction-conflict"],
    description: "Package stolen kiosk records for a Ghost Market buyer.",
    durationMs: 28000,
    requirements: ["Hacking level 10"],
    baseSuccessChance: 0.82,
    heatChange: 5,
    neuralInstabilityChange: 1,
    rewards: { credits: 155, encryptedData: 8, reputation: 5 },
    skillXp: { hacking: 38 },
    factionReputation: { ghostMarket: 8, nullChoir: -1 },
    companionRelationship: { "sable-quinn": 4 },
    fixerTrustReward: 11,
    rareReward: "data-job-pass",
    repeatable: true,
    autoRepeatTrustReq: 30,
    factionConflict: true,
  },
  {
    id: "job-smuggled-axle",
    name: "Smuggled Axle",
    fixerId: "dex-riven-fixer",
    districtId: "rustYards",
    factionId: "chromeJackals",
    tags: ["job", "vehicle", "smuggling", "faction-conflict"],
    description: "Run a hot axle past clinic scanners before Helix auditors notice.",
    durationMs: 36000,
    requirements: ["Chrome Jackals rank 2"],
    baseSuccessChance: 0.78,
    heatChange: 4,
    rewards: { credits: 140, scrap: 10, reputation: 4 },
    factionReputation: { chromeJackals: 9, helixOrder: -2 },
    companionRelationship: { "dex-riven": 4 },
    fixerTrustReward: 12,
    rareReward: "armorPlating",
    repeatable: true,
    autoRepeatTrustReq: 40,
    factionConflict: true,
  },
  {
    id: "job-junkyard-sweep",
    name: "Junkyard Sweep",
    fixerId: "dex-riven-fixer",
    districtId: "rustYards",
    factionId: "chromeJackals",
    tags: ["job", "scavenging", "vehicle", "smuggling"],
    description: "Clear a salvage lane and mark usable vehicle husks for the Jackals.",
    durationMs: 26000,
    requirements: ["Rust Yards unlocked", "Scavenging level 20"],
    baseSuccessChance: 0.88,
    heatChange: 1,
    rewards: { credits: 75, scrap: 8, circuitBoards: 2 },
    skillXp: { scavenging: 35 },
    factionReputation: { chromeJackals: 6 },
    companionRelationship: { "dex-riven": 3 },
    fixerTrustReward: 8,
    rareReward: "rust-access-key",
    repeatable: true,
    autoRepeatTrustReq: 25,
  },
  {
    id: "job-debt-collection",
    name: "Debt Collection",
    fixerId: "mara-voss-fixer",
    districtId: "underpassMarket",
    factionId: "redlineSaints",
    tags: ["job", "combat", "street", "faction-conflict"],
    description: "Lean on a debtor who thinks Neon Row forgot their name.",
    durationMs: 32000,
    requirements: ["Underpass Market unlocked", "Street Combat level 40"],
    baseSuccessChance: 0.8,
    heatChange: 4,
    rewards: { credits: 120, reputation: 6 },
    skillXp: { combat: 40 },
    factionReputation: { redlineSaints: 8, chromeJackals: -1 },
    companionRelationship: { "mara-voss": 3 },
    fixerTrustReward: 10,
    rareReward: "bounty-token",
    repeatable: true,
    autoRepeatTrustReq: 35,
    factionConflict: true,
  },
  {
    id: "job-terminal-ghost",
    name: "Terminal Ghost",
    fixerId: "nyra-vale-fixer",
    districtId: "blacknetQuarter",
    factionId: "nullChoir",
    tags: ["job", "hacking", "illegal", "faction-conflict"],
    description: "Haunt an abandoned terminal long enough to pull a Null Choir route map.",
    durationMs: 34000,
    requirements: ["Blacknet Quarter unlocked", "Hacking level 60"],
    baseSuccessChance: 0.78,
    heatChange: 5,
    neuralInstabilityChange: 2,
    rewards: { credits: 240, encryptedData: 18, reputation: 7 },
    skillXp: { hacking: 70 },
    factionReputation: { nullChoir: 12, ghostMarket: -1 },
    companionRelationship: { "nyra-vale": 4 },
    fixerTrustReward: 16,
    rareReward: "blacknet-cipher",
    repeatable: true,
    autoRepeatTrustReq: 35,
    factionConflict: true,
  },
  {
    id: "job-clinic-triage",
    name: "Clinic Triage",
    fixerId: "iris-kade-fixer",
    districtId: "helixWard",
    factionId: "helixOrder",
    tags: ["job", "medical", "cyberware", "safe"],
    description: "Assist a Helix recovery shift and stabilize runners before their chrome rejects.",
    durationMs: 38000,
    requirements: ["Helix Ward unlocked", "Cyberware level 80"],
    baseSuccessChance: 0.9,
    heatChange: -1,
    neuralInstabilityChange: -4,
    rewards: { credits: 130, cyberwareParts: 4, reputation: 3 },
    skillXp: { cyberware: 55 },
    factionReputation: { helixOrder: 9 },
    companionRelationship: { "iris-kade": 4 },
    fixerTrustReward: 12,
    rareReward: "medical-gel",
    repeatable: true,
    autoRepeatTrustReq: 35,
  },
  {
    id: "job-stabilizer-run",
    name: "Stabilizer Run",
    fixerId: "iris-kade-fixer",
    districtId: "glasslineDistrict",
    factionId: "helixOrder",
    tags: ["job", "medical", "corporate"],
    description: "Deliver clean stabilizer cartridges before their cold-chain tags expire.",
    durationMs: 30000,
    requirements: ["Helix Order contact"],
    baseSuccessChance: 0.86,
    heatChange: 1,
    neuralInstabilityChange: -3,
    rewards: { credits: 85, cyberwareParts: 3, reputation: 2 },
    skillXp: { cyberware: 30 },
    factionReputation: { helixOrder: 7 },
    companionRelationship: { "iris-kade": 3 },
    fixerTrustReward: 9,
    rareReward: "neural-stabilizer-compound",
    repeatable: true,
    autoRepeatTrustReq: 25,
  },
  {
    id: "job-corporate-cleanup",
    name: "Corporate Cleanup",
    fixerId: "iris-kade-fixer",
    districtId: "glasslineDistrict",
    factionId: "helixOrder",
    tags: ["job", "corporate", "hacking"],
    description: "Scrub a Glassline incident report before auditors connect it to a clinic sponsor.",
    durationMs: 44000,
    requirements: ["Glassline District unlocked", "Hacking level 100"],
    baseSuccessChance: 0.76,
    heatChange: 7,
    neuralInstabilityChange: 1,
    rewards: { credits: 900, encryptedData: 24, reputation: 12 },
    skillXp: { hacking: 110 },
    factionReputation: { helixOrder: 12, ghostMarket: 4 },
    companionRelationship: { "iris-kade": 3 },
    fixerTrustReward: 20,
    rareReward: "corporate-access-token",
    repeatable: true,
    autoRepeatTrustReq: 45,
  },
  {
    id: "job-redline-bounty",
    name: "Redline Bounty",
    fixerId: "mara-voss-fixer",
    districtId: "redlineBlocks",
    factionId: "redlineSaints",
    tags: ["job", "combat", "bounty", "street"],
    description: "Track a crew deserter through Redline territory and bring back the board marker.",
    durationMs: 42000,
    requirements: ["Redline Blocks unlocked", "Street Combat level 120"],
    baseSuccessChance: 0.78,
    heatChange: 6,
    neuralInstabilityChange: 2,
    rewards: { credits: 620, reputation: 18, cyberwareParts: 8 },
    skillXp: { combat: 120 },
    factionReputation: { redlineSaints: 16 },
    companionRelationship: { "mara-voss": 5 },
    fixerTrustReward: 22,
    rareReward: "bounty-token",
    repeatable: true,
    autoRepeatTrustReq: 45,
  },
  {
    id: "job-skyline-permit-burn",
    name: "Skyline Permit Burn",
    fixerId: "vale-syn-fixer",
    districtId: "skylineCore",
    factionId: "ghostMarket",
    tags: ["job", "elite", "corporate", "blackmarket"],
    description: "Move an executive permit through luxury channels, then burn every receipt.",
    durationMs: 60000,
    requirements: ["Skyline Core unlocked", "Reputation 1000"],
    baseSuccessChance: 0.72,
    heatChange: 10,
    neuralInstabilityChange: 2,
    rewards: { credits: 2200, reputation: 32, encryptedData: 40 },
    skillXp: { hacking: 130, combat: 90 },
    factionReputation: { ghostMarket: 18, helixOrder: 8 },
    fixerTrustReward: 34,
    rareReward: "district-permit",
    repeatable: true,
    autoRepeatTrustReq: 60,
  },
  ...makeExpandedJobs(),
];

function makeExpandedJobs(): JobContract[] {
  return [
  // ===== NEON ROW =====
  contract("job-neon-food-cart-shield", "Food Cart Shield", "neonRow", 1, "streetcraft", "Protection", ["job", "protection", "street"], { credits: 65, reputation: 2 }),
  contract("job-neon-sign-bridge-cache", "Sign Bridge Cache", "neonRow", 10, "scavenging", "Vehicle Recovery", ["job", "scavenging", "street"], { credits: 110, scrap: 8, circuitBoards: 2 }),
  returnContract("job-return-neon-street-coils", "Recover Street Coils", "neonRow", 10, "scavenging", { credits: 260, scrap: 30, reputation: 7 }, "street-coil"),
  returnContract("job-return-neon-hardened-clear", "Hardened Street Clear", "neonRow", 15, "combat", { credits: 420, reputation: 12, cyberwareParts: 4 }, "urban-reflex-chip"),
  contract("job-neon-crew-blackmail", "Crew Blackmail Packet", "neonRow", 20, "hacking", "Data Theft", ["job", "hacking", "blackmarket"], { credits: 190, encryptedData: 6, reputation: 5 }, "data-job-pass"),
  returnContract("job-return-neon-cache-loop", "Alley Cache Loop", "neonRow", 20, "streetcraft", { credits: 620, circuitBoards: 10, reputation: 16 }, "neon-circuit-fragment"),

  // ===== RUST YARDS =====
  returnContract("job-return-rust-servo-order", "Servo Order", "rustYards", 15, "scavenging", { credits: 360, vehicleParts: 16, scrap: 25 }, "salvaged-servo"),
  contract("job-rust-hauler-mark", "Hauler Mark", "rustYards", 20, "vehicleTuning", "Courier", ["job", "vehicle", "courier"], { credits: 120, vehicleParts: 6 }),
  contract("job-rust-plate-recovery", "Plate Recovery", "rustYards", 30, "scavenging", "Vehicle Recovery", ["job", "salvage", "vehicle"], { credits: 190, armorPlating: 2, scrap: 14 }, "armorPlating"),
  contract("job-rust-convoy-ghost", "Convoy Ghost", "rustYards", 40, "vehicleTuning", "Smuggling", ["job", "vehicle", "smuggling"], { credits: 330, vehicleParts: 14, reputation: 6 }, "smugglerCompartment"),

  // ===== UNDERPASS MARKET =====
  returnContract("job-return-underpass-ledger-debt", "Ledger Debt Loop", "underpassMarket", 15, "blackMarket", { credits: 480, encryptedData: 12, reputation: 10 }, "black-ledger-shard"),
  contract("job-underpass-buyer-screen", "Buyer Screen", "underpassMarket", 40, "blackMarket", "Cleanup", ["job", "blackmarket", "social"], { credits: 165, reputation: 4 }),
  contract("job-underpass-stall-sabotage", "Stall Sabotage", "underpassMarket", 50, "streetcraft", "Sabotage", ["job", "illegal", "sabotage"], { credits: 250, scrap: 10, reputation: 6 }, "market-pass"),
  contract("job-underpass-cold-courier", "Cold Courier", "underpassMarket", 60, "vehicleTuning", "Smuggling", ["job", "smuggling", "medical"], { credits: 420, cyberwareParts: 3, reputation: 8 }, "private-buyer-contact"),
  contract("job-underpass-private-bid", "Private Bid", "underpassMarket", 60, "blackMarket", "Smuggling", ["job", "blackmarket", "rare"], { credits: 720, encryptedData: 10, reputation: 10 }, "rare-listing-permit"),

  // ===== BLACKNET QUARTER =====
  contract("job-blacknet-packet-launder", "Packet Launder", "blacknetQuarter", 60, "hacking", "Data Theft", ["job", "hacking", "blacknet"], { credits: 360, encryptedData: 24, reputation: 6 }),
  contract("job-blacknet-trace-cleanup", "Trace Cleanup", "blacknetQuarter", 70, "hacking", "Cleanup", ["job", "trace", "safe"], { credits: 280, encryptedData: 12, reputation: 6 }, "trace-scrambler"),
  contract("job-blacknet-choir-echo", "Choir Echo", "blacknetQuarter", 80, "hacking", "Extraction", ["job", "nullChoir", "blacknet"], { credits: 760, encryptedData: 32, reputation: 12 }, "blacknet-cipher"),
  contract("job-blacknet-daemon-snare", "Daemon Snare", "blacknetQuarter", 80, "hacking", "Sabotage", ["job", "daemon", "blacknet"], { credits: 470, encryptedData: 20, reputation: 8 }, "daemon-chain-program"),

  // ===== HELIX WARD =====
  contract("job-helix-night-triage", "Night Triage", "helixWard", 80, "medical", "Cleanup", ["job", "medical", "safe"], { credits: 110, cyberwareParts: 2, reputation: 3 }),
  contract("job-helix-stabilizer-ledger", "Stabilizer Ledger", "helixWard", 90, "medical", "Cyberware Recovery", ["job", "medical", "helix"], { credits: 220, cyberwareParts: 5, reputation: 6 }, "advanced-stabilizer"),
  contract("job-helix-prototype-consent", "Prototype Consent", "helixWard", 100, "cyberware", "Corporate Espionage", ["job", "medical", "prototype"], { credits: 680, cyberwareParts: 14, reputation: 12 }, "neural-dampener-blueprint"),
  contract("job-helix-quiet-transfer", "Quiet Transfer", "helixWard", 100, "streetcraft", "Extraction", ["job", "medical", "corporate"], { credits: 420, cyberwareParts: 4, reputation: 8 }, "medical-access-pass"),

  // ===== GLASSLINE DISTRICT =====
  contract("job-glassline-badge-clone", "Badge Clone", "glasslineDistrict", 100, "hacking", "Corporate Espionage", ["job", "corporate", "hacking"], { credits: 360, encryptedData: 10 }),
  contract("job-glassline-boardroom-bug", "Boardroom Bug", "glasslineDistrict", 110, "hacking", "Data Theft", ["job", "corporate", "stealth"], { credits: 520, encryptedData: 14, reputation: 7 }, "corporate-access-token"),
  contract("job-glassline-prototype-escort", "Prototype Escort", "glasslineDistrict", 120, "combat", "Protection", ["job", "corporate", "combat"], { credits: 760, cyberwareParts: 10, reputation: 10 }, "stabilized-chrome-frame"),

  // ===== REDLINE BLOCKS =====
  contract("job-redline-board-runner", "Board Runner", "redlineBlocks", 120, "combat", "Bounty", ["job", "bounty", "combat"], { credits: 190, reputation: 7 }),
  contract("job-redline-arena-fix", "Arena Fix", "redlineBlocks", 130, "streetcraft", "Protection", ["job", "combat", "street"], { credits: 360, reputation: 10, cyberwareParts: 4 }, "servo-knuckles"),
  contract("job-redline-blood-price", "Blood Price", "redlineBlocks", 140, "combat", "Bounty", ["job", "bounty", "elite"], { credits: 980, reputation: 24, cyberwareParts: 12 }, "boss-data-key"),
  contract("job-redline-crew-break", "Crew Break", "redlineBlocks", 140, "combat", "Sabotage", ["job", "bounty", "gang"], { credits: 620, reputation: 16 }, "faction-authorization"),

  // ===== SKYLINE CORE =====
  contract("job-skyline-membership-audit", "Membership Audit", "skylineCore", 140, "hacking", "Corporate Espionage", ["job", "elite", "corporate"], { credits: 900, encryptedData: 18, reputation: 12 }),
  contract("job-skyline-afterparty-blackout", "Afterparty Blackout", "skylineCore", 150, "hacking", "Sabotage", ["job", "elite", "blacknet"], { credits: 2800, encryptedData: 36, reputation: 38 }, "boss-data-key"),
  contract("job-skyline-luxury-courier", "Luxury Courier", "skylineCore", 150, "vehicleTuning", "Courier", ["job", "vehicle", "elite"], { credits: 1300, reputation: 18 }, "district-permit"),
  contract("job-skyline-private-extraction", "Private Extraction", "skylineCore", 150, "combat", "Extraction", ["job", "elite", "combat"], { credits: 1900, reputation: 26 }, "private-buyer-contact"),
  ];
}

function contract(
  id: string,
  name: string,
  districtId: DistrictId,
  level: number,
  skill: SkillId,
  contractType: JobContract["contractType"],
  tags: string[],
  rewards: JobContract["rewards"],
  rareReward?: string,
): JobContract {
  const factionId = districtFactionFor(districtId);
  const riskRewardMultiplier = contractRiskRewardMultiplier(tags, level);
  return {
    id,
    name,
    fixerId: districtFixerFor(districtId),
    districtId,
    factionId,
    contractType,
    tags,
    description: `${name} is a ${(contractType ?? "Courier").toLowerCase()} contract tuned for ${districtId} progression.`,
    durationMs: 18_000 + level * 950,
    requirements: [`${skillName(skill)} level ${level}`, `${districtName(districtId)} unlocked`],
    baseSuccessChance: Math.max(0.48, 0.92 - level * 0.004),
    heatChange: Math.max(0, Math.round(level / 10)),
    neuralInstabilityChange: tags.includes("hacking") || tags.includes("prototype") ? Math.max(1, Math.round(level / 30)) : undefined,
    rewards: scaleJobRewards(rewards, riskRewardMultiplier),
    skillXp: { [skill]: Math.max(20, level * 5) },
    factionReputation: { [factionId]: Math.max(4, Math.round(level / 3)) },
    fixerTrustReward: Math.max(6, Math.round(level / 2)),
    rareReward,
    repeatable: true,
    manualFirstCompletion: level >= 30,
    autoRepeatTrustReq: Math.max(20, level),
  };
}

function contractRiskRewardMultiplier(tags: string[], level: number) {
  const riskSignals =
    (tags.includes("hacking") || tags.includes("blacknet") ? 1 : 0) +
    (tags.includes("faction-conflict") || tags.includes("illegal") || tags.includes("sabotage") ? 1 : 0) +
    (tags.includes("prototype") || tags.includes("elite") ? 1 : 0) +
    (level >= 40 ? 1 : 0);
  return 1 + riskSignals * 0.12;
}

function scaleJobRewards(rewards: JobContract["rewards"], multiplier: number): JobContract["rewards"] {
  if (multiplier === 1) return rewards;
  return Object.fromEntries(Object.entries(rewards).map(([id, amount]) => [id, Math.max(1, Math.round((amount ?? 0) * multiplier))])) as JobContract["rewards"];
}

function returnContract(
  id: string,
  name: string,
  districtId: DistrictId,
  masteryLevel: number,
  skill: SkillId,
  rewards: JobContract["rewards"],
  rareReward: string,
): JobContract {
  return {
    ...contract(id, name, districtId, Math.max(3, Math.floor(masteryLevel * 0.7)), skill, "Cleanup", ["job", "return", "districtMastery"], rewards, rareReward),
    description: `${name} is a repeatable return contract that keeps ${districtName(districtId)} relevant through mastery, missing drops, and bulk materials.`,
    requirements: [`${districtName(districtId)} unlocked`, `${districtName(districtId)} District Mastery level ${masteryLevel}`],
    autoRepeatTrustReq: Math.max(20, masteryLevel),
  };
}

function districtFixerFor(districtId: DistrictId) {
  const fixers: Record<DistrictId, string> = {
    neonRow: "sable-quinn-fixer",
    rustYards: "dex-riven-fixer",
    underpassMarket: "mara-voss-fixer",
    blacknetQuarter: "nyra-vale-fixer",
    glasslineDistrict: "iris-kade-fixer",
    helixWard: "iris-kade-fixer",
    redlineBlocks: "mara-voss-fixer",
    skylineCore: "vale-syn-fixer",
  };
  return fixers[districtId];
}

function districtFactionFor(districtId: DistrictId): FactionId {
  const factions: Record<DistrictId, FactionId> = {
    neonRow: "ghostMarket",
    rustYards: "chromeJackals",
    underpassMarket: "ghostMarket",
    blacknetQuarter: "nullChoir",
    glasslineDistrict: "helixOrder",
    helixWard: "helixOrder",
    redlineBlocks: "redlineSaints",
    skylineCore: "ghostMarket",
  };
  return factions[districtId];
}

function skillName(skill: SkillId) {
  return {
    scavenging: "Scavenging",
    hacking: "Hacking",
    cyberware: "Cyberware Engineering",
    combat: "Street Combat",
    vehicleTuning: "Vehicle Tuning",
    blackMarket: "Black Market",
    medical: "Medical Knowledge",
    streetcraft: "Streetcraft",
  }[skill];
}

function districtName(districtId: DistrictId) {
  return {
    neonRow: "Neon Row",
    rustYards: "Rust Yards",
    underpassMarket: "Underpass Market",
    blacknetQuarter: "Blacknet Quarter",
    glasslineDistrict: "Glassline District",
    helixWard: "Helix Ward",
    redlineBlocks: "Redline Blocks",
    skylineCore: "Skyline Core",
  }[districtId];
}
