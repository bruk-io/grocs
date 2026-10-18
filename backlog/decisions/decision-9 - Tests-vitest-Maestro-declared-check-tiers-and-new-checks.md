---
id: decision-9
title: 'Tests: vitest, Maestro, declared check tiers and new checks'
date: '2026-10-18 19:01'
status: accepted
---
## Context

Design question D8 in doc-1 (TASK-1.13): the test runners, the end-to-end tool and its flows, the check scripts and which hook runs each, the judgement-only rule files, and mutation testing later.

Requirements served:
- R46 to R52: unit, property, scenario, contract, emulator, component and end-to-end tests, all local and without Docker.
- R54: schema bumps carry migration tests.
- R55: every script-checkable rule is a script, run from hooks, pre-commit and CI, and names its rule and reason.
- R56: after-edit checks finish within 5 s; whole-change checks run before an agent stops.
- R57: weakening is blocked.
- R58: rules files hold judgement only.

As built (TASK-1.3, TASK-1.4):
- Test tooling:
  - vitest 4.1.12 with five inline projects (`unit`, `ui`, `app`, `tools`, `emulator`) in `vitest.config.ts`, and a root `allowOnly: false`;
  - fast-check 4 for the last-write-wins properties;
  - `@testing-library/react` with jsdom 26 and a `react-native` to `react-native-web` alias for components;
  - `@firebase/rules-unit-testing` 6 installed but unused.
- Checks and hooks:
  - `tools/checks/run.ts`, one runner with the modes `all`, `files`, `staged` and `ci`, and 8 registry checks: import-layers, console-use, core-purity, firebase-isolation, design-tokens, story-coverage, test-presence, port-contracts;
  - the weakening review (`weakening.ts`), run by the pre-edit hook, staged mode and CI mode;
  - `tools/release-bundle.ts` (R53 and R64), run as `pnpm check:release`;
  - hooks in `.claude/settings.json`: PreToolUse (Edit, Write, Bash) runs `pre-edit.ts`, PostToolUse (Edit, Write) runs `post-edit.ts` with a 5 s timeout, and Stop runs `stop.ts`;
  - `lefthook.yml` pre-commit, which runs staged checks, the typecheck and unit tests;
  - `.github/workflows/ci.yml` with three jobs: checks, typecheck and unit tests; emulators; bundles and the Storybook build.
- Three rules files: `fix-the-code-not-the-check`, `ports-describe-intent`, `providers-hold-no-rules`.

Findings:
- The root `allowOnly: false` does not reach the projects. I reproduced this with vitest 4.1.12 from the repo's `node_modules`: a root config with `allowOnly: false` and one inline project, and a file with `it.only` plus a failing test. The run passed with exit 0 (1 passed, 1 skipped). With `extends: true` on the project it failed with exit 1. vitest 4's inline projects don't inherit root options unless `extends: true` is set. Vitest 5 makes that the default. Today only the pre-edit hook and the weakening diff review stop `.only`; the runner itself does not.
- `.claude/checks.json` is missing (reviewer, TASK-1.3), so `record-check --tier fast|full` cannot run and `close-task` cannot check that the declared checks are unchanged. The philosophy plugin expects one command per tier: `{"fast": "...", "full": "..."}`.
- The R55 list includes checks not yet built:
  - allow and deny tests for security rules (R49): no rules tests exist;
  - schema version bumps (R54);
  - end-to-end flows pointing only at the emulators (R51, R52), covered today only because `firebase-isolation` scans every `.yaml` file;
  - nothing both built and still in `design/reference/` (R66), which waits for TASK-1.19.
- Not yet verified: lefthook has not run through a real `git commit`; the hooks have not run inside a live Claude Code session. Post-edit timing is about 1 s measured by hand (`check --mode files`, 416 ms in-process), and `hooks.test.ts` asserts under 5,000 ms.
- Current versions on 2026-10-18: vitest 5.0.5 (5.0.0 on 2026-09-03; needs Node 22.12+ and Vite 6.4+; inline projects now `extends: true` by default; `clearMocks` on by default; `-t` matches the full joined name); Maestro CLI 2.6.0 (2026-05-25; Java 17+); Detox 20.51.4; Stryker 10.0.0 with `@stryker-mutator/vitest-runner` 10.0.0 (peer `vitest >=2`).

Options weighed:

Runner
- vitest 4.1 (keep for now). It runs everything today (226 unit, ui, app and tools tests, plus 22 emulator tests) with one config, and handles ESM, TypeScript and the RN-web alias without transforms.
- vitest 5. It fixes the inheritance trap by default, but it is 6 weeks old and changes defaults (`clearMocks`, `-t`) that the hooks' fix messages mention.
- Jest with jest-expo. This was rejected by the skeleton: a second transform pipeline and a native preset, for component tests that already render through react-native-web.

End-to-end (R51)
- Maestro. YAML flows, black box, selects by text and accessibility label (in line with R50). Expo's EAS workflows guide uses it, it runs locally with `maestro test`, and it needs Java 17+, which the Firebase emulators already need. No second JavaScript test runner. It does not sync with React Native internals, so waits are explicit (`extendedWaitUntil`).
- Detox. Gray-box sync with the JavaScript thread and the network makes flows less flaky. But Detox runs under Jest (a second runner and config), and needs native build settings per platform and a config plugin for Expo prebuild. Its flows are code that would need its own lint and layer rules.

Mutation testing
- Now: no. The domain is about to be rewritten by D4's fold.
- Later: Stryker with the vitest runner, on `packages/core` only. That is where a surviving mutant means a merge rule nobody tests.

## Decision

Runners:
- Keep vitest 4.1 and set `extends: true` on all five projects in `vitest.config.ts`, so the root `allowOnly: false` applies.
  - Add a test in `tools/checks/repo-checks.test.ts` that imports `vitest.config.ts` and asserts every project has `extends: true` and the root `allowOnly` is `false`. Add a second test that runs vitest, in a temporary directory, on a copy of that config and a file containing `it.only`, and asserts exit 1. Without those tests, the guard is unproven.
  - This edit loosens nothing, but it touches a protected file, so the pre-edit hook will ask. Bruk approves it.
- Moving to vitest 5 is a separate task, once 5.x has a minor release. Its proof is the full tier passing unchanged.
- Keep fast-check (properties), Testing Library with jsdom 26 and react-native-web (components that render stories, R65), and `@firebase/rules-unit-testing` 6.

Rules tests (R49). Add `firebase/firestore.rules.test.ts` to the `emulator` project, which already includes `firebase/**/*.test.ts`. Each rule gets at least one `assertSucceeds` and one `assertFails` case, with the case name starting with the rule's comment tag (`// rule: activity.create`).

End-to-end (R51): Maestro.
- Flows live in `apps/mobile/e2e/*.yaml`: `sign-in.yaml`, `add-meal.yaml`, `add-item.yaml`, `tick-item.yaml` and `second-device.yaml`.
- They run against a development build whose dev tools connect to the emulators (`src/dev/index.ts`), signed in with the test sign-in (R53).
- `apps/mobile/e2e/run.ts` (`pnpm e2e`) does the following:
  - starts the emulators with seed data (`tools/emulators.ts`);
  - runs each flow with `maestro test --device <id>`;
  - for `second-device.yaml`, runs two Maestro processes on two devices, one adding and one waiting with `extendedWaitUntil` up to 3 s. On Linux that is two Android emulators; on macOS, the Android emulator and the iOS simulator.
- Elements are found by accessibility label, never by coordinates.
- Flows run locally before an app-layer slice task closes. A `workflow_dispatch` CI job is added only once a dev-client build exists in CI. It is not on every pull request, because it needs a native build and an Android emulator runner.

Checks: every script check is listed in `tools/checks/registry.ts`, each with fixture tests asserting rule id, Why and Fix. New checks:
- `rules-coverage` (R49): every `allow` line in `firebase/firestore.rules` carries a `// rule: <tag>` comment, and `firestore.rules.test.ts` has both a succeeding and a failing case for each tag.
- `schema-versions` (R54): for each `*_SCHEMA_VERSION = n` in `packages/core/src/schema/`, fixtures `v1` to `vn` exist and are decoded by a `*.migration.test.ts`. The encoder's output for the canonical sample must equal fixture `vn`, so a shape change without a bump fails (D4).
- `personal-marking` (R36): every stored string field is marked personal or not personal (D7).
- `sync/no-transactions` (R16): there is no `runTransaction` under `packages/providers-firebase` or `apps/mobile` (D4).
- `e2e-emulator-only` (R51, R52): every flow in `apps/mobile/e2e/` launches the development app id, and `run.ts` starts the emulators and sets `EXPO_PUBLIC_EMULATOR_HOST`. This is on top of `firebase-isolation`'s scan.
- `svg/generated-in-sync` and `interactive-states` (R59, R61, R62; D9).
- `reference-built` (R66): fails when a name is both built and still in `design/reference/` (the canvas was retired on Oct 18, 2026).
- `import-layers` gains `unknown-ui-folder` and `no-self-barrel` (D3).

Which hook runs what:

| Where | Runs | Budget |
|---|---|---|
| PreToolUse (Edit, Write, Bash) | `pre-edit.ts`: weakening review of the proposed file. Denies focus, skip or deleted tests; asks for protected config, check-code shrinkage and shell rewrites of protected files. | under 1 s |
| PostToolUse (Edit, Write) | `post-edit.ts`: every registry check, with findings filtered to the edited file | under 5 s (R56); about 1 s today |
| Stop | `stop.ts`: the `fast` tier command read from `.claude/checks.json` | 300 s timeout; lets the stop through on the second attempt (`stop_hook_active`), and CI still fails |
| pre-commit (lefthook) | `run.ts --mode staged` (registry plus staged weakening), `pnpm typecheck`, `pnpm test` | |
| CI `checks` job | `run.ts --mode all`, `run.ts --mode ci --base origin/<base>` on pull requests, `pnpm typecheck`, `pnpm test` | |
| CI `emulators` job | `pnpm test:emulator` (contracts, rules, two-client, log redaction) | |
| CI `bundles` job | `pnpm check:release` (R53, R64), `pnpm --filter @grocs/ui build-storybook` | |

Tiers (`.claude/checks.json`, new):
- The file holds `{"fast": "pnpm -s verify:fast", "full": "pnpm -s verify"}`.
- Root scripts:
  - `"verify:fast": "pnpm check && pnpm typecheck && pnpm test"`
  - `"verify": "pnpm verify:fast && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook"`
- `stop.ts` reads the `fast` command from `checks.json` instead of listing its own steps, so the agent's stop gate and `record-check --tier fast` cannot drift apart.
- Add `^\.claude/checks\.json$` to `CHECK_CONFIG` in `tools/checks/weakening.ts`, so loosening a tier asks first, the same as `lefthook.yml`.

Judgement-only rules (R58): keep the three files. A new rule file needs:
- a `paths:` scope;
- a "Why" paragraph;
- a sentence saying why no script can check it.

When a rule becomes checkable, its script lands and the file is deleted in the same change.

Mutation testing:
- Add Stryker 10 (`@stryker-mutator/core`, `@stryker-mutator/vitest-runner`) on `packages/core/src/**` once D4's fold and its property tests land.
- It runs as `pnpm mutate`, by hand or weekly in CI. It is never in a hook or pre-commit, because a full run takes minutes.
- The first run sets the baseline. `thresholds.break` is then fixed at the baseline score, rounded down to the nearest 5, and only ever raised, which the weakening review enforces on `stryker.config.json`.

## Consequences

- `.only` becomes a runner failure as well as a hook denial, so a focused test that reaches the repo some other way (an editor, a merge) still fails CI.
- `record-check` and `close-task` work once `checks.json` lands. The full tier needs Java and runs the Expo export twice, so it takes minutes, which is why only the reviewer and CI run it (the plugin's tiers).
- Maestro gives no gray-box sync. Flows must wait on visible text, and a flaky flow is fixed by waiting for the right element, never by adding sleeps. Two-device flows need two simulators or emulators running, which is heavy on a laptop. The iOS half needs macOS with Xcode.
- R51 runs locally, not on every pull request, until a dev client is built in CI. That gap is accepted and recorded. A slice cannot close without its flow's local run recorded through `record-check`.
- `rules-coverage` relies on a comment convention in the rules file. A rule without a tag fails, which is intended, but it means every rules change also touches comments.
- Each new check adds to the post-edit run. The budget is 5 s and today's run is about 1 s. If it passes 3 s, files mode should parse only the edited files plus the import graph's neighbours, instead of running every check over the repo and filtering afterwards (`run.ts`).
- CI ran green on GitHub on Oct 18, 2026 (all three jobs). Still unproven until they run: lefthook through a real commit, the hooks inside a live session, and the vitest 5 upgrade.

## Sources

- Vitest 5 migration guide (Node 22.12+, inline projects `extends` default, `clearMocks`, `-t` matching): https://v5.cn.vitest.dev/guide/migration/
- Expo, E2E tests on EAS Workflows with Maestro (flows, simulator and APK builds, local runs): https://docs.expo.dev/eas/workflows/examples/e2e-tests/
- Maestro CLI installation (Java 17+): https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli
- Maestro CLI 2.6.0 release (25 May 2026; parallel iOS simulators, `--device-os`): https://maestro.dev/blog/maestro-cli-v2-6-0
- npm registry, checked 2026-10-18: vitest 5.0.5 (5.0.0 published 2026-09-03; repo has 4.1.12), detox 20.51.4, `@stryker-mutator/core` and `@stryker-mutator/vitest-runner` 10.0.0 (peer `vitest >=2`), fast-check 4.10.2, `@firebase/rules-unit-testing` 6.0.0, lefthook 2.2.2
- philosophy plugin: `README.md` and `skills/verify-work/SKILL.md` (`.claude/checks.json` tiers), `scripts/record-check` (`declared_check`)
- Repository evidence: the `allowOnly` reproduction above (scratch config against the repo's vitest 4.1.12); `vitest.config.ts`, `lefthook.yml`, `.claude/settings.json`, `.github/workflows/ci.yml`, `tools/checks/*`, `tools/hooks/*`; TASK-1.3 review notes
