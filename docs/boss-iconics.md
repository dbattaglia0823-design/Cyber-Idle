# Street Combat Iconics and combat caches

The catalogue remains 261 regular district weapons plus 16 unique Iconics. Existing item IDs, upgrade limits, signatures, quality tiers, attachments and presets are preserved. Iconics are an independent designation alongside Common–Relic quality, with no generated variants.

## Sources

`data/streetBosses.ts` promotes eight existing enemies without changing their IDs. Each district has two exclusive Iconics:

| District | Repeatable Street Combat boss | Iconics |
| --- | --- | --- |
| Neon Row | Neon Row Kill Team Leader | Final Notice, Collateral |
| Rust Yards | Jackal Roadboss | Impound Order, Towline |
| Underpass Market | Ghost Market Factor | Escrow, Fine Print |
| Blacknet Quarter | Null Oracle Shell | Cache Miss, Air Gap |
| Helix Ward | Helix Security Captain | Sterile Burn, Second Opinion |
| Glassline District | Prototype Handler | Executive Override, Golden Handshake |
| Redline Blocks | Redline Executioner | Barricade Anthem, Redline Requiem |
| Skyline Core | Skyline Security Commander | Root Access, Afterimage Echo |

Bosses use the existing district/Street Combat level gates, Boss health scaling, armor, affinity counters, auto-healing and one-second respawn. The Neon leader replaces the old kill team label and no longer requires the unrelated return-contract threat gate. Story bosses and practice rematches award no Iconics; original campaign payouts remain unchanged.

## Exact rare drops and saves

`bossIconicLoot.ts` is the sole Iconic resolver. Each completed eligible Street Combat kill has a 0.005% total chance, split equally between missing weapons (0.0025% each initially). One remaining weapon receives the whole 0.005%. There is at most one drop per kill, no pity, no guarantees, and no rarity/mastery/simulation multiplier. Ordinary loot pools, shops, gigs and crafting cannot award these weapons.

A saved seed plus per-boss settled-kill index determines each independent roll and item selection. Live, offline and simulated Street Combat reach the same resolver through the same completed-kill processor. Failed encounters, reward receipts and unchanged save reloads cannot mint extra rolls. This protects normal local gameplay, not arbitrary save editing.

Legacy story-keyed recovered flags merge into the corresponding enemy-keyed collection, including weapons sold before migration. Story victories do not become Street Combat kills. Current inventory also marks items recovered. New boss kills live in the existing enemy log and Iconic progress; manual discovery lives in the existing manual enemy-discovery record. The obsolete dry-streak field is inert. Ownership, upgrades and equipment remain intact.

## Combat simulation

Each Combat Sim Cache provides its configured five-minute duration. Caches can be crafted with existing Hacking materials or bought through the existing Sim Cache vendor unlock. An active, unlocked Street Combat target must first be defeated outside simulation. Basic caches retain their existing skill/crafting functions.

`combatSimulation.ts` drives the shared mutating `advanceCombat` event processor, preserving actual attack schedules, weapon signatures, matchup HP/armor/resistances, defense, healing supplies, deaths and respawn delays. There are no fixed kill grants or reduced-probability approximations. Rewards, combat XP, character XP, category mastery and per-kill rare rolls use the same live settlement. Simulation stops on defeat, exhausted auto-healing or invalid target requirements; it grants no free revival or passive recovery during fights. Conditional stats and mastery changes affect subsequent attacks normally.

Async processing yields between short batches to keep large runs responsive. The UI persists spent caches before processing, pauses live ticks, and blocks concurrent changes with a modal. It atomically saves the completed result before reopening controls. Closing/reloading during a batch may forfeit unfinished caches, but cannot duplicate rolls or rewards. Combat timers are rebased to wall time on completion, preserving partial fights without another catch-up payout.

Previews run disposable combat events with no rewards or RNG. Kill estimates assume current equipment, health and healing supplies; actual results can differ as mastery and other rewards change the loadout's performance. Recaps show kills, XP, category mastery, resources, equipment and gold-highlighted Iconics. Boss previews hide undiscovered names, show collection progress and exact possible odds.

## Validation

The Iconic and combat-cache tests cover catalogue counts, source exclusivity, millions of seeded rolls, duplicate prevention, no pity, legacy ownership migration, first clears/rematches, live-vs-sim combat parity, healing/death stops, respawn limits, cache consumption, eligibility, progress persistence and yielding performance. Existing progression audits and the full test suite cover regular equipment and campaign compatibility.
