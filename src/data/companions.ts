import type { Companion } from "../types";

export const companions: Companion[] = [
  // ===== NEON ROW =====
  {
    id: "sable-quinn",
    name: "Sable Quinn",
    role: "Fixer Liaison",
    districtId: "neonRow",
    factionId: "ghostMarket",
    romanceEligible: true,
    preferredGiftTypes: ["Contraband", "Market favors"],
    passiveBonus: "Future bonus: job rewards and Reputation gain.",
    questPlaceholder: "Personal job chain: Names Written in Static.",
    unlockRequirements: ["Available in Neon Row"],
  },

  // ===== RUST YARDS =====
  {
    id: "dex-riven",
    name: "Dex Riven",
    role: "Mechanic",
    districtId: "rustYards",
    factionId: "chromeJackals",
    romanceEligible: true,
    preferredGiftTypes: ["Vehicle parts", "Scrap trophies"],
    passiveBonus: "Future bonus: vehicle jobs and garage bonuses.",
    questPlaceholder: "Personal job chain: Engine of the Dead Road.",
    unlockRequirements: ["Rust Yards contact"],
  },

  // ===== UNDERPASS MARKET =====
  {
    id: "mara-voss",
    name: "Mara Voss",
    role: "Solo",
    districtId: "underpassMarket",
    factionId: "redlineSaints",
    romanceEligible: false,
    preferredGiftTypes: ["Combat trophies", "Rare jackets"],
    passiveBonus: "Future bonus: combat rewards and survivability.",
    questPlaceholder: "Personal job chain: Debt in Red Neon.",
    unlockRequirements: ["Street Combat level 5"],
  },

  // ===== BLACKNET QUARTER =====
  {
    id: "nyra-vale",
    name: "Nyra Vale",
    role: "Netrunner",
    districtId: "blacknetQuarter",
    factionId: "nullChoir",
    romanceEligible: true,
    preferredGiftTypes: ["Encrypted Data", "Signal curios"],
    passiveBonus: "Future bonus: hacking speed and trace reduction.",
    questPlaceholder: "Personal job chain: Ghosts Beneath the Signal.",
    unlockRequirements: ["Blacknet Quarter contact"],
  },

  // ===== GLASSLINE DISTRICT =====
  {
    id: "iris-kade",
    name: "Iris Kade",
    role: "Ripperdoc",
    districtId: "glasslineDistrict",
    factionId: "helixOrder",
    romanceEligible: true,
    preferredGiftTypes: ["Cyberware Parts", "Clinical tools"],
    passiveBonus: "Future bonus: Neural Instability recovery and upgrade costs.",
    questPlaceholder: "Personal job chain: The Quiet Socket.",
    unlockRequirements: ["Helix Order introduction"],
  },
];
