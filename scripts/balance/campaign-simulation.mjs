import { createInitialState, chooseStartingPath } from '../../src/systems/gameState.ts';
import { skillActions } from '../../src/data/skills.ts';
import { recipes } from '../../src/data/recipes.ts';
import { rpgMissions, rpgSideGigs, rpgPerks } from '../../src/data/rpgCampaign.ts';
import { mainJobBalance } from '../../src/data/mainJobBalance.ts';
import { getItem } from '../../src/data/items.ts';
import { cyberdecks } from '../../src/data/cyberdecks.ts';
import { quickhacks } from '../../src/data/quickhacks.ts';
import { claimFieldKit, spendAttribute, buyRpgPerk, respecRpg, startRpgMission, chooseMissionApproach, performTactic, resolveRpgMission, canUseTactic, enemyIntent, tacticalStats } from '../../src/systems/rpgSystem.ts';
import { encounterTraits } from '../../src/systems/tacticalTraits.ts';
import { calculateMaxHP } from '../../src/systems/healthSystem.ts';
import { itemAttributeRequirement } from '../../src/systems/runnerProgression.ts';
import { equipItem } from '../../src/systems/equipmentSystem.ts';
import { buySoftware, craftQuickhack, installQuickhack } from '../../src/systems/quickhackSystem.ts';
import { itemUpgradeCost, upgradeItem } from '../../src/systems/upgradeSystem.ts';
import { scaledCraftingCosts } from '../../src/systems/craftingCosts.ts';
import { canCraft, completeCraft } from '../../src/systems/craftingProcessing.ts';
import { addItem } from '../../src/systems/collectionSystem.ts';
import { addSkillXp, actionXpRewardWithMastery, addMasteryXp, actionMasteryXpReward, canStartSkillAction } from '../../src/systems/actionProcessing.ts';
import { calculateSkillActionRewards } from '../../src/systems/balanceFormulas.ts';
import { adjustedActionDurationMs, adjustedDurationMs } from '../../src/systems/modifiers.ts';
import { missionRewardPools } from '../../src/data/missionRewards.ts';
import { districtSupplyItems } from '../../src/data/materialSupply.ts';
import { getXpForLevel } from '../../src/systems/xpCurves.ts';
// A deterministic material ledger, not a human playtest. No injected gear, XP,
// credits, district flags, rare drops, or wins. Batch training deliberately omits
// random drops, district/mastery-pool reward bonuses and random heat losses.
export function simulateCampaign({ approach = 'assault', style = 'story' } = {}) {
    let state = claimFieldKit(chooseStartingPath(createInitialState(0), 'streetborn'));
    let combatSeconds = 0, craftSeconds = 0;
    let seconds = 0, gigCount = 0, crafts = 0, cycles = 0, act = 0;
    const rows = [];
    const focus = approach === 'netrunner' ? 'intelligence' : approach === 'ghost' ? 'cool' : 'reflexes';
    const count = id => id in state.resources ? state.resources[id] : state.inventory[id] ?? 0;
    const available = a => (!a.districtReq || state.districts[a.districtReq]?.unlocked) && !(a.requiredUnlocks ?? []).some(id => !state.unlocks[id] && !state.worldUnlocks[id] && !state.unlockedBlueprints[id] && !state.inventory[id]);
    const pay = (id, n) => { if (id in state.resources)
        state.resources[id] -= n;
    else
        state.inventory[id] = (state.inventory[id] ?? 0) - n; };
    const reward = (id, n) => { if (id in state.resources)
        state.resources[id] += n;
    else
        addItem(state, id, n); };
    function fight(mission) {
        let next = chooseMissionApproach(startRpgMission(state, mission.id), approach);
        let turns = 0, meds = next.rpg.active?.meds ?? 0, minHp = 1;
        if (next.rpg.active?.phase !== 'combat')
            throw Error('Approach unavailable: ' + mission.id);
        while (next.rpg.active.phase === 'combat' && turns++ < 200) {
            const e = next.rpg.active, t = encounterTraits(mission, e.enemyIndex, e.turn);
            let action = 'attack';
            if (!e.aimed && (t.armor || next.rpg.perks.deadeye))
                action = 'aim';
            if ((approach === 'netrunner' || t.shield || t.regeneration) && canUseTactic(next, 'hack'))
                action = 'hack';
            if ((enemyIntent(next) === 'Charged burst' || t.regeneration) && canUseTactic(next, 'disrupt'))
                action = 'disrupt';
            if (next.health.currentHp < calculateMaxHP(next) * .5 && canUseTactic(next, 'heal'))
                action = 'heal';
            next = performTactic(next, action);
            minHp = Math.min(minHp, next.health.currentHp / calculateMaxHP(next));
        }
        if (next.rpg.active.phase !== 'decision')
            throw Error('Combat failed: ' + mission.id + ' level ' + state.rpg.level);
        meds -= next.rpg.active.meds;
        seconds += turns * 4 + 20;
        combatSeconds += turns * 4 + 20;
        state = resolveRpgMission(next, mission.choices[0].id, () => 1);
        state.rewardPopups = [];
        return { turns, injectors: meds, minHp: Math.round(minHp * 100) };
    }
    function gig() { if (gigCount >= 1500)
        throw Error('Excessive gigs'); fight(rpgSideGigs[act]); gigCount++; }
    function gather(id, amount, stack = []) {
        if (count(id) >= amount)
            return;
        if (stack.includes(id))
            throw Error('Supply cycle: ' + [...stack, id]);
        if (id === 'credits') {
            while (count(id) < amount)
                gig();
            return;
        }
        const nextStack = [...stack, id];
        const source = skillActions.filter(a => available(a) && a.levelReq <= state.skills[a.skillId].level && !(a.requiredItems ?? {})[id] && ((a.rewards[id] ?? 0) > 0 || (a.itemRewards?.[id] ?? 0) > 0)).sort((a, b) => a.durationMs / ((a.rewards[id] ?? 0) + (a.itemRewards?.[id] ?? 0)) - b.durationMs / ((b.rewards[id] ?? 0) + (b.itemRewards?.[id] ?? 0)))[0];
        if (source) {
            const output = (calculateSkillActionRewards(state, source)[id] ?? 0) + (source.itemRewards?.[id] ?? 0);
            runAction(source, Math.ceil((amount - count(id)) / output), nextStack);
            return;
        }
        const recipe = recipes.find(r => r.outputItemId === id && (!r.requiredDistrict || state.districts[r.requiredDistrict]?.unlocked));
        if (recipe) {
            train(recipe.requiredSkill, recipe.requiredLevel);
            if (recipe.requiredBlueprint && !state.unlockedBlueprints[recipe.requiredBlueprint])
                gather(recipe.requiredBlueprint, 1, nextStack);
            const n = Math.ceil((amount - count(id)) / recipe.outputQuantity);
            for (let i = 0; i < n; i++) {
                for (let pass = 0; pass < 20 && !canCraft(state, recipe); pass++)
                    for (const [cost, q] of Object.entries(scaledCraftingCosts(state, recipe)))
                        gather(cost, q, nextStack);
                if (!canCraft(state, recipe))
                    throw Error('Recipe locked: ' + recipe.id);
                const duration = adjustedDurationMs(state, recipe.durationMs, recipe.tags) / 1000;
                seconds += duration; craftSeconds += duration;
                completeCraft(state, recipe, 1, false, false);
                crafts++;
            }
            return;
        }
        const future = skillActions.filter(a => available(a) && ((a.rewards[id] ?? 0) > 0 || (a.itemRewards?.[id] ?? 0) > 0)).sort((a, b) => a.levelReq - b.levelReq)[0];
        if (future) {
            const gigSupplies = new Set([...districtSupplyItems(rpgMissions[act].district), ...missionRewardPools[rpgMissions[act].district]]);
            if (style === 'story' && gigSupplies.has(id)) {
                const start = gigCount;
                while (count(id) < amount && gigCount - start < 150)
                    gig();
                if (count(id) >= amount)
                    return;
            }
            train(future.skillId, future.levelReq);
            return gather(id, amount, stack);
        }
        // Guaranteed rotating gig supplies cover archive components without rare drops.
        const before = gigCount;
        while (count(id) < amount && gigCount - before < 150)
            gig();
        if (count(id) < amount)
            throw Error('No guaranteed source: ' + id);
    }
    function runAction(a, n, stack = []) {
        for (const [id, q] of Object.entries(a.requiredItems ?? {}))
            gather(id, q, stack);
        const rewards = calculateSkillActionRewards(state, a);
        for (let pass = 0; pass < 20 && Object.entries(rewards).some(([id, q]) => q < 0 && count(id) < -q * n); pass++)
            for (const [id, q] of Object.entries(rewards))
                if (q < 0)
                    gather(id, -q * n, stack);
        if (!canStartSkillAction(state, a))
            throw Error('Action locked: ' + a.id);
        seconds += adjustedActionDurationMs(state, a.durationMs, a.id, [a.skillId, ...a.tags ?? []]) * n / 1000;
        const xp = actionXpRewardWithMastery(state, a), mastery = actionMasteryXpReward(state, a);
        for (const [id, q] of Object.entries(rewards))
            q < 0 ? pay(id, -q * n) : reward(id, q * n);
        for (const [id, q] of Object.entries(a.itemRewards ?? {}))
            reward(id, q * n);
        addSkillXp(state, a.skillId, xp * n);
        addMasteryXp(state, a.id, mastery * n);
        cycles += n;
    }
    function train(skill, target) {
        let guard = 0;
        while (state.skills[skill].level < target && guard++ < 20000) {
            const candidates = skillActions.filter(a => a.skillId === skill && available(a) && a.levelReq <= state.skills[skill].level && !Object.keys(a.requiredItems ?? {}).length && !a.tags?.includes('supply'));
            const a = candidates.sort((a, b) => b.xpReward / b.durationMs - a.xpReward / a.durationMs)[0];
            if (!a)
                throw Error('No training: ' + skill);
            const needed = getXpForLevel(state.skills[skill].level, 'skill') - state.skills[skill].xp;
            runAction(a, Math.max(1, Math.min(100, Math.ceil(needed / actionXpRewardWithMastery(state, a)))));
        }
        if (state.skills[skill].level < target)
            throw Error('Training guard: ' + skill);
    }
    function allocate(gear) {
        state = respecRpg(state);
        const required = { body: 3, reflexes: 3, intelligence: 3, technical: 5, cool: 3 };
        required[focus] = Math.max(required[focus], 4 + act);
        for (const id of gear) {
            const r = itemAttributeRequirement(getItem(id));
            required[r.attribute] = Math.max(required[r.attribute], r.level);
        }
        const spend = (id, target) => { while (state.rpg.attributes[id] < target && state.rpg.attributePoints > 0)
            state = spendAttribute(state, id); };
        for (const [id, n] of Object.entries(required))
            spend(id, n);
        // Earn missing points through actual gigs with the previous district's loadout.
        if (Object.entries(required).some(([id, n]) => state.rpg.attributes[id] < n))
            return false;
        spend(focus, Math.min(20, 7 + act * 2));
        spend('technical', Math.min(15, 5 + act * 2));
        spend('body', Math.min(12, 5 + act));
        for (const p of [...rpgPerks].sort((a, b) => (a.attribute === focus ? -1 : 0) - (b.attribute === focus ? -1 : 0)))
            state = buyRpgPerk(state, p.id);
        for (const id of gear)
            if (state.inventory[id])
                state = equipItem(state, id);
        return true;
    }
    try {
        for (const mission of rpgMissions) {
            act = mission.act;
            const startSeconds = seconds, startGigs = gigCount;
            const p = mainJobBalance[mission.district], prefix = p.armor.replace(/-chest$/, '');
            const gear = act === 0 && style === 'story' ? [p.weapon, 'padded-street-vest'] : [p.weapon, ...['chest', 'head', 'hands', 'legs', 'boots'].map(slot => prefix + '-' + slot)].filter(id => getItem(id));
            const previous = structuredClone(state);
            let allocation = allocate(gear);
            while (!allocation) {
                state = previousRestore();
                gig();
                Object.assign(previous, structuredClone(state));
                allocation = allocate(gear);
            }
            function previousRestore() { return structuredClone(previous); }
            if (style !== 'story')
                for (const skill of ['scavenging', 'hacking', 'cyberware', 'medical', 'vehicleTuning'])
                    train(skill, Math.min(150, act * 20 + (style === 'gatherer' ? 10 : 1)));
            for (const id of gear) {
                gather(id, 1);
                state = equipItem(state, id);
                if (state.equippedGear[getItem(id).slot] !== id)
                    throw Error('Equipment requirement ' + id);
            }
            for (const id of gear)
                for (let u = 0; u < (style === 'story' ? 1 : style === 'balanced' ? 2 : 3); u++) {
                    for (let pass = 0; pass < 20 && Object.entries(itemUpgradeCost(state, id)).some(([cost, q]) => count(cost) < q); pass++)
                        for (const [cost, q] of Object.entries(itemUpgradeCost(state, id)))
                            gather(cost, q);
                    const next = upgradeItem(state, id);
                    if (next === state)
                        throw Error('Upgrade locked ' + id);
                    state = next;
                }
            const deck = cyberdecks.filter(d => d.stage <= act).at(-1);
            if (deck && !state.inventory[deck.id]) {
                gather('credits', deck.price);
                state = buySoftware(state, deck.id);
            }
            if (deck)
                state = equipItem(state, deck.id);
            for (const family of ['hack', 'disrupt', 'burnout']) {
                const h = quickhacks.filter(h => h.stage <= act && h.family === family).at(-1);
                if (!h)
                    continue;
                if (!state.inventory[h.id]) {
                    if (state.rpg.attributes.technical >= h.technical) {
                        for (const [id, q] of Object.entries(h.cost))
                            gather(id, q);
                        state = craftQuickhack(state, h.id);
                    }
                    else {
                        gather('credits', h.price);
                        state = buySoftware(state, h.id);
                    }
                }
                state = installQuickhack(state, h.id);
            }
            if (style !== 'story')
                for (let i = 0; i < (style === 'balanced' ? 2 : 4); i++)
                    gig();
            const power = tacticalStats(state);
            const entryLevel = state.rpg.level;
            const result = fight(mission);
            rows.push({ district: mission.district, entryLevel, runnerLevel: state.rpg.level, hours: +((seconds - startSeconds) / 3600).toFixed(2), gigs: gigCount - startGigs, damage: power.damage, ...result });
        }
        if (Object.values(state.resources).some(n => n < 0) || Object.values(state.inventory).some(n => n < 0))
            throw Error('Negative resource ledger');
        return { approach, style, completed: rows.length, credits: state.resources.credits, activeCombatMinutes: +(combatSeconds / 60).toFixed(1), craftingHours: +(craftSeconds / 3600).toFixed(2), trainingHours: +((seconds - combatSeconds - craftSeconds) / 3600).toFixed(2), totalHours: +(seconds / 3600).toFixed(2), gigs: gigCount, crafts, cycles, skills: Object.fromEntries(Object.entries(state.skills).map(([id, s]) => [id, s.level])), rows };
    }
    catch (error) {
        return { approach, style, completed: rows.length, error: error.message, totalHours: +(seconds / 3600).toFixed(2), gigs: gigCount, rows };
    }
}
