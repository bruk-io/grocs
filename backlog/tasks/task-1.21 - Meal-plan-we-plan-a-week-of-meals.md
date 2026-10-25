---
id: TASK-1.21
title: 'Meal plan: we plan a week of meals'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-25 01:14'
labels:
  - size-3
  - slice
  - finish-moved
milestone: m-2
dependencies:
  - TASK-1.20
modified_files:
  - packages/core/src/model/meal.ts
  - packages/core/src/merge/meal-merge.ts
  - packages/core/src/schema/meal-doc.ts
  - packages/core/src/index.ts
  - packages/ports/src/sync-store/port.ts
  - packages/ports/src/sync-store/fake.ts
  - packages/ports/src/sync-store/contract.ts
  - packages/application/src/commands/add-meal.ts
  - packages/application/src/commands/edit-meal.ts
  - packages/application/src/commands/remove-meal.ts
  - packages/application/src/commands/move-meal.ts
  - packages/application/src/queries/watch-week-meals.ts
  - packages/application/src/index.ts
  - packages/providers-firebase/src/firestore-sync-store.ts
  - packages/providers-memory/src/memory-sync-store.ts
  - firebase/firestore.rules
  - firebase/firestore.rules.test.ts
  - packages/ui/src/templates/MealFormTemplate.tsx
  - apps/mobile/src/composition/compose-app.ts
  - apps/mobile/src/screens/PlanScreen.tsx
  - apps/mobile/src/screens/AddMealScreen.tsx
  - apps/mobile/src/screens/GroceriesScreen.tsx
  - apps/mobile/src/screens/QuickAddScreen.tsx
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on the kitchen slice. Cites R5, R6, R7, R8.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Either of us adds meals to any day of this week or a future one, more than one on a day, in the order added
- [x] #2 A meal is a name and an optional link, nothing else
- [ ] #3 We can rename, relink and remove meals, and move between weeks
- [x] #4 Removing a meal never deletes grocery items
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
Meals follow the exact same shape as items (R18-R20: field-level LWW, permanent tombstone deletes), not Kitchen's Cloud-Function-transaction shape — a meal is plain same-kitchen CRUD with no cross-kitchen lookup problem, so it belongs on the existing SyncStore port (the kitchen's shared data) alongside items, not a new gateway.

1. Core (layer-core, TASK-1.21.1): packages/core/src/model/meal.ts - Meal {id, weekId: Stamped<string> (so a move restamps it), name: Stamped<string>, link: Stamped<string|null>, addedBy, createdAt, deleted: Stamp|null}, mirroring item.ts. createMeal/renameMeal/relinkMeal/moveMeal/removeMeal. packages/core/src/merge/meal-merge.ts: mergeMeal mirroring mergeItem.ts exactly (field-wise LWW, deleted wins permanently). packages/core/src/schema/meal-doc.ts: MEAL_SCHEMA_VERSION, encodeMeal/decodeMeal mirroring item-doc.ts. Exported from packages/core/src/index.ts. This is the frozen contract the rest of the slice builds on.
2. Ports (layer-ports, TASK-1.21.2, after core lands): extend packages/ports/src/sync-store/port.ts's SyncStore with mergeMeal(kitchenId, meal), getMeals(kitchenId, weekId), watchMeals(kitchenId, weekId, onMeals, onError) - same shape as the item methods. Update the fake (sync-store/fake.ts) and add contract tests (sync-store/contract.ts) covering create, rename, relink, move between weeks, remove (tombstone), and a concurrent-edit merge case.
3. Once the contract (core + ports) is reviewed and frozen, in parallel, each in its own worktree:
   - Application (layer-application, TASK-1.21.3): packages/application/src/commands/add-meal.ts, edit-meal.ts (rename+relink together, matching AddMealScreen's single form), remove-meal.ts, move-meal.ts, and a watchWeekMeals query mirroring watch-week-items.ts. Exported from packages/application/src/index.ts and registered in commandHandlers.
   - Providers (layer-providers, TASK-1.21.4): packages/providers-firebase/src/firestore-sync-store.ts gains mergeMeal/getMeals/watchMeals at kitchens/{kitchenId}/meals/{mealId}, mirroring the item methods' transaction pattern. packages/providers-memory/src/memory-sync-store.ts gains the matching in-memory implementation. firebase/firestore.rules gains kitchens/{kitchenId}/meals/{mealId} rules mirroring items' member-only read/write, with allow/deny tests in firestore.rules.test.ts.
   - UI (layer-ui, TASK-1.21.5): packages/ui's MealFormTemplate currently has no destructive action - add a "Remove meal" action shown only when editing an existing meal (not when adding). Check MealPlanTemplate's onOpenMeal wiring supports reaching an edit form pre-filled with the tapped meal's current name/link. New/changed stories and visual baselines as needed.
4. App (layer-app, TASK-1.21.6, after all three land): apps/mobile's composition root (compose-app.ts) gains watchWeekMeals on the App facade. PlanScreen.tsx replaces its sample week/household with real watchWeekMeals data (household/member avatars stay sample for now - that is TASK-27's territory, already Done at the backend level per the board but not yet wired to this screen; out of scope here unless trivial). AddMealScreen.tsx wires onSubmit to dispatch(AddMeal) for a new meal or dispatch(EditMeal) when opened for an existing one (route gains an optional mealId param), plus the new Remove action to dispatch(RemoveMeal). GroceriesScreen's weekMeals and QuickAddScreen's meal chips switch from the sample `week` export to the real watchWeekMeals data for the current week.

### Risks
- Moving a meal between weeks (AC3) changes which watchMeals query result set it belongs to (partitioned by weekId) - the merge must still work if moved concurrently with another field edit; mergeMeal treats weekId as just another Stamped field, same as item's existing fields, so this falls out of the existing LWW approach rather than needing new machinery.
- GroceriesScreen and QuickAddScreen already read `week` from sample-data.ts for meal badges/chips; TASK-1.21.6 must switch both at once or the app shows two different meal lists in different places.
- Household/member avatars on PlanScreen (currently sample Alex/Sam) are a separate, already-Done backend capability (TASK-27) not yet wired to any screen; explicitly out of scope for this task unless the app builder finds it trivial to include, to avoid scope creep into a task this slice does not own.

### Proof
- Core: unit tests for createMeal/renameMeal/relinkMeal/moveMeal/removeMeal and mergeMeal (concurrent edits, tombstone permanence), mirroring item.test.ts/item-merge.test.ts.
- Ports: the extended sync-store contract suite passes against both the fake and (once providers land) the real Firestore and memory providers.
- Providers: emulator tests for the new SyncStore methods plus firestore.rules allow/deny tests for the meals subcollection.
- App: a route test proving add/rename/relink/remove/move each dispatch the right command and the Plan screen reflects a live watchWeekMeals subscription (mirroring GroceriesScreen's existing watchWeekItems test pattern). pnpm check, pnpm typecheck, pnpm test, pnpm test:emulator all green before each subtask closes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Oct 24, 2026 (orchestrator): TASK-1.21.1's original ACs omitted a per-day position on Meal, caught by reviewer-core before the contract froze - see TASK-1.21.1's notes for the full finding. Corrected shape for every downstream subtask: Meal.dayIndex: Stamped<number> (Monday = 0), moveMeal restamps weekId and dayIndex together. Also added: R6 link URL validation on createMeal/relinkMeal (Result<Meal, MealLinkError>, decodeMeal stays permissive), and a personal.ts redaction fix (item's shape needed a genuinely discriminating field, not just dayIndex's addition, since find() still matched item first otherwise).

Reviewer (closing TASK-1.21.6, Oct 24 2026): ticked AC2 and AC4 from verified evidence, and the slice stays open on AC1 and AC3.

AC2: packages/core/src/model/meal.ts:21-31 - a Meal carries name and an optional link as its only content; everything else is identity (id, addedBy, createdAt), placement (weekId, dayIndex) or the tombstone. AC4: proven end to end by apps/mobile/src/routes/meal-plan.route.test.tsx - removing a meal tombstones it and leaves the grocery list untouched.

AC1 needs week navigation to reach "a future one": no UI affordance exists on any screen. AC3 needs moving a meal between weeks: the MoveMeal command is built and tested at the application layer (TASK-1.21.3), but it has no UI entry point (TASK-51). Both are user-facing gaps, so the slice is not done even though all six subtasks are.
<!-- SECTION:NOTES:END -->
