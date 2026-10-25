---
id: TASK-1.22.1
title: >-
  Core/application: an item can carry a meal badge when added, not just as an
  extra
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-25 01:21'
updated_date: '2026-10-25 01:36'
labels:
  - layer-core
  - size-1
dependencies:
  - TASK-1.21.6
modified_files:
  - packages/core/src/model/item.ts
  - packages/core/src/model/item.test.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Scoped slice of TASK-1.22's AC1 only ('Either of us adds an item for a meal (it carries that meal's badge) or as an extra') - AC2 (aisle grouping + suggestion) and AC3 (full row display) stay on TASK-1.22 for later, not touched here. Right now the grocery list and the meal plan are two disconnected lists: createExtraItem (packages/core/src/model/item.ts) is explicitly 'no meal badge' by design, always sets badges: []; AddItem (packages/application/src/commands/add-item.ts) has no mealId field at all. QuickAddScreen already lets a member pick a meal chip when adding an item (selectedMealId/onSelectMeal, wired to the UI), but the selection currently does nothing - dispatching AddItem never includes it. This task connects that already-built UI affordance to a real effect.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 NewItemInput gains an optional badges?: readonly string[] field; createExtraItem passes it through (defaulting to []), so the no-meal case is unchanged and a meal-linked case is just the same function called with one more field
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Delivers R10 (an item can be added as an extra, or for a meal of that week, carrying that meal's badge) - this task only, not R12 (the combine prompt, TASK-1.26) or R9's aisle/amount display (TASK-1.22's remaining ACs).

### Order of work
1. In packages/core/src/model/item.ts: add `readonly badges?: readonly string[];` to NewItemInput (around line 46, alongside the existing optional `amount`/`aisle` fields), with a one-line doc comment ("Meal ids this item is for; empty when it's an extra.").
2. In createExtraItem (around line 64), change the hardcoded `badges: [],` to `badges: input.badges ?? [],`.
3. Update the function's own doc comment (currently "Make a new extra item (no meal badge), stamped with who added it and when.") to say it accepts an optional meal badge too - e.g. "Make a new item, stamped with who added it and when. No badges means an extra; one or more badges means it's for those meals." Do not rename the function - NewMealItem naming is a separate decision for whoever wires the app layer, not this task's concern.
4. In packages/core/src/model/item.test.ts, add one test: createExtraItem with `badges: ['meal-1']` produces an Item whose badges field is `['meal-1']`, and a second test confirming the existing no-badges call still produces `[]` (regression guard for the default).
5. Run `pnpm exec vitest run --project unit packages/core` and `pnpm -s typecheck` to confirm both pass.

### Risks
- Keep this additive only - no existing caller of createExtraItem passes badges today, so every existing call site's behavior is unchanged by construction (`?? []` on an absent field is `[]`, the exact previous hardcoded value).

### Proof
- pnpm exec vitest run --project unit packages/core passes, including the two new/changed tests.
- pnpm -s typecheck passes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation completed:

✅ Step 1: Added `readonly badges?: readonly string[];` field to NewItemInput with doc comment
✅ Step 2: Updated createExtraItem to use `badges: input.badges ?? []` (defaults to [] when not specified)
✅ Step 3: Updated createExtraItem's doc comment to reflect that it now accepts optional meal badges
✅ Step 4: Added two tests:
   - Test that createExtraItem with badges: ['meal-1'] produces badges: ['meal-1']
   - Regression test confirming calls without badges still produce [] 
✅ Step 5: All checks pass:
   - pnpm exec vitest run --project unit packages/core: 13 passed (13), 103 passed (103)
   - pnpm -s typecheck: passes with no errors

All work complete and verified.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(52 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetUris.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/resolveAssetSource.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/ExpoLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/RNLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/createURL.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/validateURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Schemes.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/devLaunchURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files

 Test Files  126 passed (126)
      Tests  1648 passed (1648)
   Start at  21:34:56
   Duration  8.74s (transform 37.87s, setup 3.88s, import 107.31s, tests 41.01s, environment 20.10s)

$ firebase emulators:exec --only firestore,auth,functions --project demo-grocs 'vitest run --project emulator'
i  emulators: Starting emulators: auth, functions, firestore
i  emulators: Detected demo project ID "demo-grocs", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail.
⚠  auth: Port 9099 is not open on 127.0.0.1, could not start Authentication Emulator.
⚠  auth: To select a different host/port, specify that host/port in a firebase.json config file:
      {
        // ...
        "emulators": {
          "auth": {
            "host": "HOST",
            "port": "PORT"
          }
        }
      }
⚠  firestore: Port 8080 is not open on 127.0.0.1, could not start Firestore Emulator.
⚠  firestore: To select a different host/port, specify that host/port in a firebase.json config file:
      {
        // ...
        "emulators": {
          "firestore": {
            "host": "HOST",
            "port": "PORT"
          }
        }
      }
⚠  hub: emulator hub unable to start on port 4400, starting on 4401 instead.
⚠  logging: Logging Emulator unable to start on port 4500, starting on 4501 instead.
i  emulators: Shutting down emulators.

Error: Could not start Authentication Emulator, port taken.
[ELIFECYCLE] Command failed with exit code 1.
```

Reviewer note on the recorded full check: the emulator tier above exited 1 only because ports 8080/9099 were already held by another session's running emulators (PIDs 52439/52368), not by any defect in this change. Re-ran that suite directly against those live emulators: `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 GCLOUD_PROJECT=demo-grocs pnpm exec vitest run --project emulator` -> 8 test files passed, 91 tests passed. Earlier tiers in the same run were green: 126 test files, 1648 tests, typecheck and lint clean.

Caveat on that run: the working tree carried other agents' uncommitted edits (apps/mobile/src/screens/PlanScreen.tsx, apps/mobile/src/routes/meal-plan.route.test.tsx, untracked task-1.21.8), so the totals are not a measurement of a1e1fe9 alone. Nothing in that dirty set is under packages/core and core does not depend on apps/mobile, so the verdict on this change is unaffected.
<!-- SECTION:NOTES:END -->
