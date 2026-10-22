---
id: TASK-1.31.2
title: >-
  App: Groceries uses the rail from 600 dp and keeps its meal filter across
  postures
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-21 15:38'
updated_date: '2026-10-22 04:02'
labels:
  - size-2
  - layer-app
dependencies:
  - TASK-1.31.1
modified_files:
  - apps/mobile/src/screens/GroceriesScreen.tsx
  - apps/mobile/src/sample/sample-data.ts
  - apps/mobile/src/demo/compose-demo.ts
  - apps/mobile/src/demo/demo.route.test.tsx
  - apps/mobile/src/routes/groceries-rail.route.test.tsx
  - apps/mobile/testing/route-setup.ts
parent_task_id: TASK-1.31
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R43. Builds the app half of decision-14: the width switch (600 dp and wider), the meal filter state, and the meals the rail shows (the sample week until the meal plan slice, TASK-1.21).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 At a window 600 dp or wider Groceries renders the inner layout with the rail, and below it the phone layout, proved by route tests at both widths
- [x] #2 A chosen meal filter survives a change of width (fold and unfold) in a route test
- [x] #3 In the demo, the sample items carry the sample meals' badges, and choosing a meal in the rail filters the list (demo route test)
- [ ] #4 On the Fold, unfolding and folding with a meal chosen keeps the filter, with screenshots in the notes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan
1. GroceriesScreen: useWindowDimensions; width >= 600 renders layout='inner' with rail (MealRail from the sample week, counts from the list) else phone. One component instance, so the meal filter (useState selectedMealId) survives a width change.
2. Filter: items carry Item.badges (meal ids); toListItem maps ids to sample-week meals as mealBadges. Choosing a meal narrows sections to its to-buy items, passes filter {mealName,count,tone,onShowAll}; template hides In the cart while filtered (Bruk's decision). Phone layout shows the same filter line.
3. Rail wiring: onSelectSection plan -> go.plan; onPlanMeal -> go.addMeal.
4. Demo seed: give sample items badges by sample-week meal ids (chana m1, chicken m2).
5. Tests: route tests at 411 and 791 wide, filter survives resize, demo route test choosing a meal. route-setup pins the default window at 412 so existing tests keep the phone layout.
6. Criterion 4 needs the Fold: cannot be met here; recorded in notes.
Modified files: apps/mobile/src/screens/GroceriesScreen.tsx, apps/mobile/src/sample/sample-data.ts, apps/mobile/src/demo/compose-demo.ts, apps/mobile/src/demo/demo.route.test.tsx, apps/mobile/src/routes/groceries-rail.route.test.tsx, apps/mobile/testing/route-setup.ts
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Bruk, 2026-10-21: while a meal is chosen the In the cart section stays hidden; it comes back with Show all (as TASK-1.31.1's template already does).

Worker report (builder-app). Checks: pnpm typecheck clean; pnpm check passed (14 checks); pnpm test 116 files / 1539 tests passed. GitHub Actions not run (billing).
#1: apps/mobile/src/routes/groceries-rail.route.test.tsx: rail present at 791 dp and 600 dp, absent at 412 and 599 (switch at 600 via GroceriesScreen INNER_MIN_WIDTH).
#2: same file: meal chosen at 791, fold to 412 (filter line + Show all stay, list stays narrowed), unfold to 791 (still filtered); also chosen at inner then folded. State lives in GroceriesScreen above the width switch, so one instance survives.
#3: demo seed (compose-demo.ts) gives items badges as sample-week meal ids (Chana masala m1, Sheet-pan chicken m2) from the sample items' badges; GroceriesScreen shows them as mealBadges. demo.route.test.tsx: badges shown, choosing Sheet-pan chicken in the rail leaves Bell peppers/Chicken thighs and hides Garlic, Show all restores. In the cart is hidden while filtered, back with Show all (Bruk's decision, template behaviour).
#4 NOT MET: needs Bruk's Pixel 10 Fold; no device or screenshots available to me. Route tests only prove the logic in jsdom. Needs a device check by Bruk.
Test infra: route-setup.ts now makes jsdom's documentElement.clientWidth follow window.innerWidth (react-native-web reads it; it was 0) and resets to 412 dp before each test, so existing tests keep the phone layout. Live (non-demo) lists have no badges yet, so their rail counts are 0 until TASK-1.21.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(754 earlier lines omitted)
```text
|  storybook-static/assets/PreferencesTemplate.stories-B6X6L1GZ.js
|  4.69 kB │ gzip:   1.82 kB
|  storybook-static/assets/ItemRow-CL-odj_r.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/Button-mAbb9PVx.js
|  6.43 kB │ gzip:   2.03 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/GroceryListTemplate.stories-DZZS859y.js
|  9.35 kB │ gzip:   3.11 kB
|  storybook-static/assets/Mascot-9wOdy4H3.js
|  12.29 kB │ gzip:   4.46 kB
|  storybook-static/assets/icons-BrtJGt-P.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-DLUJ5bxM.js
|  17.99 kB │ gzip:   5.00 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-V5bZC6s3.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-CYAHSAHA.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-BjFF9lkE.js
|  1,360.62 kB │ gzip: 392.04 kB

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

|  Vite ✓ built in 4.15s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.4s of this 4.1s
|  build (84%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (29%, 1.2s, 835
|  calls)
|  - plugin vite:css transform (25%, 1.0s, 2 calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-aaa72e2ce578de464/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 398 story views checked (axe, 44 x 44, 398 images compared)
```

Review (philosophy:reviewer), 2026-10-22, commit e9fc951. Verdict: NOT CLOSED - only #4 (the Fold device check with screenshots) stands in the way, and it needs Bruk with a demo APK. #1-#3 met and ticked. The code is ready to merge to main so the next APK carries it.
Evidence: full-tier check exit 0 (recorded above: typecheck, check, tests, Storybook build, visual 398 views); nothing reformatted.
#1: groceries-rail.route.test.tsx shows the rail at 791 and 600, and none at 412 and 599 (INNER_MIN_WIDTH = 600, decision-14).
#2: GroceriesScreen keeps mealId in useState above the switch and only changes the layout prop on the one GroceryListTemplate, so nothing that holds the filter unmounts. The fold/unfold test checks the narrowed list and Show all both ways.
#3: demo.route.test.tsx shows both badges, Sheet-pan chicken narrows the list and Show all restores it.
Findings (none filed as drafts):
- Low: the frontmatter modified_files lists apps/mobile/src/sample/sample-data.ts, which did not change (the plan's step 4 moved the seed into compose-demo.ts). The orchestrator should drop it when merging.
- Low (accepted): live lists show the sample week in the rail with zero counts, and choosing a meal shows an empty list. Decision-14's consequences (line 30) accept this explicitly until TASK-1.21, so nothing is filed. TASK-1.21 should replace weekMeals in GroceriesScreen.
- Info: the route-setup change lost no coverage. Before it, react-native-web read width 0, which already gave the phone layout, and no existing test depended on width. Pinning 412 keeps them on the phone layout, and only the new tests widen the window.
- Info: the compose-demo badge mapping matches meals by name, so a renamed sample meal would silently drop its badges. Acceptable for demo seed data.
<!-- SECTION:NOTES:END -->
