---
id: TASK-10.2
title: Sample data and test accounts use a placeholder instead of Shazya's name
status: In Progress
assignee:
  - '@builder'
created_date: '2026-10-19 14:27'
updated_date: '2026-10-19 14:28'
labels:
  - size-2
dependencies: []
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Before the repo goes public (TASK-10), the app's sample data, seeded emulator accounts and the tests that assert on them stop using Shazya's name. Bruk chose to keep the board and git history as they are. Found by grep on Oct 19, 2026: apps/mobile/src/sample/sample-data.ts, apps/mobile/src/screens/HouseholdScreen.tsx, firebase/seed/data.ts, tools/emulators.ts, apps/mobile/src/composition/two-client.emulator.test.ts, apps/mobile/src/routes/screens.route.test.tsx, and any story or fixture under packages/ui that names her.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 No file outside backlog/ names Shazya (git grep -i shazya -- ':!backlog' is empty)
- [ ] #2 Tests assert the placeholder where they asserted her name, with no test removed or skipped, and pnpm check, typecheck, test and test:emulator pass
- [ ] #3 Any baseline that changes because a story showed her name is regenerated through visual:update and listed in the report
<!-- AC:END -->
