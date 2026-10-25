---
id: TASK-1.21.8
title: >-
  MealPlanTemplate's header always says 'This week', even when viewing a
  different one
status: Done
assignee:
  - '@claude'
created_date: '2026-10-25 01:34'
updated_date: '2026-10-25 03:52'
labels:
  - layer-ui
  - size-1
dependencies:
  - TASK-1.21.7
modified_files:
  - packages/ui/src/templates/MealPlanTemplate.tsx
  - packages/ui/src/templates/MealPlanTemplate.stories.tsx
  - packages/ui/src/templates/MealPlanTemplate.behaviour.test.tsx
  - apps/mobile/src/screens/PlanScreen.tsx
parent_task_id: TASK-1.21
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by builder-app-1-21-7 while wiring week navigation (TASK-1.21.7): packages/ui/src/templates/MealPlanTemplate.tsx:34 hardcodes title="This week" regardless of which week weekLabel describes. Once PlanScreen lets a member navigate to a future or past week, the header will say 'This week' directly above a weekLabel reading 'Week of Oct 26' or similar - a direct contradiction, same class of bug as MealFormTemplate's earlier hardcoded title/loadingLabel fix (TASK-1.21.5).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 title is a caller-supplied prop (mirroring MealFormTemplate's own earlier fix), not hardcoded; PlanScreen passes 'This week' when viewing the current week and something that reads correctly otherwise (e.g. 'That week', or simply omitting the distinct header and relying on weekLabel alone - whichever the builder judges reads best, it is not a load-bearing design decision)
- [x] #2 A story/behaviour test covers both the current-week and a different-week state
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Delivers R7 (planning on the current or a future week) correctly - this is a UI-truthfulness fix uncovered by TASK-1.21.7's week navigation, not a new requirement.

### Order of work
1. In packages/ui/src/templates/MealPlanTemplate.tsx: add `title: string` to MealPlanTemplateProps (alongside weekLabel), with a one-line doc comment ("Shown above the week nav, such as 'This week' or 'That week'."). Destructure it in the component's parameter list and replace the hardcoded `title="This week"` (line 34) with `title={title}`.
2. In packages/ui/src/templates/MealPlanTemplate.stories.tsx: add `title: 'This week'` to meta.args (so the existing Week/OnPhone stories keep their current appearance unchanged). Add a new story `AnotherWeek` after `Week`: `{ ...Week, args: { ...Week.args, title: 'That week', weekLabel: 'Oct 26 - Nov 1' } }`, with a one-line doc comment ("Viewing a week that isn't the current one.").
3. In packages/ui/src/templates/MealPlanTemplate.behaviour.test.tsx, add one assertion covering both states: render `Week` and assert the heading reads "This week"; render `AnotherWeek` and assert it reads "That week" (use composeStories to pull both from the stories file, matching this file's existing pattern for other templates).
4. In apps/mobile/src/screens/PlanScreen.tsx, pass `title={weekOffset === 0 ? 'This week' : 'That week'}` to MealPlanTemplate (mirroring the two labels chosen in step 2, so the real app and the stories agree).
5. Run `pnpm --filter @grocs/ui test` and `pnpm --filter @grocs/ui typecheck`, then `pnpm test` (full suite, all four vitest projects) and `pnpm typecheck` repo-wide to confirm the PlanScreen.tsx change compiles and passes with the rest of the app.

### Risks
- Keep the wording simple ("This week" / "That week") rather than inventing a more elaborate scheme (e.g. "Next week" / "Last week" / "2 weeks ahead") - the AC explicitly says this isn't a load-bearing design decision, and a simple two-state label avoids a bigger design surface than this bug fix needs.

### Proof
- pnpm --filter @grocs/ui test and pnpm --filter @grocs/ui typecheck both green.
- Full pnpm test and pnpm typecheck green after the PlanScreen.tsx change.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
✅ Step 1: Added `title: string` prop to MealPlanTemplateProps with doc comment. Destructured in component and replaced hardcoded "This week" with `title={title}`.

✅ Step 2: Added `title: 'This week'` to meta.args in stories. Added AnotherWeek story with title='That week' and weekLabel='Oct 26 - Nov 1'.

✅ Step 3: Updated MealPlanTemplate.behaviour.test.tsx - imported AnotherWeek from composeStories and added test asserting both "This week" (Week story) and "That week" (AnotherWeek story) headings.

✅ Step 4: Updated PlanScreen.tsx to pass title={weekOffset === 0 ? 'This week' : 'That week'} to MealPlanTemplate.

✅ Step 5: All tests passed - pnpm test: 126 test files passed, 1651 tests passed. pnpm typecheck: no errors.

**Files modified:**
- packages/ui/src/templates/MealPlanTemplate.tsx
- packages/ui/src/templates/MealPlanTemplate.stories.tsx
- packages/ui/src/templates/MealPlanTemplate.behaviour.test.tsx
- apps/mobile/src/screens/PlanScreen.tsx

No repro: the defect was a hardcoded literal (title="This week" at MealPlanTemplate.tsx:34), confirmed directly from the pre-fix diff rather than a separate failing-test capture. The new behaviour-test assertion exercises both title states (Week -> 'This week', AnotherWeek -> 'That week') and only passes with the fix.

Reviewed directly (the dispatched reviewer-ui-1-21-8 went idle without ever filing a verdict). Both ACs verified: title is now a required caller-supplied prop (MealPlanTemplate.tsx), PlanScreen passes 'This week'/'That week' based on weekOffset, and the only other caller (the stories file) was updated to match. New AnotherWeek story plus a behaviour-test assertion cover both title states. Only production caller of MealPlanTemplate is PlanScreen.tsx, already updated, so nothing else needed a change. pnpm test (1651 tests), pnpm check and pnpm typecheck all green.
<!-- SECTION:NOTES:END -->
