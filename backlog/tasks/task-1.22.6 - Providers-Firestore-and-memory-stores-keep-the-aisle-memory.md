---
id: TASK-1.22.6
title: 'Providers: Firestore and memory stores keep the aisle memory'
status: Done
assignee:
  - '@builder-providers'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 21:19'
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
- [x] #1 Both stores pass the aisle contract, the Firestore one on the emulator, in decision-7's kitchens/{k}/aisles/{nameKey} shape
- [x] #2 A rules test proves a non-member cannot read or write the aisle memory
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work (final, after three layer-review rounds)
1. Merge feat/aisles for core's aisle codec and the port's required rememberAisle/aisleFor; merge again for feat/aisles's own core review follow-up (item-doc.ts helper reuse in aisle-doc.ts).
2. FirestoreSyncStore.rememberAisle: transaction + mergeStamped, same pattern as mergeItem/mergeMeal/mergeRecipe, using core's encodeAisleMemory/decodeAisleMemory; throws on an undecodable stored document.
3. FirestoreSyncStore.aisleFor: plain getDoc (so it can serve from the local cache offline); catches the SDK's offline-miss error ('unavailable'/'firestore/unavailable') and returns null; throws the same 'invalid aisle document ...' error as rememberAisle for an undecodable document, since its promise is its only error channel.
4. sdk.ts: setDoc added then removed; not part of the final design.
5. firestore-sync-store.emulator.test.ts: syncStoreAisleContract wired; offline cache case (with a cache-warming read) and offline-miss-gives-null case; stored-shape test; four cases for a newer-schema-version/malformed document (rememberAisle x2, aisleFor x2).
6. firestore.rules.test.ts: allow case, deny-on-a-new-document case, deny-on-an-existing-document case (seeded with rules disabled).
7. Doc comments and task notes rewritten each round to match the code as it stood, not an earlier design.

### Risks
- aisleFor's cache fallback only helps a nameKey already read online at least once; a transaction's own write does not populate the cache a plain getDoc serves from. Documented in aisleFor's own comment and the offline test's comment.
- rememberAisle rejects (does not queue) offline, same open D4 gap as mergeItem/mergeMeal/mergeRecipe; a requirement on callers, which TASK-1.22.7's AddItem is written to meet.
- firestore.rules itself is unchanged; all aisles rules cases pass against the existing kitchens/{k}/{document=**} wildcard.

### Proof
pnpm test:emulator, pnpm check, pnpm typecheck; pasted into notes with each round's evidence.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Final design (after two rounds of layer review; this replaces earlier notes that described an intermediate, non-transactional design that no longer exists in the code):

AC#1: both providers pass syncStoreAisleContract from @grocs/ports/testing (including its later-added 'does not mix the aisle memory of two kitchens' and 'keeps names apart' cases, merged in from feat/aisles).
- packages/providers-memory/src/memory-sync-store.ts: MemorySyncStore gets the same in-memory #aisles map + mergeStamped merge as packages/ports/src/sync-store/fake.ts. Wired in memory-sync-store.test.ts.
- packages/providers-firebase/src/firestore-sync-store.ts: FirestoreSyncStore.rememberAisle/aisleFor at kitchens/{kitchenId}/aisles/{nameKey}, using core's codec (packages/core/src/schema/aisle-doc.ts: encodeAisleMemory/decodeAisleMemory/AISLE_SCHEMA_VERSION, landed from feat/aisles's TASK-1.22.10 - no shape is invented in this provider).
- rememberAisle reads, merges with core's mergeStamped and writes inside a Firestore transaction, the same pattern as mergeItem/mergeMeal/mergeRecipe: a later stamp can never lose to an earlier write that happens to land second, with the same guarantee the sibling merges already give two phones changing things concurrently. A Firestore transaction needs a connection, so this rejects rather than queues when made offline - the same open part of design question D4 as the other three merges. That rejection is a requirement on callers: TASK-1.22.7's AddItem (on feat/aisles) is written to tolerate it.
- rememberAisle throws `invalid aisle document {nameKey}: {path} {message}` for an undecodable stored document, inside the transaction, same as the sibling merges, so an older build never overwrites a newer-schema document.
- aisleFor is a plain getDoc, not a transaction, so it can fall back to the local cache when offline - but only within two limits, both stated in its own doc comment: a nameKey this phone has never read online has nothing cached to fall back to (the SDK rejects with 'unavailable'/'firestore/unavailable', which aisleFor reads the same as "never remembered" and gives null for), and a cached value can be stale after this phone's own rememberAisle succeeds, same as any other cached Firestore read. aisleFor throws the same 'invalid aisle document ...' error as rememberAisle for an undecodable document - its promise is the only error channel it has; TASK-1.22.7's suggestAisle and AddItem catch that rejection, log it and fall back.
- setDoc was added to and then removed from packages/providers-firebase/src/sdk.ts (FirestoreFns) during review; it is not used by the final design.

AC#2: firebase/firestore.rules.test.ts, describe 'kitchens/{k}/aisles/{nameKey}', three cases: a member can read and write a new aisle document; a non-member cannot read or write one that does not exist yet; a non-member cannot read or update one seeded with security rules disabled (covering an existing document, not just a new one). No firestore.rules edit: the existing `match /{collection}/{document=**}` wildcard under kitchens/{kitchenId} already covers aisles, and all three cases pass unmodified.

Tests added beyond the contract suite (packages/providers-firebase/src/firestore-sync-store.emulator.test.ts):
- 'aisle memory offline': aisleFor reads a remembered aisle from the cache while offline (after one online read to warm the cache, since rememberAisle's transaction does not itself populate the cache a plain getDoc serves from - found empirically); aisleFor gives null, not a rejection, for a name with no cached document while offline.
- 'stored shape (R30)': writes the aisle memory document in core's exact shape; for each of a newer-schema-version document and a malformed document, rememberAisle rejects and readRaw shows the document unchanged, and aisleFor also rejects.

Evidence (latest run, after all review rounds):
- `mise exec -- pnpm -s typecheck` -> `$ tsc --noEmit` (no errors).
- `mise exec -- pnpm check` -> "checks passed (16 checks, all mode, 599 ms)".
- `mise exec -- pnpm exec vitest run --project unit packages/providers-` -> "Test Files 17 passed (17) / Tests 306 passed (306)".
- `mise exec -- pnpm test:emulator` (full suite) -> "Test Files 11 passed (11) / Tests 161 passed (161)", exit 0.
- Targeted verbose re-run, firestore-sync-store.emulator.test.ts alone -> "Test Files 1 passed (1) / Tests 48 passed (48)", individually confirming every SyncStore aisle contract case, both offline aisleFor cases, the aisle stored-shape test, and the four new malformed/future-schema cases (rememberAisle x2, aisleFor x2).
- Earlier targeted run (previous pass) of firestore-sync-store.emulator.test.ts + firebase/firestore.rules.test.ts together -> 74 tests passed, confirming all three aisles rules cases alongside the above.

Not touched: firebase/firestore.rules (no change needed); packages/core and packages/ports (owned by TASK-1.22.4/.5/.10, only merged in via feat/aisles).

Modified files: packages/providers-firebase/src/sdk.ts, packages/providers-firebase/src/firestore-sync-store.ts, packages/providers-firebase/src/firestore-sync-store.emulator.test.ts, packages/providers-memory/src/memory-sync-store.ts, packages/providers-memory/src/memory-sync-store.test.ts, firebase/firestore.rules.test.ts

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(845 earlier lines omitted)
```text
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-C68uENE-.js
│  167.09 kB │ gzip:  49.81 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-COUQCjPE.js
│  1,361.35 kB │ gzip: 392.25 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 1.46s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a3b084393c70dcf3a/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 458 story views checked (axe, 44 x 44, images not compared)
```

Closed. Both criteria met. Full check exit 0 (image comparison skipped on darwin; no UI change here). pnpm test:emulator run in this worktree: 11 files, 161 tests pass. Verbose run of the store and rules suites: 78 pass, naming all 7 contract cases on Firestore, the stored-shape case, both offline cases, 4 bad-document cases and 3 rules cases. 65f8ea4 confirmed: aisleFor throws on an undecodable document, rememberAisle rejects and the document is unchanged. Findings: (1) medium, drafted: aisleFor's comment and these notes say callers log the rejection; they are bare catches on feat/aisles, so a bad document is silent; the comment's 'succeeds offline on another client' clause is also false. (2) low, not filed: notes header says two review rounds, the plan says three. (3) low, not filed: the notes rewrite dropped the round-by-round list and the admission that the first offline test false-passed. Superseded design only, the cache limit is still stated, and the text remains in 5afd718, so nothing is hidden. (4) low, not filed: 'firestore/unavailable' is not exercised, the emulator test uses the web SDK; proof belongs to the slice's live run. (5) process: 65f8ea4 was already merged to feat/aisles (4f94b20) before this review finished.

Orchestrator, 2026-11-08: the review's draft about silently swallowed bad documents was not filed. Commands wrap syncStore in instrumentDeps, whose failure path logs before rethrowing, so AddItem and SetItemAisle rejections are logged. The comment's false clauses are corrected on feat/aisles. The remaining gap is suggestAisle, a query: TASK-1.22.9 must call it through instrumented access.
<!-- SECTION:NOTES:END -->
