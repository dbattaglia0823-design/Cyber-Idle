import { bossIconics } from "../data/bossIconics";
import { normalizeIconicMemory } from "./iconicMemory";
import { MAX_CHARACTER_LEVEL, attributePointBudget, perkPointBudget } from "../data/characterBuild";
import { mainJobXp, runnerXpNeeded } from "../data/campaignBalance";
import type { RpgState } from "../rpgTypes";
import { allRpgMissions, rpgMissions } from "../data/rpgCampaign";

export function createRpgState(): RpgState {
  return { campaignXpVersion: 2, attributeProgressionVersion: 3, level: 1, xp: 0, attributes: { body: 3, reflexes: 3, intelligence: 3, technical: 3, cool: 3 },
    attributePoints: 7, perkPoints: 2, perks: {}, completed: {}, active: null, ending: null, streetCred: 0, starterClaimed: false };
}

// Shared by mission rewards, eligible activity rewards, and save normalization.
export function addRunnerXp(rpg: RpgState, amount: number) {
  if (!Number.isFinite(amount) || amount < 0) return 0;
  const before = rpg.level;
  rpg.xp += Math.floor(amount);
  while (rpg.level < MAX_CHARACTER_LEVEL && rpg.xp >= runnerXpNeeded(rpg.level)) {
    rpg.xp -= runnerXpNeeded(rpg.level);
    rpg.level++;
    rpg.attributePoints += attributePointBudget(rpg.level) - attributePointBudget(rpg.level - 1);
    rpg.perkPoints += perkPointBudget(rpg.level) - perkPointBudget(rpg.level - 1);
  }
  if (rpg.level >= MAX_CHARACTER_LEVEL) { rpg.xp = 0; rpg.activityXpFraction = 0; }
  return rpg.level - before;
}

export function cloneRpgState(state?: RpgState): RpgState {
  const base = createRpgState();
  return { ...base, ...state, bossIconicProgress: Object.fromEntries(Object.entries(state?.bossIconicProgress ?? {}).filter(([,p])=>p&&typeof p==="object").map(([id, p])=>[id,{...p,acquired:{...p.acquired}}])), gigDryStreak: { ...state?.gigDryStreak }, quickhackLoadouts: Object.fromEntries(Object.entries(state?.quickhackLoadouts ?? {}).filter(([, ids]) => Array.isArray(ids)).map(([id, ids]) => [id, [...new Set(ids.filter(value => typeof value === "string"))].slice(0, 6)])), attributes: { ...base.attributes, ...state?.attributes }, perks: { ...state?.perks },
    completed: Object.fromEntries(Object.entries(state?.completed ?? {}).map(([id, value]) => [id, { ...value }])),
    active: state?.active ? { ...state.active, contract: state.active.contract ? { ...state.active.contract } : undefined, iconicMemory: state.active.iconicMemory ? {...state.active.iconicMemory} : undefined, log: [...(state.active.log ?? [])] } : null };
}

export function normalizeRpgState(state?: RpgState): RpgState {
  const next = cloneRpgState(state);
  const migrateCampaignXp = (state?.campaignXpVersion ?? 1) < 2;
  const integer = (value: number, min: number, max: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : min;
  next.level = integer(next.level, 1, MAX_CHARACTER_LEVEL); next.xp = integer(next.xp, 0, 100000);
  next.attributePoints = integer(next.attributePoints, 0, attributePointBudget(MAX_CHARACTER_LEVEL)); next.perkPoints = integer(next.perkPoints, 0, perkPointBudget(MAX_CHARACTER_LEVEL));
  next.activityXpFraction = Number.isFinite(next.activityXpFraction) ? Math.max(0, Math.min(0.999999999, next.activityXpFraction!)) : 0;
  if (migrateCampaignXp) {
    for (const mission of rpgMissions) if (next.completed[mission.id]) next.xp += Math.max(0, mainJobXp(mission.act) - (350 + mission.act * 160));
  }
  next.campaignXpVersion = 2;
  addRunnerXp(next, 0);
  next.gigDryStreak = Object.fromEntries(Object.entries(next.gigDryStreak ?? {}).filter(([id]) => allRpgMissions.some(m => m.sideGig && m.id === id)).map(([id,value]) => [id,integer(value,0,9)]));
  next.iconicLootSeed = Number.isFinite(next.iconicLootSeed) ? (Math.trunc(next.iconicLootSeed!)>>>0)||1 : undefined;
  next.bossIconicProgress = Object.fromEntries(Object.entries(next.bossIconicProgress ?? {}).filter(([id])=>bossIconics.some(def=>def.mission===id||def.bossEnemyId===id)).map(([id,p])=>[id,{victories:integer(p.victories,0,Number.MAX_SAFE_INTEGER),dryStreak:integer(p.dryStreak,0,9),acquired:Object.fromEntries(bossIconics.filter(def=>(def.mission===id||def.bossEnemyId===id)&&p.acquired?.[def.id]===true).map(def=>[def.id,true]))}]));
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
      e.bossReplay = Boolean(e.bossReplay && !mission.sideGig && next.completed[mission.id]);
      e.iconicMemory = normalizeIconicMemory(e.iconicMemory);
      e.turn = integer(e.turn, 0, 100000); e.ram = integer(e.ram, 0, 40); e.meds = integer(e.meds, 0, 4);
      e.playerBleedTurns = integer(e.playerBleedTurns ?? 0, 0, 2); e.playerBleedDamage = integer(e.playerBleedDamage ?? 0, 0, 100000);
    e.burnDamage = integer(e.burnDamage ?? 0, 0, 100000); e.burnTurns = integer(e.burnTurns ?? 0, 0, 4);
      e.weaken = Number.isFinite(e.weaken) ? Math.max(0, Math.min(.75, e.weaken!)) : 0; e.weakenTurns = integer(e.weakenTurns ?? 0, 0, 3);
      e.log = e.log.filter(line => typeof line === "string").slice(-12);
    }
  }
  return next;
}
