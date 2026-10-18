---
id: TASK-1.20
title: 'Kitchen and invites: we both sign in with Google and share one kitchen'
status: To Do
assignee: []
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 19:16'
labels:
  - size-5
  - slice
milestone: m-2
dependencies:
  - TASK-1.4
  - TASK-1.9
  - TASK-1.15
  - TASK-1.18
  - TASK-1.33
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on the skeleton, D4 and the Google sign-in spike. Cites R1, R2, R3, R4, R53.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 I sign in with Google on the Fold, create our kitchen and get an invite link and code
- [ ] #2 Shazya opens the link or enters the code on her iPhone and joins; a third person can't
- [ ] #3 A bad, expired or used invite shows an inline error where it was entered
- [ ] #4 Neither of us can read or write any other kitchen, enforced by security rules with allow and deny tests
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Also waits on the layer agents (TASK-1.18) and declared checks (TASK-1.33), since decision-3 delivers slices through layer agents and reviewers record checks with record-check.
<!-- SECTION:NOTES:END -->
