---
id: TASK-1.22.7
title: 'Application: AddItem uses the aisle memory; SetItemAisle; suggestAisle'
status: Done
assignee:
  - '@builder-application'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 21:08'
labels:
  - layer-application
  - size-3
dependencies:
  - TASK-1.22.5
modified_files:
  - packages/application/src/commands/add-item.ts
  - packages/application/src/commands/add-item.scenario.test.ts
  - packages/application/src/commands/set-item-aisle.ts
  - packages/application/src/commands/set-item-aisle.scenario.test.ts
  - packages/application/src/commands/index.ts
  - packages/application/src/queries/suggest-aisle.ts
  - packages/application/src/queries/suggest-aisle.test.ts
  - packages/application/src/index.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R11, R14. See TASK-1.22's slice contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 AddItem with no aisle takes the remembered one, else the default; with an aisle it remembers it
- [x] #2 SetItemAisle stamps the item and remembers the aisle
- [x] #3 A scenario test proves a cleared item's aisle is still suggested (R14)
- [x] #4 suggestAisle returns the remembered aisle or null
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. AddItem (add-item.ts): validate an explicit `aisle` against core's AISLES (else `invalid-aisle` error); when none is given, look up aisleFor(aisleNameKey(name)) and fall back to the default on a null or a rejection; when one is given, write the item first, then fire-and-forget rememberAisle (caught, not awaited) so a stalled write can't delay the result (R16).
2. New command SetItemAisle (set-item-aisle.ts): same aisle validation, find the item (item-not-found otherwise), setItemAisle + mergeItem (awaited), then fire-and-forget rememberAisle the same way. Register in commands/index.ts and index.ts.
3. New query suggestAisle (queries/suggest-aisle.ts): aisleNameKey(name) === '' returns null without calling aisleFor (core's review addition, e.g. for '!!'); otherwise reads aisleFor. Register in index.ts.
4. Tests: extend add-item.scenario.test.ts (suggestion taken, default when none remembered, explicit aisle remembers it, aisleFor rejection still adds with default, rememberAisle rejection still succeeds, a stalled rememberAisle doesn't delay the result, invalid aisle is an error, R14 scenario via ClearCart then re-add). New set-item-aisle.scenario.test.ts (stamps + remembers, item-not-found, not-signed-in, invalid aisle, rememberAisle rejection doesn't fail the command). New suggest-aisle.test.ts (remembered aisle, null when none, '!!' returns null without calling aisleFor).
5. Run vitest (application project), pnpm check, pnpm typecheck; fix; record in notes; commit.

### Risks
- Not awaiting rememberAisle while still proving it was attempted needs a test that can observe the attempt (e.g. a store whose rememberAisle resolves after a flushable delay, or records a call) without re-adding a timing race; I will use a controllable promise and assert the command resolves before it settles.
- AddItem's existing error-shape tests construct a full fake SyncStore inline; adding aisleFor/rememberAisle already appears in those fakes, so only the add-item.ts logic changes, not those tests.
- suggestAisle and the application-level AISLES check must only use what core already exports (AISLES, aisleNameKey, setItemAisle) - no new core work in this task.

### Proof
pnpm exec vitest run --project unit packages/application output pasted into notes; pnpm check and pnpm typecheck output pasted into notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented, not closed (reviewer closes).

AddItem (add-item.ts): an explicit aisle must be one of core's AISLES, else `invalid-aisle`. With no aisle, awaits aisleFor(aisleNameKey(name)) and falls back to the default on null or a rejection (caught). The item write is awaited first; only then, if an aisle was explicitly given, rememberAisle is fired without awaiting and its rejection is caught, so a stalled or failing write never delays or fails the add (R16). Both ports are already wrapped by instrumentPort at the composition root, so rememberAisle's outcome is logged the same way every other port call is.

New SetItemAisle command (set-item-aisle.ts, registered in commands/index.ts and index.ts): same aisle validation, item-not-found if the item isn't on the list, setItemAisle + mergeItem awaited, then the same fire-and-forget, caught rememberAisle.

New suggestAisle query (queries/suggest-aisle.ts, registered in index.ts): aisleNameKey(name) === '' (e.g. '!!') returns null without calling aisleFor, per core's review addition. Otherwise reads aisleFor directly.

Exported names: addItem/AddItem/ItemAdded (unchanged), setItemAisleCommand/SetItemAisle/ItemAisleChanged, suggestAisle.

Tests added: add-item.scenario.test.ts gained an "aisle memory (R11, R14)" describe block - takes the remembered aisle, falls back to default with nothing remembered, an explicit aisle stamps and remembers, an invalid aisle is rejected and stores nothing, the R14 scenario (add with an aisle, tick, ClearCart, add the same name with none, get that aisle back), a failing aisleFor still adds with the default, a failing rememberAisle still succeeds, and a stalled (never-settling) rememberAisle does not delay the result. New set-item-aisle.scenario.test.ts mirrors SetItemState's scenario tests plus the same aisle-memory-never-blocks cases. New suggest-aisle.test.ts covers the remembered aisle, null when none, and '!!' returning null without calling aisleFor (asserted via a spy wrapper).

Evidence:
$ mise exec -- pnpm exec vitest run --project unit packages/application
 Test Files  22 passed (22)
      Tests  136 passed (136)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no output, exit 0)

$ mise exec -- pnpm check
$ node tools/checks/run.ts --mode all
checks passed (16 checks, all mode, 507 ms)

Follow-up from the layer review (same worktree, merged feat/aisles again first: fast-forward, no conflicts, brought in TASK-1.22.10's aisle-doc codec, unrelated to this layer).

Required:
1. set-item-aisle.scenario.test.ts: added a 'both members (R18, R47)' describe block - two tests prove the later stamp wins whichever of two different aisles on one item arrives first (dispatched in both orders), and a third proves one member offline: a queued older aisle change sent after the other's newer one does not overwrite it (R16), using the queueing-store pattern from add-item.scenario.test.ts's "one member offline" test.
2. suggest-aisle.ts: aisleFor's rejection is now caught and returns null too, not just the empty-nameKey case - the memory only ever helps, and the screen calls suggestAisle on every keystroke. New test in suggest-aisle.test.ts proves it.

Smaller:
3. set-item-aisle.scenario.test.ts's 'a failing rememberAisle still lets the change succeed' now sets the clock before dispatching, so the item's existing aisle stamp and the new one are never a same-at tie.
4. add-item.ts now takes one `stamp` for both the item and the aisle memory, instead of calling clock.now() twice.
5. set-item-aisle.ts now skips rememberAisle when aisleNameKey(item.name.value) is '' (defensive; createExtraItem already rejects a name that would produce one, so this cannot trigger from AddItem/SetItemAisle today, but matches the guard core's review asked for and protects against a future relaxation).
6. Pulled the repeated SyncStore wrapper into packages/application/src/testing/wrap-sync-store.ts (exported via the existing testing/index.ts subpath), and pointed add-item.scenario.test.ts, set-item-aisle.scenario.test.ts and suggest-aisle.test.ts at it instead of three local copies.

Evidence:
$ mise exec -- pnpm exec vitest run --project unit packages/application
 Test Files  22 passed (22)
      Tests  140 passed (140)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no output, exit 0)

$ mise exec -- pnpm check
$ node tools/checks/run.ts --mode all
checks passed (16 checks, all mode, 579 ms)

Check `pnpm check && pnpm typecheck && pnpm test` exited 0

(47 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-asset/build/Asset.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-asset/build/AssetSources.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo/build/utils/getBundleOrigin.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo/build/utils/getBundleUrl.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-asset/build/AssetSourceResolver.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-asset/build/PlatformUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-asset/build/AssetUris.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-asset/build/resolveAssetSource.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-asset/build/AssetHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-a6eb0ca28c8248f91/node_modules/expo-font/build/FontHooks.js" points to missing source files

 Test Files  163 passed (163)
      Tests  2172 passed (2172)
   Start at  16:07:48
   Duration  10.58s (transform 47.15s, setup 4.84s, import 138.45s, tests 49.87s, environment 25.65s)
```

Review: closed. 4/4 criteria met, judged against the diff of 558c8f9 and fe4f4e4 and TASK-1.22's contract and additions.

AC1: add-item.ts validates an explicit aisle, takes aisleFor otherwise, falls back to the default on null or rejection, and fires rememberAisle uncaught-free after the write. Scenario tests cover each path. AC2: set-item-aisle.ts stamps through setItemAisle and mergeItem, then remembers; registered and exported; tests assert both the stored aisle and aisleFor. AC3: add-item.scenario.test.ts adds with an aisle, ticks, dispatches ClearCart, adds the same name with none, and gets dairy back. AC4: suggest-aisle.ts returns the remembered aisle or null, including '!!' without calling aisleFor and a failed lookup.

Layer review: all six confirmed in fe4f4e4 (R47 both-order and offline tests; suggestAisle catches; clock set before dispatch; one stamp in AddItem; nameKey guard in SetItemAisle; wrapSyncStore shared).

Check: fast tier only, as the launch directed because another job may hold port 4498: pnpm check, typecheck and test exited 0 (163 files, 2172 tests). The full tier did not run, so emulator, release, storybook and visual are unproven at this commit. Nothing was reformatted; only this task file changed.

Findings, none filed. (low) AddItem and suggestAisle pass a remembered aisle on unvalidated, so a hand-written memory document could stamp an id outside AISLES; aisleSection groups it as other, so nothing breaks. (low) SetItemAisle's empty-nameKey guard has no test; createExtraItem makes it unreachable today. (low) AddItem now awaits aisleFor before its write, so a slow getDoc delays an add with no aisle; bounded in practice by the fallback to cache, not separately tested. (info) Offline, FirestoreSyncStore.mergeItem still uses a transaction, so the awaited item write in both commands has the existing R16 gap that decision-7 addresses; the fire-and-forget memory write does not fix that and is not this task's to fix. (info) The notes' modified-files line omits testing/wrap-sync-store.ts and testing/index.ts.
<!-- SECTION:NOTES:END -->
