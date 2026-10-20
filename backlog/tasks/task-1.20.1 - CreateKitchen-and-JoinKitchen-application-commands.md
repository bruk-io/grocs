---
id: TASK-1.20.1
title: CreateKitchen and JoinKitchen application commands
status: Done
assignee:
  - '@builder-application'
created_date: '2026-10-20 03:20'
updated_date: '2026-10-20 04:40'
labels:
  - size-2
  - layer-application
dependencies: []
references:
  - >-
    backlog/decisions/decision-13 -
    Kitchen-create-and-join-go-through-application-commands.md
parent_task_id: TASK-1.20
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-13: kitchen create and join are application commands dispatched like AddItem, calling the KitchenGateway port (packages/ports/src/kitchen-gateway). A refused join is a normal result carrying its reason. Cites R2, R3, R28. The backend behind the port is built (TASK-1.20 notes).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 CreateKitchen dispatches to KitchenGateway.createKitchen and returns the new kitchen id and invite code; it needs a signed-in member
- [x] #2 JoinKitchen returns joined with the kitchen id, or rejected with each of the five reasons (not-found, expired, used, full, already-member) as a result, not an error
- [x] #3 Scenario tests on the fake gateway cover creating, joining and every rejection reason, and the commands reach the gateway only through the port
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan (philosophy:plan-change): two handlers in packages/application/src/commands (create-kitchen.ts, join-kitchen.ts) registered in commandHandlers; each checks auth.currentUser, then calls deps.kitchens (KitchenGateway) and returns events. Added optional Deps.kitchens, instrumented in instrumentDeps (logged as port 'kitchens'); createTestClient defaults it to a FakeKitchenGateway (kitchens: null composes none). No port changes were needed.

Done. CreateKitchen -> KitchenCreated{kitchenId, inviteCode}; errors: not-signed-in, empty-name, kitchens-unavailable. JoinKitchen -> KitchenJoined{kitchenId} or KitchenJoinRejected{reason} as an ok result for all five reasons; errors: not-signed-in, kitchens-unavailable. A gateway throw becomes the dispatcher's 'internal' result. Scenario tests: create-kitchen.scenario.test.ts and join-kitchen.scenario.test.ts. not-found/expired/used/already-member run on the fake gateway (two phones, one shared clock). 'full' is unreachable through the fake (one invite per kitchen, consumed by the first join), so every reason incl. full is also proven to pass through via a stub gateway. Tests also check the gateway is reached only via the instrumented port.

For TASK-1.20.2: Deps.kitchens is OPTIONAL only because apps/mobile composition (compose-app, compose-firebase, compose-demo) is outside the application layer and would not typecheck if it were required. TASK-1.20.2 should supply it in all roots and then make it required (and drop the kitchens-unavailable branches). Screens read the outcome from the dispatch result's events. pnpm check, typecheck and test all pass.

Finished an interrupted build: the previous builder was stopped by a container restart as it was committing. I reviewed the staged work against the plan and acceptance criteria, found nothing missing, and ran pnpm check, typecheck and test (98 files, 1297 tests) green. No port changes. Committed with the hook running.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(636 earlier lines omitted)
```text
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

|  Vite ✓ built in 7.24s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 6.0s of this 7.1s
|  build (84%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (31%, 2.2s, 822
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
|  /home/claude/grocs/.claude/worktrees/agent-a44a23a483b38d7aa/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a44a23a483b38d7aa/packages/ui
> node ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

Review (philosophy:reviewer, Oct 20 2026), commit 8974cec. Verdict: closes. Full tier recorded above, exit 0 (check, typecheck, test, test:emulator, check:release, storybook build, visual 311 views); no timeouts, nothing reformatted. The first builder's ticks were judged fresh, and all three stand. #1: create-kitchen.ts calls deps.kitchens.createKitchen and returns KitchenCreated{kitchenId, inviteCode}; the not-signed-in error is tested. #2: join-kitchen.ts maps every rejected outcome to an ok KitchenJoinRejected{reason}; it.each covers all five reasons through a stub gateway, including full, which the fake cannot produce (one invite per kitchen), and asserts the dispatch outcome is ok. not-signed-in is an err. #3: the scenario tests cover create, join, and not-found/expired/used/already-member on the fake (two phones, one clock), and full via the stub. Port-only access: the handlers import no provider, only ctx.deps.kitchens, and the tests assert the call is logged by the instrumented port (port: kitchens). They follow AddItem's pattern (createTestClient, dispatcher.dispatch, logger records). Optional Deps.kitchens: acceptable for now. It is documented in the type and the notes, and the failure is an explicit kitchens-unavailable error, not a crash. Follow-up filed as a draft: make it required after TASK-1.20.2 (size-1, layer-application). Minor, not filed: empty-name is checked after kitchens-unavailable, so error precedence depends on composition (harmless). JoinKitchen does not reject an empty code locally; the gateway answers not-found, which is fine.
<!-- SECTION:NOTES:END -->
