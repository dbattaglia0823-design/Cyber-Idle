import type { ItemDefinition } from "../types";

const names = ["Afterhours Special", "Jackal's Promise", "Ghost Receipt", "Static Choir", "Mercy Circuit", "Golden Parachute", "Street Sovereign", "Afterimage"];
export const rpgWeapons: ItemDefinition[] = names.map((name, index) => ({
  id: `rpg-weapon-${index}`, name, description: "A fixer-issued sidearm earned through the Afterimage campaign.",
  type: "Weapon", rarity: index < 2 ? "Uncommon" : index < 5 ? "Rare" : index < 7 ? "Epic" : "Legendary",
  tags: ["weapon", "pistol", "ranged", "campaign"], stackable: false, sellValue: 80 + index * 120,
  sourceHint: index === 0 ? "Claim your field kit in the fixer network." : `Complete Afterimage chapter ${index} for a guaranteed reward.`,
  slot: "weapon", requiredSkill: "combat", requiredLevel: 1, tier: index + 1,
  stats: { damage: 10 + index * 10, accuracy: 3 + index, armorPenetration: index * 2 },
  weaponClass: "pistols", attachmentSlots: ["muzzle", "grip"], modSlots: 1, maxUpgradeLevel: 10,
}));

export const rpgIconic: ItemDefinition = {
  id: "rpg-afterimage-os", name: "Afterimage Neural OS", description: "A liberated operating system carrying the imprint of your final decision.",
  type: "Cyberware", rarity: "Legendary", slot: "operatingSystem", requiredSkill: "cyberware", requiredLevel: 1,
  tags: ["cyberware", "iconic", "campaign"], stackable: false, sellValue: 3000, instabilityLoad: 5,
  modifiers: { combatMaxHp: 0.15, combatDamage: 0.1, skillRewards: 0.05 },
  sourceHint: "Finish the Afterimage main story in Journal. Usable immediately after the finale.",
};
