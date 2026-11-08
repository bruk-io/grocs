---
id: TASK-41
title: The two-client sync budget fails under load
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 12:40'
updated_date: '2026-10-22 23:20'
labels:
  - testing
  - size-1
dependencies: []
modified_files:
  - apps/mobile/src/composition/two-client.emulator.test.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the TASK-1.39 review: with several agents running checks at once, the emulator two-client test took 4.7 s against its 3 s sync budget (R-cited in the test). It passes alone. Same class as TASK-1.42: a time budget that a loaded machine overruns, which teaches people to re-run red checks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The two-client test separates what it promises (an item reaches the other client) from how fast, so load cannot fail the first, and the speed budget is measured where it means something
- [x] #2 The decision on the speed budget is Bruk's and is recorded on the task
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In apps/mobile/src/composition/two-client.emulator.test.ts's 'shows an item added on one phone on the other within 3 seconds, every time' test: raise the eventually() call's deadline from SYNC_BUDGET_MS (3000) to a generous correctness-only deadline (15000 ms) across all 5 rounds, so machine contention can never fail the actual promise (the item arrives at all).
2. Move the hard SYNC_BUDGET_MS timing assertion (expect(performance.now() - started).toBeLessThan(SYNC_BUDGET_MS)) so it only runs for round 1, not every round - a single sanity check against a real regression in the fast path, not a flaky every-round gate under load. Keep the per-round eventually() wait (now at the generous deadline) for every round regardless.
3. Rename the test to reflect what it now asserts (it no longer promises every round lands within 3 s): 'shows every item added on one phone on the other, and the first one within 3 seconds'.

### Risks
This narrows what the test hard-asserts about speed (round 1 only, not every round) - approved by Bruk directly in chat as the explicit resolution to this draft's AC2 ('the decision on the speed budget is Bruk's').

### Proof
mise exec -- pnpm test:emulator passes; the test still fails if sync genuinely breaks (verified by temporarily breaking FirestoreSyncStore.watchItems or similar and confirming the test catches it, then reverting).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Bruk's decision in chat: keep the hard 3s assertion, but only correctness is load-sensitive. eventually()'s deadline raised from SYNC_BUDGET_MS to a new CORRECTNESS_DEADLINE_MS (15000) for every round; the hard SYNC_BUDGET_MS timing check now runs for round 1 only (a real regression gate against the fast path), not every round. Test renamed to match what it now asserts. Verified it still catches a real regression: temporarily made FirestoreSyncStore.watchItems report onItems([]) instead of the real items, ran pnpm test:emulator, confirmed the two-client test failed (and firestore-sync-store.emulator.test.ts's own test failed too, as expected), then reverted (git diff clean). pnpm check (14 checks), typecheck, test (116/1539), and test:emulator all pass.

No repro: a repro cycle was already performed and is documented in prose above (temporarily broke FirestoreSyncStore.watchItems to report onItems([]) instead of real items, ran pnpm test:emulator, confirmed both the two-client test and firestore-sync-store.emulator.test.ts's own test failed, then reverted - git diff clean). Not re-recorded via record-check's machine-captured format here to avoid a second live break/revert cycle against the emulator for work already verified and merged.

The two-client sync budget test no longer conflates correctness (every item eventually arrives) with speed (the first item within 3 seconds) under concurrent-agent load. Bruk's own decision in chat: keep the hard 3s assertion but make only correctness load-sensitive - implemented as a generous 15s deadline for the per-round eventually() wait, with the hard timing assertion narrowed to round 1 only. Repro cycle already documented in the notes. Never formally closed after merging; closing now.
<!-- SECTION:NOTES:END -->
