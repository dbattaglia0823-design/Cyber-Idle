import { operations } from '../src/data/operations.ts';
import { bosses } from '../src/data/bosses.ts';
import { items } from '../src/data/items.ts';
import { skillActions } from '../src/data/skills.ts';
import { createInitialState } from '../src/systems/gameState.ts';
import { updateWorldUnlocks } from '../src/systems/worldUnlocks.ts';
import { startOperation, processOperation, operationLoadoutReadiness } from '../src/systems/operationProcessor.ts';
import { calculatePlayerCombatStats } from '../src/systems/balanceFormulas.ts';
import { districtLevelBands } from '../src/data/levelBands.ts';
import { weaponSpecs } from '../src/data/weapons.ts';
import { armorSpecs } from '../src/data/armor.ts';
import { cyberwareSpecs } from '../src/data/cyberware.ts';
import { xpForNextLevel } from '../src/systems/formulas.ts';
for (const op of operations) {
  const state = createInitialState(0);
  const level = Math.max(10, districtLevelBands[op.districtId].entryLevel + 10);
  for (const s of Object.values(state.skills)) s.level = Math.min(150,level);
  updateWorldUnlocks(state); state.resources.reputation = 1000; state.operationLeads[op.id] = true;
  for (const [id,n] of Object.entries(op.requiredItems ?? {})) state.inventory[id] = n;
  const weapon = weaponSpecs.filter(w => w.requiredLevel <= level && state.districts[w.districtId].unlocked).sort((a,b)=>b.stats.damage-a.stats.damage)[0];
  state.equippedGear.weapon = weapon?.id;
  for (const slot of ['head','chest','hands','legs','boots']) state.equippedGear[slot] = armorSpecs.filter(a=>a.slot===slot && a.requiredLevel<=level && state.districts[a.districtId].unlocked).sort((a,b)=>(b.stats.armor??0)-(a.stats.armor??0))[0]?.id;
  for (const slot of ['neural','optics','arms','legs','skin','skeleton','operatingSystem','utility']) state.equippedCyberware[slot] = cyberwareSpecs.filter(a=>a.slot===slot && a.requiredLevel<=level && state.districts[a.districtId].unlocked).sort((a,b)=>b.requiredLevel-a.requiredLevel)[0]?.id;
  state.health.currentHp = calculatePlayerCombatStats(state).maxHp;
  state.inventory['advanced-med-injector'] = 100; state.autoHeal = { ...state.autoHeal, unlocked:true, enabled:true, threshold:60, itemId:'advanced-med-injector' };
  const started = startOperation(state, op.id, undefined, 0);
  const result = processOperation(started, started.activeOperation?.durationMs ?? 0);
  console.log(JSON.stringify({id:op.id, district:op.districtId, level, req:op.unlockRequirements, stats:calculatePlayerCombatStats(state), boss:bosses.find(b=>b.id===op.bossId)?.hp, started:!!started.activeOperation, readiness:operationLoadoutReadiness(state,op), result:result.operationRecap?.success, hp:result.health.currentHp, damage:result.health.lastDamageTaken}));
}
for (const level of [1,10,20,40,60,80,100,120,140]) {
  const action = skillActions.filter(a=>a.skillId==='scavenging' && a.levelReq<=level).sort((a,b)=>b.xpReward/b.durationMs-a.xpReward/a.durationMs)[0];
  console.log('Pacing', level, action.name, Math.round(xpForNextLevel(level)/(action.xpReward*2.98)*action.durationMs/60000),'minutes per level at max mastery');
}
console.log('Defined items', items.length);
