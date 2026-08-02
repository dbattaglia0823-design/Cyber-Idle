import type { PerkDefinition, PerkTreeId, SpecializationMilestone } from "../types";

export const perkTrees: Array<{ id: PerkTreeId; name: string; color: string; identity: string }> = [
  { id: "core", name: "Core", color: "cyan", identity: "General long-term account strength." },
  { id: "solo", name: "Solo", color: "red", identity: "Combat, armor, bounties, and operation pressure." },
  { id: "netrunner", name: "Netrunner", color: "blue", identity: "Hacking, encrypted data, Blacknet work, and trace control." },
  { id: "techie", name: "Techie", color: "green", identity: "Cyberware engineering, crafting, upgrades, and clinics." },
  { id: "outrider", name: "Outrider", color: "amber", identity: "Vehicles, scavenging, smuggling, and Rust Yard routes." },
  { id: "fixer", name: "Fixer", color: "violet", identity: "Jobs, reputation, trust, and market leverage." },
  { id: "ghost", name: "Ghost", color: "pink", identity: "Low Heat, stealth safety, clean exits, and quiet extraction." },
];

export const perks: PerkDefinition[] = [
  perk("core-deep-focus", "Deep Focus", "All skill XP gains improve.", "core", 1, 1, 5, { skillXp: { scavenging: 0.02, hacking: 0.02, cyberware: 0.02, vehicleTuning: 0.02, blackMarket: 0.02, medical: 0.02, streetcraft: 0.02, combat: 0.02 } }, ["Available"]),
  perk("core-cleaner-logs", "Mastery Loop", "Mastery XP gains improve across every action.", "core", 2, 1, 5, { masteryXpGain: 0.025 }, ["Spend 3 Core points"]),
  perk("core-efficient-routine", "Efficient Routine", "All actions finish faster.", "core", 3, 2, 4, { actionSpeed: 0.015 }, ["Spend 6 Core points"]),
  perk("core-adaptive-loadouts", "Adaptive Routine", "Skill XP and Mastery XP improve together.", "core", 4, 3, 3, { skillXp: { scavenging: 0.01, hacking: 0.01, cyberware: 0.01, vehicleTuning: 0.01, blackMarket: 0.01, medical: 0.01, streetcraft: 0.01, combat: 0.01 }, masteryXpGain: 0.01 }, ["Spend 9 Core points"]),

  perk("solo-hardwired-reflexes", "Hardwired Reflexes", "Weapon damage and combat defense improve.", "solo", 1, 1, 5, { combatDamage: 0.03, combatDefense: 0.02 }, ["Available"]),
  perk("solo-blood-money", "Blood Money", "Combat work produces more credits and stronger job payouts.", "solo", 2, 1, 5, { creditsGained: 0.03, jobRewards: 0.02 }, ["Spend 3 Solo points"]),
  perk("solo-operation-breacher", "Operation Breacher", "Operation pressure improves combat damage, XP, and extraction odds.", "solo", 3, 2, 4, { combatDamage: 0.03, combatXp: 0.03, dropChance: 0.01 }, ["Clear an operation"]),
  perk("solo-chrome-tolerance", "Chrome Tolerance", "Heavy combat chrome creates less instability and improves defense.", "solo", 4, 3, 3, { neuralInstabilityGain: -0.03, combatDefense: 0.02 }, ["Spend 9 Solo points"]),

  perk("netrunner-data-siphon", "Data Siphon", "Hacks grant more XP and resources while generating less Heat.", "netrunner", 1, 1, 5, { skillRewards: 0.03, skillXp: { hacking: 0.03 }, heatGain: -0.01 }, ["Available"]),
  perk("netrunner-trace-ghost", "Trace Ghost", "Cleaner traces improve job success and further reduce Heat.", "netrunner", 2, 1, 5, { jobSuccessChance: 0.03, heatGain: -0.02 }, ["Hacking level 10"]),
  perk("netrunner-script-chaining", "Script Chaining", "Chained scripts run faster and build local standing.", "netrunner", 3, 2, 4, { actionSpeed: 0.01, localStandingGain: 0.03 }, ["Spend 6 Netrunner points"]),
  perk("netrunner-deep-breach", "Deep Breach", "Deep systems yield rarer loot and more Mastery XP.", "netrunner", 4, 3, 3, { dropChance: 0.03, masteryXpGain: 0.02 }, ["Spend 9 Netrunner points"]),

  perk("techie-component-efficiency", "Component Efficiency", "Crafts use fewer materials and grant more Engineering XP.", "techie", 1, 1, 5, { craftingCostReduction: 0.03, skillXp: { cyberware: 0.02 } }, ["Available"]),
  perk("techie-upgrade-planning", "Upgrade Planning", "Equipment upgrades cost less and create less instability.", "techie", 2, 1, 5, { upgradeCostReduction: 0.02, neuralInstabilityGain: -0.01 }, ["Cyberware Engineering level 8"]),
  perk("techie-ripperdoc-negotiator", "Ripperdoc Network", "Clinic services cost less and prototype drops improve.", "techie", 3, 2, 4, { ripperdocCostReduction: 0.03, dropChance: 0.02 }, ["Helix Ward access"]),
  perk("techie-prototype-handling", "Prototype Handling", "Advanced fabrication reduces instability and material costs.", "techie", 4, 3, 3, { neuralInstabilityGain: -0.04, craftingCostReduction: 0.02, skillXp: { cyberware: 0.02 } }, ["Spend 9 Techie points"]),

  perk("outrider-road-memory", "Road Memory", "Routes run faster and grant more scavenging XP.", "outrider", 1, 1, 5, { actionSpeed: 0.02, skillXp: { scavenging: 0.02 } }, ["Available"]),
  perk("outrider-hidden-compartments", "Hidden Compartments", "Smuggling generates less Heat and produces more resources.", "outrider", 2, 1, 5, { heatGain: -0.03, skillRewards: 0.03 }, ["Own a vehicle"]),
  perk("outrider-engine-whisperer", "Engine Whisperer", "Vehicle upgrades cost less and dangerous jobs are safer.", "outrider", 3, 2, 4, { vehicleUpgradeCostReduction: 0.03, jobSuccessChance: 0.02 }, ["Own a vehicle"]),
  perk("outrider-long-haul", "Long Haul", "Mobile operations extend offline progress and build local standing.", "outrider", 4, 3, 3, { offlineProgressCapHours: 1, localStandingGain: 0.03 }, ["Spend 9 Outrider points"]),

  perk("fixer-better-terms", "Better Terms", "Contracts pay more and contact reputation rises faster.", "fixer", 1, 1, 5, { jobRewards: 0.03, fixerTrustGain: 0.02 }, ["Available"]),
  perk("fixer-negotiated-prices", "Negotiated Prices", "Vendor prices fall while local standing improves.", "fixer", 2, 1, 5, { shopPrices: -0.02, localStandingGain: 0.02 }, ["Discover a vendor"]),
  perk("fixer-favor-economy", "Favor Economy", "Faction reputation and local standing grow faster.", "fixer", 3, 2, 4, { factionReputationGain: 0.03, reputationGained: 0.02, localStandingGain: 0.02 }, ["Faction rank 2"]),
  perk("fixer-contract-automation", "Contract Automation", "A mature contact network improves job success and rewards.", "fixer", 4, 3, 3, { jobSuccessChance: 0.04, jobRewards: 0.02 }, ["Spend 9 Fixer points"]),

  perk("ghost-low-profile", "Low Profile", "Quiet methods reduce Heat and improve job success.", "ghost", 1, 1, 5, { heatGain: -0.03, jobSuccessChance: 0.01 }, ["Available"]),
  perk("ghost-evidence-cleaner", "Evidence Cleaner", "Heat fades faster and clean work pays a little more.", "ghost", 2, 1, 5, { heatDecay: 0.02, jobRewards: 0.01 }, ["Heat below 50"]),
  perk("ghost-clean-simulation", "Clean Simulation", "Sim Cache efficiency improves while Heat generation falls.", "ghost", 3, 2, 4, { simCacheEfficiency: 0.03, heatGain: -0.02 }, ["Use Sim Cache once"]),
  perk("ghost-no-witnesses", "No Witnesses", "Clean extractions improve rare drops and job success.", "ghost", 4, 3, 3, { dropChance: 0.03, jobSuccessChance: 0.02 }, ["Defeat 50 enemies"]),
];

export const specializationMilestones: SpecializationMilestone[] = perkTrees.flatMap((tree) => [
  { tree: tree.id, points: 5, name: `${tree.name} Initiate`, description: `Minor ${tree.name} passive unlocked.` },
  { tree: tree.id, points: 12, name: `${tree.name} Specialist`, description: `Specialist title unlocked for ${tree.name}.` },
  { tree: tree.id, points: 20, name: `${tree.name} Signature`, description: `Signature passive unlocked for ${tree.name}.` },
  { tree: tree.id, points: 27, name: `${tree.name} Mastery`, description: `Maximum ${tree.name} specialization reached.` },
]);

function perk(
  id: string,
  name: string,
  description: string,
  tree: PerkTreeId,
  tier: number,
  cost: number,
  maxRanks: number,
  modifiers: Partial<PerkDefinition["modifiers"]>,
  unlockRequirements: string[],
  prerequisites: string[] = [],
): PerkDefinition {
  return { id, name, description, tree, tier, cost, prerequisites, maxRanks, modifiers: modifiers as PerkDefinition["modifiers"], unlockRequirements };
}
