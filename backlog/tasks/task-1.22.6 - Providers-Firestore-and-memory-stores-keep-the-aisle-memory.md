---
id: TASK-1.22.6
title: 'Providers: Firestore and memory stores keep the aisle memory'
status: In Progress
assignee:
  - '@builder-providers'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 21:05'
labels:
  - layer-providers
  - size-2
dependencies:
  - TASK-1.22.5
  - TASK-1.22.10
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
### Order of work (revised after layer review)
1. git merge --no-edit feat/aisles to pick up core's aisle codec (packages/core/src/schema/aisle-doc.ts: encodeAisleMemory, decodeAisleMemory, AISLE_SCHEMA_VERSION) and the port's rememberAisle/aisleFor made required.
2. packages/providers-firebase/src/firestore-sync-store.ts: replace the inline codec with core's encodeAisleMemory/decodeAisleMemory. rememberAisle now reads, merges with mergeStamped and writes inside runTransaction, the same pattern as mergeItem/mergeMeal/mergeRecipe (no plain setDoc write, so it rejects instead of queueing offline, same open D4 gap as the other three). aisleFor stays a plain getDoc (so it can fall back to the local cache offline) but now catches the SDK's "unavailable" error (web code 'unavailable', native 'firestore/unavailable') for a name absent from the cache and returns null, same as "never remembered"; an undecodable document also gives null (no onError channel exists on aisleFor to report it otherwise - noted, not solved, in these notes).
3. packages/providers-firebase/src/sdk.ts: remove setDoc from FirestoreFns (no longer used; rememberAisle is a transaction again).
4. packages/providers-firebase/src/firestore-sync-store.emulator.test.ts: add the stored-shape test (rememberAisle, then readRaw asserts {schemaVersion: 1, aisle: {v, at, by}}); add a second offline case (aisleFor on a never-remembered name while offline resolves null, not a rejection); fix the first offline case to warm the cache with an online aisleFor read first (a transaction's own write does not itself populate the cache a plain getDoc serves from - found empirically, previous version of this test false-passed on the old setDoc-based rememberAisle only).
5. firebase/firestore.rules.test.ts: add a case that seeds an aisle memory document with security rules disabled, then proves a non-member's read and update of that existing document are both denied (the existing deny case only covered a document that did not exist yet).
6. Correct every doc comment and note that described the old setDoc-based design (rememberAisle "queueing offline", aisleFor's "decision-7 spike" framing, the removed "never mistaken for never remembered" comment, this task's earlier "re-fold" sentence about a lost race under a non-transactional write).

### Risks
- A Firestore transaction read inside rememberAisle does not warm the local cache the way a plain getDoc/onSnapshot does; aisleFor's offline guarantee only holds for a nameKey that some plain read has already touched online. Documented in aisleFor's own doc comment and the offline test's comment; confirmed empirically (the original offline test failed until a warming read was added).
- rememberAisle now rejects rather than queues offline, same as mergeItem/mergeMeal/mergeRecipe; TASK-1.22.7's AddItem is expected to tolerate that per the coordinator, not something this task redesigns.
- firestore.rules itself is unchanged; both new rules cases (new document, existing document) pass against the existing kitchens/{k}/{document=**} wildcard.

### Proof
pnpm test:emulator, pnpm check, pnpm typecheck; pasted into notes.
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

Layer review follow-up (not approved first pass), addressed:

1. aisleFor now catches the SDK's offline-miss error (code 'unavailable' / 'firestore/unavailable') for a name absent from the local cache and returns null, same as "never remembered". New emulator case: 'aisleFor gives null, not a rejection, for a name with no cached document while offline'.
2. rememberAisle is back to runTransaction + mergeStamped, the same pattern as mergeItem/mergeMeal/mergeRecipe, so a later stamp cannot lose to an earlier write that happens to land second. setDoc removed from packages/providers-firebase/src/sdk.ts (no longer called anywhere). This means rememberAisle rejects rather than queues when made offline - the same open part of design question D4 as the other three merges. TASK-1.22.7 is expected to tolerate that per the coordinator's message; not solved here.
3. New test in the 'Firestore sync store: stored shape (R30)' block: rememberAisle, then readRaw on kitchens/{k}/aisles/milk, asserts the exact object {schemaVersion: 1, aisle: {v: 'dairy', at: 100, by: 'seed-alex'}}.
4. The inline codec is gone. firestore-sync-store.ts now imports encodeAisleMemory/decodeAisleMemory from @grocs/core (packages/core/src/schema/aisle-doc.ts, merged in from feat/aisles's TASK-1.22.10). rememberAisle throws on an undecodable stored document inside the transaction, same as the sibling merges ("invalid aisle document {nameKey}: ..."), so an older build never overwrites a newer-schema document. aisleFor has no onError channel (unlike watchItems), so an undecodable document there gives null with nowhere to report the problem - documented in the method's own comment and here, not solved.
5. Doc comments and this task's own notes corrected: the class-level comment, rememberAisle's and aisleFor's comments, and the offline test's comment no longer describe the old plain-getDoc/setDoc design or claim an unqualified cache fallback. The previous notes' "re-fold" sentence about a lost race under a non-transactional write no longer applies now that rememberAisle is transactional again (removed; a transaction gives the same two-phones-concurrently guarantee mergeItem/mergeMeal/mergeRecipe already have).
6. Found empirically while writing the offline test: rememberAisle's transaction does not by itself populate the local cache a plain getDoc reads from. The first offline case now does one online aisleFor read first to warm the cache (documented in both the test and aisleFor's own comment) - without that read, the original (pre-review) test was asserting against a doc that, it turns out, the SDK had not actually cached, and it only passed before because the old rememberAisle used a plain setDoc, which does populate the cache.
6b. firebase/firestore.rules.test.ts: added a case that seeds an aisle document with testEnv.withSecurityRulesDisabled first, then proves a non-member's getDoc and updateDoc against that existing document are both denied (the earlier deny case only exercised a document that did not exist yet).

Evidence (this pass):
- `mise exec -- pnpm -s typecheck` -> `$ tsc --noEmit` (no errors).
- `mise exec -- pnpm check` -> "checks passed (16 checks, all mode, 582 ms)".
- `mise exec -- pnpm exec vitest run --project unit packages/providers-` -> "Test Files 17 passed (17) / Tests 306 passed (306)".
- `mise exec -- pnpm test:emulator` (full suite) -> "Test Files 11 passed (11) / Tests 157 passed (157)", exit 0.
- Targeted verbose re-run, firestore-sync-store.emulator.test.ts + firebase/firestore.rules.test.ts -> "Test Files 2 passed (2) / Tests 74 passed (74)", individually confirming: every SyncStore aisle contract case, both offline aisleFor cases, the new aisle stored-shape test, and all three aisles rules cases (new-doc allow, new-doc deny, existing-doc deny).
<!-- SECTION:NOTES:END -->
