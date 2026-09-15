import { meetsItemAttributeRequirement } from "./runnerProgression";
import { factions } from "../data/factions";
import { changeLocalStanding } from "./districtProgression";
import { updateOperationAchievements } from "./achievements";
import { missionItemRewards, rollGigUnique } from "../data/missionRewards";
import { addDistrictMasteryXp } from "./districtMasteryProcessor";
import { fixers } from "../data/fixers";
import { equippedDeck, grantStarterQuickhacks, installedQuickhacks, deckBonuses, quickhackRamCost, ramRecovery, quickhackForAction } from "./quickhackSystem";
import { allRpgMissions, rpgMissions, rpgPerks, type RpgMission } from "../data/rpgCampaign";
import { getItem } from "../data/items";
import { districtSupplyItems } from "../data/materialSupply";
import { cloneState, pushCategorizedLog } from "./gameState";
import { addItem } from "./collectionSystem";
import { calculateMaxHP } from "./healthSystem";
import { clearActiveActivityForSwitch } from "./activitySwitching";
import { updateWorldUnlocks } from "./worldUnlocks";
import { emitRewardPopupGroup } from "./rewardPopups";
import { getActiveModifiers } from "./modifiers";
import { scaledStats } from "./itemFormulas";
import type { AttributeId, MissionApproach, TacticalAction, GigRisk } from "../rpgTypes";
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
export function canBuyRpgPerk(state: GameState, id: string) {
  const perk = rpgPerks.find(entry => entry.id === id);
  return Boolean(perk && !state.rpg.active && state.rpg.perkPoints > 0 && !state.rpg.perks[id] && state.rpg.attributes[perk.attribute] >= perk.requirement && (perk.requires ?? []).every(parent => state.rpg.perks[parent]));
}
export function buyRpgPerk(state: GameState, id: string) {
  const perk = rpgPerks.find(entry => entry.id === id);
  if (!canBuyRpgPerk(state, id)) return state;
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
  const stillEligible = ([, id]: [string, string]) => {
    const item = getItem(id);
    return Boolean(item && meetsItemAttributeRequirement(next, item));
  };
  next.equippedGear = Object.fromEntries(Object.entries(next.equippedGear).filter(stillEligible));
  next.equippedCyberware = Object.fromEntries(Object.entries(next.equippedCyberware).filter(stillEligible));
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

export const gigRisks = {
  standard: { label: "Standard", payout: 1, health: 1, damage: 1, clears: 0 },
  dangerous: { label: "Dangerous", payout: 1.5, health: 1.35, damage: 1.2, clears: 1 },
  elite: { label: "Elite", payout: 2, health: 1.75, damage: 1.45, clears: 3 },
} as const;
export function gigPayout(mission: RpgMission, risk: GigRisk = "standard") { return Math.round(mission.reward * (mission.sideGig ? gigRisks[risk].payout : 1)); }
export function heatCleanupCost(state: GameState) { return Math.ceil(Math.max(0, state.resources.heat) * 10); }
export function clearHeatWithFixer(state: GameState) {
  const cost = heatCleanupCost(state);
  if (state.rpg.active || cost <= 0 || state.resources.credits < cost) return state;
  const next = cloneState(state); next.resources.credits -= cost; next.resources.heat = 0;
  pushCategorizedLog(next, "World", "Fixer cleanup: Heat cleared for " + cost + " credits.");
  return next;
}

export function startRpgMission(state: GameState, id: string, risk: GigRisk = "standard") {
  const mission = missionById(id);
  if (!mission || state.rpg.active || !missionAvailable(state, mission)) return state;
  if (!Object.prototype.hasOwnProperty.call(gigRisks, risk) || (mission.sideGig && (state.rpg.completed[id]?.clears ?? 0) < gigRisks[risk].clears)) return state;
  const next = cloneState(state);
  clearActiveActivityForSwitch(state, next, mission.title);
  next.selectedDistrict = mission.district;
  next.health.currentHp = calculateMaxHP(next); next.health.lifeState = "alive";
  next.rpg.active = { gigRisk: mission.sideGig ? risk : "standard", missionId: id, phase: "briefing", approach: null, enemyIndex: 0, enemyHp: 0, enemyMaxHp: 0,
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

export function maxRam(state: GameState) { const deck = equippedDeck(state); return deck ? 5 + Math.floor(state.rpg.attributes.intelligence / 2) + deckBonuses(state).ram + (state.rpg.perks["expanded-memory"] ? 3 : 0) : 0; }
export function tacticalStats(state: GameState) {
  const a = state.rpg.attributes, weapon = state.equippedGear.weapon && getItem(state.equippedGear.weapon);
  const gear = weapon ? Math.min(22, Math.sqrt(scaledStats(state, weapon.id).damage ?? 0) * 2) : 0;
  const armor = Object.values(state.equippedGear).reduce((sum, id) => sum + (scaledStats(state, id).armor ?? 0), 0);
  const modifiers = getActiveModifiers(state);
  return {
    damage: Math.round((20 + a.body * 0.8 + a.reflexes + state.rpg.level * 1.5 + gear) * (1 + Math.min(0.5, modifiers.combatDamage))),
    hack: Math.round((19 + a.intelligence * 3 + state.rpg.level) * (state.rpg.perks.synapse ? 1.4 : 1) * (1 + deckBonuses(state).damage + (state.rpg.perks["neural-sovereign"] ? .2 : 0))),
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
  if (action.startsWith("quickhack:") || ["hack", "disrupt", "burnout"].includes(action)) { const hack = quickhackForAction(state, action); return Boolean(hack && e.ram >= quickhackRamCost(state, hack)); }
  if (action === "heal") return e.meds > 0 && state.health.currentHp < calculateMaxHP(state);
  if (action === "overclock") return e.ram < maxRam(state);
  return ["attack", "aim", "cover"].includes(action);
}

export function performTactic(state: GameState, action: TacticalAction) {
  if (!canUseTactic(state, action)) return state;
  const next = cloneState(state), e = next.rpg.active!, mission = missionById(e.missionId)!;
  const stats = tacticalStats(next), maxHp = calculateMaxHP(next);
  let damage = 0, stun = false, cover = false;
  const hack = quickhackForAction(next, action);
  if (action === "attack") {
    damage = stats.damage * (e.approach === "assault" ? 1.15 : 1) * (e.aimed ? 1.8 + (next.rpg.perks.deadeye ? 0.4 : 0) : 1);
    if (next.rpg.perks["bullet-time"] && e.aimed) damage *= 1.35;
    if (next.rpg.perks.adrenaline && next.health.currentHp < maxHp / 2) damage *= 1.3;
    if (next.rpg.perks.finisher && e.enemyHp <= e.enemyMaxHp * 0.25) damage = e.enemyHp;
    e.aimed = false;
  }
  if (hack) {
    e.ram -= quickhackRamCost(next, hack);
    damage = stats.hack * hack.multiplier * (e.approach === "netrunner" ? 1.35 : 1);
    stun = hack.interrupt;
    if (hack.effect === "burn") { e.burnDamage = Math.round(stats.hack * (hack.potency ?? 0) * (e.approach === "netrunner" ? 1.35 : 1)); e.burnTurns = 3 + (next.rpg.perks["persistent-code"] ? 1 : 0); }
    if (hack.effect === "weaken") { e.weaken = hack.potency; e.weakenTurns = 2 + (next.rpg.perks["persistent-code"] ? 1 : 0); }
  }
  if (action === "aim") { e.aimed = true; cover = true; }
  if (action === "cover") { cover = true; if (next.rpg.perks["vanishing-point"]) e.aimed = true; }
  if (action === "heal") { e.meds--; next.health.currentHp = Math.min(maxHp, next.health.currentHp + Math.round(maxHp * stats.heal)); }
  if (action === "overclock") { e.ram = Math.min(maxRam(next), e.ram + 3); cover = true; }
  if (e.turn <= (next.rpg.perks["ghost-protocol"] ? 1 : 0) && next.rpg.perks.ambush) damage *= 1.6;
  damage = Math.round(damage);
  if (hack?.effect === "siphon") {
    const healing = Math.min(maxHp - next.health.currentHp, Math.round(Math.min(e.enemyHp, damage) * (hack.potency ?? 0)));
    next.health.currentHp += healing; e.log.push(`Memory siphon restored ${healing} HP.`);
  }
  e.enemyHp = Math.max(0, e.enemyHp - damage);
  if ((e.burnTurns ?? 0) > 0) { e.enemyHp = Math.max(0, e.enemyHp - (e.burnDamage ?? 0)); e.burnTurns!--; e.log.push(`Overheat: ${e.burnDamage} damage.`); }
  const labels: Partial<Record<TacticalAction, string>> = { attack: "Weapon attack", aim: "Aimed from cover", cover: "Took cover", hack: "Short Circuit", disrupt: "Reboot Optics", burnout: "Synapse Burnout", heal: "Used field injector", overclock: "Recovered RAM from cover" };
  e.log.push(`${hack?.name ?? labels[action]}${damage ? `: ${damage} damage` : ""}.`);
  if (e.enemyHp <= 0) {
    e.log.push(`${mission.enemies[e.enemyIndex]} neutralized.`);
    e.enemyIndex++;
    if (next.rpg.perks["second-wind"]) next.health.currentHp = Math.min(maxHp, next.health.currentHp + Math.round(maxHp * 0.2));
    if (e.enemyIndex >= mission.enemies.length) { e.phase = "decision"; e.log.push("Area clear. Your contact is waiting for your decision."); }
    else { setupEnemy(next, mission); if (action === "attack" && next.rpg.perks["chain-reaction"]) e.aimed = true; }
  } else {
    if (!stun) {
      const charged = e.turn % 3 === 2;
      const incoming = Math.max(1, Math.round((10 + mission.act * 2 + e.enemyIndex * 2) * (mission.sideGig ? gigRisks[e.gigRisk ?? "standard"].damage : 1) * (charged ? 1.8 : 1) * (1 - stats.mitigation) * ((e.weakenTurns ?? 0) > 0 ? 1 - (e.weaken ?? 0) : 1) * (cover ? Math.max(0.2, 0.45 - next.rpg.attributes.cool * 0.012) : 1)));
      next.health.currentHp = Math.max(0, next.health.currentHp - incoming);
      next.healthStatistics.totalDamageTaken += incoming;
      e.log.push(`${charged ? "Charged burst" : "Enemy fire"}: ${incoming} damage${cover ? " through cover" : ""}.`);
    } else e.log.push("Counterattack interrupted.");
    e.weakenTurns = Math.max(0, (e.weakenTurns ?? 0) - 1);
    e.turn++;
    e.ram = Math.min(maxRam(next), e.ram + ramRecovery(next));
    if (next.health.currentHp <= 0) { e.phase = "failed"; next.health.lifeState = "downed"; e.log.push("Your fixer pulled you out. Retry with a refreshed field kit, or leave and change your build."); }
  }
  e.log = e.log.slice(-12);
  return next;
}

function setupEnemy(state: GameState, mission: RpgMission) {
  const e = state.rpg.active!;
  e.phase = "combat"; e.turn = 0; e.aimed = false;
  e.burnDamage = 0; e.burnTurns = 0; e.weaken = 0; e.weakenTurns = 0;
  e.enemyMaxHp = Math.round((80 + mission.act * 24 + e.enemyIndex * 18) * (mission.sideGig ? gigRisks[e.gigRisk ?? "standard"].health : 1) * (e.approach === "ghost" || (e.approach === "lifepath" && mission.enemies.length === 1) ? 0.75 : 1));
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
  return startRpgMission(leaveRpgMission(state), state.rpg.active.missionId, state.rpg.active.gigRisk);
}

export function resolveRpgMission(state: GameState, choiceId: string, random: () => number = Math.random) {
  const e = state.rpg.active, mission = e && missionById(e.missionId), choice = mission?.choices.find(c => c.id === choiceId);
  if (!e || e.phase !== "decision" || !e.approach || !mission || !choice || (!mission.sideGig && state.rpg.completed[mission.id])) return state;
  const next = cloneState(state);
  const repeated = Boolean(next.rpg.completed[mission.id]);
  next.rpg.completed[mission.id] = { outcome: choice.id, approach: e.approach, clears: (next.rpg.completed[mission.id]?.clears ?? 0) + 1 };
  next.rpg.active = null;
  const payout = gigPayout(mission, e.gigRisk) + choice.bonusCredits;
  next.resources.credits += payout;
  if (mission.sideGig) next.resources.heat = Math.max(0, next.resources.heat - 15);
  next.resources.reputation = Math.max(0, next.resources.reputation + choice.reputation);
  next.rpg.streetCred += mission.sideGig ? 2 : 10;
  next.rpg.xp += repeated ? Math.round(mission.xp * 0.5) : mission.xp;
  while (next.rpg.level < 30 && next.rpg.xp >= rpgXpNeeded(next.rpg.level)) {
    next.rpg.xp -= rpgXpNeeded(next.rpg.level); next.rpg.level++; next.rpg.attributePoints += 2; next.rpg.perkPoints++;
  }
  if (next.rpg.level >= 30) next.rpg.xp = 0;
  const loot = missionItemRewards(mission, state.rpg.completed[mission.id]?.clears ?? 0);
  const fixer = fixers.find(entry => entry.name === mission.fixer);
  if (fixer) {
    const progress = next.fixerTrust[fixer.id] ?? { trust: 0, completedJobs: 0 };
    next.fixerTrust[fixer.id] = { ...progress, trust: progress.trust + (mission.sideGig ? 3 : 12), completedJobs: progress.completedJobs + 1 };
  }
  addDistrictMasteryXp(next, mission.district, "action", mission.sideGig ? 40 + mission.act * 25 : 250 + mission.act * 100);
  const unique = rollGigUnique(mission, random);
  if (unique) loot[unique] = (loot[unique] ?? 0) + 1;
  for (const [id, amount] of Object.entries(loot)) addItem(next, id, amount);
  if (!mission.sideGig) {
    next.storyFlags[`afterimage:${mission.id}:${choice.id}`] = true;
    next.factions[choice.reputation >= 0 ? "ghostMarket" : "helixOrder"].reputation += 10;
    const nextDistrict = rpgMissions[mission.act + 1]?.district;
    if (nextDistrict) next.districts[nextDistrict] = { ...next.districts[nextDistrict], unlocked: true, unlockProgress: 100 };
    if (mission.act === 7) {
      next.rpg.ending = choice.id;
      next.achievements["afterimage-complete"] = true;

    }
  }
  for (const faction of factions.filter(entry => entry.districtInfluence.includes(mission.district))) next.factions[faction.id].reputation += mission.sideGig ? 2 : 5;
  changeLocalStanding(next, mission.district, mission.sideGig ? 2 : 8, mission.title);
  updateOperationAchievements(next);
  updateWorldUnlocks(next);
  next.health.currentHp = calculateMaxHP(next); next.health.lifeState = "alive";
  pushCategorizedLog(next, "World", `${mission.title}: ${choice.response}`);
  emitRewardPopupGroup(next, { title: `${mission.title} complete`, category: "story", resources: { credits: payout, reputation: choice.reputation }, items: loot, story: [choice.response] });
  return next;
}
