import type { RpgEncounter } from "../rpgTypes";
export const gigContracts = {
  none: { name: "Standard contract", objective: "No optional objective", target: 0 },
  clean: { name: "Clean extraction", objective: "Finish without using field injectors", target: 0 },
  precision: { name: "Precision work", objective: "Land an aimed weapon hit", target: 1 },
  disruption: { name: "Network control", objective: "Interrupt a counterattack", target: 1 },
} as const;
export type GigContractId = keyof typeof gigContracts;
export const gigVariants = ["Local patrol", "Plated patrol · aim or hack", "Repair crew · interrupt or Overheat"];
export function contractComplete(e: RpgEncounter) {
  const c=e.contract;
  return c?.id === "clean" ? c.injectors === 0 : c?.id === "precision" ? c.aimedHits >= 1 : c?.id === "disruption" ? c.interrupts >= 1 : false;
}
export function contractBonus(e: RpgEncounter, payout: number) { return contractComplete(e) ? Math.round(payout*.25) : 0; }
