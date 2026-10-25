---
id: DRAFT-23
title: 'UI: export MEAL_TONES so the app layer stops keeping its own copy'
status: Draft
assignee: []
created_date: '2026-10-25 00:45'
labels:
  - size-1
  - layer-ui
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
apps/mobile/src/screens/week-days.ts:10 declares its own MEAL_TONES array ('amber','sky','tomato','leaf','neutral') because @grocs/ui exports the MealTone type but not the array, even though packages/ui/src/atoms/meal-tone.ts already holds that const. Two copies of a palette drift: adding a tone in the UI layer silently never reaches the app's mealTone(id) hash, and the two layers would then colour the same meal differently.

Fix is one line: re-export the existing MEAL_TONES from packages/ui/src/index.ts, then delete the local copy and import it.

Acceptance criteria:
- packages/ui/src/index.ts re-exports the existing MEAL_TONES const alongside the MealTone type
- apps/mobile/src/screens/week-days.ts imports MEAL_TONES from @grocs/ui and keeps no local copy; mealTone's output for existing meal ids is unchanged

Found reviewing TASK-1.21.6. The app-layer builder could not do it itself, since it may not write packages/ui.
<!-- SECTION:DESCRIPTION:END -->
