import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { normalizeSave } from '../src/systems/saveSystem.ts';
import { claimFieldKit, startRpgMission, chooseMissionApproach, performTactic, canUseTactic, tacticalStats, resolveRpgMission } from '../src/systems/rpgSystem.ts';
import { mainJobXp, campaignRunnerTargets } from '../src/data/campaignBalance.ts';
import { rpgMissions, rpgSideGigs } from '../src/data/rpgCampaign.ts';
import { recipes } from '../src/data/recipes.ts';
import { skillActions } from '../src/data/skills.ts';
import { items, getItem } from '../src/data/items.ts';
import { vendors } from '../src/data/vendors.ts';
import { vendorPrice, sellValue } from '../src/systems/vendorSystem.ts';
import { gigUniquePools, rollGigUnique, missionItemRewards } from '../src/data/missionRewards.ts';
import { itemUpgradeCost } from '../src/systems/upgradeSystem.ts';
import { tacticalWeaponPower } from '../src/systems/tacticalEquipment.ts';
import { adjustedDurationMs } from '../src/systems/modifiers.ts';
import { simulateCampaign } from '../scripts/balance/campaign-simulation.mjs';
const fresh = () => claimFieldKit(chooseStartingPath(createInitialState(0), 'streetborn'));
test('story XP alone supports the authored runner progression without duplicate settlement', () => {
    let s = fresh();
    for (const m of rpgMissions) {
        s = chooseMissionApproach(startRpgMission(s, m.id), 'assault');
        s.rpg.active.phase = 'decision';
        s = resolveRpgMission(s, m.choices[0].id, () => 1);
        assert.equal(s.rpg.level, campaignRunnerTargets[m.act]);
        assert.equal(resolveRpgMission(s, m.choices[0].id), s);
    }
});
test('legacy completed jobs receive their XP difference once without replaying rewards or changing choices', () => {
    const s = fresh();
    delete s.rpg.campaignXpVersion;
    s.rpg.level = 2;
    s.rpg.xp = 190;
    s.rpg.completed['dead-drop'] = { outcome: 'profit', approach: 'ghost', clears: 1 };
    const loaded = normalizeSave(s);
    assert.equal(loaded.rpg.level, 5);
    assert.equal(loaded.rpg.xp, 0);
    assert.equal(loaded.rpg.attributePoints, s.rpg.attributePoints + 3);
    assert.equal(loaded.rpg.perkPoints, s.rpg.perkPoints + 2);
    assert.deepEqual(loaded.rpg.completed, s.rpg.completed);
    assert.deepEqual(loaded.inventory, s.inventory);
    assert.equal(loaded.resources.credits, s.resources.credits);
    assert.deepEqual(normalizeSave(loaded).rpg, loaded.rpg);
    const capped = structuredClone(s);
    capped.rpg.level = 30;
    assert.equal(normalizeSave(capped).rpg.xp, 0);
});
test('all authored skill and crafting times stay between two and thirty seconds', () => {
    for (const a of [...skillActions, ...recipes])
        assert.ok(a.durationMs >= 2000 && a.durationMs <= 30000, a.id);
});
test('continuous speed scaling has no old 95 percent bonus ceiling', () => {
    const s = fresh();
    s.equippedCyberware = {};
    const original = items[0].modifiers;
    try {
        items[0].modifiers = { actionSpeed: 1 };
        s.equippedCyberware.utility = items[0].id;
        const fast = adjustedDurationMs(s, 30000);
        items[0].modifiers = { actionSpeed: 2 };
        assert.ok(adjustedDurationMs(s, 30000) < fast);
    }
    finally {
        items[0].modifiers = original;
    }
});
test('interrupts consume RAM without passive recovery and patrol transitions cannot refill the deck', () => {
    let s = chooseMissionApproach(startRpgMission(fresh(), 'dead-drop'), 'assault');
    s.rpg.active.enemyHp = s.rpg.active.enemyMaxHp = 100000;
    s.rpg.perks['ram-recycler'] = true;
    const before = s.rpg.active.ram;
    s = performTactic(s, 'disrupt');
    assert.equal(s.rpg.active.ram, before - 4);
    let turns = 0;
    while (canUseTactic(s, 'disrupt') && turns++ < 100)
        s = performTactic(s, 'disrupt');
    assert.ok(turns < 100);
    assert.equal(canUseTactic(s, 'disrupt'), false);
    const remaining = s.rpg.active.ram;
    s.rpg.active.enemyHp = 1;
    s = performTactic(s, 'attack');
    assert.equal(s.rpg.active.ram, remaining);
    assert.equal(s.rpg.active.enemyIndex, 1);
});
test('weapon speed, accuracy, critical stats and installed parts contribute to tactical output', () => {
    const s = fresh(), item = getItem(s.equippedGear.weapon), original = item.stats;
    try {
        item.stats = { damage: 20 };
        const base = tacticalWeaponPower(s);
        for (const bonus of [{ attackSpeed: -200 }, { accuracy: 20 }, { critChance: .2 }, { critDamage: .5, critChance: .2 }]) {
            item.stats = { damage: 20, ...bonus };
            assert.ok(tacticalWeaponPower(s) > base);
        }
        item.stats = { damage: 20, attackSpeed: 200 };
        assert.ok(tacticalWeaponPower(s) < base);
    }
    finally {
        item.stats = original;
    }
    s.weaponLoadouts[s.equippedGear.weapon] = { attachments: { scope: 'reflex-sight' }, mods: [] };
    assert.ok(tacticalStats(s).damage > 0);
});
test('armor improvements remain useful beyond fifty raw armor', () => {
    const s = fresh(), item = getItem(s.equippedGear.chest), original = item.stats;
    try {
        item.stats = { armor: 60 };
        const low = tacticalStats(s).mitigation;
        item.stats = { armor: 120 };
        assert.ok(tacticalStats(s).mitigation > low);
    }
    finally {
        item.stats = original;
    }
});
test('rare gear upgrades use components rather than requiring more rare copies', () => {
    const s = fresh();
    for (const item of items.filter(i => i.maxUpgradeLevel && !recipes.some(r => r.outputItemId === i.id))) {
        assert.equal(itemUpgradeCost(s, item.id)[item.id], undefined, item.id);
        assert.ok(itemUpgradeCost(s, item.id).credits > 0);
    }
});
test('unique rolls prefer missing collection entries and remain one item at five percent', () => {
    for (const gig of rpgSideGigs) {
        const pool = gigUniquePools[gig.district], owned = Object.fromEntries(pool.slice(0, -1).map(id => [id, 1]));
        assert.equal(rollGigUnique(gig, () => 0, owned), pool.at(-1));
        assert.equal(rollGigUnique(gig, () => .05, owned), undefined);
        owned[pool.at(-1)] = 1;
        assert.ok(pool.includes(rollGigUnique(gig, () => 0, owned)));
    }
});
test('local supply packets scale without guaranteed equipment flooding', () => {
    for (const gig of rpgSideGigs) {
        const loot = missionItemRewards(gig);
        assert.ok(Object.values(loot).some(q => q === 3 + Math.floor(gig.act / 2)));
        assert.ok(Object.values(loot).every(q => Number.isInteger(q) && q > 0));
        assert.ok(Object.keys(loot).every(id => !['Weapon', 'Armor', 'Cyberware'].includes(getItem(id)?.type)));
    }
});
test('cross-district resale cannot create credits at maximum reputation and standing', () => {
    const s = fresh();
    s.resources.reputation = 10000;
    for (const d of Object.values(s.districtStanding))
        d.standing = 10000;
    for (const shop of vendors)
        for (const entry of shop.inventory)
            for (const destination of vendors.filter(v => v.canSell))
                assert.ok(sellValue(s, destination, entry.itemId) < vendorPrice(s, shop, entry), entry.itemId);
});
for (const style of ['story', 'balanced', 'gatherer'])
    for (const approach of ['assault', 'netrunner', 'ghost'])
        test('earned campaign: ' + style + ' / ' + approach, () => {
            const result = simulateCampaign({ style, approach });
            assert.equal(result.completed, 8, JSON.stringify(result));
            assert.equal(result.error, undefined);
            assert.ok(result.rows.every(row => row.turns < 85 && row.minHp > 0));
            assert.ok(result.gigs <= 160);
            assert.ok(result.totalHours < 700);
            assert.ok(result.credits >= 0);
            if (style === 'story')
                assert.ok(result.rows[0].hours < 2);
        });

test('credit lookup includes starting district gig income', async () => {
    const { getItemSources } = await import('../src/systems/itemSourceLookup.ts');
    const { sources } = await import('../scripts/audit-progression.mjs');
    const state = fresh();
    const gig = rpgSideGigs.find(m => m.district === 'neonRow');
    const entry = getItemSources('credits', state).find(source => source.name === gig.title);
    assert.ok(entry?.unlocked);
    assert.ok(entry.detail.includes(String(gig.reward)));
    assert.equal(sources.get('credits').level, 1);
});
test('unique source odds follow unowned priority and full-pool fallback', async () => {
    const { getItemSources } = await import('../src/systems/itemSourceLookup.ts');
    const gig = rpgSideGigs.find(m => gigUniquePools[m.district].length > 1);
    const pool = gigUniquePools[gig.district];
    const state = fresh();
    for (const id of pool.slice(1)) state.inventory[id] = 1;
    delete state.inventory[pool[0]];
    const source = id => getItemSources(id, state).find(entry => entry.name === gig.title);
    assert.equal(source(pool[0]).chance, 0.05);
    assert.equal(source(pool[1]).chance, 0);
    state.inventory[pool[0]] = 1;
    assert.equal(source(pool[0]).chance, 0.05 / pool.length);
});
