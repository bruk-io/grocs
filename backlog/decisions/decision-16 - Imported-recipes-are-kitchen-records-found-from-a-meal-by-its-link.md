---
id: decision-16
title: 'Imported recipes are kitchen records, found from a meal by its link'
date: '2026-11-07 01:08'
status: accepted
---
## Context

TASK-74 saves an imported recipe in the kitchen and adds all of its ingredients to the grocery list. The server returns a `ParsedRecipe` (decision-15). Each ingredient keeps its line as written, plus `quantity`, `unit` and `item`, and the app does not act on units yet.

What the kitchen holds today:
- A Meal has a name and an optional link, and "no other fields" (R6).
- A grocery Item has a name, a free-text amount, an aisle and meal badges (R9, R10).
- Adding an item whose normalised name matches one already on the week's list shows the combine prompt. Nothing merges silently (R12, R19).
- Meals and items sync through `SyncStore` with field-level last-write-wins and permanent deletes (R17 to R20). Their stored shapes are versioned in `packages/core/src/schema` (R30), with personal fields marked for log redaction (R36).
- Aisle suggestions are not built yet (TASK-57).

Bruk chose on Nov 7, 2026 that an imported recipe is its own record, not part of the meal.

## Decision

**The record.** A recipe is a kitchen-wide record, not tied to a week, stored at `kitchens/{kitchenId}/recipes/{recipeId}`.
- `recipeId` is the server's cache key for the recipe's normalised URL. The server returns it in `ParsedRecipe`, alongside `sourceUrl`, the normalised URL. Two members importing the same link therefore produce the same record, never two.
- The record holds the `ParsedRecipe` (title, yield, steps, ingredients, `sourceUrl`, image), plus `addedBy`, `createdAt` and `deleted`.
- Members don't edit recipe content in the first pass. The content is written once on import and never restamped. Only `deleted` changes.
- Merging two copies keeps the earlier `createdAt`, since the content is the same. A delete always wins (R20).

**Finding it from a meal.** No new meal field, so R6 holds.
- Importing from a meal sets the meal's link to the recipe's `sourceUrl`.
- A meal's recipe is the kitchen recipe whose `sourceUrl` equals the meal's link.
- A meal whose link already matches a saved recipe shows that recipe without calling the server again.
- Several meals, in any week, can share one recipe.

**Ingredients to grocery items.** Importing from a meal dispatches one `AddItem` per ingredient, for the meal's week and with the meal's badge (R10):
- `name`: the ingredient's `item`, or the whole line when the parser found no item.
- `amount`: the quantity and unit as they appear in the line (for example `½ cup`), or null when there are none. No conversion.
- `aisle`: the default (`other`) until aisle suggestions exist (TASK-57).
- Duplicates go through R12 as usual. An ingredient whose name matches an item already on the list gets the normal combine prompt, and nothing is merged silently.

**Storage and sync.**
- A new `recipe-doc.ts` in `packages/core/src/schema` defines `RECIPE_SCHEMA_VERSION = 1` with encode and decode functions, and `personal.ts` gets a `recipe` entry. Title, `sourceUrl`, ingredient lines, items and steps are marked personal (R36). They're public content, but they are what the kitchen chose to cook.
- A new `recipe-merge.ts` in `packages/core/src/merge` holds the merge rule above, with property tests (R46).
- `SyncStore` gets `mergeRecipe`, `getRecipes` and `watchRecipes` for the kitchen, with the fake, the contract suite, the Firestore provider and the memory provider (decision-12).
- `firebase/firestore.rules` already lets members read and write any subcollection of their own kitchen, so no new rule is needed. Allow and deny tests for `recipes` are added (R49).

Proposed by Claude on Nov 7, 2026, from Bruk's choice of a separate record. Accepted by Bruk on Nov 7, 2026.

## Consequences

- A kitchen keeps every recipe it has imported, which is the start of a recipe library. Browsing that library, or planning a meal from it, is not part of TASK-74. It can follow once recipes are stored.
- Because meals find their recipe by link, relinking a meal to another URL detaches the old recipe. That is the intended behaviour: the link is the meal's recipe.
- Deleting a recipe leaves its meals and grocery items alone (as R8 does for meals). The meal keeps its link, and importing again restores the recipe from the server cache.
- Storing and syncing recipes is its own piece of work across core, ports and three providers. It is split out of TASK-74.5 as its own task, which 74.5 then depends on.
- doc-1 gains a requirement for kitchen recipes, after R6 to R8, and R36's list of personal fields gains recipe content. That goes in the same doc-1 update as decision-15 (TASK-74.6).
- The top-level server cache collection is also called `recipes` (decision-15). The paths differ (`recipes/{key}` and `kitchens/{kitchenId}/recipes/{recipeId}`) and the ids are the same key, which is deliberate, but code must name which one it means.

## Amendments

- Amended 2026-11-07 during the TASK-74 split, with Bruk's agreement: recipeId is deterministic and R20 says a delete always wins, so a re-imported copy cannot clear a tombstone. ImportRecipe refuses with `recipe-deleted`. The consequence "importing again restores the recipe from the server cache" does not hold. R12's combine prompt is not built yet (TASK-1.26); until it is, imported duplicates are separate items. Written into the file by the orchestrator, because the backlog CLI cannot write a decision's body (TASK-74.4.1).
