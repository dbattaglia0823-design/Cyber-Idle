import type { AttributeId } from "../rpgTypes";
import type { ActiveModifiers } from "../types";
export interface RpgPerk { id: string; name: string; attribute: AttributeId; requirement: number; requires?: string[]; description: string; modifiers?: Partial<ActiveModifiers> }
export const rpgPerks: RpgPerk[] = [
  { id: "adrenaline", name: "Adrenaline", attribute: "body", requirement: 5, description: "+30% weapon damage while below half health. Also +3% weapon damage in all combat.", modifiers: { combatDamage: 0.03 } },
  { id: "second-wind", name: "Second Wind", attribute: "body", requirement: 9, description: "Recover 20% health after each encounter. Also +5% max HP.", modifiers: { combatMaxHp: 0.05 } },
  { id: "deadeye", name: "Deadeye", attribute: "reflexes", requirement: 5, description: "Aimed attacks deal another 40% damage. Also +3% weapon damage in all combat.", modifiers: { combatDamage: 0.03 } },
  { id: "finisher", name: "Finisher", attribute: "reflexes", requirement: 9, description: "Weapon attacks execute enemies below 25% health. Also +3% attack speed in idle combat.", modifiers: { combatAttackSpeed: 0.03 } },
  { id: "ram-recycler", name: "RAM Recycler", attribute: "intelligence", requirement: 5, description: "Regenerate 2 RAM per turn instead of 1. Also +5% hacking XP.", modifiers: { skillXp: { hacking: 0.05 } } },
  { id: "synapse", name: "Synapse Burn", attribute: "intelligence", requirement: 9, description: "+40% quickhack damage. Also +2% job success.", modifiers: { jobSuccessChance: 0.02 } },
  { id: "field-medic", name: "Field Medic", attribute: "technical", requirement: 5, description: "One extra field injector per mission. Also +10% healing received.", modifiers: { healingReceived: 0.1 } },
  { id: "reactive-armor", name: "Reactive Armor", attribute: "technical", requirement: 9, description: "Take 20% less damage during missions. Also +5% armor.", modifiers: { combatDefense: 0.05 } },
  { id: "ambush", name: "Ambush", attribute: "cool", requirement: 5, description: "+60% damage on the first turn of each encounter. Also 5% lower heat gain.", modifiers: { heatGain: -0.05 } },
  { id: "vanishing-point", name: "Vanishing Point", attribute: "cool", requirement: 9, description: "Taking cover also primes an aimed shot. Also +3% damage reduction in all combat.", modifiers: { damageReduction: 0.03 } },
  { id: "tinkerer", name: "Tinkerer", attribute: "technical", requirement: 5, description: "Unlock two extra equipment upgrade levels and reduce upgrade credit costs by 10%.", modifiers: { upgradeCostReduction: 0.1 } },


  { id: "juggernaut", name: "Juggernaut", attribute: "body", requirement: 5, description: "+10% max HP.", modifiers: { combatMaxHp: 0.1 } },
  { id: "blood-pump", name: "Blood Pump", attribute: "body", requirement: 12, requires: ["juggernaut"], description: "+15% healing received and +5% max HP.", modifiers: { healingReceived: 0.15, combatMaxHp: 0.05 } },
  { id: "pain-engine", name: "Pain Engine", attribute: "body", requirement: 15, requires: ["second-wind"], description: "+8% weapon damage and +3% damage reduction.", modifiers: { combatDamage: 0.08, damageReduction: 0.03 } },
  { id: "unstoppable", name: "Unstoppable", attribute: "body", requirement: 20, requires: ["pain-engine", "blood-pump"], description: "+15% max HP and +6% damage reduction.", modifiers: { combatMaxHp: 0.15, damageReduction: 0.06 } },
  { id: "kinetic-flow", name: "Kinetic Flow", attribute: "reflexes", requirement: 5, description: "+5% weapon damage and +5% attack speed in idle combat.", modifiers: { combatDamage: 0.05, combatAttackSpeed: 0.05 } },
  { id: "ballistic-focus", name: "Ballistic Focus", attribute: "reflexes", requirement: 12, requires: ["kinetic-flow"], description: "+8% weapon damage.", modifiers: { combatDamage: 0.08 } },
  { id: "chain-reaction", name: "Chain Reaction", attribute: "reflexes", requirement: 15, requires: ["finisher"], description: "A weapon kill primes an aimed shot against the next enemy.", modifiers: { combatAttackSpeed: 0.04 } },
  { id: "bullet-time", name: "Bullet Time", attribute: "reflexes", requirement: 20, requires: ["chain-reaction", "ballistic-focus"], description: "Aimed weapon attacks deal another 35% damage. Also +5% damage reduction.", modifiers: { damageReduction: 0.05 } },
  { id: "expanded-memory", name: "Expanded Memory", attribute: "intelligence", requirement: 5, description: "+3 maximum RAM with a cyberdeck equipped." },
  { id: "compression", name: "Compression", attribute: "intelligence", requirement: 12, requires: ["expanded-memory"], description: "All installed quickhacks cost 1 less RAM, to a minimum of 1." },
  { id: "persistent-code", name: "Persistent Code", attribute: "intelligence", requirement: 15, requires: ["synapse"], description: "Overheat and Cripple Movement last one extra turn." },
  { id: "neural-sovereign", name: "Neural Sovereign", attribute: "intelligence", requirement: 20, requires: ["persistent-code", "compression"], description: "+20% quickhack damage and +1 RAM regenerated per combat turn." },
  { id: "scrap-savant", name: "Scrap Savant", attribute: "technical", requirement: 5, description: "Crafting inputs cost 5% less and upgrades cost 5% fewer credits.", modifiers: { craftingCostReduction: 0.05, upgradeCostReduction: 0.05 } },
  { id: "precision-tools", name: "Precision Tools", attribute: "technical", requirement: 12, requires: ["scrap-savant", "tinkerer"], description: "Crafting inputs cost another 5% less; upgrades cost another 10% fewer credits.", modifiers: { craftingCostReduction: 0.05, upgradeCostReduction: 0.1 } },
  { id: "combat-triage", name: "Combat Triage", attribute: "technical", requirement: 15, requires: ["reactive-armor"], description: "+15% healing received and +10% armor.", modifiers: { healingReceived: 0.15, combatDefense: 0.1 } },
  { id: "chrome-symbiosis", name: "Chrome Symbiosis", attribute: "technical", requirement: 20, requires: ["combat-triage", "precision-tools"], description: "+10% max HP, +10% armor and +4% damage reduction.", modifiers: { combatMaxHp: 0.1, combatDefense: 0.1, damageReduction: 0.04 } },
  { id: "cold-blood", name: "Cold Blood", attribute: "cool", requirement: 5, description: "+3% damage reduction and 5% lower heat gain.", modifiers: { damageReduction: 0.03, heatGain: -0.05 } },
  { id: "clean-exit", name: "Clean Exit", attribute: "cool", requirement: 12, requires: ["cold-blood"], description: "+5% weapon damage and 10% lower heat gain.", modifiers: { combatDamage: 0.05, heatGain: -0.1 } },
  { id: "silent-running", name: "Silent Running", attribute: "cool", requirement: 15, requires: ["vanishing-point"], description: "+5% damage reduction and +5% weapon damage.", modifiers: { damageReduction: 0.05, combatDamage: 0.05 } },
  { id: "ghost-protocol", name: "Ghost Protocol", attribute: "cool", requirement: 20, requires: ["silent-running", "clean-exit"], description: "Ambush also applies on the second turn of every encounter. Also +5% weapon damage.", modifiers: { combatDamage: 0.05 } },
];
const roots: Record<string, string> = { "second-wind": "adrenaline", finisher: "deadeye", synapse: "ram-recycler", "reactive-armor": "field-medic", "vanishing-point": "ambush" };
for (const perk of rpgPerks) if (roots[perk.id]) perk.requires = [roots[perk.id]];
