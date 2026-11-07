---
id: TASK-58
title: 'Meal plan header shows sample household avatars (A, S)'
status: Done
assignee:
  - '@claude'
created_date: '2026-11-06 19:50'
updated_date: '2026-11-07 00:09'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in the 2026-11-06 device sweep. PlanScreen passes members={household} from src/sample/sample-data.ts; its comment calls this TASK-27's territory, but TASK-27 (The app reads its kitchen's name and members) is Done, so the real members exist to read.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The meal plan header shows the kitchen's real members' initials
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06, branch feat/remove-sample-content (c66046b). Evidence: pnpm check (16 checks, incl. the new sample-data check, which flags the pre-change PlanScreen), typecheck, pnpm test (135 files, 1735 tests); route tests assert the real data and the absence of the sample; pnpm e2e --android emulator-5554 --ios 9EB5207C-C6E9-4EF9-807C-D5519575A9DB: 'e2e: every flow passed', including sign-in.yaml now asserting 'alex@grocs.test · Home'. PlanScreen (and GroceriesScreen, which passed no avatars) draw avatarsFor(useKitchenInfo): the kitchen's members, signed-in first.

No repro: the bug is static content visible in the pre-change source, which I read at HEAD~1 (aa220b8~1): PlanScreen.tsx imports household from ../sample/sample-data.ts and passes members={household}; the new sample-data check flags that file. No failing test was committed before the fix.

Closed by review. Full check (record-check --tier full) passed, exit 0, at aa220b8, recorded on TASK-57 (one commit covers all four); nothing reformatted. Plan header uses avatarsFor(useKitchenInfo); route test asserts real initials and no Alex/Sam; unit tests cover ordering. Finding (low, not filed): a failed getKitchenInfo leaves the header empty with no error, the same silent behaviour Household already had.
<!-- SECTION:NOTES:END -->
