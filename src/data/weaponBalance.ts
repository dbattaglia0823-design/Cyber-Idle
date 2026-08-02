import type { ItemStats, WeaponClassId } from "../types";

// Equipment requirements follow the earliest reliable acquisition source, rather
// than rarity alone. District bands are Neon 1-20, Rust 21-40, Underpass 41-60,
// Blacknet 61-80, Helix 81-100, Glassline 101-120, Redline 121-140, and Skyline
// 141-160. Keeping this in one table also lets item cards and recipes agree.
const weaponAcquisitionLevels: Record<string, number> = {
  "rusted-pistol": 1,
  "street-knife": 1,
  "scrap-baton": 3,
  "junk-smg": 5,
  "sawed-off-shotgun": 44,
  "modified-smg": 124,
  "reinforced-blade": 124,
  "shock-baton": 24,
  "street-rifle": 10,
  "cheap-smart-pistol": 64,
  "low-end-tech-pistol": 104,
  "smartlink-revolver": 64,
  "scrap-shotgun": 24,
  "blacknet-spike-deck": 64,
  "pulse-rifle": 104,
  "monowire-knockoff": 44,
  "armor-piercing-rifle": 104,
  "suppressed-precision-pistol": 44,
  "heavy-breacher": 18,

  "compact-holdout": 1,
  "redline-burst-pistol": 10,
  "apex-duelist-pistol": 150,
  "sprayline-smg": 3,
  "ghost-market-vector": 44,
  "yard-lmg": 24,
  "blacksite-lmg": 140,
  "glassline-sniper": 104,
  "phase-katana": 60,
  "gravity-maul": 30,
  "coil-lance": 104,
  "swarmtag-carbine": 64,
  "daemon-exec-deck": 80,
  "redline-viper": 124,
  "glassline-judge": 104,
  "pulse-repeater": 44,
  "neon-splitter": 10,
  "ghostline-ripper": 44,
  "vector-bloom": 64,
  "chrome-jackal-ar": 40,
  "black-badge-carbine": 104,
  "overwatch-helix": 96,
  "scrapstorm-lmg": 30,
  "redline-siege-platform": 140,
  "apex-rotary-frame": 144,
  "backroom-breacher": 10,
  "rampage-pattern": 124,
  "thundercoil-scattergun": 144,
  "glassline-marksman": 104,
  "midnight-protocol": 104,
  "red-horizon-tac": 150,
  "neon-fang": 18,
  "redline-monowake": 124,
  "phase-edge": 80,
  "impact-driver": 40,
  "jackal-maul": 30,
  "grav-piston-hammer": 124,
  "railspike-vx": 40,
  "white-arc-lance": 104,
  "nullbreaker-coilgun": 144,
  "streetseeker-c9": 64,
  "ghostlink-swarm": 44,
  "hive-oracle": 64,
};

export function weaponAcquisitionLevel(id: string, fallback: number) {
  return weaponAcquisitionLevels[id] ?? fallback;
}

// attackSpeed is an adjustment to the 3,000 ms base attack interval. Negative
// values attack faster; positive values attack slower. These profiles give every
// weapon a readable firing identity while still allowing individually-authored
// weapons (revolvers, burst pistols, heavy blades, etc.) to override the default.
const defaultAttackSpeedByClass: Record<WeaponClassId, number> = {
  pistols: -60,
  smgs: -320,
  shotguns: 340,
  assaultRifles: -80,
  sniperRifles: 520,
  blades: -180,
  bluntWeapons: 300,
  techWeapons: 340,
  smartWeapons: -120,
  heavyWeapons: 460,
  cyberdeckWeapons: 80,
  exoticWeapons: -140,
};

// Heavy Weapons includes both slow breaching weapons and automatic support guns.
// LMGs and rotary weapons need their own fast-fire identity and lower per-hit damage.
const automaticHeavyTuning: Record<string, number> = {
  "yard-lmg": -260,
  "blacksite-lmg": -320,
  "scrapstorm-lmg": -300,
  "redline-siege-platform": -360,
  "apex-rotary-frame": -450,
};

const damageFactorByClass: Record<WeaponClassId, number> = {
  pistols: 0.92,
  smgs: 0.72,
  shotguns: 1.28,
  assaultRifles: 1,
  sniperRifles: 1.45,
  blades: 1.02,
  bluntWeapons: 1.3,
  techWeapons: 1.32,
  smartWeapons: 0.8,
  heavyWeapons: 1.35,
  cyberdeckWeapons: 0.9,
  exoticWeapons: 1.08,
};

export function balancedWeaponStats(
  id: string,
  weaponClass: WeaponClassId,
  stats: ItemStats = {},
  requiredLevel = 1,
  tier = 1,
): ItemStats {
  const automaticHeavy = automaticHeavyTuning[id];
  let attackSpeed = automaticHeavy ?? stats.attackSpeed ?? defaultAttackSpeedByClass[weaponClass];
  if (weaponClass === "smgs") attackSpeed = Math.min(attackSpeed, -300);
  if (weaponClass === "shotguns") attackSpeed = Math.max(attackSpeed, 280);
  if (weaponClass === "sniperRifles") attackSpeed = Math.max(attackSpeed, 450);
  if (weaponClass === "bluntWeapons") attackSpeed = Math.max(attackSpeed, 220);
  if (weaponClass === "techWeapons") attackSpeed = Math.max(attackSpeed, 260);
  if (weaponClass === "smartWeapons" && id !== "smartlink-revolver") attackSpeed = Math.min(attackSpeed, -100);

  // Per-hit damage rises steadily with the level at which the weapon first becomes
  // obtainable. Slow archetypes hit harder; automatic weapons exchange damage for
  // their shorter attack interval. Tier is deliberately a small bonus so an early
  // rare cannot overpower loot from a later district.
  const classFactor = automaticHeavy ? 0.72 : damageFactorByClass[weaponClass];
  const tierFactor = 1 + Math.max(0, tier - 1) * 0.025;
  const damage = Math.max(1, Math.round((4 + requiredLevel * 0.52) * classFactor * tierFactor));

  return { ...stats, damage, attackSpeed };
}
