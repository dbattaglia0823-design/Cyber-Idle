# District boss Iconics

Sixteen handcrafted weapons extend the existing 261-weapon catalogue. Their `iconic` designation is independent of the district's underlying Common–Relic quality tier, preserving rarity scaling, crafting, upgrades, mastery and existing saves. Iconics have no generated variants and never enter ordinary crafting, shops, local weapon rolls or gig pools.

The sources are the eight live main-job bosses: Chrome Debt Collector, Convoy Marshal, Broker's Armored Proxy, Black ICE Custodian, Biotech Security Chief, Executive Exosuit, Redline Siege Commander and The Executive Afterimage. Archived operation bosses are not new encounters or alternate drop sources. Definitions, lore and signature descriptions live in `data/bossIconics.ts`.

## Rewards and replay

First-clear story settlement preserves every original payout and adds one boss-only roll. Completed main jobs expose a boss-only rematch through the existing journal and approach/combat/reward interfaces. Rematches skip patrols, use the authored boss difficulty, and award no campaign XP, credits, story flags, choices, chapter unlocks or first-clear trophies. Actual weapon use still earns category mastery.

The baseline chance is 0.005% total per eligible settled victory: 0.0025% for each item while both are missing, 0.005% for the remaining one. There is at most one Iconic per victory. There is no bad-luck protection or guaranteed drop. Previously recovered items remain excluded even if sold. Drops are initially locked against accidental selling; the player can unlock them.

A per-save seed and per-boss settled-victory index determine both the drop decision and item choice. Retries, aborts and reloads retain the same result for that index. Only completed boss settlement advances it; failed encounters, gigs, patrols, reopened receipts and duplicate settlement calls cannot advance or reroll it. Normalized old saves derive a stable seed from their saved timestamp. This is deterministic local-game protection, not server-side anti-cheat against arbitrary save editing.

`rpg.bossIconicProgress` stores settled victories, an inert legacy dry-streak field and recovered IDs. Ownership in an imported save also marks an Iconic recovered. No inventory or progression reset is required.

## Combat

One shared signature resolver serves tactical weapon attacks and the existing idle attack processor. Each weapon has one primary effect. Counters reset on target changes and weapon switches; only Requiem's two kill-tempo charges carry into the next target. Other field actions break Anthem's attack chain. Guard, healing, RAM, tempo and damage bonuses have explicit caps, and bonus damage never recursively invokes the resolver.

Field burn and weaken reuse the existing encounter statuses; shields use the existing shield reduction. Idle combat adapts those effects to bounded attack ticks, incoming-hit guards and its existing attack timer. RAM-specific Cache Miss restores RAM in field combat and sheds a small amount of Heat in idle combat. Base DPS comparisons exclude conditional signature effects and say so.

The boss preview, selected-weapon comparison and reward receipt use a compact gold/star treatment. Unknown rewards appear as silhouettes until discovered. Boss source, category and signature are shown when known; possible rewards remain distinct from guaranteed campaign supplies.

## Validation

`tests/boss-iconics.test.mjs` verifies counts and boss identities, ordinary-pool exclusion, statistical baseline odds, absence of pity, duplicate protection after selling, deterministic reloads, failed/incomplete settlement guards, replay isolation, all signatures in both modes, actual idle integration, local-gear boss clears, save compatibility and UI output. Existing campaign and weapon tests continue to cover regular weapons. Local Chromium exercises the complete mobile replay → victory → protected drop → receipt → reload → inventory flow.
