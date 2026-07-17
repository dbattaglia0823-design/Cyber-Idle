import { getItem } from "../data/items";
import { weaponClasses } from "../data/weaponClasses";
import { unlockAchievement } from "./achievements";
import { addItem, removeItem } from "./collectionSystem";
import { cloneState, pushCategorizedLog } from "./gameState";
import { getXpForLevel } from "./xpCurves";
import type { AttachmentCategory, GameState, ItemDefinition, WeaponClassId } from "../types";

export function weaponXpForNextLevel(level: number) {
  return getXpForLevel(level, "weaponClass");
}

export function equippedWeapon(state: GameState) {
  return getItem(state.equippedGear.weapon ?? "");
}

export function equippedWeaponClass(state: GameState): WeaponClassId | null {
  return equippedWeapon(state)?.weaponClass ?? "bluntWeapons";
}

export function addWeaponClassXp(state: GameState, weaponClass: WeaponClassId, xp: number, manuallyUsed = true) {
  const current = state.weaponClasses[weaponClass] ?? { level: 1, xp: 0, manuallyUsed: false, milestones: {} };
  current.xp += Math.max(0, Math.round(xp));
  current.manuallyUsed = current.manuallyUsed || manuallyUsed;
  let levels = 0;
  while (current.xp >= weaponXpForNextLevel(current.level) && current.level < 99) {
    current.xp -= weaponXpForNextLevel(current.level);
    current.level += 1;
    levels += 1;
  }
  state.weaponClasses[weaponClass] = current;
  unlockWeaponMilestones(state, weaponClass);
  if (levels) pushCategorizedLog(state, "Combat", `${weaponClassName(weaponClass)} reached weapon class level ${current.level}.`);
  if (current.level >= 10) unlockAchievement(state, "weapon-class-10", "Reach Weapon Class Level 10");
  if (current.level >= 50) unlockAchievement(state, "weapon-class-50", "Reach Weapon Class Level 50");
  if (current.level >= 99) unlockAchievement(state, "weapon-class-99", "Reach Weapon Class Level 99");
}

export function weaponClassBonus(state: GameState, weaponClass: WeaponClassId) {
  const level = state.weaponClasses[weaponClass]?.level ?? 1;
  return {
    damage: Math.floor(level / 5) * 0.01,
    unarmedDamage: weaponClass === "bluntWeapons" ? Math.floor(level / 4) : 0,
    dropChance: Math.floor(level / 25) * 0.01,
    jobSuccess: Math.floor(level / 20) * 0.01,
  };
}

export function installAttachment(state: GameState, weaponId: string, attachmentId: string) {
  const weapon = getItem(weaponId);
  const attachment = getItem(attachmentId);
  if (!isWeapon(weapon) || !isAttachment(attachment) || !attachment.attachmentCategory) return state;
  if (!weapon.attachmentSlots?.includes(attachment.attachmentCategory)) return state;
  if (!attachment.compatibleWeaponClasses?.includes(weapon.weaponClass!)) return state;
  if ((state.inventory[attachmentId] ?? 0) <= 0) return state;
  const next = cloneState(state);
  const loadout = next.weaponLoadouts[weaponId] ?? { attachments: {}, mods: [] };
  const replaced = loadout.attachments[attachment.attachmentCategory];
  if (replaced) addItem(next, replaced, 1);
  removeItem(next, attachmentId, 1);
  loadout.attachments[attachment.attachmentCategory] = attachmentId;
  next.weaponLoadouts[weaponId] = loadout;
  next.weaponStatistics.modsInstalled += 1;
  unlockAchievement(next, "first-weapon-attachment", "Install First Attachment");
  pushCategorizedLog(next, "World", `Installed ${attachment.name} on ${weapon.name}.`);
  return next;
}

export function removeAttachment(state: GameState, weaponId: string, category: AttachmentCategory) {
  const loadout = state.weaponLoadouts[weaponId];
  const attachmentId = loadout?.attachments[category];
  if (!attachmentId) return state;
  const next = cloneState(state);
  delete next.weaponLoadouts[weaponId].attachments[category];
  addItem(next, attachmentId, 1);
  pushCategorizedLog(next, "World", `Removed ${getItem(attachmentId)?.name ?? attachmentId}.`);
  return next;
}

export function installWeaponMod(state: GameState, weaponId: string, modId: string) {
  const weapon = getItem(weaponId);
  const mod = getItem(modId);
  if (!isWeapon(weapon) || !isWeaponMod(mod)) return state;
  if (!mod.compatibleWeaponClasses?.includes(weapon.weaponClass!)) return state;
  if ((state.inventory[modId] ?? 0) <= 0) return state;
  const loadout = state.weaponLoadouts[weaponId] ?? { attachments: {}, mods: [] };
  if (loadout.mods.length >= (weapon.modSlots ?? 0)) return state;
  const next = cloneState(state);
  const nextLoadout = next.weaponLoadouts[weaponId] ?? { attachments: {}, mods: [] };
  removeItem(next, modId, 1);
  nextLoadout.mods = [...nextLoadout.mods, modId];
  next.weaponLoadouts[weaponId] = nextLoadout;
  next.weaponStatistics.modsInstalled += 1;
  unlockAchievement(next, "first-weapon-mod", "Install First Weapon Mod");
  pushCategorizedLog(next, "World", `Installed ${mod.name} on ${weapon.name}.`);
  return next;
}

export function removeWeaponMod(state: GameState, weaponId: string, modId: string) {
  const loadout = state.weaponLoadouts[weaponId];
  if (!loadout?.mods.includes(modId)) return state;
  const next = cloneState(state);
  next.weaponLoadouts[weaponId].mods = next.weaponLoadouts[weaponId].mods.filter((id) => id !== modId);
  addItem(next, modId, 1);
  pushCategorizedLog(next, "World", `Removed ${getItem(modId)?.name ?? modId}.`);
  return next;
}

export function compatibleAttachments(state: GameState, weaponId: string) {
  const weapon = getItem(weaponId);
  if (!isWeapon(weapon)) return [];
  return Object.keys(state.inventory).filter((itemId) => {
    const item = getItem(itemId);
    return isAttachment(item) && item.attachmentCategory && weapon.attachmentSlots?.includes(item.attachmentCategory) && item.compatibleWeaponClasses?.includes(weapon.weaponClass!);
  });
}

export function compatibleMods(state: GameState, weaponId: string) {
  const weapon = getItem(weaponId);
  if (!isWeapon(weapon)) return [];
  return Object.keys(state.inventory).filter((itemId) => {
    const item = getItem(itemId);
    return isWeaponMod(item) && item.compatibleWeaponClasses?.includes(weapon.weaponClass!);
  });
}

function unlockWeaponMilestones(state: GameState, weaponClass: WeaponClassId) {
  const classState = state.weaponClasses[weaponClass];
  const definition = weaponClasses.find((entry) => entry.id === weaponClass);
  definition?.milestones.forEach((milestone) => {
    if (classState.level < milestone.level || classState.milestones[milestone.level]) return;
    classState.milestones[milestone.level] = true;
    pushCategorizedLog(state, "Combat", `${definition.name} milestone: ${milestone.name}.`);
  });
}

function isWeapon(item?: ItemDefinition): item is ItemDefinition & { weaponClass: WeaponClassId } {
  return item?.type === "Weapon" && Boolean(item.weaponClass);
}

function isAttachment(item?: ItemDefinition): item is ItemDefinition {
  return item?.type === "WeaponAttachment";
}

function isWeaponMod(item?: ItemDefinition): item is ItemDefinition {
  return item?.type === "WeaponMod";
}

function weaponClassName(id: WeaponClassId) {
  return weaponClasses.find((entry) => entry.id === id)?.name ?? id;
}
