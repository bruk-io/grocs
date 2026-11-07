---
id: DRAFT-30
title: Add a recipe to a kitchen from a link
status: Draft
assignee:
  - '@bruk'
created_date: '2026-11-07 00:38'
updated_date: '2026-11-07 00:52'
labels:
  - size-8
  - core
  - providers
dependencies: []
documentation:
  - doc-1
type: intent
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Getting a recipe into Grocs today means typing it in, but most recipes people cook come from a link to a recipe site. Spec doc-1 parked recipe-link ingredient extraction so it would not block the first version; this picks it up. Supporting many sites must not mean one parser per site, and Grocs should not hit third-party sites more than it needs to.

First pass, as Bruk scoped it on 2026-11-06:
- The apps know nothing about recipe sites or parsing. They send a URL to Grocs' Cloud Function and get a parsed recipe (or an error) back. The function returns the cached recipe if it has one; otherwise it fetches the page, parses it, caches it and returns it.
- The only recipe code the apps share with the server is the contract: the parsed recipe type and the error kinds. Fetching, both parsers, JSON-LD handling, the cache and the failure memory are server-only code that the apps cannot import, checked by an import-layer rule.
- Public pages only. Anything that needs a login is out of scope.
- Imported ingredients go straight onto the grocery list.
- Each ingredient line is parsed into quantity, unit and item, and the line as written is kept alongside. The app does not act on units yet: no combining or converting quantities on the grocery list.
- The raw schema.org Recipe JSON-LD object (not the whole page) is kept on the server, separate from the parsed recipe, so a parser change can re-run without fetching the site.
- Imported recipes are cached on the server indefinitely, and one cache is shared by every kitchen because everything in it is public. If a source that needs a login is ever supported, its content must be cached per user, never in the shared cache.
- A URL whose fetch failed is not tried again for 1 day.
- Search across recipe sites is later, not now.

The parsing is two separate pieces, both pure functions in server-only code:
- Reading the schema: finding the Recipe node (top level, array or @graph; @type may be a list) and normalising its variants (instructions as a string, strings, HowToStep or nested HowToSection; yield as string, number or list; image as string, object or list; ISO 8601 durations; HTML entities). Same for every site.
- Ingredient lines: recipeIngredient is free text, so quantity, unit and item come from a rule-based parser (Unicode fractions, mixed numbers, ranges, bracketed sizes like '1 (14-ounce) can', a note after the first comma, lines with no quantity). Best effort; quantity and unit may be empty, and the line as written is the source of truth.

## Affected users and systems
- Kitchen members adding recipes and meals.
- Shared: the parsed recipe type and error kinds, and the kitchen data that holds an imported recipe (core); the app's import port (ports).
- Server only: the parsers and fetcher (a server-only package; where exactly is part of the server-side decision, since spec doc-1's layout has no server-only domain package), apps/functions (the callable, cache and failure memory), firebase rules.
- App: providers-firebase (the call to the function), ui and app (the paste-a-link flow).
- Today a Meal holds only a name and a link (packages/core/src/model/meal.ts), and a grocery Item holds a free-text amount and badges naming the meals it is for (packages/core/src/model/item.ts). There is no recipe in kitchen data yet.

## Evidence
A logged-out probe of six NYT Cooking recipes on 2026-11-06 (same browser User-Agent as Bruk's nyt-cooking-mcp client, no cookie) found complete schema.org Recipe JSON-LD on all six (ingredients, steps, yield), although every one is marked isAccessibleForFree: false. A plain curl with the same User-Agent got a 102 KB page with no recipe data, so a fetch that returns HTTP 200 can still hold nothing usable.

## Open questions
- [x] Where the server side lives: a Cloud Function with a Firestore cache, deployed through the existing firebase.json (functions codebase apps/functions, Firestore rules and indexes). Bruk agreed 2026-11-06; to be recorded as a decision, including where the server-only parsing package sits in the layers.
- [x] Whether imported ingredients go on the grocery list: yes, all of them, for the first pass.
- [x] How far ingredient parsing goes: quantity, unit and item, with the original line kept. The app holds off on using units.
- [x] How long cached recipes are kept: indefinitely for now.
- [x] How long a failed fetch is remembered: 1 day.
- [x] Whether to keep the source after parsing: keep the raw Recipe JSON-LD object on the server, separate from the parsed recipe; not the whole page.
- [x] Carried forward: search across recipe sites comes later, after import works.
- [ ] Where an imported recipe lives in kitchen data (its own record, or on the Meal whose link it came from) and how its ingredients become grocery Items (name, amount, meal badge, aisle). Blocks the app side; a design task.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A member can paste a public recipe URL and get a recipe with its title, ingredients, steps and yield saved in their kitchen
- [ ] #2 Each imported ingredient is parsed into quantity, unit and item, with the line as written kept alongside; the app does not combine or convert units yet
- [ ] #3 Importing a recipe adds all of its ingredients to the kitchen's grocery list
- [ ] #4 The imported recipe is a copy in the kitchen's data; viewing it later never fetches the source site
- [ ] #5 A site with valid schema.org Recipe JSON-LD imports without any site-specific code
- [ ] #6 A page with no usable recipe (no ingredients or no steps) is never saved, and the member is told why; pages that need a login are not supported
- [ ] #7 The apps never contact a recipe site: they send a URL to the Cloud Function and receive a parsed recipe or an error
- [ ] #8 The apps contain no fetching or parsing code: they share only the parsed recipe type and error kinds, and an import-layer check fails the build if app code imports the server-only recipe code
- [ ] #9 A URL any kitchen has already imported is served from the shared server cache without fetching the site again
- [ ] #10 The server keeps each imported page's raw Recipe JSON-LD separately from the parsed recipe, and can re-parse from it without fetching the site
- [ ] #11 A URL whose fetch failed is not fetched again for 1 day
- [ ] #12 Recipe and ingredient-line parsing are pure and tested against saved pages from at least five sites
- [ ] #13 Must not break: kitchen data stays readable and writable only by its members (R4), and no recipe URL or content is written to logs (R36)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Sized 8 on 2026-11-06. It spans every layer (core, ports, a new server-only package, providers-server, functions, firebase rules, providers-firebase, ui, app), adds a new kind of kitchen data with its own schema, merge and security rules, and has one open design question. The parsers are predictable; the spread comes from the kitchen-data change and the app flow. Split before committing.

Proposed split, in order:
1. design, size-1: record the server-side decision (Cloud Function, shared Firestore cache, raw JSON-LD kept separately, 1-day failure memory, and where the server-only parsing package sits in the layers with the import rule that keeps it out of the apps).
2. design, size-2: where an imported recipe lives in kitchen data and how its ingredients become grocery Items.
3. task, size-2: server-only, schema.org Recipe JSON-LD to recipe, with saved pages from at least five sites as fixtures. Depends on 1.
4. task, size-3: server-only, ingredient-line parser (quantity, unit, item; line kept). Depends on 1.
5. task, size-5: server import - the apps/functions callable, fetcher, cache and failure memory, rules and emulator tests. Depends on 1, 3, 4.
6. task, size-5: app flow - the app's import port and its client for the function, paste a link, save the recipe to the kitchen, add its ingredients to the grocery list. Depends on 2 and 5.
<!-- SECTION:NOTES:END -->
