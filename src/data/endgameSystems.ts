export interface LegacyCraftingGoal {
  id: string;
  name: string;
  category: "Legendary Weapon" | "Iconic Cyberware" | "Apex Mod" | "Vehicle Core";
  requirements: string[];
  materials: Record<string, number>;
}

export interface IconicCyberwareGoal {
  id: string;
  name: string;
  slot: string;
  instabilityLoad: number;
  source: string;
  requirements: string[];
}

export interface CollectionRewardMilestone {
  percent: number;
  reward: string;
}

export const legacyCraftingGoals: LegacyCraftingGoal[] = [
  {
    id: "legacy-reflex-core",
    name: "Legacy Reflex Core",
    category: "Iconic Cyberware",
    requirements: ["Cyberware Engineering 80", "Neon Row Mastery 50", "Street Legend Rank 20"],
    materials: { scrap: 2500, circuitBoards: 500, "neural-connector": 80, "urban-reflex-chip": 20, "prototype-neural-core": 5, "boss-data-key": 1 },
  },
  {
    id: "legacy-blacknet-processor",
    name: "Blacknet Processor",
    category: "Apex Mod",
    requirements: ["Hacking 85", "Blacknet Quarter Mastery 50", "Street Legend Rank 30"],
    materials: { encryptedData: 1800, "blacknet-cipher": 25, "trace-scrambler-chip": 18, "daemon-fragment": 8, "boss-data-key": 2 },
  },
  {
    id: "legacy-prototype-drive",
    name: "Prototype Drive Assembly",
    category: "Vehicle Core",
    requirements: ["Vehicle Tuning 80", "Rust Yards Mastery 50", "Street Legend Rank 30"],
    materials: { vehicleParts: 1800, engineCore: 30, "chrome-jackal-gearset": 12, prototypeDriveUnit: 3 },
  },
];

export const iconicCyberwareGoals: IconicCyberwareGoal[] = [
  { id: "iconic-reflex-spine", name: "Reflex Spine: Ghostline", slot: "Skeleton", instabilityLoad: 14, source: "Legacy Reflex Core", requirements: ["Street Legend Rank 30", "Ripperdoc install", "Neon Row Mastery 50"] },
  { id: "iconic-null-eye", name: "Null Eye", slot: "Optics", instabilityLoad: 12, source: "Trace Storm high-threat combat", requirements: ["Street Legend Rank 40", "Blacknet Quarter Mastery 50"] },
  { id: "iconic-exec-os", name: "Executive Ghost OS", slot: "Operating System", instabilityLoad: 18, source: "Black Badge Response", requirements: ["Street Legend Rank 50", "Glassline faction access"] },
];

export const collectionRewardMilestones: CollectionRewardMilestone[] = [
  { percent: 10, reward: "Street Legend XP and small resource bundle" },
  { percent: 25, reward: "District/resource reward bonus placeholder" },
  { percent: 50, reward: "Rare drop chance placeholder" },
  { percent: 75, reward: "Advanced contract/vendor unlock placeholder" },
  { percent: 90, reward: "Sim Cache or blueprint tracking bonus" },
  { percent: 100, reward: "Title/passive placeholder" },
];

export const prestigeProtocolNotes = [
  "Optional only; no forced resets.",
  "Future Skill Prestige can reset a level 150 skill for a small permanent bonus.",
  "Future District Prestige can reset District Mastery 99 for a district passive.",
  "Collections, story, major unlocks, and important items should stay preserved.",
];
