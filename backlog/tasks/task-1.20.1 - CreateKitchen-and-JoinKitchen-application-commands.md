---
id: TASK-1.20.1
title: CreateKitchen and JoinKitchen application commands
status: In Progress
assignee:
  - '@builder-application'
created_date: '2026-10-20 03:20'
updated_date: '2026-10-20 03:47'
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
- [x] #1 CreateKitchen dispatches to KitchenGateway.createKitchen and returns the new kitchen id and invite code; it needs a signed-in member
- [x] #2 JoinKitchen returns joined with the kitchen id, or rejected with each of the five reasons (not-found, expired, used, full, already-member) as a result, not an error
- [x] #3 Scenario tests on the fake gateway cover creating, joining and every rejection reason, and the commands reach the gateway only through the port
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan (philosophy:plan-change): two handlers in packages/application/src/commands (create-kitchen.ts, join-kitchen.ts) registered in commandHandlers; each checks auth.currentUser, then calls deps.kitchens (KitchenGateway) and returns events. Added optional Deps.kitchens, instrumented in instrumentDeps (logged as port 'kitchens'); createTestClient defaults it to a FakeKitchenGateway (kitchens: null composes none). No port changes were needed.

Done. CreateKitchen -> KitchenCreated{kitchenId, inviteCode}; errors: not-signed-in, empty-name, kitchens-unavailable. JoinKitchen -> KitchenJoined{kitchenId} or KitchenJoinRejected{reason} as an ok result for all five reasons; errors: not-signed-in, kitchens-unavailable. A gateway throw becomes the dispatcher's 'internal' result. Scenario tests: create-kitchen.scenario.test.ts and join-kitchen.scenario.test.ts. not-found/expired/used/already-member run on the fake gateway (two phones, one shared clock). 'full' is unreachable through the fake (one invite per kitchen, consumed by the first join), so every reason incl. full is also proven to pass through via a stub gateway. Tests also check the gateway is reached only via the instrumented port.

For TASK-1.20.2: Deps.kitchens is OPTIONAL only because apps/mobile composition (compose-app, compose-firebase, compose-demo) is outside the application layer and would not typecheck if it were required. TASK-1.20.2 should supply it in all roots and then make it required (and drop the kitchens-unavailable branches). Screens read the outcome from the dispatch result's events. pnpm check, typecheck and test all pass.

Finished an interrupted build: the previous builder was stopped by a container restart as it was committing. I reviewed the staged work against the plan and acceptance criteria, found nothing missing, and ran pnpm check, typecheck and test (98 files, 1297 tests) green. No port changes. Committed with the hook running.
<!-- SECTION:NOTES:END -->
