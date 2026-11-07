---
id: TASK-74.5.7
title: >-
  Meal form offers 'Get recipe and groceries', shows progress, errors and a
  saved recipe
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
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
- [ ] #1 MealFormTemplate has the added props. The import action is hidden when onImportRecipe is absent, is busy and disabled while importing, shows importError under the link field, and shows 'View recipe' when recipeTitle and onOpenRecipe are set
- [ ] #2 MEALFORMTEMPLATE_STATES gains 'importing', 'importError' and 'withRecipe', with stories
- [ ] #3 The MealFormTemplate behaviour test covers onImportRecipe and onOpenRecipe. At this commit, pnpm -s typecheck passes repo-wide and vitest --project ui passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add the props, then the stories, then the behaviour tests.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/ui/src/templates/MealFormTemplate.tsx
- packages/ui/src/templates/MealFormTemplate.stories.tsx
- packages/ui/src/templates/MealFormTemplate.behaviour.test.tsx
<!-- SECTION:PLAN:END -->
