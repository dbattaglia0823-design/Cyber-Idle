# Gameplay polish audit

## Opening progression

Run `npm run audit:first-hour`. This uses the existing deterministic material-ledger campaign simulation, without injected gear, levels, credits, rare drops or wins. Tactical choices are estimated at four seconds each; this is not a timed human playthrough.

Before this pass, the first district took approximately 52–53 minutes for assault, netrunner and ghost approaches, with 632 training/gathering cycles and three local gigs. After adding 25% training XP **only below skill level 5**, the estimate is 45–46 minutes, with 529 cycles and three gigs. Midgame and endgame training rates are unchanged. Early preparation now recommends the existing starter chest armor instead of implying level-18 armor is necessary.

## Combat, gigs and loot

Story encounter profiles are preserved. Repeat gigs rotate local, plated and regenerating patrols; their preview and enemy intent explain the counters. Optional clean, precision and disruption contracts award 25% extra base credits on success. Missing the objective keeps the base payout. Counters persist through reloads and reset on retry.

Signature sidearms now support different tactical loops: aimed-shot RAM recovery, damage against weakened enemies, healing from cover and interrupt-to-aim chaining. Unique gig loot remains a 5% roll with protection guaranteeing an eligible item on the tenth consecutive dry clear. Existing clears are not retroactively treated as dry clears.

## Saves, offline returns and performance

Each save slot retains its previous valid snapshot. Invalid primary data can recover from that backup; completely unreadable records are preserved instead of silently overwritten. Storage failures produce an in-game export warning. Reset removes the slot's primary and backup together.

Offline crafting and training receipts identify the original activity and missing supplies. Players can inspect sources, return to the activity, or resume when requirements are satisfied. Field missions remain paused offline.

Run `npm run audit:session` for a reproducible 12-hour offline stress check across all three origins and 100 save round trips. In the Windows development runtime, the initial audit took approximately 269–353 ms per offline simulation and 0.13–0.17 ms per save normalization round trip, with save payloads around 19 KB and logs bounded to 50 entries. Reprocessing the same timestamp did not duplicate rewards. These timings are informational, not device-independent performance budgets.

Redundant saves triggered by ordinary resource changes were removed. The existing stable five-second autosave timer and page-hide/visibility flush remain, with immediate saves for origin and slot changes.

An actual physical iPhone was not available in this environment. Responsive browser checks and automated regression tests do not replace physical-device battery, thermal, Safari suspension or storage-pressure testing.
