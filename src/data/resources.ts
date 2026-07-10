import type { ResourceId } from "../types";

export const resourceNames: Record<ResourceId, string> = {
  credits: "Credits",
  scrap: "Scrap",
  circuitBoards: "Circuit Boards",
  encryptedData: "Encrypted Data",
  cyberwareParts: "Cyberware Parts",
  reputation: "Reputation",
  heat: "Heat",
  vehicleParts: "Vehicle Parts",
  engineCore: "Engine Core",
  armorPlating: "Armor Plating",
  fuelCell: "Fuel Cell",
  navigationChip: "Navigation Chip",
  smugglerCompartment: "Smuggler Compartment",
  prototypeDriveUnit: "Prototype Drive Unit",
};

export const startingResources: Record<ResourceId, number> = {
  credits: 50,
  scrap: 0,
  circuitBoards: 0,
  encryptedData: 0,
  cyberwareParts: 0,
  reputation: 0,
  heat: 0,
  vehicleParts: 0,
  engineCore: 0,
  armorPlating: 0,
  fuelCell: 0,
  navigationChip: 0,
  smugglerCompartment: 0,
  prototypeDriveUnit: 0,
};

export const resourceOrder: ResourceId[] = [
  "credits",
  "scrap",
  "circuitBoards",
  "encryptedData",
  "cyberwareParts",
  "reputation",
  "heat",
  "vehicleParts",
  "engineCore",
  "armorPlating",
  "fuelCell",
  "navigationChip",
  "smugglerCompartment",
  "prototypeDriveUnit",
];
