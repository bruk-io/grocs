---
id: TASK-20
title: The Preferences template can show the notifications switch unavailable
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 17:34'
updated_date: '2026-10-20 17:34'
labels:
  - size-2
  - layer-ui
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-1.28 builder. PreferencesTemplate has no way to draw its notifications switch disabled, so until push opt-in exists (TASK-1.29) Settings shows a switch that looks live and does nothing - the dead-control problem TASK-12, TASK-17 and TASK-19 removed elsewhere. TASK-1.28's criterion 1 waits on this.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 PreferencesTemplate can show the notifications switch unavailable (disabled, with a short reason), as a state with its story and behaviour test, and its switch is never live without a handler
- [ ] #2 Every existing baseline is unchanged and the new baselines are approved
<!-- AC:END -->
