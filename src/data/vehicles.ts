import type { VehicleDefinition } from "../types";

export const vehicles: VehicleDefinition[] = [
  // ===== NEON ROW =====
  vehicle("neon-racer", "Neon Racer", "Epic", "neonRow", ["Vehicle Tuning level 50"], { credits: 1800, vehicleParts: 35, navigationChip: 2 }, { speed: 14, armor: 2, storage: 6, stealth: 4, heatReduction: 3, jobEfficiency: 7, smugglingRewardBonus: 3, districtAccessBonus: 3 }, "Redline Saints race circuit."),
  vehicle("street-coupe", "Street Coupe", "Uncommon", "neonRow", ["Vehicle Tuning level 10"], { credits: 550, vehicleParts: 18, fuelCell: 1 }, { speed: 8, armor: 2, storage: 8, stealth: 2, heatReduction: 2, jobEfficiency: 4, smugglingRewardBonus: 2, districtAccessBonus: 1 }, "Neon Row dealers."),

  // ===== RUST YARDS =====
  vehicle("junk-bike", "Junk Bike", "Common", "rustYards", ["Vehicle Tuning level 1"], { credits: 180, vehicleParts: 8 }, { speed: 5, armor: 1, storage: 5, stealth: 1, heatReduction: 1, jobEfficiency: 2, smugglingRewardBonus: 1, districtAccessBonus: 0 }, "Starter purchase or craft."),
  vehicle("rust-runner-van", "Rust Runner Van", "Rare", "rustYards", ["Vehicle Tuning level 30"], { credits: 900, vehicleParts: 30, engineCore: 1, armorPlating: 2 }, { speed: 4, armor: 7, storage: 20, stealth: 1, heatReduction: 3, jobEfficiency: 5, smugglingRewardBonus: 5, districtAccessBonus: 2 }, "Rust Yards garage."),
  vehicle("smuggler-rig", "Smuggler Rig", "Legendary", "rustYards", ["Vehicle Tuning level 80"], { credits: 4500, smugglerCompartment: 3, engineCore: 3 }, { speed: 7, armor: 10, storage: 35, stealth: 7, heatReduction: 8, jobEfficiency: 9, smugglingRewardBonus: 10, districtAccessBonus: 5 }, "Smuggling combat encounters."),
  vehicle("yard-flatbed", "Yard Flatbed", "Uncommon", "rustYards", ["Vehicle Tuning level 20"], { credits: 650, vehicleParts: 22, armorPlating: 1 }, { speed: 3, armor: 5, storage: 28, stealth: 0, heatReduction: 2, jobEfficiency: 4, smugglingRewardBonus: 4, districtAccessBonus: 1 }, "Rust Yards hauling contracts."),
  vehicle("jackal-scout-buggy", "Jackal Scout Buggy", "Rare", "rustYards", ["Vehicle Tuning level 40"], { credits: 1400, vehicleParts: 32, fuelCell: 2, navigationChip: 1 }, { speed: 12, armor: 4, storage: 10, stealth: 5, heatReduction: 4, jobEfficiency: 7, smugglingRewardBonus: 5, districtAccessBonus: 3 }, "Chrome Jackals scout routes."),

  // ===== UNDERPASS MARKET =====
  vehicle("armored-courier", "Armored Courier", "Epic", "underpassMarket", ["Vehicle Tuning level 60"], { credits: 2200, armorPlating: 8, engineCore: 2 }, { speed: 6, armor: 14, storage: 18, stealth: 2, heatReduction: 5, jobEfficiency: 6, smugglingRewardBonus: 4, districtAccessBonus: 3 }, "Courier jobs and combat encounters."),

  // ===== GLASSLINE DISTRICT =====
  vehicle("glassline-executive-car", "Glassline Executive Car", "Prototype", "glasslineDistrict", ["Vehicle Tuning level 110"], { credits: 7000, navigationChip: 4, fuelCell: 4 }, { speed: 10, armor: 6, storage: 12, stealth: 10, heatReduction: 9, jobEfficiency: 10, smugglingRewardBonus: 3, districtAccessBonus: 8 }, "Corporate rewards."),
  vehicle("prototype-interceptor", "Prototype Interceptor", "Relic", "glasslineDistrict", ["Vehicle Tuning level 150"], { credits: 15000, prototypeDriveUnit: 2, engineCore: 5 }, { speed: 18, armor: 12, storage: 14, stealth: 8, heatReduction: 10, jobEfficiency: 12, smugglingRewardBonus: 8, districtAccessBonus: 10 }, "Late-game prototype vehicle."),

  // ===== SKYLINE CORE =====
  vehicle("skyline-lux-cruiser", "Skyline Lux Cruiser", "Legendary", "skylineCore", ["Vehicle Tuning level 140"], { credits: 12000, navigationChip: 6, fuelCell: 6, prototypeDriveUnit: 1 }, { speed: 12, armor: 8, storage: 18, stealth: 9, heatReduction: 11, jobEfficiency: 13, smugglingRewardBonus: 6, districtAccessBonus: 10 }, "Skyline luxury broker."),
];

function vehicle(id: string, name: string, rarity: VehicleDefinition["rarity"], districtId: VehicleDefinition["districtId"], unlockRequirements: string[], cost: VehicleDefinition["cost"], stats: VehicleDefinition["stats"], sourceHint: string): VehicleDefinition {
  const tuningLevel = Number(unlockRequirements[0]?.match(/level\s+(\d+)/i)?.[1] ?? 1);
  const creditPrice = cost.credits ?? 0;
  return {
    id,
    name,
    rarity,
    type: name.includes("Bike") ? "Junk Bike" : name.includes("Van") ? "Rust Runner Van" : "Vehicle",
    districtId,
    unlockRequirements,
    cost: { credits: creditPrice ? Math.round(creditPrice * vehicleCostMultiplier(rarity) * vehicleProgressionPriceMultiplier(tuningLevel)) : 0 },
    stats,
    passiveModifiers: vehiclePassiveModifiers(id, stats),
    maxUpgradeLevel: 20,
    sourceHint,
  };
}

function vehicleProgressionPriceMultiplier(tuningLevel: number) {
  if (tuningLevel <= 20) return 1.25;
  if (tuningLevel <= 40) return 1.5;
  if (tuningLevel <= 60) return 2;
  if (tuningLevel <= 80) return 3;
  if (tuningLevel <= 110) return 5;
  if (tuningLevel <= 140) return 8;
  return 12;
}

function vehicleCostMultiplier(rarity: VehicleDefinition["rarity"]) {
  return {
    Common: 4,
    Uncommon: 4.5,
    Rare: 5.25,
    Epic: 6,
    Legendary: 7.5,
    Prototype: 8.5,
    Relic: 10,
  }[rarity] ?? 4;
}

function vehiclePassiveModifiers(id: string, stats: VehicleDefinition["stats"]): VehicleDefinition["passiveModifiers"] {
  const heatGain = -(stats.heatReduction / 100);
  const jobRewards = stats.smugglingRewardBonus / 100;
  if (id.includes("bike") || id.includes("racer") || id.includes("interceptor")) return { dodgeChance: 0.02 + stats.speed / 1000, heatGain };
  if (id.includes("van") || id.includes("flatbed") || id.includes("rig")) return { skillRewards: 0.02 + stats.storage / 1000, jobRewards };
  if (id.includes("armored")) return { combatDefense: 0.03 + stats.armor / 1000, jobRewards };
  if (id.includes("scout") || id.includes("executive") || id.includes("lux")) return { jobSuccessChance: 0.02 + stats.stealth / 1000, heatGain };
  return { jobRewards, heatGain };
}
