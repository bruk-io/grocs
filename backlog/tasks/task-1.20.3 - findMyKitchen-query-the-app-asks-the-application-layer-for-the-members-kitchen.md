---
id: TASK-1.20.3
title: >-
  findMyKitchen query: the app asks the application layer for the member's
  kitchen
status: In Progress
assignee:
  - '@builder-application-small'
created_date: '2026-10-20 05:11'
updated_date: '2026-10-20 05:11'
labels:
  - size-1
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
Found by the TASK-1.20.2 builder: KitchenGateway.findMyKitchen() (TASK-14) has no application-layer caller, so the app cannot route a returning member to their kitchen without reaching the port (R28). A query, not a command: it changes nothing and emits no event, so it sits beside watchSession in packages/application/src/queries.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 findMyKitchen(deps) returns the signed-in member's kitchen id or null, null when nobody is signed in, and is exported from @grocs/application
- [ ] #2 Tests on the fake gateway cover a member with a kitchen, one without, nobody signed in, and a composition with no gateway
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create packages/application/src/queries/find-my-kitchen.ts: import type { Deps } from '../dispatch/types.ts'; export an async function findMyKitchen(deps: Deps): Promise<string | null> with a doc comment ('The signed-in member's kitchen, found on any phone (R2, TASK-14); null when nobody is signed in or they have none yet. Throws when the composition supplies no KitchenGateway, which is a wiring mistake, not a state to show (decision-13).'). Body: if (!deps.auth.currentUser()) return null; if (!deps.kitchens) throw new Error('kitchens-unavailable: this composition supplies no KitchenGateway'); return deps.kitchens.findMyKitchen();
2. packages/application/src/index.ts: next to the watch-session export, add export { findMyKitchen } from './queries/find-my-kitchen.ts';
3. Create packages/application/src/queries/find-my-kitchen.test.ts with four vitest cases, building Deps like queries.test.ts's make() (FakeAuth with user u1, FakeClock, SequentialIds, InMemorySyncStore from '@grocs/ports/testing') plus kitchens: new FakeKitchenGateway('u1') from the same entry: (a) after signing u1 in (await (deps.auth as FakeAuth).signInWithTestAccount('a@grocs.test', 'pw')) and await deps.kitchens!.createKitchen('Home', 'UTC'), findMyKitchen returns the created kitchenId; (b) signed in with no kitchen, it returns null; (c) nobody signed in, it returns null; (d) signed in with kitchens omitted from Deps, it rejects with an error whose message contains 'kitchens-unavailable'.
4. Run pnpm check, pnpm typecheck and pnpm test. If a step does not fit the code (for example FakeAuth's sign-in method or createKitchen's signature differ), stop and report which step.
<!-- SECTION:PLAN:END -->
