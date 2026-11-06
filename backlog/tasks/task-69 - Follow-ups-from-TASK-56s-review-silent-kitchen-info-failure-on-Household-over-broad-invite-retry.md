---
id: TASK-69
title: >-
  Follow-ups from TASK-56's review: silent kitchen-info failure on Household,
  over-broad invite retry
status: To Do
assignee: []
created_date: '2026-11-06 23:41'
labels:
  - size-1
  - app
  - providers
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the reviewer's close of TASK-56 (c67d233). (1) HouseholdScreen hides a failed or empty getKitchenInfo: the member list stays empty, with no error, while the invite may still load. It should show the failed state the invite already has. (2) KitchenStore.inviteForKitchen (packages/providers-server/src/kitchen-store.ts) retries any error but NotAMemberError up to 5 times; only a new code colliding with an existing one (create() failing on an existing document) needs a retry, so real failures are slowed for nothing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Household shows a failed state when the kitchen's details cannot be read
- [ ] #2 inviteForKitchen retries only a code collision
<!-- AC:END -->
