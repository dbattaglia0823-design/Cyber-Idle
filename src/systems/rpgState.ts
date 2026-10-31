import { mainJobXp, runnerXpNeeded } from "../data/campaignBalance";
import type { RpgState } from "../rpgTypes";
import { allRpgMissions, rpgMissions } from "../data/rpgCampaign";

export function createRpgState(): RpgState {
  return { campaignXpVersion: 2, attributeProgressionVersion: 1, level: 1, xp: 0, attributes: { body: 3, reflexes: 3, intelligence: 3, technical: 3, cool: 3 },
    attributePoints: 7, perkPoints: 2, perks: {}, completed: {}, active: null, ending: null, streetCred: 0, starterClaimed: false };
}

export function cloneRpgState(state?: RpgState): RpgState {
  const base = createRpgState();
  return { ...base, ...state, gigDryStreak: { ...state?.gigDryStreak }, quickhackLoadouts: Object.fromEntries(Object.entries(state?.quickhackLoadouts ?? {}).filter(([, ids]) => Array.isArray(ids)).map(([id, ids]) => [id, [...new Set(ids.filter(value => typeof value === "string"))].slice(0, 6)])), attributes: { ...base.attributes, ...state?.attributes }, perks: { ...state?.perks },
    completed: Object.fromEntries(Object.entries(state?.completed ?? {}).map(([id, value]) => [id, { ...value }])),
    active: state?.active ? { ...state.active, contract: state.active.contract ? { ...state.active.contract } : undefined, log: [...(state.active.log ?? [])] } : null };
}

export function normalizeRpgState(state?: RpgState): RpgState {
  const next = cloneRpgState(state);
  const migrateCampaignXp = (state?.campaignXpVersion ?? 1) < 2;
  const integer = (value: number, min: number, max: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : min;
  next.level = integer(next.level, 1, 30); next.xp = integer(next.xp, 0, 100000);
  next.attributePoints = integer(next.attributePoints, 0, 65); next.perkPoints = integer(next.perkPoints, 0, 31);
  if (migrateCampaignXp) {
    for (const mission of rpgMissions) if (next.completed[mission.id]) next.xp += Math.max(0, mainJobXp(mission.act) - (350 + mission.act * 160));
    while (next.level < 30 && next.xp >= runnerXpNeeded(next.level)) {
      next.xp -= runnerXpNeeded(next.level); next.level++; next.attributePoints += 2; next.perkPoints++;
    }
    if (next.level === 30) next.xp = 0;
  }
  next.campaignXpVersion = 2;
  next.gigDryStreak = Object.fromEntries(Object.entries(next.gigDryStreak ?? {}).filter(([id]) => allRpgMissions.some(m => m.sideGig && m.id === id)).map(([id,value]) => [id,integer(value,0,9)]));
  next.streetCred = integer(next.streetCred, 0, 1000000);
  for (const key of Object.keys(next.attributes) as Array<keyof RpgState["attributes"]>) next.attributes[key] = integer(next.attributes[key], 3, 20);
  if (next.active) {
    if (!["standard", "dangerous", "elite"].includes(next.active.gigRisk ?? "")) next.active.gigRisk = "standard";
    const e = next.active, mission = allRpgMissions.find(entry => entry.id === e.missionId);
    if (!mission || !["briefing", "combat", "decision", "failed"].includes(e.phase)) next.active = null;
    else {
      e.enemyIndex = integer(e.enemyIndex, 0, e.phase === "decision" ? mission.enemies.length : mission.enemies.length - 1);
      e.enemyMaxHp = integer(e.enemyMaxHp, 1, 100000); e.enemyHp = integer(e.enemyHp, 0, e.enemyMaxHp);
      e.gigVariant = integer(e.gigVariant ?? 0,0,2);
      if(e.contract && ["none","clean","precision","disruption"].includes(e.contract.id)) e.contract = {id:e.contract.id,injectors:integer(e.contract.injectors,0,1000),interrupts:integer(e.contract.interrupts,0,1000),aimedHits:integer(e.contract.aimedHits,0,1000)}; else e.contract=undefined;
      e.turn = integer(e.turn, 0, 100000); e.ram = integer(e.ram, 0, 40); e.meds = integer(e.meds, 0, 4);
      e.playerBleedTurns = integer(e.playerBleedTurns ?? 0, 0, 2); e.playerBleedDamage = integer(e.playerBleedDamage ?? 0, 0, 100000);
    e.burnDamage = integer(e.burnDamage ?? 0, 0, 100000); e.burnTurns = integer(e.burnTurns ?? 0, 0, 4);
      e.weaken = Number.isFinite(e.weaken) ? Math.max(0, Math.min(.75, e.weaken!)) : 0; e.weakenTurns = integer(e.weakenTurns ?? 0, 0, 3);
      e.log = e.log.filter(line => typeof line === "string").slice(-12);
    }
  }
  return next;
}
