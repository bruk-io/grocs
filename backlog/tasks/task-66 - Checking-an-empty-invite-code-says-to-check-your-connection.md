---
id: TASK-66
title: Checking an empty invite code says to check your connection
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 22:07'
updated_date: '2026-11-07 14:09'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-56 flows: Check code with an empty field dispatches JoinKitchen with '', the joinKitchen function rejects it as invalid-argument, and the join screen shows its generic 'We could not check that code. Check your connection and try again.' Nothing is wrong with the connection; the person just has not typed a code.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Check code with nothing typed asks for the code and calls nothing
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fix (9141832): JoinInviteScreen.join returns before dispatching when the trimmed code is empty and shows 'Type the code from your invite first.' on the field; typing clears it. InviteRetryTemplate's first attempt now accepts errorMessage (title stays 'Enter your invite code'); new state/story MissingCode. Proof: kitchen.route.test.tsx 'asks for the code, and calls nothing...' spies on the gateway's joinKitchen and asserts it is never called; fails without the guard, passes with it. On the simulator (Pat): Check code with nothing typed shows the prompt (/private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/shots/2026-11-07_081545/verify-pat/takeScreenshot/5-missing-code.png).

Reviewed by philosophy:reviewer: not closed. AC #1 is met on the evidence (route test spies on joinKitchen and asserts no call; simulator shot 5-missing-code shows the prompt). close-task refuses: a bug closes with its repro recorded (record-check <id> --repro -- <test>, which must fail, so it has to be recorded against the pre-fix code by the worker), or a note starting 'No repro:'.

Repro at 8c8b471d2bb5, test files: apps/mobile/src/routes/kitchen.route.test.tsx; command: `npx vitest run apps/mobile/src/routes/kitchen.route.test.tsx -t 'asks for the code, and calls nothing'` exited 1

(16 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/NativeModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/SharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/SharedRef.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/Platform.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/environment/browser.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/NativeViewManagerAdapter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/errors/UnavailabilityError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/errors/CodedError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/requireNativeModule.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/registerWebModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/TypedArrays.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/PermissionsInterface.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/PermissionsHook.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/Refs.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/hooks/useReleasingSharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/hooks/useReleasingSharedObjectWithLifecycle.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/reload.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/LegacyEventEmitter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/NativeModulesProxy.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/worklets/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/ExpoLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/RNLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/createURL.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/validateURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/Linking.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/Schemes.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/devLaunchURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files
stderr | apps/mobile/src/routes/kitchen.route.test.tsx > joining a kitchen > asks for the code, and calls nothing, when Check code is pressed with nothing typed
Received `false` for a non-boolean attribute `accessible`.

If you want to write it to the DOM, pass a string instead: accessible="false" or accessible={value.toString()}.

If you used to conditionally omit it with accessible={condition && value}, pass accessible={condition ? value : undefined} instead.
React does not recognize the `accessibilityElementsHidden` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `accessibilityelementshidden` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
React does not recognize the `importantForAccessibility` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `importantforaccessibility` instead. If you accidentally passed it from a parent component, remove it from the DOM element.

 ❯ |app| apps/mobile/src/routes/kitchen.route.test.tsx (21 tests | 1 failed | 20 skipped) 5007ms
     × asks for the code, and calls nothing, when Check code is pressed with nothing typed 5006ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |app| apps/mobile/src/routes/kitchen.route.test.tsx > joining a kitchen > asks for the code, and calls nothing, when Check code is pressed with nothing typed
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ apps/mobile/src/routes/kitchen.route.test.tsx:138:3
    136|   });
    137|
    138|   it('asks for the code, and calls nothing, when Check code is pressed…
       |   ^
    139|     const mine = new FakeKitchenGateway('u1');
    140|     const join = vi.spyOn(mine, 'joinKitchen');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 20 skipped (21)
   Start at  08:59:00
   Duration  6.72s (transform 822ms, setup 125ms, import 1.37s, tests 5.01s, environment 151ms)
```

Repro recorded above: the route test, run with the empty-code guard disabled in the working tree, failed (joinKitchen called, no prompt).
<!-- SECTION:NOTES:END -->
