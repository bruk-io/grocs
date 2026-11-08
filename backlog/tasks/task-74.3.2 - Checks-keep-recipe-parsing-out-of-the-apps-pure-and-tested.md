---
id: TASK-74.3.2
title: 'Checks keep recipe parsing out of the apps, pure and tested'
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:50'
labels:
  - size-3
  - orchestrator
dependencies: []
modified_files:
  - tools/checks/import-layers.ts
  - tools/checks/import-layers.test.ts
  - tools/checks/core-purity.ts
  - tools/checks/test-presence.ts
  - tools/checks/repo-checks.test.ts
  - .claude/rules/providers-hold-no-rules.md
parent_task_id: TASK-74.3
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Decision-15's enforcement. The orchestrator does it because tools/ and .claude/ belong to no layer (TASK-10.7 precedent). It has five parts:
(1) An import-layers/app-providers rule.
(2) core-purity's scope is extended to packages/providers-server/src/recipe/pure/.
(3) A new import-layers/pure-folder rule. It is needed because core-purity bans only ambient globals, and the providers layer may otherwise import node built-ins and any package.
(4) test-presence's domain-unit-test scope is extended to pure/, so the rule file's 'unit-tested' claim is enforced.
(5) The .claude/rules/providers-hold-no-rules.md carve-out.
The weakening review needs every check-code edit to be net-additive in non-comment lines. Covers TASK-74.3 AC#5 (the app cannot import it; pure) and TASK-74 AC#8.

Split key: orch-pure-boundary. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 import-layers has an APP_PROVIDERS table { mobile: ['providers-firebase','providers-device','providers-memory'], functions: ['providers-server'] } and a rule import-layers/app-providers (req 'R26, R27', why longer than 40 chars, fix longer than 20 chars). It fails an app importing a provider not in its list, and fails closed for an app missing from the table, with no test-file exemption
- [x] #2 import-layers has a rule import-layers/pure-folder. A non-test file under packages/providers-server/src/recipe/pure/ may import only @grocs/core and relative files that resolve inside pure/. A node built-in, a third-party package or a ../ import that leaves pure/ fails
- [x] #3 core-purity scans packages/core/src/ and packages/providers-server/src/recipe/pure/ (non-test files), and its rule text names both
- [x] #4 test-presence/domain-unit-test also covers non-test .ts files under packages/providers-server/src/recipe/pure/ (fixtures/ excluded)
- [x] #5 tools/checks/import-layers.test.ts has accept cases (mobile→providers-firebase/-device/-memory, functions→providers-server), reject cases (mobile→providers-server, functions→providers-firebase, apps/other→any provider, pure→node:crypto, pure→../fetch-page.ts) and a message case. repo-checks.test.ts has a pure/ Date.now() fixture that fails core-purity, a recipe/fetch-page.ts fixture that passes, and a pure/ module with no test that fails test-presence
- [x] #6 The existing first import-layers test (apps/mobile composition importing providers-firebase) still passes, and pnpm check passes on main with no weakening finding
- [x] #7 providers-hold-no-rules.md names packages/providers-server/src/recipe/pure/ as a deliberate decision-15 exception: the parsing is server-only, held to core-purity, pure-folder and test-presence, so R25's drift reason does not apply
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. tools/checks/import-layers.ts: export APP_PROVIDERS { mobile: [providers-firebase, providers-device, providers-memory], functions: [providers-server] }. Inside the '@grocs/' branch, after the existing ALLOWED_PROJECT check, when unit.layer === 'app' and targetUnit.layer === 'providers': no table entry for unit.name -> fail closed; target not in the list -> fail. No test-file exemption. Add the RuleInfo 'import-layers/app-providers' (req 'R26, R27').
2. Same file: PURE_ROOT = 'packages/providers-server/src/recipe/pure/'. At the top of the per-import loop (before the branches that `continue`, so the existing rules still run), for a non-test file under PURE_ROOT: allowed iff spec === '@grocs/core', or spec starts with '.' and posix.normalize(join(dirname(file), spec)) starts with PURE_ROOT. Anything else (node built-in, third-party, another @grocs package, a ../ that leaves pure/) -> 'import-layers/pure-folder' (req 'R25, R26'), with RuleInfo naming decision-15.
3. tools/checks/core-purity.ts: PURE_ROOTS = ['packages/core/src/', the pure root]; run() scans non-test files under either root; the rule text names both folders.
4. tools/checks/test-presence.ts: the same two roots for domain-unit-test, same exported-function and index.ts rules, excluding paths under pure/fixtures/. Rule text names both.
5. Tests: import-layers.test.ts accept, reject and message cases per AC#5; repo-checks.test.ts: pure/ Date.now() fails core-purity, recipe/fetch-page.ts with Date.now() passes, a pure/ module without a test fails test-presence (pure/fixtures/ exempt). Run `mise exec -- pnpm exec vitest run --project tools tools/checks`.
6. .claude/rules/providers-hold-no-rules.md: add the decision-15 exception paragraph. Run `pnpm check`; commit through the hooks.

### Risks
- The weakening review (loosen-check-config, 'ask') fires when check code loses more non-comment lines than it gains: only widen or append, so every replaced line is matched by at least as many added lines.
- app-providers must not break the current tree: apps/mobile imports only providers-device/-firebase/-memory and apps/functions only providers-server (searched), so it passes today.
- pure-folder must not replace the existing rules for those files: it adds a finding before the existing branches and does not `continue`.
- The contract is frozen; a needed change goes to the notes and the work stops.

### Proof
- AC#1, #2, #5, #6: the tools vitest project (import-layers.test.ts, including 'every rule has a requirement, a reason and a fix' and the unchanged first accept test).
- AC#3, #4: repo-checks.test.ts cases and the rule text.
- AC#6: `pnpm check` exits 0 with no weakening finding; the pre-commit hook passes.
- AC#7: the rule file text.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Worker report (2026-11-06, commit 753f1c3 on branch worktree-wf_ff6cb6f7-7f6-2).

Base: the worktree was cut from origin/main (9e3739c, TASK-67), which local main (b3168d7, board split) had not merged, so `git merge --ff-only main` failed; I merged local main in (4b3e3ea) to get this task file. Whoever lands this branch on main gets 9e3739c's TASK-67 commits with it.

Per AC:
- AC#1: tools/checks/import-layers.ts exports APP_PROVIDERS { mobile: [providers-firebase, providers-device, providers-memory], functions: [providers-server] }; rule import-layers/app-providers (req 'R26, R27'). An app with no table entry fails ('no entry in APP_PROVIDERS'); no test-file exemption (a.test.ts case in the tests). The existing 'every rule has a requirement, a reason and a fix' test covers the why/fix lengths.
- AC#2: rule import-layers/pure-folder. Non-test files under packages/providers-server/src/recipe/pure/ may import '@grocs/core' or a relative spec whose normalised path stays under pure/; anything else fails. Runs before the existing branches, so the other rules still apply.
- AC#3: core-purity uses PURE_ROOTS = ['packages/core/src/', PURE_ROOT]; summary and why name both folders.
- AC#4: test-presence/domain-unit-test covers pure/ except pure/fixtures/; summary names both folders.
- AC#5/#6: `mise exec -- pnpm exec vitest run --project tools tools/checks` -> Test Files 11 passed (11), Tests 165 passed (165). Verbose run of the two files: Tests 54 passed, including 'accepts imports that follow the layer table' (first test, unchanged), the 5 app-providers cases (mobile->firebase/device/memory and functions->server accepted; mobile->server, from shipped and test files; functions->firebase; apps/other->each provider; message case), the 5 pure-folder cases (node:crypto, ../fetch-page.ts, cheerio, @grocs/ports rejected; @grocs/core and inside-pure relatives accepted; pure/ tests may use node:fs), core-purity pure/ Date.now() fails and recipe/fetch-page.ts passes, test-presence pure/ module with no test fails (fixtures/ and recipe/fetch-page.ts exempt).
- AC#6: `pnpm check` -> 'checks passed (16 checks, all mode, 972 ms)', exit 0. `node tools/checks/run.ts --mode staged` (the weakening review over the staged diff) -> 'checks passed (16 checks, staged mode, 1121 ms)', with no weakening finding. Check-code diff is net-additive. Pre-commit hook: checks, typecheck, unit-tests all passed (138 files, 1765 tests).
- AC#7: .claude/rules/providers-hold-no-rules.md gains the section 'The one exception: packages/providers-server/src/recipe/pure/ (decision-15)', saying the parsing is server-only, held to core-purity, pure-folder and test-presence, so R25's drift reason does not apply.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(728 earlier lines omitted)
```text
│  3.74 kB │ gzip:   1.49 kB
│  storybook-static/assets/MealFormTemplate.stories-BJvMPDA9.js
│  4.32 kB │ gzip:   1.57 kB
│  storybook-static/assets/ItemPickerTemplate.stories-iyUaXL-l.js
│  4.44 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-DDvgNhDZ.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/HouseholdTemplate.stories-CJui020R.js
│  4.53 kB │ gzip:   1.63 kB
│  storybook-static/assets/TextField-ZdBDfVj1.js
│  4.98 kB │ gzip:   1.91 kB
│  storybook-static/assets/PreferencesTemplate.stories-C2LX3yE-.js
│  5.11 kB │ gzip:   1.94 kB
│  storybook-static/assets/ItemRow-BYSQ93cB.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/Button-DKPnTv6W.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-DwX1idTa.js
│  9.35 kB │ gzip:   3.10 kB
│  storybook-static/assets/Mascot-B-BgWzFn.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-CudUpoJU.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-wZvIXmNv.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-CtHm6pvx.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-CEo_91uI.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-bpIYa3uk.js
│  1,360.87 kB │ gzip: 392.11 kB

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

│  Vite ✓ built in 1.26s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 425 story views checked (axe, 44 x 44, images not compared)
```

Review (philosophy:reviewer): closed. All 7 ACs met. Evidence: commit 753f1c3 diff (APP_PROVIDERS + import-layers/app-providers fail-closed with no test exemption; import-layers/pure-folder before the existing branches; core-purity PURE_ROOTS; test-presence isDomainModule excluding pure/fixtures/; providers-hold-no-rules.md exception section); tools vitest project 165/165 passed; full tier record-check exited 0; check-code diff 173+/5- net-additive, staged weakening review clean. Findings, none filed: (low) core-purity scans pure/fixtures/ too, harmless while fixtures are non-.ts data; (low) pure-folder allows a relative import into pure/fixtures/ from shipped code, acceptable since it stays inside pure/; (process) the full-tier record-check runs test:emulator, which the orchestrator asked reviewers not to start; it passed, but parallel reviewers may have collided on ports.
<!-- SECTION:NOTES:END -->
