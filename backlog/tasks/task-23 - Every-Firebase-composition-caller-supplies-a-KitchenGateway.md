---
id: TASK-23
title: Every Firebase composition caller supplies a KitchenGateway
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-20 21:38'
updated_date: '2026-10-20 21:40'
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
- [ ] #1 FirebaseModules.functions in compose-firebase.ts is required, not optional, and composeFirebaseApp always supplies kitchens with no conditional spread
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
