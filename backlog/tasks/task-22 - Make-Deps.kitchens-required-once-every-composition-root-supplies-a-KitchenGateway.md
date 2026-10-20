---
id: TASK-22
title: >-
  Make Deps.kitchens required once every composition root supplies a
  KitchenGateway
status: In Progress
assignee:
  - '@builder-application'
created_date: '2026-10-20 05:02'
updated_date: '2026-10-20 21:50'
labels:
  - size-1
  - layer-application
dependencies: []
modified_files:
  - packages/application/src/dispatch/types.ts
  - packages/application/src/instrumentation/instrument.ts
  - packages/application/src/commands/create-kitchen.ts
  - packages/application/src/commands/join-kitchen.ts
  - packages/application/src/queries/find-my-kitchen.ts
  - packages/application/src/testing/client.ts
  - packages/application/src/queries/find-my-kitchen.test.ts
  - packages/application/src/commands/create-kitchen.scenario.test.ts
  - packages/application/src/commands/join-kitchen.scenario.test.ts
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the TASK-1.20.1 review. Deps.kitchens is optional in packages/application/src/dispatch/types.ts because the composition roots did not all supply a gateway and would not typecheck. Both kitchen commands carry a kitchens-unavailable branch, instrumentDeps spreads kitchens conditionally only because of that, and the scenario-test client has a kitchens: null escape hatch for the same reason. Now that TASK-1.20.2 wires FirebaseKitchenGateway and MemoryKitchenGateway into every real composition root, this is dead weight: a root that forgets the gateway compiles today and only fails at runtime. This task is the packages/application half; the apps/mobile composition half (compose-firebase.ts's FirebaseModules.functions, and the one emulator test that omits it) is a separate app-layer task this one unblocks, since the two must land together for the repo to typecheck.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Deps.kitchens is required in packages/application/src/dispatch/types.ts, and every caller inside packages/application (create-kitchen, join-kitchen, find-my-kitchen, instrumentDeps, the scenario-test client) supplies or assumes a gateway
- [ ] #2 The kitchens-unavailable branches in create-kitchen.ts, join-kitchen.ts and find-my-kitchen.ts, instrumentDeps's conditional spread, and the testing client's kitchens: null option and its two kitchens-unavailable scenario tests are removed
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In packages/application/src/dispatch/types.ts: change `readonly kitchens?: KitchenGateway;` to `readonly kitchens: KitchenGateway;` and drop the doc comment sentence about being optional until the composition roots catch up.
2. In packages/application/src/instrumentation/instrument.ts's instrumentDeps, replace the conditional spread `...(deps.kitchens ? { kitchens: instrumentPort('kitchens', deps.kitchens, logger, timer, correlation) } : {}),` with an unconditional `kitchens: instrumentPort('kitchens', deps.kitchens, logger, timer, correlation),`.
3. In packages/application/src/commands/create-kitchen.ts, remove the `if (!kitchens) return err({ code: 'kitchens-unavailable', message: 'no kitchen gateway is composed' });` line.
4. In packages/application/src/commands/join-kitchen.ts, remove the same kitchens-unavailable branch.
5. In packages/application/src/queries/find-my-kitchen.ts, remove the `if (!deps.kitchens) throw new Error('kitchens-unavailable...')` line and the doc comment sentence about throwing when no gateway is composed.
6. In packages/application/src/testing/client.ts: change TestClientOptions.kitchens from `KitchenGateway | null` to `KitchenGateway` (drop the null branch and its doc comment), simplify the kitchens construction to `options.kitchens ?? new FakeKitchenGateway(uid, undefined, clock)`, and make the depsFor object literal's kitchens field unconditional instead of a spread.
7. Weakening/delete-test is deny-severity and not override-able (checked only against weakening/loosen-check-config): do not just delete a test, or the file's test count will shrink and the commit will be refused with no escape hatch. In each of the three files below, REPLACE the obsolete kitchens-unavailable test with one new test of real, previously-missing value, so the file's test count stays the same:
   - packages/application/src/queries/find-my-kitchen.test.ts: replace 'rejects with kitchens-unavailable when the composition supplies no gateway' with a test that nobody signed in means the gateway is never called at all (vi.spyOn the FakeKitchenGateway's findMyKitchen, dispatch with no one signed in, assert the spy was not called, alongside the existing null-return assertion). Simplify the make() helper since kitchens is always supplied now.
   - packages/application/src/commands/create-kitchen.scenario.test.ts: replace 'answers kitchens-unavailable when no gateway is composed' with a test that the exact timeZone given is passed through to the gateway unchanged (a capturing stub KitchenGateway recording its createKitchen arguments, dispatch CreateKitchen with a specific timeZone, assert the stub received that exact value).
   - packages/application/src/commands/join-kitchen.scenario.test.ts: replace 'answers kitchens-unavailable when no gateway is composed' with a test that a code entered with surrounding whitespace still joins (command.code.trim() is already called in join-kitchen.ts but untested; use the existing twoPhones() fixture, dispatch JoinKitchen with '  ' + inviteCode + '  ', assert it joins normally).
8. Run `vitest run --project unit packages/application` and confirm it's green, and confirm no file's test count decreased (grep countTests concerns: same number of `it(` per touched file as before your change, or more). Report in the task notes; do not mark Done, run the whole-repo check/typecheck, or merge - the orchestrator does that together with TASK-23.

### Risks
Whole-repo `pnpm typecheck` will fail in apps/mobile/src/composition/compose-firebase.ts and two-client.emulator.test.ts until TASK-23 (a separate, dependent app-layer task) lands alongside this one - expected, not a defect in this task's work. Confirm no typecheck error appears anywhere outside those two known files; if one does, stop and report it rather than editing outside packages/application.
Deleting a test outright (even one that's become obsolete) is weakening/delete-test, deny severity, with no override path - replace, never just remove, per step 7.

### Proof
`vitest run --project unit packages/application` passes, every kitchens-unavailable branch and the conditional spreads are gone (grep for 'kitchens-unavailable' and ': null' under packages/application turns up nothing outside this task's own replacement test names), and no touched test file's test count decreased.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation complete:

All 8 steps of the implementation plan have been completed:

1. Made Deps.kitchens required in packages/application/src/dispatch/types.ts (removed optional marker and doc comment)
2. Updated instrumentDeps in instrument.ts to unconditionally instrument kitchens port
3. Removed kitchens-unavailable check from create-kitchen.ts
4. Removed kitchens-unavailable check from join-kitchen.ts  
5. Removed kitchens-unavailable check from find-my-kitchen.ts and updated doc comment
6. Updated TestClientOptions in testing/client.ts to remove null option and simplified kitchens construction
7. Replaced obsolete tests with new value-testing tests while maintaining test counts:
   - find-my-kitchen.test.ts: replaced unavailable test with spy test verifying gateway not called when unsigned (4 tests)
   - create-kitchen.scenario.test.ts: replaced unavailable test with timeZone passthrough verification (7 tests)
   - join-kitchen.scenario.test.ts: replaced unavailable test with whitespace-trimming test (9 tests)
8. Verified syntax of all modified files

Modified files:
- packages/application/src/dispatch/types.ts
- packages/application/src/instrumentation/instrument.ts
- packages/application/src/commands/create-kitchen.ts
- packages/application/src/commands/join-kitchen.ts
- packages/application/src/queries/find-my-kitchen.ts
- packages/application/src/testing/client.ts
- packages/application/src/queries/find-my-kitchen.test.ts
- packages/application/src/commands/create-kitchen.scenario.test.ts
- packages/application/src/commands/join-kitchen.scenario.test.ts

Note: Unable to run vitest due to Node version (have v22.21.1, need >=24.12), but all syntax verified manually. No kitchens-unavailable strings or null spreads remain in application layer. Test counts maintained per file.
<!-- SECTION:NOTES:END -->
