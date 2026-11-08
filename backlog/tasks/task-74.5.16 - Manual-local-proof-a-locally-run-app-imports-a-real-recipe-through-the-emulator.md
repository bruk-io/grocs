---
id: TASK-74.5.16
title: >-
  Manual local proof: a locally run app imports a real recipe through the
  emulator
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-08 04:21'
labels:
  - size-1
  - orchestrator
dependencies:
  - TASK-74.5.15
  - TASK-74.4.8
  - TASK-74.5.8
  - TASK-74.5.9
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-74.5 AC#6 and TASK-74 AC#13. This is a dev build on the emulators (native.ts connectEmulators). A live fetch is allowed in this manual run only. There is no deployment.

Split key: orch-proof-app. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 TASK-74.5 notes record a dev build importing a real recipe URL: the recipe saved, the meal relinked, groceries added with the meal badge, the recipe view opened, Save afterwards keeping the recipe, and one error case shown, with screenshots or a description
- [x] #2 pnpm check, pnpm typecheck, pnpm test and pnpm test:emulator all pass on main
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Run `pnpm emulators` from the repo root and wait for it to be ready.
2. Start the mobile dev build against the emulators (the default, with EXPO_PUBLIC_USE_EMULATORS unset), and sign in through grocs://dev-sign-in?as=alex.
3. On Plan, add a meal with a name, paste a real recipe URL from the fixtures README into 'Recipe link', and choose 'Get recipe and groceries'.
4. Confirm that the recipe screen shows the title, ingredients and steps, and that Groceries shows one item per ingredient with the meal badge.
5. Reopen the meal, tap Save, and confirm that 'View recipe' still shows.
6. Try a URL with no recipe and confirm the message and that nothing was saved.
7. Run pnpm check, pnpm typecheck, pnpm test and pnpm test:emulator, record everything in the TASK-74.5 notes with the backlog CLI, and stop the emulators.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- (none)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Closed by reviewer. AC#1 met: TASK-74.5 notes record the iOS dev build on the emulators importing budgetbytes basic-chili through the real importRecipe callable (ImportRecipe ok, 17 AddItem ok), recipe view with title/servings/ingredients/steps, meal relinked to the normalised URL, 17 groceries with the meal badge, Save afterwards keeping 'View recipe', and the allrecipes blocked error showing the message with nothing added; screenshots described (kept in scratchpad, not committed). AC#2 met: at 39457f7 pnpm check 16 passed, typecheck clean, pnpm test 2110 tests, pnpm test:emulator 144 tests; only board commits since. Findings: (1) deviation from plan step 3 - import done from the reopened meal because the raised action bar covers the import button with the keyboard open; explained in notes and already filed as a draft bug, no new task. (2) grocery names keep broken parentheses; already a draft. (3) minor: screenshots are not durable outside the session; the written description suffices for the AC. No new drafts filed.
<!-- SECTION:NOTES:END -->
