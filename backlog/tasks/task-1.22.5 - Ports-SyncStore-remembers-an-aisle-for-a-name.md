---
id: TASK-1.22.5
title: 'Ports: SyncStore remembers an aisle for a name'
status: In Progress
assignee:
  - '@builder-ports'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 20:40'
labels:
  - layer-ports
  - size-2
dependencies:
  - TASK-1.22.4
modified_files:
  - packages/ports/src/sync-store/port.ts
  - packages/ports/src/sync-store/fake.ts
  - packages/ports/src/sync-store/contract.ts
  - packages/ports/src/sync-store/fake.test.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R11, R14. See TASK-1.22's slice contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 SyncStore has rememberAisle and aisleFor, and the fake and contract suite cover a later stamp winning, an older stamp not overwriting, and an unknown name reading null
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add rememberAisle(kitchenId, nameKey, aisle: Stamped<string>) and aisleFor(kitchenId, nameKey): Promise<string | null> to the SyncStore port, documented by intent (R11, R14), not by Firestore vocabulary.
2. Implement both in InMemorySyncStore: a Map<string, Stamped<string>> keyed by kitchenId/nameKey; rememberAisle merges with mergeStamped so a later stamp wins and the same or an older stamp changes nothing; aisleFor reads the stored value or null.
3. Add syncStoreAisleContract in contract.ts, kept separate (like the meal/recipe contracts) so a provider without aisle memory yet keeps passing the rest: unknown name reads null, remembering then reading back, a later stamp winning, an older stamp arriving after a newer one not overwriting it, and the same stamp twice changing nothing.
4. Wire syncStoreAisleContract into fake.test.ts against InMemorySyncStore, and export it (plus the new AisleMemoryStore type) from test-support.ts (@grocs/ports/testing), same as the other contract suites, so TASK-1.22.6 can import it.
### Risks
- Adding rememberAisle/aisleFor as required methods on SyncStore would leave FirestoreSyncStore and MemorySyncStore (providers) failing `pnpm typecheck` until TASK-1.22.6 implements them there, and the pre-commit hook runs full typecheck. Resolved by declaring both methods optional on the interface for now, with a doc comment naming TASK-1.22.6 and the ports follow-up that makes them required once both providers implement them. The contract suite itself still demands the real (required) shape via a local AisleMemoryStore = SyncStore & Required<Pick<SyncStore, 'rememberAisle' | 'aisleFor'>> type, so nothing tests against the weaker optional signature.
- Because the methods are optional until TASK-1.22.6 lands, TASK-1.22.7 (application) will otherwise have to write `store.aisleFor?.(...)`; noted for the orchestrator so a ports follow-up to drop the `?` is queued after 1.22.6, since the application-layer builder cannot edit packages/ports itself.
### Proof
- pnpm exec vitest run --project unit packages/ports: 7 files, 74 tests passed (up from 73; the new "same stamp twice" case added).
- pnpm -s typecheck: clean repo-wide (the optional-method step avoids the provider/application fallout a required signature would have caused).
- pnpm check: 16 checks passed.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented rememberAisle(kitchenId, nameKey, aisle: Stamped<string>) and aisleFor(kitchenId, nameKey): Promise<string | null> on SyncStore (R11, R14), InMemorySyncStore, a new syncStoreAisleContract in contract.ts, and wired both into fake.test.ts and test-support.ts (@grocs/ports/testing) export.

Both methods are declared optional (`rememberAisle?`, `aisleFor?`) on the SyncStore interface for now, each with a doc comment naming TASK-1.22.6. A required signature would have failed `pnpm typecheck` on FirestoreSyncStore and MemorySyncStore (providers), which don't implement them yet, and the pre-commit hook runs full typecheck - exactly the fallout the task description anticipated. The contract suite is not weakened by this: syncStoreAisleContract's `make` is typed to return an `AisleMemoryStoreSubject` whose store is `SyncStore & Required<Pick<SyncStore, 'rememberAisle' | 'aisleFor'>>`, so it still demands the real, required shape; InMemorySyncStore satisfies it structurally because both methods are implemented (not optional) on the class.

Follow-up for the orchestrator to queue: once TASK-1.22.6 gives both providers an implementation, a small ports follow-up should drop the `?` and make rememberAisle/aisleFor required on SyncStore again. Until then, TASK-1.22.7 (application) will need `store.aisleFor?.(...)` / a null-check, since the application-layer agent cannot edit packages/ports itself to remove the optionality.

`pnpm exec vitest run --project unit packages/ports`:
```
 Test Files  7 passed (7)
      Tests  74 passed (74)
```

`pnpm -s typecheck`: clean, no output (exit 0), repo-wide including providers/application/apps.

`pnpm check`:
```
checks passed (16 checks, all mode, 1364 ms)
```
<!-- SECTION:NOTES:END -->
