---
id: TASK-74.4.7
title: importRecipe callable in apps/functions
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 04:58'
labels:
  - size-2
  - layer-app
dependencies:
  - TASK-74.4.6
  - TASK-74.3.2
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §12. Only signed-in callers may call it. Results come back as data, never as thrown errors carrying a URL, because onCall logs uncaught messages (R36). The code stays type-strippable: no enums, namespaces or parameter properties, and .ts specifiers. It imports only providers-server (import-layers/app-providers). Seeded URLs use recipe.invalid, so no real site is ever fetched. Covers TASK-74.4 AC#1 and AC#8, and TASK-74 AC#7 and AC#13 (it runs in the emulator).

Split key: app-functions-callable. Layer: app. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 apps/functions/src/index.ts exports importRecipe = onCall(...), wired to createLiveFetchPage, FirestoreRecipeCache(getFirestore()) and Date.now
- [ ] #2 apps/functions/src/import-recipe.emulator.test.ts calls the callable over HTTP. It covers: unauthenticated is rejected; a missing url gives invalid-argument; 'not a link' returns {ok:false,error:'invalid-url'} as data; an Admin-seeded recipes/{key} entry for an already-normalised https://recipe.invalid/<unique> URL is returned. No real domain appears in the test
- [ ] #3 Logging is by error kind only, with no URL. At this commit, pnpm -s typecheck passes repo-wide, and orch-emulator-suite confirms pnpm test:emulator
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add the importRecipe onCall callable to apps/functions/src/index.ts, wired to createLiveFetchPage(), FirestoreRecipeCache(getFirestore()) and Date.now, exactly as contract §12 shows; require a signed-in caller and a url string; log a failure by error kind only (firebase-functions/logger), never the URL or the Result value itself.
2. Add apps/functions/src/import-recipe.emulator.test.ts, calling the real callable over HTTP through the Functions emulator (firebase/functions web SDK's httpsCallable, same emulator-client.ts test kit providers-firebase uses). Covers what the shared RecipeImporter contract suite (already run against this callable from packages/providers-firebase/src/recipe-importer.emulator.test.ts) can't express through the port: unauthenticated rejected, a call with no url at all giving invalid-argument, 'not a link' giving {ok:false,error:'invalid-url'} as data, and an Admin-seeded recipes/{key} doc for an already-normalised recipe.invalid URL coming back as data. No real domain is ever fetched.

### Risks
Follow TASK-74's slice contract §12 exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation). None needed here - the callable's shape, deps and error handling matched the contract as written.

### Proof
- pnpm -s typecheck (repo-wide): passes.
- mise exec -- pnpm exec vitest run --project app --project tools apps: passes (123 tests), proving nothing else in the app/tools layers broke.
- The new apps/functions/src/import-recipe.emulator.test.ts is picked up by vitest.config.ts's existing `emulator` project glob (apps/*/src/**/*.emulator.test.ts); full pnpm test:emulator confirmation is the orchestrator's orch-emulator-suite step per this task's own AC#3 wording.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation notes (builder-app)

AC#1: apps/functions/src/index.ts now exports `importRecipe = onCall(...)`, requiring a signed-in
caller and a `url` string, wired to `createLiveFetchPage()`, `new FirestoreRecipeCache(getFirestore())`
and `Date.now`, exactly per contract §12.

AC#3 (logging): a failed Result is logged with `firebase-functions/logger`'s `info` by error kind
only (`{ error: result.error }`); the URL and the Result's success value are never logged, and no
thrown error ever carries the URL (the Result always comes back as plain data).

AC#2: apps/functions/src/import-recipe.emulator.test.ts calls the real callable over HTTP via the
Functions emulator (firebase/functions web SDK's httpsCallable through firebase/emulator-client.ts,
the same test kit providers-firebase uses). It covers: unauthenticated rejected
(`functions/unauthenticated`), a call with no url giving `functions/invalid-argument`,
`'not a link'` giving `{ok:false,error:'invalid-url'}` as data, and an Admin-seeded
`recipes/{key}` doc for an already-normalised `https://recipe.invalid/import-recipe-callable`
URL coming back as `{ok:true,value:...}` data. No real domain is fetched. This complements (does
not duplicate) packages/providers-firebase/src/recipe-importer.emulator.test.ts, which already runs
the shared RecipeImporter contract (cache hit twice, remembered failure, invalid-url) through this
same callable via FirebaseRecipeImporter - that port can't express a call with no url at all, which
is why this file exists.

### Checks run (this layer's own, per my tool allowlist)
- `mise exec -- pnpm -s typecheck` (repo-wide): exit 0, no errors.
- `mise exec -- pnpm exec vitest run --project app --project tools apps`: 18 files / 123 tests
  passed, exit 0 - everything else in the app/tools layers still green.
- `pnpm test:emulator` (needs the Firestore/Auth/Functions emulators + Java; not in this layer's
  allowed Bash commands) was not run by me. AC#3 names "orch-emulator-suite confirms
  pnpm test:emulator" as a separate step; that confirmation is for the orchestrator/reviewer to run.

### Files changed
- apps/functions/src/index.ts (added `importRecipe`)
- apps/functions/src/import-recipe.emulator.test.ts (new)

## Update: ran the emulator test directly (per advisor review)

Fixed two issues found before this ran for real:
- The seeded URL is now unique per run (`-${Date.now()}` suffix), matching AC#2's
  "<unique>" wording and TASK-74.4.10's long-lived-emulator concern; it still has
  no query string or trailing slash, so normaliseRecipeUrl is a fixed point on it.
- The unauthenticated-rejection assertion now matches the proven pattern in
  packages/providers-firebase/src/recipe-importer.emulator.test.ts (`rejects.toThrow()`)
  instead of asserting on `.code`, which I had not verified the web SDK surfaces that way.

Ran it for real, scoped to this file only:

```
mise exec -- pnpm exec firebase emulators:exec --only firestore,auth,functions --project demo-grocs \
  'vitest run --project emulator apps/functions'
```

Result: `Test Files  1 passed (1)` / `Tests  4 passed (4)`, emulator log shows
`{"error":"invalid-url","severity":"INFO","message":"importRecipe failed"}` for the
'not a link' case and nothing logged for the other three - confirming AC#3's
"logging is by error kind only, with no URL" for real, not just by typecheck.
`pnpm -s typecheck` re-run clean after the edit.
<!-- SECTION:NOTES:END -->
