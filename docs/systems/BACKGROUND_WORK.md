# Cyber Idle — skill activity, background crafting and queued work

**Status:** Verified ownership and selected behavior by reading current TypeScript. Not a claim that all edge cases have passed tests.

## Independent concurrent activities

- `src/systems/actionProcessing.ts`: skill completion and reward processing.
- `src/systems/craftingProcessing.ts`: crafting eligibility, start/finish and resource changes. `startCraft()` explicitly treats crafting as background work and does not interrupt skill actions or missions.
- `src/systems/parallelWork.ts`: `processParallelWork(state, now, maxEvents)` advances a concurrent action and craft in chronological due-event order to prevent double spending shared materials. It bounds event processing (default 150) after inactive periods.
- `src/systems/idleQueue.ts`: configured skill actions, target resources, heat thresholds and bounded repetitions. Only guaranteed outputs qualify as deterministic targets; do not treat random drops or expenditures as target resources.
- `src/systems/craftQueue.ts`: queued recipes, ID validation, pause/blocked handling and bounded queue length (`MAX_CRAFT_QUEUE = 8`).
- `src/systems/smartAutomation.ts`, `craftAutomation.ts`: additional automation/target behavior; inspect before changing queue orchestration.

## UI and state

- `src/components/CraftQueuePanel.tsx`, `CraftingRecipeBrowser.tsx`, `CraftingDetailSheet.tsx`: browse, start and queue crafting.
- `src/components/IdleQueuePanel.tsx`, `ActivityCenter.tsx`: configure queued skill work.
- `src/systems/saveSystem.ts` normalizes `craftQueue` and `idleQueue` as part of save compatibility. Preserve older slot recovery and queue semantics.

## Regression checklist

Use `tests/craft-queue.test.mjs`, `tests/idle-queue.test.mjs`, `tests/activity-center.test.mjs`, `tests/lifecycle.test.mjs` and any new focused tests. Cover:

1. A skill and active craft complete in either due-time order without consuming the same final materials twice.
2. Queued crafts start when prior crafts finish, respecting recipe availability and reserve settings.
3. Idle work and crafting remain independent of UI tab navigation.
4. Invalid/legacy queue entries normalize safely, preserving valid entries and save compatibility.
5. Offline catch-up is bounded and recovers correctly without unbounded loops or negative resources.
6. Mobile controls can start, pause and queue without losing activity state.

These are **acceptance tests to maintain**, not assertions they all passed in this docs-only PR.
