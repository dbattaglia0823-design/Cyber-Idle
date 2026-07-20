import type { DistrictId, FactionId, OperationDefinition } from "../types";

export const operations: OperationDefinition[] = [
  // ===== NEON ROW =====
  {
    id: "op-backstreet-sweep",
    name: "Backstreet Sweep",
    districtId: "neonRow",
    description: "Clear a street crew hideout buried behind Neon Row storefronts.",
    unlockRequirements: ["Street Combat level 10"],
    recommendedStats: ["Damage 18", "Armor 4"],
    recommendedLoadoutTags: ["pistols", "smgs", "blades", "stealth"],
    stages: [
      { name: "Door Kick", enemyIds: ["street-punk"], recommendedTags: ["directAssault", "smgs"] },
      { name: "Crew Floor", enemyIds: ["boosted-thug"], recommendedTags: ["shotguns", "bluntWeapons"] },
      { name: "Alley Gunner Nest", enemyIds: ["street-punk", "boosted-thug"], recommendedTags: ["pistols", "blades"] },
    ],
    mechanics: [
      { id: "crew-alert", name: "Crew Alert", description: "Loud routes earn more weapon XP but raise Heat.", tags: ["loud", "gang"], successModifier: 0.02, heatChange: 1, rewardMultiplier: 1.04 },
    ],
    routes: [
      { id: "directAssault", name: "Direct Assault", description: "Fight through the front and farm weapon XP.", requirements: ["Street Combat level 10"], recommendedTags: ["smgs", "shotguns", "loud"], successModifier: 0.04, heatChange: 2, rewardMultiplier: 1.08 },
      { id: "silentEntry", name: "Silent Entry", description: "Quiet side-door clear with better attachment odds.", requirements: ["Stealth weapon or suppressor recommended"], recommendedTags: ["stealth", "blades", "pistols"], successModifier: 0.03, heatChange: -2, rareDropModifier: 0.03 },
      { id: "fixerSetup", name: "Fixer Setup", description: "Let Neon Row contacts stage the target.", requirements: ["Vega trust recommended"], recommendedTags: ["fixer", "street"], successModifier: 0.02, rewardMultiplier: 1.12 },
    ],
    defaultRouteId: "directAssault",
    bossId: "boss-backstreet-lieutenant",
    completionRewards: { credits: 80, reputation: 6, scrap: 12 },
    rareDrops: [{ id: "bp-starter-weapon", name: "Starter Weapon Blueprint", chance: 0.08, quantity: 1 }, { id: "backroom-breacher", name: "Backroom Breacher", chance: 0.025, quantity: 1 }, { id: "neon-splitter", name: "Neon Splitter", chance: 0.018, quantity: 1 }],
    firstClearRewards: { credits: 120, reputation: 10 },
    repeatClearRewards: { credits: 45, reputation: 3 },
    heatChange: 5,
    factionReputation: { redlineSaints: 6 },
  },
  {
    id: "op-junkyard-lockdown",
    name: "Junkyard Lockdown",
    districtId: "rustYards",
    description: "Fight through a hostile salvage yard and break its lockdown signal.",
    unlockRequirements: ["Rust Yards unlocked", "Street Combat level 30"],
    recommendedStats: ["Damage 35", "Armor 12"],
    recommendedLoadoutTags: ["shock", "tech", "bluntWeapons", "heavyWeapons"],
    requiredItems: { "rust-access-key": 1 },
    stages: [
      { name: "Scrap Hounds", enemyIds: ["scrap-drone"], recommendedTags: ["shock", "smart"] },
      { name: "Rust Raiders", enemyIds: ["boosted-thug", "scrap-drone"], recommendedTags: ["tech", "bluntWeapons"] },
      { name: "Drone Pickers", enemyIds: ["scrap-drone"], recommendedTags: ["drone", "mech"] },
    ],
    mechanics: [
      { id: "lockdown-signal", name: "Lockdown Signal", description: "High district threat promotes yard machines and improves vehicle loot.", tags: ["mech", "vehicle"], successModifier: -0.03, threatChange: 3, rewardMultiplier: 1.06, rareDropModifier: 0.02 },
    ],
    routes: [
      { id: "directAssault", name: "Direct Assault", description: "Break the yard with armor and impact weapons.", requirements: ["Armor 12"], recommendedTags: ["bluntWeapons", "heavyWeapons", "armor"], successModifier: 0.03, heatChange: 1, rewardMultiplier: 1.06 },
      { id: "blacknetBreach", name: "Blacknet Breach", description: "Hijack drone routing before the warden boots.", requirements: ["Hacking level 30 recommended"], recommendedTags: ["blacknet", "cyberdeckWeapons", "shock"], successModifier: 0.05, neuralInstabilityChange: 1, rareDropModifier: 0.03 },
      { id: "smugglerRoute", name: "Smuggler Route", description: "Use chop-shop paths to extract more parts.", requirements: ["Chrome Jackals trust recommended"], recommendedTags: ["vehicle", "smuggling"], successModifier: 0.02, rewardMultiplier: 1.14 },
    ],
    defaultRouteId: "directAssault",
    bossId: "boss-junkyard-warden",
    completionRewards: { cyberwareParts: 8, vehicleParts: 12, scrap: 20 },
    rareDrops: [{ id: "engineCore", name: "Engine Core", chance: 0.08, quantity: 1 }, { id: "scrapstorm-lmg", name: "Scrapstorm LMG", chance: 0.02, quantity: 1 }, { id: "jackal-maul", name: "Jackal Maul", chance: 0.01, quantity: 1 }],
    firstClearRewards: { vehicleParts: 25, cyberwareParts: 10 },
    repeatClearRewards: { vehicleParts: 8, cyberwareParts: 3 },
    heatChange: 4,
    factionReputation: { chromeJackals: 8 },
  },
  {
    id: "op-contraband-raid",
    name: "Contraband Raid",
    districtId: "underpassMarket",
    description: "Raid a black market storage route before the inventory moves.",
    unlockRequirements: ["Underpass Market unlocked", "Reputation 150"],
    recommendedStats: ["Damage 45", "Armor 16"],
    recommendedLoadoutTags: ["stealth", "suppressed", "sniperRifles", "smuggling"],
    requiredItems: { "market-pass": 1 },
    stages: [
      { name: "Thieves", enemyIds: ["street-punk"], recommendedTags: ["stealth", "smgs"] },
      { name: "Contraband Guards", enemyIds: ["boosted-thug"], recommendedTags: ["shotguns", "armorPiercing"] },
      { name: "Smuggler Heavy", enemyIds: ["boosted-thug", "scrap-drone"], recommendedTags: ["tech", "smart"] },
    ],
    mechanics: [
      { id: "market-eyes", name: "Market Eyes", description: "High Heat draws backup unless the loadout is quiet.", tags: ["stealthSensitive", "blackmarket"], successModifier: -0.02, heatChange: 2, rareDropModifier: 0.02 },
    ],
    routes: [
      { id: "silentEntry", name: "Silent Entry", description: "Keep vendors confused and improve attachment odds.", requirements: ["Suppressor, blades, or stealth tags"], recommendedTags: ["stealth", "lowHeat", "pistols"], successModifier: 0.06, heatChange: -3, rareDropModifier: 0.04 },
      { id: "directAssault", name: "Direct Assault", description: "Hard breach with more Heat and faster clears.", requirements: ["Armor 16"], recommendedTags: ["shotguns", "smgs", "loud"], successModifier: 0.02, heatChange: 4, rewardMultiplier: 1.08 },
      { id: "smugglerRoute", name: "Smuggler Route", description: "Ghost Market paths convert chaos into contraband.", requirements: ["Ghost Market trust recommended"], recommendedTags: ["smuggling", "vehicle"], successModifier: 0.03, rewardMultiplier: 1.15 },
    ],
    defaultRouteId: "silentEntry",
    bossId: "boss-market-enforcer",
    completionRewards: { credits: 220, reputation: 14, smugglerCompartment: 1 },
    rareDrops: [{ id: "smugglerCompartment", name: "Smuggler Compartment", chance: 0.1, quantity: 1 }, { id: "ghostline-ripper", name: "Ghostline Ripper", chance: 0.012, quantity: 1 }, { id: "ghostlink-swarm", name: "Ghostlink Swarm", chance: 0.01, quantity: 1 }],
    firstClearRewards: { credits: 300, reputation: 20 },
    repeatClearRewards: { credits: 90, reputation: 5 },
    heatChange: 8,
    factionReputation: { ghostMarket: 10 },
  },
  {
    id: "op-ghost-signal-dive",
    name: "Ghost Signal Dive",
    districtId: "blacknetQuarter",
    description: "A hybrid hacking and combat dive through a hostile Blacknet relay.",
    unlockRequirements: ["Blacknet Quarter unlocked", "Hacking level 60"],
    recommendedStats: ["Damage 120", "Hacking 60"],
    recommendedLoadoutTags: ["cyberdeckWeapons", "blacknet", "trace-scrambler", "smart"],
    requiredItems: { "blacknet-cipher": 1 },
    stages: [
      { name: "Firewall Drone", enemyIds: ["scrap-drone"], recommendedTags: ["shock", "blacknet"] },
      { name: "Signal Wraith", enemyIds: ["scrap-drone", "boosted-thug"], recommendedTags: ["cyberdeckWeapons", "smart"] },
      { name: "Null Choir Initiate", enemyIds: ["boosted-thug"], recommendedTags: ["blacknet", "trace-scrambler"] },
    ],
    mechanics: [
      { id: "trace-storm", name: "Trace Storm", description: "Trace spikes raise Heat and Neural Instability but improve cipher odds.", tags: ["blacknet", "trace"], successModifier: -0.04, heatChange: 3, neuralInstabilityChange: 2, rareDropModifier: 0.04 },
    ],
    routes: [
      { id: "blacknetBreach", name: "Blacknet Breach", description: "Run the relay as a hacking route for data and unique drops.", requirements: ["Hacking level 60"], recommendedTags: ["cyberdeckWeapons", "blacknet", "trace-scrambler"], successModifier: 0.08, neuralInstabilityChange: 2, rewardMultiplier: 1.12, rareDropModifier: 0.05 },
      { id: "directAssault", name: "Direct Assault", description: "Fight the hardware shells directly.", requirements: ["Damage 55"], recommendedTags: ["smart", "tech", "shock"], successModifier: 0.02, heatChange: 2 },
      { id: "factionFavor", name: "Null Choir Favor", description: "Choir routing improves unique drops.", requirements: ["Null Choir reputation recommended"], recommendedTags: ["nullChoir", "blacknet"], successModifier: 0.03, rareDropModifier: 0.06 },
    ],
    defaultRouteId: "blacknetBreach",
    bossId: "boss-black-ice-avatar",
    completionRewards: { encryptedData: 25, reputation: 10 },
    rareDrops: [{ id: "bp-blacknet-tool", name: "Blacknet Tool Blueprint", chance: 0.08, quantity: 1 }, { id: "hive-oracle", name: "Hive Oracle", chance: 0.008, quantity: 1 }, { id: "vector-bloom", name: "Vector Bloom", chance: 0.01, quantity: 1 }],
    firstClearRewards: { encryptedData: 40, reputation: 16 },
    repeatClearRewards: { encryptedData: 12, reputation: 4 },
    heatChange: 10,
    neuralInstabilityChange: 4,
    factionReputation: { nullChoir: 12 },
  },
  {
    id: "op-corporate-extraction",
    name: "Corporate Extraction",
    districtId: "glasslineDistrict",
    description: "Break into a corporate facility and escape under armed response.",
    unlockRequirements: ["Glassline District unlocked", "Hacking level 100", "Street Combat level 100"],
    recommendedStats: ["Damage 200", "Armor 55", "Hacking 100"],
    recommendedLoadoutTags: ["tech", "armorPiercing", "heavyWeapons", "corporate"],
    requiredItems: { "glassline-access-token": 1 },
    stages: [
      { name: "Corporate Guard", enemyIds: ["corp-response-guard"], recommendedTags: ["armorPiercing", "tech"] },
      { name: "Security Drone", enemyIds: ["scrap-drone"], recommendedTags: ["shock", "smart"] },
      { name: "Glassline Operative", enemyIds: ["corp-response-guard", "scrap-drone"], recommendedTags: ["heavyWeapons", "tech"] },
    ],
    mechanics: [
      { id: "executive-lockdown", name: "Executive Lockdown", description: "Corporate response raises Heat but upgrades rare access drops.", tags: ["corporate", "highHeat"], successModifier: -0.06, heatChange: 4, threatChange: 5, rareDropModifier: 0.04 },
    ],
    routes: [
      { id: "corporateDisguise", name: "Corporate Disguise", description: "Use credentials and quiet weapons to lower Heat.", requirements: ["Glassline token", "low Heat recommended"], recommendedTags: ["corporate", "stealth", "pistols"], successModifier: 0.06, heatChange: -4, rewardMultiplier: 1.04 },
      { id: "directAssault", name: "Direct Assault", description: "Breach through response teams for more loot pressure.", requirements: ["Armor 25"], recommendedTags: ["heavyWeapons", "armorPiercing", "loud"], successModifier: 0.03, heatChange: 6, rewardMultiplier: 1.14 },
      { id: "blacknetBreach", name: "Blacknet Breach", description: "Open facility routes through security daemons.", requirements: ["Hacking level 100"], recommendedTags: ["cyberdeckWeapons", "blacknet", "tech"], successModifier: 0.07, neuralInstabilityChange: 2, rareDropModifier: 0.04 },
    ],
    defaultRouteId: "corporateDisguise",
    bossId: "boss-response-captain",
    completionRewards: { credits: 500, reputation: 20, prototypeDriveUnit: 1 },
    rareDrops: [{ id: "bp-corporate-cyberware", name: "Corporate Cyberware Blueprint", chance: 0.06, quantity: 1 }, { id: "glassline-judge", name: "Glassline Judge", chance: 0.01, quantity: 1 }, { id: "white-arc-lance", name: "White Arc Lance", chance: 0.012, quantity: 1 }],
    firstClearRewards: { credits: 750, reputation: 30 },
    repeatClearRewards: { credits: 180, reputation: 6 },
    heatChange: 18,
    factionReputation: { helixOrder: -4, ghostMarket: 5 },
  },
  ...makeExpandedOperations(),
];

function makeExpandedOperations(): OperationDefinition[] {
  return [
  // ===== NEON ROW =====
  op("op-redline-initiation", "Redline Initiation", "neonRow", 10, "Disrupt a Redline recruitment night before the block turns hostile.", "boss-redline-initiate", ["boosted-thug", "neon-lookout"], { credits: 260, reputation: 15, cyberwareParts: 6 }, "bounty-token"),
  op("op-neon-rooftop-chase", "Neon Rooftop Chase", "neonRow", 12, "Rooftop runners and sign-bridge lookouts turn Neon Row into a vertical chase.", "boss-rooftop-runner", ["street-punk", "neon-lookout"], { credits: 120, reputation: 8, circuitBoards: 3 }, "smartlink-chip"),
  op("op-neon-row-lockdown", "Neon Row Lockdown", "neonRow", 20, "Push through a district-wide sweep and pull the crew command node offline.", "boss-neon-lockdown-sergeant", ["clinic-shaker", "neon-lookout", "scrap-drone"], { credits: 420, reputation: 22, encryptedData: 8 }, "faction-authorization"),
  op("op-street-clinic-shakedown", "Street Clinic Shakedown", "neonRow", 20, "Break a clinic debt ring and recover usable medical salvage.", "boss-clinic-collector", ["clinic-shaker", "boosted-thug"], { credits: 180, cyberwareParts: 5, reputation: 10 }, "medical-gel"),

  // ===== RUST YARDS =====
  op("op-drone-graveyard-sweep", "Drone Graveyard Sweep", "rustYards", 20, "Sweep a drone graveyard where old patrol shells keep waking up.", "boss-drone-graveyard-core", ["scrap-drone", "scrap-hound", "chopshop-spotter"], { vehicleParts: 18, circuitBoards: 8, credits: 180 }, "navigationChip"),
  op("op-engine-core-heist", "Engine Core Heist", "rustYards", 30, "Steal an engine core from a moving chop line before the Jackals seal it.", "boss-engine-thief", ["yard-raider", "chopshop-spotter", "mag-clamp-loader"], { vehicleParts: 26, engineCore: 1, credits: 260 }, "engineCore"),
  op("op-chrome-jackals-trial", "Chrome Jackals Trial", "rustYards", 40, "Survive a Jackal trial run to earn access to better vehicle work.", "boss-jackal-trialmaster", ["yard-raider", "scrap-hound", "jackal-roadboss"], { vehicleParts: 34, reputation: 18, armorPlating: 4 }, "smugglerCompartment"),
  op("op-warden-scrap-fortress", "Warden's Scrap Fortress", "rustYards", 40, "Crack the fortress yard where every wall is a salvaged weapon.", "boss-scrap-fortress-core", ["mag-clamp-loader", "jackal-roadboss", "scrap-hound"], { vehicleParts: 50, credits: 520, reputation: 24 }, "prototypeDriveUnit"),

  // ===== UNDERPASS MARKET =====
  op("op-ledger-knife-run", "Ledger Knife Run", "underpassMarket", 40, "Steal a broker ledger before the sellers erase each other.", "boss-ghost-ledger-keeper", ["market-cutthroat", "ledger-thief"], { credits: 240, encryptedData: 8, reputation: 12 }, "private-buyer-contact"),
  op("op-tunnel-auction-crash", "Tunnel Auction Crash", "underpassMarket", 50, "Crash a sealed auction without letting the market identify your buyer.", "boss-tunnel-auctioneer", ["ledger-thief", "tunnel-gunner", "market-cutthroat"], { credits: 360, reputation: 16, encryptedData: 8 }, "rare-listing-permit"),
  op("op-contraband-surgery", "Contraband Surgery", "underpassMarket", 60, "Raid an illegal operating theater trading in prototype cores.", "boss-contraband-surgeon", ["contraband-sawbones", "tunnel-gunner"], { credits: 440, cyberwareParts: 8 }, "prototype-neural-core"),
  op("op-underpass-kingpin", "Underpass Kingpin", "underpassMarket", 60, "Break a private market protection ring before it taxes every route.", "boss-underpass-kingpin", ["ghost-market-factor", "contraband-sawbones", "tunnel-gunner"], { credits: 720, reputation: 28, encryptedData: 16 }, "boss-data-key"),

  // ===== BLACKNET QUARTER =====
  op("op-firewall-breach", "Firewall Breach", "blacknetQuarter", 60, "Cut through a living firewall and harvest its exposed routines.", "boss-firewall-warden", ["trace-avatar", "packet-wraith"], { encryptedData: 35, credits: 260, reputation: 14 }, "trace-scrambler"),
  op("op-null-choir-initiation", "Null Choir Initiation", "blacknetQuarter", 70, "Survive a Null Choir initiation route without losing your signal identity.", "boss-null-choir-precentor", ["choir-proxy", "packet-wraith"], { encryptedData: 45, reputation: 18 }, "daemon-chain-program"),
  op("op-deep-static-collapse", "Deep Static Collapse", "blacknetQuarter", 80, "Collapse a deep static pocket before it rewrites local access.", "boss-deep-static-heart", ["null-oracle-shell", "daemon-butcher", "packet-wraith"], { encryptedData: 90, reputation: 32, credits: 650 }, "boss-data-key"),
  op("op-rogue-daemon-hunt", "Rogue Daemon Hunt", "blacknetQuarter", 80, "Hunt a daemon eating abandoned relay bodies across the Quarter.", "boss-rogue-daemon", ["daemon-butcher", "choir-proxy", "trace-avatar"], { encryptedData: 60, credits: 420, reputation: 22 }, "prototype-weapon-core"),

  // ===== HELIX WARD =====
  op("op-helix-triage-case", "Helix Triage Case", "helixWard", 80, "Stabilize a clinic breach before desperate patients become armed witnesses.", "boss-helix-triage-chief", ["clinic-shaker", "contraband-sawbones"], { credits: 160, cyberwareParts: 3, reputation: 10 }, "medical-access-pass"),
  op("op-stabilizer-vault", "Stabilizer Vault", "helixWard", 90, "Recover stolen stabilizers from a locked recovery vault.", "boss-stabilizer-matron", ["sterile-drone", "contraband-sawbones"], { credits: 260, cyberwareParts: 6 }, "advanced-stabilizer"),
  op("op-helix-clean-room-siege", "Helix Clean-Room Siege", "helixWard", 100, "Defend a clean-room against mercs trying to steal living prototypes.", "boss-prototype-director", ["prototype-handler", "executive-bodyguard", "contraband-sawbones"], { credits: 1100, reputation: 34, cyberwareParts: 18 }, "bp-stabilized-buffer"),
  op("op-neural-quietus", "Neural Quietus", "helixWard", 100, "Shut down a quietus protocol before it wipes unstable runners.", "boss-neural-quietus", ["prototype-handler", "sterile-drone", "choir-proxy"], { credits: 700, reputation: 26, encryptedData: 18 }, "neural-dampener-blueprint"),
  op("op-recovery-proxy", "Recovery Proxy", "helixWard", 100, "Disable a recovery proxy that is billing patients into debt.", "boss-recovery-proxy", ["sterile-drone", "glassline-auditor"], { credits: 420, reputation: 18, cyberwareParts: 10 }, "stabilized-chrome-frame"),

  // ===== GLASSLINE DISTRICT =====
  op("op-glassline-audit-night", "Glassline Audit Night", "glasslineDistrict", 100, "Slip through an after-hours audit where every locked door has a gun behind it.", "boss-audit-knight", ["corp-response-guard", "glassline-auditor"], { credits: 620, encryptedData: 12, reputation: 16 }, "corporate-access-token"),
  op("op-sterile-wing-breach", "Sterile Wing Breach", "glasslineDistrict", 110, "Breach a sterile wing and steal implant frames before the drones purge inventory.", "boss-sterile-captain", ["sterile-drone", "corp-response-guard"], { credits: 780, cyberwareParts: 14, reputation: 18 }, "stabilized-chrome-frame"),
  op("op-executive-proxy-war", "Executive Proxy War", "glasslineDistrict", 120, "Fight through proxy security for a boardroom no one admits exists.", "boss-executive-proxy", ["executive-bodyguard", "glassline-auditor", "sterile-drone"], { credits: 980, reputation: 24, encryptedData: 18 }, "glassline-access-token"),
  op("op-prototype-directive", "Prototype Directive", "glasslineDistrict", 120, "Extract prototype directives from a facility designed to burn itself clean.", "boss-prototype-director", ["prototype-handler", "executive-bodyguard", "sterile-drone"], { credits: 1400, reputation: 36, prototypeDriveUnit: 1 }, "bp-corporate-cyberware"),

  // ===== REDLINE BLOCKS =====
  op("op-redline-bounty-board", "Redline Bounty Board", "redlineBlocks", 120, "Clear a stack of open bounties before the board changes hands.", "boss-bounty-captain", ["bounty-scout", "redline-brawler"], { credits: 260, reputation: 16 }, "bounty-token"),
  op("op-saints-ring", "Saints Ring", "redlineBlocks", 130, "Win a closed-ring crew challenge under live-fire rules.", "boss-saints-ringmaster", ["saints-shotcaller", "redline-brawler"], { credits: 380, reputation: 20, cyberwareParts: 6 }, "servo-knuckles"),
  op("op-blood-contract", "Blood Contract", "redlineBlocks", 140, "Take a contract that pays only if the whole block hears about it.", "boss-blood-contract", ["bloodsport-chrome", "saints-shotcaller"], { credits: 620, reputation: 28 }, "faction-authorization"),
  op("op-redline-block-war", "Redline Block War", "redlineBlocks", 140, "Push through a full crew war and claim the board for yourself.", "boss-redline-executioner", ["redline-executioner", "saints-shotcaller", "bloodsport-chrome"], { credits: 1500, reputation: 50 }, "rare-blueprint-fragment"),
  op("op-redline-execution", "Redline Execution", "redlineBlocks", 140, "Stop an executioner before their bounty ledger becomes district law.", "boss-redline-executioner", ["redline-executioner", "bloodsport-chrome", "bounty-scout"], { credits: 980, reputation: 38, cyberwareParts: 14 }, "boss-data-key"),

  // ===== SKYLINE CORE =====
  op("op-skyline-concierge", "Skyline Concierge", "skylineCore", 140, "Survive a luxury concierge screening where rejection is lethal.", "boss-skyline-concierge", ["executive-bodyguard", "glassline-auditor"], { credits: 1000, reputation: 22 }, "district-permit"),
  op("op-executive-afterimage", "Executive Afterimage", "skylineCore", 150, "Hunt the afterimage of an executive route through Blacknet, luxury, and gunfire.", "boss-skyline-blackout", ["null-oracle-shell", "ghost-market-factor", "prototype-handler"], { credits: 3600, reputation: 70, prototypeDriveUnit: 1 }, "rare-blueprint-fragment"),
  op("op-luxury-assessment", "Luxury Assessment", "skylineCore", 150, "Pass an elite assessment by stealing the assessor's own risk ledger.", "boss-luxury-assessor", ["prototype-handler", "executive-bodyguard"], { credits: 1400, reputation: 28 }, "rare-blueprint-fragment"),
  op("op-private-armory", "Private Armory", "skylineCore", 150, "Breach a private armory hidden behind membership contracts.", "boss-private-armory", ["redline-executioner", "prototype-handler", "executive-bodyguard"], { credits: 1900, reputation: 36, prototypeDriveUnit: 1 }, "prototypeDriveUnit"),
  op("op-skyline-blackout", "Skyline Blackout", "skylineCore", 150, "Cut power to the top of the city and raid the panic rooms in the dark.", "boss-skyline-blackout", ["null-oracle-shell", "prototype-handler", "redline-executioner"], { credits: 2800, reputation: 55 }, "boss-data-key"),
  ];
}

function op(
  id: string,
  name: string,
  districtId: DistrictId,
  level: number,
  description: string,
  bossId: string,
  enemyIds: string[],
  rewards: OperationDefinition["completionRewards"],
  rareDropId: string,
): OperationDefinition {
  const factionId = districtFactionFor(districtId);
  return {
    id,
    name,
    districtId,
    description,
    unlockRequirements: [`${districtId === "blacknetQuarter" ? "Hacking" : "Street Combat"} level ${level}`, `${districtName(districtId)} unlocked`],
    recommendedStats: [`Damage ${Math.max(18, level * 2)}`, `Armor ${Math.max(4, Math.round(level * 0.55))}`],
    recommendedLoadoutTags: districtId === "blacknetQuarter" ? ["blacknet", "cyberdeckWeapons", "trace-scrambler"] : districtId === "rustYards" ? ["vehicle", "tech", "armorPiercing"] : districtId === "underpassMarket" ? ["stealth", "smuggling", "blackmarket"] : districtId === "redlineBlocks" ? ["bounty", "shotguns", "bluntWeapons"] : ["tech", "armorPiercing", "stealth"],
    stages: [
      { name: "Outer Pressure", enemyIds: enemyIds.slice(0, 1), recommendedTags: ["starter", "safe"] },
      { name: "Escalation", enemyIds: enemyIds.slice(0, 2), recommendedTags: ["sustain", "armor"] },
      { name: "Boss Gate", enemyIds, recommendedTags: ["burst", "prepared"] },
    ],
    mechanics: [
      { id: `${id}-pressure`, name: "District Pressure", description: "Higher district threat raises risk but improves repeat value.", tags: ["district", "threat"], successModifier: -0.01, threatChange: 2, rewardMultiplier: 1.03, rareDropModifier: 0.01 },
    ],
    routes: [
      { id: "directAssault", name: "Direct Assault", description: "Fast clear with higher Heat.", requirements: [`Street Combat level ${level}`], recommendedTags: ["loud", "armor"], successModifier: 0.03, heatChange: 2, rewardMultiplier: 1.08 },
      { id: districtId === "blacknetQuarter" ? "blacknetBreach" : "silentEntry", name: districtId === "blacknetQuarter" ? "Blacknet Breach" : "Silent Entry", description: "Lower Heat route with better rare-drop control.", requirements: ["Stealth, cyberdeck, or route prep recommended"], recommendedTags: ["stealth", "blacknet"], successModifier: 0.04, heatChange: -2, rareDropModifier: 0.03 },
      { id: "fixerSetup", name: "Fixer Setup", description: "Spend local trust to improve payout consistency.", requirements: ["Local fixer trust recommended"], recommendedTags: ["fixer", "prepared"], successModifier: 0.02, rewardMultiplier: 1.12 },
    ],
    defaultRouteId: "directAssault",
    bossId,
    completionRewards: rewards,
    rareDrops: [{ id: rareDropId, name: rareDropId, chance: 0.06, quantity: 1 }],
    firstClearRewards: { credits: Math.max(100, level * 12), reputation: Math.max(6, Math.round(level / 2)) },
    repeatClearRewards: { credits: Math.max(35, level * 4), reputation: Math.max(2, Math.round(level / 8)) },
    heatChange: Math.max(3, Math.round(level / 7)),
    neuralInstabilityChange: districtId === "blacknetQuarter" || districtId === "helixWard" ? Math.max(1, Math.round(level / 30)) : undefined,
    factionReputation: { [factionId]: Math.max(5, Math.round(level / 4)) },
  };
}

function districtFactionFor(districtId: DistrictId): FactionId {
  const factions: Record<DistrictId, FactionId> = {
    neonRow: "redlineSaints",
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
