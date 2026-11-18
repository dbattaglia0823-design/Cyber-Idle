# Cyber Idle / Neon Afterimage — architecture and code ownership

**Status:** Selected source/path survey verified against `main` on 2026-11-18. Execution-level validation is not implied.

| Area | Source of truth | Dependencies / regression anchors |
|---|---|---|
| Entry point, global UI | `index.html`, `src/main.tsx`, `src/App.tsx` | React/Vite, `src/components/` |
| Game state and model | `src/types.ts`, `src/systems/gameState.ts`, `src/systems/rpgState.ts` | `tests/lifecycle.test.mjs` |
| Persistence / migrations | `src/systems/saveSystem.ts`, `weaponMigration.ts`, `iconicMemory.ts` | `tests/ui-autosave.test.mjs`, `tests/review-regressions.test.mjs` |
| Skill action processing | `src/systems/actionProcessing.ts`, `activitySwitching.ts` | `tests/quality-of-life.test.mjs`, `idle-queue.test.mjs` |
| Concurrent skill + craft work | `src/systems/parallelWork.ts`, `craftingProcessing.ts`, `craftQueue.ts`, `craftAutomation.ts` | `tests/craft-queue.test.mjs`, `tests/lifecycle.test.mjs` |
| Configurable idle automation | `src/systems/idleQueue.ts`, `smartAutomation.ts` | `tests/idle-queue.test.mjs` |
| Craft/idle queue UI | `src/components/CraftQueuePanel.tsx`, `IdleQueuePanel.tsx`, `ActivityCenter.tsx` | `tests/craft-queue.test.mjs`, `tests/activity-center.test.mjs` |
| Mission/campaign/district bounties | `src/systems/storySystem.ts`, `src/data/districtBounties.ts`, `src/components/DistrictBountyBoard.tsx` | `tests/district-bounties.test.mjs` |
| Combat and tactical item effects | `src/systems/combatProcessing.ts`, `equipmentIdentity.ts`, `tacticalTraits.ts`, `bossIconicLoot.ts` | `tests/equipment-identity.test.mjs`, `boss-iconics.test.mjs` |
| Item definitions / rewards | `src/data/items.ts`, `recipes.ts`, `weapons.ts`, `missionRewards.ts`, `balanceConfig.ts` | Balance/audit scripts and tests |

## High-risk contracts

`saveSystem.ts` defines the saved state keys/slots and normalizes older records; `gameState.ts` defines defaults and the current save version. Do not add gameplay fields without understanding current normalization and backup behavior.

`parallelWork.ts` deliberately advances simultaneous skill/craft events in timestamp order. Queue IDs, resource reservation/consumption and offline catch-up should remain deterministic. See [BACKGROUND_WORK.md](systems/BACKGROUND_WORK.md).

Modules under `src/components/` should present and dispatch state changes; game rules remain in systems and data. Verify React mobile UI after changing navigation, crafting or character pages.

Build scripts and CI are documented in [TESTING.md](TESTING.md).
