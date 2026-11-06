---
id: TASK-56
title: No way to see or share the kitchen's invite once the kitchen exists
status: To Do
assignee: []
created_date: '2026-11-06 19:50'
labels:
  - size-3
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in the 2026-11-06 device sweep (release builds, Android emulator and iOS simulator). The real invite card shows only on KitchenSetupScreen, once, while the kitchen is being created. Nothing in the app navigates to /household, and HouseholdScreen is still the design mock (inviteCode MOREL-24, you@example.com, 'Waiting for Sam to join'). So a member whose kitchen already exists, Bruk's included, cannot get the invite again, and Shazya cannot join from her phone. Blocks TASK-1.20 AC #2.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A signed-in member can reach their kitchen's real invite link and code from the app after setup
- [ ] #2 The household screen shows the kitchen's real name, members and invite state, with no sample data
- [ ] #3 A partner who opens that link or enters that code on a second device joins the same kitchen
<!-- AC:END -->
