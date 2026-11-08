---
id: TASK-85
title: >-
  KitchenGateway contract over Functions intermittently fails with not a member
  right after createKitchen
status: To Do
assignee: []
created_date: '2026-11-08 18:07'
updated_date: '2026-11-08 19:38'
labels:
  - providers
  - size-2
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
pnpm test:emulator failed once during the TASK-81 review (run started 13:00:04, 2026-11-08): in packages/providers-firebase/src/kitchen-gateway.emulator.test.ts, 'a cancelled invite is no longer offered and cannot be used' and 'refuses an invite once both members are in, so a third person never gets in (R3)' failed, 2 of 144 tests, with FirebaseError: not a member of this kitchen [403]. In each test the only earlier gateway calls that could have raised it are createKitchen, then inviteByEmail by the same owner. KitchenStore raises NotAMemberError when the kitchen document is absent or the caller is not a member, so one of those was true. Not reproduced: 8 consecutive project runs passed afterwards (2, then 6, each set on one emulator instance). The failing run came straight after pnpm check, typecheck and pnpm test in the full check chain; the passing runs were standalone, so load or Functions-emulator cold start is untested. Ruled out: file overlap, a timed run showed zero overlapping test files. Not cross-run state: the run was on a freshly started instance. Cause unknown. This matters because the failure turns the reviewer's full check red and stops the chain before check:release, build-storybook and visual. It also carries the determinism half of archived TASK-50 (criterion 2), which the fixed stranger uid change did not prove.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The cause of the intermittent 403 is identified and recorded
- [ ] #2 pnpm test:emulator passes repeatedly when run straight after pnpm test in the full check chain
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-08, cause found. firestore.rules.test.ts calls clearFirestore in beforeEach, which wipes the whole demo-grocs project. fileParallelism: false serialises files inside one vitest run only, not across two. During TASK-81's review several reviewers ran the emulator suite at once, and one ran it directly against another's live emulators (15, 12, then 8 failures with a changing set). Deliberate repro: a loop deleting the demo project's documents while kitchen-gateway.emulator.test.ts runs gives 'not a member of this kitchen [403]' across many tests, because KitchenStore raises NotAMemberError when the kitchen document is gone. Load ruled out: pnpm test && pnpm test:emulator passed 5 of 5 straight through on a quiet machine, 144 tests each. The timestamps cannot name which process did the wiping in the original run, so this is the confirmed mechanism with contention present in that window, not a captured trace. Fix: a second emulator-project run now fails at once with the reason instead of wiping the first.
<!-- SECTION:NOTES:END -->
