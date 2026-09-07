import type { ItemDefinition } from "../types";
export const quickhacks = [
  { id: "quickhack-short-circuit", name: "Short Circuit", action: "hack", ram: 2, multiplier: 1, interrupt: false, technical: 3, cost: { credits: 120, "encryptedData": 5 }, description: "Deal electrical damage to the current enemy." },
  { id: "quickhack-reboot-optics", name: "Reboot Optics", action: "disrupt", ram: 4, multiplier: 0.55, interrupt: true, technical: 3, cost: { credits: 180, "encryptedData": 8 }, description: "Deal reduced damage and interrupt the next counterattack." },
  { id: "quickhack-synapse-burnout", name: "Synapse Burnout", action: "burnout", ram: 6, multiplier: 2.2, interrupt: false, technical: 5, cost: { credits: 400, "encryptedData": 20 }, description: "Spend a large RAM burst to deal 220% quickhack damage." },
] as const;
export const quickhackItems: ItemDefinition[] = quickhacks.map(hack => ({ id: hack.id, name: hack.name, description: hack.description, type: "Quickhack", rarity: hack.action === "burnout" ? "Rare" : "Common", tags: ["quickhack"], stackable: false, sellValue: 0, sourceHint: "Main > Character > Quickhacks crafting; starter kit or mission rewards." }));
