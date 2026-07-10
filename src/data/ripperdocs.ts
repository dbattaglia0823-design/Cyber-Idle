import type { RipperdocService } from "../types";

export const ripperdocServices: RipperdocService[] = [
  service("neon-basic-install", "Backroom Install", "Cheap basic install support in a Neon Row clinic.", "neonRow", { credits: 80 }, ["Neon Row unlocked"], "install", {
    neuralInstabilityChange: 2,
    risk: "Low quality install adds a little Neural Instability.",
    effects: ["Unlocks early implant roleplay hooks", "Small cyberware upgrade support"],
  }),
  service("neon-basic-remove", "Backroom Removal", "Remove damaged street chrome without corporate paperwork.", "neonRow", { credits: 70 }, ["Neon Row unlocked"], "remove", {
    neuralInstabilityChange: -2,
    effects: ["Minor Neural Instability relief"],
  }),
  service("neon-starter-stabilizer", "Starter Stabilizers", "Buy a Neural Stabilizer at street prices.", "neonRow", { credits: 60 }, ["Available early"], "stabilizer", {
    neuralInstabilityChange: -4,
    effects: ["Adds 1 Neural Stabilizer", "Reduces current Neural Instability"],
  }),
  service("neon-small-upgrade", "Backroom Tune-Up", "A small cyberware calibration using parts and cash.", "neonRow", { credits: 120, cyberwareParts: 1 }, ["Cyberware Engineering level 3"], "upgrade", {
    neuralInstabilityChange: 1,
    effects: ["Street-grade cyberware upgrade support"],
  }),
  service("helix-recovery-lab", "Recovery Lab Treatment", "A safer treatment that lowers current Neural Instability.", "helixWard", { credits: 180 }, ["Helix Ward access"], "treatment", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -12,
    risk: "Very low risk.",
    effects: ["Strong Neural Instability reduction"],
  }),
  service("helix-emergency-stabilization", "Emergency Stabilization", "Heavy clinical intervention for dangerous instability spikes.", "helixWard", { credits: 520, cyberwareParts: 3 }, ["Helix Ward access", "Recommended at high NI"], "treatment", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -28,
    heatChange: -2,
    risk: "Expensive but reliable.",
    effects: ["Large Neural Instability reduction", "Minor Heat cleanup"],
  }),
  service("helix-safe-calibration", "Safe Calibration", "Careful tuning that reduces future implant strain in later systems.", "helixWard", { credits: 340, encryptedData: 2 }, ["Cyberware Engineering level 20 or Helix trust"], "calibration", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -8,
    effects: ["Future placeholder: temporary NI gain reduction", "Adds district service completion"],
  }),
  service("helix-load-reduction", "Load Reduction Consultation", "Plan a lower-load cyberware profile. Placeholder for load optimization.", "helixWard", { credits: 650, cyberwareParts: 5 }, ["Advanced Helix access"], "loadReduction", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -10,
    effects: ["Future placeholder: reduce effective cyberware load"],
  }),
  service("underpass-prototype-install", "Prototype Street Install", "Cheap prototype install. Effective, messy, and stressful.", "underpassMarket", { credits: 90, cyberwareParts: 2 }, ["Underpass Market unlocked"], "prototypeInstall", {
    neuralInstabilityChange: 6,
    heatChange: 2,
    risk: "High chance of future glitches and Heat attention.",
    effects: ["Prototype cyberware access placeholder", "Raises Neural Instability"],
  }),
  service("underpass-illegal-upgrade", "Illegal Chrome Overclock", "Push an implant beyond safe limits for later reward hooks.", "underpassMarket", { credits: 220, cyberwareParts: 4 }, ["Ghost Market contact"], "upgrade", {
    factionDiscount: "ghostMarket",
    neuralInstabilityChange: 8,
    heatChange: 4,
    risk: "High NI and Heat gain.",
    effects: ["Future placeholder: stronger upgrade success", "Can trigger district event hooks"],
  }),
  service("underpass-slot-optimization", "Slot Optimization", "Street surgeon reshaping for future utility slot loadouts.", "underpassMarket", { credits: 480, cyberwareParts: 6 }, ["Underpass Market unlocked"], "slotOptimization", {
    neuralInstabilityChange: 5,
    heatChange: 2,
    risk: "Unlicensed procedure.",
    effects: ["Future placeholder: slot optimization unlock"],
  }),
  service("glassline-safe-upgrade", "Corporate-Grade Upgrade", "Expensive safer cyberware upgrade support.", "glasslineDistrict", { credits: 300, encryptedData: 4 }, ["Glassline District unlocked"], "upgrade", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -6,
    effects: ["Safer corporate cyberware upgrade support"],
  }),
  service("glassline-clean-install", "Clean-Room Install", "Premium installation with sterile corporate tools.", "glasslineDistrict", { credits: 420, cyberwareParts: 3 }, ["Glassline District unlocked"], "install", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -3,
    heatChange: 1,
    risk: "Safe body work, but corporate paperwork creates Heat.",
    effects: ["Corporate cyberware access placeholder"],
  }),
  service("glassline-corporate-calibration", "Corporate Calibration", "Precision tuning for high-value implants.", "glasslineDistrict", { credits: 700, encryptedData: 8 }, ["Corporate cyberware access"], "calibration", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -14,
    heatChange: 2,
    effects: ["Future placeholder: better upgrade success", "Strong NI reduction"],
  }),
];

function service(
  id: string,
  name: string,
  description: string,
  districtId: RipperdocService["districtId"],
  cost: RipperdocService["cost"],
  requirements: string[],
  serviceType: RipperdocService["serviceType"],
  extras: Partial<Omit<RipperdocService, "id" | "name" | "description" | "districtId" | "cost" | "requirements" | "serviceType" | "repeatable">> = {},
): RipperdocService {
  return {
    id,
    name,
    description,
    districtId,
    cost,
    requirements,
    serviceType,
    repeatable: true,
    ...extras,
  };
}
