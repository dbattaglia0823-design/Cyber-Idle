# Cyber Idle — observed implementation choices

These reflect current code and project guidance, not a claim to know every historical conversation.

| Choice | Evidence | Impact |
|---|---|---|
| TypeScript/React/Vite game with Node-driven regressions | `package.json`, `.github/workflows/validate.yml` | Keep typechecks, tests and Vite build in release gate |
| State and save migration are explicit systems | `src/systems/gameState.ts`, `saveSystem.ts` | Don't reset live players when adding progression or queues |
| Background crafts can coexist with skill activity | `src/systems/craftingProcessing.ts`, `parallelWork.ts` | Never cancel craft merely to start or switch skill work |
| Process competing due events in timestamp order and bound catch-up | `src/systems/parallelWork.ts` | Prevent double spending of finite shared resources |
| Queue targets only include guaranteed eligible resources | `src/systems/idleQueue.ts` | Random items/heat aren't stable target thresholds |
| Local project docs remain source-aware; reusable knowledge is centralized | This integration change | Read only relevant notes from toolkit |

Major new decisions should record date, alternatives, rationale, linked PR and migration/tests; mark superseded decisions rather than erasing them.
