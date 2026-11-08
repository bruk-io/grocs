---
id: TASK-5
title: 'vitest projects ignore the root allowOnly, so it.only passes CI'
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 23:31'
updated_date: '2026-10-19 11:53'
labels:
  - size-2
dependencies: []
modified_files:
  - vitest.config.ts
  - tools/checks/repo-checks.test.ts
  - tools/checks/fixtures/focused-test.fixture.txt
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-9 (D8) reproduced this against the repo's vitest 4.1.12: vitest.config.ts sets allowOnly: false at the root, but its five inline projects (unit, ui, app, tools, emulator) do not inherit root options unless extends: true is set. A scratch config with one inline project and a file containing it.only plus a failing test ran green (exit 0, 1 passed, 1 skipped); with extends: true on the project it exited 1. Today only tools/hooks/pre-edit.ts and the weakening diff review stop a focused test; a .only that reaches the repo any other way (an editor, a merge, a rebase) silently skips the rest of its file in pre-commit and in CI. decision-9 decided the fix (extends: true on all five projects, plus two tests) but it is not built.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Every project in vitest.config.ts sets extends: true and the root allowOnly is false
- [x] #2 A test in tools/checks/repo-checks.test.ts imports vitest.config.ts and asserts every project has extends: true and the root allowOnly is false
- [x] #3 A test runs vitest in a temporary directory on a copy of that config plus a file containing it.only and asserts exit 1
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Confirm vitest 4.1.12's types accept `extends: true` on an inline project (UserWorkspaceConfig.extends: string | true - confirmed in node_modules/vitest/dist/chunks/reporters.d.*.d.ts).
2. Edit vitest.config.ts: add `extends: true` to each of the five inline projects (unit, ui, app, tools, emulator); keep root allowOnly: false.
3. Add a new, uncommitted-until-now fixture file tools/checks/fixtures/focused-test.fixture.txt containing a real it.only test plus a second failing test (decision-9's repro shape), as plain text, not a .test.ts file - so the weakening review (tools/checks/weakening.ts) never scans it as a test file and never denies it as a protected check-config edit (it's a brand-new file, and isProtected's loosen-check-config branch only fires when `before !== null`).
4. Add to tools/checks/repo-checks.test.ts:
   a. A static test that imports vitest.config.ts's default export, asserts `test.projects.length === 5` (so the assertion is not vacuous if the shape changes - mirrors agent-definitions.test.ts's "generates exactly 18" pattern), then asserts every project has `test.extends === true` for its own `test` block and that the root `test.allowOnly === false`.
   b. A spawn test that: makes an OS temp dir outside the repo tree (mkdtempSync under os.tmpdir(), never under the repo, so the spawned vitest cannot recurse into this very suite); copies vitest.config.ts's real text plus package.json's vitest devDependency resolution via an absolute path to the repo's node_modules/vitest; writes the fixture's it.only content to a file matching the `tools` project's include glob; runs the repo's installed vitest binary (absolute path to node_modules/.bin/vitest or vitest/vitest.mjs) against the copied config with `--project tools`; asserts exit code 1 and asserts the stdout/stderr mentions allowOnly (not just a non-zero exit for an unrelated reason, e.g. config-load failure); includes the paired control decision-9's own repro used - the same temp config with `extends: true` stripped from the `tools` project - asserts exit 0 with 1 passed/1 skipped, proving the harness can tell the two states apart. Explicit `{ timeout: 60_000 }` on this it(), since a real vitest subprocess won't finish in the default 5s.
   c. Document in the test comment and in the implementation notes that the spawn test exercises only the `tools` (node) project - `ui`/`app` need jsdom + the RN-web alias and are out of scope for this regression proof; the static test (4a) is what covers all five projects' shape.
5. Run `pnpm check && pnpm typecheck && pnpm test` and `pnpm test:emulator` (the emulator project's inheritance changed too) and fix anything that breaks.
6. Record implementation notes, tick ACs 1-3, leave the task In Progress for the reviewer to close.

### Risks
- vitest.config.ts is in CHECK_CONFIG (protected); this edit only adds `extends: true` five times and touches no LOOSENING_WORDS line, so the pre-edit/staged/CI weakening review should pass it through without even an `ask` - if it does ask, that's expected per decision-9 ("this edit touches a protected file, so the pre-edit hook will ask. Bruk approves it") and I proceed since decision-9 recorded Bruk's approval.
- The fixture file's literal `it.only(` text must not land inside a `.test.ts`/`.spec.ts` file or as an edit to an existing protected file, or weakening.ts's FOCUS regex denies the commit. Mitigated by using a new, non-test-extension file (see step 3).
- Module resolution for a vitest config copied into an OS temp dir outside the pnpm workspace: `vitest/config` won't resolve from a bare tmp dir. Mitigated by invoking the repo's own vitest binary by absolute path with an explicit `--config` pointing at the copied file, and by manually reproducing the spawn once by hand before encoding it as a test.
- Exit 1 can be a false positive (e.g. the copied config fails to load for an unrelated reason). Mitigated by asserting on the actual allowOnly error text, not just the exit code, and by the paired control (same config minus `extends: true` on that one project) exiting 0.

### Proof
- `pnpm check && pnpm typecheck && pnpm test` and `pnpm test:emulator` all green, pasted into implementation notes.
- The new repo-checks.test.ts tests pass and fail correctly under manual inversion (e.g. temporarily remove one project's `extends: true` and confirm the static test fails; this check is not committed, just used to prove the test is not vacuous).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation:
- vitest.config.ts: added `extends: true` to all five inline projects (unit, ui, app, tools, emulator). Root `allowOnly: false` unchanged.
- tools/checks/fixtures/focused-test.fixture.txt (new, non-test-extension file so weakening.ts's FOCUS regex never scans it and the loosen-check-config branch never fires for a brand-new file): a real it.only test plus a second failing test, decision-9's repro shape, used both as the static fixture content and the spawn test's input file.
- tools/checks/repo-checks.test.ts, two new describe blocks:
  1. Static test: imports vitest.config.ts's default export, asserts exactly 5 projects (so the shape assertion is not vacuous), then asserts every project has `extends: true` and the root `allowOnly` is `false`.
  2. Spawn test: copies the real, committed vitest.config.ts text plus the fixture into a fresh mkdtemp directory outside the repo tree (so the spawned run cannot recurse into this suite), symlinks node_modules in from the repo root (so `vitest/config` resolves exactly as it does for the committed file - a bare copy into an isolated tmp dir fails to resolve that import, confirmed by hand), and runs the repo's own installed vitest binary against it with `--project tools`. Asserts exit 1 and that the output contains the actual "Unexpected .only modifier" allowOnly error text, not just a non-zero exit. A second test is the real regression control, decision-9's own repro shape: the same real config text with `extends: true` stripped from the tools project (verified by asserting the string replace actually changed the text) exits 0 with "1 skipped" - proving the harness can tell the two states apart.

Why extends:true is legal here: confirmed in the installed vitest 4.1.12 typings (`UserWorkspaceConfig.extends?: string | true` in node_modules/vitest/dist/chunks/reporters.d.*.d.ts) before writing the config change.

Scope note for the reviewer: the spawn test exercises only the `tools` (node) project - `ui`/`app` need jsdom + the react-native-web alias and would fail for unrelated reasons if included. All five projects' shape (extends: true, allowOnly: false) is covered by the static test instead.

Both new tests were manually inverted and observed to fail before being left in their passing form:
- Static test: temporarily stripped `extends: true` from the tools project in vitest.config.ts and reran `vitest run --project tools -t "extends: true on every project"` - failed red (toMatchObject mismatch), then restored and reran green.
- Spawn test's control already asserts the "stripped" state directly (exit 0, 1 skipped) against a config built from the real file, so its own test body proves both states are distinguishable.

Verification (all run from the repo root in this worktree, all green):
- `pnpm check` -> "checks passed (9 checks, all mode, 97 ms)"
- `pnpm typecheck` -> clean, no tsc errors
- `pnpm test` -> "Test Files 35 passed (35)", "Tests 280 passed (280)"
- `pnpm test:emulator` -> "Test Files 5 passed (5)", "Tests 27 passed (27)" (emulator project's `extends: true` addition covered)
- `node tools/checks/run.ts --mode staged` run against the exact staged diff (vitest.config.ts, tools/checks/repo-checks.test.ts, tools/checks/fixtures/focused-test.fixture.txt) -> "checks passed", confirming the new fixture file (new, so `before === null`) and the reworded comments do not trip the weakening review's FOCUS/isProtected checks.

Left In Progress for reviewer close per the task's instructions.

No repro: the bug's failure mode is a *green* run - a stray it.only exits 0 and silently skips the rest of its file - so it cannot produce a failing command on main. The executable repro lives committed in tools/checks/repo-checks.test.ts as the paired spawn tests: the real config exits 1 with 'Unexpected .only modifier', and the control (same config, tools project's extends: true stripped) exits 0 with '1 skipped'. The reviewer re-reproduced the pre-fix defect by hand against git show 9251449^:vitest.config.ts copied into an OS temp dir with the it.only fixture, run under the repo's own vitest 4.1.12: 'Tests 1 passed | 1 skipped (2)', exit 0.

Reviewer close (philosophy:reviewer, did not do the work), 2026-10-19:
- AC1: vitest.config.ts has extends: true on all five inline projects (unit, ui, app, tools, emulator); root test.allowOnly: false unchanged.
- AC2: tools/checks/repo-checks.test.ts:151-164 imports the config's default export, asserts exactly 5 projects (non-vacuity guard), then extends: true on each plus root allowOnly === false.
- AC3: repo-checks.test.ts:166-213 spawns the repo's own vitest 4.1.12 against a copy of the real committed config text plus the it.only fixture in an OS temp dir outside the repo tree; asserts exit 1 and the literal 'Unexpected .only modifier', not a bare non-zero exit. The paired control strips extends: true from the tools project, guards the replace with not.toBe(realConfigText), and asserts exit 0 with '1 skipped'.
- Reviewer's own runs on main under Node 24 (mise): pnpm check 'checks passed (12 checks, all mode)'; pnpm typecheck clean; pnpm test 'Test Files 37 passed, Tests 381 passed'. A verbose run confirmed both spawn tests execute (278 ms / 289 ms) rather than being skipped.
- Not verified by the reviewer: pnpm test:emulator was not re-run (fast tier only). The root test block carries no plugins/resolve/define, so extends: true gives the emulator project nothing but allowOnly; no behaviour change to regress. The worker reported it green (5 files, 27 tests).

Checks changed: .claude/checks.json changed after this task was accepted, in 5a3cecc (unrelated: decision-11's browser pass over Storybook). The diff only appends 'pnpm --filter @grocs/ui visual -- --no-build' to the 'full' tier; the 'fast' tier this task was verified under is byte-identical to the accepted one. The change is strictly stricter and touches nothing about vitest project inheritance, so the checks agreed for TASK-5 are the ones that ran.

Closed by philosophy:reviewer. All three acceptance criteria independently verified on main (fix commit 9251449, an ancestor of HEAD). Fast tier green under Node 24. No code findings; see the reviewer close note above for the per-criterion evidence and the two scope caveats.
<!-- SECTION:NOTES:END -->
