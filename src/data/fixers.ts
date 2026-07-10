import type { Fixer } from "../types";

export const fixers: Fixer[] = [
  {
    id: "sable-quinn-fixer",
    name: "Sable Quinn",
    districtId: "neonRow",
    factionId: "ghostMarket",
    specialty: "Starter street contracts, contraband introductions, and companion routes.",
    startingPathNotes: {
      streetborn: "Streetborn runners gain trust faster through Sable's local contacts.",
      corporateDefector: "Corporate defectors get cleaner data-theft leads.",
    },
    companionUnlocks: ["sable-quinn"],
    housingUnlocks: ["capsule-room"],
    jobChains: ["Neon Row onboarding", "Ghost Market introductions"],
  },
  {
    id: "dex-riven-fixer",
    name: "Dex Riven",
    districtId: "rustYards",
    factionId: "chromeJackals",
    specialty: "Vehicle work, smuggling routes, garage upgrades, and wasteland salvage.",
    startingPathNotes: {
      outrider: "Outriders receive faster vehicle work and smoother smuggling introductions.",
    },
    companionUnlocks: ["dex-riven"],
    housingUnlocks: ["rust-yard-garage"],
    jobChains: ["Rust lane access", "Chrome Jackals garage work"],
  },
  {
    id: "iris-kade-fixer",
    name: "Iris Kade",
    districtId: "helixWard",
    factionId: "helixOrder",
    specialty: "Medical cyberware, stabilizers, and corporate clinic access.",
    startingPathNotes: {
      corporateDefector: "Corporate defectors get better clinic introductions but attract attention.",
    },
    companionUnlocks: ["iris-kade"],
    housingUnlocks: ["glassline-apartment", "skyline-penthouse"],
    jobChains: ["Helix clinic clearance", "Prototype recovery"],
  },
  {
    id: "mara-voss-fixer",
    name: "Mara Voss",
    districtId: "underpassMarket",
    factionId: "redlineSaints",
    specialty: "Illegal market enforcement, bounty introductions, and crew protection work.",
    startingPathNotes: {
      streetborn: "Streetborn runners get warmer introductions to Underpass crews.",
    },
    companionUnlocks: ["mara-voss"],
    housingUnlocks: ["underpass-safehouse"],
    jobChains: ["Underpass protection", "Redline bounty access"],
  },
  {
    id: "nyra-vale-fixer",
    name: "Nyra Vale",
    districtId: "blacknetQuarter",
    factionId: "nullChoir",
    specialty: "Blacknet dives, encrypted data brokerage, trace storms, and cyberdeck tools.",
    startingPathNotes: {
      corporateDefector: "Corporate defectors get cleaner credential angles but carry noisier signatures.",
    },
    companionUnlocks: ["nyra-vale"],
    housingUnlocks: ["blacknet-loft"],
    jobChains: ["Null Choir access", "Blacknet relay work"],
  },
  {
    id: "vale-syn-fixer",
    name: "Vale Syn",
    districtId: "skylineCore",
    factionId: "ghostMarket",
    specialty: "Elite contracts, luxury brokerage, executive permits, and late-game credit sinks.",
    startingPathNotes: {
      corporateDefector: "Corporate defectors receive quieter executive introductions.",
      outrider: "Outriders get vehicle-forward skyline courier options.",
    },
    companionUnlocks: [],
    housingUnlocks: ["skyline-penthouse"],
    jobChains: ["Executive brokerage", "Skyline permit burns"],
  },
];
