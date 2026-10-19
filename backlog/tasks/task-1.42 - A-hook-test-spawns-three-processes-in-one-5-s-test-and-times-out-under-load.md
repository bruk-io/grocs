---
id: TASK-1.42
title: A hook test spawns three processes in one 5 s test and times out under load
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 12:05'
updated_date: '2026-10-19 21:54'
labels:
  - size-1
  - testing
dependencies: []
modified_files:
  - tools/hooks/hooks.test.ts
parent_task_id: TASK-1
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
tools/hooks/hooks.test.ts 'allows the orchestrator writing the board, root config or .claude/' runs the pre-edit hook three times (a node start-up each) inside one test with vitest's default 5 s timeout. With several agents running checks at once it timed out on Oct 19, 2026: twice in TASK-1.37.9's pre-commit hook (unit-test runs of 425 s and 537 s) and once in a record-check of main (6151 ms), each time passing when run alone. A pre-commit hook that fails at random pushes people and agents to skip it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Each path in that test is its own case, so no single test spawns more than one hook process, with the same assertion for every path
- [x] #2 pnpm test passes, and the tools project still runs every case it ran before
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Split the three-path loop into it.each so each case spawns one hook process. Same assertion per path; no timeout or config change.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator (Oct 19, 2026). Measured at load average 12 (five agents running checks): one hook spawn takes 1.2 to 4.4 s, so the three-spawn test overran 5 s while each split case now runs in one spawn's time. hooks.test.ts passed 4 of 5 runs straight after the split; the one failure was not captured by name, and two tests still spawn twice ('narrows a layer agent's Bash...' 4358 ms, 'also lets a layer agent run the extra commands...' 3673 ms), so they can still time out under this load. For @bruk: the remaining option is a longer timeout for this file's process-spawning tests (the R55 speed limit stays asserted by the post-edit tests' own ms < 5000 checks). That edits test config to get a green run, so it is your call under the fix-the-code-not-the-check rule; not done here.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(520 earlier lines omitted)
```text
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-CG-L9128.js
|  5.75 kB │ gzip:   1.97 kB
|  storybook-static/assets/Button-HlTd63fv.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-CVO2Zfzk.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-D4zA4yxG.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-_dK9hVdg.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-d75twOs6.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-wrpbBZ8J.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-7rNFOYcX.js
|  1,359.38 kB │ gzip: 391.72 kB

|
!  Vite [plugin builtin:vite-reporter]
|  (!) Some chunks are larger than 500 kB after minification. Consider:
|  - Using dynamic import() to code-split the application
|  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
|  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
|  - Adjust chunk size limit for this warning via
|  build.chunkSizeWarningLimit.
|
!  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
|  shimmed in module "../../node_modules/react-native-web/dist/index.js".

|  Vite ✓ built in 4.70s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.1s of this 4.6s
|  build (67%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (40%, 1.8s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (22%, 1.0s, 822
|  calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/review-142/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/review-142/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

No repro: the failure is a timeout that only occurs under concurrent load (load average ~12, five agents running checks); the test passes when run alone, so no single command fails reliably. Evidence is the three recorded timeouts in the description (two TASK-1.37.9 pre-commit runs, one record-check of main at 6151 ms). Note written by the reviewer from the task's own evidence.

Reviewed by philosophy:reviewer (Oct 19, 2026). Closed. #1 met: git show 8d57ebc replaces the three-path for-loop with it.each over the same three paths, one hook spawn per case, same expect(r.status).toBe(0). #2 met: full-tier record-check exited 0; tools project 238 passed, the three split cases ran 322-329 ms each; the diff touches only that test (1 case becomes 3, +2), no other case or assertion removed. Findings: (low) two tests still spawn the hook twice ('narrows a layer agent's Bash...', 'also lets a layer agent run the extra commands...') and can still overrun 5 s under heavy load; no draft filed, since the same it.each split fixes them and Bruk's open timeout question covers the same area - fold into that decision. Open question on a longer timeout left to @bruk, not counted against the task.
<!-- SECTION:NOTES:END -->
