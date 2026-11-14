import { getItem } from "../data/items";
import type { ActiveModifiers, GameState, GearSlot, WeaponClassId } from "../types";

// Every armor bonus is derived from the five equipped slots. Inventory copies
// and unrelated armor with matching rarity do not count toward a set.
export const armorSetIdentity = {
  "Neon Runner": {
    two: { combatAttackSpeed: .015 }, three: { dodgeChance: .025 }, five: { combatDamage: .035, dodgeChance: .015 },
    identity: "Street speed · dodge and fast attacks",
  },
  "Street Operator": {
    two: { combatDefense: .025 }, three: { combatDamage: .02 }, five: { combatMaxHp: .035, combatDefense: .025 },
    identity: "All-rounder · steady damage and survivability",
  },
  "Scrap Bulwark": {
    two: { combatDefense: .04 }, three: { combatMaxHp: .04 }, five: { damageReduction: .025, combatDefense: .025 },
    identity: "Heavy defense · resist sustained hits",
  },
  "Jackal Plate": {
    two: { combatDefense: .04 }, three: { combatDamage: .02 }, five: { damageReduction: .035, combatMaxHp: .025 },
    identity: "Armored breacher · endure hard counterfire",
  },
  "Ghostweave": {
    two: { dodgeChance: .025 }, three: { combatAttackSpeed: .02 }, five: { combatDamage: .04, heatGain: -.015 },
    identity: "Silent runner · evasive pressure with lower Heat",
  },
  "Null Shroud": {
    two: { dodgeChance: .03 }, three: { combatDefense: .03 }, five: { combatAttackSpeed: .035, damageReduction: .025 },
    identity: "Ghost operator · evade and mitigate incoming damage",
  },
  "Helix Aegis": {
    two: { healingReceived: .04 }, three: { combatMaxHp: .05 }, five: { damageReduction: .03, healingReceived: .04 },
    identity: "Combat medic · stronger recovery and endurance",
  },
  "Glassline Tactical": {
    two: { combatDamage: .025 }, three: { combatDefense: .025 }, five: { combatDamage: .04, combatAttackSpeed: .015 },
    identity: "Corporate specialist · precision and dependable output",
  },
  "Redline Juggernaut": {
    two: { combatDefense: .04 }, three: { combatMaxHp: .055 }, five: { damageReduction: .035, combatDamage: .035 },
    identity: "Frontline brawler · protection without losing damage",
  },
  "Skyline Apex": {
    two: { combatMaxHp: .04 }, three: { combatDamage: .035, combatDefense: .03 }, five: { damageReduction: .035, combatAttackSpeed: .025 },
    identity: "Adaptive apex · balanced high-level combat",
  },
} as const satisfies Record<string, {two: Partial<ActiveModifiers>; three: Partial<ActiveModifiers>; five: Partial<ActiveModifiers>; identity: string}>;

export type ArmorSetName = keyof typeof armorSetIdentity;
const armorSlots: readonly GearSlot[] = ["head", "chest", "hands", "legs", "boots"];
export interface ArmorSetProgress {
  name: ArmorSetName;
  count: number;
  slots: GearSlot[];
  identity: string;
  activeTiers: Array<2 | 3 | 5>;
  nextTier: 2 | 3 | 5 | null;
}

export function equippedArmorSetProgress(state: GameState): ArmorSetProgress[] {
  const counts = new Map<ArmorSetName, GearSlot[]>();
  for (const slot of armorSlots) {
    const item = getItem(state.equippedGear[slot] ?? "");
    if (item?.type !== "Armor" || !item.setName || !(item.setName in armorSetIdentity)) continue;
    const name = item.setName as ArmorSetName;
    counts.set(name, [...(counts.get(name) ?? []), slot]);
  }
  return [...counts].map(([name, slots]) => ({
    name, count: slots.length, slots, identity: armorSetIdentity[name].identity,
    activeTiers: ([2, 3, 5] as const).filter(tier => slots.length >= tier),
    nextTier: ([2, 3, 5] as const).find(tier => slots.length < tier) ?? null,
  }));
}

export const weaponClassIdentity = {
  pistols: { name: "Quickdraw", description: "Opening field shot deals 12% more damage.", passive: { combatAttackSpeed: .025 } },
  smgs: { name: "Suppressive Volley", description: "Field hits weaken the next counterattack by 10%.", passive: { combatAttackSpeed: .03 } },
  shotguns: { name: "Breach Shells", description: "Ignore another 15 points of enemy plating in field combat.", passive: { combatDamage: .025 } },
  assaultRifles: { name: "Follow-through", description: "Unaimed field shots deal 8% more damage.", passive: { combatDamage: .025 } },
  sniperRifles: { name: "Deadeye Calibration", description: "Aimed field shots deal 15% more damage.", passive: { combatDamage: .025 } },
  blades: { name: "Silent Opening", description: "First field attack against each target deals 18% more damage.", passive: { combatAttackSpeed: .025 } },
  bluntWeapons: { name: "Concussive Blow", description: "First weapon hit against each target interrupts their counterattack.", passive: { combatDamage: .025 } },
  techWeapons: { name: "Piercing Rail", description: "Ignore half of active enemy shielding.", passive: { combatDamage: .02 } },
  smartWeapons: { name: "Smartlink Targeting", description: "Installed quickhacks deal 10% more damage.", passive: { combatAttackSpeed: .02 } },
  heavyWeapons: { name: "Heavy Suppression", description: "Field shots deal 12% extra damage against charging enemies.", passive: { combatDamage: .03 } },
  cyberdeckWeapons: { name: "Daemon Link", description: "Installed quickhacks deal 12% more damage.", passive: { combatDamage: .02 } },
  exoticWeapons: { name: "Unstable Pulse", description: "Every third field weapon attack deals 16% more damage.", passive: { combatDamage: .025 } },
} as const satisfies Record<WeaponClassId, {name: string; description: string; passive: Partial<ActiveModifiers>}>;

export interface WeaponTuning {
  id: string;
  weaponClass: WeaponClassId;
  level: number;
  name: string;
  description: string;
  traitUnlocked: boolean;
  reinforced: boolean;
  perfected: boolean;
}

export function weaponTuning(state: GameState): WeaponTuning | null {
  const id = state.equippedGear.weapon ?? "";
  const item = getItem(id);
  if (item?.type !== "Weapon" || !item.weaponClass || !(item.weaponClass in weaponClassIdentity)) return null;
  const profile = weaponClassIdentity[item.weaponClass];
  const level = Math.max(0, Math.min(item.maxUpgradeLevel ?? 10, state.upgradeLevels[id] ?? 0));
  return {
    id, weaponClass: item.weaponClass, level,
    name: profile.name, description: profile.description,
    traitUnlocked: level >= 3,
    reinforced: level >= 6,
    perfected: level >= 9,
  };
}

export function equipmentIdentityModifiers(state: GameState): Array<{ label: string; bonuses: Partial<ActiveModifiers> }> {
  const active: Array<{label: string; bonuses: Partial<ActiveModifiers>}> = [];
  for (const set of equippedArmorSetProgress(state)) {
    const profile = armorSetIdentity[set.name];
    for (const tier of set.activeTiers) {
      const bonuses = tier === 2 ? profile.two : tier === 3 ? profile.three : profile.five;
      active.push({ label: `${set.name} ${tier}/5`, bonuses });
    }
  }
  const tuning = weaponTuning(state);
  if (tuning?.traitUnlocked) active.push({ label: `${tuning.name} +3`, bonuses: weaponClassIdentity[tuning.weaponClass].passive });
  if (tuning?.reinforced) active.push({ label: "Weapon reinforced +6", bonuses: { combatDamage: .012 } });
  if (tuning?.perfected) active.push({ label: "Weapon perfected +9", bonuses: { combatAttackSpeed: .012 } });
  return active;
}
