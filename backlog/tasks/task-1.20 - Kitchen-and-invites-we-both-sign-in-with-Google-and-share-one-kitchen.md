---
id: TASK-1.20
title: 'Kitchen and invites: we both sign in with Google and share one kitchen'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-20 03:20'
labels:
  - size-5
  - slice
milestone: m-2
dependencies:
  - TASK-1.4
  - TASK-1.9
  - TASK-1.15
  - TASK-1.18
  - TASK-1.33
modified_files:
  - packages/core/src/model/kitchen.ts
  - packages/core/src/model/invite.ts
  - packages/ports/src/kitchen-gateway/port.ts
  - packages/ports/src/kitchen-gateway/fake.ts
  - packages/ports/src/kitchen-gateway/contract.ts
  - packages/providers-server/src/kitchen-store.ts
  - apps/functions/src/index.ts
  - packages/providers-firebase/src/kitchen-gateway.ts
  - packages/providers-firebase/src/sdk.ts
  - packages/providers-memory/src/memory-kitchen-gateway.ts
  - firebase/firestore.rules
  - firebase/firestore.rules.test.ts
  - firebase.json
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on the skeleton, D4 and the Google sign-in spike. Cites R1, R2, R3, R4, R53.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 I sign in with Google on the Fold, create our kitchen and get an invite link and code
- [ ] #2 Shazya opens the link or enters the code on her iPhone and joins; a third person can't
- [ ] #3 A bad, expired or used invite shows an inline error where it was entered
- [ ] #4 Neither of us can read or write any other kitchen, enforced by security rules with allow and deny tests
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Core: Kitchen and invite domain model, pure (createKitchen, addMember, checkInvite, inviteCodeFromId).
2. Ports: packages/ports/src/kitchen-gateway (port, fake, contract suite) - the frozen contract.
3. Providers-server (new package) + apps/functions (new app): the real createKitchen/joinKitchen Cloud Functions, Admin SDK transactions calling core's decisions.
4. Providers-firebase: FirebaseKitchenGateway over httpsCallable; a FunctionsFns slice added to sdk.ts.
5. Providers-memory: MemoryKitchenGateway, for the demo build (decision-12).
6. firebase/firestore.rules: kitchen isolation allow/deny tests (AC4) - found and fixed a real bug along the way (a bare recursive wildcard also matched the kitchen doc itself, letting a member write it directly).
7. Not done: the application-layer commands (if any are even needed - GoogleSignIn's own precedent wires sign-in directly on the composition root, not through the dispatcher, since it produces no domain event; kitchen creation/join likely follows the same shape) and all app/UI wiring (apps/mobile screens, the Sign-in/Kitchen-setup/Invite-retry templates already built by the other session) - out of scope here per the explicit UI boundary this session is operating under.

### Risks
- Scope split deliberately along the UI boundary: everything here is testable and verified without any screen existing yet.
- The invite code's word list (mushroom names) and 1-day expiry are my own implementation calls, not separately specified anywhere; easy to change later, core-only.

### Proof
- 52 passing emulator tests across the fake, the Admin-SDK provider (including a concurrent-join race test and an expired-invite test), the real Cloud Functions round trip through httpsCallable, and the firestore.rules allow/deny suite.
- pnpm check, pnpm typecheck, pnpm test, pnpm test:emulator, pnpm check:demo, pnpm check:release all green.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Also waits on the layer agents (TASK-1.18) and declared checks (TASK-1.33), since decision-3 delivers slices through layer agents and reviewers record checks with record-check.

Backend built and verified end to end (commits 1a71352, 2df5fa2, 6ad64b8), independent of decision-7 (not yet accepted) since kitchen creation/joining is online-only, through Cloud Functions, never touching the offline activity/sync log. 52 emulator tests pass, including a real Cloud Functions round trip and a genuine security-rules bug found and fixed (a bare recursive wildcard in firestore.rules also matched the kitchen document itself, letting a member bypass 'creating and joining go through the functions' and write their kitchen directly).

What's left for AC1-3 to actually close: wiring onto a real screen (apps/mobile), which needs a KitchenGateway composition-root choice (Firebase vs memory, matching how AuthPort/SyncStore are already chosen) and connecting it to the already-built KitchenSetupTemplate/InviteRetryTemplate (built by the other session's TASK-1.37.x work). Deliberately left to whoever is doing app/UI wiring, per this session's explicit UI boundary. AC4 (security rules) is done.

Review by philosophy:reviewer (commits dfba127, 3a52db6) found and all fixed: an internal-error-message leak in apps/functions/src/index.ts (fixed, relying on onCall's own safe default instead of a broad catch); a real invite-code collision/guessability gap (3,400-code space with silent overwrite on collision - widened to ~340,000 codes with create()+retry instead of set()); two of five JoinRejectedReason values untested through the port's own contract suite (added a genuine 'already-member' case: the owner re-entering their own pending invite); and, found empirically while fixing the above, a live test-isolation bug where firestore.rules.test.ts's clearFirestore() wiped data out from under concurrently-running emulator test files (fixed: fileParallelism: false on the emulator vitest project, confirmed stable over two consecutive clean runs). Also added: a joinKitchen-unauthenticated test, MemoryKitchenGateway now takes an injected Clock/IdGenerator (matching FakeKitchenGateway) with a test proving it drives expiry, and allow/deny tests for inviteCodes/{code}.

Open design question the review raised, for whoever does the app/UI wiring (not resolved here - needs a human call, not mine to make): should KitchenGateway be called through packages/application's command dispatcher (R28 says 'only the application layer calls them'), or wired directly on the composition root the way GoogleSignIn already is (no domain event to dispatch)? Both are defensible; this is a real architecture decision, not a defect.

Oct 19, 2026 (orchestrator, cloud session): Bruk answered the open design question: kitchen create and join go through application commands (decision-13). The UI wiring is split into TASK-1.20.1 (application) and TASK-1.20.2 (app); the returning-member lookup is DRAFT-10 for the backend side. AC1 and AC2 still need real phones and the Google sign-in spike (TASK-1.15).
<!-- SECTION:NOTES:END -->
