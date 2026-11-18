# Cyber Idle — test, audit and build commands

**Status:** Commands verified from `package.json` and current GitHub workflows, not executed for this documentation change.

CI in `.github/workflows/validate.yml` uses **Node.js 24**, then:

    npm ci
    npm test
    npm run audit
    npm run audit:first-hour
    npm run build

`npm test` runs Node's test runner with the repository TypeScript import hook. The `build` script checks types (`tsc -b`) and builds with Vite. Game release on `main` is handled by `.github/workflows/deploy.yml`, which builds before publishing compiled `dist` to GitHub Pages.

Additional optional analysis scripts in `package.json` include:

    npm run balance:simulate
    npm run balance:audit
    npm run audit:session

For a change to crafting/queues, run the full CI suite and inspect `tests/craft-queue.test.mjs`, `tests/idle-queue.test.mjs`, `tests/activity-center.test.mjs` and `tests/lifecycle.test.mjs`. For boss drops or economy changes, inspect the appropriate content tests and audit outputs; do not conflate a test passing with a full balance study.

**Reporting:** Record actual command, Node version, exit code, relevant log/CI link and manual browser/mobile scenarios not run. Do not infer passing test results from this document.
