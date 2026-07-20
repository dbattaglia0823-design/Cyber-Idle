import type { DistrictId, FactionId } from "../types";

export interface RipperdocClinic {
  id: string;
  name: string;
  districtId: DistrictId;
  description: string;
  specialties: string[];
  legalOnly: boolean;
  priceModifier: number;
  sellModifier: number;
  factionDiscount?: FactionId;
  cyberwareInventory: string[];
  unlockRequirements: string[];
}

export const ripperdocClinics: RipperdocClinic[] = [
  clinic("neon-backroom-clinic", "Neon Row Backroom Clinic", "neonRow", "Cheap basic installs, starter cyberware, and low-grade stabilizers.", ["Basic installs", "Starter cyberware", "Basic NI treatment"], false, 0.9, 0.55, undefined, ["basic-optic-scanner", "basic-reflex-chip", "basic-med-port", "reflex-wiring", "subdermal-mesh"], ["Available at start"]),
  clinic("helix-recovery-lab", "Helix Ward Recovery Lab", "helixWard", "Premium recovery lab with the best Neural Instability treatment and safer installs.", ["Advanced stabilizers", "Medical cyberware", "Safe upgrades"], true, 1.25, 0.75, "helixOrder", ["stabilized-neural-buffer", "auto-injector-link", "adaptive-skin-plating", "precision-grip-actuators", "dampener-weave"], ["Helix Ward access"]),
  clinic("underpass-street-surgeon", "Underpass Street Surgeon", "underpassMarket", "Illegal prototype installs, black-market cyberware, and risky discounts.", ["Prototype installs", "Illegal cyberware", "Risky upgrades"], false, 0.85, 0.7, "ghostMarket", ["entry-cyberdeck", "ghoststep-joint-kit", "market-scrubber-chip", "precision-grip-actuators"], ["Underpass Market access"]),
  clinic("glassline-augment-lab", "Glassline Augment Lab", "glasslineDistrict", "Corporate-grade augmentation with expensive clean installs and high-tier upgrades.", ["Corporate cyberware", "Clean installs", "High-tier upgrades"], true, 1.45, 0.8, "helixOrder", ["weakpoint-analyzer", "smartlink-kernel", "adaptive-skin-plating", "stabilized-neural-buffer"], ["Glassline access"]),
  clinic("rust-yard-chopdoc", "Rust Yard Chopdoc", "rustYards", "Salvaged implants, used chrome, cheap repairs, and vehicle/cyberware hybrid work.", ["Used implants", "Cheap repairs", "Hybrid services"], false, 0.75, 0.58, "chromeJackals", ["balance-assist", "street-runner-actuators", "salvage-filter", "synthetic-tendons", "subdermal-mesh"], ["Rust Yards access"]),
  clinic("blacknet-neural-clinic", "Blacknet Quarter Neural Clinic", "blacknetQuarter", "Cyberdecks, neural implants, trace-reduction tuning, and Blacknet-related services.", ["Cyberdecks", "Neural implants", "Trace reduction"], false, 1.15, 0.72, "nullChoir", ["trace-buffer-os", "smartlink-kernel", "neural-accelerator", "entry-cyberdeck", "stabilized-neural-buffer"], ["Blacknet Quarter access"]),
];

function clinic(
  id: string,
  name: string,
  districtId: DistrictId,
  description: string,
  specialties: string[],
  legalOnly: boolean,
  priceModifier: number,
  sellModifier: number,
  factionDiscount: FactionId | undefined,
  cyberwareInventory: string[],
  unlockRequirements: string[],
): RipperdocClinic {
  return { id, name, districtId, description, specialties, legalOnly, priceModifier, sellModifier, factionDiscount, cyberwareInventory, unlockRequirements };
}
