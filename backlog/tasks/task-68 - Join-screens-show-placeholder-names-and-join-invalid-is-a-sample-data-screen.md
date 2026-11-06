---
id: TASK-68
title: 'Join screens show placeholder names, and /join-invalid is a sample-data screen'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 23:18'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the 2026-11-06 sample-content sweep. Opening an invite link shows 'Your partner invited you to Our kitchen' whoever sent it and whatever the kitchen is called: JoinInviteScreen hardcodes both. The joiner is not a member yet, so the app cannot read the kitchen. /join-invalid (JoinInviteInvalidScreen) is a design-reference screen on sample data (Alex, MOREL-42) that nothing links to; the real rejected state is drawn by JoinInviteScreen itself.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Opening an invite link names the person who sent it and their kitchen, or neither, never a made-up name
- [ ] #2 No route renders the join screens on sample data
<!-- AC:END -->
