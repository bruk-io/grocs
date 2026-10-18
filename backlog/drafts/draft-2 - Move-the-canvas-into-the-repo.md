---
id: DRAFT-2
title: Move the canvas into the repo
status: Draft
assignee: []
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 19:03'
labels:
  - size-3
  - design-system
milestone: m-1
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The spec's 'Moving the canvas into the repo' steps 2 and 3. Step 1 is done: the canvas source is in design/canvas/ (checker in design/canvas/tools/ rather than tools/checks/, since the checks runner is TypeScript), and the reviews are doc-2. Waits on D9 (TASK-1.14). Cites R59, R62, R66.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The canvas lives in design/canvas and the design artifact is published from there
- [ ] #2 grocs.css is generated from tokens.json, and a check fails when they differ (R59)
- [ ] #3 Mascots, icons and the kitchen scene are React Native components converted by a tool (R62)
<!-- AC:END -->
