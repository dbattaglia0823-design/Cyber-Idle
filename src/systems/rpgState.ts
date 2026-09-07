import type { RpgState } from "../rpgTypes";
import { allRpgMissions } from "../data/rpgCampaign";

export function createRpgState(): RpgState {
  return { attributeProgressionVersion: 1, level: 1, xp: 0, attributes: { body: 3, reflexes: 3, intelligence: 3, technical: 3, cool: 3 },
    attributePoints: 7, perkPoints: 2, perks: {}, completed: {}, active: null, ending: null, streetCred: 0, starterClaimed: false };
}

export function cloneRpgState(state?: RpgState): RpgState {
  const base = createRpgState();
  return { ...base, ...state, quickhackLoadouts: Object.fromEntries(Object.entries(state?.quickhackLoadouts ?? {}).filter(([, ids]) => Array.isArray(ids)).map(([id, ids]) => [id, [...new Set(ids.filter(value => typeof value === "string"))].slice(0, 4)])), attributes: { ...base.attributes, ...state?.attributes }, perks: { ...state?.perks },
    completed: Object.fromEntries(Object.entries(state?.completed ?? {}).map(([id, value]) => [id, { ...value }])),
    active: state?.active ? { ...state.active, log: [...(state.active.log ?? [])] } : null };
}

export function normalizeRpgState(state?: RpgState): RpgState {
  const next = cloneRpgState(state);
  const integer = (value: number, min: number, max: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : min;
  next.level = integer(next.level, 1, 30); next.xp = integer(next.xp, 0, 100000);
  next.attributePoints = integer(next.attributePoints, 0, 65); next.perkPoints = integer(next.perkPoints, 0, 31);
  next.streetCred = integer(next.streetCred, 0, 1000000);
  for (const key of Object.keys(next.attributes) as Array<keyof RpgState["attributes"]>) next.attributes[key] = integer(next.attributes[key], 3, 20);
  if (next.active) {
    const e = next.active, mission = allRpgMissions.find(entry => entry.id === e.missionId);
    if (!mission || !["briefing", "combat", "decision", "failed"].includes(e.phase)) next.active = null;
    else {
      e.enemyIndex = integer(e.enemyIndex, 0, e.phase === "decision" ? mission.enemies.length : mission.enemies.length - 1);
      e.enemyMaxHp = integer(e.enemyMaxHp, 1, 100000); e.enemyHp = integer(e.enemyHp, 0, e.enemyMaxHp);
      e.turn = integer(e.turn, 0, 100000); e.ram = integer(e.ram, 0, 30); e.meds = integer(e.meds, 0, 4);
      e.log = e.log.filter(line => typeof line === "string").slice(-12);
    }
  }
  return next;
}
