---
id: TASK-25
title: pnpm check fails on a merge conflict marker
status: Done
assignee:
  - '@claude'
created_date: '2026-10-20 18:20'
updated_date: '2026-10-20 22:07'
labels:
  - size-1
  - testing
dependencies: []
modified_files:
  - tools/checks/merge-conflict-markers.ts
  - tools/checks/registry.ts
  - tools/checks/merge-conflict-markers.test.ts
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
On Oct 20, 2026 the orchestrator's merge of TASK-18/19 hit a conflict in a task file, a later commit in the same script concluded the merge with the markers still in it, and the pre-commit hook passed, because no check looks for '<<<<<<< ' / '>>>>>>> ' lines. It reached origin (efcfccc) and was fixed in aa783b6. Only a board file was affected, but the same slip in a source file would have reached CI before anything noticed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 pnpm check fails on any tracked file holding a line that starts with a merge conflict marker, naming the file, line and why
- [x] #2 A test shows the check catching a marker and passing a clean file, and it runs in pre-commit and CI like every other check
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. New file tools/checks/merge-conflict-markers.ts: a check that lists every git-tracked file (git ls-files from ctx.root, not ctx.allFiles - allFiles' SKIP_DIRS excludes backlog/ and .claude/, exactly where the real Oct 20 incident landed), skips the same binary/lock extensions lib.ts's makeContext already excludes from allFiles, reads each remaining file as utf8 (skip on a read error - a path git has indexed but the working tree lacks), and flags any line starting with a conflict marker: <<<<<<< (7 <, not 8+), ||||||| (diff3), ======= (exactly 7 =, alone on the line), or >>>>>>> (7 >, not 8+). One rule, 'merge-conflict-markers/marker-left-in-file', naming the file and line.
2. Register it in tools/checks/registry.ts's checks array.
3. New file tools/checks/merge-conflict-markers.test.ts: a passing case (no finding on ordinary files, including something that merely contains '=' repeated but not exactly 7 alone, to prove it is not a loose substring match) and a failing case (a fixture file with a real conflict marker block triggers the finding with the right file and line).
4. Run pnpm check and pnpm test; confirm the check count in pnpm check's own output goes from 13 to 14.

### Risks
False positives: a line of exactly 7 '=' with nothing else is rare in real prose but could appear in some generated or example file as a divider; if pnpm check --mode all surfaces a real false positive anywhere in the repo, treat that file's content as the finding (the check may be legitimately strict), not as a reason to narrow the regex without evidence.

### Proof
pnpm check reports 14 checks and stays clean on the current repo; the new test file shows both a pass and a catch; a quick manual check (insert a real <<<<<<< marker into a scratch file, run pnpm check --mode all, see it caught, then remove it) confirms end to end.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
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

(633 earlier lines omitted)
```text
│  3.00 kB │ gzip:   1.16 kB
│  storybook-static/assets/TabItem-DO_WQBW_.js
│  3.21 kB │ gzip:   1.35 kB
│  storybook-static/assets/Chip-BBQiiRFD.js
│  3.25 kB │ gzip:   1.45 kB
│  storybook-static/assets/ItemPickerTemplate.stories-BDWCWUYW.js
│  4.34 kB │ gzip:   1.52 kB
│  storybook-static/assets/Button.stories-sNN3dC1C.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/TextField-BC9sKZ03.js
│  4.58 kB │ gzip:   1.76 kB
│  storybook-static/assets/PreferencesTemplate.stories-DMm4jNL7.js
│  4.58 kB │ gzip:   1.76 kB
│  storybook-static/assets/ItemRow-BgzP7XFR.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/GroceryListTemplate.stories-Bu-n0q9_.js
│  5.75 kB │ gzip:   1.97 kB
│  storybook-static/assets/Button-CxILU1aQ.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/Mascot-D4jB9WQY.js
│  11.37 kB │ gzip:   4.20 kB
│  storybook-static/assets/icons-BPDuhWkL.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-PNLDbSaq.js
│  17.31 kB │ gzip:   4.66 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-CGfbGzBZ.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-vq108xyw.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-DmUd5E6i.js
│  1,359.38 kB │ gzip: 391.72 kB

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

│  Vite ✓ built in 1.81s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 326 story views checked (axe, 44 x 44, images not compared)
```

Reviewed by philosophy:reviewer (did not do the work). Verdict: closed, both criteria met.

Criterion #1: tools/checks/merge-conflict-markers.ts is registered in tools/checks/registry.ts; 'mise exec -- pnpm check' reports 'checks passed (14 checks, all mode)', the 13-to-14 count the plan predicted. Findings carry rule, file, line and a 'Why:' line (verified via the test's message() assertion and an in-process probe returning {rule: merge-conflict-markers/marker-left-in-file, file, line: 2, detail: 'starts with a merge conflict marker: <<<<<<< HEAD'}).

Criterion #2: tools/checks/merge-conflict-markers.test.ts, 8 tests, all passing - a real conflict block, the diff3 ||||||| marker, a board file and a .claude/ file, a clean file, a non-matching run of '=', and an unreadable tracked path. It runs in pre-commit (lefthook.yml 'node tools/checks/run.ts --mode staged', which runs every registry check) and in CI (committed .github/workflows/ci.yml line 27, '--mode all'), the same as every other check, because it is registered rather than wired separately.

The point of the change verified on the real repo: makeContext's trackedFiles is 1023 files to allFiles' 531, with 125 backlog/ files tracked versus 0 in allFiles - so the exact path the Oct 20 incident took is now scanned. Full repo clean: pnpm check, pnpm typecheck, pnpm test (103 files, 1370 tests) and pnpm test:emulator (8 files, 70 tests) all pass. No check reformatted or fixed a file as it ran.

Findings, none blocking:
1. (low) modified_files is stale. The plan said to call git ls-files from ctx.root inside the check; the implementation instead added a CheckContext.trackedFiles field, which also touched tools/checks/lib.ts, tools/checks/fixture.ts and tools/checks/visual-baselines.test.ts - three files beyond the task's modified_files. The approach is the better one (reusable and fixture-testable, which is why the test suite can cover the backlog/ case at all), but the recorded file list no longer matches the change. For whoever owns the finish line; a reviewer does not edit it. Filed nowhere.
2. (low, pre-accepted) MARKER flags a line of exactly seven '=' alone, which is also a valid markdown setext H1 underline. The repo is clean today and the plan's Risks section pre-decided not to narrow the regex without evidence of a real false positive, so this is left as designed. Filed nowhere.
3. (informational) rules[].req says 'R57', but doc-1's R57 is specifically about changes that weaken a check; a conflict-marker check is closer to R55/R56 (validation as scripts, enforcement with its reason attached). Cosmetic attribution, nothing enforces req ids. Filed nowhere.
4. (informational) The plan's manual end-to-end step (insert a marker into a scratch file, run pnpm check, see it caught) was not performed: the reviewer has no write tools. The in-process probe above covers the same path.
5. (informational) The first full-tier check block recorded on this task is a harness artifact, not a repo failure: scripts/record-check spawns pnpm without mise on PATH and hit ERR_PNPM_UNSUPPORTED_ENGINE (Node v22 against engines.node >=24.12). The block after it, recorded under 'mise exec --', is the real one and is clean.
<!-- SECTION:NOTES:END -->
