---
id: TASK-63
title: Settings shows every kitchen as 'Our kitchen'
status: Done
assignee:
  - '@claude'
created_date: '2026-11-06 20:06'
updated_date: '2026-11-07 00:09'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-62 sign-in flow: SettingsScreen hardcodes kitchen="Our kitchen" with the comment 'the app has no read of the kitchen's name yet'. That read exists now (getKitchen, TASK-27). Alex's seed kitchen 'Home' shows as 'Our kitchen'. Once fixed, e2e/sign-in.yaml should assert 'alex@grocs.test · Home' instead of matching any kitchen name.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Settings shows the signed-in member's real kitchen name
- [x] #2 e2e/sign-in.yaml asserts the seed kitchen's name, Home
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06, branch feat/remove-sample-content (c66046b). Evidence: pnpm check (16 checks, incl. the new sample-data check, which flags the pre-change PlanScreen), typecheck, pnpm test (135 files, 1735 tests); route tests assert the real data and the absence of the sample; pnpm e2e --android emulator-5554 --ios 9EB5207C-C6E9-4EF9-807C-D5519575A9DB: 'e2e: every flow passed', including sign-in.yaml now asserting 'alex@grocs.test · Home'. SettingsScreen reads useMyKitchenInfo (findMyKitchen, then getKitchenInfo); the partner's real name replaces 'your partner' once there is one. e2e/sign-in.yaml asserts 'alex@grocs.test · Home' (AC2).

No repro: the bug is static content visible in the pre-change source, which I read at HEAD~1 (aa220b8~1): SettingsScreen.tsx line 30 hardcodes kitchen="Our kitchen". No failing test was committed before the fix. AC2 rests on the worker's recorded pnpm e2e run (device runs not repeatable in review) and on the committed sign-in.yaml line asserting 'alex@grocs.test · Home'.

Closed by review. Full check (record-check --tier full) passed, exit 0, at aa220b8, recorded on TASK-57 (one commit covers all four); nothing reformatted. AC1: route test asserts 'u1@grocs.test · Home'. AC2: committed sign-in.yaml asserts 'alex@grocs.test · Home'; the passing device run is the worker's recorded pnpm e2e, not repeated here. Finding (low, not filed): while the kitchen loads Settings shows an empty kitchen name.
<!-- SECTION:NOTES:END -->
