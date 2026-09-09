import type { ItemDefinition, ItemRarity } from "../types";
export interface CyberdeckSpec { id: string; name: string; rarity: ItemRarity; stage: number; slots: number; ram: number; damage: number; recovery: number; discount: number; price: number; description: string }
export const cyberdecks: CyberdeckSpec[] = [
  { id: "deck-relay", name: "Relay Runner", rarity: "Uncommon", stage: 1, slots: 3, ram: 3, damage: .05, recovery: 0, discount: 0, price: 1100, description: "An extra program slot and a modest payload boost." },
  { id: "deck-ghostwire", name: "Ghostwire Courier", rarity: "Rare", stage: 2, slots: 4, ram: 4, damage: .1, recovery: 0, discount: 0, price: 2400, description: "Flexible software capacity for hybrid builds." },
  { id: "deck-nullchoir", name: "Null Choir Cantor", rarity: "Epic", stage: 3, slots: 4, ram: 5, damage: .15, recovery: 1, discount: 0, price: 4200, description: "A recovery specialist: regenerate one extra RAM each turn." },
  { id: "deck-helix", name: "Helix Mnemonic", rarity: "Epic", stage: 4, slots: 5, ram: 6, damage: .2, recovery: 0, discount: 1, price: 5600, description: "Efficient code lowers every quickhack cost by one RAM." },
  { id: "deck-spectre", name: "Spectre Executive", rarity: "Legendary", stage: 5, slots: 6, ram: 7, damage: .25, recovery: 1, discount: 0, price: 8000, description: "Six program slots, strong payloads and improved recovery." },
  { id: "deck-singularity", name: "Singularity Prototype", rarity: "Prototype", stage: 7, slots: 6, ram: 8, damage: .3, recovery: 1, discount: 1, price: 14000, description: "A complete suite of program slots, compression and accelerated recovery." },
];
export const cyberdeckItems: ItemDefinition[] = cyberdecks.map(deck => ({
  id: deck.id, name: deck.name, description: deck.description, type: "Cyberware", rarity: deck.rarity, slot: "operatingSystem",
  requiredSkill: "cyberware", requiredLevel: 1, tier: deck.stage + 1, tags: ["cyberware", "cyberdeck", "hacking"], stackable: false,
  instabilityLoad: 3 + deck.stage, sellValue: Math.floor(deck.price / 5), modifiers: { skillXp: { hacking: .03 + deck.stage * .01 } },
  sourceHint: "Guaranteed district main-job reward; buy in Character > Quickhacks after reaching its district. Local gigs provide replacements.",
}));
