---
id: TASK-14
title: A returning member finds their kitchen on any phone
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-20 03:20'
updated_date: '2026-10-20 03:36'
labels:
  - size-3
dependencies: []
references:
  - >-
    backlog/decisions/decision-13 -
    Kitchen-create-and-join-go-through-application-commands.md
modified_files:
  - packages/ports/src/kitchen-gateway/port.ts
  - packages/ports/src/kitchen-gateway/fake.ts
  - packages/ports/src/kitchen-gateway/contract.ts
  - packages/providers-server/src/kitchen-store.ts
  - apps/functions/src/index.ts
  - packages/providers-firebase/src/kitchen-gateway.ts
  - packages/providers-memory/src/memory-kitchen-gateway.ts
  - firebase/firestore.rules
  - firebase/firestore.rules.test.ts
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From decision-13. KitchenGateway only creates and joins, so a member who signs in on a new phone, or after reinstalling, has no way to learn which kitchen they belong to. Backend side: a port (or a gateway method), the Firebase and in-memory providers, and security rules letting a member read only their own membership. Until then the app holds the kitchen it created or joined in session state (TASK-1.20.2).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 After signing in, the app learns the member's kitchen through a port, on any phone, with contract tests for every provider
- [x] #2 Security rules let a member read only their own membership, with allow and deny tests
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Port: add findMyKitchen(): Promise<string | null> to the existing KitchenGateway port (packages/ports/src/kitchen-gateway/port.ts) - reuses the port rather than adding a new one, matching decision-13's 'a port or gateway method' framing and the same phone-calls-the-server shape as createKitchen/joinKitchen.
2. Data shape: a memberships/{uid} document, {kitchenId}, one per person (this app's whole model is one kitchen per person - R2/R3 never describe more than one). Written atomically alongside the existing kitchen/invite writes: createKitchen's batch gains a memberships/{ownerUid} write; joinKitchen's transaction gains a memberships/{callerUid} write. A reader must never see a kitchen or a join without its membership record, same reasoning as the existing kitchen+invite atomicity.
3. providers-server: extend KitchenStore with findKitchenForUid(uid): Promise<string | null>, a plain doc read; extend createKitchen/joinKitchen to also write the membership doc inside their existing batch/transaction.
4. apps/functions: a third callable, findMyKitchen, auth-checked the same way as the other two, calling KitchenStore.findKitchenForUid(request.auth.uid).
5. providers-firebase: extend FirebaseKitchenGateway.findMyKitchen() over httpsCallable, same pattern as createKitchen/joinKitchen.
6. providers-memory: extend MemoryKitchenGateway.findMyKitchen() reading its own shared in-memory state.
7. Port contract + fake: extend kitchenGatewayContract with findMyKitchen cases (finds the kitchen after creating, after joining, null for someone with no kitchen); extend FakeKitchenGateway to match.
8. firestore.rules: match /memberships/{uid} { allow read: if signedIn() && request.auth.uid == uid; allow write: if false; } with allow/deny tests (a member reads their own, not someone else's; no one writes directly).

### Risks
- Keep this backend-only: no apps/mobile screen/composition wiring (TASK-1.20.2 and the application-layer command for this are someone else's, the same split decision-13 already set for create/join) - just the port, providers and rules, verified end to end against the real Cloud Functions emulator the way TASK-1.20's create/join already are.
- Do not touch packages/ui or apps/mobile's screens.

### Proof
- Emulator tests: the full port contract (fake, Firebase-via-real-Cloud-Functions, in-memory) plus the new findMyKitchen cases, and firestore.rules allow/deny tests for memberships/{uid}.
- pnpm check, pnpm typecheck, pnpm test, pnpm test:emulator, pnpm check:demo, pnpm check:release all green.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented per the plan. KitchenGateway gained findMyKitchen(): Promise<string | null>. Data shape: memberships/{uid} = {kitchenId}, written atomically alongside the existing kitchen/invite writes in KitchenStore.createKitchen's batch and joinKitchen's transaction (a reader never sees a kitchen or a join without its membership record, same reasoning as the existing kitchen+invite atomicity). A new findMyKitchen Cloud Function wraps KitchenStore.findKitchenForUid. FirebaseKitchenGateway and MemoryKitchenGateway both implement it; the fake finds the kitchen by scanning its in-memory members (simpler than simulating the membership doc, since the fake already holds full kitchen state). firestore.rules: memberships/{uid} readable only by its own uid, writable by no one (server functions only, same pattern as kitchens/{kitchenId}).

Verification: pnpm check (13 checks), pnpm typecheck (clean), pnpm test (96 files, 1283 tests), pnpm test:emulator (8 files, 70 tests, including a real findMyKitchen round trip through the Cloud Functions emulator and two new direct KitchenStore tests proving the membership doc is written atomically with create and with join), pnpm check:demo and pnpm check:release all green. Ran test:emulator twice to confirm no flake.

Scope held: no apps/mobile screen or composition wiring, no packages/ui - that split (decision-13) is TASK-1.20.1/1.20.2's, already claimed by @builder-application.
<!-- SECTION:NOTES:END -->
