# Cyber Idle / Neon Afterimage — knowledge index

**Verified survey:** 2026-11-18, `main` (file maps, selected source and workflow inspected; not an end-to-end runtime test).

Use only the relevant page; no need to load the entire documentation directory or toolkit vault.

| Need | Project notes | Source / tests |
|---|---|---|
| Current architecture and boundaries | [ARCHITECTURE.md](ARCHITECTURE.md) | `src/App.tsx`, `src/systems/`, `src/data/`, `src/types.ts` |
| Skill actions, idle targets, queue switching | [BACKGROUND_WORK.md](systems/BACKGROUND_WORK.md) | `src/systems/idleQueue.ts`, `smartAutomation.ts`, `tests/idle-queue.test.mjs` |
| Crafting in parallel with skills | [BACKGROUND_WORK.md](systems/BACKGROUND_WORK.md) | `parallelWork.ts`, `craftingProcessing.ts`, `tests/craft-queue.test.mjs` |
| Campaign and main-job adjustments | [campaign-polish.md](campaign-polish.md) | `src/data/campaign.ts`, `src/systems/storySystem.ts` |
| Legendary/iconic drops | [boss-iconics.md](boss-iconics.md) | `src/systems/bossIconicLoot.ts`, `tests/boss-iconics.test.mjs` |
| Equipment and weapon identities | [weapon-progression.md](weapon-progression.md) | `equipmentIdentity.ts`, `weaponSystem.ts`, equipment tests |
| Balance data and progression | [balance-overhaul.md](balance-overhaul.md) | `src/data/balanceConfig.ts`, `scripts/audit-balance.mjs` |
| General gameplay audit | [gameplay-polish-audit.md](gameplay-polish-audit.md) | `tests/review-regressions.test.mjs` |
| Test and build commands | [TESTING.md](TESTING.md) | `package.json`, `.github/workflows/validate.yml` |
| Design decisions, risks and handoff | [DECISIONS.md](DECISIONS.md), [KNOWN_ISSUES.md](KNOWN_ISSUES.md), [HANDOFF.md](HANDOFF.md) | Actual PR and CI results |

Reusable cross-game documentation is maintained in [Game-Dev-Toolkit](https://github.com/dbattaglia0823-design/Game-Dev-Toolkit/tree/main/knowledge). For any task, check real source/tests before relying on old notes.
