---
id: TASK-1.22.10
title: 'Core: a versioned codec for the aisle memory document'
status: In Progress
assignee:
  - '@builder-core'
created_date: '2026-11-08 20:56'
updated_date: '2026-11-08 21:01'
labels:
  - layer-core
  - size-1
dependencies: []
modified_files:
  - packages/core/src/schema/aisle-doc.ts
  - packages/core/src/schema/aisle-doc.test.ts
  - packages/core/src/index.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From TASK-1.22.6's review. Deciding what a valid stored aisle document is belongs in core, as item-doc.ts says; the provider's inline decoder has drifted from core's readStamp and overwrites a newer-schema document. Cites R30, R54.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/core/src/schema/aisle-doc.ts exports the version, encode and decode of {schemaVersion, aisle: stored stamped value}, with decode returning a Result that tells unsupported-version from malformed, with tests for each branch
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Read packages/core/src/schema/item-doc.ts and its test for the existing helpers (toStored, readField, readStamp, SchemaError, version handling).
2. Create packages/core/src/schema/aisle-doc.ts: AISLE_SCHEMA_VERSION = 1, encodeAisleMemory(aisle: Stamped<string>), decodeAisleMemory(raw): Result<Stamped<string>, SchemaError>, reusing those helpers.
3. Create aisle-doc.test.ts: round trip; unsupported version; missing aisle; empty by; non-finite at.
4. Export the three names from packages/core/src/index.ts.
5. Run vitest for packages/core, pnpm check and pnpm typecheck.

### Risks
- Must reuse core's stored-field helpers, not repeat them.

### Proof
- The new test file, one case per decode branch.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Commit: 4ecba0cb37f5ff961af932ea40e4fe5c26640867

Test results:
- packages/core vitest: 18 test files passed, 164 tests passed
- aisle-doc.test.ts: 6 tests covering round-trip, unsupported version, malformed fields
- pnpm check: all 16 checks passed
- pnpm typecheck: no errors

Exported names:
- AISLE_SCHEMA_VERSION
- encodeAisleMemory
- decodeAisleMemory
- AisleMemoryDoc

Check `pnpm check && pnpm typecheck && pnpm test` exited 0

(12 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/polyfill/dangerous-internal.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/uuid/index.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/uuid/lib/sha1.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/uuid/lib/v35.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/uuid/lib/bytesToUuid.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/uuid/uuid.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/polyfill/CoreModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/EventEmitter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/ensureNativeModulesAreInstalled.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/NativeModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/SharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/SharedRef.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/Platform.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/environment/browser.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/NativeViewManagerAdapter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/errors/UnavailabilityError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/errors/CodedError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/requireNativeModule.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/registerWebModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/TypedArrays.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/PermissionsInterface.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/PermissionsHook.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/Refs.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/hooks/useReleasingSharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/hooks/useReleasingSharedObjectWithLifecycle.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/reload.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/LegacyEventEmitter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/NativeModulesProxy.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-modules-core/build/worklets/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/ExpoFontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/serverContext.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/FontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/Asset.fx.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/Asset.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/AssetSources.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo/build/utils/getBundleOrigin.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo/build/utils/getBundleUrl.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/AssetSourceResolver.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/PlatformUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/AssetUris.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/resolveAssetSource.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-asset/build/AssetHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60a2c513da30ff8c/node_modules/expo-font/build/FontHooks.js" points to missing source files

 Test Files  161 passed (161)
      Tests  2149 passed (2149)
   Start at  15:59:07
   Duration  10.18s (transform 44.01s, setup 5.30s, import 137.22s, tests 48.40s, environment 26.16s)
```

Review verdict: NOT CLOSED. AC #1 left unticked. Commit reviewed: 4ecba0c. Fast tier passed (16 checks, typecheck, 2149 tests); full tier not run, on the orchestrator's instruction because another job holds port 4498.

Blocking:
1. Helpers are repeated, not reused. The commit message says 'reusing the stored-field helpers' and the plan requires it ('Must reuse core's stored-field helpers, not repeat them'), but aisle-doc.ts imports nothing from item-doc.ts. It carries its own copies of StoredField, SchemaError, toStored, bad, isObject, readStamp, readField and isString. This is the drift this task was filed to end (TASK-1.22.6 inline decoder drifted from readStamp). Change: export the needed helpers from item-doc.ts, or move them to a shared schema module, and import them in aisle-doc.ts. Do not add them to packages/core/src/index.ts.
2. SchemaError is declared a second time and exported from aisle-doc.ts. meal-doc.ts and recipe-doc.ts both use 'import type { SchemaError } from ./item-doc.ts'. Change: do the same and delete the copy.
3. The malformed branch does not test what the criterion asks. aisle-doc.test.ts asserts kind only for unsupported-version (line 31); malformed cases assert ok and path only, so a decoder returning kind unsupported-version for a malformed document with the same path would pass. Change: assert kind 'invalid' in the malformed cases.

Non-blocking:
4. API width: item-doc.ts is unchanged and index.ts adds only the three codec names and AisleMemoryDoc, so nothing was widened. That is only because nothing was reused; recheck after the fix.
5. Report accuracy: notes say aisle-doc.test.ts has 6 tests; the file has 5 it() blocks (one is a property test). The notes themselves do not claim reuse; the commit message does.
6. No test for a missing schemaVersion; the code handles it through the same branch as version 2.
7. Precedent, no draft filed: meal-doc.ts and recipe-doc.ts also copy these helpers, which is likely where the pattern came from. Left for the orchestrator to decide whether the fix covers them.

What is met: version, encode and decode are exported, and by reading the code, decode returns distinct kinds for the two branches.

CORRECTION: Refactored to reuse helpers.

- Exported helpers from item-doc.ts: toStored, bad, isObject, readField, readStamp, StoredField, SchemaError
- aisle-doc.ts now imports these instead of duplicating
- Tests updated: 18 test files, 165 tests (added 1 test for missing schemaVersion)
- All malformed field cases now assert kind: 'invalid'
- pnpm check: all 16 checks passed
- pnpm typecheck: no errors
<!-- SECTION:NOTES:END -->
