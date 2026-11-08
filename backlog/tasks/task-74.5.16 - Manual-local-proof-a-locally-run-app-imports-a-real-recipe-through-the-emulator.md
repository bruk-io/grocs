---
id: TASK-74.5.16
title: >-
  Manual local proof: a locally run app imports a real recipe through the
  emulator
status: In Progress
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
- [ ] #1 TASK-74.5 notes record a dev build importing a real recipe URL: the recipe saved, the meal relinked, groceries added with the meal badge, the recipe view opened, Save afterwards keeping the recipe, and one error case shown, with screenshots or a description
- [ ] #2 pnpm check, pnpm typecheck, pnpm test and pnpm test:emulator all pass on main
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
