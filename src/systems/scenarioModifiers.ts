import { getItem } from "../data/items";
import type { ActiveModifiers, GameState, ScenarioModifier } from "../types";

export interface ScenarioBonus {
  modifiers: Partial<ActiveModifiers>;
  damageBonus: number;
  successChance: number;
  heatChange: number;
  dropChance: number;
  sources: string[];
}

export function scenarioBonusForTags(state: GameState, tags: string[] = []): ScenarioBonus {
  const bonus: ScenarioBonus = { modifiers: {}, damageBonus: 0, successChance: 0, heatChange: 0, dropChance: 0, sources: [] };
  const weaponId = state.equippedGear.weapon;
  const equipped = [
    weaponId,
    ...Object.values(state.weaponLoadouts[weaponId ?? ""]?.attachments ?? {}),
    ...(state.weaponLoadouts[weaponId ?? ""]?.mods ?? []),
  ].filter(Boolean) as string[];

  equipped.forEach((itemId) => {
    const item = getItem(itemId);
    item?.scenarioModifiers?.forEach((modifier) => mergeScenarioModifier(bonus, modifier, tags, item.name));
    if (item?.tags.includes("stealth") && tags.includes("stealth")) {
      bonus.successChance += 0.02;
      bonus.heatChange -= 0.03;
      bonus.sources.push(`${item.name} stealth`);
    }
    if (item?.tags.includes("boss") && (tags.includes("boss") || tags.includes("operation"))) {
      bonus.damageBonus += 0.04;
      bonus.sources.push(`${item.name} bossing`);
    }
    if (item?.tags.includes("drone") && (tags.includes("drone") || tags.includes("mech"))) {
      bonus.damageBonus += 0.04;
      bonus.dropChance += 0.02;
      bonus.sources.push(`${item.name} drone hunter`);
    }
    if (item?.tags.includes("blacknet") && tags.includes("blacknet")) {
      bonus.successChance += 0.03;
      bonus.heatChange -= 0.03;
      bonus.sources.push(`${item.name} blacknet`);
    }
    if (item?.tags.includes("armorPiercing") && (tags.includes("corporate") || tags.includes("armorPiercing"))) {
      bonus.damageBonus += 0.03;
      bonus.sources.push(`${item.name} armor pierce`);
    }
  });

  return bonus;
}

function mergeScenarioModifier(target: ScenarioBonus, modifier: ScenarioModifier, tags: string[], source: string) {
  if (!modifier.tags.some((tag) => tags.includes(tag))) return;
  target.damageBonus += modifier.damageBonus ?? 0;
  target.successChance += modifier.successChance ?? 0;
  target.heatChange += modifier.heatChange ?? 0;
  target.dropChance += modifier.dropChance ?? 0;
  Object.entries(modifier.modifiers ?? {}).forEach(([key, value]) => {
    if (key === "skillXp" || key === "activeSources" || typeof value !== "number") return;
    const id = key as keyof ActiveModifiers;
    target.modifiers[id] = ((target.modifiers[id] as number | undefined) ?? 0) + value as never;
  });
  target.sources.push(source);
}
