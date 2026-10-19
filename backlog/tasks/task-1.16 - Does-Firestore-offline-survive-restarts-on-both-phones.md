---
id: TASK-1.16
title: Does Firestore offline survive restarts on both phones?
status: To Do
assignee:
  - '@bruk'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-19 12:50'
labels:
  - size-2
  - architecture
milestone: m-1
dependencies: []
references:
  - >-
    backlog/decisions/decision-7 -
    Sync-an-append-only-change-log-folded-in-core-ordered-by-a-hybrid-logical-clock.md
parent_task_id: TASK-1
type: spike
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Feeds D4 (R16, R20). Needs devices. Delivers an answer: whether queued writes and deletes survive an app restart offline with the native SDK, and what we must handle ourselves.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A batch committed in airplane mode shows in onSnapshot at once, with hasPendingWrites true (Android and iOS)
- [ ] #2 After the app is killed and relaunched offline, the batch is still shown and still pending (Android); after an iOS background kill too
- [ ] #3 On reconnection the batch reaches the server with no app code running, and the other phone gets it within 3 s
- [ ] #4 A batch the rules deny, sent before a restart, is dropped and the cache reverts, with nothing re-sending it forever
- [ ] #5 Relaunched offline for more than an hour (past the ID token's lifetime), auth restores the user and the queued writes go through once online
- [ ] #6 Measured: how quickly fromCache turns true and false when airplane mode is toggled (for R21)
- [ ] #7 Measured: each phone's clock offset from request.time, from a test write carrying serverTimestamp() beside stamp.at, with automatic time on, and what happens when it is off
- [ ] #8 Confirmed: every modular function the provider needs exists in the native module with the same call shape (writeBatch, doc, collection, query, where, orderBy, limit, onSnapshot with includeMetadataChanges, serverTimestamp)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Emulator probe (orchestrator, 2026-10-19), points 1 and 3 only - NOT a substitute for the device checks, which the emulator genuinely cannot show (killed-process persistence, real network timing, clock drift against request.time). Disposable script (firebase/scratch-probe.emulator.test.ts, not committed), web SDK against the Firestore emulator, authenticated as seed members.

Point 1 (batch committed offline shows in onSnapshot at once, with hasPendingWrites): confirmed. writeBatch().commit() must NOT be awaited while offline - decision-7's own cited SDK-typings evidence holds: awaiting it hung the test for the full 20s timeout with the network disabled. Once left unawaited, the local onSnapshot listener fired immediately (commitElapsedMs=0) with the document present and metadata.hasPendingWrites=true. This directly validates decision-7's append() design (fire-and-forget commit, no await).

Point 3 (on reconnection the batch reaches the server and a second client sees it): confirmed on the mechanism. A second, independently-authenticated client did NOT see the change while the writer stayed offline (sawBeforeReconnect=false). After calling enableNetwork() on the writer, the change reached the server and the second client's listener fired 335ms later - well under the 3s budget (R15). This is localhost-emulator latency, not real network latency, so it does not stand in for the spike's own 'within 3 s' check on real devices over real networks - it only confirms the propagation mechanism itself works end-to-end with the unawaited-commit pattern.

Not addressed by this probe, still needs the physical devices: process-kill persistence (#2), denied-write cleanup after a restart (#4), token-expiry recovery (#5), fromCache timing (#6), clock drift vs request.time (#7), and native-module call-shape parity (#8).
<!-- SECTION:NOTES:END -->

## Comments

<!-- COMMENTS:BEGIN -->
author: @claude
created: 2026-10-19 12:46

---

Rewrote the acceptance criteria into decision-7's exact 8-point spike checklist (its own 'Before this is accepted' section) so this is a runnable checklist rather than a vague prompt. Needs a development build with @react-native-firebase/firestore 26.4.0 against a dev Firebase project (the emulator cannot show device persistence behaviour) on the Pixel 10 Fold (Android 16) and the iPhone. Deferred until you're back at the devices - not blocking other work in the meantime. A narrow, throwaway emulator probe for the mechanism behind #1 and #3 (disableNetwork/enableNetwork timing on the web SDK) is being prepared separately and will land in this task's notes, but it cannot substitute for the on-device checks (#2, #4, #5, #6, #7, #8 are device-only by nature).

---
<!-- COMMENTS:END -->
