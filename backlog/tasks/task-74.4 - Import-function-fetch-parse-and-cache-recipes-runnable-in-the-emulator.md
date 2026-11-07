---
id: TASK-74.4
title: 'Import function: fetch, parse and cache recipes, runnable in the emulator'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 01:00'
updated_date: '2026-11-07 04:38'
labels:
  - size-5
  - providers
  - finish-moved
dependencies:
  - TASK-74.1
  - TASK-74.3
parent_task_id: TASK-74
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The server half of TASK-74: a callable Cloud Function in apps/functions that takes a URL from a signed-in member and returns a parsed recipe or an error. It returns the cached recipe when it has one; otherwise it fetches the page, parses it with TASK-74.3's code, caches the result and returns it. The first goal is to prove it locally in the Functions emulator; deploying it belongs to the separate infrastructure intent (Grocs' Firebase project and deploys are code). Note: a plain curl of an NYT page with only a browser User-Agent got a page with no recipe data while Python requests got the full page, so a successful fetch can still hold nothing usable.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Only signed-in members can call the function; it fetches public pages with no cookies or credentials
- [ ] #2 A URL already in the shared cache is answered from it without fetching the site, and the cache is keyed by canonical URL so tracking parameters do not create duplicates
- [ ] #3 The cache stores the parsed recipe and the raw Recipe JSON-LD separately
- [ ] #4 A URL whose fetch or parse failed is not fetched again for 1 day, and callers get the same error meanwhile
- [ ] #5 App clients cannot read or write recipes, recipeSources or recipeFailures: Firestore's default deny holds, with deny tests (the Admin SDK is the only writer)
- [ ] #6 Emulator tests cover cache hit, cache miss, failure memory and the not-a-recipe error without fetching live sites
- [ ] #7 pnpm emulators runs the function locally, and importing a real recipe URL through it works (manual local run by the orchestrator; no automated test fetches a live site, decision-15)
- [ ] #8 No recipe URL or content is written to logs (R36)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
finish-moved (TASK-74.4.1, 2026-11-07): AC#5 changed from 'Firestore rules stop app clients reading or writing the cache directly, with allow and deny tests' to deny-only. The contract (TASK-74 plan, firestore.rules section) gives the three server collections no match block, following the inviteCodes precedent, so Firestore's default deny is the rule and there is no allow case for an app client to test; the Admin SDK is the only writer. AC#7 now says it is a manual local run by the orchestrator, because decision-15 and contract §0.4 forbid any automated test from fetching a live site.

TASK-74.4.6 (providers): FirestoreRecipeCache stores recipeSources/{key}.jsonLd as a JSON string (JSON.stringify of the raw Recipe node), not the raw object decision-15 describes ('the raw Recipe JSON-LD object'). Reason: Firestore documents cannot hold arrays nested inside arrays, and recipeInstructions sections (HowToSection.itemListElement) nest them, so the raw node cannot always be written as-is. getSource reverses it with JSON.parse before returning CachedSource.jsonLd, so every other layer still sees the raw RecipeJsonLd object; only the Firestore document on disk differs from decision-15's wording. Matches contract §11's own note recording this deviation.
<!-- SECTION:NOTES:END -->
