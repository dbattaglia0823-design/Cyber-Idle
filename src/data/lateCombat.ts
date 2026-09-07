import type { CombatZone, DistrictId } from "../types";
import { trainingXpPerSecond } from "./progressionPacing";

function zone(id: string, name: string, district: DistrictId, level: number, names: string[], material: string): CombatZone {
  return {
    id, name, description: `Repeatable encounters for the ${name} equipment tier.`,
    enemies: names.map((name, index) => {
      const requiredCombatLevel = level + index * (level === 140 ? 2 : 4);
      return {
        id: `${id}-patrol-${index + 1}`, name,
        description: `A level ${requiredCombatLevel} district patrol. Prepare armor and auto-healing before engaging.`,
        preferredDistrict: district, requiredCombatLevel,
        hp: Math.round(level * (4 + index * 0.65)), damage: Math.round(level * (0.3 + index * 0.05)),
        attackSpeedMs: 2300, creditsReward: level + index * 25,
        xpReward: Math.round(trainingXpPerSecond(requiredCombatLevel) * 5), reputationReward: 5 + index,
        traits: ["human", "armored"],
        drops: [{ id: material, name: material.split("-").join(" "), chance: 0.45, quantity: 2 }],
      };
    }),
  };
}

export const lateCombatZones = [
  zone("helix-ward", "Helix Ward", "helixWard", 80,
    ["Clinic Extortionist", "Biotech Smuggler", "Ward Enforcer", "Chrome Recovery Agent", "Helix Security Captain"], "neural-stabilizer-compound"),
  zone("skyline-core", "Skyline Core", "skylineCore", 140,
    ["Executive Guard", "Penthouse Interceptor", "Prototype Sentinel", "Corporate Eliminator", "Skyline Security Commander"], "boss-data-key"),
];
