---
id: TASK-74.3.2
title: 'Checks keep recipe parsing out of the apps, pure and tested'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-3
  - orchestrator
dependencies: []
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
- [ ] #1 import-layers has an APP_PROVIDERS table { mobile: ['providers-firebase','providers-device','providers-memory'], functions: ['providers-server'] } and a rule import-layers/app-providers (req 'R26, R27', why longer than 40 chars, fix longer than 20 chars). It fails an app importing a provider not in its list, and fails closed for an app missing from the table, with no test-file exemption
- [ ] #2 import-layers has a rule import-layers/pure-folder. A non-test file under packages/providers-server/src/recipe/pure/ may import only @grocs/core and relative files that resolve inside pure/. A node built-in, a third-party package or a ../ import that leaves pure/ fails
- [ ] #3 core-purity scans packages/core/src/ and packages/providers-server/src/recipe/pure/ (non-test files), and its rule text names both
- [ ] #4 test-presence/domain-unit-test also covers non-test .ts files under packages/providers-server/src/recipe/pure/ (fixtures/ excluded)
- [ ] #5 tools/checks/import-layers.test.ts has accept cases (mobile→providers-firebase/-device/-memory, functions→providers-server), reject cases (mobile→providers-server, functions→providers-firebase, apps/other→any provider, pure→node:crypto, pure→../fetch-page.ts) and a message case. repo-checks.test.ts has a pure/ Date.now() fixture that fails core-purity, a recipe/fetch-page.ts fixture that passes, and a pure/ module with no test that fails test-presence
- [ ] #6 The existing first import-layers test (apps/mobile composition importing providers-firebase) still passes, and pnpm check passes on main with no weakening finding
- [ ] #7 providers-hold-no-rules.md names packages/providers-server/src/recipe/pure/ as a deliberate decision-15 exception: the parsing is server-only, held to core-purity, pure-folder and test-presence, so R25's drift reason does not apply
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add APP_PROVIDERS and an app-providers branch inside the '@grocs/' block after the layer check, plus its RuleInfo entry.
2. Add the pure-folder rule: for non-test files under the pure root, allow only @grocs/core and relative specifiers that resolve inside pure/.
3. Replace core-purity's single startsWith with a PURE_ROOTS list and widen its rule text.
4. Widen test-presence's domain-unit-test scope the same way, excluding pure/fixtures/.
5. Add the tests listed in the ACs and run `mise exec -- pnpm exec vitest run --project tools tools/checks`.
6. Amend the rule file, run `pnpm check`, confirm there is no weakening finding, and commit on main.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- tools/checks/import-layers.ts
- tools/checks/import-layers.test.ts
- tools/checks/core-purity.ts
- tools/checks/test-presence.ts
- tools/checks/repo-checks.test.ts
- .claude/rules/providers-hold-no-rules.md
<!-- SECTION:PLAN:END -->
