---
id: TASK-1.22
title: 'Grocery list: we build the week''s list from meals and extras'
status: Done
assignee: []
created_date: '2026-10-18 18:16'
updated_date: '2026-11-08 22:47'
labels:
  - size-5
  - slice
milestone: m-2
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on the meal plan slice. Cites R9, R10, R11.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Either of us adds an item for a meal (it carries that meal's badge) or as an extra
- [x] #2 Items to buy are grouped by aisle, and a new item's aisle is suggested from our earlier choices
- [x] #3 Each item shows its name, amount, aisle, badges and who added it
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Slice contract
Bruk delegated these calls on 2026-11-08 ("take care of all these open problems"); any can be changed in review.

Aisles. core exports AISLES, a fixed ordered list: produce 'Produce', dairy 'Dairy & eggs', meat 'Meat', bakery 'Bakery', pantry 'Pantry', other 'Other'. The ids match the existing section icons. Item.aisle stays a string; an id not in the list groups as other, so stored data never breaks.

core: AISLES and AisleId; aisleSection(aisle) mapping any string to an AisleId; groupByAisle(items) returning sections in AISLES order, empty ones left out; aisleNameKey(name) = encodeURIComponent(normaliseName(name)); setItemAisle(item, aisle, stamp) returning a new item.

ports: SyncStore gains rememberAisle(kitchenId, nameKey, aisle: Stamped<string>) and aisleFor(kitchenId, nameKey): Promise<string | null>. Later stamp wins; the same stamp twice changes nothing. Fake and contract suite cover both, including that a later call with an older stamp does not overwrite.

providers: FirestoreSyncStore stores kitchens/{k}/aisles/{nameKey} in decision-7's shape ({schemaVersion, aisle: stored stamped value}); the memory provider matches. decision-7 is still proposed, and this document is the one piece of it this slice adopts, so it stands either way. aisleFor must work offline from the cache. A rules test proves a non-member cannot read or write it.

application: AddItem with no aisle takes aisleFor(name), else the default. AddItem with an aisle also calls rememberAisle. New SetItemAisle command {kitchenId, weekId, itemId, aisle} stamps the item and remembers the aisle. New suggestAisle(kitchenId, name) query. Clearing the cart does not touch aisle memory, so cleared items keep informing suggestions (R14); a scenario test proves it: add with an aisle, clear, add the same name with none, get that aisle. Import inherits all this because it dispatches AddItem.

ui, with new stories and behaviour tests: ItemPickerTemplate gains optional amount field and an aisle chip group (value, onChange, options). ListSection and GroceryListTemplate gain a way to press a to-buy row, and an inline aisle chip group under the chosen row. No aisle prop on ItemRow: a row sits under its aisle's heading, which is how #3's 'shows its aisle' is met. ui takes aisle options as data and does not import core.

app: GroceriesScreen builds sections with groupByAisle, keeps them when a meal filter is on, passes addedBy as the member's name from KitchenInfo members by uid (nothing while loading or for an unknown uid), and dispatches SetItemAisle from the inline chips. QuickAddScreen adds amount and aisle inputs; the chip preselects suggestAisle as the name changes, and an aisle the person chose is not overwritten. App facade gains suggestAisle. Correct GroceriesScreen's stale doc comment. Demo items get aisles.

Baselines. New and changed stories need baselines from the visual baselines workflow; the orchestrator does that and the live proof after the app leaf.

### Order of work
core, then ports, then providers and application, with ui alongside; then app; then baselines and proof.

### Risks
- TASK-1.26's combine prompt and TASK-1.27's activity build on this list and must not need rework; this slice adds no merging of items.
- If decision-7 is later accepted, aisle memory moves into its append batch; the document shape already matches.
- A meal-filtered list now shows several sections, which earlier tests may have assumed was one.

### Proof
Route tests for grouping, suggestion, changing an aisle and who-added; the R14 scenario test; the provider contract on the emulator; a live iOS simulator run with screenshots.
### Contract additions from core's review
- suggestAisle returns null without calling aisleFor when aisleNameKey(name) is empty, for a name such as '!!': an empty document id is not valid in Firestore, and the query runs as the name is typed.
- SetItemAisle and AddItem pass only an AisleId from AISLES; anything else is an error result. setItemAisle itself does not trim or fall back.
- Section icons: the ids produce, dairy, meat, bakery and pantry are icon names. other has no icon; the app uses 'cart' for it. Do not cast AisleId to IconName.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(44 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/Asset.fx.js" points to missing source files
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
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontHooks.js" points to missing source files

 Test Files  157 passed (157)
      Tests  2110 passed (2110)
   Start at  12:57:43
   Duration  19.92s (transform 121.21s, setup 6.41s, import 290.70s, tests 83.96s, environment 37.88s)

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

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(36 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/hooks/useReleasingSharedObjectWithLifecycle.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/reload.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/LegacyEventEmitter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/NativeModulesProxy.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/worklets/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/ExpoFontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/serverContext.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/Asset.fx.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/Asset.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetSources.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo/build/utils/getBundleOrigin.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo/build/utils/getBundleUrl.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetSourceResolver.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files
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

 Test Files  157 passed (157)
      Tests  2110 passed (2110)
   Start at  12:59:31
   Duration  21.51s (transform 134.64s, setup 18.40s, import 307.75s, tests 104.22s, environment 63.88s)

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

Review: not closed. 1/3 criteria met; status left at To Do for the orchestrator.

AC1 met. QuickAddScreen dispatches AddItem with the chosen mealId, and without one the item is an extra. Evidence: apps/mobile/src/routes/screens.route.test.tsx (real routes, fake store: badge shows on Groceries; no badge with no meal), packages/core/src/schema/item-doc.test.ts (badges round-trip the stored shape). Any member may write: firebase/firestore.rules allows items for isMember. No emulator test asserts badges through Firestore.

AC2 not met, no code. GroceriesScreen puts every item to buy in one section titled 'This week'; nothing groups by aisle. QuickAddScreen and GroceriesScreen never send an aisle, so every item gets DEFAULT_AISLE 'other'. Nothing suggests an aisle from earlier choices (QuickAddScreen passes suggestions={[]}), and no command changes an item's aisle, which R11 also asks for.

AC3 not met. ListItem and ItemRow have no aisle prop. toListItem drops item.addedBy, so the avatar ItemRow can draw never appears on the real screen. Amount renders, but only recipe import can set one: neither manual add path has an amount input. Badges are done. Who-added also needs uid-to-name mapping, since addedBy is a uid.

Check: record-check full exited 1 on both runs. pnpm check, typecheck and unit (157 files, 2110 tests) passed; test:emulator could not start because another session held the emulator ports (auth/firestore on the first run, functions on the second). check:release, build-storybook and visual did not run, because the chain stops there. Running vitest --project emulator against those live emulators gave 15, 12, then 8 failures in differing tests, consistent with shared-emulator interference, so that tier is inconclusive, not a pass.

Findings, none filed as drafts because the remaining work belongs under this task: (medium) AC2 and AC3 have no subtasks, so nothing queued delivers them; split them here. (low) GroceriesScreen's doc comment still says the Item model holds no meal badges or who-added, which is false. (low) The Groceries inline add ignores an active meal filter, so an item added while filtered is an extra and disappears from the filtered view; R10 allows this, but it may surprise.

From TASK-1.23's review, 2026-11-08: #2 must read cleared items for its suggestions, or R14 is still not delivered; TASK-1.23 #3 proved retention only. From this task's review: no open subtask delivers #2 or #3, so it needs splitting before it can move.

Split 2026-11-08 from the review's finding that nothing delivered #2 and #3.

Live proof, 2026-11-08, iOS simulator against the emulators, on feat/aisles at 3994a66. Alex adds an item (under Other, with an avatar by name), opens its aisle chips from the row with Other marked, chooses Dairy & eggs and the row moves; adding the same name again lands under Dairy & eggs. Jo uses Quick add: amount field and aisle chips show, Pantry chosen, item under Pantry; ticked and cleared; typing the name again preselects Pantry (R14). The existing flows add-and-tick-item and quick-add-first-tap pass, so the now-pressable row name does not break ticking. Maestro's accessibility tree found 'Change the aisle' as a separate 1x1 element on each row; TASK-1.22.11 fixed it, and after that the tree has none. Baselines: visual baselines workflow run 42526535671, only new images. Screenshots from this session are in the scratchpad, not the repo. Not proved on a device: real VoiceOver speech, Android, native 'firestore/unavailable' offline behaviour (TASK-1.16).

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(839 earlier lines omitted)
```text
│  10.79 kB │ gzip:   3.48 kB
│  storybook-static/assets/Mascot-BsZQCZOO.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-CGD0FZRC.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-u4IbtpFo.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-CsCPY1On.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-DINP4KBg.js
│  167.09 kB │ gzip:  49.81 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-ESMp-duG.js
│  1,361.60 kB │ gzip: 392.36 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 1.37s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/aisles/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 474 story views checked (axe, 44 x 44, images not compared)
```

Review (philosophy:reviewer, 2026-11-08): closed at a89e97d, 3/3 criteria met, judged on behaviour. Full check exited 0 from the worktree: 16 checks, typecheck, 2245 unit tests, 161 emulator tests, release bundles, Storybook, 474 story views. It ran axe and 44 x 44 only: image comparison is skipped on darwin, so baselines rest on workflow run 42526535671 as recorded, not re-verified here.

#1 met: earlier evidence plus route test 'tags the added item with the selected meal' (screens.route.test.tsx:498). #2 met: GroceriesScreen uses groupByAisle, kept under a meal filter (route test :218); suggestion on Quick add and in AddItem (:558, :607). TASK-1.23's R14 ask: met in behaviour, not in the mechanism it named. Nothing reads cleared items; a kitchen-wide aisle memory written at choice time survives Clear (add-item.scenario.test.ts:246, add, tick, clear, re-add gets the aisle; live proof repeats it). I accept this: the memory also spans weeks, which a read of one week's cleared items would not, and before this slice no screen could choose an aisle. #3 met for rows to buy: name, amount, badges, who added (route test :259), aisle by heading (:218).

Contract call on 'shows its aisle': sound for rows to buy, including under a meal filter, since every row sits under its heading. It says nothing about the cart, so here is a second call, mine: CartSection renders name only, with no amount, aisle, badges or who added, though GroceriesScreen builds them for cart rows. Read literally, 'each item' fails there. I count #3 as met because that row is the design system's item.row--done from 080b9e1, before this slice, R13 treats the aisle as belonging to the to-buy state, and TASK-1.23 closed on this row. Bruk may overrule this; if so, it is a small UI change and #3 reopens.

TASK-1.21: not a blocker. board-check raised no block, and its open #1 and #3 are week navigation and moving meals, which this slice does not use. The edge is stale for the orchestrator to judge, as TASK-1.23's was.

Findings. Low, reported only: cart rows as above; the data GroceriesScreen builds for them is discarded. Low, reported only: deselecting a suggested chip on Quick add sends no aisle, so AddItem's memory lookup puts the item in that aisle anyway; the screen showed none, and the row can be changed afterwards. Low, reported only: the who-added avatar shows one initial, the full name only to a screen reader; two members sharing an initial look alike. Low, reported only: an aisle chosen offline is not remembered because rememberAisle's transaction fails and is swallowed; belongs with TASK-1.16 and TASK-1.24. Medium, filed as a draft: R14's amount suggestions have no owner; QuickAddScreen's comment cites archived TASK-57. Not proved on a device: VoiceOver speech, Android, native offline, as the live proof states.

2026-11-08: removed the dependency on TASK-1.21. Its open criteria are week navigation and moving meals, which this slice does not use. The close review judged the edge stale.
<!-- SECTION:NOTES:END -->
