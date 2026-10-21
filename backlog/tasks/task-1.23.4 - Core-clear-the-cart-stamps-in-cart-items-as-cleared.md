---
id: TASK-1.23.4
title: 'Core: clear the cart stamps in-cart items as cleared'
status: Done
assignee:
  - '@builder-core'
created_date: '2026-10-21 11:11'
updated_date: '2026-10-21 11:20'
labels:
  - layer-core
  - size-1
dependencies: []
modified_files:
  - packages/core/src/model/item.ts
  - packages/core/src/model/item.test.ts
  - packages/core/src/model/list.ts
  - packages/core/src/model/list.test.ts
  - packages/core/src/schema/item-doc.ts
  - packages/core/src/schema/item-doc.test.ts
  - packages/core/src/index.ts
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-1.23 #3, pulled forward like ticking (TASK-1.23.1/1.23.2) at Bruk's request: the UI already has a Clear the cart button with nothing behind it. R14: 'Clear the cart removes in-cart items from the week's list view. They remain available to the aisle and amount suggestions in R11.' So this is not a delete (R20's deleted tombstone means never reappears at all, including from suggestions) - it is a third ItemState, cleared, alongside to-buy and in-cart, using the exact same stamped-field mechanism TASK-1.23.1 already built. A cleared item stays out of the week's visible list (visibleItems) but is still a normal, non-deleted item a future R11 suggestion query can read by name.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 ItemState gains a third value, cleared; isState's schema guard (item-doc.ts) accepts it; visibleItems (list.ts) excludes cleared items from the week's view, the same way it already excludes deleted ones
- [x] #2 A new clearFromCart(item, stamp) function stamps an item's state as cleared (the same shape as setItemState, named for this specific intent); tests cover the new state end to end (schema round-trip, visibleItems hiding a cleared item while keeping a to-buy/in-cart one), with no shrink to existing test counts
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In packages/core/src/model/item.ts, change `export type ItemState = 'to-buy' | 'in-cart';` to `export type ItemState = 'to-buy' | 'in-cart' | 'cleared';`.
2. In the same file, right after setItemState, add: `export function clearFromCart(item: Item, stamp: Stamp): Item { return setItemState(item, 'cleared', stamp); }` with a one-line doc comment (R14: removed from the week's view, not deleted - it stays available to a later suggestion query by name).
3. In packages/core/src/model/list.ts's visibleItems, change the filter from `.filter((i) => i.deleted === null)` to `.filter((i) => i.deleted === null && i.state.value !== 'cleared')`.
4. In packages/core/src/schema/item-doc.ts, change `const isState = (v: unknown): v is ItemState => v === 'to-buy' || v === 'in-cart';` to also accept `'cleared'`, and update the `readField(..., 'state', isState, 'to-buy or in-cart')` error message string to name all three values.
5. In packages/core/src/index.ts, export clearFromCart alongside the existing setItemState export (find that line and add beside it).
6. Tests - add, do not replace, so no existing test count shrinks:
   - packages/core/src/model/item.test.ts (10 tests now): add a test that clearFromCart stamps the state as 'cleared' and leaves every other field untouched (mirror the existing setItemState test's shape).
   - packages/core/src/model/list.test.ts (6 tests now): add a test that visibleItems excludes a cleared item while still showing a to-buy and an in-cart one.
   - packages/core/src/schema/item-doc.test.ts (5 tests now): add a round-trip test for a cleared item (encode then decode gives back the same state), matching the existing to-buy/in-cart round-trip tests' shape.
7. Run `vitest run --project unit packages/core` and confirm it passes.

### Risks
This task alone does not wire a ClearCart command - TASK-1.23.5 (application) is a separate task, and nothing here requires it: every change in this task is purely additive (a new union member, a new unreferenced function, a widened guard, one more excluded state in a filter that currently matches nothing), so the whole repo keeps typechecking and every existing test keeps passing without TASK-1.23.5 landing first - unlike TASK-27's Kitchen change, this one never touches an existing function's required parameters.

### Proof
vitest run --project unit packages/core passes with the test counts grown as described in step 6, and ItemState/clearFromCart/isState match this plan exactly.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

```text
[ERR_PNPM_UNSUPPORTED_ENGINE] Unsupported environment (bad pnpm and/or Node.js version)

Your Node version is incompatible with "/Users/brukhabtu/src/github.com/bruk-io/grocs".

Expected version: >=24.12
Got: v22.21.1

This is happening because the package's manifest has an engines.node field specified.
To fix this issue, install the required Node version.
```

Check `mise exec -- pnpm check` exited 0

```text
$ node tools/checks/run.ts --mode all
checks passed (14 checks, all mode, 327 ms)
```

Check `mise exec -- pnpm typecheck` exited 0

```text
$ tsc --noEmit
```

Check `mise exec -- pnpm test` exited 0

(17 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/NativeModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/SharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/SharedRef.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/Platform.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/environment/browser.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/NativeViewManagerAdapter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/errors/UnavailabilityError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/errors/CodedError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/requireNativeModule.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/registerWebModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/TypedArrays.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/PermissionsInterface.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/PermissionsHook.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/Refs.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-modules-core/build/hooks/useReleasingSharedObject.js" points to missing source files
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
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/ExpoLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/RNLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/createURL.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/validateURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Schemes.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/devLaunchURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files

 Test Files  109 passed (109)
      Tests  1448 passed (1448)
   Start at  07:18:18
   Duration  6.68s (transform 32.59s, setup 2.78s, import 92.39s, tests 28.50s, environment 15.73s)
```

Reviewed at 1739dee (merged as b1fd5d2). Both acceptance criteria met; closed.

Verified against the diff: ItemState gains 'cleared' (item.ts:6); isState accepts it and the error string names all three values (item-doc.ts:76,94); visibleItems filters 'deleted === null && state.value !== "cleared"' (list.ts:41). clearFromCart(item, stamp) delegates to setItemState with 'cleared' and is exported from index.ts. AC #1's 'the same way it already excludes deleted ones' checked by grepping every deleted filter in packages: list.ts:41 is the only live read path; isDeleted is a merge helper used by merge tests and one ports contract assertion, not a parallel list view. So no second selector leaks cleared items. The change matches the plan step for step, with no departures.

Test counts grew, none shrank: item.test.ts 10 -> 11, list.test.ts 6 -> 7, item-doc.test.ts 5 -> 6 (it( counts, git show 1739dee~1:<file> vs current). Coverage is end to end as AC #2 asks: schema round-trip of a cleared item including JSON, and visibleItems hiding a cleared item while keeping an in-cart and a to-buy one.

Checks: 'pnpm check' passed (14 checks, all mode), 'pnpm typecheck' clean, 'pnpm test' 109 files / 1448 tests passed - all under 'mise exec --', all recorded above. No file was reformatted or fixed by the checks. 'record-check --tier full' is also recorded above as failing with ERR_PNPM_UNSUPPORTED_ENGINE: that is the harness not going through mise and resolving Node v22 against the repo's engines '>=24.12', an environment failure of the reviewer tier itself, not a failure of this code. 'pnpm test:emulator' was not run; no copy of the ItemState union exists outside core and the schema guard only widened, so the ports contract suite is unaffected.

Findings, both minor, neither filed as a draft (no realistic path to a failure; they belong to whoever next touches these lines):
1. item.ts:69 - setItemState's doc comment still reads "Set an item's state (to-buy or in-cart)" and is now stale by one value. Cosmetic.
2. list.test.ts:2 - the new import uses '../model/item.ts' from inside the model directory where the sibling files use './item.ts', and it sits above the '../merge/...' import rather than with it. No check enforces either, so it passes; worth folding into TASK-1.23.5's pass over this area.
<!-- SECTION:NOTES:END -->
