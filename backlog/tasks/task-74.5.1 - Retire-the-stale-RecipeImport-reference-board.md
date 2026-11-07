---
id: TASK-74.5.1
title: Retire the stale RecipeImport reference board
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:46'
labels:
  - size-1
  - orchestrator
dependencies: []
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
design/reference/RecipeImport.dc.html shows ingredient ticking, servings scaling and pantry staples, which accepted decision-16 supersedes. CLAUDE.md and spec R66 say reference boards are deleted as each is built. This slice builds the recipe view, so the board goes now. A builder will then not copy a design that the accepted decisions overrule, and nothing has to be named around reference-built.

Split key: orch-retire-recipe-board. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 design/reference/RecipeImport.dc.html and any shots referenced only by it are deleted
- [x] #2 TASK-74.5 notes record the deletion as superseded by decision-16 under R66, and pnpm check (reference-built) passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Run `grep -rn RecipeImport design/ tools/ packages/ui/` to find shots or references used only by this board.
2. `git rm` the board and those shots.
3. Run `pnpm check`. If reference-built or any other check fails, stop and report.
4. Add a TASK-74.5 note: 'Deleted design/reference/RecipeImport.dc.html: superseded by decision-16 (no ticking, no scaling), R66.' Then commit and push main.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- design/reference/RecipeImport.dc.html
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Evidence (worktree wf_ff6cb6f7-7f6-7):
- Step 1: grep -rn RecipeImport design/ tools/ packages/ui/ found only design/reference/canvas.json (boards entry and order list) besides the board itself; shots/RecipeImport.png is the board's shot (README: delete a board's shot with the board).
- Step 2: removed design/reference/RecipeImport.dc.html and design/reference/shots/RecipeImport.png, and the board's boards/order entries in design/reference/canvas.json (the reference-built rule's fix text names all three).
- After: grep -rn RecipeImport design/ tools/ packages/ui/ gives no matches (exit 1).
- Step 3: pnpm check gives 'checks passed (16 checks, all mode, 658 ms)', exit 0; reference-built is registered in tools/checks/registry.ts.
- Step 4: TASK-74.5 note added. Committed in the worktree only, not pushed: the workflow forbids pushing and switching branches in the main checkout, so the orchestrator lands it on main.
- Worktree setup: its branch was cut from origin/main (TASK-67 commits) while local main had the TASK-74 board commits, so a fast-forward was impossible; local main was merged in (merge commit) to get this task.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(44 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/RNLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/serverContext.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/createURL.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/validateURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/Asset.fx.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Schemes.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/devLaunchURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/Asset.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetSources.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo/build/utils/getBundleOrigin.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo/build/utils/getBundleUrl.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetSourceResolver.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/PlatformUtils.web.js" points to missing source files
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
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files

 Test Files  138 passed (138)
      Tests  1765 passed (1765)
   Start at  21:46:08
   Duration  19.34s (transform 156.42s, setup 8.71s, import 308.62s, tests 75.38s, environment 43.36s)

$ firebase emulators:exec --only firestore,auth,functions --project demo-grocs 'vitest run --project emulator'
i  emulators: Starting emulators: auth, functions, firestore
i  emulators: Detected demo project ID "demo-grocs", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail.
⚠  hub: emulator hub unable to start on port 4400, starting on 4401 instead.
⚠  emulators: It seems that you are running multiple instances of the emulator suite for project demo-grocs. This may result in unexpected behavior.
⚠  functions: Port 5001 is not open on 127.0.0.1, could not start Functions Emulator.
⚠  functions: To select a different host/port, specify that host/port in a firebase.json config file:
      {
        // ...
        "emulators": {
          "functions": {
            "host": "HOST",
            "port": "PORT"
          }
        }
      }
⚠  eventarc: Eventarc Emulator unable to start on port 9299, starting on 9300 instead.
⚠  tasks: Cloud Tasks Emulator unable to start on port 9499, starting on 9500 instead.
i  emulators: Shutting down emulators.
i  hub: Stopping emulator hub

Error: Could not start Functions Emulator, port taken.
[ELIFECYCLE] Command failed with exit code 1.
```

Closed by reviewer. AC1: df4b4e4 deletes design/reference/RecipeImport.dc.html, its only shot shots/RecipeImport.png and its canvas.json entry; grep -rn RecipeImport design/ tools/ packages/ui/ returns nothing on main. AC2: TASK-74.5 notes record the deletion as superseded by decision-16 under R66; pnpm check on merged main e4de89f passed (16 checks, includes reference-built). Finding (low, no task): record-check --tier full run by this reviewer failed only because a parallel reviewer held the Functions emulator port; the orchestrator's full-suite evidence on e4de89f (check, typecheck, 1765 unit, 110 emulator tests passing) stands in for it.
<!-- SECTION:NOTES:END -->
