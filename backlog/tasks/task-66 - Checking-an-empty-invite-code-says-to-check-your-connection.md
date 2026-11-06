---
id: TASK-66
title: Checking an empty invite code says to check your connection
status: To Do
assignee: []
created_date: '2026-11-06 22:07'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-56 flows: Check code with an empty field dispatches JoinKitchen with '', the joinKitchen function rejects it as invalid-argument, and the join screen shows its generic 'We could not check that code. Check your connection and try again.' Nothing is wrong with the connection; the person just has not typed a code.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Check code with nothing typed asks for the code and calls nothing
<!-- AC:END -->
