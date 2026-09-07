import { equippedDeck, grantStarterQuickhacks, installedQuickhacks } from "./quickhackSystem";
import { allRpgMissions, rpgMissions, rpgPerks, type RpgMission } from "../data/rpgCampaign";
import { getItem } from "../data/items";
import { materialSupplyActions } from "../data/materialSupply";
import { cloneState, pushCategorizedLog } from "./gameState";
import { addItem } from "./collectionSystem";
import { calculateMaxHP } from "./healthSystem";
import { clearActiveActivityForSwitch } from "./activitySwitching";
import { updateWorldUnlocks } from "./worldUnlocks";
import { emitRewardPopupGroup } from "./rewardPopups";
import { getActiveModifiers } from "./modifiers";
import { scaledStats } from "./itemFormulas";
import type { AttributeId, MissionApproach, TacticalAction } from "../rpgTypes";
import type { GameState } from "../types";

export const rpgXpNeeded = (level: number) => 100 + level * 60;
export const missionById = (id: string) => allRpgMissions.find(mission => mission.id === id);
export const mainChaptersCleared = (state: GameState) => rpgMissions.filter(mission => state.rpg.completed[mission.id]).length;
export const communityDecisions = (state: GameState) => rpgMissions.filter(mission => state.rpg.completed[mission.id]?.outcome === "protect").length;
export const fieldInjectorCount = (state: GameState) => 2 + (state.rpg.perks["field-medic"] ? 1 : 0) + (communityDecisions(state) >= 3 ? 1 : 0);
export function campaignEpilogue(state: GameState) {
  const support = communityDecisions(state);
  return support >= 5 ? "When the tower goes dark, the people you saved keep your name alive. Clinic doors open. Safehouses answer. For once, you have somewhere to go home."
    : support >= 3 ? "Some neighborhoods call you a hero. Others remember the deals you made. Your allies leave a place at the table, but the city has a long memory."
    : "Your accounts are full of favors owed by powerful people. Below the skyline, the survivors remember who signed the deals. Every safehouse has a price now.";
}
export function missionAvailable(state: GameState, mission: RpgMission) {
  if (!state.startingPath || !state.rpg.starterClaimed) return false;
  if (!mission.sideGig && state.rpg.completed[mission.id]) return false;
  return mission.act === 0 || Boolean(state.rpg.completed[rpgMissions[mission.act - 1].id]);
}

export function claimFieldKit(state: GameState) {
  if (!state.startingPath || state.rpg.starterClaimed) return state;
  const next = cloneState(state);
  next.rpg.starterClaimed = true;
  grantStarterQuickhacks(next);
  addItem(next, "rpg-weapon-0"); addItem(next, "padded-street-vest"); addItem(next, "basic-med-injector", 5);
  if (!next.equippedGear.weapon) next.equippedGear.weapon = "rpg-weapon-0";
  if (!next.equippedGear.chest) next.equippedGear.chest = "padded-street-vest";
  next.health.currentHp = calculateMaxHP(next); next.health.lifeState = "alive";
  pushCategorizedLog(next, "World", "Field kit received: sidearm, armor, five injectors, and a rechargeable quickhack deck.");
  return next;
}

export function spendAttribute(state: GameState, id: AttributeId) {
  if (state.rpg.active || state.rpg.attributePoints < 1 || !(id in state.rpg.attributes) || state.rpg.attributes[id] >= 20) return state;
  const next = cloneState(state); next.rpg.attributes[id]++; next.rpg.attributePoints--;
  return next;
}
export function buyRpgPerk(state: GameState, id: string) {
  const perk = rpgPerks.find(entry => entry.id === id);
  if (!perk || state.rpg.active || state.rpg.perkPoints < 1 || state.rpg.perks[id] || state.rpg.attributes[perk.attribute] < perk.requirement) return state;
  const next = cloneState(state); next.rpg.perks[id] = true; next.rpg.perkPoints--;
  return next;
}
export function respecRpg(state: GameState) {
  if (state.rpg.active) return state;
  const next = cloneState(state);
  next.rpg.attributePoints += Object.values(next.rpg.attributes).reduce((sum, value) => sum + Math.max(0, value - 3), 0);
  next.rpg.perkPoints += Object.values(next.rpg.perks).filter(Boolean).length;
  for (const id of Object.keys(next.rpg.attributes) as AttributeId[]) next.rpg.attributes[id] = 3;
  next.rpg.perks = {};
  next.health.currentHp = Math.min(next.health.currentHp, calculateMaxHP(next));
  return next;
}

export function approachRequirement(state: GameState, mission: RpgMission, approach: MissionApproach) {
  const threshold = 4 + mission.act;
  if (approach === "ghost") return { met: state.rpg.attributes.cool >= threshold, label: `Cool ${threshold} · enemies start with 25% less health` };
  if (approach === "netrunner") return { met: state.rpg.attributes.intelligence >= threshold, label: `Intelligence ${threshold} · +35% quickhack damage` };
  if (approach === "lifepath") return { met: state.startingPath === mission.lifepath, label: `${mission.lifepath === "streetborn" ? "Streetborn" : mission.lifepath === "outrider" ? "Outrider" : "Corporate Defector"} · bypass the first patrol (or weaken a solo enemy)` };
  return { met: true, label: "Always available · +15% weapon damage" };
}

export function startRpgMission(state: GameState, id: string) {
  const mission = missionById(id);
  if (!mission || state.rpg.active || !missionAvailable(state, mission)) return state;
  const next = cloneState(state);
  clearActiveActivityForSwitch(state, next, mission.title);
  next.selectedDistrict = mission.district;
  next.health.currentHp = calculateMaxHP(next); next.health.lifeState = "alive";
  next.rpg.active = { missionId: id, phase: "briefing", approach: null, enemyIndex: 0, enemyHp: 0, enemyMaxHp: 0,
    turn: 0, ram: maxRam(next), meds: fieldInjectorCount(next), aimed: false, log: ["Fixer clinic check complete. Health restored; field injectors supplied for this mission."] };
  return next;
}

export function chooseMissionApproach(state: GameState, approach: MissionApproach) {
  const active = state.rpg.active;
  const mission = active && missionById(active.missionId);
  if (!active || active.phase !== "briefing" || !mission || !["assault", "ghost", "netrunner", "lifepath"].includes(approach) || !approachRequirement(state, mission, approach).met) return state;
  const next = cloneState(state), encounter = next.rpg.active!;
  encounter.approach = approach;
  encounter.enemyIndex = approach === "lifepath" && mission.enemies.length > 1 ? 1 : 0;
  setupEnemy(next, mission);
  return next;
}

export function maxRam(state: GameState) { const deck = equippedDeck(state); return deck ? 5 + Math.floor(state.rpg.attributes.intelligence / 2) + Math.min(6, (deck.tier ?? 1) + 1) : 0; }
export function tacticalStats(state: GameState) {
  const a = state.rpg.attributes, weapon = state.equippedGear.weapon && getItem(state.equippedGear.weapon);
  const gear = weapon ? Math.min(22, Math.sqrt(scaledStats(state, weapon.id).damage ?? 0) * 2) : 0;
  const armor = Object.values(state.equippedGear).reduce((sum, id) => sum + (scaledStats(state, id).armor ?? 0), 0);
  const modifiers = getActiveModifiers(state);
  return {
    damage: Math.round((20 + a.body * 0.8 + a.reflexes + state.rpg.level * 1.5 + gear) * (1 + Math.min(0.5, modifiers.combatDamage))),
    hack: Math.round((19 + a.intelligence * 3 + state.rpg.level) * (state.rpg.perks.synapse ? 1.4 : 1)),
    mitigation: Math.min(0.65, (a.technical - 3) * 0.015 + Math.min(0.2, armor * (1 + modifiers.combatDefense) * 0.004) + Math.max(0, modifiers.damageReduction) + (state.rpg.perks["reactive-armor"] ? 0.2 : 0)),
    heal: Math.min(0.75, (0.35 + a.technical * 0.015) * (1 + modifiers.healingReceived)),
  };
}
export function enemyIntent(state: GameState) {
  const active = state.rpg.active;
  return active && active.turn % 3 === 2 ? "Charged burst" : active && active.turn % 3 === 1 ? "Suppressing fire" : "Direct shot";
}
export function canUseTactic(state: GameState, action: TacticalAction) {
  const e = state.rpg.active;
  if (!e || e.phase !== "combat") return false;
  if (["hack", "disrupt", "burnout"].includes(action)) { const hack = installedQuickhacks(state).find(h => h.action === action); return Boolean(hack && e.ram >= hack.ram); }
  if (action === "heal") return e.meds > 0 && state.health.currentHp < calculateMaxHP(state);
  if (action === "overclock") return e.ram < maxRam(state);
  return ["attack", "aim", "cover"].includes(action);
}

export function performTactic(state: GameState, action: TacticalAction) {
  if (!canUseTactic(state, action)) return state;
  const next = cloneState(state), e = next.rpg.active!, mission = missionById(e.missionId)!;
  const stats = tacticalStats(next), maxHp = calculateMaxHP(next);
  let damage = 0, stun = false, cover = false;
  if (action === "attack") {
    damage = stats.damage * (e.approach === "assault" ? 1.15 : 1) * (e.aimed ? 1.8 + (next.rpg.perks.deadeye ? 0.4 : 0) : 1);
    if (next.rpg.perks.adrenaline && next.health.currentHp < maxHp / 2) damage *= 1.3;
    if (next.rpg.perks.finisher && e.enemyHp <= e.enemyMaxHp * 0.25) damage = e.enemyHp;
    e.aimed = false;
  }
  if (action === "hack" || action === "disrupt" || action === "burnout") {
    const hack = installedQuickhacks(next).find(h => h.action === action)!;
    e.ram -= hack.ram;
    damage = stats.hack * hack.multiplier * (e.approach === "netrunner" ? 1.35 : 1);
    stun = hack.interrupt;
  }
  if (action === "aim") { e.aimed = true; cover = true; }
  if (action === "cover") { cover = true; if (next.rpg.perks["vanishing-point"]) e.aimed = true; }
  if (action === "heal") { e.meds--; next.health.currentHp = Math.min(maxHp, next.health.currentHp + Math.round(maxHp * stats.heal)); }
  if (action === "overclock") { e.ram = Math.min(maxRam(next), e.ram + 3); cover = true; }
  if (e.turn === 0 && next.rpg.perks.ambush) damage *= 1.6;
  damage = Math.round(damage);
  e.enemyHp = Math.max(0, e.enemyHp - damage);
  const labels: Record<TacticalAction, string> = { attack: "Weapon attack", aim: "Aimed from cover", cover: "Took cover", hack: "Short Circuit", disrupt: "Reboot Optics", burnout: "Synapse Burnout", heal: "Used field injector", overclock: "Recovered RAM from cover" };
  e.log.push(`${labels[action]}${damage ? `: ${damage} damage` : ""}.`);
  if (e.enemyHp <= 0) {
    e.log.push(`${mission.enemies[e.enemyIndex]} neutralized.`);
    e.enemyIndex++;
    if (next.rpg.perks["second-wind"]) next.health.currentHp = Math.min(maxHp, next.health.currentHp + Math.round(maxHp * 0.2));
    if (e.enemyIndex >= mission.enemies.length) { e.phase = "decision"; e.log.push("Area clear. Your contact is waiting for your decision."); }
    else setupEnemy(next, mission);
  } else {
    if (!stun) {
      const charged = e.turn % 3 === 2;
      const incoming = Math.max(1, Math.round((10 + mission.act * 2 + e.enemyIndex * 2) * (charged ? 1.8 : 1) * (1 - stats.mitigation) * (cover ? Math.max(0.2, 0.45 - next.rpg.attributes.cool * 0.012) : 1)));
      next.health.currentHp = Math.max(0, next.health.currentHp - incoming);
      next.healthStatistics.totalDamageTaken += incoming;
      e.log.push(`${charged ? "Charged burst" : "Enemy fire"}: ${incoming} damage${cover ? " through cover" : ""}.`);
    } else e.log.push("Enemy optics rebooted. Counterattack interrupted.");
    e.turn++;
    e.ram = Math.min(maxRam(next), e.ram + (next.rpg.perks["ram-recycler"] ? 2 : 1));
    if (next.health.currentHp <= 0) { e.phase = "failed"; next.health.lifeState = "downed"; e.log.push("Your fixer pulled you out. Retry with a refreshed field kit, or leave and change your build."); }
  }
  e.log = e.log.slice(-12);
  return next;
}

function setupEnemy(state: GameState, mission: RpgMission) {
  const e = state.rpg.active!;
  e.phase = "combat"; e.turn = 0; e.aimed = false;
  e.enemyMaxHp = Math.round((80 + mission.act * 24 + e.enemyIndex * 18) * (e.approach === "ghost" || (e.approach === "lifepath" && mission.enemies.length === 1) ? 0.75 : 1));
  e.enemyHp = e.enemyMaxHp; e.ram = maxRam(state);
  e.log.push(`Contact: ${mission.enemies[e.enemyIndex]}. Read the enemy intent before choosing your move.`);
}

export function leaveRpgMission(state: GameState) {
  if (!state.rpg.active) return state;
  const next = cloneState(state); next.rpg.active = null;
  next.health.currentHp = calculateMaxHP(next); next.health.lifeState = "alive";
  pushCategorizedLog(next, "World", "Returned to the fixer clinic. Mission progress reset; no rewards claimed.");
  return next;
}
export function retryRpgMission(state: GameState) {
  if (state.rpg.active?.phase !== "failed") return state;
  return startRpgMission(leaveRpgMission(state), state.rpg.active.missionId);
}

export function resolveRpgMission(state: GameState, choiceId: string) {
  const e = state.rpg.active, mission = e && missionById(e.missionId), choice = mission?.choices.find(c => c.id === choiceId);
  if (!e || e.phase !== "decision" || !e.approach || !mission || !choice || (!mission.sideGig && state.rpg.completed[mission.id])) return state;
  const next = cloneState(state);
  const repeated = Boolean(next.rpg.completed[mission.id]);
  next.rpg.completed[mission.id] = { outcome: choice.id, approach: e.approach, clears: (next.rpg.completed[mission.id]?.clears ?? 0) + 1 };
  next.rpg.active = null;
  next.resources.credits += mission.reward + choice.bonusCredits;
  next.resources.reputation = Math.max(0, next.resources.reputation + choice.reputation);
  next.rpg.streetCred += mission.sideGig ? 2 : 10;
  next.rpg.xp += repeated ? Math.round(mission.xp * 0.5) : mission.xp;
  while (next.rpg.level < 30 && next.rpg.xp >= rpgXpNeeded(next.rpg.level)) {
    next.rpg.xp -= rpgXpNeeded(next.rpg.level); next.rpg.level++; next.rpg.attributePoints += 2; next.rpg.perkPoints++;
  }
  if (next.rpg.level >= 30) next.rpg.xp = 0;
  const supply = materialSupplyActions.find(action => action.districtReq === mission.district);
  const loot: Record<string, number> = { ...supply?.itemRewards, "basic-med-injector": 2 };
  if (mission.act >= 2 && !state.inventory["quickhack-synapse-burnout"]) loot["quickhack-synapse-burnout"] = 1;
  for (const [id, amount] of Object.entries(loot)) addItem(next, id, amount);
  if (!mission.sideGig) {
    const weaponId = `rpg-weapon-${Math.min(7, mission.act + 1)}`;
    addItem(next, weaponId);
    if ((getItem(next.equippedGear.weapon ?? "")?.stats?.damage ?? 0) < (getItem(weaponId)?.stats?.damage ?? 0)) next.equippedGear.weapon = weaponId;
    next.storyFlags[`afterimage:${mission.id}:${choice.id}`] = true;
    next.factions[choice.reputation >= 0 ? "ghostMarket" : "helixOrder"].reputation += 10;
    const nextDistrict = rpgMissions[mission.act + 1]?.district;
    if (nextDistrict) next.districts[nextDistrict] = { ...next.districts[nextDistrict], unlocked: true, unlockProgress: 100 };
    if (mission.act === 7) {
      next.rpg.ending = choice.id;
      next.achievements["afterimage-complete"] = true;
      addItem(next, "rpg-afterimage-os");
    }
  }
  updateWorldUnlocks(next);
  next.health.currentHp = calculateMaxHP(next); next.health.lifeState = "alive";
  pushCategorizedLog(next, "World", `${mission.title}: ${choice.response}`);
  emitRewardPopupGroup(next, { title: `${mission.title} complete`, category: "story", resources: { credits: mission.reward + choice.bonusCredits, reputation: choice.reputation }, items: loot, story: [choice.response] });
  return next;
}
