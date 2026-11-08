---
id: TASK-1.22.4
title: 'Core: aisles, grouping and changing an item''s aisle'
status: Done
assignee:
  - '@builder-core'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 20:35'
labels:
  - layer-core
  - size-2
dependencies: []
modified_files:
  - packages/core/src/model/aisle.ts
  - packages/core/src/model/aisle.test.ts
  - packages/core/src/index.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R9, R11. See TASK-1.22's slice contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 core exports AISLES, aisleSection, groupByAisle, aisleNameKey and setItemAisle as the contract says, with unit tests including an unknown aisle grouping as other
- [x] #2 setItemAisle's stamp merges by the existing last-write-wins rule
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add packages/core/src/model/aisle.ts: AISLE_DEFS as a const-literal array (as const satisfies), AisleId derived from it so the id list cannot drift from AISLES, AisleDef, AISLES, aisleSection (unknown -> other), groupByAisle (returns AisleGroup[] in AISLES order, empty aisles left out), aisleNameKey (encodeURIComponent(normaliseName(name))), setItemAisle (plain restamp of the aisle field, matching setItemState/clearFromCart; two copies reconcile via mergeItem's existing last-write-wins rule, not inside the mutator).
2. Export the new names from packages/core/src/index.ts, grouped with the other model/item exports.
3. Unit tests in aisle.test.ts: AISLES order/labels, aisleSection for known and unknown ids, groupByAisle (order, empty aisles omitted, an unknown aisle grouped together with other as one other section in input order, empty input), aisleNameKey normalisation, setItemAisle (restamps only the aisle while id/weekId/addedBy/createdAt/name/amount/state/badges/deleted and the original item are all asserted unchanged; mergeItem keeps the later stamp's aisle in both merge orders, proving AC2's last-write-wins rule).
4. Run unit tests, pnpm check, pnpm typecheck.

### Risks
- No "other" aisle icon exists yet in packages/ui/src/icons; out of scope for core, noted for the UI/app subtasks that render labels.

### Proof
pnpm exec vitest run --project unit packages/core; pnpm check; pnpm typecheck.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented packages/core/src/model/aisle.ts: AISLES (ordered produce/dairy/meat/bakery/pantry/other, ids matching the existing section icon names), AisleId, AisleDef, aisleSection (unknown -> other), groupByAisle (AISLES order, empty aisles omitted), aisleNameKey, setItemAisle. Exported from packages/core/src/index.ts.

Plan note: an advisor review caught that setItemAisle's first draft used mergeStamped against the item's own current value inside the mutator, which silently no-ops on a stale stamp instead of restamping — inconsistent with setItemState/clearFromCart and with the contract's "SetItemAisle... stamps the item." Fixed to a plain restamp (stamped(aisle, stamp)); AC2's "merges by the existing last-write-wins rule" is proven via mergeItem reconciling two copies, mirroring item.test.ts's existing state test shape.

Evidence:
$ mise exec -- pnpm exec vitest run --project unit packages/core
 Test Files  17 passed (17)
      Tests  159 passed (159)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no errors)

$ mise exec -- pnpm check
checks passed (16 checks, all mode, 653 ms)

Note for the reviewer/UI subtasks: no "other" aisle icon exists yet in packages/ui/src/icons (only produce, dairy, meat, bakery, pantry); out of scope for core, flagging for whichever UI/app subtask renders aisle labels.

Files: packages/core/src/model/aisle.ts, packages/core/src/model/aisle.test.ts, packages/core/src/index.ts.

Addressed layer-review follow-ups:
1. The setItemAisle test now asserts id, weekId, addedBy, createdAt, name, amount, state, badges and deleted all unchanged, plus that the original item's aisle is untouched (previously it skipped weekId/addedBy/createdAt and never checked the original).
2. groupByAisle's unknown-aisle test now puts a 'household' item and an explicit 'other' item together and asserts one 'other' section with both, in input order.
3. The task plan is corrected via this edit: it no longer describes mergeStamped inside setItemAisle or the older-stamp-no-op / same-stamp tests, none of which exist in the final code.
4. AisleSection renamed to AisleGroup (it only differed from the aisleSection function by case).
5. AisleId is now derived from an `as const satisfies` literal array (AISLE_DEFS) instead of a separate union annotation, so AISLES and AisleId cannot drift. The aisle exports in packages/core/src/index.ts moved to sit with the other model/item exports instead of between the merge/* exports.

Re-ran checks after all five fixes:
$ mise exec -- pnpm exec vitest run --project unit packages/core
 Test Files  17 passed (17)
      Tests  159 passed (159)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no errors)

$ mise exec -- pnpm check
checks passed (16 checks, all mode, 442 ms)

Check `pnpm check && pnpm typecheck && pnpm test` exited 0

(12 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/polyfill/dangerous-internal.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/uuid/index.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/uuid/lib/sha1.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/uuid/lib/v35.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/uuid/lib/bytesToUuid.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/uuid/uuid.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/polyfill/CoreModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/EventEmitter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/ensureNativeModulesAreInstalled.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/NativeModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/SharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/SharedRef.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/Platform.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/environment/browser.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/NativeViewManagerAdapter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/errors/UnavailabilityError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/errors/CodedError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/requireNativeModule.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/registerWebModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/TypedArrays.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/PermissionsInterface.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/PermissionsHook.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/Refs.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/hooks/useReleasingSharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/hooks/useReleasingSharedObjectWithLifecycle.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/reload.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/LegacyEventEmitter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/NativeModulesProxy.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-modules-core/build/worklets/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/ExpoFontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/serverContext.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/FontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/Asset.fx.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/Asset.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/AssetSources.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo/build/utils/getBundleOrigin.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo/build/utils/getBundleUrl.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/AssetSourceResolver.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/PlatformUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/AssetUris.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/resolveAssetSource.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-asset/build/AssetHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-font/build/FontHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a0d0eb6a53f65958a/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files

 Test Files  159 passed (159)
      Tests  2125 passed (2125)
   Start at  15:34:52
   Duration  10.37s (transform 43.44s, setup 5.59s, import 138.20s, tests 48.19s, environment 25.54s)
```

Review: closed. Both criteria met. AC1: packages/core/src/index.ts exports AISLES, aisleSection, groupByAisle, aisleNameKey and setItemAisle; their behaviour matches TASK-1.22's slice contract, including its later additions (setItemAisle does not trim or fall back); aisle.test.ts covers an unknown aisle grouping as other. AC2: setItemAisle writes a stamped aisle and mergeItem applies mergeStamped to it; the test keeps the later stamp in both merge orders. Check: record-check fast exited 0 (16 checks, typecheck, 159 files and 2125 tests). The full tier was not run, as instructed for a pure core change. Findings, none filed: (low) no test pins aisleNameKey('!!') to an empty string, which suggestAisle's guard in TASK-1.22.7 relies on; that task's own test should cover it. (info) the branch predates b399e87, but touches only this task's file on the board, so merging keeps the contract additions. The missing other icon is settled by those additions (the app uses cart).
<!-- SECTION:NOTES:END -->
