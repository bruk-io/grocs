---
id: TASK-1.41
title: >-
  Browser pass scans a mascot's speech bubble mid-fade, so its contrast check
  fails at random
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 11:10'
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
