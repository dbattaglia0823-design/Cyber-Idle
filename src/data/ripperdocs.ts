import type { RipperdocService } from "../types";

export const ripperdocServices: RipperdocService[] = [
  // ===== NEON ROW =====
  service("neon-basic-install", "Backroom Install", "Cheap basic install support in a Neon Row clinic.", "neonRow", { credits: 80 }, ["Neon Row unlocked"], "install", {
    neuralInstabilityChange: 2,
    risk: "Low quality install adds a little Neural Instability.",
    effects: ["Unlocks early implant roleplay hooks", "Small cyberware upgrade support"],
  }),
  service("neon-basic-remove", "Backroom Removal", "Remove damaged street chrome without corporate paperwork.", "neonRow", { credits: 70 }, ["Neon Row unlocked"], "remove", {
    neuralInstabilityChange: -2,
    effects: ["Minor Neural Instability relief"],
  }),
  service("neon-patch-up", "Patch Up", "Fast street treatment that restores combat readiness without paperwork.", "neonRow", { credits: 45, cyberwareParts: 1 }, ["Available at start"], "treatment", {
    neuralInstabilityChange: -4,
    effects: ["Adds clinic supply support", "Medical crafting support"],
  }),
  service("neon-starter-stabilizer", "Starter Stabilizers", "Buy a Neural Stabilizer at street prices.", "neonRow", { credits: 60 }, ["Available early"], "stabilizer", {
    neuralInstabilityChange: 1,
    effects: ["Street-grade cyberware upgrade support"],
  }),
  service("neon-small-upgrade", "Backroom Tune-Up", "A small cyberware calibration using parts and cash.", "neonRow", { credits: 120, cyberwareParts: 1 }, ["Cyberware Engineering level 3"], "upgrade", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -12,
    risk: "Very low risk.",
    effects: ["Strong Neural Instability reduction"],
  }),

  // ===== RUST YARDS =====
  service("rust-field-patch", "Field Patch", "Patch combat damage with vehicle tools and medical tape.", "rustYards", { credits: 90, scrap: 10, cyberwareParts: 1 }, ["Rust Yards unlocked"], "treatment", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -28,
    heatChange: -2,
    risk: "Expensive but reliable.",
    effects: ["Large Neural Instability reduction", "Minor Heat cleanup"],
  }),
  service("rust-hybrid-calibration", "Vehicle/Chrome Calibration", "Tune mobility chrome alongside vehicle interface hardware.", "rustYards", { credits: 260, vehicleParts: 3, cyberwareParts: 3 }, ["Rust Yard garage contact"], "calibration", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -8,
    effects: ["Temporary Instability gain reduction", "Adds district service completion"],
  }),
  service("rust-used-implant-repair", "Used Implant Repair", "Patch salvaged cyberware with chopdoc tools and scrap-market parts.", "rustYards", { credits: 140, scrap: 12, cyberwareParts: 2 }, ["Rust Yards access"], "upgrade", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -10,
    effects: ["Temporary cyberware load planning bonus"],
  }),
  service("rust-plating-interface", "Plating Interface Tune", "Tune armor plating and implant load for hauling through gunfire.", "rustYards", { credits: 520, armorPlating: 2, cyberwareParts: 4 }, ["Chrome Jackals rank 3"], "calibration", {
    neuralInstabilityChange: 6,
    heatChange: 2,
    risk: "High chance of future glitches and Heat attention.",
    effects: ["Prototype cyberware access placeholder", "High Heat attention"],
  }),
  service("rust-servo-reseat", "Servo Reseat", "Reseat salvaged limb servos after rough yard fights.", "rustYards", { credits: 220, vehicleParts: 3, cyberwareParts: 2 }, ["Vehicle Tuning level 8"], "calibration", {
    factionDiscount: "ghostMarket",
    neuralInstabilityChange: 8,
    heatChange: 4,
    risk: "High Instability and Heat gain.",
    effects: ["Temporary cyberware modifier boost", "Can trigger district event hooks"],
  }),

  // ===== UNDERPASS MARKET =====
  service("underpass-illegal-upgrade", "Illegal Chrome Overclock", "Push an implant beyond safe limits for later reward hooks.", "underpassMarket", { credits: 220, cyberwareParts: 4 }, ["Ghost Market contact"], "upgrade", {
    neuralInstabilityChange: 5,
    heatChange: 2,
    risk: "Unlicensed procedure.",
    effects: ["Future placeholder: slot optimization unlock"],
  }),
  service("underpass-prototype-install", "Prototype Street Install", "Cheap prototype install. Effective, messy, and stressful.", "underpassMarket", { credits: 90, cyberwareParts: 2 }, ["Underpass Market unlocked"], "prototypeInstall", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -6,
    effects: ["Safer corporate cyberware upgrade support"],
  }),
  service("underpass-slot-optimization", "Slot Optimization", "Street surgeon reshaping for future utility slot loadouts.", "underpassMarket", { credits: 480, cyberwareParts: 6 }, ["Underpass Market unlocked"], "slotOptimization", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -3,
    heatChange: 1,
    risk: "Safe body work, but corporate paperwork creates Heat.",
    effects: ["Corporate cyberware access placeholder"],
  }),
  service("underpass-trauma-stitch", "Trauma Stitch", "Unlicensed emergency bodywork that keeps fighters moving.", "underpassMarket", { credits: 180, cyberwareParts: 1 }, ["Underpass Market unlocked"], "treatment", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -14,
    heatChange: 2,
    effects: ["Temporary upgrade cost reduction", "Strong Instability reduction"],
  }),
  service("underpass-black-implant-swap", "Black Implant Swap", "Swap questionable implants fast, cheap, and quietly.", "underpassMarket", { credits: 620, cyberwareParts: 8 }, ["Ghost Market rank 3"], "remove", {
    factionDiscount: "chromeJackals",
    neuralInstabilityChange: 2,
    risk: "Cheap but uneven repair quality.",
    effects: ["Cheap cyberware repair", "Used implant support"],
  }),

  // ===== BLACKNET QUARTER =====
  service("blacknet-deck-tune", "Cyberdeck Trace Tune", "Reduce trace leakage from neural and cyberdeck implants.", "blacknetQuarter", { credits: 320, encryptedData: 10 }, ["Blacknet Quarter access"], "calibration", {
    factionDiscount: "chromeJackals",
    neuralInstabilityChange: 1,
    effects: ["Vehicle/cyberware hybrid service", "Outrider build support"],
  }),
  service("blacknet-feedback-ground", "Feedback Grounding", "Ground neural feedback before dangerous data dives.", "blacknetQuarter", { credits: 260, encryptedData: 8 }, ["Hacking level 10"], "treatment", {
    factionDiscount: "nullChoir",
    neuralInstabilityChange: -5,
    heatChange: -3,
    effects: ["Trace reduction", "Cyberdeck support"],
  }),
  service("blacknet-neural-install", "Neural Deck Install", "Install hacking cyberware with Blacknet-grade signal shielding.", "blacknetQuarter", { credits: 420, encryptedData: 12, cyberwareParts: 4 }, ["Hacking level 15"], "install", {
    factionDiscount: "nullChoir",
    neuralInstabilityChange: 3,
    heatChange: 1,
    risk: "Signal shielding is clean, but Blacknet work is watched.",
    effects: ["Cyberdeck implant support", "Blacknet service completion"],
  }),
  service("blacknet-signal-suture", "Signal Suture", "Stitch damaged neural routing after daemon contact.", "blacknetQuarter", { credits: 520, encryptedData: 14, cyberwareParts: 2 }, ["Hacking level 25"], "calibration", {
    effects: ["Restores HP through clinic roleplay hooks", "Cheap early recovery"],
    temporaryEffect: { id: "neon-patch-up-effect", name: "Patch Up", description: "+3% HP recovery for 30 minutes.", modifiers: { hpRegen: 0.03 }, durationMs: 30 * 60 * 1000 },
  }),
  service("blacknet-deep-deck-graft", "Deep Deck Graft", "Dangerous cyberdeck grafting for runners who live inside signal storms.", "blacknetQuarter", { credits: 980, encryptedData: 24, cyberwareParts: 8 }, ["Hacking level 40", "Null Choir rank 4"], "prototypeInstall", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -6,
    effects: ["Temporary survivability support", "Improved healing response"],
    temporaryEffect: { id: "helix-combat-readiness-effect", name: "Combat Readiness", description: "+8% healing received for 30 minutes.", modifiers: { healingReceived: 0.08 }, durationMs: 30 * 60 * 1000 },
  }),

  // ===== HELIX WARD =====
  service("helix-emergency-stabilization", "Emergency Stabilization", "Heavy clinical intervention for dangerous instability spikes.", "helixWard", { credits: 520, cyberwareParts: 3 }, ["Helix Ward access", "Recommended at high Instability"], "treatment", {
    neuralInstabilityChange: 2,
    risk: "Messy procedure.",
    effects: ["Combat recovery", "Small Instability cost"],
    temporaryEffect: { id: "underpass-trauma-stitch-effect", name: "Trauma Stitch", description: "+5% healing received for 30 minutes.", modifiers: { healingReceived: 0.05 }, durationMs: 30 * 60 * 1000 },
  }),
  service("helix-load-reduction", "Load Reduction Consultation", "Plan a lower-load cyberware profile. Placeholder for load optimization.", "helixWard", { credits: 650, cyberwareParts: 5 }, ["Advanced Helix access"], "loadReduction", {
    neuralInstabilityChange: 3,
    heatChange: 2,
    risk: "Illegal swap work.",
    effects: ["Prototype loadout flexibility", "Black-market install support"],
  }),
  service("helix-recovery-lab", "Recovery Lab Treatment", "A safer treatment that lowers current Neural Instability.", "helixWard", { credits: 180 }, ["Helix Ward access"], "treatment", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: -8,
    effects: ["Temporary damage reduction", "Corporate defensive tuning"],
    temporaryEffect: { id: "glassline-armor-weave-effect", name: "Armor Weave Calibration", description: "+5% damage reduction for 30 minutes.", modifiers: { damageReduction: 0.05 }, durationMs: 30 * 60 * 1000 },
  }),
  service("helix-combat-readiness", "Combat Readiness Injection", "A clinical booster for runners entering high-risk operations.", "helixWard", { credits: 460, cyberwareParts: 2 }, ["Medical Knowledge level 10"], "treatment", {
    factionDiscount: "helixOrder",
    neuralInstabilityChange: 4,
    effects: ["Emergency reboot hook", "High-tier defensive cyberware prep"],
  }),
  service("helix-safe-calibration", "Safe Calibration", "Careful tuning that reduces future implant strain in later systems.", "helixWard", { credits: 340, encryptedData: 2 }, ["Cyberware Engineering level 20 or Helix trust"], "calibration", {
    factionDiscount: "chromeJackals",
    effects: ["Cheap recovery", "Vehicle runner support"],
    temporaryEffect: { id: "rust-field-patch-effect", name: "Field Patch", description: "+4% HP recovery for 30 minutes.", modifiers: { hpRegen: 0.04 }, durationMs: 30 * 60 * 1000 },
  }),

  // ===== GLASSLINE DISTRICT =====
  service("glassline-clean-install", "Clean-Room Install", "Premium installation with sterile corporate tools.", "glasslineDistrict", { credits: 420, cyberwareParts: 3 }, ["Glassline District unlocked"], "install", {
    factionDiscount: "chromeJackals",
    neuralInstabilityChange: 1,
    effects: ["Mobility chrome support", "Vehicle combat build hook"],
  }),
  service("glassline-corporate-calibration", "Corporate Calibration", "Precision tuning for high-value implants.", "glasslineDistrict", { credits: 700, encryptedData: 8 }, ["Corporate cyberware access"], "calibration", {
    factionDiscount: "chromeJackals",
    effects: ["Temporary armor support"],
    temporaryEffect: { id: "rust-plating-interface-effect", name: "Plating Interface", description: "+3% damage reduction for 30 minutes.", modifiers: { damageReduction: 0.03 }, durationMs: 30 * 60 * 1000 },
  }),
  service("glassline-safe-upgrade", "Corporate-Grade Upgrade", "Expensive safer cyberware upgrade support.", "glasslineDistrict", { credits: 300, encryptedData: 4 }, ["Glassline District unlocked"], "upgrade", {
    factionDiscount: "nullChoir",
    neuralInstabilityChange: -7,
    effects: ["Blacknet safety prep", "Trace feedback reduction"],
  }),
  service("glassline-armor-weave", "Armor Weave Calibration", "Tune subdermal armor and defensive weave under clean-room scopes.", "glasslineDistrict", { credits: 860, cyberwareParts: 6 }, ["Glassline District unlocked", "Street Combat level 25"], "calibration", {
    factionDiscount: "nullChoir",
    neuralInstabilityChange: -10,
    effects: ["Cyberdeck recovery", "Neural route repair"],
    temporaryEffect: { id: "blacknet-signal-suture-effect", name: "Signal Suture", description: "+5% healing received and -3% Heat gain for 30 minutes.", modifiers: { healingReceived: 0.05, heatGain: -0.03 }, durationMs: 30 * 60 * 1000 },
  }),
  service("glassline-emergency-reboot-install", "Emergency Reboot Install", "Prepare a death-prevention reboot socket for future emergency systems.", "glasslineDistrict", { credits: 1200, cyberwareParts: 10, encryptedData: 6 }, ["Corporate cyberware access", "Cyberware Engineering level 30"], "unique", {
    factionDiscount: "nullChoir",
    neuralInstabilityChange: 6,
    heatChange: 2,
    effects: ["High-tier Blacknet cyberware hook", "Risk/reward deck graft"],
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
    ripperdocId: clinicForDistrict(districtId, serviceType),
    name,
    description,
    districtId,
    category: categoryForService(serviceType),
    cost,
    materialRequirements: Object.fromEntries(Object.entries(cost).filter(([resource]) => resource !== "credits")),
    requirements,
    serviceType,
    riskLevel: extras.heatChange || extras.neuralInstabilityChange && extras.neuralInstabilityChange > 0 ? 3 : 1,
    temporaryEffect: extras.temporaryEffect ?? defaultTemporaryEffect(id, name, serviceType),
    repeatable: true,
    ...extras,
  };
}

function defaultTemporaryEffect(id: string, name: string, serviceType: RipperdocService["serviceType"]): RipperdocService["temporaryEffect"] {
  const base = { id: `${id}-effect`, name: `${name} Effect`, durationMs: 30 * 60 * 1000 };
  if (serviceType === "calibration") return { ...base, description: "-5% upgrade costs for 30 minutes.", modifiers: { upgradeCostReduction: 0.05 } };
  if (serviceType === "prototypeInstall") return { ...base, description: "+5% Cyberware XP for 30 minutes.", modifiers: { skillXp: { cyberware: 0.05 } } };
  if (serviceType === "upgrade") return { ...base, description: "-5% upgrade costs for 30 minutes.", modifiers: { upgradeCostReduction: 0.05 } };
  if (serviceType === "treatment" || serviceType === "stabilizer") return { ...base, description: "+5% HP recovery for 30 minutes.", modifiers: { hpRegen: 0.05 } };
  if (serviceType === "install") return { ...base, description: "+3% Cyberware Engineering XP for 30 minutes.", modifiers: { skillXp: { cyberware: 0.03 } } };
  if (serviceType === "loadReduction") return { ...base, description: "+3% Cyberware XP for 30 minutes.", modifiers: { skillXp: { cyberware: 0.03 } } };
  return { ...base, description: "+2% action speed for 30 minutes.", modifiers: { actionSpeed: 0.02 } };
}

function clinicForDistrict(districtId: RipperdocService["districtId"], serviceType: RipperdocService["serviceType"]) {
  if (districtId === "neonRow") return "neon-backroom-clinic";
  if (districtId === "helixWard") return "helix-recovery-lab";
  if (districtId === "underpassMarket") return "underpass-street-surgeon";
  if (districtId === "glasslineDistrict") return "glassline-augment-lab";
  if (districtId === "rustYards") return "rust-yard-chopdoc";
  if (districtId === "blacknetQuarter") return "blacknet-neural-clinic";
  return serviceType === "prototypeInstall" ? "underpass-street-surgeon" : "neon-backroom-clinic";
}

function categoryForService(serviceType: RipperdocService["serviceType"]): RipperdocService["category"] {
  if (serviceType === "install") return "Install";
  if (serviceType === "remove") return "Remove";
  if (serviceType === "upgrade") return "Upgrade";
  if (serviceType === "calibration") return "Calibrate";
  if (serviceType === "treatment" || serviceType === "stabilizer") return "Treat";
  if (serviceType === "prototypeInstall") return "Prototype";
  return "Special";
}
