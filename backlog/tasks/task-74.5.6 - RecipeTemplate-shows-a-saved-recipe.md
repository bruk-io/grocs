---
id: TASK-74.5.6
title: RecipeTemplate shows a saved recipe
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-3
  - layer-ui
dependencies: []
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §16. A presentational template for a saved recipe: title, yield, source host, ingredient lines as written, and numbered steps. It has no servings stepper and no ticking (decision-16: no scaling). orch-retire-recipe-board removes the stale RecipeImport board, so no naming workaround is needed. It depends on no port, so it starts before the ports contract is reviewed (a recorded deviation). Visual baselines come from orch-visual-baselines. Covers TASK-74.5 AC#1 (seeing the title, ingredients, steps and yield).

Split key: ui-recipe-template. Layer: ui. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 templates/RecipeTemplate.tsx exports RecipeTemplateProps and RECIPETEMPLATE_STATES = ['rest','noYield','long'], with a story for each state
- [ ] #2 Any new atoms, molecules or organisms satisfy story-coverage (STATES list, a story per state, interactive states where required)
- [ ] #3 RecipeTemplate.behaviour.test.tsx drives onBack through composeStories and userEvent
- [ ] #4 Level-1 story and accessibility tests pass. At this commit, pnpm -s typecheck passes repo-wide and vitest --project ui passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Compose from TaskLayout, SubHeader and existing atoms.
2. Write the stories, then the behaviour test.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/ui/src/templates/RecipeTemplate.tsx
- packages/ui/src/templates/RecipeTemplate.stories.tsx
- packages/ui/src/templates/RecipeTemplate.behaviour.test.tsx
- packages/ui/src/index.ts
<!-- SECTION:PLAN:END -->
