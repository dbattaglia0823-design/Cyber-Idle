import fs from 'node:fs';
import { skillActions, skillOrder } from '../src/data/skills.ts';
import { recipes } from '../src/data/recipes.ts';
import { items } from '../src/data/items.ts';
import { getXpForLevel } from '../src/systems/xpCurves.ts';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { claimFieldKit } from '../src/systems/rpgSystem.ts';
import { rpgMissions } from '../src/data/rpgCampaign.ts';
import { allEnemies, canFightEnemy } from '../src/systems/combatProcessing.ts';
import { combatEffectivenessForEnemy } from '../src/systems/combatMatchups.ts';
import { prepareMainJob } from '../tests/main-job-fixture.mjs';
import { tacticalWeaponPower } from '../src/systems/tacticalEquipment.ts';
import { districtLevelBands } from '../src/data/levelBands.ts';
const report = { assumptions: 'Skill benchmarks use base times, no mastery or speed/XP buffs, and supplied inputs. Idle combat uses an explicitly prepared district loadout, assumes healing is supplied, and includes the one-second respawn. These are rate benchmarks, not earned campaign runs.', skills: [], equipment: [], content: { items: items.length, recipes: recipes.length, actions: skillActions.length } };
for (const skill of skillOrder) {
    let hours = 0;
    const checkpoints = [];
    for (let level = 1; level < 150; level++) {
        let rate;
        if (skill !== 'combat') {
            const choices = skillActions.filter(a => a.skillId === skill && a.levelReq <= level && !a.tags?.includes('supply') && !a.requiredUnlocks?.length && !Object.keys(a.requiredItems ?? {}).length);
            rate = Math.max(...choices.map(a => a.xpReward / a.durationMs * 1000));
        }
        else {
            const act = Math.min(7, Math.floor(level / 20));
            let s = claimFieldKit(chooseStartingPath(createInitialState(0), 'streetborn'));
            for (const m of rpgMissions.slice(0, act))
                s.rpg.completed[m.id] = { outcome: 'protect', approach: 'assault', clears: 1 };
            for (const m of rpgMissions.slice(0, act + 1))
                s.districts[m.district].unlocked = true;
            s = prepareMainJob(s, rpgMissions[act]);
            s.skills.combat.level = level;
            s.health.currentHp = 100;
            rate = Math.max(...allEnemies().filter(e => canFightEnemy(s, e)).map(e => { const m = combatEffectivenessForEnemy(s, e); return e.xpReward * m.rewardMultiplier / ((m.expectedKillMs + 1000) / 1000); }));
        }
        if (!Number.isFinite(rate) || rate <= 0)
            throw Error('No XP path: ' + skill + ' ' + level);
        hours += getXpForLevel(level, 'skill') / rate / 3600;
        if ([9, 19, 39, 59, 79, 99, 119, 139, 149].includes(level))
            checkpoints.push({ level: level + 1, baseHours: +hours.toFixed(2), hoursForLastLevel: +(getXpForLevel(level, 'skill') / rate / 3600).toFixed(2) });
    }
    report.skills.push({ skill, checkpoints });
}
for (const mission of rpgMissions) {
    const classes = {};
    for (const item of items.filter(i => i.type === 'Weapon' && i.requiredLevel <= districtLevelBands[mission.district].max && recipes.some(r => r.outputItemId === i.id && r.requiredDistrict === mission.district))) {
        const s = createInitialState(0);
        s.equippedGear.weapon = item.id;
        const power = tacticalWeaponPower(s);
        const key = item.weaponClass ?? 'other';
        if (!classes[key] || classes[key].power < power)
            classes[key] = { item: item.id, rarity: item.rarity, power: +power.toFixed(2) };
    }
    report.equipment.push({ district: mission.district, classes });
}
console.log(JSON.stringify(report, null, 2));
if (process.argv[2])
    fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
