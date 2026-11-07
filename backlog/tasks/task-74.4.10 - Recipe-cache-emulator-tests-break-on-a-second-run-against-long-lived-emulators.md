---
id: TASK-74.4.10
title: Recipe cache emulator tests break on a second run against long-lived emulators
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 04:50'
labels:
  - size-2
  - layer-providers
dependencies: []
parent_task_id: TASK-74.4
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
recipe-cache.emulator.test.ts uses fixed URLs (for example fsrc-failure-memory, fsrc-miss) in the shared top-level recipes, recipeSources and recipeFailures collections. In a fresh emulators:exec run that is fine, but against a long-lived pnpm emulators instance (how TASK-74.4.8's local proof runs) a second run finds the first run's docs: the failure-memory test's first import returns ok and fails, and the miss test silently becomes a cache hit. Two fixtures also store a recipe with ingredients: [], a shape importRecipe can never write. Found by reviewer-providers on TASK-74.4.6.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Each test in recipe-cache.emulator.test.ts uses URLs unique to the run as well as the test (or clears its keys first), and running the emulator project twice against one long-lived emulator instance passes both times
- [ ] #2 No fixture in that file stores a recipe with no ingredients or no steps
- [ ] #3 The providers unit tests, typecheck and pnpm test:emulator pass
<!-- AC:END -->
