---
id: TASK-1.20.3
title: >-
  findMyKitchen query: the app asks the application layer for the member's
  kitchen
status: In Progress
assignee:
  - '@builder-application-small'
created_date: '2026-10-20 05:11'
updated_date: '2026-10-20 05:25'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented per the four-step plan, commit f961954 on worktree-agent-aec7e319e9ab52c9c. Added packages/application/src/queries/find-my-kitchen.ts (findMyKitchen(deps): null when nobody is signed in, throws kitchens-unavailable when deps.kitchens is missing, otherwise delegates to the gateway), exported from packages/application/src/index.ts beside watchSession, and find-my-kitchen.test.ts with four cases. The test file signs in u1, creates a kitchen, and covers: member with a kitchen, member without one, nobody signed in (a kitchen exists, so the null comes from the auth check), and no gateway composed. Checks: pnpm check passed (13 checks), pnpm typecheck exit 0, pnpm test 99 files / 1308 tests passed. Hook run on commit passed all three stages. Deviation noted, not blocking: the function's doc comment cites decision-13 for the throw, but decision-13 says nothing about missing gateways (it covers join refusals as results). The throw follows the plan; the create-kitchen command answers err kitchens-unavailable instead, because a query returning string or null has no result channel. Environment note: pnpm prints ERR_PNPM_IGNORED_BUILDS for re2@1.27.0 and a warning that node_modules may be out of sync. Checks still passed.
<!-- SECTION:NOTES:END -->
