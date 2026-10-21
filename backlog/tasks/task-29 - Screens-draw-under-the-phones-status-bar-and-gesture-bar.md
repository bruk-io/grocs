---
id: TASK-29
title: Screens draw under the phone's status bar and gesture bar
status: Done
assignee: []
created_date: '2026-10-20 22:33'
updated_date: '2026-10-21 00:25'
labels:
  - size-3
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by Bruk on the demo APK on his Fold (2026-10-20), screenshots in the conversation. Android draws apps edge to edge, and nothing in packages/ui or apps/mobile reads the safe-area insets, so:
- Groceries' 'Week of Oct 19' and Add a meal's '< Meal plan' back link sit under the clock.
- The Settings button in the top-right corner sits under the battery icon and cannot be tapped.
- 'Add to Thursday' sits on the gesture bar, and the mascot's bubble overlaps the status bar.

This is the ui half: the layouts take the insets from a ui provider, as PlatformStyleProvider and MotionProvider do, so @grocs/ui stays free of native libraries and stories can show a phone's insets. The app feeds the real insets in a follow-on task.

## Affected users and systems
Every screen; packages/ui layouts (MainLayout, TaskLayout, StageLayout, ActionBar) and any full-screen template that does not use them.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Every screen layout and full-screen template keeps its top content below the top inset and its bottom actions above the bottom inset, read from a ui provider whose default is zero insets
- [x] #2 A behaviour test per layout fails without the inset padding and passes with it
- [x] #3 Each full-screen template has a story with a phone's insets in the visual baselines, with no control or text inside the inset bands
- [x] #4 With zero insets the existing baselines are unchanged
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
SafeAreaProvider/useSafeArea (zero default) in packages/ui/src/platform/safe-area.tsx; MainLayout, TaskLayout, StageLayout, ActionBar read it (top padding, bottom clearance, side insets); OnPhone story per full-screen template via withPhoneInsets decorator; layouts.behaviour.test.tsx; two size tokens for the stories' phone insets.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built in worktree. Provider: SafeAreaProvider/useSafeArea/NO_INSETS/PHONE_INSETS exported from @grocs/ui (PHONE_INSETS = tokens phoneStatusBar 40 / phoneGestureBar 24, new tokens in tokens.json). Layouts: Main pads top, lifts tab bar and last row by bottom; Task pads top and clears bottom for footer or last content (ActionBar does it itself); Stage shifts scene and wordmark below the top inset and extends the sheet colour under the gesture bar; ActionBar adds bottom and side insets. Evidence: AC1 layouts.behaviour.test.tsx (11 tests, zero-inset and phone-inset cases); AC2 the zero-inset values are the old values, so the tests fail without the padding; AC3 OnPhone story on all 9 templates (iphone, fold-outer, fold-inner), checked by eye on sign-in and meal-form; the visual pass has no automated inset-band check (tools/visual.ts is outside layer-ui, so not added; suggest a follow-up); AC4 visual pass: 326 existing images unchanged, no existing PNG modified. Changed baselines: none. New baselines (27 PNGs, 9 templates x 3 viewports): templates-{grocery-list,invite-join,invite-retry,item-picker,kitchen-setup,meal-form,meal-plan,preferences,sign-in}--on-phone[--fold-outer|--fold-inner].png, plus manifest.json. Note: on Welcome the band above the scene shows the stage colour (lighter than the sky); worth a look. pnpm check, typecheck, full pnpm test (1410) and visual all pass. Not done: app feeding real insets (TASK-30).

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(738 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-DnKAOTKw.js
|  5.86 kB │ gzip:   2.03 kB
|  storybook-static/assets/Button-Ctucr5jb.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-4M_z6aGy.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-B5NSZ8OD.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-l7C9XySj.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-BL40qf8r.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-DcGjcJ5l.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-GYdmVp5o.js
|  1,359.48 kB │ gzip: 391.74 kB

|
!  Vite [plugin builtin:vite-reporter]
|  (!) Some chunks are larger than 500 kB after minification. Consider:
|  - Using dynamic import() to code-split the application
|  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
|  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
|  - Adjust chunk size limit for this warning via
|  build.chunkSizeWarningLimit.
|
!  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
|  shimmed in module "../../node_modules/react-native-web/dist/index.js".

|  Vite ✓ built in 6.13s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 5.2s of this 6.1s
|  build (86%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (40%, 2.4s, 824
|  calls)
|  Additional callback time came from the callbacks below and from
|  callbacks under 1s.
|  1 callback is listed without a time. Its calls overlapped, so the time
|  inside one call includes work from other calls. To find its cost,
|  profile the build with `node --cpu-prof`:
|  - plugin vite:css transform (2 calls)
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a3290dbd27018d06c/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 353 story views checked (axe, 44 x 44, 353 images compared)
```

No repro: no failing run was recorded. The repro is packages/ui/src/templates/layouts/layouts.behaviour.test.tsx, written with the fix; its phone-inset assertions expect values only the padding produces, so it would fail on the pre-fix layouts, but nobody ran it there and the reviewer cannot change code to do so.

Reviewer verdict: closed. Full check exit 0 (pnpm check, typecheck, tests incl. the kitchen route test, which passed this run, visual 353 views). AC1: MainLayout, TaskLayout, StageLayout, ActionBar read useSafeArea (zero default); all 9 full-screen templates use them. AC2: met by construction - phone-inset assertions expect values only the padding produces. AC3: OnPhone story on all 9 templates; reviewer looked at all 27 on-phone images, no control, text or mascot bubble in the top 40 or bottom 24. AC4: 326 existing images unchanged. Findings: (minor) Welcome's top band shows the stage colour, not the sky's - added to TASK-31's notes, no draft. (minor) plan written after building - process note only. (minor) no automated inset-band check in tools/visual.ts - no draft. The 27 new baselines are NOT approved: they need Bruk's approval before this branch lands on main.

Repro at 04936324791f, test files: packages/ui/src/templates/layouts/layouts.behaviour.test.tsx; command: `pnpm exec vitest run --project ui packages/ui/src/templates/layouts/layouts.behaviour.test.tsx` exited 1

(108 earlier lines omitted)
```text
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  |ui| packages/ui/src/templates/layouts/layouts.behaviour.test.tsx > ActionBar > sits above the bottom inset, and by the side insets
AssertionError: expected 24 to be 48 // Object.is equality

- Expected
+ Received

- 48
+ 24

 ❯ packages/ui/src/templates/layouts/layouts.behaviour.test.tsx:83:38
     81|     render(phone(<ActionBar label="Save" />));
     82|     const bar = screen.getByRole('button', { name: 'Save' });
     83|     expect(up(bar, 'paddingBottom')).toBe(48);
       |                                      ^
     84|     const lefts: number[] = [];
     85|     for (let e: Element | null = bar; e; e = e.parentElement) lefts.pu…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  |ui| packages/ui/src/templates/layouts/layouts.behaviour.test.tsx > StageLayout > moves the stage and the wordmark below the top inset
AssertionError: expected +0 to be 40 // Object.is equality

- Expected
+ Received

- 40
+ 0

 ❯ packages/ui/src/templates/layouts/layouts.behaviour.test.tsx:98:59
     96|   it('moves the stage and the wordmark below the top inset', () => {
     97|     render(phone(layout));
     98|     expect(up(screen.getByText('kitchen'), 'paddingTop')).toBe(40);
       |                                                           ^
     99|     expect(up(screen.getByText('name'), 'top')).toBe(56 + 40);
    100|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  |ui| packages/ui/src/templates/layouts/layouts.behaviour.test.tsx > StageLayout > carries the sheet colour under the bottom inset
TypeError: The provided value is not of type 'Element'.
 ❯ exports.convert node_modules/jsdom/lib/jsdom/living/generated/Element.js:26:9
 ❯ window.getComputedStyle node_modules/jsdom/lib/jsdom/browser/Window.js:883:19
 ❯ px packages/ui/src/templates/layouts/layouts.behaviour.test.tsx:15:130
     13|
     14| const insets = { top: 40, bottom: 24, left: 7, right: 9 };
     15| const px = (el: Element, prop: 'paddingTop' | 'paddingBottom' | 'paddi…
       |                                                                                                                                  ^
     16| /** The nearest ancestor (or the element itself) whose computed style …
     17| const up = (el: Element, prop: Parameters<typeof px>[1]) => {
 ❯ packages/ui/src/templates/layouts/layouts.behaviour.test.tsx:104:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 3 passed (11)
   Start at  20:25:29
   Duration  1.62s (transform 426ms, setup 25ms, import 839ms, tests 233ms, environment 359ms)
```
<!-- SECTION:NOTES:END -->
