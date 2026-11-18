# Cyber Idle — risk and verification watchlist

**These are test-sensitive boundaries, not confirmed current defects.** Reproduce on the target revision before opening an issue.

| Area to validate | Evidence and tests |
|---|---|
| Concurrent crafting and skills sharing resources | `src/systems/parallelWork.ts`, `tests/craft-queue.test.mjs` |
| Craft queue invalid or legacy saves, blocked recipes and pause/resume | `src/systems/craftQueue.ts`, `saveSystem.ts`, `tests/craft-queue.test.mjs` |
| Idle queue runaway loops and insufficient-resource targets | `src/systems/idleQueue.ts`, `tests/idle-queue.test.mjs` |
| Offline progression and autosave recovery | `src/systems/offlineProgress.ts`, `saveSystem.ts`, `tests/ui-autosave.test.mjs` |
| Unique/iconic drops and progression balancing | `docs/boss-iconics.md`, `tests/boss-iconics.test.mjs`, balance audits |
| Queue and character UI on mobile | `src/components/ActivityCenter.tsx`, `CraftQueuePanel.tsx`, `IdleQueuePanel.tsx` |

For confirmed issues, include reproduction, observed vs expected behavior, main commit SHA, tests and owning PR. Update this page after verification only.
