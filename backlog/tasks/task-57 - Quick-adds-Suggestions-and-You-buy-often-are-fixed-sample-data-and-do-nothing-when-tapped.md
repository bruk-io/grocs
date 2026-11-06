---
id: TASK-57
title: >-
  Quick add's Suggestions and You buy often are fixed sample data and do nothing
  when tapped
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 19:50'
updated_date: '2026-11-06 23:48'
labels:
  - size-2
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in the 2026-11-06 device sweep. QuickAddScreen passes suggestions and oftenBought from src/sample/sample-data.ts, so every user sees Eggs, Egg noodles, Eggplant and Bananas, Limes, ... whatever they type or buy, and it passes neither onAddSuggestion nor onAddFrequent to ItemPickerTemplate, so tapping one does nothing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Quick add shows no sample-data items in a real build
- [ ] #2 Every suggestion or frequent item it does show adds that item when tapped
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06, branch feat/remove-sample-content (c66046b). Evidence: pnpm check (16 checks, incl. the new sample-data check, which flags the pre-change PlanScreen), typecheck, pnpm test (135 files, 1735 tests); route tests assert the real data and the absence of the sample; pnpm e2e --android emulator-5554 --ios 9EB5207C-C6E9-4EF9-807C-D5519575A9DB: 'e2e: every flow passed', including sign-in.yaml now asserting 'alex@grocs.test · Home'. Quick add passes empty suggestion and frequent lists; ItemPickerTemplate hides both sections when empty. Nothing real feeds suggestions yet; building them is new work, not this bug.
<!-- SECTION:NOTES:END -->
