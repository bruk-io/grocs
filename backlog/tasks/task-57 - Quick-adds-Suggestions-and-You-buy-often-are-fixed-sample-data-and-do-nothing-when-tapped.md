---
id: TASK-57
title: >-
  Quick add's Suggestions and You buy often are fixed sample data and do nothing
  when tapped
status: Done
assignee:
  - '@claude'
created_date: '2026-11-06 19:50'
updated_date: '2026-11-07 00:09'
labels:
  - size-2
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in the 2026-11-06 device sweep. QuickAddScreen passes suggestions and oftenBought from src/sample/sample-data.ts, so every user sees Eggs, Egg noodles, Eggplant and Bananas, Limes, ... whatever they type or buy, and it passes neither onAddSuggestion nor onAddFrequent to ItemPickerTemplate, so tapping one does nothing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Quick add shows no sample-data items in a real build
- [x] #2 Every suggestion or frequent item it does show adds that item when tapped
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06, branch feat/remove-sample-content (c66046b). Evidence: pnpm check (16 checks, incl. the new sample-data check, which flags the pre-change PlanScreen), typecheck, pnpm test (135 files, 1735 tests); route tests assert the real data and the absence of the sample; pnpm e2e --android emulator-5554 --ios 9EB5207C-C6E9-4EF9-807C-D5519575A9DB: 'e2e: every flow passed', including sign-in.yaml now asserting 'alex@grocs.test · Home'. Quick add passes empty suggestion and frequent lists; ItemPickerTemplate hides both sections when empty. Nothing real feeds suggestions yet; building them is new work, not this bug.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(709 earlier lines omitted)
```text
│  3.74 kB │ gzip:   1.48 kB
│  storybook-static/assets/MealFormTemplate.stories-BG8b73_v.js
│  4.32 kB │ gzip:   1.57 kB
│  storybook-static/assets/ItemPickerTemplate.stories-CAExloqx.js
│  4.44 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-Dh_mSv8s.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/HouseholdTemplate.stories-pGFLPl7n.js
│  4.53 kB │ gzip:   1.63 kB
│  storybook-static/assets/TextField-DulAHfAd.js
│  4.98 kB │ gzip:   1.91 kB
│  storybook-static/assets/PreferencesTemplate.stories-CvDKj7l8.js
│  5.11 kB │ gzip:   1.94 kB
│  storybook-static/assets/ItemRow-Br0EeN7C.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/Button-BNNiZ5tn.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-D4f2WHuK.js
│  9.35 kB │ gzip:   3.10 kB
│  storybook-static/assets/Mascot-BGA0f5dQ.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-eB6EtNXc.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-CZopag8i.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-oFZGZ70h.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-Bol10P1r.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-BF62yNUn.js
│  1,360.87 kB │ gzip: 392.12 kB

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

│  Vite ✓ built in 1.27s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 425 story views checked (axe, 44 x 44, images not compared)
```

No repro: the bug is static content visible in the pre-change source, which I read at HEAD~1 (aa220b8~1): QuickAddScreen.tsx imports oftenBought and suggestions from ../sample/sample-data.ts and passes no onAddSuggestion/onAddFrequent. No failing test was committed before the fix, and running the new route tests against the old code would mean changing files, which a review cannot do.

Closed by review. Full check (record-check --tier full) passed, exit 0, at aa220b8, recorded on TASK-57 (one commit covers all four); nothing reformatted. Both criteria met: route test asserts no Eggplant/Suggestions/You buy often on /quick-add. Finding (low, not filed): AC2 is met vacuously, since Quick add now shows no suggestions; real suggestions are new work, not this bug.
<!-- SECTION:NOTES:END -->
