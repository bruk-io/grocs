---
id: TASK-74.5.8
title: Regenerate visual baselines for the new and changed templates
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-08 02:42'
labels:
  - size-1
  - orchestrator
dependencies:
  - TASK-74.5.6
  - TASK-74.5.7
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Visual baselines are generated only by the visual-baselines workflow on Linux (R65, decision-11). Hand edits fail the visual-baselines check.

Split key: orch-visual-baselines. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/ui/visual-baselines/ holds workflow-generated PNGs for every RecipeTemplate state and every MealFormTemplate state, reviewed by eye, and pnpm check visual-baselines passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Push the branch that holds both ui tasks.
2. Run the 'visual baselines' workflow (.github/workflows/visual-baselines.yml) on that branch, using the commands at the top of the file.
3. Download the uploaded baseline artifact.
4. Review each new and changed PNG against its story by eye.
5. Copy the PNGs and manifest.json into packages/ui/visual-baselines/ as the workflow instructs, run `pnpm check`, then commit locally (do not push).

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/ui/visual-baselines/*.png
- packages/ui/visual-baselines/manifest.json
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Pushed branch recipe-import-baselines (main at c9b6edc; origin/main not moved) and ran the visual baselines workflow: run 42439124508, success. Downloaded the artifact over packages/ui/visual-baselines/: 21 new PNGs (templates-recipe: rest, no-yield, long; templates-meal-form: with-import, importing, import-error, with-recipe; each at phone, fold-inner and fold-outer) plus manifest.json. No existing PNG changed. Reviewed by eye: recipe header, servings chip, source host, ingredients and numbered steps; long recipe grows without clipping; the import button's rest, 'Getting recipe' spinner and error states; the 'Saved recipe ... View recipe' row. pnpm check visual-baselines passes.
<!-- SECTION:NOTES:END -->
