---
id: TASK-35
title: Two route tests time out under load
status: Done
assignee:
  - '@claude'
created_date: '2026-10-21 01:32'
updated_date: '2026-10-21 03:45'
labels:
  - testing
  - size-2
dependencies: []
modified_files:
  - apps/mobile/src/routes/error-boundary.route.test.tsx
  - apps/mobile/testing/route-setup.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Seen 2026-10-20 while three builders and reviewers ran full test suites at once:
- apps/mobile/src/routes/kitchen.route.test.tsx 'creating a kitchen > shows the invite link and code, then Groceries works on that kitchen' timed out waiting for 'Nothing on the list yet' once in six runs in one worktree (TASK-33's review), and passed in later full checks.
- apps/mobile/src/routes/error-boundary.route.test.tsx timed out at 5 s in several full runs and alone with the change stashed (TASK-30's build); its dynamic import of apps/mobile/app/_layout.tsx takes about 5 s on a cold cache.
A test that fails without a code change makes every red run suspect and costs a rerun.

## Affected users and systems
apps/mobile route tests; the pre-commit hook and CI, which run them.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Both tests pass in 20 consecutive full runs on a loaded machine (for example three suites in parallel), with the evidence in the notes
- [x] #2 Neither test's timeout is raised without a recorded reason for the time it needs
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. apps/mobile/src/routes/error-boundary.route.test.tsx: its one test dynamically imports app/_layout.tsx, pulling in the whole app's module graph for the first time in that worker - on a cold cache this alone takes close to vitest's default 5 s test timeout. Give this one test an explicit timeout (15_000 as the third argument to it()) with a comment explaining why, rather than raising the whole project's default.
2. apps/mobile/src/routes/kitchen.route.test.tsx's flaky test (and every other route test) calls screen.findByText/findBy* repeatedly; testing-library's default 1000 ms internal wait (asyncUtilTimeout) is tight when several full suites run at once and React renders plus FakeKitchenGateway's promise round trips get starved. Raise it globally for route tests via configure({ asyncUtilTimeout: 5000 }) in apps/mobile/testing/route-setup.ts (the project's one setup file), with a comment explaining why, rather than patching one call site - any route test's findBy* could flake the same way under the same load.
3. Verify under genuine load, not just alone: run three full vitest run --project app suites in the background to create real contention, then run the two named tests 20 consecutive times while that load is active; record the exit codes in the task notes.

### Risks
A global asyncUtilTimeout bump could in principle hide a test that waits for something that will never actually appear, turning a fast failure into a slow one - acceptable here since every route test already asserts a specific, real UI outcome, and the two known flakes are from genuine load contention (confirmed by one passing on retry with no code change), not a broken assertion.

### Proof
20/20 consecutive runs pass with three full app-project suites running concurrently in the background; pnpm check/typecheck/test all green.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-20: recurred under load while committing TASK-30's review notes on its branch (a pre-commit unit-test run failed with no code change; the retry passed 1421/1421). Also recurred during TASK-33's redo commit.

Implemented directly by the orchestrator at Bruk's explicit request (apps/mobile route tests, normally the UI session's territory, but this one was asked for directly in chat). error-boundary.route.test.tsx: its one test now carries an explicit 15_000 ms timeout with an inline comment (cold-cache dynamic import of app/_layout.tsx, confirmed close to the default 5 s budget). apps/mobile/testing/route-setup.ts: added configure({ asyncUtilTimeout: 5000 }) from @testing-library/react (the project's one setup file, so this covers every route test's findBy*/waitFor, not just the one that was caught), with a comment explaining why. Verified under genuine load: launched three full 'vitest run --project app' suites in the background (8 files/70 tests each, all passed), then ran the two named tests 20 consecutive times while that load was active - 20/20 exit 0. pnpm check (14 checks), typecheck, and the full test suite (108 files, 1424 tests) all pass.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(650 earlier lines omitted)
```text
│  3.04 kB │ gzip:   1.41 kB
│  storybook-static/assets/TabItem-AtuxPCG7.js
│  3.21 kB │ gzip:   1.35 kB
│  storybook-static/assets/Chip-DxNiiPxD.js
│  3.25 kB │ gzip:   1.46 kB
│  storybook-static/assets/ItemPickerTemplate.stories-CHFpiaqI.js
│  4.44 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-Bh7QO7Df.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/TextField-D4Ejk_Ll.js
│  4.64 kB │ gzip:   1.78 kB
│  storybook-static/assets/PreferencesTemplate.stories-BAVgTm-b.js
│  4.69 kB │ gzip:   1.82 kB
│  storybook-static/assets/ItemRow-Civj0FqF.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/GroceryListTemplate.stories-Dyp6Txjn.js
│  5.86 kB │ gzip:   2.04 kB
│  storybook-static/assets/Button-Da1um0PD.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/Mascot-CmnbjBiH.js
│  11.37 kB │ gzip:   4.20 kB
│  storybook-static/assets/icons-JJkNCm_O.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-DSq2YND2.js
│  17.31 kB │ gzip:   4.66 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-DHqinQw4.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-C2AeJCYY.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-Dg_1RIvw.js
│  1,359.48 kB │ gzip: 391.75 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 1.11s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 353 story views checked (axe, 44 x 44, images not compared)
```

No repro: the failure is a load-dependent timeout in two passing tests, not a deterministic defect - the same tests pass unchanged on a quiet machine (confirmed when one flake passed on retry with no code change), so no test can be written that fails before the fix and passes after it. Evidence is the inverse: 20 consecutive runs of both tests under genuine contention, recorded below and re-run independently at review.

Closed on independent verification. Both criteria were already ticked in commit 1928954 by the implementer; the reviewer confirmed each against its own runs rather than the notes.

AC #1 (both tests pass in 20 consecutive runs on a loaded machine): met. Three concurrent loops of the full 'vitest run --project app' suite completed 61 full runs, every one exit 0, each including both named files; while that contention was active, the two named tests ran 20 consecutive times, 20/20 exit 0, with 13 load processes still alive at the last iteration (so the load persisted through the whole window, which the original evidence did not establish). Caveat on the record: runs 2-20 hit a warm Vite transform cache, so the 20/20 is direct evidence for the kitchen test's load-contention flake but does not re-exercise error-boundary's cold-cache import cost; that test rests on headroom (15 s budget against a measured ~5 s import), which is AC #2's ground.

AC #2 (no timeout raised without a recorded reason for the time it needs): met. Both raises carry inline comments naming the cause and citing DRAFT-14; the 15 s is justified against the measured cold-cache import. Read as requiring a reason for the need, not a derivation of the exact number.

The fix was confirmed effective, not a no-op: both route tests import from '@testing-library/react', a single hoisted install resolves for apps/mobile, route-setup.ts is the app project's only setupFiles entry (vitest.config.ts), and RTL's configure does propagate asyncUtilTimeout to the DOM config (checked at 5000).

Full tier green, recorded above: pnpm check (14 checks), typecheck, test (108 files / 1424 tests), test:emulator, check:release, storybook build, and visual (353 story views; image comparison skipped on darwin by design, axe and 44x44 ran). No source file was reformatted by the check.

Findings, none filed: the global asyncUtilTimeout tradeoff is named and accepted in the task's own Risks section, so it is examined, not a side effect. Two observations with no realistic failure path and no draft: mise.toml is untracked although every command here depends on its node and java pins (out of scope for this commit; CI pins its own runner image per TASK-24), and 'backlog/tasks/task-36 ...' appeared untracked mid-review from another session - left untouched, flagged for the orchestrator.
<!-- SECTION:NOTES:END -->
