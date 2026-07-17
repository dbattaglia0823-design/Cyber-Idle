export type ResourceTier = "basic" | "refined" | "advanced" | "rare" | "ultraRare";

export const resourceTierInfo: Record<string, { tier: ResourceTier; sourceHint: string }> = {
  scrap: { tier: "basic", sourceHint: "Common scavenging and combat salvage." },
  circuitBoards: { tier: "basic", sourceHint: "Common electronics salvage and hacking rewards." },
  encryptedData: { tier: "basic", sourceHint: "Hacking actions and Blacknet jobs." },
  cyberwareParts: { tier: "basic", sourceHint: "Cyberware salvage, repairs, and combat drops." },
  credits: { tier: "basic", sourceHint: "Most actions, jobs, combat, and sales." },
  "circuit-bundle": { tier: "refined", sourceHint: "Crafted from Circuit Boards and Scrap." },
  "neural-connector": { tier: "refined", sourceHint: "Crafted from Circuit Boards and Encrypted Data." },
  "cyberware-frame": { tier: "refined", sourceHint: "Crafted from Cyberware Parts and Scrap." },
  "weapon-frame": { tier: "refined", sourceHint: "Crafted from Scrap and Circuit Boards." },
  armorPlating: { tier: "refined", sourceHint: "Vehicle jobs, vendors, and armor-related drops." },
  vehicleParts: { tier: "refined", sourceHint: "Rust Yards salvage, garages, and vehicle jobs." },
  "medical-gel": { tier: "refined", sourceHint: "Medical actions, Helix vendors, and clinic services." },
  "smartlink-chip": { tier: "advanced", sourceHint: "Drone drops, smart weapon recipes, and Blacknet vendors." },
  "suppressor-baffles": { tier: "advanced", sourceHint: "Crafted from Precision Parts and Scrap." },
  "blacknet-cipher": { tier: "advanced", sourceHint: "Blacknet Quarter hacking, Black ICE bosses, and brokers." },
  "neural-stabilizer-compound": { tier: "advanced", sourceHint: "Medical Knowledge rare drops and Helix stock." },
  engineCore: { tier: "advanced", sourceHint: "Vehicle bosses, Rust Yards vendors, and operations." },
  "precision-parts": { tier: "advanced", sourceHint: "Crafted from Scrap and Circuit Boards." },
  "mod-core": { tier: "advanced", sourceHint: "Crafted from boards, data, and Precision Parts." },
  "prototype-neural-core": { tier: "rare", sourceHint: "Prototype assembly actions, high-risk cyberware work, and Ghost Market stock." },
  "stabilized-chrome-frame": { tier: "rare", sourceHint: "Prototype assembly, corporate vendors, and Helix-linked rewards." },
  "prototype-weapon-core": { tier: "rare", sourceHint: "Combat operations and late Street Combat rare drops." },
  prototypeDriveUnit: { tier: "rare", sourceHint: "Late vehicle tuning, prototype vehicle rewards, and operations." },
  "rare-blueprint-fragment": { tier: "rare", sourceHint: "Rare scavenging, combat, hacking, contracts, and market stock." },
  "boss-data-key": { tier: "rare", sourceHint: "Boss chains and high-tier combat actions." },
  "faction-authorization": { tier: "rare", sourceHint: "Faction ranks, fixer contracts, and district rewards." },
  "relic-circuit": { tier: "ultraRare", sourceHint: "Future endgame relic operations." },
  "apex-neural-core": { tier: "ultraRare", sourceHint: "Future apex Neural Instability content." },
  "rogue-ai-fragment": { tier: "ultraRare", sourceHint: "Future Blacknet apex drops." },
  "blacksite-prototype-core": { tier: "ultraRare", sourceHint: "Future blacksite operation drop." },
  "legendary-chrome-matrix": { tier: "ultraRare", sourceHint: "Future legendary cyberware chain." },
};

export function resourceSourceHint(id: string) {
  return resourceTierInfo[id]?.sourceHint;
}
