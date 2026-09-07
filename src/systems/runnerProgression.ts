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
  // Guaranteed mission equipment remains usable immediately.
  const level = !item.requiredSkill ? 3 : Math.min(18, 3 + Math.floor(((item.requiredLevel ?? 1) - 1) / 10));
  return { attribute, level, label: `${attributeDefinitions.find(entry => entry.id === attribute)!.name} ${level}` };
}

export function meetsItemAttributeRequirement(state: GameState, item: ItemDefinition) {
  const requirement = itemAttributeRequirement(item);
  return state.rpg.attributes[requirement.attribute] >= requirement.level;
}

export function upgradeTechnicalRequirement(state: GameState, nextLevel: number) {
  return Math.max(3, nextLevel + 2 - (state.rpg.perks.tinkerer ? 2 : 0));
}
