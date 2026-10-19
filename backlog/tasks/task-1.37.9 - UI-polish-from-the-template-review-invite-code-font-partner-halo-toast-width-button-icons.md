---
id: TASK-1.37.9
title: >-
  UI polish from the template review: invite code font, partner halo, toast
  width, button icons
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-19 08:30'
updated_date: '2026-10-19 10:58'
labels:
  - size-2
  - layer-ui
  - design-system
milestone: m-2
dependencies: []
parent_task_id: TASK-1.37
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.37.3. Small likeness gaps against design/reference/shots: the invite code (MOREL-42) on JoinInviteInvalid is in the body font where the reference uses the display font; the partner avatar in the Main, Toast and Offline headers has a solid tomato ring where the reference has a soft halo; the toast pill is narrower than the reference; and the Button atom has no icon slot, so Share link and Copy diagnostics (Household, Settings) lose their icons.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The invite code uses the display font, the partner avatar shows a soft halo, and the toast pill width matches the reference
- [ ] #2 Button takes an optional leading icon, used by Share link and Copy diagnostics, with stories, behaviour tests and approved baselines
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted Oct 19, 2026 (Bruk: wrap up the UI portions).
<!-- SECTION:NOTES:END -->
