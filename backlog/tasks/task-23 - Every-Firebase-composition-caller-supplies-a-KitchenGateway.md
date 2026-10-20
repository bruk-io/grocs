---
id: TASK-23
title: Every Firebase composition caller supplies a KitchenGateway
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-20 21:38'
updated_date: '2026-10-20 22:07'
labels:
  - layer-app
  - size-1
dependencies:
  - TASK-22
modified_files:
  - apps/mobile/src/composition/compose-firebase.ts
  - apps/mobile/src/composition/two-client.emulator.test.ts
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-22 makes packages/application's Deps.kitchens required. apps/mobile/src/composition/compose-firebase.ts currently spreads kitchens into its ports conditionally, gated on FirebaseModules.functions being optional ('the Node emulator tests that only sync items leave it out'). Once Deps.kitchens is required, that conditional spread stops typechecking. The one caller that omits functions, apps/mobile/src/composition/two-client.emulator.test.ts, can supply it trivially: its EmulatorClient already carries functions and functionsFns unconditionally (used the same way in packages/providers-firebase/src/kitchen-gateway.emulator.test.ts and in native.ts), it just isn't passed through today. Blocks on TASK-22: the two changes must land together, since Deps.kitchens required with no composition root supplying it fails typecheck repo-wide.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 FirebaseModules.functions in compose-firebase.ts is required, not optional, and composeFirebaseApp always supplies kitchens with no conditional spread
- [ ] #2 two-client.emulator.test.ts supplies functions from its EmulatorClient the same way native.ts does, and the full repo (pnpm check, typecheck, test, test:emulator) passes with TASK-22 merged
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In apps/mobile/src/composition/compose-firebase.ts's FirebaseModules interface, change `readonly functions?: { readonly fns: FunctionsFns; readonly instance: unknown };` to a required field (drop the `?`), and update its doc comment (it's no longer true that any caller leaves it out).
2. In composeFirebaseApp, change `...(firebase.functions ? { kitchens: new FirebaseKitchenGateway(firebase.functions.fns, firebase.functions.instance) } : {}),` to an unconditional `kitchens: new FirebaseKitchenGateway(firebase.functions.fns, firebase.functions.instance),`.
3. In apps/mobile/src/composition/two-client.emulator.test.ts's signedInClient, add `functions: { fns: asSdk<FunctionsFns>(client.functionsFns), instance: client.functions }` to the firebase object passed to composeFirebaseApp (client already has both fields; import asSdk and FunctionsFns from @grocs/providers-firebase the same way apps/mobile/src/composition/native.ts and packages/providers-firebase/src/kitchen-gateway.emulator.test.ts do).
4. Run `pnpm -s typecheck` and confirm it is clean. This change typechecks on its own, against current main (packages/application's Deps.kitchens is still optional there) - providing an optional field is always valid, so nothing here needs TASK-22 present.
5. Run `vitest run --project app --project tools apps` and confirm it passes.
6. Report in the task notes; do not mark Done or merge - the orchestrator merges this and verifies the combined repo.

### Risks
A sibling task, TASK-22, makes packages/application's Deps.kitchens required; it only typechecks once this task's unconditional kitchens is in place. Land this one first (it's safe alone), then TASK-22.

### Proof
`pnpm typecheck` and `vitest run --project app --project tools apps` both pass on their own, before TASK-22 lands.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Completed Steps

All steps completed successfully:

1. **Changed FirebaseModules.functions from optional to required** in compose-firebase.ts
   - Dropped the `?` from the field definition
   - Updated doc comment to remove mention of emulator tests leaving it out

2. **Updated composeFirebaseApp** to supply kitchens unconditionally
   - Changed from conditional spread `...(firebase.functions ? { kitchens: ... } : {})` to unconditional `kitchens: new FirebaseKitchenGateway(...)`

3. **Added functions to the firebase object** in two-client.emulator.test.ts
   - Imported `FunctionsFns` from @grocs/providers-firebase
   - Added `functions: { fns: asSdk<FunctionsFns>(client.functionsFns), instance: client.functions }` to the firebase object passed to composeFirebaseApp in signedInClient
   - Matches the pattern used in apps/mobile/src/composition/native.ts and packages/providers-firebase/src/kitchen-gateway.emulator.test.ts

4. **Typecheck passed clean**
   - `pnpm -s typecheck` completed without errors
   - This change is safe on its own against current main since providing an optional field is always valid

5. **Tests passed**
   - `vitest run --project app --project tools apps` passed all 73 tests across 9 test files
   - No failures or errors

Ready for TASK-22 to land together as planned.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(633 earlier lines omitted)
```text
│  3.00 kB │ gzip:   1.16 kB
│  storybook-static/assets/TabItem-DO_WQBW_.js
│  3.21 kB │ gzip:   1.35 kB
│  storybook-static/assets/Chip-BBQiiRFD.js
│  3.25 kB │ gzip:   1.45 kB
│  storybook-static/assets/ItemPickerTemplate.stories-BDWCWUYW.js
│  4.34 kB │ gzip:   1.52 kB
│  storybook-static/assets/Button.stories-sNN3dC1C.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/TextField-BC9sKZ03.js
│  4.58 kB │ gzip:   1.76 kB
│  storybook-static/assets/PreferencesTemplate.stories-DMm4jNL7.js
│  4.58 kB │ gzip:   1.76 kB
│  storybook-static/assets/ItemRow-BgzP7XFR.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/GroceryListTemplate.stories-Bu-n0q9_.js
│  5.75 kB │ gzip:   1.97 kB
│  storybook-static/assets/Button-CxILU1aQ.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/Mascot-D4jB9WQY.js
│  11.37 kB │ gzip:   4.20 kB
│  storybook-static/assets/icons-BPDuhWkL.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-PNLDbSaq.js
│  17.31 kB │ gzip:   4.66 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-CGfbGzBZ.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-vq108xyw.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-DmUd5E6i.js
│  1,359.38 kB │ gzip: 391.72 kB

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

│  Vite ✓ built in 1.12s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 326 story views checked (axe, 44 x 44, images not compared)
```

### Review (philosophy:reviewer, 2026-10-20)

Verdict: NOT closed. Criterion #1 is met and ticked. Criterion #2 is half met and cannot be finished yet, because TASK-22 is not merged.

Criterion #1 (met): deb0ffd makes FirebaseModules.functions required in apps/mobile/src/composition/compose-firebase.ts (the '?' is gone and the doc comment no longer claims a caller omits it) and composeFirebaseApp supplies 'kitchens: new FirebaseKitchenGateway(firebase.functions.fns, firebase.functions.instance)' unconditionally, with the conditional spread removed.

Criterion #2 (not met): the first half holds - two-client.emulator.test.ts now passes 'functions: { fns: asSdk<FunctionsFns>(client.functionsFns), instance: client.functions }', the same shape as apps/mobile/src/composition/native.ts:79. The second half, 'the full repo ... passes with TASK-22 merged', has no evidence: TASK-22 is still In Progress and unmerged. packages/application/src/dispatch/types.ts:30 on main still reads 'readonly kitchens?: KitchenGateway;', and no TASK-22 commit exists on any branch. Everything below therefore ran against a tree where Deps.kitchens is still optional - exactly the state this task's own plan (step 4) called safe and said proves nothing about the combined repo.

What was run and passed, on main at 62f27be, TASK-22 absent:
- mise exec -- pnpm check: checks passed (14 checks, all mode)
- mise exec -- pnpm typecheck: clean
- mise exec -- npx vitest run --project app --project tools apps: 9 files, 73 tests
- mise exec -- pnpm test: 103 files, 1370 tests
- mise exec -- pnpm test:emulator: 8 files, 70 tests, including this task's two-client.emulator.test.ts (4 tests in the emulator project) - the file the change touches is only exercised here, and the worker's notes did not cover it, so the reviewer ran it
No check reformatted or fixed a file as it ran.

To close: merge TASK-22, re-run pnpm check, typecheck, test and test:emulator on the combined tree, then tick #2. No code change is needed in this task. Nothing else blocks it; the change matches its plan exactly, and no bug or security finding was found.

Note: the full-tier check block recorded above ran under 'mise exec --'; plain pnpm in a fresh shell here resolves Node v22 against engines.node >=24.12.
<!-- SECTION:NOTES:END -->
