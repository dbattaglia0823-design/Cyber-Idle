import { canonicalWeaponId, legacyWeaponAliases } from "../data/items";
import { legacyRecipeAliases } from "../data/recipes";
import type { GameState, WeaponLoadoutState } from "../types";

// Many retired models can map to the same live variant. Quantities are summed,
// highest upgrades retained, and displaced installed parts returned to inventory.
export function migrateRetiredWeapons(state: GameState) {
  const equipped = state.equippedGear.weapon;
  const returnParts = (loadout: WeaponLoadoutState) => {
    for (const id of [...Object.values(loadout.attachments ?? {}), ...(loadout.mods ?? [])]) state.inventory[id] = (state.inventory[id] ?? 0) + 1;
  };
  for (const [old, target] of Object.entries(legacyWeaponAliases)) {
    if (state.inventory[old] !== undefined) { state.inventory[target] = (state.inventory[target] ?? 0) + state.inventory[old]; delete state.inventory[old]; }
    if (state.upgradeLevels[old] !== undefined) { state.upgradeLevels[target] = Math.max(state.upgradeLevels[target] ?? 0, state.upgradeLevels[old]); delete state.upgradeLevels[old]; }
    if (state.inventoryLocks[old]) { state.inventoryLocks[target] = true; delete state.inventoryLocks[old]; }
    if (state.discoveredItems[old]) { state.discoveredItems[target] = true; delete state.discoveredItems[old]; }
    const parts = state.weaponLoadouts[old];
    if (parts) {
      const current = state.weaponLoadouts[target];
      if (!current || equipped === old) { if (current) returnParts(current); state.weaponLoadouts[target] = { attachments: {...parts.attachments}, mods: [...parts.mods] }; }
      else returnParts(parts);
      delete state.weaponLoadouts[old];
    }
  }
  if (equipped) state.equippedGear.weapon = canonicalWeaponId(equipped);
  state.equipmentPresets = Object.fromEntries(Object.entries(state.equipmentPresets).map(([name,preset]) => [name,{...preset,gear:{...preset.gear,...(preset.gear.weapon ? {weapon:canonicalWeaponId(preset.gear.weapon)} : {})},cyberware:{...preset.cyberware}}]));
  if (state.activeCraft) state.activeCraft = {...state.activeCraft,recipeId:legacyRecipeAliases[state.activeCraft.recipeId] ?? state.activeCraft.recipeId};
  state.actionMastery = {...state.actionMastery};
  state.manualDiscovery = {...state.manualDiscovery,recipes:{...state.manualDiscovery.recipes}};
  for (const [old,target] of Object.entries(legacyRecipeAliases)) {
    if (old === target) continue;
    const progress = state.actionMastery[old];
    const current = state.actionMastery[target];
    if (progress && (!current || progress.level > current.level || (progress.level === current.level && progress.xp > current.xp))) state.actionMastery[target] = {...progress};
    delete state.actionMastery[old];
    if (state.manualDiscovery.recipes[old]) { state.manualDiscovery.recipes[target] = true; delete state.manualDiscovery.recipes[old]; }
  }
  state.blackMarketListings = state.blackMarketListings.map(entry=>({...entry,itemId:canonicalWeaponId(entry.itemId)}));
}
