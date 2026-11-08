---
id: TASK-62
title: End-to-end flows on both phones against the emulators (R51)
status: Done
assignee:
  - '@claude'
created_date: '2026-11-06 19:55'
updated_date: '2026-11-06 21:14'
labels:
  - size-3
  - app
  - e2e
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
R51 (decision-9: Maestro) has never been built, so nothing exercises the app on a device; the 2026-11-06 sweep did it by hand and found TASK-56..61. Flows run on development builds against the Firebase emulators with seed data (R52). Sign-in: real Google sign-in can't be automated (no account on CI emulators, iOS needs a password), and Bruk removed the visible dev test sign-in on 2026-10-24 so dev and release look the same. Chosen 2026-11-06 with Bruk: a development-only deep link signs a seeded account in to the Auth emulator; no button, and release builds don't carry it (R53).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A development build opened at grocs://dev-sign-in?as=alex (or sam) is signed in to the Auth emulator as that seed account; a release build ignores the link, and a development build pointed at live Firebase refuses it
- [x] #2 Maestro flows in apps/mobile/e2e cover signing in, adding a meal, adding an item and ticking it, and pass on the Android emulator and the iOS simulator
- [x] #3 A flow shows a change made on one device reaching the other
- [x] #4 One command runs the flows against the emulators with seed data
- [x] #5 A check (R55) fails when a flow signs in any way but the dev link or names an app other than the development build
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06 progress (branch feat/e2e-maestro-flows, 996cdcd). Two dev-environment defects found and fixed on the way: (1) the seed wrote kitchens/seed-kitchen but no memberships/{uid}, so findMyKitchen returned null and seed accounts landed on kitchen setup; the seed now builds the kitchen with core's createKitchen/addMember and writes each membership. (2) A dev build on device carries the real project id from google-services.json, so the Firestore emulator (single project mode, demo-grocs) served it an empty namespace and every kitchen read and write failed rules line 14 ('Null value error', surfaced as firestore/unknown); tools/emulator-config.ts derives demo-grocs copies of both config files for emulator builds. Flow fixes for Android: hideKeyboard is Back on Android (drops typed text, or leaves the screen), so item flows press Enter and the meal flow taps the heading. iOS: clearState does not clear the keychain, so the sign-in subflow signs out first if the app opens signed in. Found by the flows: TASK-63. Gotcha: starting Expo here writes apps/mobile/tsconfig.json (gitignored) extending expo/tsconfig.base, which breaks 15 vitest files until deleted. Results so far: pnpm e2e --android emulator-5554 passed all three single-device flows; both-device run passed the second-device pair (added on Android as Alex, seen, ticked and cleared on iOS as Sam) and the first iOS flow; the other two iOS flows failed before the keychain fix; rerun in progress.

2026-11-06 pnpm e2e --android emulator-5554 --ios 9EB5207C-C6E9-4EF9-807C-D5519575A9DB (fold emulator; iPhone 18 Pro simulator; both development builds built from tools/emulator-config.ts's demo-grocs config): 'e2e: every flow passed'. Runs: add-and-tick-item, add-meal, sign-in on each device, then second-device-add on Android (Alex) and second-device-see on iOS (Sam).

2026-11-06 full check ('full' in .claude/checks.json) exit 0: 15 checks incl. e2e-flows; 131/131 unit test files; test:emulator 8/8 files (incl. the seed's new seedKitchenDoc test); check:release 'release bundles clean' with app/dev-sign-in.tsx present; Storybook built; visual 410 story views.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(668 earlier lines omitted)
```text
│  3.40 kB │ gzip:   1.44 kB
│  storybook-static/assets/MealRail-Cuo5YPfO.js
│  3.74 kB │ gzip:   1.49 kB
│  storybook-static/assets/MealFormTemplate.stories-CO7SGPBn.js
│  4.32 kB │ gzip:   1.57 kB
│  storybook-static/assets/ItemPickerTemplate.stories-C2hsARQQ.js
│  4.44 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-D5eXwH2W.js
│  4.47 kB │ gzip:   1.30 kB
│  storybook-static/assets/PreferencesTemplate.stories-C-OHZbA-.js
│  4.69 kB │ gzip:   1.82 kB
│  storybook-static/assets/TextField-B_wGVCnP.js
│  4.98 kB │ gzip:   1.91 kB
│  storybook-static/assets/ItemRow-NZ5KgLd6.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/Button-BSNfhlQn.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-DSOSRXVh.js
│  9.35 kB │ gzip:   3.10 kB
│  storybook-static/assets/Mascot-akOYPpvL.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-CLG4T_VG.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-Clugwqz9.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-BCf9tTTn.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-Bd43CqIF.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-fT1uqcH6.js
│  1,360.62 kB │ gzip: 392.03 kB

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

│  Vite ✓ built in 1.30s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 410 story views checked (axe, 44 x 44, images not compared)
```

Review (philosophy:reviewer, 2026-11-06): closed. Full check rerun exit 0 (recorded above). AC1: app/dev-sign-in.tsx redirects home when devSignIn is null; native.ts sets devSignIn only when dev tools are loaded and connectEmulators ran (useEmulators), so live-Firebase dev builds refuse it; check:release confirms release bundles carry no dev tools; route tests cover both branches. AC2-AC4: recorded pnpm e2e run (bgfjgw9y4) shows all three flows on emulator-5554 and the iPhone simulator, then second-device-add (Android, Alex) and second-device-see (iOS, Sam), 'every flow passed', exit 0. AC5: e2e-flows check with unit tests, in pnpm check. Minor findings, not filed: the native.ts gating itself has no unit test (route tests fake devSignIn); add-meal assumes an open day exists this week; the e2e run leaves apps/mobile/tsconfig.json behind (noted gotcha). CI run is TASK-64.
<!-- SECTION:NOTES:END -->
