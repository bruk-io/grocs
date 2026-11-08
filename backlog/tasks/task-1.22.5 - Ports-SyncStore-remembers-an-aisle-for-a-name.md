---
id: TASK-1.22.5
title: 'Ports: SyncStore remembers an aisle for a name'
status: Done
assignee:
  - '@builder-ports'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 20:47'
labels:
  - layer-ports
  - size-2
dependencies:
  - TASK-1.22.4
modified_files:
  - packages/ports/src/sync-store/port.ts
  - packages/ports/src/sync-store/fake.ts
  - packages/ports/src/sync-store/contract.ts
  - packages/ports/src/sync-store/fake.test.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R11, R14. See TASK-1.22's slice contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 SyncStore has rememberAisle and aisleFor, and the fake and contract suite cover a later stamp winning, an older stamp not overwriting, and an unknown name reading null
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add rememberAisle(kitchenId, nameKey, aisle: Stamped<string>) and aisleFor(kitchenId, nameKey): Promise<string | null> to the SyncStore port, documented by intent (R11, R14), not by Firestore vocabulary.
2. Implement both in InMemorySyncStore: a Map<string, Stamped<string>> keyed by kitchenId/nameKey; rememberAisle merges with mergeStamped so a later stamp wins and the same or an older stamp changes nothing; aisleFor reads the stored value or null.
3. Add syncStoreAisleContract in contract.ts, kept separate (like the meal/recipe contracts) so a provider without aisle memory yet keeps passing the rest: unknown name reads null, remembering then reading back, a later stamp winning, an older stamp arriving after a newer one not overwriting it, and the same stamp twice changing nothing.
4. Wire syncStoreAisleContract into fake.test.ts against InMemorySyncStore, and export it (plus the new AisleMemoryStore type) from test-support.ts (@grocs/ports/testing), same as the other contract suites, so TASK-1.22.6 can import it.
### Risks
- Adding rememberAisle/aisleFor as required methods on SyncStore would leave FirestoreSyncStore and MemorySyncStore (providers) failing `pnpm typecheck` until TASK-1.22.6 implements them there, and the pre-commit hook runs full typecheck. Resolved by declaring both methods optional on the interface for now, with a doc comment naming TASK-1.22.6 and the ports follow-up that makes them required once both providers implement them. The contract suite itself still demands the real (required) shape via a local AisleMemoryStore = SyncStore & Required<Pick<SyncStore, 'rememberAisle' | 'aisleFor'>> type, so nothing tests against the weaker optional signature.
- Because the methods are optional until TASK-1.22.6 lands, TASK-1.22.7 (application) will otherwise have to write `store.aisleFor?.(...)`; noted for the orchestrator so a ports follow-up to drop the `?` is queued after 1.22.6, since the application-layer builder cannot edit packages/ports itself.
### Proof
- pnpm exec vitest run --project unit packages/ports: 7 files, 74 tests passed (up from 73; the new "same stamp twice" case added).
- pnpm -s typecheck: clean repo-wide (the optional-method step avoids the provider/application fallout a required signature would have caused).
- pnpm check: 16 checks passed.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented rememberAisle(kitchenId, nameKey, aisle: Stamped<string>) and aisleFor(kitchenId, nameKey): Promise<string | null> on SyncStore (R11, R14), InMemorySyncStore, a new syncStoreAisleContract in contract.ts, and wired both into fake.test.ts and test-support.ts (@grocs/ports/testing) export.

Both methods are declared optional (`rememberAisle?`, `aisleFor?`) on the SyncStore interface for now, each with a doc comment naming TASK-1.22.6. A required signature would have failed `pnpm typecheck` on FirestoreSyncStore and MemorySyncStore (providers), which don't implement them yet, and the pre-commit hook runs full typecheck - exactly the fallout the task description anticipated. The contract suite is not weakened by this: syncStoreAisleContract's `make` is typed to return an `AisleMemoryStoreSubject` whose store is `SyncStore & Required<Pick<SyncStore, 'rememberAisle' | 'aisleFor'>>`, so it still demands the real, required shape; InMemorySyncStore satisfies it structurally because both methods are implemented (not optional) on the class.

Follow-up for the orchestrator to queue: once TASK-1.22.6 gives both providers an implementation, a small ports follow-up should drop the `?` and make rememberAisle/aisleFor required on SyncStore again. Until then, TASK-1.22.7 (application) will need `store.aisleFor?.(...)` / a null-check, since the application-layer agent cannot edit packages/ports itself to remove the optionality.

`pnpm exec vitest run --project unit packages/ports`:
```
 Test Files  7 passed (7)
      Tests  74 passed (74)
```

`pnpm -s typecheck`: clean, no output (exit 0), repo-wide including providers/application/apps.

`pnpm check`:
```
checks passed (16 checks, all mode, 1364 ms)
```

Review follow-up addressed: two more cases in syncStoreAisleContract (does not mix the aisle memory of two kitchens, using the otherKitchenId guard; keeps names apart), plus the requested wording fixes.

port.ts: rememberAisle's doc now cites R11 for suggestion too and names core's aisleNameKey(name) as nameKey's source, and "the same stamp twice" now reads "the same stamp and value twice".

test-support.ts: exports both AisleMemoryStore and AisleMemoryStoreSubject from @grocs/ports/testing (was AisleMemoryStore alone).

`pnpm exec vitest run --project unit packages/ports`:
```
 Test Files  7 passed (7)
      Tests  76 passed (76)
```

`pnpm -s typecheck`: clean, repo-wide.

`pnpm check`:
```
checks passed (16 checks, all mode, 604 ms)
```

Check `pnpm check && pnpm typecheck && pnpm test` exited 0

(12 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/polyfill/dangerous-internal.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/uuid/index.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/uuid/lib/sha1.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/uuid/lib/v35.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/uuid/lib/bytesToUuid.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/uuid/uuid.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/polyfill/CoreModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/EventEmitter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/ensureNativeModulesAreInstalled.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/NativeModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/SharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/SharedRef.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/Platform.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/environment/browser.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/NativeViewManagerAdapter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/errors/UnavailabilityError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/errors/CodedError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/requireNativeModule.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/registerWebModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/TypedArrays.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/PermissionsInterface.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/PermissionsHook.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/Refs.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/hooks/useReleasingSharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/hooks/useReleasingSharedObjectWithLifecycle.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/reload.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/LegacyEventEmitter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/NativeModulesProxy.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-modules-core/build/worklets/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/ExpoFontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/serverContext.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/FontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/Asset.fx.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/Asset.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/AssetSources.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo/build/utils/getBundleOrigin.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo/build/utils/getBundleUrl.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/AssetSourceResolver.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/PlatformUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/AssetUris.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/resolveAssetSource.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-asset/build/AssetHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a60acc788fe97692f/node_modules/expo-font/build/FontHooks.js" points to missing source files

 Test Files  159 passed (159)
      Tests  2132 passed (2132)
   Start at  15:47:17
   Duration  10.56s (transform 44.91s, setup 5.96s, import 132.89s, tests 50.31s, environment 24.86s)
```

Review: closed. #1 met against 9ee0f6b and 4c9a154. SyncStore declares rememberAisle and aisleFor with the slice contract's signatures; InMemorySyncStore implements them with mergeStamped; syncStoreAisleContract runs against the fake in fake.test.ts and covers a later stamp winning, an older stamp not overwriting, an unknown name reading null, plus the same stamp and value twice, two kitchens and two names. Exported from @grocs/ports/testing for TASK-1.22.6.

Check: fast tier only, as the orchestrator directed (no emulator involved, port 4498 held by another job); record-check fast exited 0 with 16 checks, typecheck, and 159 files, 2132 tests. Ports alone: 7 files, 76 tests. The full tier (emulator, release, storybook, visual) was not run. The contract has not yet run against a real provider; TASK-1.22.6 does that.

Findings, none filed. (medium) The methods are optional on the port, a departure from the slice contract's plain 'SyncStore gains'. The orchestrator owns making them required when TASK-1.22.6 lands; no board task records it yet, so until it happens a provider can omit them and still typecheck, and TASK-1.22.7 needs optional calls. Left with the orchestrator. (low) 'same stamp and value twice' cannot fail by reading back, because a rewrite and a no-op both read the same value; the contract's promise is still met by mergeStamped. Answered here. (low) The two-kitchen case returns early when a subject has no otherKitchenId, so TASK-1.22.6 must pass one; the same guard the other contracts use, and the fake passes it. Answered here. (low) The plan's Proof still says 74 tests; the notes carry the current 76. Answered here. (info) Depends on TASK-1.22.4, still In Progress on this board; this branch already contains its merge.
<!-- SECTION:NOTES:END -->
