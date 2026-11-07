---
id: TASK-74.2
title: >-
  Decide where an imported recipe lives in kitchen data and how its ingredients
  reach the grocery list
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 01:00'
updated_date: '2026-11-07 01:16'
labels:
  - size-2
  - core
dependencies: []
references:
  - >-
    backlog/decisions/decision-16 -
    Imported-recipes-are-kitchen-records-found-from-a-meal-by-its-link.md
parent_task_id: TASK-74
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Kitchen data has no recipe today: a Meal is a name and a link (packages/core/src/model/meal.ts) and a grocery Item has a free-text amount and badges naming its meals (packages/core/src/model/item.ts). TASK-74 needs an imported recipe saved in the kitchen and all its ingredients added to the grocery list, with units parsed but not yet acted on.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A decision record says whether an imported recipe is its own record or belongs to the Meal whose link it came from, and why
- [x] #2 The decision says how each parsed ingredient becomes a grocery Item: name, amount, meal badge and aisle, and what happens when the same item is already on the list (R12)
- [x] #3 The decision covers the new data's schema version, merge rules (R17 to R20) and security rules with their allow and deny tests (R49)
- [x] #4 doc-1 is updated (or its update is filed) for the new kitchen data
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
decision-16 written (proposed) on 2026-11-07 from Bruk's choice of a separate record. Storage and sync split out as TASK-74.7; doc-1's update added to TASK-74.6. Waiting on Bruk to accept decision-16.

Bruk accepted decision-16 on 2026-11-07. Ready for review.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(765 earlier lines omitted)
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

│  Vite ✓ built in 1.71s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 425 story views checked (axe, 44 x 44, images not compared)
```

Review (philosophy:reviewer, 2026-11-07): all four criteria met; not closed only because the task file has never been committed (board-check close), and this review may not commit. #1 decision-16 (accepted) makes the recipe its own kitchen record at kitchens/{kitchenId}/recipes/{recipeId}, keyed by the server cache key, and says why (R6 keeps meals to name and link; one record per URL; several meals share it). #2 one AddItem per ingredient with name (item or whole line), amount as written, the meal's badge for the meal's week (R10), aisle 'other' until TASK-57, duplicates through the R12/R19 combine prompt; matches AddItem in packages/application/src/commands/add-item.ts. #3 RECIPE_SCHEMA_VERSION 1 in core/schema with personal fields (R30, R36), merge rule (earlier createdAt, delete wins, R20; content never restamped so R18 is moot), SyncStore methods for fake, contract, Firestore and memory providers; firestore.rules' kitchens/{kitchenId}/{collection}/{document=**} match already covers recipes, with allow/deny tests required (R49) and carried as TASK-74.7 #4. #4 filed as TASK-74.6 #3. Full check exited 0 and changed no files. Findings (none filed): low, the kitchen recipes subcollection and the top-level recipes cache share a name, which decision-16 itself flags; low, the full check's visual image comparison is skipped on darwin (repo design). To close: commit the board files, then run close-task TASK-74.2.
<!-- SECTION:NOTES:END -->
