---
id: DRAFT-10
title: A returning member finds their kitchen on any phone
status: Draft
assignee: []
created_date: '2026-10-20 03:20'
labels:
  - size-3
dependencies: []
references:
  - >-
    backlog/decisions/decision-13 -
    Kitchen-create-and-join-go-through-application-commands.md
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From decision-13. KitchenGateway only creates and joins, so a member who signs in on a new phone, or after reinstalling, has no way to learn which kitchen they belong to. Backend side: a port (or a gateway method), the Firebase and in-memory providers, and security rules letting a member read only their own membership. Until then the app holds the kitchen it created or joined in session state (TASK-1.20.2).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 After signing in, the app learns the member's kitchen through a port, on any phone, with contract tests for every provider
- [ ] #2 Security rules let a member read only their own membership, with allow and deny tests
<!-- AC:END -->
