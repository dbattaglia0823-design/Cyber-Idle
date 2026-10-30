import type { GameState } from "../types";
import type { AttributeId } from "../rpgTypes";
import { playerCombatStats } from "./formulas";
import { tacticalStats, maxRam } from "./rpgSystem";

function metrics(state: GameState) {
  const stats = playerCombatStats(state), field = tacticalStats(state);
  return [
    { label: "Max HP", value: stats.maxHp, unit: "" },
    { label: "Weapon damage", value: stats.damage, unit: "" },
    { label: "Armor", value: stats.armor, unit: "" },
    { label: "Attack interval", value: Number((stats.attackSpeedMs / 1000).toFixed(3)), unit: "s" },
    { label: "Field damage", value: field.damage, unit: "" },
    { label: "Hack damage", value: field.hack, unit: "" },
    { label: "RAM", value: maxRam(state), unit: "" },
    { label: "Field mitigation", value: Number((field.mitigation * 100).toFixed(2)), unit: "%" },
    { label: "Injector healing", value: Number((field.heal * 100).toFixed(2)), unit: "%" },
    { label: "Upgrade limit", value: Math.min(10, state.rpg.attributes.technical - 2 + (state.rpg.perks.tinkerer ? 2 : 0)), unit: "" },
  ];
}

export function attributePreview(state: GameState, attribute: AttributeId) {
  if (state.rpg.attributes[attribute] >= 20) return [];
  const preview = { ...state, rpg: { ...state.rpg, attributes: { ...state.rpg.attributes, [attribute]: state.rpg.attributes[attribute] + 1 } } };
  const before = metrics(state), after = metrics(preview);
  return before.flatMap((metric, index) => metric.value === after[index].value ? [] : [{ label: metric.label, before: metric.value, after: after[index].value, unit: metric.unit }]);
}
