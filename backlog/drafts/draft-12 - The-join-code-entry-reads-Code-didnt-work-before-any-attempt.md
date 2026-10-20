---
id: DRAFT-12
title: The join code entry reads 'Code didn't work' before any attempt
status: Draft
assignee: []
created_date: '2026-10-20 11:35'
labels:
  - size-1
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
- [ ] #2 The /join screen with no code shows that state, and the retry wording only after a rejection, shown by a route test
<!-- AC:END -->
