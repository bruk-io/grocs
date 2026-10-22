---
id: TASK-1.31.1
title: 'UI: the meal rail and the inner-screen Groceries layout'
status: Done
assignee:
  - '@builder-ui'
created_date: '2026-10-21 15:38'
updated_date: '2026-10-22 03:17'
labels:
  - size-3
  - layer-ui
dependencies: []
modified_files:
  - packages/ui/src/molecules/RailLink.tsx
  - packages/ui/src/molecules/RailLink.stories.tsx
  - packages/ui/src/molecules/RailLink.behaviour.test.tsx
  - packages/ui/src/molecules/RailRow.tsx
  - packages/ui/src/molecules/RailRow.stories.tsx
  - packages/ui/src/molecules/RailRow.behaviour.test.tsx
parent_task_id: TASK-1.31
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R43. Builds the ui half of decision-14 (option C, design/reference/D2-OptionC.dc.html). The app's width switch and filter state are TASK-1.31.2.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A meal rail organism holds the navigation (Meal plan; Groceries with its remaining count) and This week's meals (All items, each meal with its day and item count, Plan a meal), with stories for nothing selected, a meal selected, and no meals yet
- [x] #2 Groceries has an inner layout: the rail on the left, the list filling the rest and no floating tab bar, shown in the fold-inner baselines
- [x] #3 GroceryListTemplate shows the filter line ('Only <meal> · n to buy' with Show all) and the empty-meal line ('Nothing on the list for <meal> yet.') in both the phone and inner layouts, with stories
- [x] #4 Every rail control has a name and role the axe pass accepts and a 44 x 44 target
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Token: add size.rail (224, the board rail width) to tokens.json, regenerate tokens.ts with `node tools/build-tokens.ts`.
2. Molecules MealFilterLine ("Only <meal> · n to buy" in the meal tone, plus a Show all secondary button) and FilterEmpty ("Nothing on the list for <meal> yet.", dashed box), each with stories and a behaviour test.
3. Organism MealRail (organisms/MealRail.tsx): a nav landmark "Sections and meals" holding Meal plan and Groceries (accent count of what remains, aria-current on the active one) as links, then "This weeks meals": All items, one button per meal (day, name, count, aria-pressed, meal tone fill, forest outline when selected; pressing the selected one asks for all items) and Plan a meal. Callbacks send the state wanted (onSelectMeal(id), onShowAll, onSelectSection(id), onPlanMeal). Every control min 44 high (meal rows 56). Stories: NothingSelected, MealSelected, NoMealsYet. Behaviour test.
4. templates/layouts/InnerLayout.tsx: rail left (size.rail wide, card surface, soft right line), header + scrolling content filling the rest, no floating nav, safe-area insets as MainLayout. Layout test added to layouts.behaviour.test.tsx.
5. GroceryListTemplate: new optional props layout ("phone" default | "inner"), rail (MealRail props, used by inner) and filter ({ mealName, tone, count, onShowAll }). With a filter the template shows MealFilterLine on top of the list; with a filter and no sections it shows FilterEmpty instead of EmptyList/CelebrationBanner and hides the cart. Same in both layouts. Stories: InnerGroceries, InnerFiltered, InnerEmptyMeal (inner), Filtered, EmptyMeal (phone). Behaviour tests for each. Fixtures gain the rail meals.
6. Export from index.ts. Regenerate baselines with `pnpm --filter @grocs/ui visual:update`; list new and changed images in the notes.

Not in this task: the app width switch and filter state (TASK-1.31.2). So design/reference/D2-OptionC.dc.html (and A, B) stay: the task does not complete what the board shows.

### Risks
- Template stories are shot at all three viewports, so inner-layout stories also get a squeezed phone-width baseline. Accepted: the app chooses the layout by width; those images are deterministic but noise. Noted for Bruk to approve.
- Existing Groceries baselines must not change: new props are optional and default to the phone layout.
- aria-current and role=link on react-native-web: verified by tests and the axe pass.
- Meal button accessible name must contain its visible text.
- tokens.ts is generated: the tokens-in-sync check fails if edited by hand.

### Proof
- vitest --project ui (behaviour tests, every story renders, stories.accessibility 44x44 and contrast), pnpm typecheck, pnpm check, pnpm test, pnpm --filter @grocs/ui visual (axe, target sizes, baselines), then visual:update; confirm no existing PNG changed.
- AC1 MealRail stories and test; AC2 Inner stories in the fold-inner baselines; AC3 filter and empty stories in both layouts; AC4 axe pass in visual plus the 44x44 unit pass.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-21 builder-ui report.

Plan drift (small): check R61 treats any component with role= or Pressable as interactive and wants rest/pressed/focus/disabled states, so the rail rows became two molecules, RailLink (the two pages) and RailRow (All items and each meal), with stories and tests; "Plan a meal" reuses MealEmpty. MealRail itself only composes them. Both added to modified_files.

Evidence per criterion:
- AC1: organisms/MealRail.tsx (nav landmark "Sections and meals": Meal plan, Groceries with accent count; "This week's meals": All items, each meal with day and count, Plan a meal). Stories NothingSelected, MealSelected, NoMealsYet; MealRail.behaviour.test.tsx (7 tests: landmark and aria-current, rows, pressed state, no meals, callbacks incl. pressing the chosen meal asks for all items).
- AC2: templates/layouts/InnerLayout.tsx (rail left, page fills the rest, no tab bar, safe-area insets) and GroceryListTemplate props layout="inner" + rail. Stories InnerGroceries, InnerFiltered, InnerEmptyMeal, InnerNoMeals; their fold-inner baselines are templates-grocery-list--inner-*--fold-inner.png (checked by eye against D2-OptionC.png). layouts.behaviour.test.tsx and the template tests cover it.
- AC3: molecules MealFilterLine ("Only <meal> · n to buy" + Show all) and FilterEmpty ("Nothing on the list for <meal> yet."), used by GroceryListTemplate through the optional filter prop in both layouts. Stories Filtered, EmptyMeal (phone) and InnerFiltered, InnerEmptyMeal (inner), plus molecule stories and tests. With a filter the cart is hidden and the empty-list and celebration are replaced by the empty-meal line.
- AC4: every rail control has a role (link, button) and a name from its visible text; the count is followed by a screen-reader-only " to buy". stories.accessibility.test.tsx (44 x 44, 4.5:1) passes for all new stories; the browser pass (axe, 44 x 44) passes for all 398 story views. Rows are 44 (All items) or 56 high; every one has minWidth 44.

Checks run in the worktree: pnpm typecheck, pnpm check (14 checks passed), pnpm test (115 files, 1532 tests), pnpm --filter @grocs/ui visual (398 story views, 398 images compared, all pass).

Token added: size.rail = 224 (the board rail width), via tokens.json and pnpm tokens.

Baselines for Bruk to approve: 36 new images, 0 changed, 0 removed. 
 New molecules: molecules-filterempty--rest, molecules-mealfilterline--rest and --long-name, molecules-raillink--active/rest/pressed/focus/disabled, molecules-railrow--rest/selected/pressed/focus/disabled/all-items/neutral.
 New organism: organisms-mealrail--nothing-selected, --meal-selected, --no-meals-yet.
 New template (each at phone, --fold-outer and --fold-inner): templates-grocery-list--filtered, --empty-meal, --inner-groceries, --inner-filtered, --inner-empty-meal, --inner-no-meals. Inner-layout stories are also shot at the phone and outer-fold widths because every Templates story is; there the rail is squeezed (the app chooses the layout by width in TASK-1.31.2), so those 8 images are noise; the fold-inner ones are the real ones.
 No existing baseline changed. Running visual:update in this sandbox also re-rendered 20 existing images (organisms-kitchen-scene--panning and --reduced, every templates-sign-in image) differently from the committed ones, unrelated to this task; I restored those and their manifest hashes, so they are untouched. That is a sandbox rendering difference in the kitchen scene; the visual baselines workflow is the reference.

Left for TASK-1.31.2: the width switch (600 dp), the filter state and passing the rail and filter props. design/reference/D2-OptionC.dc.html (and A, B) is kept: the app half is not built yet.
Reviewer notes: GroceryListTemplate stays backward compatible (new props optional, phone default). The inner header is MainHeader unchanged (16 side padding) wrapped to line up with the 24 content padding; Plan a meal reuses MealEmpty so it is 60 high with a 20 radius rather than the board's 44 and 16.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(742 earlier lines omitted)
```text
|  storybook-static/assets/RailLink-Bt5Lobjz.js
|  3.40 kB │ gzip:   1.44 kB
|  storybook-static/assets/SignInTemplate.stories-DMGDd-zy.js
|  3.43 kB │ gzip:   1.58 kB
|  storybook-static/assets/MealRail-C0jD0Wlr.js
|  3.75 kB │ gzip:   1.49 kB
|  storybook-static/assets/ItemPickerTemplate.stories-CH23T94O.js
|  4.44 kB │ gzip:   1.58 kB
|  storybook-static/assets/Button.stories-xDNgEJLQ.js
|  4.47 kB │ gzip:   1.31 kB
|  storybook-static/assets/TextField-CzXDmluD.js
|  4.64 kB │ gzip:   1.78 kB
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

|  Vite ✓ built in 6.32s
|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-ad374c99b356699be/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 398 story views checked (axe, 44 x 44, 398 images compared)
```

Reviewed by philosophy:reviewer. Closed: all four criteria met. Full check exit 0 (typecheck, check, tests, visual: 398 views, axe + 44x44 + 398 images compared). No existing baseline changed: the diff adds 36 PNGs and only adds manifest lines; the 20 sign-in/kitchen restores held. The fold-inner InnerFiltered baseline matches D2-OptionC. The 36 new images still need Bruk's approval. Findings: (1) Low. Squeezed inner stories: 8 phone/fold-outer images are noise. viewportsFor in tools/ chooses by title only, so a story cannot opt out without a tools change; filed as a draft. (2) Info. Departures accepted: Plan a meal reuses MealEmpty (60/r20 vs the board's 44/r16), which is consistent reuse and costs 16 dp. The MainHeader 8 dp wrapper is fine. The visually hidden ' to buy' is a 1x1 clip without clip/position offsets; acceptable, revisit if a native screen reader reads it oddly. (3) Info. R61 RailLink/RailRow split is sound; MealRail only composes. (4) Info. While filtered the template hides the cart, which the board does not show explicitly; TASK-1.31.2 should confirm this with Bruk.

Bruk approved the 36 new baselines on 2026-10-21 (reviewed as a sheet of the four fold-inner Groceries images; the GitHub baselines workflow could not run, Actions being blocked on billing, so the sandbox's visual:update output is what landed).
<!-- SECTION:NOTES:END -->
