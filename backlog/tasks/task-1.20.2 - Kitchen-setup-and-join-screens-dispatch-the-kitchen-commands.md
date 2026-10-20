---
id: TASK-1.20.2
title: Kitchen setup and join screens dispatch the kitchen commands
status: To Do
assignee: []
created_date: '2026-10-20 03:20'
labels:
  - size-3
  - layer-app
dependencies:
  - TASK-1.20.1
references:
  - >-
    backlog/decisions/decision-13 -
    Kitchen-create-and-join-go-through-application-commands.md
parent_task_id: TASK-1.20
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-13. KitchenSetupTemplate and the join screen (InviteJoinTemplate, InviteRetryTemplate; routes from TASK-1.37.5) dispatch CreateKitchen and JoinKitchen. The composition root picks the gateway: FirebaseKitchenGateway in the real app, MemoryKitchenGateway in the demo. No port tells a returning member their kitchen yet (filed separately), so the app holds the kitchen it created or joined in session state. AC1 and AC2 of TASK-1.20 also need real phones and Google sign-in (TASK-1.15); this task proves the flows in route tests.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A signed-in member with no kitchen sees kitchen setup; creating one shows the invite link and code, then the Groceries screen works on that kitchen
- [ ] #2 Entering or opening an invite code joins the kitchen, and each rejection reason shows its own inline error where the code was entered (TASK-1.20 AC3)
- [ ] #3 Route tests cover create, join, and every rejection reason on the in-memory gateway; the real composition uses the Firebase gateway and check:release stays clean
<!-- AC:END -->
