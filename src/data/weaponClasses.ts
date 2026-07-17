import type { WeaponClassDefinition, WeaponClassId } from "../types";

export const weaponClassOrder: WeaponClassId[] = [
  "pistols",
  "smgs",
  "shotguns",
  "assaultRifles",
  "sniperRifles",
  "blades",
  "bluntWeapons",
  "techWeapons",
  "smartWeapons",
  "heavyWeapons",
  "cyberdeckWeapons",
  "exoticWeapons",
];

export const weaponClasses: WeaponClassDefinition[] = [
  cls("pistols", "Pistols", "Fast sidearms with crit, stealth, and low-Heat options.", ["Available"], ["solo", "ghost"], ["stealth", "ranged", "lowHeat"]),
  cls("smgs", "SMGs", "Fast automatic weapons for messy street fights and multi-target operations.", ["Street Combat level 3"], ["solo"], ["loud", "gang", "ranged"]),
  cls("shotguns", "Shotguns", "Burst damage and armor stagger at close range.", ["Street Combat level 5"], ["solo"], ["loud", "ranged", "armorPiercing"]),
  cls("assaultRifles", "Assault Rifles", "Balanced damage, accuracy, and corporate raid consistency.", ["Street Combat level 8"], ["solo", "fixer"], ["corporate", "ranged"]),
  cls("sniperRifles", "Sniper Rifles", "Assassination, boss opening damage, and rare extraction.", ["Street Combat level 12"], ["ghost", "solo"], ["assassination", "ranged", "stealth"]),
  cls("blades", "Blades", "Low-Heat melee weapons for stealth jobs and gang work.", ["Available"], ["ghost", "solo"], ["melee", "stealth", "lowHeat"]),
  cls("bluntWeapons", "Blunt Weapons", "Unarmed damage, armor break, nonlethal control, and drone/mech disruption.", ["Street Combat level 4", "Unarmed counts as Blunt"], ["solo"], ["melee", "unarmed", "nonlethal", "mech"]),
  cls("techWeapons", "Tech Weapons", "Armor penetration and corporate material extraction.", ["Cyberware Engineering level 6"], ["techie", "solo"], ["tech", "armorPiercing", "corporate"]),
  cls("smartWeapons", "Smart Weapons", "Accuracy, drone targeting, and hacking synergy.", ["Hacking level 6"], ["netrunner", "techie"], ["smart", "drone", "ranged"]),
  cls("heavyWeapons", "Heavy Weapons", "Boss and operation damage at the cost of Heat.", ["Street Combat level 15"], ["solo"], ["loud", "highHeat", "boss"]),
  cls("cyberdeckWeapons", "Cyberdeck Weapons", "Blacknet combat tools that manipulate trace and Heat.", ["Hacking level 12"], ["netrunner"], ["blacknet", "illegal"]),
  cls("exoticWeapons", "Exotic Weapons", "Rare unstable weapons with Neural Instability scaling.", ["Rare drops"], ["techie", "ghost"], ["prototype", "exotic"]),
];

function cls(
  id: WeaponClassId,
  name: string,
  description: string,
  unlockRequirements: string[],
  relatedArchetypes: WeaponClassDefinition["relatedArchetypes"],
  relatedTags: string[],
): WeaponClassDefinition {
  return {
    id,
    name,
    description,
    unlockRequirements,
    relatedArchetypes,
    relatedTags,
    milestones: [
      { level: 5, name: "Familiar Grip", description: "Small class-specific stat bonus.", modifiers: { combatDamage: 0.01 } },
      { level: 10, name: "Attachment Ready", description: "First attachment slot mastery placeholder.", modifiers: { dropChance: 0.01 } },
      { level: 20, name: "Mission Edge", description: "Class-specific mission bonus.", modifiers: { jobSuccessChance: 0.01 } },
      { level: 35, name: "Tuned Hardware", description: "Improved attachment effectiveness.", modifiers: { actionSpeed: 0.01 } },
      { level: 50, name: "Combat Passive", description: "Class combat passive.", modifiers: { combatDamage: 0.02 } },
      { level: 75, name: "Rare Extraction", description: "Rare drop or operation bonus.", modifiers: { dropChance: 0.02 } },
      { level: 99, name: "Class Mastery", description: "Mastery title placeholder.", modifiers: { combatDamage: 0.03, dropChance: 0.02 } },
    ],
  };
}
