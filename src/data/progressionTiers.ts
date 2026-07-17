import type { GameState } from "../types";
import { factionRank } from "../systems/modifiers";
import { masteryPoolPercent } from "../systems/masteryPool";
import { effectiveNeuralInstability } from "../systems/itemFormulas";

export const progressionTiers = [
  { id: "tier0", name: "Tier 0: New Save", goals: ["Choose starting path", "Complete starter skill actions", "Fight starter enemies", "Craft first basic item", "Learn Heat and Neural Instability"] },
  { id: "tier1", name: "Tier 1: Street Operator", goals: ["Any skill level 10", "100 total actions", "25 enemy kills", "First cyberware equipped", "First fixer job completed"] },
  { id: "tier2", name: "Tier 2: District Runner", goals: ["Unlock second district", "Any skill level 25", "First housing purchased", "First faction rank 2", "First automation unlocked", "First Sim Cache earned and used"] },
  { id: "tier3", name: "Tier 3: Chrome Specialist", goals: ["Any skill level 50", "Several action masteries above level 25", "First mini-boss defeated", "First rare blueprint found", "First preset saved", "First mastery pool checkpoint at 50%"] },
  { id: "tier4", name: "Tier 4: Blacknet Veteran", goals: ["Multiple districts unlocked", "Faction rank 5", "Fixer trust rank 5", "Multiple crafted cyberware items", "Enemy drop log completion started", "First 95% mastery pool checkpoint"] },
  { id: "tier5", name: "Tier 5: Endgame Candidate", goals: ["Any skill level 99", "Multiple action masteries at 99", "Multiple enemy logs complete", "Multiple prototype items crafted", "Several housing options owned", "Several automation features unlocked"] },
];

export function tierProgress(state: GameState, tierId: string) {
  const kills = Object.values(state.enemyLog).reduce((sum, log) => sum + log.kills, 0);
  const actions = Object.keys(state.manualDiscovery.skillActions).length;
  const districts = Object.values(state.districts).filter((district) => district.unlocked).length;
  const anySkill = Math.max(...Object.values(state.skills).map((skill) => skill.level));
  const anyFaction = Math.max(...Object.values(state.factions).map((faction) => factionRank(faction.reputation)));
  const pool50 = Object.keys(state.skills).some((skill) => masteryPoolPercent(state, skill as keyof GameState["skills"]) >= 50);
  const pool95 = Object.keys(state.skills).some((skill) => masteryPoolPercent(state, skill as keyof GameState["skills"]) >= 95);
  const checks: Record<string, boolean[]> = {
    tier0: [Boolean(state.startingPath), actions > 0, kills > 0, Object.keys(state.manualDiscovery.recipes).length > 0, state.resources.heat > 0 || effectiveNeuralInstability(state) > 0],
    tier1: [anySkill >= 10, actions >= 3, kills >= 25, Object.keys(state.equippedCyberware).length > 0, Object.keys(state.manualDiscovery.jobs).length > 0],
    tier2: [districts >= 2, anySkill >= 25, Object.keys(state.ownedHousing).length > 0, anyFaction >= 2, false, (state.inventory["basic-sim-cache"] ?? 0) === 0 && state.worldUnlocks.usedSimCache],
    tier3: [anySkill >= 50, Object.values(state.actionMastery).filter((m) => m.level >= 25).length >= 3, false, Object.keys(state.unlockedBlueprints).length > 0, Object.keys(state.equipmentPresets).length >= 5, pool50],
    tier4: [districts >= 3, anyFaction >= 5, Object.values(state.fixerTrust).some((f) => f.trust >= 50), Object.keys(state.equippedCyberware).length >= 2, Object.values(state.enemyLog).some((log) => Object.keys(log.discoveredDrops).length >= 2), pool95],
    tier5: [anySkill >= 99, Object.values(state.actionMastery).filter((m) => m.level >= 99).length >= 2, false, false, Object.keys(state.ownedHousing).length >= 3, false],
  };
  const values = checks[tierId] ?? [];
  return { complete: values.filter(Boolean).length, total: values.length };
}
