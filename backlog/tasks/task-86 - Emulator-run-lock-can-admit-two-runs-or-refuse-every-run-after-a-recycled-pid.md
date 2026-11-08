---
id: TASK-86
title: 'Emulator run lock can admit two runs, or refuse every run after a recycled pid'
status: In Progress
assignee: []
created_date: '2026-11-08 19:54'
updated_date: '2026-11-08 19:58'
labels:
  - providers
  - size-1
  - finish-moved
dependencies: []
modified_files:
  - tools/emulator-run-lock.ts
  - tools/emulator-run-lock.test.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found reviewing TASK-85, tools/emulator-run-lock.ts. Each case was driven through the real acquire with an in-memory LockFs; a multi-process filesystem stress was not run. (1) writeFileSync with flag wx creates the file and then writes it, so a second run reading in between sees an empty file, Number('') is 0, and it removes the live holder's lock and takes over. Both runs proceed, which is what the guard exists to prevent. (2) Stale takeover is check-then-remove: B reads a dead holder, A removes and recreates, B then removes A's fresh lock. Both get ok. Parallel agent starts make this reachable after a crash. (3) After a crash, if the pid is reused by a live process, or by the new run itself, every run is refused until that process exits or someone deletes the file, and the refusal names neither LOCK_PATH nor that recovery. The lock stores only a pid, so it cannot tell a reused pid from a real holder. Unit tests use an atomic in-memory lock and cover none of this.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Two runs starting together, on a free lock or a stale one, never both proceed, shown by a test that drives those interleavings
- [ ] #2 A lock whose pid now belongs to another program, or to the run itself, does not block runs indefinitely
- [ ] #3 The refusal names what holds the lock and how to find it
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Replace the file lock with a listening TCP port on 127.0.0.1:4498: listen is exclusive, and the kernel frees the port when the holder dies.
2. The refusal names the port, why the rule exists, and how to see the holder.

### Risks
- Something unrelated could hold port 4498; the refusal says how to find it, and it is outside the ports firebase.json uses.

### Proof
- Eight real processes starting together admit exactly one; a killed holder frees the lock at once; the live refusal against real emulators.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator. Eight-process test passed in 8 of 8 local runs. No repro: the race needs real concurrent timing on the unfixed lock, and that code no longer exists on this branch; the review that found it drove the interleavings by hand.

Correction, 2026-11-08: the note above saying the eight-process test 'passed in 8 of 8 local runs' was about a rename-based file lock and is withdrawn. That test then failed under pre-commit load, and working through it showed a real race: a run holding a stale read could rename a fresh lock aside, letting a third run in, so two runs both held it. The file lock was dropped for a listening port (see the plan). Finish moved: #3 asked the refusal to name 'the lock file and how to clear it', and there is no file or anything to clear now, so it names the port and how to see the holder.

Evidence for the port lock: pnpm test 2115 passed, lock tests included under that load; lock tests alone passed 3 of 3 runs; against real emulators a second run failed at once with 'Another emulator test run is using the emulators (it holds port 4498)', the first exited 0 with 51 tests passing, and the port was free afterwards; pnpm test:emulator 144 passed; pnpm check 16 passed; typecheck clean.
<!-- SECTION:NOTES:END -->
