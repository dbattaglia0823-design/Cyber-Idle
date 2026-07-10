import type { VehicleDefinition } from "../types";

export const vehicles: VehicleDefinition[] = [
  vehicle("junk-bike", "Junk Bike", "Common", "rustYards", ["Available early"], { credits: 180, vehicleParts: 8 }, { speed: 5, armor: 1, storage: 5, stealth: 1, heatReduction: 1, jobEfficiency: 2, smugglingRewardBonus: 1, districtAccessBonus: 0 }, "Starter purchase or craft."),
  vehicle("street-coupe", "Street Coupe", "Uncommon", "neonRow", ["Reputation 25"], { credits: 550, vehicleParts: 18, fuelCell: 1 }, { speed: 8, armor: 2, storage: 8, stealth: 2, heatReduction: 2, jobEfficiency: 4, smugglingRewardBonus: 2, districtAccessBonus: 1 }, "Neon Row dealers."),
  vehicle("rust-runner-van", "Rust Runner Van", "Rare", "rustYards", ["Rust Yards unlocked"], { credits: 900, vehicleParts: 30, engineCore: 1, armorPlating: 2 }, { speed: 4, armor: 7, storage: 20, stealth: 1, heatReduction: 3, jobEfficiency: 5, smugglingRewardBonus: 5, districtAccessBonus: 2 }, "Rust Yards garage."),
  vehicle("neon-racer", "Neon Racer", "Epic", "neonRow", ["Chrome Jackals rank 4"], { credits: 1800, vehicleParts: 35, navigationChip: 2 }, { speed: 14, armor: 2, storage: 6, stealth: 4, heatReduction: 3, jobEfficiency: 7, smugglingRewardBonus: 3, districtAccessBonus: 3 }, "Chrome Jackals race circuit."),
  vehicle("armored-courier", "Armored Courier", "Epic", "underpassMarket", ["Underpass Market unlocked"], { credits: 2200, armorPlating: 8, engineCore: 2 }, { speed: 6, armor: 14, storage: 18, stealth: 2, heatReduction: 5, jobEfficiency: 6, smugglingRewardBonus: 4, districtAccessBonus: 3 }, "Courier jobs and operations."),
  vehicle("smuggler-rig", "Smuggler Rig", "Legendary", "rustYards", ["Chrome Jackals rank 7"], { credits: 4500, smugglerCompartment: 3, engineCore: 3 }, { speed: 7, armor: 10, storage: 35, stealth: 7, heatReduction: 8, jobEfficiency: 9, smugglingRewardBonus: 10, districtAccessBonus: 5 }, "Smuggling operations."),
  vehicle("glassline-executive-car", "Glassline Executive Car", "Prototype", "glasslineDistrict", ["Glassline District unlocked"], { credits: 7000, navigationChip: 4, fuelCell: 4 }, { speed: 10, armor: 6, storage: 12, stealth: 10, heatReduction: 9, jobEfficiency: 10, smugglingRewardBonus: 3, districtAccessBonus: 8 }, "Corporate rewards."),
  vehicle("skyline-lux-cruiser", "Skyline Lux Cruiser", "Legendary", "skylineCore", ["Skyline Core unlocked", "Major credit sink"], { credits: 12000, navigationChip: 6, fuelCell: 6, prototypeDriveUnit: 1 }, { speed: 12, armor: 8, storage: 18, stealth: 9, heatReduction: 11, jobEfficiency: 13, smugglingRewardBonus: 6, districtAccessBonus: 10 }, "Skyline luxury broker."),
  vehicle("prototype-interceptor", "Prototype Interceptor", "Relic", "glasslineDistrict", ["Corporate Extraction rare reward"], { credits: 15000, prototypeDriveUnit: 2, engineCore: 5 }, { speed: 18, armor: 12, storage: 14, stealth: 8, heatReduction: 10, jobEfficiency: 12, smugglingRewardBonus: 8, districtAccessBonus: 10 }, "Late-game prototype vehicle."),
];

function vehicle(id: string, name: string, rarity: VehicleDefinition["rarity"], districtId: VehicleDefinition["districtId"], unlockRequirements: string[], cost: VehicleDefinition["cost"], stats: VehicleDefinition["stats"], sourceHint: string): VehicleDefinition {
  return {
    id,
    name,
    rarity,
    type: name.includes("Bike") ? "Junk Bike" : name.includes("Van") ? "Rust Runner Van" : "Vehicle",
    districtId,
    unlockRequirements,
    cost,
    stats,
    passiveModifiers: {
      actionSpeed: stats.jobEfficiency / 100,
      heatGain: -(stats.heatReduction / 100),
      jobRewards: stats.smugglingRewardBonus / 100,
    },
    maxUpgradeLevel: 10,
    garageSlotsRequired: 1,
    sourceHint,
  };
}
