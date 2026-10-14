# Full-game balance pass — October 14, 2026

## What changed and why

### Progression and training

Main jobs previously awarded 350 + 160 × act runner XP. The old balance fixtures granted runner levels and local equipment directly; an earned-resource baseline failed in Rust Yards or Underpass despite preparing locally craftable equipment. One-time main-job XP now supports runner levels **5, 9, 13, 17, 21, 25, 28, 30** after the eight chapters, before optional gig XP. Gigs still do not unlock districts.

Existing saves receive the difference for completed main jobs once through campaignXpVersion 2. This awards earned attribute/perk points without replaying money, loot or choices. Current levels, equipment IDs, presets and story decisions remain intact. Level-30 characters receive no excess levels or points.

The 1–150 structure and existing unlock milestones remain. The first few skill levels have a smooth XP discount that fades by the midgame; the established high-level curve remains. Training XP per second improves with the action's required level: the multiplier approaches 3.5× the prior rate. This rewards moving to appropriate activities instead of accelerating the first action forever. The existing twelve-hour first-scavenging test still requires level 10–16 for every lifepath and passes.

All 150 skill actions and 280 recipes have authored durations of 2–30 seconds. Supply processing uses 24–30 seconds. Crafting XP is recalculated against the resulting duration. Speed stacking uses exp(-bonus), including action mastery: every additional bonus continues to help, with only one-millisecond clock precision as the lower bound. It no longer flattens at the previous 95% reduction ceiling.

### Combat, equipment and builds

- Blacknet patrol targets: 850 → 750 HP, 85 → 65 damage. Helix: 1100 → 950 HP, 110 → 90 damage. Glassline: 1450 → 1250 HP, 145 → 125 damage. Later district mechanics and final bosses remain intact; difficulty does not scale to the equipped loadout.
- Tactical weapon output now honors authored attack speed, accuracy and expected critical damage. Expected output remains deterministic. Installed attachment/mod stats contribute, while their existing modifiers continue to apply. Armor penetration reduces plating; aiming still bypasses it entirely.
- Armor from gear and cyberware contributes through a smooth curve: 0.35 × armor / (60 + armor), after defense modifiers. Upgrades beyond 50 armor no longer become useless. The existing overall mitigation limit remains.
- Interrupting an attack pauses that turn's passive RAM recovery. RAM carries between patrols instead of resetting to full on every kill. Cover/recovery actions and deck investment therefore retain a purpose. Descriptions and combat feedback explain this rule.
- Local gigs scale from 45% of their district's main patrol HP/damage, with floors of 80 HP and 10 damage. Late gigs no longer remain starter-strength one-shot opponents. Risk multipliers still apply.
- Free out-of-mission respec remains available. No new build system, cooldown system or UI redesign was introduced.

### Crafting, rewards and economy

- Recipe-based upgrade material costs changed from 0.75 × step^1.15 to 0.35 × step^1.05 of the discounted crafting bill. Credit costs and attribute requirements remain. This makes investing in owned gear practical without making crafting its replacement irrelevant.
- Equipment without a recipe uses existing tier/rarity component-upgrade costs instead of demanding multiple copies of a rare drop. Higher upgrades still consume advanced components.
- Local gigs rotate one local component type per clear, now in packets of 3 + floor(act / 2). Main-job clears grant three of each local supply. Archive rewards and blueprints are separate; equipment is still excluded from guaranteed payouts except the finale trophy.
- Rare unique gear stays at a 5% chance per gig. Successful rolls prefer unowned entries before allowing duplicates. No rare drop is required by the campaign simulations. The probability of at least one rare roll over 59 clears is about 95%; that is not a guarantee of a specific item.
- Incidental training credits are capped by 3 + 0.15 × action level per minute, rounded down per cycle. Training primarily pays materials and skill XP; jobs remain the stronger active source of cash.
- The audit found cross-vendor profit loops for Blacknet Cipher and Hacking Script at high standing. Item resale is now bounded below the cheapest discounted shop-price floor. Resources retain their separate valuation.
- Corrected the obsolete cyberdeck source text: decks are purchased, not guaranteed mission/gig drops.

## Reproducible simulations

Run from the repository root:

    npm.cmd run balance:simulate -- docs/balance-simulation-results.json
    npm.cmd run balance:audit -- docs/balance-catalog-results.json
    npm.cmd test
    npm.cmd run audit
    npm.cmd run build

The campaign ledger starts from a new Streetborn save and claims the real field kit. All material costs are gathered or crafted, software is purchased/crafted, upgrade costs are paid, points are spent through game functions, and main jobs/gigs are fought with the actual tactical resolver. It never grants runner levels, gear, credits, district unlocks or combat wins. It excludes rare drops, so mandatory gear is reproducible.

The policies are reference behaviors, not optimal players:

- **Story:** starter vest and a crafted rifle for Neon Row; a complete locally crafted loadout from Rust onward, +1 upgrades. Uses optional gig packets instead of leveling every specialist profession for a few components.
- **Balanced:** brings all five gathering/crafting professions to each district's entry band, crafts local gear at +2, and plays two optional gigs per district plus any needed to fund purchases.
- **Gatherer:** trains all five professions farther into each band, reaching 150 in all five by the finale; crafts local gear at +3 and plays four optional gigs per district plus funding runs.
- Each policy is run as Assault, Netrunner and Ghost. Builds use the existing free respec between chapters, allocate actual earned points, and install stage-available software. Tactical choices aim, counter dangerous turns, heal below half HP and use appropriate hacks. Street Combat is optional to the main campaign; its separate 1–150 rate benchmark is included in the catalog report.

Training batches are at most 100 cycles and update skill/mastery XP between batches. They use the real duration, XP and base resource formulas, but omit random drops, random trace/risk losses, mastery-pool/district reward bonuses, optional speed implants, vehicles and housing. Those omissions can move real time in either direction. Combat assumes four seconds per decision plus twenty seconds per mission/gig for navigation. Crafting and gathering are sequential. These estimates are **not human playtesting or calendar-time promises**.

### Recorded earned-campaign results

| Policy | Approach | Jobs cleared | Training/gathering hours | Active combat minutes | Gigs |
| --- | --- | --- | ---: | ---: | ---: |
| story | assault | 8/8 | 164.61 | 97.1 | 125 |
| story | netrunner | 8/8 | 164.43 | 74.7 | 125 |
| story | ghost | 8/8 | 164.61 | 91.8 | 125 |
| balanced | assault | 8/8 | 526.06 | 40.3 | 40 |
| balanced | netrunner | 8/8 | 512.98 | 33.9 | 41 |
| balanced | ghost | 8/8 | 526.06 | 37.3 | 41 |
| gatherer | assault | 8/8 | 604.04 | 66.5 | 95 |
| gatherer | netrunner | 8/8 | 588.92 | 58.3 | 95 |
| gatherer | ghost | 8/8 | 604.04 | 61.1 | 95 |

The story reference reaches its first main-job completion in under one hour of estimated processing plus interaction. The broader policies intentionally overprepare and train additional professions; their totals are long-term completionist investment, not mandatory story requirements. No simulation requires epic/legendary drops or a specific story decision for payment. All use community decisions, so the community injector benefit is included.

The first gig-supported resource experiment needed 585 clears because single-component payouts could not support repeated crafting. Supply packets reduced the comparable route to roughly 125 clears across the entire campaign. Fully training specialist professions is the alternative and costs substantially more idle time. The reports expose those tradeoffs rather than hiding them behind unlimited test inventories.

### Catalog and skill-rate benchmarks

The separate catalog report covers every item, recipe and action, all six skill paths, and locally craftable weapon classes in each district. Its base-rate skill totals assume supplied inputs and no mastery/speed bonuses. Idle Street Combat uses an explicitly prepared stage loadout, includes respawn time, and assumes healing supplies; it is a capability/rate benchmark, not a second earned campaign simulation. Do not compare those raw totals directly with the campaign ledger's mastered actions.

## Regression standards

- All nine earned routes must finish all eight jobs with nonnegative resource ledgers, fewer than 85 turns per main job and no rare-drop assumptions.
- The first story chapter stays under two estimated hours; optional gig totals stay below 160 per reference route.
- All authored action/recipe times stay within 2–30 seconds. XP costs remain monotonic and smooth after introductory levels; overnight first-action progression remains bounded.
- Save migration must be idempotent, preserve inventory/choices, and never repay completed jobs.
- Interrupt spam must spend RAM; kills cannot refill a deck. Armor and authored weapon stats must affect field combat.
- Guaranteed loot must contain positive integer quantities and no ordinary equipment flood. Rare drops remain 5% and favor missing collection entries.
- Maximum-standing cross-district purchases/resales cannot create credits.

No changes were added to App.tsx. Existing offline, import/export, inventory, equipment, story and accessibility regression tests remain part of the full suite. Production builds retain the existing large-JavaScript-bundle advisory; this pass does not claim to resolve download performance or replace physical-device playtesting.
