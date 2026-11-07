---
id: TASK-74.7
title: Kitchen recipes are stored and synced
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 01:09'
labels:
  - size-3
  - core
dependencies:
  - TASK-74.2
  - TASK-74.3
parent_task_id: TASK-74
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-16 makes an imported recipe a kitchen-wide record at kitchens/{kitchenId}/recipes/{recipeId}, found from a meal by its link. This is the storage and sync half, split out of TASK-74.5 so that task covers only the import flow and screens.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 recipe-doc.ts defines RECIPE_SCHEMA_VERSION 1 with encode and decode, and its personal fields (title, sourceUrl, ingredient lines and items, steps) are redacted from logs (R36)
- [ ] #2 recipe-merge.ts merges two copies of a recipe keeping the earlier createdAt, a delete always wins, and property tests show order and repetition don't change the result
- [ ] #3 SyncStore has mergeRecipe, getRecipes and watchRecipes, covered by its contract suite and implemented by the fake, the Firestore provider and the memory provider
- [ ] #4 firestore.rules tests show a member can read and write their kitchen's recipes and a non-member cannot
<!-- AC:END -->
