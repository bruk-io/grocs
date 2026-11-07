---
id: TASK-74.5.4
title: MemoryRecipeImporter for the demo build
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-2
  - layer-providers
dependencies:
  - TASK-74.5.3
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §14 (the importer half). Decision-12's demo build needs a RecipeImporter once Deps carries one. A new class breaks nothing, so it commits on its own, but its contract test must be in the same commit, because provider-runs-contract fires as soon as `implements RecipeImporter` exists. Covers TASK-74.5's demo wiring.

Split key: providers-memory-importer. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 memory-recipe-importer.ts exports MemoryRecipeImporter, which follows the fake's outcome rules and is exported from providers-memory/src/index.ts
- [ ] #2 memory-recipe-importer.test.ts runs recipeImporterContract with recipe.invalid URLs, in the same commit
- [ ] #3 It imports nothing from providers-firebase or providers-server and does no network I/O. At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/providers- passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write the importer and run its contract in one commit.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-memory/src/memory-recipe-importer.ts
- packages/providers-memory/src/memory-recipe-importer.test.ts
- packages/providers-memory/src/index.ts
<!-- SECTION:PLAN:END -->
