---
id: TASK-1.37.6
title: >-
  UI test harness: behaviour tests, browser pass with accessibility scan and
  visual baselines
status: To Do
assignee: []
created_date: '2026-10-19 03:19'
labels:
  - size-5
  - design-system
  - testing
milestone: m-2
dependencies:
  - TASK-1.19
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Builds the shared tooling decision-11 (proposed) calls for, once, before the component tasks start, so each of them only writes its own tests. Spans packages/ui, apps/mobile test setup, tools/checks and CI, so it runs as a general builder. Cites R42, R50, R55, R56, R57, R65.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A behaviour-test pattern exists for components with callbacks or state props (decision-11 level 2), shown by tests for the existing Button and Checkbox that press by role, assert the callback and its arguments, and assert disabled and checked in the accessibility state
- [ ] #2 One browser pass over the built Storybook runs an axe-core scan on every story and fails on any violation, and fails any button, checkbox or link smaller than 44 by 44 points (R42)
- [ ] #3 The same pass compares each story's screenshot with its approved baseline in packages/ui/visual-baselines/ on Linux, and on other systems skips only the image comparison and says so; fonts are bundled files, motion is reduced, and viewports are fixed, so two runs give the same images
- [ ] #4 pnpm --filter @grocs/ui visual:update is the only way baselines are created or changed; editing or deleting a baseline any other way is blocked as a weakening (R57), with the reason
- [ ] #5 A route render-test pattern exists for the app (decision-11 level 4), shown by a test for the existing index route
- [ ] #6 The browser pass runs before an agent stops (the full tier in .claude/checks.json) and in CI, while the after-edit hook stays under 5 seconds (R56)
<!-- AC:END -->
