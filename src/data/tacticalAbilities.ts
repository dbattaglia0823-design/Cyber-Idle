import type { AttributeId, TacticalAction } from "../rpgTypes";

export interface TacticalAbility {
  id: `ability:${AttributeId}`;
  attribute: AttributeId;
  name: string;
  description: string;
  requiredAttribute: number;
  cooldown: number;
  ramCost: number;
}

// Each ability trades a combat turn for a distinct effect. Only the associated
// attribute unlocks it; perk points and skill XP are unaffected.
export const tacticalAbilities: readonly TacticalAbility[] = [
  { id: "ability:body", attribute: "body", name: "Breach Strike", description: "Heavy weapon hit · pierces plating and interrupts the enemy", requiredAttribute: 8, cooldown: 3, ramCost: 0 },
  { id: "ability:reflexes", attribute: "reflexes", name: "Double Tap", description: "Fast twin strike · 155% weapon damage · consumes aim", requiredAttribute: 8, cooldown: 3, ramCost: 0 },
  { id: "ability:intelligence", attribute: "intelligence", name: "System Override", description: "Bypass armor and shields · weaken enemy damage for two turns", requiredAttribute: 8, cooldown: 3, ramCost: 2 },
  { id: "ability:technical", attribute: "technical", name: "Emergency Patch", description: "Repair HP and bleeding without an injector · take cover", requiredAttribute: 8, cooldown: 4, ramCost: 0 },
  { id: "ability:cool", attribute: "cool", name: "Ghost Step", description: "Evade most incoming damage · ready an aimed shot", requiredAttribute: 8, cooldown: 3, ramCost: 0 },
] as const;

export const tacticalAbilityForAction = (action: TacticalAction) =>
  tacticalAbilities.find(ability => ability.id === action);
