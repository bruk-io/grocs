---
id: TASK-1.37.10
title: Record the kitchen scene's pan in the browser pass
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 08:30'
updated_date: '2026-10-19 13:24'
labels:
  - size-2
  - testing
  - design-system
milestone: m-2
dependencies: []
modified_files:
  - tools/storybook-browser.ts
  - tools/storybook-browser.test.ts
  - tools/visual.ts
parent_task_id: TASK-1.37
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.37.3. The KitchenScene Panning story's baseline is the still pose, because the browser pass forces reduce motion. That the scene actually pans is proved only by a unit test of sceneMotion and a one-off Playwright check the builder ran, not by anything recorded in the repo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The browser pass asserts, for the Panning story with reduce motion off, that the scene's transform changes over time, and for Reduced that it doesn't
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. storybook-browser.ts: add a `motion` option (`reduced` default | `allowed`) to `newStoryPage` and `openStory`. `allowed` opens the context with `reducedMotion: no-preference` and skips the `__GROCS_REDUCE_MOTION__` init script; the default path is untouched, so every existing view and baseline is unchanged.
2. storybook-browser.ts: add `readMotion(page)` (in-page: snapshot every element transform, wait 300 ms of real time, snapshot again -> `drifting`; for each animation whose clock advanced, pause it and seek to 0/25/50/75% of its cycle and read its target x translation -> `sidewaysAnimations`, `travel`) and a pure `judgeMotion(reading, expected)` returning failure strings that name R41/R60. Animations are found by what they do (move sideways), not by their generated names or by importing tokens into tools.
3. visual.ts: a `MOTION_EXPECTATIONS` map (Panning -> pans, Reduced -> still). After the normal view of a story, if it is listed, open a second fresh page with motion allowed, read and judge. The screenshot page stays reduced, so baselines are unchanged. A listed story missing from the Storybook (when unfiltered) fails, so a rename cannot silently drop the check.
4. storybook-browser.test.ts: unit tests for judgeMotion (pans passes with sideways travel; pans fails when still; still fails when anything drifts/moves sideways; bob-only counts as neither).

### Risks
- Reduced passing for the wrong reason (nothing found because the page had reduce motion on): the motion page is no-preference with no global, so Reduced proves the MotionProvider prop path.
- Seeking animations on a throwaway page only; the reading is taken after the real-time drift sample.
- Flaky timing: the pan check seeks the timeline rather than waiting for the 4 s hold at the start.

### Proof
`pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm --filter @grocs/ui visual` (all baselines unchanged); also mutate-check by making sceneMotion pan nothing and confirming the pass fails.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted Oct 19, 2026 (Bruk: wrap up the UI portions).

**builder-ui report.** The browser pass now has a motion check (tools/visual.ts `MOTION_EXPECTATIONS`): Panning must pan, Reduced must hold still, each opened a second time on a page of its own with the browser allowing motion (context `reducedMotion: no-preference`, no `__GROCS_REDUCE_MOTION__`). The screenshotted page is unchanged (still reduced), so no baseline changed: `pnpm --filter @grocs/ui visual` compares 304 views, all unchanged.

How: `newStoryPage` and `openStory` take an optional `motion` (`reduced` default, `allowed`), so every existing caller (visual, shots) is untouched. `readMotion` compares every element transform 300 ms of real time apart (`drifting`), then, for each animation whose clock advanced, pauses it, seeks to 0/25/50/75% of its cycle and reads the element x translation (`sidewaysAnimations`, `travel`). The pan is found by what it does (slides sideways), not by its generated REA-CSS-n name, and tools does not import the ui tokens. `judgeMotion` (pure, unit-tested in tools/storybook-browser.test.ts) wants travel >= 50 px for pans (measured 523 px) and zero drift and zero sideways animations for still (measured 0 and 0). Seeking the timeline avoids waiting out the pan 4 s hold. A listed story missing from the Storybook fails an unfiltered run.

Mutation checks (reverted): `pan: null` in sceneMotion fails Panning (furthest 2 px); ignoring `reduced` in sceneMotion fails Reduced (1 element still changing, 1 sideways animation).

Evidence: pnpm check passed (13 checks); pnpm typecheck clean; pnpm test 1161 passed, 1 failed on a 5 s timeout in tools/hooks/hooks.test.ts ("allows the orchestrator writing the board...") while the machine was busy with a parallel visual run, and tools/hooks plus tools/storybook-browser pass (49 tests) when rerun alone; pnpm test:emulator skipped as instructed. Note: the worktree had no node_modules, I ran pnpm install --frozen-lockfile --offline.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(521 earlier lines omitted)
```text
|  storybook-static/assets/Button-CjTVULS1.js
|  5.51 kB │ gzip:   1.95 kB
|  storybook-static/assets/GroceryListTemplate.stories-D2UedSwb.js
|  5.76 kB │ gzip:   1.98 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-c4jHNhqG.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-BvNtUEyw.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-CKVLZ4Pu.js
|  17.02 kB │ gzip:   4.60 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-DOWvLKto.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-DxQrdXcZ.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-D8yVd90N.js
|  1,359.27 kB │ gzip: 391.71 kB

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

|  Vite ✓ built in 5.49s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.4s of this 5.4s
|  build (64%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (42%, 2.3s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (23%, 1.3s, 822
|  calls)
|  These rows add up to more than the total. Callbacks can overlap, so
|  the same time counts for more than one row.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a1d0d315220d7d446/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a1d0d315220d7d446/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 304 story views checked (axe, 44 x 44, 304 images compared)
```

Review (philosophy:reviewer, Oct 19, 2026): closed. Full-tier record-check exit 0 (1162 unit tests, 27 emulator tests, browser pass 304 views with the motion check running for organisms-kitchen-scene--panning and --reduced, no failures). Fixes the cause: the pass forced reduce motion everywhere, so the pan was never seen; now Panning and Reduced are each opened again on a separate, never-screenshotted page with reducedMotion no-preference and no __GROCS_REDUCE_MOTION__ global, so Reduced proves the MotionProvider prop path rather than the browser setting. Pans cannot pass by accident: it needs a running animation whose element travels >= 50 px sideways across seeked cycle points; the builder's mutation (pan: null) failed it at 2 px. Reduce motion for other stories: not loosened. motion defaults to 'reduced' in newStoryPage and openStory, the only 'allowed' callers are motionFailures in tools/visual.ts for the two ids in MOTION_EXPECTATIONS, and tools/shots.ts and the screenshot loop use the default; baselines unchanged. A renamed story fails an unfiltered run. Finding (low, filed as DRAFT-1 in this worktree, size-1): the still check passes vacuously if Reduced renders an empty scene without a page error; the orchestrator should file it on main.
<!-- SECTION:NOTES:END -->
