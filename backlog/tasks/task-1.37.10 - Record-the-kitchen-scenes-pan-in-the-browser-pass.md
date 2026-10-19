---
id: TASK-1.37.10
title: Record the kitchen scene's pan in the browser pass
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 08:30'
updated_date: '2026-10-19 12:18'
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
- [ ] #1 The browser pass asserts, for the Panning story with reduce motion off, that the scene's transform changes over time, and for Reduced that it doesn't
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
<!-- SECTION:NOTES:END -->
