---
id: TASK-1.20.3
title: >-
  findMyKitchen query: the app asks the application layer for the member's
  kitchen
status: Done
assignee:
  - '@builder-application-small'
created_date: '2026-10-20 05:11'
updated_date: '2026-10-20 05:53'
labels:
  - size-1
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
Found by the TASK-1.20.2 builder: KitchenGateway.findMyKitchen() (TASK-14) has no application-layer caller, so the app cannot route a returning member to their kitchen without reaching the port (R28). A query, not a command: it changes nothing and emits no event, so it sits beside watchSession in packages/application/src/queries.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 findMyKitchen(deps) returns the signed-in member's kitchen id or null, null when nobody is signed in, and is exported from @grocs/application
- [x] #2 Tests on the fake gateway cover a member with a kitchen, one without, nobody signed in, and a composition with no gateway
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create packages/application/src/queries/find-my-kitchen.ts: import type { Deps } from '../dispatch/types.ts'; export an async function findMyKitchen(deps: Deps): Promise<string | null> with a doc comment ('The signed-in member's kitchen, found on any phone (R2, TASK-14); null when nobody is signed in or they have none yet. Throws when the composition supplies no KitchenGateway, which is a wiring mistake, not a state to show (decision-13).'). Body: if (!deps.auth.currentUser()) return null; if (!deps.kitchens) throw new Error('kitchens-unavailable: this composition supplies no KitchenGateway'); return deps.kitchens.findMyKitchen();
2. packages/application/src/index.ts: next to the watch-session export, add export { findMyKitchen } from './queries/find-my-kitchen.ts';
3. Create packages/application/src/queries/find-my-kitchen.test.ts with four vitest cases, building Deps like queries.test.ts's make() (FakeAuth with user u1, FakeClock, SequentialIds, InMemorySyncStore from '@grocs/ports/testing') plus kitchens: new FakeKitchenGateway('u1') from the same entry: (a) after signing u1 in (await (deps.auth as FakeAuth).signInWithTestAccount('a@grocs.test', 'pw')) and await deps.kitchens!.createKitchen('Home', 'UTC'), findMyKitchen returns the created kitchenId; (b) signed in with no kitchen, it returns null; (c) nobody signed in, it returns null; (d) signed in with kitchens omitted from Deps, it rejects with an error whose message contains 'kitchens-unavailable'.
4. Run pnpm check, pnpm typecheck and pnpm test. If a step does not fit the code (for example FakeAuth's sign-in method or createKitchen's signature differ), stop and report which step.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented per the four-step plan, commit f961954 on worktree-agent-aec7e319e9ab52c9c. Added packages/application/src/queries/find-my-kitchen.ts (findMyKitchen(deps): null when nobody is signed in, throws kitchens-unavailable when deps.kitchens is missing, otherwise delegates to the gateway), exported from packages/application/src/index.ts beside watchSession, and find-my-kitchen.test.ts with four cases. The test file signs in u1, creates a kitchen, and covers: member with a kitchen, member without one, nobody signed in (a kitchen exists, so the null comes from the auth check), and no gateway composed. Checks: pnpm check passed (13 checks), pnpm typecheck exit 0, pnpm test 99 files / 1308 tests passed. Hook run on commit passed all three stages. Deviation noted, not blocking: the function's doc comment cites decision-13 for the throw, but decision-13 says nothing about missing gateways (it covers join refusals as results). The throw follows the plan; the create-kitchen command answers err kitchens-unavailable instead, because a query returning string or null has no result channel. Environment note: pnpm prints ERR_PNPM_IGNORED_BUILDS for re2@1.27.0 and a warning that node_modules may be out of sync. Checks still passed.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 143

(729 earlier lines omitted)
```text
|  - Using dynamic import() to code-split the application
|  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
|  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
|  - Adjust chunk size limit for this warning via
|  build.chunkSizeWarningLimit.
|
!  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
|  shimmed in module "../../node_modules/react-native-web/dist/index.js".

|  Vite ✓ built in 5.14s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.6s of this 5.1s
|  build (72%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (34%, 1.7s, 822
|  calls)
|  - plugin vite:css transform (20%, 1.0s, 2 calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/packages/ui/storybook-static
|
—  Storybook build completed successfully

✓ Lockfile passes supply-chain policies (verified 45m ago)
Lockfile is up to date, resolution step is skipped
.                                        | -114 -----------
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: re2@1.27.0

Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
[WARN] The install that runs before scripts failed, so your node_modules may be out of sync with your lockfile. Set "verifyDepsBeforeRun: false" to skip this install.
$ node ../../tools/visual.ts -- --no-build
Terminated
file:///home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/node_modules/@axe-core/playwright/dist/index.mjs:219
      throw new Error(
            ^

Error: page.evaluate: Target page, context or browser has been closed
 Please check out https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/error-handling.md
    at AxeBuilder.analyze (file:///home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/node_modules/@axe-core/playwright/dist/index.mjs:219:13)
    at runNextTicks (node:internal/process/task_queues:65:5)
    at process.processImmediate (node:internal/timers:541:9)
    at async axeViolations (file:///home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/tools/visual.ts:59:18)
    at async main (file:///home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/tools/visual.ts:129:25)
    at async file:///home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/tools/visual.ts:186:20 {
  [cause]: page.evaluate: Target page, context or browser has been closed
      at AxeBuilder.finishRun (/home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/node_modules/@axe-core/playwright/dist/index.mjs:320:21)
      at async AxeBuilder.analyze (/home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/node_modules/@axe-core/playwright/dist/index.mjs:217:14)
      at async axeViolations (/home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/tools/visual.ts:59:18)
      at async main (/home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/tools/visual.ts:129:25)
      at async file:///home/claude/grocs/.claude/worktrees/agent-aec7e319e9ab52c9c/tools/visual.ts:186:20 {
    log: []
  }
}

Node.js v24.22.0
```

Review by philosophy:reviewer: closes. All four plan steps done as written (find-my-kitchen.ts, index.ts export, four-case test, checks). AC1: null when auth.currentUser() is null, checked before the gateway; the gateway is reached only via deps.kitchens; exported from @grocs/application. AC2: four cases on FakeKitchenGateway; the nobody-signed-in case creates a kitchen first, so the null provably comes from the auth check (stricter than the plan, good). Throw on missing gateway: sound. Commands answer kitchens-unavailable as err results; a query typed string|null has no error channel, and returning null would silently route a misconfigured app to setup. decision-13 on main now states this consequence, so the citation holds once main merges in (the worktree's own copy of decision-13 predates it). Full check: record-check exited 143 - every stage passed through storybook build, then the visual stage was killed by the run's time budget. Re-run alone: pnpm --filter @grocs/ui visual -- --no-build exit 0, 311 views checked, 8m33s. Recorded as load; this change touches no UI. Minor, not filed: the thrown message reuses the code string inside a plain Error rather than a typed error; acceptable for a wiring fault. Environment: ERR_PNPM_IGNORED_BUILDS re2, known from TASK-7.
<!-- SECTION:NOTES:END -->
