import { companions } from "../data/companions";
import { getItem } from "../data/items";
import { signatureBuilds } from "../data/signatureBuilds";
import { vehicles } from "../data/vehicles";
import { treeInvestment } from "./perkSystem";
import type { ArchetypeId, ArchetypeScore, GameState, SignatureBuild } from "../types";

const archetypeNames: Record<ArchetypeId, string> = {
  solo: "Solo",
  netrunner: "Netrunner",
  techie: "Techie",
  outrider: "Outrider",
  fixer: "Fixer",
  ghost: "Ghost",
};

export function archetypeScores(state: GameState): ArchetypeScore[] {
  const scores: Record<ArchetypeId, number> = {
    solo: 0,
    netrunner: 0,
    techie: 0,
    outrider: 0,
    fixer: 0,
    ghost: 0,
  };

  applyStartingPathScores(state, scores);
  scores.solo += state.skills.combat.level * 1.2;
  scores.netrunner += state.skills.hacking.level * 1.2;
  scores.techie += state.skills.cyberware.level * 1.15;
  scores.outrider += state.skills.scavenging.level * 1.1;
  scores.fixer += Math.min(60, state.resources.reputation / 10);
  scores.ghost += Math.max(0, 40 - state.resources.heat * 0.3);

  Object.values(state.equippedCyberware).forEach((id) => applyItemScores(scores, id));
  Object.values(state.equippedGear).forEach((id) => applyItemScores(scores, id));
  applyCompanionScores(state, scores);
  applyHousingScores(state, scores);
  applyFactionScores(state, scores);
  applyVehicleScores(state, scores);
  (Object.keys(scores) as ArchetypeId[]).forEach((id) => {
    scores[id] += treeInvestment(state, id) * 3;
  });

  const total = Math.max(1, Object.values(scores).reduce((sum, value) => sum + Math.max(0, value), 0));
  return (Object.keys(scores) as ArchetypeId[])
    .map((id) => ({ id, name: archetypeNames[id], score: Math.round(scores[id]), percent: Math.round((Math.max(0, scores[id]) / total) * 100) }))
    .sort((a, b) => b.percent - a.percent);
}

export function detectedSignatureBuild(state: GameState): SignatureBuild | null {
  const top = archetypeScores(state).filter((score) => score.percent >= 14).slice(0, 3).map((score) => score.id);
  const invested = signatureBuilds.find((build) => build.requiredArchetypes.every((id) => treeInvestment(state, id) >= 5 || top.includes(id)));
  return invested ?? null;
}

function applyStartingPathScores(state: GameState, scores: Record<ArchetypeId, number>) {
  if (state.startingPath === "streetborn") {
    scores.solo += 18;
    scores.fixer += 12;
  }
  if (state.startingPath === "corporateDefector") {
    scores.netrunner += 18;
    scores.fixer += 10;
    scores.ghost += 8;
  }
  if (state.startingPath === "outrider") {
    scores.outrider += 22;
    scores.techie += 8;
  }
}

function applyItemScores(scores: Record<ArchetypeId, number>, itemId?: string) {
  const item = getItem(itemId ?? "");
  if (!item) return;
  if (item.tags.some((tag) => ["combat", "weapon", "armor"].includes(tag))) scores.solo += 8;
  if (item.tags.some((tag) => ["hacking"].includes(tag))) scores.netrunner += 10;
  if (item.tags.some((tag) => ["cyberware", "medical", "prototype"].includes(tag))) scores.techie += 7;
  if (item.tags.some((tag) => ["speed"].includes(tag))) scores.ghost += 5;
  if ((item.instabilityLoad ?? 0) >= 3) scores.solo += 4;
}

function applyCompanionScores(state: GameState, scores: Record<ArchetypeId, number>) {
  const companion = companions.find((entry) => entry.id === state.activeCompanion);
  if (!companion) return;
  if (companion.id === "mara-voss") scores.solo += 15;
  if (companion.id === "nyra-vale") scores.netrunner += 15;
  if (companion.id === "iris-kade") scores.techie += 15;
  if (companion.id === "dex-riven") scores.outrider += 15;
  if (companion.id === "sable-quinn") scores.fixer += 15;
}

function applyHousingScores(state: GameState, scores: Record<ArchetypeId, number>) {
  if (state.activeResidence === "rust-yard-garage") scores.outrider += 14;
  if (state.activeResidence === "blacknet-loft") scores.netrunner += 14;
  if (state.activeResidence === "underpass-safehouse") scores.ghost += 12;
  if (state.activeResidence === "glassline-apartment") {
    scores.techie += 8;
    scores.fixer += 8;
  }
  if (state.activeResidence === "skyline-penthouse") scores.fixer += 14;
}

function applyFactionScores(state: GameState, scores: Record<ArchetypeId, number>) {
  scores.outrider += Math.max(0, state.factions.chromeJackals.reputation) / 3;
  scores.netrunner += Math.max(0, state.factions.nullChoir.reputation) / 3;
  scores.solo += Math.max(0, state.factions.redlineSaints.reputation) / 3;
  scores.fixer += Math.max(0, state.factions.ghostMarket.reputation) / 4;
  scores.ghost += Math.max(0, state.factions.ghostMarket.reputation) / 5;
  scores.techie += Math.max(0, state.factions.helixOrder.reputation) / 3;
}

function applyVehicleScores(state: GameState, scores: Record<ArchetypeId, number>) {
  const vehicle = vehicles.find((entry) => entry.id === state.activeVehicle);
  if (!vehicle) return;
  scores.outrider += 15 + vehicle.stats.storage;
  scores.ghost += vehicle.stats.stealth;
  scores.fixer += vehicle.stats.jobEfficiency;
}
