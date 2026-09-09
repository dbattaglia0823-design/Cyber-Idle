import type { ItemDefinition, ItemRarity } from "../types";
export interface Quickhack {
  id: string; name: string; action: string; family: string; rarity: ItemRarity;
  ram: number; multiplier: number; interrupt: boolean; technical: number; stage: number;
  cost: { credits: number; encryptedData: number }; price: number; description: string;
  effect?: "burn" | "weaken" | "siphon"; potency?: number;
}
const program = (id: string, name: string, family: string, rarity: ItemRarity, stage: number, ram: number, multiplier: number, technical: number, credits: number, data: number, description: string, effect?: Quickhack["effect"], potency = 0): Quickhack => ({
  id: `quickhack-${id}`, name, family, action: family, rarity, stage, ram, multiplier, technical,
  interrupt: family === "disrupt", cost: { credits, encryptedData: data }, price: credits * 3, description, effect, potency,
});
export const quickhacks: Quickhack[] = [
  program("short-circuit", "Short Circuit", "hack", "Common", 0, 2, 1, 3, 120, 5, "Electrical damage with a low RAM cost."),
  program("reboot-optics", "Reboot Optics", "disrupt", "Common", 0, 4, .55, 3, 180, 8, "Interrupt this turn's counterattack and deal light damage."),
  program("synapse-burnout", "Synapse Burnout", "burnout", "Rare", 0, 6, 2.2, 5, 400, 20, "A concentrated burst dealing 220% quickhack damage."),
  program("overheat", "Overheat", "overheat", "Common", 0, 3, .35, 3, 160, 6, "Deal light damage, then 25% quickhack damage on this and the next two turns. Recasting refreshes the burn.", "burn", .25),
  program("short-circuit-mk2", "Short Circuit Mk.2", "hack", "Uncommon", 1, 3, 1.4, 5, 260, 12, "Improved electrical payload: 140% quickhack damage."),
  program("cripple-movement", "Cripple Movement", "cripple", "Uncommon", 1, 3, .45, 5, 280, 12, "Deal light damage and reduce enemy damage by 25% for this and the next turn.", "weaken", .25),
  program("memory-siphon", "Memory Siphon", "siphon", "Uncommon", 1, 4, .8, 5, 300, 14, "Deal 80% quickhack damage and heal for 25% of direct damage dealt.", "siphon", .25),
  program("reboot-optics-mk2", "Reboot Optics Mk.2", "disrupt", "Rare", 2, 4, .85, 7, 450, 20, "Interrupt the counterattack with an 85% damage payload."),
  program("overheat-mk2", "Overheat Mk.2", "overheat", "Rare", 2, 4, .5, 7, 450, 20, "Deal 50% damage, then burn for 35% damage over three turns. Recasting refreshes the burn.", "burn", .35),
  program("short-circuit-mk3", "Short Circuit Mk.3", "hack", "Epic", 3, 4, 1.9, 9, 750, 30, "Military electrical payload: 190% quickhack damage."),
  program("synapse-burnout-mk2", "Synapse Burnout Mk.2", "burnout", "Epic", 4, 7, 2.8, 11, 1000, 40, "Heavy neural overload: 280% quickhack damage."),
  program("cripple-movement-mk2", "Cripple Movement Mk.2", "cripple", "Epic", 4, 4, .65, 11, 900, 35, "Deal 65% damage and reduce enemy damage by 40% for two turns.", "weaken", .4),
  program("memory-siphon-mk2", "Memory Siphon Mk.2", "siphon", "Epic", 4, 5, 1.15, 11, 900, 35, "Deal 115% damage and heal for 40% of direct damage dealt.", "siphon", .4),
  program("reboot-optics-blackout", "Reboot Optics: Blackout", "disrupt", "Legendary", 5, 5, 1.3, 13, 1600, 55, "Interrupt the counterattack and deliver 130% damage."),
  program("overheat-inferno", "Overheat: Inferno", "overheat", "Legendary", 5, 5, .7, 13, 1600, 55, "Deal 70% damage, then burn for 50% damage over three turns. Recasting refreshes the burn.", "burn", .5),
  program("cripple-movement-lockdown", "Cripple Movement: Lockdown", "cripple", "Legendary", 6, 5, .9, 15, 2000, 65, "Deal 90% damage and reduce enemy damage by 55% for two turns.", "weaken", .55),
  program("memory-siphon-vampire", "Memory Siphon: Vampire", "siphon", "Legendary", 6, 6, 1.5, 15, 2000, 65, "Deal 150% damage and heal for 55% of direct damage dealt.", "siphon", .55),
  program("synapse-burnout-singularity", "Synapse Burnout: Singularity", "burnout", "Legendary", 7, 8, 3.5, 17, 2500, 80, "A final-tier neural payload dealing 350% quickhack damage."),
];
export const quickhackItems: ItemDefinition[] = quickhacks.map(hack => ({ id: hack.id, name: hack.name, description: hack.description, type: "Quickhack", rarity: hack.rarity, tags: ["quickhack", hack.family], stackable: false, sellValue: 0, sourceHint: "Character > Quickhacks: buy with credits or craft with Encrypted Data. District main jobs and local gigs also award programs." }));
