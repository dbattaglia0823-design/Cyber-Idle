import { balanceConfig } from "../data/balanceConfig";

export type XpCurveType = keyof typeof balanceConfig.xpCurves;

export function getXpForLevel(level: number, curveType: XpCurveType) {
  const curve = balanceConfig.xpCurves[curveType];
  const safeLevel = Math.max(1, Math.min(curve.maxLevel, Math.floor(level)));
  const baseXp = curve.base * Math.pow(safeLevel, curve.exponent);
  return Math.floor(baseXp * idleTierMultiplier(safeLevel, curveType) * endgameCurveMultiplier(safeLevel, curveType));
}

function endgameCurveMultiplier(level: number, curveType: XpCurveType) {
  if (curveType !== "skill" || level <= 100) return 1;
  // Preserve the exact curve through level 100, then gently reduce its slope.
  // Level 150 requires roughly 10% less XP than before without a discontinuity.
  return Math.pow(100 / level, 0.25);
}

export function getSkillXpForLevel(level: number) {
  return getXpForLevel(level, "skill");
}

export function getWeaponClassXpForLevel(level: number) {
  return getXpForLevel(level, "weaponClass");
}

export function getMasteryXpForLevel(level: number) {
  return getXpForLevel(level, "mastery");
}

export function getDistrictMasteryXpForLevel(level: number) {
  return getXpForLevel(level, "districtMastery");
}

function idleTierMultiplier(level: number, curveType: XpCurveType) {
  const tier =
    level < 5 ? 0.72 :
    level < 10 ? 0.92 :
    level < 25 ? 1.12 :
    level < 50 ? 1.55 :
    level < 75 ? 2.35 :
    level < 99 ? 3.65 :
    6.25;

  if (curveType === "mastery") {
    // Starter actions award at least 10 Mastery XP, so the original 9 XP first
    // level was skipped immediately. Keep early mastery deliberate, then blend
    // back into the established curve at level 25.
    if (level < 5) return 2.6;
    if (level < 10) return 2;
    if (level < 25) return 1.75;
    return tier * 1.25;
  }
  if (curveType === "districtMastery") return tier * 1.65;
  if (curveType === "weaponClass") return tier * 1.1;
  return tier;
}

export function getTotalXpForLevel(level: number, curveType: XpCurveType) {
  let total = 0;
  for (let current = 1; current < Math.max(1, level); current += 1) {
    total += getXpForLevel(current, curveType);
  }
  return total;
}

export function getLevelFromXp(totalXp: number, curveType: XpCurveType) {
  const curve = balanceConfig.xpCurves[curveType];
  let remaining = Math.max(0, totalXp);
  let level = 1;
  while (level < curve.maxLevel && remaining >= getXpForLevel(level, curveType)) {
    remaining -= getXpForLevel(level, curveType);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpForNext: level >= curve.maxLevel ? 0 : getXpForLevel(level, curveType) };
}

export function getXpProgress(xpIntoLevel: number, level: number, curveType: XpCurveType) {
  const needed = getXpForLevel(level, curveType);
  return needed <= 0 ? 100 : Math.min(100, Math.floor((xpIntoLevel / needed) * 100));
}

export function getTotalXpForMaxLevel(curveType: XpCurveType) {
  return getTotalXpForLevel(balanceConfig.xpCurves[curveType].maxLevel, curveType);
}
