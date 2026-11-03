import type { DistrictId, ItemDefinition, ItemRarity, WeaponClassId, WeaponVariant } from "../types";
import { weaponSpecs } from "./weapons";
import { weaponClasses } from "./weaponClasses";

export const weaponDistrictOrder: DistrictId[] = ["neonRow", "rustYards", "underpassMarket", "blacknetQuarter", "helixWard", "glasslineDistrict", "redlineBlocks", "skylineCore"];
export const weaponVariants: Record<WeaponVariant, { damage: number; interval: number; crit: number; label: string }> = {
  Power: { damage: 1, interval: 1, crit: 0, label: "Heavy hits · armor penetration" },
  Rapid: { damage: .82, interval: .82, crit: 0, label: "Fast cadence · lighter hits · field attacks restore 1 RAM" },
  Precision: { damage: .88, interval: .96, crit: .12, label: "Critical focus · stronger aimed shots" },
};
// Prototype is the game's existing Iconic-equivalent tier. No parallel rarity system.
export const districtWeaponRarity: ItemRarity[] = ["Uncommon", "Rare", "Epic", "Legendary", "Prototype", "Prototype", "Prototype", "Relic"];
export const rarityWeaponQuality: Record<ItemRarity, { penetration: number; critDamage: number; cost: number }> = {
  Common: { penetration: 0, critDamage: 0, cost: 1 }, Uncommon: { penetration: 1, critDamage: .02, cost: 1.15 },
  Rare: { penetration: 2, critDamage: .05, cost: 1.35 }, Epic: { penetration: 3, critDamage: .08, cost: 1.6 },
  Legendary: { penetration: 5, critDamage: .12, cost: 2 }, Prototype: { penetration: 6, critDamage: .15, cost: 2.4 },
  Relic: { penetration: 7, critDamage: .18, cost: 3 },
};
export function weaponRarityStage(rarity: ItemRarity) {
  return { Common: 0, Uncommon: 0, Rare: 1, Epic: 2, Legendary: 3, Prototype: 4, Relic: 7 }[rarity];
}
export function weaponDistrict(item: ItemDefinition): DistrictId {
  if (item.weaponDistrict) return item.weaponDistrict;
  const spec = weaponSpecs.find(w => w.id === item.id);
  if (spec) return spec.districtId;
  if ((item.requiredLevel ?? 1) <= 5 && ["Common", "Uncommon"].includes(item.rarity)) return "neonRow";
  const aliases: Record<string, DistrictId> = { neon: "neonRow", rust: "rustYards", market: "underpassMarket", blacknet: "blacknetQuarter", medical: "helixWard", corporate: "glasslineDistrict", redline: "redlineBlocks", prototype: "skylineCore" };
  const tagged = item.tags.map(t => weaponDistrictOrder.includes(t as DistrictId) ? t as DistrictId : aliases[t]).find(Boolean);
  const signature = item.id.match(/^rpg-weapon-(\d)$/);
  const stage = signature ? Math.max(0, Number(signature[1]) - 1) : tagged ? weaponDistrictOrder.indexOf(tagged) : Math.max(0, Math.min(7, Math.floor(((item.requiredLevel ?? 1) - 1) / 20)));
  return weaponDistrictOrder[Math.max(stage, signature ? 0 : weaponRarityStage(item.rarity))];
}

export function expandWeaponVariants(source: ItemDefinition[]): ItemDefinition[] {
  const names = new Map<string, number>();
  for (const item of source.filter(item => item.type === "Weapon")) names.set(item.name, (names.get(item.name) ?? 0) + 1);
  return source.flatMap(item => {
    if (item.type !== "Weapon") return [item];
    const district = weaponDistrict(item);
    const spec = weaponSpecs.find(w => w.id === item.id);
    const stage = weaponDistrictOrder.indexOf(district);
    const rarity = item.weaponDistrict ? item.rarity : spec ? (stage === 0 && spec.requiredLevel === 1 ? "Common" : districtWeaponRarity[stage]) : item.rarity;
    const quality = rarityWeaponQuality[rarity];
    const stats = { ...item.stats };
    // Keep legacy IDs and raw damage. Quality adds utility rather than damage inflation.
    if (spec || item.id.startsWith(district + "-")) {
      stats.armorPenetration = (stats.armorPenetration ?? 0) + quality.penetration;
      stats.critDamage = (stats.critDamage ?? 0) + quality.critDamage;
    }
    return (Object.keys(weaponVariants) as WeaponVariant[]).map(variant => {
      const profile = weaponVariants[variant];
      return { ...item, id: variant === "Power" ? item.id : `${item.id}-${variant.toLowerCase()}`,
        name: `${item.name}${(names.get(item.name) ?? 0) > 1 ? ` (${weaponClasses.find(entry => entry.id === item.weaponClass)?.name ?? item.weaponClass})` : ""} · ${variant}`, rarity, weaponModel: item.id, weaponVariant: variant, weaponDistrict: district,
        tags: [...item.tags, variant.toLowerCase(), district],
        stats: { ...stats, damage: Number(((stats.damage ?? 0) * profile.damage).toFixed(2)),
          attackSpeed: Math.round((1600 + (stats.attackSpeed ?? 0)) * profile.interval - 1600),
          critChance: Math.min(.45, (stats.critChance ?? 0) + profile.crit),
          armorPenetration: (stats.armorPenetration ?? 0) + (variant === "Power" ? 2 : 0) },
        specialEffect: !item.specialEffect && spec && stage >= 3 ? `Breach calibration: +${quality.penetration} armor penetration; +${Math.round(quality.critDamage * 100)}% critical damage.` : item.specialEffect,
      };
    });
  });
}

export const specialtyModels: Array<{ id: string; name: string; weaponClass: WeaponClassId; stage: number; damage: number; speed: number; crit: number; penetration: number }> = [
  { id: "longwatch", name: "Longwatch", weaponClass: "sniperRifles", stage: 1, damage: 1.38, speed: 420, crit: .08, penetration: 2 },
  { id: "pile-driver", name: "Pile Driver", weaponClass: "bluntWeapons", stage: 0, damage: 1.18, speed: 200, crit: .01, penetration: 4 },
  { id: "arc-lance", name: "Arc Lance", weaponClass: "techWeapons", stage: 1, damage: 1.08, speed: 180, crit: .02, penetration: 7 },
  { id: "seeker", name: "Seeker", weaponClass: "smartWeapons", stage: 1, damage: .9, speed: -80, crit: .04, penetration: 1 },
  { id: "bastion", name: "Bastion", weaponClass: "heavyWeapons", stage: 1, damage: 1.5, speed: 580, crit: .01, penetration: 5 },
  { id: "daemon", name: "Daemon", weaponClass: "cyberdeckWeapons", stage: 3, damage: 1, speed: 80, crit: .04, penetration: 4 },
  { id: "anomaly", name: "Anomaly", weaponClass: "exoticWeapons", stage: 4, damage: 1.15, speed: 220, crit: .06, penetration: 4 },
];
export function districtSpecialtyWeapons(existing: ItemDefinition[] = []): ItemDefinition[] {
  const firstAvailable = new Map<WeaponClassId, number>();
  for (const item of existing.filter(item => item.type === "Weapon" && item.weaponClass)) {
    const stage = weaponDistrictOrder.indexOf(weaponDistrict(item));
    firstAvailable.set(item.weaponClass!, Math.min(firstAvailable.get(item.weaponClass!) ?? 7, stage));
  }
  const themes = ["Lowglow", "Jackal", "Silk", "Null", "Suture", "Executive", "Saint", "Apex"];
  const power = [6, 13, 16, 24, 27, 40, 46, 66];
  const levels = [6, 24, 44, 64, 84, 104, 124, 144];
  return weaponDistrictOrder.flatMap((district, stage) => specialtyModels.filter(model => Math.min(model.stage, firstAvailable.get(model.weaponClass) ?? model.stage) <= stage).map(model => ({
    id: `${district}-${model.id}`, name: `${themes[stage]} ${model.name}`, description: `A ${themes[stage]} district-pattern ${model.name.toLowerCase()}.`,
    type: "Weapon" as const, rarity: districtWeaponRarity[stage], tags: ["weapon", "combat", district, model.weaponClass === "bluntWeapons" ? "melee" : "ranged"],
    stackable: false, sellValue: 60 + stage * 100, sourceHint: `Local district crafting, arms dealers and enemy loot.`,
    slot: "weapon" as const, tier: Math.min(7, stage + 1), requiredSkill: "combat" as const, requiredLevel: levels[stage],
    weaponClass: model.weaponClass, attachmentSlots: ["grip" as const, "batteryCore" as const], modSlots: Math.min(3, stage + 1), maxUpgradeLevel: 10,
    stats: { damage: Math.round(power[stage] * model.damage), attackSpeed: model.speed, critChance: model.crit, armorPenetration: model.penetration + stage, accuracy: model.weaponClass === "smartWeapons" ? 12 + stage : 2 + stage },
  })));
}

export function weaponDropFitsDistrict(item: ItemDefinition, district: DistrictId) {
  const stage = weaponDistrictOrder.indexOf(district);
  const floor = [0, 0, 0, 1, 2, 2, 3, 3][stage];
  return !item.iconic && item.weaponDistrict === district && weaponRarityStage(item.rarity) >= floor;
}

// One active model per district/category. Legacy rows are templates and save
// aliases only; they are never exported as additional inventory items.
export function consolidateWeaponModels(source: ItemDefinition[]) {
  const themes = ["Lowglow", "Jackal", "Silk", "Null", "Suture", "Executive", "Saint", "Apex"];
  const labels: Record<WeaponClassId,string> = { pistols:"Sidearm", smgs:"Storm", assaultRifles:"Carbine", shotguns:"Breacher", blades:"Edge", bluntWeapons:"Pile Driver", sniperRifles:"Longwatch", techWeapons:"Arc Lance", smartWeapons:"Seeker", heavyWeapons:"Bastion", cyberdeckWeapons:"Daemon", exoticWeapons:"Anomaly" };
  const rifles = ["street-rifle","hauler-carbine","contraband-lancer","null-choir-rifle","helix-pulse-rifle","corporate-verdict","redline-dominion","skyline-zero"];
  const classes: Record<string,WeaponClassId> = { Pistol:"pistols", SMG:"smgs", Rifle:"assaultRifles", Shotgun:"shotguns", Melee:"blades" };
  const models: ItemDefinition[] = [];
  for (const [stage,district] of weaponDistrictOrder.entries()) {
    const local = source.filter(item=>item.type==="Weapon" && weaponDistrict(item)===district);
    for (const category of [...new Set(local.map(item=>item.weaponClass!))]) {
      const preferred = category==="assaultRifles" ? rifles[stage] : stage===0 && category==="pistols" ? "rpg-weapon-0" : stage===0 && category==="blades" ? "street-knife" : stage===0 && category==="bluntWeapons" ? "servo-knuckles" : weaponSpecs.find(spec=>spec.districtId===district && classes[spec.weaponClass]===category)?.id;
      const family = local.filter(item=>item.weaponClass===category);
      const template = family.find(item=>item.id===preferred) ?? family.find(item=>item.id.startsWith(district+"-")) ?? family[0];
      const rarity = stage===0 ? (["pistols","smgs","blades"].includes(category)?"Common":"Uncommon") : districtWeaponRarity[stage];
      models.push({...template,name:`${themes[stage]} ${labels[category]}`,description:`The ${themes[stage]} district's ${labels[category].toLowerCase()} pattern.`,rarity,weaponDistrict:district,tags:[...template.tags,district]});
    }
  }
  const aliases: Record<string,string> = {};
  for (const old of source.filter(item=>item.type==="Weapon")) {
    const district=weaponDistrict(old);
    const replacement=models.find(item=>item.weaponDistrict===district && item.weaponClass===old.weaponClass)!;
    for(const variant of Object.keys(weaponVariants) as WeaponVariant[]) {
      const suffix=variant==="Power"?"":`-${variant.toLowerCase()}`;
      if(old.id!==replacement.id) aliases[old.id+suffix]=replacement.id+suffix;
    }
  }
  for(const model of models) {
    const effects = source.filter(item=>item.specialEffect && (aliases[item.id]??item.id)===model.id).map(item=>item.specialEffect!);
    if(effects.length) model.specialEffect=[...new Set(effects)].join(" ");
  }
  return {models,aliases};
}
