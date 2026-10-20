---
id: TASK-18
title: The ui offers a neutral code-entry state for a first join attempt
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 11:35'
updated_date: '2026-10-20 12:07'
labels:
  - size-2
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-1.20.2 review. JoinInviteScreen reuses InviteRetryTemplate for typed code entry at /join, so its title says "Code didn't work" and offers 'Back to my invite' when nobody has entered a code yet. A first-time joiner from Welcome's 'Open it to join' sees an error state first.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The ui offers a code-entry state with a neutral title for a first attempt, with its story and approved baseline
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 20, 2026: 'go further'). Split at acceptance: criterion 2 (the /join screen uses the new state, retry wording only after a rejection) is app-layer work, filed as its own size-1 task once this state exists. Sized 2: a new state needs its baselines approved by Bruk.
<!-- SECTION:NOTES:END -->
