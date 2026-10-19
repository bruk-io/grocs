---
id: TASK-1.41
title: >-
  Browser pass scans a mascot's speech bubble mid-fade, so its contrast check
  fails at random
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 11:10'
updated_date: '2026-10-19 11:33'
labels:
  - size-1
  - testing
dependencies: []
modified_files:
  - tools/storybook-browser.ts
parent_task_id: TASK-1
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found running the new visual baselines workflow (TASK-1.40, run 39241970034): axe failed color-contrast on 13 mascot stories (speaking, reacting, reduced) though the same pass on the same code passed in CI and in the sandbox. Mascot's bubble pops in, or with motion reduced fades in, and tools/storybook-browser.ts openStory waits only for fonts and two frames before axe runs, so axe can read the bubble text through partial opacity. Screenshots are unaffected because they are taken with animations disabled. A flaky check blocks CI at random and teaches people to re-run it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 openStory waits for every finite entrance animation to finish before the page is scanned or measured, with a time cap so a stuck animation fails rather than hangs
- [ ] #2 The browser pass passes in CI and in the visual baselines workflow with every existing baseline unchanged
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Wait in openStory, after fonts and two frames, for every animation with a finite end to finish (document.getAnimations, finished), raced against a 5 s cap that records a story error instead of hanging. Screenshots already disable animations, so no baseline should change. Proof: the browser pass locally, CI, and the visual baselines workflow.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator (Oct 19, 2026), commit be13e0e. Evidence: local pnpm --filter @grocs/ui visual 304 views, 304 images compared, none changed; visual baselines run 39244676209 on be13e0e passed axe on every story (the failing run 39241970034 had 13 color-contrast failures on mascot speaking/reacting/reduced) and wrote baselines byte-identical to the committed ones. CI on be13e0e: see its run.
<!-- SECTION:NOTES:END -->
