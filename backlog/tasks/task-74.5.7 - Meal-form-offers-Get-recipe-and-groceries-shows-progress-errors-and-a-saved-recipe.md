---
id: TASK-74.5.7
title: >-
  Meal form offers 'Get recipe and groceries', shows progress, errors and a
  saved recipe
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:48'
labels:
  - size-2
  - layer-ui
dependencies: []
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §16. MealFormTemplate gains the props onImportRecipe, importing, importError, recipeTitle and onOpenRecipe, and the states importing, importError and withRecipe. The existing templates-meal-form-* baselines will change, and the orchestrator regenerates them through the workflow. Covers TASK-74.5 AC#1 (the paste-and-import affordance) and AC#3 (the error message).

Split key: ui-meal-form-import. Layer: ui. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 MealFormTemplate has the added props. The import action is hidden when onImportRecipe is absent, is busy and disabled while importing, shows importError under the link field, and shows 'View recipe' when recipeTitle and onOpenRecipe are set
- [x] #2 MEALFORMTEMPLATE_STATES gains 'importing', 'importError' and 'withRecipe', with stories
- [x] #3 The MealFormTemplate behaviour test covers onImportRecipe and onOpenRecipe. At this commit, pnpm -s typecheck passes repo-wide and vitest --project ui passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add the five props (onImportRecipe, importing, importError, recipeTitle, onOpenRecipe) to MealFormTemplate; render the 'Get recipe and groceries' Button (secondary, stretch, loading=importing) under the link field when onImportRecipe is set, route importError ahead of linkError into the link field's errorMessage, and render a 'Saved recipe: <title>' row with a 'View recipe' text button when recipeTitle and onOpenRecipe are both set.
2. Add 'importing', 'importError', 'withRecipe' to MEALFORMTEMPLATE_STATES and a story per state (WithImport as a base, Importing, ImportError, WithRecipe), reusing WithImport's link/onImportRecipe args.
3. Extend MealFormTemplate.behaviour.test.tsx: hidden without onImportRecipe, press reported, busy+disabled while importing, importError replaces the hint, View recipe shown only when both recipeTitle and onOpenRecipe are set and reports a press.

### Risks
Follow TASK-74's slice contract (§16) exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation). No risk found needing a contract change.

### Proof
Each acceptance criterion is shown by vitest --project ui (MealFormTemplate.behaviour.test.tsx) and pnpm -s typecheck, output recorded in the notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented per contract §16: MealFormTemplate gains onImportRecipe, importing, importError, recipeTitle, onOpenRecipe. The 'Get recipe and groceries' secondary Button shows under the link field when onImportRecipe is set, is busy+disabled via loading=importing, and importError takes the link field's errorMessage slot ahead of linkError. A 'Saved recipe: <title>' row with a 'View recipe' text button shows only when recipeTitle and onOpenRecipe are both set. MEALFORMTEMPLATE_STATES gained 'importing', 'importError', 'withRecipe' with stories WithImport (base)/Importing/ImportError/WithRecipe.

AC#1/#2/#3 proof:
$ mise exec -- pnpm exec vitest run --project ui MealFormTemplate
 Test Files  1 passed (1)
      Tests  14 passed (14)

$ mise exec -- pnpm exec vitest run --project ui
 Test Files  52 passed (52)
      Tests  979 passed (979)

$ mise exec -- pnpm -s typecheck
(clean, no errors)

$ mise exec -- pnpm check
checks passed (16 checks, all mode, 1462 ms)

Files changed: packages/ui/src/templates/MealFormTemplate.tsx, MealFormTemplate.stories.tsx, MealFormTemplate.behaviour.test.tsx. No contract change needed. Visual baselines are for TASK-74.5.8 (orchestrator) to regenerate.

Added the disabled-attribute assertion to the importing test (busy+disabled both asserted now, matching the pattern in the existing 'while removing' test). Re-ran: vitest --project ui MealFormTemplate.behaviour.test.tsx -> 15 tests passed; pnpm -s typecheck clean.

Two things recorded for the reviewer:
- Precedence when both importError and linkError are set: importError takes the link field's errorMessage slot (`importError ?? linkError`), silently suppressing the R6 validation message. Contract §16 lists only "message under the link field" and does not rank the two; this is my choice, not a contract requirement.
- The stories file also adds a non-state base story, WithImport (link + onImportRecipe only, no importing/importError/recipeTitle), that Importing/ImportError/WithRecipe extend. This means TASK-74.5.8 should expect four new templates-meal-form-* baseline sets (WithImport, Importing, ImportError, WithRecipe), not three. OnPhone is existing precedent for a story without a declared state.

Closed by reviewer. AC#1: props present (MealFormTemplate.tsx), behaviour tests cover hidden/press/busy+disabled/importError/View recipe. AC#2: MEALFORMTEMPLATE_STATES gains importing/importError/withRecipe with Importing/ImportError/WithRecipe stories. AC#3: vitest --project ui MealFormTemplate re-run by reviewer: 14 passed; orchestrator evidence at 6b10c7c: typecheck clean, pnpm test 2018 passed, pnpm check 16 passed. Findings (none filed): importError ?? linkError hides the R6 validation message when both set - low, worker's documented choice, contract silent; WithImport base story adds a fourth baseline set, noted for TASK-74.5.8; worker note says 15 tests, file runs 14 - cosmetic.
<!-- SECTION:NOTES:END -->
