---
id: TASK-1.20.1
title: CreateKitchen and JoinKitchen application commands
status: In Progress
assignee:
  - '@builder-application'
created_date: '2026-10-20 03:20'
updated_date: '2026-10-20 03:20'
labels:
  - size-2
  - layer-application
dependencies: []
references:
  - >-
    backlog/decisions/decision-13 -
    Kitchen-create-and-join-go-through-application-commands.md
parent_task_id: TASK-1.20
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-13: kitchen create and join are application commands dispatched like AddItem, calling the KitchenGateway port (packages/ports/src/kitchen-gateway). A refused join is a normal result carrying its reason. Cites R2, R3, R28. The backend behind the port is built (TASK-1.20 notes).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CreateKitchen dispatches to KitchenGateway.createKitchen and returns the new kitchen id and invite code; it needs a signed-in member
- [ ] #2 JoinKitchen returns joined with the kitchen id, or rejected with each of the five reasons (not-found, expired, used, full, already-member) as a result, not an error
- [ ] #3 Scenario tests on the fake gateway cover creating, joining and every rejection reason, and the commands reach the gateway only through the port
<!-- AC:END -->
