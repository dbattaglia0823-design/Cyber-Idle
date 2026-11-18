# Cyber Idle — knowledge integration handoff

- **Surveyed:** `main` on 2026-11-18
- **Scope:** Documentation-only knowledge integration; no React components, game logic, assets or player saves modified.
- **Shared toolkit:** https://github.com/dbattaglia0823-design/Game-Dev-Toolkit/tree/main/knowledge

## New navigation

`AGENTS.md`, `docs/INDEX.md`, `docs/ARCHITECTURE.md`, `docs/systems/BACKGROUND_WORK.md`, `docs/TESTING.md`, `docs/DECISIONS.md`, `docs/KNOWN_ISSUES.md`, and this handoff.

## Verified from source

Reviewed repository paths, npm scripts, CI workflow, selected save/queue/crafting processing code and existing gameplay documentation. The original balance and campaign notes are retained.

## Not validated

No npm install, local test suite, browser rendering, save migration fixture run or mobile QA was performed to create these notes. PR CI must be checked separately.

## Next practical task

On crafting queue/idle work changes read `docs/INDEX.md` and `docs/systems/BACKGROUND_WORK.md`; inspect current implementations and tests, add a focused regression, run test/audit/build, then record actual results here. Do not duplicate game-specific balance into the shared knowledge vault.
