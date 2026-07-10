import type { PerkDefinition, PerkTreeId, SpecializationMilestone } from "../types";

export const perkTrees: Array<{ id: PerkTreeId; name: string; color: string; identity: string }> = [
  { id: "core", name: "Core", color: "cyan", identity: "General long-term account strength." },
  { id: "solo", name: "Solo", color: "red", identity: "Combat, armor, bounties, and operation pressure." },
  { id: "netrunner", name: "Netrunner", color: "blue", identity: "Hacking, encrypted data, Blacknet work, and trace control." },
  { id: "techie", name: "Techie", color: "green", identity: "Cyberware engineering, crafting, upgrades, and clinics." },
  { id: "outrider", name: "Outrider", color: "amber", identity: "Vehicles, scavenging, smuggling, and Rust Yard routes." },
  { id: "fixer", name: "Fixer", color: "violet", identity: "Jobs, reputation, trust, companions, and market leverage." },
  { id: "ghost", name: "Ghost", color: "pink", identity: "Low Heat, stealth safety, clean exits, and quiet extraction." },
];

export const perks: PerkDefinition[] = [
  perk("core-efficient-routine", "Efficient Routine", "Global actions finish faster.", "core", 1, 1, 5, { actionSpeed: 0.02 }, ["Available"]),
  perk("core-deep-focus", "Deep Focus", "All skill XP gains improve.", "core", 1, 1, 5, { skillXp: { scavenging: 0.02, hacking: 0.02, cyberware: 0.02, combat: 0.02 } }, ["Available"]),
  perk("core-cleaner-logs", "Cleaner Logs", "Mastery XP gains improve.", "core", 2, 1, 5, { masteryXpGain: 0.02 }, ["Spend 3 Core points"], ["core-efficient-routine"]),
  perk("core-street-reputation", "Street Reputation", "Reputation gains improve.", "core", 2, 1, 5, { reputationGained: 0.02 }, ["Spend 3 Core points"]),
  perk("core-safer-downtime", "Safer Downtime", "Offline progress cap increases.", "core", 3, 2, 3, { offlineProgressCapHours: 1 }, ["Spend 8 Core points"]),
  perk("core-simulation-tuning", "Simulation Tuning", "Sim Cache efficiency improves.", "core", 3, 2, 3, { simCacheEfficiency: 0.03 }, ["Use Sim Cache once"]),
  perk("core-adaptive-loadouts", "Adaptive Loadouts", "Preset automation improves later.", "core", 4, 3, 1, { actionSpeed: 0.03 }, ["Spend 15 Core points"]),

  perk("solo-hardwired-reflexes", "Hardwired Reflexes", "Combat damage and action rhythm improve.", "solo", 1, 1, 5, { combatDamage: 0.03 }, ["Available"]),
  perk("solo-armor-discipline", "Armor Discipline", "Combat defense improves.", "solo", 1, 1, 5, { combatDefense: 0.03 }, ["Available"]),
  perk("solo-blood-money", "Blood Money", "Combat and street credits improve.", "solo", 2, 1, 5, { creditsGained: 0.03 }, ["Spend 3 Solo points"]),
  perk("solo-bounty-specialist", "Bounty Specialist", "Job payouts improve for combat-heavy play.", "solo", 2, 1, 4, { jobRewards: 0.05 }, ["Redline contact"]),
  perk("solo-operation-breacher", "Operation Breacher", "Operation combat pressure improves.", "solo", 3, 2, 4, { combatDamage: 0.03, combatXp: 0.02 }, ["Clear an operation"]),
  perk("solo-critical-routine", "Critical Routine", "Rare drop extraction improves.", "solo", 3, 2, 3, { dropChance: 0.02 }, ["Defeat a boss"]),
  perk("solo-chrome-tolerance", "Chrome Tolerance", "Combat builds tolerate Neural Instability better.", "solo", 4, 3, 3, { neuralInstabilityGain: -0.03 }, ["Spend 15 Solo points"]),

  perk("netrunner-clean-entry", "Clean Entry", "Hacking Heat gains drop.", "netrunner", 1, 1, 5, { heatGain: -0.03 }, ["Available"]),
  perk("netrunner-data-siphon", "Data Siphon", "Hacking resource yields improve.", "netrunner", 1, 1, 5, { skillRewards: 0.03, skillXp: { hacking: 0.02 } }, ["Available"]),
  perk("netrunner-trace-ghost", "Trace Ghost", "Hacking job success improves.", "netrunner", 2, 1, 5, { jobSuccessChance: 0.03 }, ["Hacking level 10"]),
  perk("netrunner-cipher-memory", "Cipher Memory", "Hacking mastery XP improves.", "netrunner", 2, 1, 4, { masteryXpGain: 0.03, skillXp: { hacking: 0.03 } }, ["Blacknet contact"]),
  perk("netrunner-blacknet-familiarity", "Blacknet Familiarity", "Local standing gains improve.", "netrunner", 3, 2, 3, { localStandingGain: 0.05 }, ["Blacknet Quarter unlocked"]),
  perk("netrunner-script-chaining", "Script Chaining", "Hacking actions run faster.", "netrunner", 3, 2, 4, { actionSpeed: 0.02 }, ["Spend 10 Netrunner points"]),
  perk("netrunner-deep-breach", "Deep Breach", "Bonus loot extraction improves.", "netrunner", 4, 3, 3, { dropChance: 0.03 }, ["Spend 15 Netrunner points"]),

  perk("techie-component-efficiency", "Component Efficiency", "Crafting material costs are reduced.", "techie", 1, 1, 5, { craftingCostReduction: 0.03 }, ["Available"]),
  perk("techie-steady-hands", "Steady Hands", "Cyberware Engineering XP improves.", "techie", 1, 1, 5, { skillXp: { cyberware: 0.03 } }, ["Available"]),
  perk("techie-upgrade-planning", "Upgrade Planning", "Item upgrade costs are reduced.", "techie", 2, 1, 5, { upgradeCostReduction: 0.02 }, ["Cyberware Engineering level 8"]),
  perk("techie-implant-familiarity", "Implant Familiarity", "Neural Instability gain drops.", "techie", 2, 1, 5, { neuralInstabilityGain: -0.02 }, ["Install cyberware"]),
  perk("techie-ripperdoc-negotiator", "Ripperdoc Negotiator", "Ripperdoc service costs drop.", "techie", 3, 2, 4, { ripperdocCostReduction: 0.03 }, ["Helix Ward access"]),
  perk("techie-blueprint-analyst", "Blueprint Analyst", "Blueprint and rare drop odds improve.", "techie", 3, 2, 3, { dropChance: 0.03 }, ["Discover a blueprint"]),
  perk("techie-prototype-handling", "Prototype Handling", "Prototype work creates less instability.", "techie", 4, 3, 3, { neuralInstabilityGain: -0.04, skillXp: { cyberware: 0.02 } }, ["Spend 15 Techie points"]),

  perk("outrider-road-memory", "Road Memory", "Vehicle and courier jobs run faster.", "outrider", 1, 1, 5, { actionSpeed: 0.03 }, ["Available"]),
  perk("outrider-scrap-sense", "Scrap Sense", "Scavenging rewards improve.", "outrider", 1, 1, 5, { skillRewards: 0.05, skillXp: { scavenging: 0.02 } }, ["Available"]),
  perk("outrider-hidden-compartments", "Hidden Compartments", "Smuggling Heat pressure drops.", "outrider", 2, 1, 5, { heatGain: -0.03 }, ["Own a vehicle"]),
  perk("outrider-rust-yard-regular", "Rust Yard Regular", "Local standing gains improve.", "outrider", 2, 1, 3, { localStandingGain: 0.05 }, ["Rust Yards unlocked"]),
  perk("outrider-engine-whisperer", "Engine Whisperer", "Vehicle upgrade costs drop.", "outrider", 3, 2, 4, { vehicleUpgradeCostReduction: 0.03 }, ["Own a vehicle"]),
  perk("outrider-fast-exit", "Fast Exit", "Jobs in dangerous districts are safer.", "outrider", 3, 2, 4, { jobSuccessChance: 0.03 }, ["Spend 10 Outrider points"]),
  perk("outrider-long-haul", "Long Haul", "Offline cap increases with vehicle life.", "outrider", 4, 3, 3, { offlineProgressCapHours: 1 }, ["Spend 15 Outrider points"]),

  perk("fixer-better-terms", "Better Terms", "Job rewards improve.", "fixer", 1, 1, 5, { jobRewards: 0.03 }, ["Available"]),
  perk("fixer-known-face", "Known Face", "Fixer trust gains improve.", "fixer", 1, 1, 5, { fixerTrustGain: 0.03 }, ["Available"]),
  perk("fixer-local-leverage", "Local Leverage", "Local standing gains improve.", "fixer", 2, 1, 5, { localStandingGain: 0.03 }, ["Complete a job"]),
  perk("fixer-negotiated-prices", "Negotiated Prices", "Vendor prices improve.", "fixer", 2, 1, 5, { shopPrices: -0.02 }, ["Discover a vendor"]),
  perk("fixer-contact-chain", "Contact Chain", "Companion relationship gains improve.", "fixer", 3, 2, 4, { companionRelationshipGain: 0.03 }, ["Unlock a companion"]),
  perk("fixer-favor-economy", "Favor Economy", "Faction reputation gains improve.", "fixer", 3, 2, 4, { factionReputationGain: 0.03, reputationGained: 0.02 }, ["Faction rank 2"]),
  perk("fixer-contract-automation", "Contract Automation", "Safe job automation improves later.", "fixer", 4, 3, 2, { jobSuccessChance: 0.04 }, ["Spend 15 Fixer points"]),

  perk("ghost-low-profile", "Low Profile", "Global Heat gains drop.", "ghost", 1, 1, 5, { heatGain: -0.03 }, ["Available"]),
  perk("ghost-silent-exit", "Silent Exit", "Low-Heat job success improves.", "ghost", 1, 1, 5, { jobSuccessChance: 0.03 }, ["Available"]),
  perk("ghost-evidence-cleaner", "Evidence Cleaner", "Heat decay improves.", "ghost", 2, 1, 5, { heatDecay: 0.02 }, ["Heat below 50"]),
  perk("ghost-shadow-market", "Shadow Market", "Quiet market work pays better.", "ghost", 2, 1, 4, { jobRewards: 0.03, dropChance: 0.02 }, ["Ghost Market contact"]),
  perk("ghost-quiet-hands", "Quiet Hands", "Threat and Heat pressure soften.", "ghost", 3, 2, 4, { heatGain: -0.02 }, ["Spend 10 Ghost points"]),
  perk("ghost-clean-simulation", "Clean Simulation", "Sim Cache risk and efficiency improve.", "ghost", 3, 2, 3, { simCacheEfficiency: 0.03, heatGain: -0.01 }, ["Use Sim Cache once"]),
  perk("ghost-no-witnesses", "No Witnesses", "Rare extraction improves after enemy logs grow.", "ghost", 4, 3, 3, { dropChance: 0.03 }, ["Defeat 50 enemies"]),
];

export const specializationMilestones: SpecializationMilestone[] = perkTrees.flatMap((tree) => [
  { tree: tree.id, points: 5, name: `${tree.name} Initiate`, description: `Minor ${tree.name} passive unlocked.` },
  { tree: tree.id, points: 15, name: `${tree.name} Title`, description: `Archetype title unlocked for ${tree.name}.` },
  { tree: tree.id, points: 30, name: `${tree.name} Automation`, description: `Special automation hook unlocked for ${tree.name}.` },
  { tree: tree.id, points: 50, name: `${tree.name} Signature`, description: `Signature passive placeholder unlocked.` },
  { tree: tree.id, points: 75, name: `${tree.name} Mastery`, description: `Mastery title and cosmetic placeholder unlocked.` },
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
