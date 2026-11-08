---
id: TASK-1.22.6
title: 'Providers: Firestore and memory stores keep the aisle memory'
status: In Progress
assignee:
  - '@builder-providers'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 20:49'
labels:
  - layer-providers
  - size-2
dependencies:
  - TASK-1.22.5
modified_files:
  - packages/providers-firebase/src/sdk.ts
  - packages/providers-firebase/src/firestore-sync-store.ts
  - packages/providers-firebase/src/firestore-sync-store.emulator.test.ts
  - packages/providers-memory/src/memory-sync-store.ts
  - packages/providers-memory/src/memory-sync-store.test.ts
  - firebase/firestore.rules.test.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R11, R14. See TASK-1.22's slice contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Both stores pass the aisle contract, the Firestore one on the emulator, in decision-7's kitchens/{k}/aisles/{nameKey} shape
- [ ] #2 A rules test proves a non-member cannot read or write the aisle memory
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. packages/providers-firebase/src/sdk.ts: add setDoc(ref, data): Promise<void> to FirestoreFns (no write primitive besides runTransaction exists today, and decision-7 steers aisle memory away from transactions).
2. packages/providers-firebase/src/firestore-sync-store.ts: implement rememberAisle/aisleFor on FirestoreSyncStore. Read-merge-write (getDoc + mergeStamped + setDoc, no transaction) at kitchens/{k}/aisles/{nameKey}, document shape {schemaVersion, aisle: {v, at, by}} per decision-7. aisleFor calls getDoc and returns aisle.v or null; the SDK's own cache fallback when offline satisfies "must work offline from the cache" (no provider-side branching needed).
3. packages/providers-firebase/src/firestore-sync-store.emulator.test.ts: wire syncStoreAisleContract against the emulator.
4. packages/providers-memory/src/memory-sync-store.ts: add the same rememberAisle/aisleFor (in-memory map + mergeStamped), matching packages/ports/src/sync-store/fake.ts's existing implementation.
5. packages/providers-memory/src/memory-sync-store.test.ts: wire syncStoreAisleContract.
6. firebase/firestore.rules.test.ts: add a describe block for kitchens/{k}/aisles/{nameKey} proving a non-member cannot read or write it. Expect the existing kitchens/{kitchenId}/{document=**} wildcard rule to already cover this with no rules change; if it does not, stop and report rather than edit firestore.rules.

### Risks
- firestore.rules is normally the orchestrator's; I add only the aisles test there and say so, no rule edits unless the test proves otherwise (then I stop and report instead of editing).
- No transaction is used for rememberAisle, by design (decision-7's reasoning that transactions fail offline); the read-merge-write has a narrow race window if two writes to the same nameKey land between another client's read and write, but mergeStamped's later-wins and idempotent-on-same-stamp properties mean a lost race just needs the next read to re-fold, consistent with the port contract (no ordering guarantee beyond stamps).
- Port's rememberAisle/aisleFor are still marked optional on SyncStore until the orchestrator makes them required; I implement them as ordinary required methods on both provider classes per the task instructions.

### Proof
pnpm test:emulator, pnpm check, pnpm typecheck; paste key output into notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Merged feat/aisles twice: once for TASK-1.22.5's rememberAisle/aisleFor on the port plus its fake, and again mid-task for the review follow-up (7e63998) that added the 'does not mix the aisle memory of two kitchens' and 'keeps names apart' cases to syncStoreAisleContract; both pass unmodified since both providers key aisle memory by kitchenId/nameKey.

AC#1: both providers pass syncStoreAisleContract.
- packages/providers-memory/src/memory-sync-store.ts: MemorySyncStore gets the same in-memory #aisles map + mergeStamped merge as packages/ports/src/sync-store/fake.ts. Wired in memory-sync-store.test.ts.
- packages/providers-firebase/src/firestore-sync-store.ts: FirestoreSyncStore.rememberAisle/aisleFor at kitchens/{kitchenId}/aisles/{nameKey}, document shape {schemaVersion: 1, aisle: {v, at, by}} per decision-7. No codec for this lives in core (unlike item/meal/recipe docs); item-doc.ts's own comment says providers must never invent a shape, but a provider-layer worker cannot write packages/core, so the one-field translation is inlined in firestore-sync-store.ts with a named AISLE_MEMORY_SCHEMA_VERSION constant, flagged here as a boundary-forced choice rather than a provider quietly holding a rule - worth a follow-up to move it into packages/core/src/schema/ if/when decision-7's own schema module lands.
- No transaction: decision-7 found Firestore transactions fail offline, so rememberAisle does getDoc, merges locally with core's mergeStamped (so a later stamp wins, the same stamp twice no-ops), then setDoc - a plain write, not a transaction. This narrows but does not remove a race between two writers to the same nameKey landing between another client's read and write; mergeStamped's idempotent, later-wins properties mean a lost race just needs the next read/write to re-fold, matching the port's documented guarantee (no cross-write atomicity promised beyond stamps).
- Known limitation, not covered by any green check here: per decision-7's own citation of the 4.18 typings, `setDoc`'s promise "does not resolve until the document is successfully created to the remote backend", so `rememberAisle`'s `await this.#fs.setDoc(...)` hangs while offline, same as mergeItem/mergeMeal/mergeRecipe's existing transactions. AddItem (TASK-1.22.7) awaits rememberAisle. This is the same R16 gap decision-7 exists to close app-wide; not something a size-2 provider task should redesign, but the orchestrator should know it is still open for aisle memory specifically, same as for items/meals/recipes.
- aisleFor offline: proved directly with an emulator test using disableNetwork/enableNetwork on the web SDK (decision-7's own suggested pattern) - firestore-sync-store.emulator.test.ts, 'aisle memory offline': rememberAisle while online (which also warms the local cache via setDoc), then disableNetwork, then aisleFor resolves from the cache.

AC#2: firebase/firestore.rules.test.ts, new describe 'kitchens/{k}/aisles/{nameKey}' with both an allow (member reads/writes) and a deny (non-member fails both) case, matching the file's own stated convention (one succeed, one fail, per rule). No firestore.rules edit: the existing `match /{collection}/{document=**}` wildcard under kitchens/{kitchenId} already covers the new aisles subcollection, and both cases passed without any rule change.

Evidence:
- `mise exec -- pnpm -s typecheck` -> `$ tsc --noEmit` (no errors).
- `mise exec -- pnpm check` -> "checks passed (16 checks, all mode, 659 ms)".
- `mise exec -- pnpm exec vitest run --project unit packages/providers-` -> "Test Files 17 passed (17) / Tests 306 passed (306)".
- `mise exec -- pnpm test:emulator` (full suite) -> "Test Files 11 passed (11) / Tests 154 passed (154)", script exited 0.
- Targeted re-run for visibility, `firebase emulators:exec ... 'vitest run --project emulator --reporter=verbose packages/providers-firebase/src/firestore-sync-store.emulator.test.ts firebase/firestore.rules.test.ts'` -> "Test Files 2 passed (2) / Tests 71 passed (71)", including every 'SyncStore aisle contract' case (both providers via the shared suite names), the offline cache case, and both new aisles rules cases.

Not touched: firebase/firestore.rules (no change needed, confirmed by the passing allow/deny pair above); packages/core and packages/ports (owned by TASK-1.22.4/.5, only merged in via feat/aisles).
<!-- SECTION:NOTES:END -->
