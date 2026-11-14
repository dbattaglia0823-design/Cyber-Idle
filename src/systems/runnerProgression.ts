import { attributePointBudget, perkPointBudget } from "../data/characterBuild";
import { getItem } from "../data/items";
import { attributeDefinitions } from "../data/rpgCampaign";
import type { AttributeId } from "../rpgTypes";
import type { GameState, ItemDefinition } from "../types";

// Keep the city's 150-level content scale, driven by the 30-level runner profile.
export function runnerCombatLevel(state: GameState) {
  return 1 + (state.rpg.level - 1) * 5;
}

export function itemAttributeRequirement(item: ItemDefinition) {
  let attribute: AttributeId = "technical";
  if (item.type === "Armor") attribute = "body";
  if (item.type === "Weapon") {
    attribute = item.weaponClass === "bluntWeapons" || item.weaponClass === "heavyWeapons" ? "body"
      : item.weaponClass === "smartWeapons" ? "intelligence" : "reflexes";
  }
  // A 40-point runner build must be able to equip district gear without
  // mandatory high investment in Body, Reflexes and Technical simultaneously.
  // Item progression is still gated by district and crafting skill requirements.
  const maximum = item.type === "Armor" ? 10 : item.type === "Weapon" ? 12 : item.type === "Cyberware" ? 12 : 18;
  const level = !item.requiredSkill ? 3 : Math.min(maximum, 3 + Math.floor(((item.requiredLevel ?? 1) - 1) / 10));
  return { attribute, level, label: `${attributeDefinitions.find(entry => entry.id === attribute)!.name} ${level}` };
}

export function meetsItemAttributeRequirement(state: GameState, item: ItemDefinition) {
  const requirement = itemAttributeRequirement(item);
  return state.rpg.attributes[requirement.attribute] >= requirement.level;
}

export function upgradeTechnicalRequirement(state: GameState, nextLevel: number) {
  return Math.max(3, nextLevel + 2 - (state.rpg.perks.tinkerer ? 2 : 0));
}

// Reconcile old point grants and imported saves with the lifetime build budget.
// Keep legal builds; refund an over-budget build so the player can choose again.
export function enforceCharacterPointBudget(state: GameState) {
  const attributes = attributePointBudget(state.rpg.level);
  const perks = perkPointBudget(state.rpg.level);
  const spentAttributes = Object.values(state.rpg.attributes).reduce((sum, value) => sum + Math.max(0, value - 3), 0);
  const spentPerks = Object.values(state.rpg.perks).filter(Boolean).length;
  if (spentAttributes > attributes || spentPerks > perks) {
    for (const id of Object.keys(state.rpg.attributes) as AttributeId[]) state.rpg.attributes[id] = 3;
    state.rpg.perks = {};
    state.rpg.attributePoints = attributes;
    state.rpg.perkPoints = perks;
    state.rpg.active = null;
    const eligible = ([, id]: [string, string]) => {
      const item = getItem(id);
      return Boolean(item && meetsItemAttributeRequirement(state, item));
    };
    state.equippedGear = Object.fromEntries(Object.entries(state.equippedGear).filter(eligible));
    state.equippedCyberware = Object.fromEntries(Object.entries(state.equippedCyberware).filter(eligible));
    return true;
  }
  state.rpg.attributePoints = Math.min(state.rpg.attributePoints, attributes - spentAttributes);
  state.rpg.perkPoints = Math.min(state.rpg.perkPoints, perks - spentPerks);
  return false;
}
