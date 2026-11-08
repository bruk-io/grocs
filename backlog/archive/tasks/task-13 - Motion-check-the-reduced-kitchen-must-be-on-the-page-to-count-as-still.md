---
id: TASK-13
title: 'Motion check: the reduced kitchen must be on the page to count as still'
status: Done
assignee:
  - '@builder'
created_date: '2026-10-19 13:41'
updated_date: '2026-10-20 04:41'
labels:
  - size-1
  - testing
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the review of TASK-1.37.10. judgeMotion(reading, 'still') passes when drifting and sidewaysAnimations are both 0, which is also what readMotion returns when #storybook-root has nothing animatable in it: a Reduced story that renders an empty or collapsed scene without throwing passes the still check vacuously (openStory only fails on page errors or Storybook's error display). The Panning half cannot pass by accident (it needs a running sideways animation of at least 50 px), so this only affects the reduce-motion proof (R41, R60). Evidence: tools/storybook-browser.ts readMotion and judgeMotion at b30d215. Lives in tools/, not the ui layer.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The still check also requires that the scene is present, so an empty or collapsed Reduced story fails it
- [x] #2 A unit test shows an empty reading fails the still check
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. tools/storybook-browser.ts: add to MotionReading, after travel: /** Elements inside #storybook-root when it was read; a story that rendered nothing has none. */ readonly elements: number;
2. Same file: add after MIN_PAN_TRAVEL_PX: /** The kitchen scene draws dozens of elements; fewer than this means the scene did not render, so 'still' would prove nothing (TASK-13). */ export const MIN_SCENE_ELEMENTS = 10;
3. Same file, in readMotion's page.evaluate: change the returned object to { drifting, sidewaysAnimations, travel, elements: elements.length }.
4. Same file, in judgeMotion's 'still' branch: before the existing return, add: if (reading.elements < MIN_SCENE_ELEMENTS) return [`the reduced story drew ${reading.elements} elements, fewer than ${MIN_SCENE_ELEMENTS}, so there is no scene to hold still; a story that renders nothing must not pass as reduced (R41, R60)`]; Leave the 'pans' branch unchanged.
5. tools/storybook-browser.test.ts: add elements: 40 to each of the three fixtures (panning, bobbingOnly, still) and to the inline reading in 'rejects a wobble shorter than a pan'. Change no existing expectation and delete no test.
6. Same file: add a test 'rejects a reduced story that drew no scene' that expects judgeMotion({ drifting: 0, sidewaysAnimations: 0, travel: 0, elements: 0 }, 'still') to have length 1 and its first message to contain 'R41'. Import MIN_SCENE_ELEMENTS and add a second expectation that elements: MIN_SCENE_ELEMENTS - 1 also fails.
7. Run pnpm check, pnpm typecheck, pnpm test and pnpm --filter @grocs/ui visual (the motion check must still pass on the real Panning and Reduced stories, every baseline unchanged). If any step does not fit the code, stop and report which.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 19, 2026).

Finished an interrupted build. A builder was stopped by a container restart after editing tools/storybook-browser.ts and tools/storybook-browser.test.ts in this worktree. I checked those uncommitted edits against plan steps 1-6 and all six matched the code exactly, so none were redone. Step 7 results: pnpm check passed (13 checks), pnpm typecheck passed, pnpm test passed (96 files, 1278 tests, including the new 'rejects a reduced story that drew no scene' test), and pnpm --filter @grocs/ui visual passed (311 story views checked, 311 images compared, no baseline changed). No existing test was deleted, skipped or weakened. Acceptance criteria #1 and #2 are covered by the MIN_SCENE_ELEMENTS check and its unit test.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(632 earlier lines omitted)
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

|  Vite ✓ built in 7.78s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 6.4s of this 7.7s
|  build (83%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (42%, 3.2s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (37%, 2.8s, 822
|  calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a59ee7d8e2fa3b99f/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a59ee7d8e2fa3b99f/packages/ui
> node ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

No repro: the failure is a vacuous pass, not a failing behaviour. Before the fix, judgeMotion({drifting:0, sidewaysAnimations:0, travel:0}, 'still') returned [] by construction (b30d215), which is the bug itself. The new unit test is the regression guard. A reviewer cannot run it against the parent commit without changing the worktree.

Review (philosophy:reviewer, Oct 20 2026), commit 81719a9. Verdict: closes. Full tier exit 0, visual pass included the motion check on the real Panning and Reduced stories. Plan steps 1-6 match the diff exactly. Pans branch unchanged, fixtures gained elements: 40 with no expectation changed, new test fails still on 0 and MIN_SCENE_ELEMENTS - 1. Both criteria met. Floor: the built Reduced and Panning stories each draw 299 elements (measured in Chromium, 390x844). 10 catches empty/collapsed, not a half-rendered scene; minor, not filed.
<!-- SECTION:NOTES:END -->
