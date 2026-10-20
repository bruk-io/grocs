---
id: TASK-1.20.2
title: Kitchen setup and join screens dispatch the kitchen commands
status: Done
assignee:
  - '@builder-app'
created_date: '2026-10-20 03:20'
updated_date: '2026-10-20 11:35'
labels:
  - size-3
  - layer-app
dependencies:
  - TASK-1.20.3
references:
  - >-
    backlog/decisions/decision-13 -
    Kitchen-create-and-join-go-through-application-commands.md
parent_task_id: TASK-1.20
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-13. KitchenSetupTemplate and the join screen (InviteJoinTemplate, InviteRetryTemplate; routes from TASK-1.37.5) dispatch CreateKitchen and JoinKitchen. The composition root picks the gateway: FirebaseKitchenGateway in the real app, MemoryKitchenGateway in the demo. No port tells a returning member their kitchen yet (filed separately), so the app holds the kitchen it created or joined in session state. AC1 and AC2 of TASK-1.20 also need real phones and Google sign-in (TASK-1.15); this task proves the flows in route tests.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A signed-in member with no kitchen sees kitchen setup; creating one shows the invite link and code, then the Groceries screen works on that kitchen
- [x] #2 Entering or opening an invite code joins the kitchen, and each rejection reason shows its own inline error where the code was entered (TASK-1.20 AC3)
- [x] #3 Route tests cover create, join, and every rejection reason on the in-memory gateway; the real composition uses the Firebase gateway and check:release stays clean
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Oct 20, 2026 (orchestrator): TASK-14 (Bruk's session) added KitchenGateway.findMyKitchen(), so a returning member's kitchen comes from the gateway, not session state. Use it: on sign-in, a member with a kitchen lands on Groceries for it and one without sees kitchen setup. The session-state stopgap in this task's description and in decision-13's last consequence is superseded. TASK-1.20.1 is merged (a43fcd5).

Oct 20, 2026: TASK-1.20.3 (the findMyKitchen query) is merged to main; unblocked.

Oct 20, 2026 (builder-app): built. findMyKitchen (TASK-1.20.3) now on App; Home routes a member with a kitchen to Groceries for it and one without to a new KitchenSetupScreen (Start planning dispatches CreateKitchen, shows the invite code, Share link and waiting status via the InviteCard; a second press opens Groceries). /join is real: JoinInviteScreen shows the invite when the URL has ?code=, else the code entry (InviteRetryTemplate); it dispatches JoinKitchen (signing in with Google first if the dispatch says not-signed-in) and each of the five rejection reasons has its own inline message on the code field. Composition: FirebaseKitchenGateway in compose-firebase/native (new dependency @react-native-firebase/functions in apps/mobile, functions emulator connected in src/dev), MemoryKitchenGateway in the demo (demo member already in the demo kitchen), FakeKitchenGateway in appOnFakes. Deps.kitchens left optional. Route tests: apps/mobile/src/routes/kitchen.route.test.tsx (routing, create, join by link and by typed code, all five rejections, signed-out join). Existing index/ListScreen tests now use the gateway's real kitchen id; the join sample test changed because /join is no longer sample. pnpm check, typecheck, test, check:release, check:demo pass. Caveats: pnpm-lock.yaml changed by 1590 lines (pnpm re-resolved peers when the functions dependency was added); Copy code does nothing (no clipboard module installed; the code is selectable); the entry screen reuses InviteRetryTemplate so its title reads Code didn't work even before a first attempt (a ui change would fix it); FirebaseModules.functions is optional so the Node emulator two-client test is untouched. AC1/AC2 on real phones still need TASK-1.15.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(680 earlier lines omitted)
```text
|  4.55 kB │ gzip:   1.74 kB
|  storybook-static/assets/TextField-BUQ8W6wa.js
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/ItemRow-DlxtsPQG.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-CG-L9128.js
|  5.75 kB │ gzip:   1.97 kB
|  storybook-static/assets/Button-HlTd63fv.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-CVO2Zfzk.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-D4zA4yxG.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-_dK9hVdg.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-d75twOs6.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-wrpbBZ8J.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-7rNFOYcX.js
|  1,359.38 kB │ gzip: 391.72 kB

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

|  Vite ✓ built in 5.32s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.5s of this 5.3s
|  build (66%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (27%, 1.4s, 822
|  calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a89cea910f940c005/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

Check `pnpm check:demo` exited 0

```text
$ node tools/demo-bundle.ts
Bytecode makes the app startup faster, disabling bytecode is highly discouraged and should only be used for debugging purposes.
Expo Autolinking module resolution enabled
Starting Metro Bundler

iOS Bundled 2753ms node_modules/expo-router/entry.js (1811 modules)
Android Bundled 2756ms node_modules/expo-router/entry.js (1809 modules)

› Assets (54):
../../node_modules/@expo-google-fonts/fredoka/300Light/Fredoka_300Light.ttf (50KB)
../../node_modules/@expo-google-fonts/fredoka/400Regular/Fredoka_400Regular.ttf (50KB)
../../node_modules/@expo-google-fonts/fredoka/500Medium/Fredoka_500Medium.ttf (50KB)
../../node_modules/@expo-google-fonts/fredoka/600SemiBold/Fredoka_600SemiBold.ttf (50KB)
../../node_modules/@expo-google-fonts/fredoka/700Bold/Fredoka_700Bold.ttf (50KB)
../../node_modules/@expo-google-fonts/nunito/200ExtraLight_Italic/Nunito_200ExtraLight_Italic.ttf (135KB)
../../node_modules/@expo-google-fonts/nunito/200ExtraLight/Nunito_200ExtraLight.ttf (132KB)
../../node_modules/@expo-google-fonts/nunito/300Light_Italic/Nunito_300Light_Italic.ttf (136KB)
../../node_modules/@expo-google-fonts/nunito/300Light/Nunito_300Light.ttf (132KB)
../../node_modules/@expo-google-fonts/nunito/400Regular_Italic/Nunito_400Regular_Italic.ttf (136KB)
../../node_modules/@expo-google-fonts/nunito/400Regular/Nunito_400Regular.ttf (132KB)
../../node_modules/@expo-google-fonts/nunito/500Medium_Italic/Nunito_500Medium_Italic.ttf (136KB)
../../node_modules/@expo-google-fonts/nunito/500Medium/Nunito_500Medium.ttf (132KB)
../../node_modules/@expo-google-fonts/nunito/600SemiBold_Italic/Nunito_600SemiBold_Italic.ttf (135KB)
../../node_modules/@expo-google-fonts/nunito/600SemiBold/Nunito_600SemiBold.ttf (132KB)
../../node_modules/@expo-google-fonts/nunito/700Bold_Italic/Nunito_700Bold_Italic.ttf (135KB)
../../node_modules/@expo-google-fonts/nunito/700Bold/Nunito_700Bold.ttf (132KB)
../../node_modules/@expo-google-fonts/nunito/800ExtraBold_Italic/Nunito_800ExtraBold_Italic.ttf (135KB)
../../node_modules/@expo-google-fonts/nunito/800ExtraBold/Nunito_800ExtraBold.ttf (132KB)
../../node_modules/@expo-google-fonts/nunito/900Black_Italic/Nunito_900Black_Italic.ttf (135KB)
../../node_modules/@expo-google-fonts/nunito/900Black/Nunito_900Black.ttf (132KB)
../../node_modules/expo-router/assets/arrow_down.png (9.5KB)
../../node_modules/expo-router/assets/arrow_right.xml (307B)
../../node_modules/expo-router/assets/checkmark.xml (312B)
../../node_modules/expo-router/assets/error.png (469B)
../../node_modules/expo-router/assets/file.png (138B)
../../node_modules/expo-router/assets/forward.png (188B)
../../node_modules/expo-router/assets/pkg.png (364B)
../../node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.png (653B)
../../node_modules/expo-router/assets/react-navigation/elements/back-icon.png (8 variations | 359B)
../../node_modules/expo-router/assets/react-navigation/elements/clear-icon.png (4 variations | 425B)
../../node_modules/expo-router/assets/react-navigation/elements/close-icon.png (4 variations | 235B)
../../node_modules/expo-router/assets/react-navigation/elements/search-icon.png (7 variations | 592B)
../../node_modules/expo-router/assets/sitemap.png (465B)
../../node_modules/expo-router/assets/unmatched.png (4.8KB)

› ios bundles (2):
_expo/static/js/ios/entry-9b183c161c2dec43c8db70a1ed2fc819.js (2.7MB)
_expo/static/js/ios/entry-9b183c161c2dec43c8db70a1ed2fc819.js.map (11MB)

› android bundles (2):
_expo/static/js/android/entry-7561de51490c28ecf4f8d60dc15fa6e6.js (2.7MB)
_expo/static/js/android/entry-7561de51490c28ecf4f8d60dc15fa6e6.js.map (11MB)

› Files (1):
metadata.json (6KB)

Exported: /home/claude/grocs/.claude/worktrees/agent-a89cea910f940c005/apps/mobile/dist-demo
demo bundles hold no Firebase code (2 bundles, 5 barred path patterns)
```

Review (philosophy:reviewer, Oct 20 2026), commit 728a4f0. Verdict: closed. Full tier recorded above, exit 0 (includes check:release; visual 311/311); pnpm check:demo recorded above, exit 0 (demo bundles hold no Firebase code). Neither changed files. #1: kitchen.route.test routes by findMyKitchen (kitchen -> Groceries, none -> setup, sign-in -> Groceries); create shows the code, Share link and waiting status, then Groceries adds an item on that kitchen. #2: join by link (?code=) and by typed lower-case code both land on Groceries with membership confirmed; all five rejection reasons show their own JOIN_REJECTION_MESSAGES text with the code field present, the five are distinct, and a rejected link join keeps the code in the field. #3: those route tests run on FakeKitchenGateway; native.ts composes FirebaseKitchenGateway over @react-native-firebase/functions; the demo uses MemoryKitchenGateway; check:release clean. Lockfile: the resolved package set differs from 728a4f0~1 by exactly one entry, @react-native-firebase/functions@26.4.0; the other ~1,590 lines are snapshot peer-key rewrites (supports-color@8.1.1 now in babel/expo peer suffixes), with no version changed. CI=true pnpm install --frozen-lockfile on pnpm 11.28.6: exit 0, up to date. functions 26.4.0 was published 2026-09-05, well past minimumReleaseAge (1440 min), and matches the other @react-native-firebase packages. Changed tests: index and ListScreen now put items under the gateway's real kitchen id instead of '' (same assertions, not weaker); the sample join test dropped 'Join with Google leads to Meal plan' because /join is no longer sample, and the real join is covered in kitchen.route.test. Findings: (minor) Copy code is dead, and Share link and Copy code are dead before the kitchen exists -> DRAFT-11 (size-1, layer-app). (minor) code entry reads "Code didn't work" before any attempt -> DRAFT-12 (size-1, layer-ui). (low, not filed) the 'failed' kitchen lookup is a bare text dead end with no retry; signed-out link join has only its failure path tested, not sign-in then join success. The drafts sit uncommitted in this worktree for the orchestrator to file on main.
<!-- SECTION:NOTES:END -->
