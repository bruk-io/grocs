---
id: TASK-50
title: >-
  KitchenGateway emulator contract is order- and cross-run-fragile via a shared
  stranger-uid
status: To Do
assignee:
  - '@claude'
created_date: '2026-10-24 22:33'
updated_date: '2026-10-24 22:33'
labels:
  - layer-providers
  - size-2
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by reviewer-providers tonight (Oct 24, 2026) while reviewing TASK-1.21.4: a full emulator-project run intermittently fails packages/providers-server/src/kitchen-store.emulator.test.ts > 'finds nothing for someone with no kitchen yet' with a stale id returned instead of null. Root cause diagnosed, not guessed: 'stranger' is the fixed uid 'stranger-uid' (kitchen-store.emulator.test.ts:36), reused by every test in the gateway contract, run against a long-lived shared Firestore emulator that only firebase/firestore.rules.test.ts ever clears (clearFirestore(), line 28). vitest.config.ts:107-109 already documents the hazard and sets fileParallelism: false for it, but that only prevents concurrent runs within one process - it does not stop a membership doc left behind by stranger-uid in one test file from poisoning a later file's assertion, depending on where the clearing file lands in execution order. A second identical run on an unmodified tree passed clean (91/91), confirming this is non-deterministic, not a real regression in whatever change happens to be present when it's hit.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The KitchenGateway emulator contract either gives stranger a unique uid per test run (matching how other emulator suites avoid shared fixture state), or explicitly clears any state stranger-uid could have left before each run that depends on it reading as a stranger
- [ ] #2 The emulator project run is deterministic across repeated clean runs - no intermittent failures from cross-file state bleed
<!-- AC:END -->
