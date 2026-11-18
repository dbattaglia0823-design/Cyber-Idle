# Cyber Idle / Neon Afterimage — development instructions

This repository is an **existing React + TypeScript + Vite game**, not an empty app. Its systems, saves and progression are in production-oriented source and tests; don't replace them with mock examples or general toolkit UI demos.

## Selective knowledge loading

1. Read [docs/INDEX.md](docs/INDEX.md); open only the relevant system note plus actual source and tests.
2. For crafting, idle queues and simultaneous progression, use [docs/systems/BACKGROUND_WORK.md](docs/systems/BACKGROUND_WORK.md).
3. For campaign, loot, equipment and balance, review the existing focused documentation in `docs/` and the corresponding `src/systems/`, `src/data/` and tests.
4. Shared patterns and optional agent skills: https://github.com/dbattaglia0823-design/Game-Dev-Toolkit/tree/main/knowledge. Do not assume links grant hosted Codex automatic repository access.

## Rules for implementation

- Runtime: check `package.json`; current CI uses Node 24 with `npm ci`, `npm test`, `npm run audit`, pacing audit and `npm run build`.
- Gameplay state and save data are not disposable. Review `src/systems/gameState.ts`, `saveSystem.ts`, the `GameState` type and migration/normalization functions before modifying queues, crafting, progression or items.
- Background crafting is intended to coexist with skill training and other active activities. Do not make a UI navigation or skill switch cancel active crafting unless explicitly required.
- Preserve compatibility with existing craft/idle queues, materials, pause/blocked states and offline progress; tests should cover shared-resource and resume cases.
- Distinguish deterministic reward guarantees from randomized drops or balance assumptions. Keep game economy and player progression validated.
- Keep React components as UI, and domain rules in existing `src/systems/` and `src/data/` ownership boundaries. Preserve responsive mobile behavior.
- Make narrow changes on reviewable branches, add regression tests, and update only verified project notes plus [docs/HANDOFF.md](docs/HANDOFF.md).
- Do not install unknown Obsidian/MCP plugins, copy third-party code without license review or commit secrets/private notes.
