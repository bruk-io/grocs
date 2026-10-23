---
id: TASK-47
title: The join code field gets focus back after a rejection
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 20:31'
updated_date: '2026-10-23 01:16'
labels:
  - size-2
  - layer-ui
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Moved out of TASK-21's criterion by the orchestrator. InviteRetryTemplate disables its field while a code is checked, which drops focus on the web (and dismisses the keyboard on a phone), so after a rejection the person has to tap the field again. The template has no way to give the field focus back.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 After a rejection the code field has focus again, shown by a behaviour test
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Sized 2 rather than 1 on acceptance (2026-10-22): whether TextField can take focus from its parent (a forwarded ref or a prop) is not yet known.

Plan (philosophy:plan-change): TextField and LabelledField gain an optional inputRef prop (TextFieldHandle type); InviteRetryTemplate holds the ref and focuses the field in an effect when checking goes true to false. Modified files: packages/ui/src/atoms/TextField.tsx, packages/ui/src/molecules/LabelledField.tsx, packages/ui/src/templates/InviteRetryTemplate.tsx, packages/ui/src/templates/InviteRetryTemplate.behaviour.test.tsx.

Builder report (builder-ui, commit 54a5817): Done. Behaviour test 'gives the code field focus back once a check ends' (checking true then false, document.activeElement is the field). Evidence: pnpm typecheck clean; pnpm check clean; pnpm test 117 files / 1546 tests pass; pnpm --filter @grocs/ui visual: 398 views, 398 images compared, no baseline changed. App: JoinInviteScreen needs nothing new; it already passes checking={busy}, so focus returns when any check ends. Status and criteria untouched.
<!-- SECTION:NOTES:END -->
