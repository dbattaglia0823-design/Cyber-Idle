import { cyberdecks } from "../data/cyberdecks";
import { districtProgressionOrder } from "../data/districtProgressionOrder";
import type { Quickhack } from "../data/quickhacks";
import type { TacticalAction } from "../rpgTypes";
import { quickhacks } from "../data/quickhacks";
import { getItem } from "../data/items";
import { cloneState } from "./gameState";
import { addItem } from "./collectionSystem";
import type { GameState, ItemDefinition } from "../types";
export function deckCapacity(item?: ItemDefinition) {
  if (item?.type !== "Cyberware" || item.slot !== "operatingSystem") return 0;
  const spec = cyberdecks.find(deck => deck.id === item.id);
  if (spec) return spec.slots;
  if (item.id === "rpg-afterimage-os") return 6;
  const isDeck = item.id === "rpg-afterimage-os" || Boolean(item.modifiers?.skillXp?.hacking);
  return isDeck ? Math.min(4, 2 + Math.floor((item.tier ?? 1) / 3)) : 0;
}
export function equippedDeck(state: GameState) {
  const item = getItem(state.equippedCyberware.operatingSystem ?? "");
  return deckCapacity(item) ? item : undefined;
}
export function installedQuickhacks(state: GameState) {
  const deck = equippedDeck(state);
  if (!deck) return [];
  return (state.rpg.quickhackLoadouts?.[deck.id] ?? []).slice(0, deckCapacity(deck)).flatMap(id => {
    const hack = quickhacks.find(h => h.id === id);
    return hack && state.inventory[id] > 0 ? [hack] : [];
  });
}
export function installQuickhack(state: GameState, id: string) {
  const deck = equippedDeck(state);
  if (state.rpg.active || !deck || !quickhacks.some(h => h.id === id) || !(state.inventory[id] > 0)) return state;
  const installed = installedQuickhacks(state).map(h => h.id as string);
  const family = quickhacks.find(h => h.id === id)!.family;
  const sameFamily = installedQuickhacks(state).find(h => h.family === family);
  if (installed.includes(id) || (!sameFamily && installed.length >= deckCapacity(deck))) return state;
  const next = cloneState(state);
  next.rpg.quickhackLoadouts = { ...next.rpg.quickhackLoadouts, [deck.id]: [...installed.filter(entry => entry !== sameFamily?.id), id] };
  return next;
}
export function removeQuickhack(state: GameState, id: string) {
  const deck = equippedDeck(state);
  if (state.rpg.active || !deck) return state;
  const next = cloneState(state);
  next.rpg.quickhackLoadouts = { ...next.rpg.quickhackLoadouts, [deck.id]: installedQuickhacks(state).filter(h => h.id !== id).map(h => h.id) };
  return next;
}
export function canCraftQuickhack(state: GameState, id: string) {
  const hack = quickhacks.find(h => h.id === id);
  return Boolean(hack && softwareStageUnlocked(state, hack.stage) && !state.rpg.active && !(state.inventory[id] > 0) && state.rpg.attributes.technical >= hack.technical && state.resources.credits >= hack.cost.credits && (state.resources.encryptedData ?? 0) >= hack.cost["encryptedData"]);
}
export function craftQuickhack(state: GameState, id: string) {
  if (!canCraftQuickhack(state, id)) return state;
  const hack = quickhacks.find(h => h.id === id)!;
  const next = cloneState(state);
  next.resources.credits -= hack.cost.credits;
  next.resources.encryptedData -= hack.cost["encryptedData"];
  addItem(next, id);
  return next;
}
export function grantStarterQuickhacks(state: GameState) {
  addItem(state, "entry-cyberdeck");
  for (const hack of quickhacks.slice(0, 2)) addItem(state, hack.id);
  if (!state.equippedCyberware.operatingSystem) state.equippedCyberware.operatingSystem = "entry-cyberdeck";
  state.rpg.quickhackLoadouts = { ...state.rpg.quickhackLoadouts, "entry-cyberdeck": quickhacks.slice(0, 2).map(h => h.id) };
  const deck = equippedDeck(state);
  if (deck) state.rpg.quickhackLoadouts[deck.id] = quickhacks.slice(0, 2).map(h => h.id);
  state.rpg.quickhackVersion = 1;
}

export function softwareStageUnlocked(state: GameState, stage: number) { return Boolean(state.districts[districtProgressionOrder[stage]]?.unlocked); }
export function canBuySoftware(state: GameState, id: string) {
  const entry = quickhacks.find(h => h.id === id) ?? cyberdecks.find(deck => deck.id === id);
  return Boolean(entry && !state.rpg.active && !(state.inventory[id] > 0) && softwareStageUnlocked(state, entry.stage) && state.resources.credits >= entry.price);
}
export function buySoftware(state: GameState, id: string) {
  if (!canBuySoftware(state, id)) return state;
  const entry = quickhacks.find(h => h.id === id) ?? cyberdecks.find(deck => deck.id === id)!;
  const next = cloneState(state); next.resources.credits -= entry.price; addItem(next, id); return next;
}
export function deckBonuses(state: GameState) {
  const item = equippedDeck(state), spec = cyberdecks.find(deck => deck.id === item?.id);
  if (spec) return spec;
  if (item?.id === "rpg-afterimage-os") return { ram: 8, damage: .3, recovery: 1, discount: 1 };
  return { ram: item ? Math.min(6, (item.tier ?? 1) + 1) : 0, damage: 0, recovery: 0, discount: 0 };
}
export function quickhackRamCost(state: GameState, hack: Quickhack) { return Math.max(1, hack.ram - deckBonuses(state).discount - (state.rpg.perks.compression ? 1 : 0)); }
export function ramRecovery(state: GameState) { return equippedDeck(state) ? (state.rpg.perks["ram-recycler"] ? 2 : 1) + deckBonuses(state).recovery + (state.rpg.perks["neural-sovereign"] ? 1 : 0) : 0; }
export function quickhackForAction(state: GameState, action: TacticalAction) {
  return installedQuickhacks(state).find(hack => action.startsWith("quickhack:") ? hack.id === action.slice(10) : hack.action === action);
}
