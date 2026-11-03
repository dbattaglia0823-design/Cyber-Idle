import { iconicWeaponHit, iconicIncoming, iconicKill, resetIconicTarget, iconicNonAttack } from "./iconicCombat";
import { addWeaponClassXp, equippedWeaponClass, weaponClassBonus } from "./weaponSystem";
import { grantCharacterXp } from "./characterProgression";
import { contractBonus, gigContracts, type GigContractId } from "../data/gigContracts";
import { gigUniqueCandidates } from "../data/missionRewards";
import { tacticalWeaponPower, tacticalWeaponStats, tacticalWeaponTempo } from "./tacticalEquipment";
import { runnerXpNeeded, progressionBalance } from "../data/campaignBalance";
import { encounterTraits, tacticalIntent } from "./tacticalTraits";
import { mainJobBalance } from "../data/mainJobBalance";
import { meetsItemAttributeRequirement, enforceCharacterPointBudget } from "./runnerProgression";
import { factions } from "../data/factions";
import { changeLocalStanding } from "./districtProgression";
import { updateOperationAchievements } from "./achievements";
import { missionItemRewards, rollGigUnique, rollDistrictWeapon } from "../data/missionRewards";
import { addDistrictMasteryXp } from "./districtMasteryProcessor";
import { fixers } from "../data/fixers";
import { equippedDeck, grantStarterQuickhacks, installedQuickhacks, deckBonuses, quickhackRamCost, ramRecovery, quickhackForAction } from "./quickhackSystem";
import { allRpgMissions, rpgMissions, rpgPerks, type RpgMission } from "../data/rpgCampaign";
import { getItem, canonicalWeaponId } from "../data/items";
import { districtSupplyItems } from "../data/materialSupply";
import { chooseStartingPath, cloneState, pushCategorizedLog } from "./gameState";
import { addItem } from "./collectionSystem";
import { calculateMaxHP } from "./healthSystem";
import { clearActiveActivityForSwitch } from "./activitySwitching";
import { updateWorldUnlocks } from "./worldUnlocks";
import { emitRewardPopupGroup } from "./rewardPopups";
import { getActiveModifiers } from "./modifiers";
import { scaledStats } from "./itemFormulas";
import type { AttributeId, MissionApproach, TacticalAction, GigRisk } from "../rpgTypes";
import type { GameState, StartingPathId } from "../types";

export const rpgXpNeeded = runnerXpNeeded;
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
  enforceCharacterPointBudget(next);
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

export function startRpgMission(state: GameState, id: string, risk: GigRisk = "standard", contract: GigContractId = "none", bossReplay = false) {
  const mission = missionById(id);
  if(!Object.prototype.hasOwnProperty.call(gigContracts,contract)) return state;
  if (!mission || state.rpg.active || (bossReplay ? !canReplayBoss(state, mission) : !missionAvailable(state, mission))) return state;
  if (!Object.prototype.hasOwnProperty.call(gigRisks, risk) || (mission.sideGig && (state.rpg.completed[id]?.clears ?? 0) < gigRisks[risk].clears)) return state;
  const next = cloneState(state);
  clearActiveActivityForSwitch(state, next, mission.title);
  next.selectedDistrict = mission.district;
  next.health.currentHp = calculateMaxHP(next); next.health.lifeState = "alive";
  next.rpg.active = { bossReplay, gigVariant: mission.sideGig ? (state.rpg.completed[id]?.clears ?? 0) % 3 : 0, contract: mission.sideGig ? { id:contract, injectors:0, interrupts:0, aimedHits:0 } : undefined, gigRisk: mission.sideGig ? risk : "standard", missionId: id, phase: "briefing", approach: null, enemyIndex: 0, enemyHp: 0, enemyMaxHp: 0,
    turn: 0, ram: maxRam(next), meds: fieldInjectorCount(next), aimed: false, log: ["Fixer clinic check complete. Health restored; field injectors supplied for this mission."] };
  return next;
}

export function canReplayBoss(state:GameState, mission:RpgMission) { return Boolean(state.startingPath&&state.rpg.starterClaimed&&!mission.sideGig&&state.rpg.completed[mission.id]&&state.districts[mission.district]?.unlocked); }
export function startBossReplay(state:GameState,id:string) { return startRpgMission(state,id,"standard","none",true); }

export function chooseMissionApproach(state: GameState, approach: MissionApproach) {
  const active = state.rpg.active;
  const mission = active && missionById(active.missionId);
  if (!active || active.phase !== "briefing" || !mission || !["assault", "ghost", "netrunner", "lifepath"].includes(approach) || !approachRequirement(state, mission, approach).met) return state;
  const next = cloneState(state), encounter = next.rpg.active!;
  encounter.approach = approach;
  encounter.enemyIndex = encounter.bossReplay ? mission.enemies.length - 1 : approach === "lifepath" && mission.enemies.length > 1 ? 1 : 0;
  setupEnemy(next, mission);
  return next;
}

export function maxRam(state: GameState) { const deck = equippedDeck(state); return deck ? 5 + Math.floor(state.rpg.attributes.intelligence / 2) + deckBonuses(state).ram + (state.rpg.perks["expanded-memory"] ? 3 : 0) : 0; }
export function tacticalStats(state: GameState) {
  const a = state.rpg.attributes;
  const gear = tacticalWeaponPower(state);
  const mastery = weaponClassBonus(state, equippedWeaponClass(state)!).damage;
  const tempo = tacticalWeaponTempo(state);
  const armor = [...Object.values(state.equippedGear), ...Object.values(state.equippedCyberware)].reduce((sum, id) => sum + (scaledStats(state, id).armor ?? 0), 0);
  const modifiers = getActiveModifiers(state);
  return {
    armorPenetration: Math.min(.8, Math.max(0, tacticalWeaponStats(state).armorPenetration ?? 0) / 100),
    damage: Math.round(((20 + a.body * 0.8 + a.reflexes + state.rpg.level * 1.5) * tempo + gear) * (1 + Math.min(.25, modifiers.combatAttackSpeed)) * (1 + Math.min(0.5, modifiers.combatDamage) + mastery)),
    hack: Math.round((19 + a.intelligence * 3 + state.rpg.level) * (state.rpg.perks.synapse ? 1.4 : 1) * (1 + deckBonuses(state).damage + (state.rpg.perks["neural-sovereign"] ? .2 : 0))),
    mitigation: Math.min(0.65, (a.technical - 3) * 0.015 + 0.35 * (armor * (1 + modifiers.combatDefense)) / (60 + armor * (1 + modifiers.combatDefense)) + Math.max(0, modifiers.damageReduction) + (state.rpg.perks["reactive-armor"] ? 0.2 : 0)),
    heal: Math.min(0.75, (0.35 + a.technical * 0.015) * (1 + modifiers.healingReceived)),
  };
}
export function missionEnemyStats(mission: RpgMission, enemyIndex: number, risk: GigRisk = "standard") {
  const boss = !mission.sideGig && enemyIndex === mission.enemies.length - 1;
  if (mission.sideGig) return { boss: false, health: Math.round(Math.max(80, mainJobBalance[mission.district].health * progressionBalance.gigHealthRatio) * gigRisks[risk].health), damage: Math.max(10, mainJobBalance[mission.district].damage * progressionBalance.gigDamageRatio) * gigRisks[risk].damage };
  const tier = mainJobBalance[mission.district];
  return {
    boss,
    health: Math.round(tier.health * (boss ? 1.8 : 1 + enemyIndex * 0.1)),
    damage: tier.damage * (boss ? 1.35 : 1 + enemyIndex * 0.06),
  };
}

export function enemyIntent(state: GameState) {
  const active = state.rpg.active;
  const mission = active && missionById(active.missionId);
  return active && mission ? tacticalIntent(mission, active).attack : "Direct shot";
}
export function canUseTactic(state: GameState, action: TacticalAction) {
  const e = state.rpg.active;
  if (!e || e.phase !== "combat") return false;
  if (action.startsWith("quickhack:") || ["hack", "disrupt", "burnout"].includes(action)) { const hack = quickhackForAction(state, action); return Boolean(hack && e.ram >= quickhackRamCost(state, hack)); }
  if (action === "heal") return e.meds > 0 && (state.health.currentHp < calculateMaxHP(state) || (e.playerBleedTurns ?? 0) > 0);
  if (action === "overclock") return e.ram < maxRam(state);
  return ["attack", "aim", "cover"].includes(action);
}

export function performTactic(state: GameState, action: TacticalAction) {
  if (!canUseTactic(state, action)) return state;
  const next = cloneState(state), e = next.rpg.active!, mission = missionById(e.missionId)!;
  const feedback = { damage: 0, taken: 0, blocked: 0, healing: 0, interrupted: false, action: action as string };
  const stats = tacticalStats(next), maxHp = calculateMaxHP(next);
  const traits = encounterTraits(mission, e.enemyIndex, e.turn, e.gigVariant);
  const aimedAttack = action === "attack" && e.aimed;
  const weapon = getItem(next.equippedGear.weapon ?? "");
  const signature = weapon?.weaponModel ?? next.equippedGear.weapon;
  if(e.contract){if(action==="heal")e.contract.injectors++;if(aimedAttack)e.contract.aimedHits++;}
  const wasBurning = (e.burnTurns ?? 0) > 0;
  let damage = 0, stun = false, cover = false;
  const hack = quickhackForAction(next, action);
  if (action === "attack") {
    if (weapon?.weaponVariant === "Rapid" && e.ram < maxRam(next)) { e.ram = Math.min(maxRam(next), e.ram + 1); e.log.push("Rapid cadence restored 1 RAM."); }
    damage = stats.damage * (e.approach === "assault" ? 1.15 : 1) * (e.aimed ? 1.8 + (next.rpg.perks.deadeye ? 0.4 : 0) + (weapon?.weaponVariant === "Precision" ? .15 : 0) : 1);
    if (next.rpg.perks["bullet-time"] && e.aimed) damage *= 1.35;
    if (next.rpg.perks.adrenaline && next.health.currentHp < maxHp / 2) damage *= 1.3;
    if (next.rpg.perks.finisher && e.enemyHp <= e.enemyMaxHp * 0.25) damage = e.enemyHp;
    e.aimed = false;
  }
  const iconic = action === "attack" ? iconicWeaponHit(next,e,{mode:"field",damage,maxHp,enemyHp:e.enemyHp,enemyMaxHp:e.enemyMaxHp,armored:!!traits.armor,shielded:!!traits.shield,maxRam:maxRam(next)}) : undefined;
  if(iconic){
    damage*=iconic.multiplier;
    if(iconic.burn){e.burnDamage=Math.max(e.burnDamage??0,iconic.burn);e.burnTurns=Math.max(e.burnTurns??0,2);}
    if(iconic.weaken){e.weaken=Math.max(e.weaken??0,iconic.weaken);e.weakenTurns=Math.max(e.weakenTurns??0,2);}
    if(iconic.proc)e.log.push(`${weapon!.name}: signature triggered.`);
  } else iconicNonAttack(next,e);
  if (hack) {
    e.ram -= quickhackRamCost(next, hack);
    damage = stats.hack * hack.multiplier * (e.approach === "netrunner" ? 1.35 : 1);
    stun = hack.interrupt;
    if (hack.effect === "burn") { e.burnDamage = Math.round(stats.hack * (hack.potency ?? 0) * (e.approach === "netrunner" ? 1.35 : 1)); e.burnTurns = 3 + (next.rpg.perks["persistent-code"] ? 1 : 0); }
    if (hack.effect === "weaken") { e.weaken = hack.potency; e.weakenTurns = 2 + (next.rpg.perks["persistent-code"] ? 1 : 0); }
  }
  if (action === "attack") addWeaponClassXp(next, equippedWeaponClass(next)!, Math.max(1, Math.round(mission.xp / (mission.enemies.length * 20))), true);
  if (action === "aim") { e.aimed = true; cover = true; }
  if (action === "cover") { cover = true; if (next.rpg.perks["vanishing-point"]) e.aimed = true; }
  if (action === "heal") { e.playerBleedTurns = 0; e.playerBleedDamage = 0; const beforeHp = next.health.currentHp; e.meds--; next.health.currentHp = Math.min(maxHp, next.health.currentHp + Math.round(maxHp * stats.heal)); e.log.push(`Field injector restored ${next.health.currentHp - beforeHp} HP.`); }
  if (action === "overclock") { e.ram = Math.min(maxRam(next), e.ram + 3); cover = true; }
  if (e.turn <= (next.rpg.perks["ghost-protocol"] ? 1 : 0) && next.rpg.perks.ambush) damage *= 1.6;
  if (action === "attack" && !(next.rpg.perks.finisher && e.enemyHp <= e.enemyMaxHp * .25)) {
    if (traits.armor && !aimedAttack) { damage *= 1 - Math.max(0, traits.armor - stats.armorPenetration - (iconic?.penetration??0)/100); e.log.push("Plating reduced the shot. Aim or use a quickhack to bypass it."); }
    if (traits.shield) { damage *= 1 - traits.shield * (1-(iconic?.shieldPierce??0)); e.log.push("Shield absorbed part of the shot. Quickhacks bypass shields."); }
  }
  if(action==="attack" && signature===canonicalWeaponId("rpg-weapon-3") && (e.weakenTurns ?? 0)>0) {damage*=1.2;e.log.push("Sidearm exploited disabled movement.");}
  if(aimedAttack && signature===canonicalWeaponId("rpg-weapon-1") && e.ram<maxRam(next)){e.ram=Math.min(maxRam(next),e.ram+1);e.log.push("Sidearm rhythm restored 1 RAM.");}
  if(action==="cover" && signature===canonicalWeaponId("rpg-weapon-4")){const healing=Math.min(maxHp-next.health.currentHp,Math.round(maxHp*.03));next.health.currentHp+=healing;e.log.push(`Sidearm restored ${healing} HP.`);}
  damage = Math.round(damage + (iconic?.extra??0));
  if (hack?.effect === "siphon") {
    const healing = Math.min(maxHp - next.health.currentHp, Math.round(Math.min(e.enemyHp, damage) * (hack.potency ?? 0)));
    next.health.currentHp += healing; e.log.push(`Memory siphon restored ${healing} HP.`);
  }
  feedback.damage = Math.min(e.enemyHp, damage);
  e.enemyHp = Math.max(0, e.enemyHp - damage);
  if ((e.burnTurns ?? 0) > 0) { feedback.damage += Math.min(e.enemyHp, e.burnDamage ?? 0); e.enemyHp = Math.max(0, e.enemyHp - (e.burnDamage ?? 0)); e.burnTurns!--; e.log.push(`Overheat: ${e.burnDamage} damage.`); }
  const labels: Partial<Record<TacticalAction, string>> = { attack: "Weapon attack", aim: "Aimed from cover", cover: "Took cover", hack: "Short Circuit", disrupt: "Reboot Optics", burnout: "Synapse Burnout", heal: "Used field injector", overclock: "Recovered RAM from cover" };
  e.log.push(`${hack?.name ?? labels[action]}${damage ? `: ${damage} damage` : ""}.`);
  if(stun && e.contract && e.enemyHp>0)e.contract.interrupts++;
  if (e.enemyHp <= 0) {
    e.log.push(`${mission.enemies[e.enemyIndex]} neutralized.`);
    iconicKill(next,e,maxHp);
    e.enemyIndex++;
    if (next.rpg.perks["second-wind"]) next.health.currentHp = Math.min(maxHp, next.health.currentHp + Math.round(maxHp * 0.2));
    if (e.enemyIndex >= mission.enemies.length) { e.phase = "decision"; e.log.push("Area clear. Your contact is waiting for your decision."); }
    else { setupEnemy(next, mission); if (action === "attack" && next.rpg.perks["chain-reaction"]) e.aimed = true; }
  } else {
    if (traits.regeneration && !stun && !wasBurning && !iconic?.burn && hack?.effect !== "burn") {
      const repaired = Math.min(e.enemyMaxHp - e.enemyHp, Math.round(e.enemyMaxHp * traits.regeneration));
      e.enemyHp += repaired; if (repaired > 0) e.log.push(`Repair system restored ${repaired} enemy HP. Interrupt or Overheat to stop recovery.`);
    } else if (traits.regeneration) e.log.push("Repair system suppressed.");
    if ((e.playerBleedTurns ?? 0) > 0) {
      const bleeding = Math.min(next.health.currentHp, e.playerBleedDamage ?? 0);
      feedback.taken += bleeding;
      next.health.currentHp -= bleeding; next.healthStatistics.totalDamageTaken += bleeding; e.playerBleedTurns!--; e.log.push(`Bleeding: ${bleeding} damage. Injector clears bleeding.`);
    }
    if (!stun && next.health.currentHp > 0) {
      const charged = traits.charged;
      const incoming = Math.max(1, Math.round(missionEnemyStats(mission, e.enemyIndex, e.gigRisk).damage * (charged ? 1.8 : traits.recovery ? .8 : 1) * (1 - stats.mitigation) * ((e.weakenTurns ?? 0) > 0 ? 1 - (e.weaken ?? 0) : 1) * iconicIncoming(next,e) * (cover ? Math.max(0.2, 0.45 - next.rpg.attributes.cool * 0.012) : 1)));
      feedback.taken += Math.min(next.health.currentHp, incoming);
      const rawIncoming = Math.round(missionEnemyStats(mission, e.enemyIndex, e.gigRisk).damage * (charged ? 1.8 : traits.recovery ? .8 : 1));
      feedback.blocked = Math.max(0, rawIncoming - incoming);
      next.health.currentHp = Math.max(0, next.health.currentHp - incoming);
      next.healthStatistics.totalDamageTaken += incoming;
      if (traits.ramDrain && !cover && e.iconicMemory?.ramWard) { e.iconicMemory.ramWard=false; e.log.push("Air Gap blocked RAM disruption."); }
      else if (traits.ramDrain && !cover) { const drained = Math.min(e.ram, traits.ramDrain); e.ram -= drained; e.log.push(`Network disruption drained ${drained} RAM. Cover blocks the drain.`); }
      if (traits.bleed && !cover) { e.playerBleedTurns = 2; e.playerBleedDamage = Math.max(1, Math.round(incoming * .12)); e.log.push("Bleeding applied for two turns. Use an injector to clear it."); }
      if (cover && (traits.bleed || traits.ramDrain)) e.log.push("Cover blocked the enemy status effect.");
      e.log.push(`${charged ? "Charged burst" : "Enemy fire"}: ${incoming} damage${cover ? " through cover" : ""}.`);
    } else if (stun) e.log.push("Counterattack interrupted. Passive RAM recovery paused.");
    e.weakenTurns = Math.max(0, (e.weakenTurns ?? 0) - 1);
    e.turn++;
    e.ram = Math.min(maxRam(next), e.ram + (stun ? 0 : ramRecovery(next)));
    if (next.health.currentHp <= 0) { e.phase = "failed"; next.health.lifeState = "downed"; e.log.push("Your fixer pulled you out. Retry with a refreshed field kit, or leave and change your build."); }
  }
  if(stun && signature===canonicalWeaponId("rpg-weapon-7") && e.phase==="combat" && e.enemyIndex===state.rpg.active!.enemyIndex){e.aimed=true;e.log.push("Sidearm readied an aimed shot.");}
  feedback.healing = Math.max(0, next.health.currentHp - state.health.currentHp + feedback.taken);
  feedback.interrupted = stun;
  e.feedback = { ...feedback, target: mission.enemies[state.rpg.active!.enemyIndex], defeated: e.enemyIndex !== state.rpg.active!.enemyIndex || e.phase === "decision" };
  e.log = e.log.slice(-12);
  return next;
}

function setupEnemy(state: GameState, mission: RpgMission) {
  const e = state.rpg.active!;
  resetIconicTarget(state,e);
  e.phase = "combat"; e.turn = 0; e.aimed = false;
  e.playerBleedDamage = 0; e.playerBleedTurns = 0;
  e.burnDamage = 0; e.burnTurns = 0; e.weaken = 0; e.weakenTurns = 0;
  e.enemyMaxHp = Math.round(missionEnemyStats(mission, e.enemyIndex, e.gigRisk).health * (e.approach === "ghost" || (e.approach === "lifepath" && mission.enemies.length === 1) ? 0.75 : 1));
  e.enemyHp = e.enemyMaxHp;
  // RAM carries through patrols; kills no longer refill an entire cyberdeck.
  e.ram = Math.min(e.ram, maxRam(state));
  e.log.push(`${missionEnemyStats(mission, e.enemyIndex).boss ? "Boss contact" : "Contact"}: ${mission.enemies[e.enemyIndex]}. Read the enemy intent before choosing your move.`);
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
  return startRpgMission(leaveRpgMission(state), state.rpg.active.missionId, state.rpg.active.gigRisk, state.rpg.active.contract?.id, state.rpg.active.bossReplay);
}

export function resolveRpgMission(state: GameState, choiceId: string, random: () => number = Math.random) {
  const e = state.rpg.active, mission = e && missionById(e.missionId), choice = mission?.choices.find(c => c.id === choiceId);
  if (!e || e.phase !== "decision" || !e.approach || !mission || !choice) return state;
  if (e.bossReplay) {
    if(!canReplayBoss(state,mission)||e.enemyIndex<mission.enemies.length||e.enemyHp>0)return state;
    const next=cloneState(state);next.rpg.active=null;
    next.health.currentHp=calculateMaxHP(next);next.health.lifeState="alive";
    pushCategorizedLog(next,"Loot",`${mission.enemies[mission.enemies.length-1]} rematch settled. No loot is awarded in story rematches.`);
    emitRewardPopupGroup(next,{title:"Boss rematch complete",story:["Story choices and first-clear rewards are unchanged."]});
    return next;
  }
  if(!mission.sideGig && state.rpg.completed[mission.id])return state;
  const next = cloneState(state);
  const repeated = Boolean(next.rpg.completed[mission.id]);
  next.rpg.completed[mission.id] = { outcome: choice.id, approach: e.approach, clears: (next.rpg.completed[mission.id]?.clears ?? 0) + 1 };
  next.rpg.active = null;
  const bonus = mission.sideGig ? contractBonus(e,gigPayout(mission,e.gigRisk)) : 0;
  const payout = gigPayout(mission, e.gigRisk) + choice.bonusCredits + bonus;
  next.resources.credits += payout;
  if (mission.sideGig) next.resources.heat = Math.max(0, next.resources.heat - 15);
  next.resources.reputation = Math.max(0, next.resources.reputation + choice.reputation);
  next.rpg.streetCred += mission.sideGig ? 2 : 10;
  grantCharacterXp(next, repeated ? Math.round(mission.xp * 0.5) : mission.xp);
  const loot = missionItemRewards(mission, state.rpg.completed[mission.id]?.clears ?? 0);
  const fixer = fixers.find(entry => entry.name === mission.fixer);
  if (fixer) {
    const progress = next.fixerTrust[fixer.id] ?? { trust: 0, completedJobs: 0 };
    next.fixerTrust[fixer.id] = { ...progress, trust: progress.trust + (mission.sideGig ? 3 : 12), completedJobs: progress.completedJobs + 1 };
  }
  addDistrictMasteryXp(next, mission.district, "action", mission.sideGig ? 40 + mission.act * 25 : 250 + mission.act * 100);
  const dry = state.rpg.gigDryStreak?.[mission.id] ?? 0;
  let unique = mission.sideGig ? rollGigUnique(mission, random, state.inventory) : rollDistrictWeapon(mission.district, .25, random);
  if(mission.sideGig && !unique && dry>=9) {
    const candidates=gigUniqueCandidates(mission,state.inventory);
    unique=candidates[Math.min(candidates.length-1,Math.floor(Math.random()*candidates.length))];
  }
  if(mission.sideGig)next.rpg.gigDryStreak={...next.rpg.gigDryStreak,[mission.id]:unique?0:Math.min(9,dry+1)};
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

export function beginRunner(state: GameState, path: StartingPathId) {
  if(state.startingPath) return state;
  return claimFieldKit(chooseStartingPath(state,path));
}

export const startingBuilds = {
  weapons: { name: "Weapons", points: { body: 2, reflexes: 3, intelligence: 0, technical: 2, cool: 0 } },
  quickhacks: { name: "Quickhacks", points: { body: 2, reflexes: 0, intelligence: 3, technical: 2, cool: 0 } },
  balanced: { name: "Balanced", points: { body: 2, reflexes: 1, intelligence: 2, technical: 1, cool: 1 } },
};
export function applyStartingBuild(state: GameState, id: keyof typeof startingBuilds) {
  if(state.rpg.active || state.rpg.attributePoints<7 || !Object.values(state.rpg.attributes).every(value=>value===3) || !Object.prototype.hasOwnProperty.call(startingBuilds,id)) return state;
  let next=state;
  for(const [attribute,count] of Object.entries(startingBuilds[id].points)) for(let i=0;i<count;i++) next=spendAttribute(next,attribute as AttributeId);
  return next;
}
