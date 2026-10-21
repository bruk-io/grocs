---
id: TASK-37
title: Board-only commits skip the unit suite in lefthook
status: Done
assignee:
  - '@claude'
created_date: '2026-10-21 11:06'
updated_date: '2026-10-21 11:16'
labels: []
dependencies: []
modified_files:
  - tools/hooks/unit-tests.ts
  - tools/hooks/unit-tests.test.ts
  - lefthook.yml
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From Bruk directly. A commit that touches only backlog/** (a status change, a plan, a note) cannot break a test, so running the whole suite for one is only cost - and today's stale-lock/slow-hook problem (TASK-35's philosophy-plugin fix) compounds with every full-suite run on a loaded machine. Checks and typecheck still run unconditionally; only the unit-test step is conditional, and only when every staged file is under backlog/.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 lefthook.yml's unit-tests step skips pnpm test when every staged file is under backlog/, and runs it as before otherwise
- [x] #2 A unit test covers both the skip and the don't-skip decision
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. New file tools/hooks/unit-tests.ts: the lefthook pre-commit entry point. Reads the staged file list (git diff --cached --name-only, with the same GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE/GIT_CEILING_DIRECTORIES stripping run.ts already uses, so a test fixture via GROCS_ROOT is never pointed at the real repository instead, TASK-1.36). isBoardOnly(files) is exported and pure: true only when there is at least one staged file and every one starts with backlog/. When true, print a skip message and exit 0 without running pnpm test; otherwise spawn pnpm -s test and forward its exit code. Guard main() behind the usual process.argv[1] === this file check so importing the module for its exports (tests) never runs it.
2. lefthook.yml's unit-tests command becomes node tools/hooks/unit-tests.ts, with a one-line comment saying why.
3. tools/hooks/unit-tests.test.ts: unit tests for isBoardOnly covering all-backlog, mixed, empty, and a near-miss path (backlog.md, no slash) that must not be treated as board-only.

### Risks
Scoped to lefthook only - CI's own pnpm test step and the Stop hook (tools/hooks/stop.ts, a different end-of-turn check with no staged-file concept) are both untouched, since CI validates an accumulated diff that can span many commits and the Stop hook validates working-tree state generally, not what one commit touches.

### Proof
Verified live against the real repo: staging only a backlog/ file prints the skip message and exits 0 without running pnpm test; reverting that and running normally still runs the suite. pnpm check/typecheck/test all pass.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented and verified live against the real repo (approved by Bruk in chat before implementing): staging only a backlog/ file and running node tools/hooks/unit-tests.ts directly printed 'unit-tests: skipped, every staged file is under backlog/' and exited 0 without running pnpm test; reverted that and confirmed the normal path still runs the suite. Caught and fixed one real bug while writing the test: main() was called unconditionally at module load, so importing unit-tests.ts for its isBoardOnly export (the test file itself) ran the full real pnpm test suite and called process.exit() as a side effect of import - guarded behind the same process.argv[1] check tools/hooks/run.ts and launch-guard.ts already use. pnpm check (14 checks), typecheck, and the new unit test file all pass.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

```text
[ERR_PNPM_UNSUPPORTED_ENGINE] Unsupported environment (bad pnpm and/or Node.js version)

Your Node version is incompatible with "/Users/brukhabtu/src/github.com/bruk-io/grocs".

Expected version: >=24.12
Got: v22.21.1

This is happening because the package's manifest has an engines.node field specified.
To fix this issue, install the required Node version.
```

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(650 earlier lines omitted)
```text
│  3.25 kB │ gzip:   1.25 kB
│  storybook-static/assets/Chip-BUaocWa5.js
│  3.25 kB │ gzip:   1.46 kB
│  storybook-static/assets/SignInTemplate.stories-pK3kcYMo.js
│  3.43 kB │ gzip:   1.58 kB
│  storybook-static/assets/ItemPickerTemplate.stories-B9w-0Eul.js
│  4.44 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-DML_zS6e.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/TextField-BIbhdDIz.js
│  4.64 kB │ gzip:   1.78 kB
│  storybook-static/assets/PreferencesTemplate.stories-B3rQXc9t.js
│  4.69 kB │ gzip:   1.82 kB
│  storybook-static/assets/ItemRow-DGrdR6t1.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/GroceryListTemplate.stories-CszuBNWU.js
│  5.86 kB │ gzip:   2.03 kB
│  storybook-static/assets/Button-TkLO1_e5.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/Mascot-Cjexr2JQ.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-bJuOkOKn.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-BQqZig9n.js
│  17.73 kB │ gzip:   4.85 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-gUeYK-dJ.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-Cb36oWZu.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-DCWVYMlP.js
│  1,359.50 kB │ gzip: 391.76 kB

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

│  Vite ✓ built in 1.12s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 362 story views checked (axe, 44 x 44, images not compared)
```

Reviewed by philosophy:reviewer (did not do the work). Verdict: closed, both acceptance criteria met.

Evidence. AC1: lefthook.yml's unit-tests step runs node tools/hooks/unit-tests.ts, which skips pnpm test only when isBoardOnly(staged) and otherwise spawns pnpm -s test and forwards its status. Verified live: mise exec -- node tools/hooks/unit-tests.ts run directly as the hook entry point ran the real suite (109 files, 1445 tests) and exited 0. AC2: tools/hooks/unit-tests.test.ts covers all-backlog (true), mixed (false), empty (false) and the backlog.md near-miss (false); 4 tests pass.

Flagged risk confirmed fixed: the module-load main() bug is guarded with the process.argv[1] === fileURLToPath(import.meta.url) pattern used by run.ts and launch-guard.ts. vitest run tools/hooks/unit-tests.test.ts finishes in 86ms with 4 tests - no nested suite - while direct invocation runs it, so the guard and the entry point both hold.

Weakening override: the lefthook.yml entry's hashes match the committed content, verified by direct sha256 comparison (before 04a2fb61... = 563248c^:lefthook.yml, after 8d53eea0... = 563248c:lefthook.yml = the current file). The clean pnpm check did not carry this point, since staged-mode weakening review only fires on a staged diff and nothing was staged.

Full tier recorded above exited 0 (pnpm check, typecheck, test, test:emulator, check:release, storybook build, visual). No files were fixed or reformatted by the run. The earlier ERR_PNPM_UNSUPPORTED_ENGINE block in these notes is a reviewer artifact (record-check invoked without mise exec, wrong Node), not a real failure; the passing record follows it.

Not independently re-run: the skip branch. The reviewer guardrail blocked staging a board-only change and blocked building a throwaway fixture repo, and working around it is itself a finding, so the skip path rests on the unit-tested decision function, the 5-line composition around it, and the worker's recorded live verification in both directions.

Findings, none blocking, none filed as drafts. Low: stagedFiles is exported with no caller and no test, against the repo's code-design rule that everything starts private. Lowest: git diff --cached --name-only reports only a rename's destination, so staging a move of a source file into backlog/ would read as board-only and skip the suite - not a realistic path. Lowest: a non-ASCII path quoted by core.quotePath would not match backlog/ and so would run the suite, failing safe.
<!-- SECTION:NOTES:END -->
