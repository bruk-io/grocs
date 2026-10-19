---
id: TASK-8
title: isVersionBumpPair's '@' gate is too wide in a repo of @grocs/* scoped names
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 04:28'
updated_date: '2026-10-19 12:45'
labels:
  - size-1
dependencies: []
modified_files:
  - tools/checks/weakening.ts
  - tools/checks/weakening.test.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-2 (b4af711) excludes a removed/added line pair from weakening/loosen-check-config when the two lines differ only in digits AND the line matches /@|version/i (tools/checks/weakening.ts:94-99). In this workspace every scoped package name contains @, so the gate admits far more than pinned-version lines - the plan's Risks section claimed scoping to @ or version bounded the matcher, and in this repo that bound is much weaker than claimed.

Demonstrated: isVersionBumpPair("      - run: pnpm --filter @grocs/ui test --shard 1/4", "      - run: pnpm --filter @grocs/ui test --shard 1/1") returns true. Changing --shard 1/1 to 1/4 would stop three quarters of the tests running in CI and be excluded from both the removal count and the LOOSENING_WORDS scan. shard, retry, maxfail and max-workers are not in LOOSENING_WORDS, so nothing else catches it.

Same root cause, lesser case: isVersionBumpPair("          node-version: 22", "          node-version: 20") returns true, so a runtime downgrade reads as a version bump.

Not a TASK-2 acceptance-criterion failure: AC2 names continue-on-error, excluding a path and dropping a step, and all three still fail. This is a residual false-negative worth narrowing.

Likely fix: replace the bare /@|version/i gate with one that matches the line shapes actually meant - a uses: line (/^\s*(-\s*)?uses:\s/) or a *-version field (/-version:\s*v?\d/) - rather than any line containing an @.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 isVersionBumpPair no longer matches a line pair just because both lines contain an @ sign; it matches only shapes that are actually a pinned version (a uses: line, a *-version field, or similar), with isVersionBumpPair('      - run: pnpm --filter @grocs/ui test --shard 1/4', '      - run: pnpm --filter @grocs/ui test --shard 1/1') returning false as a regression test
- [x] #2 TASK-2's existing weakening.test.ts suite (the real 0a26823 version-bump case, the continue-on-error/dropped-step/paths-ignore cases, the override tests) all still pass unmodified
- [x] #3 pnpm check, pnpm typecheck, pnpm test all pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In tools/checks/weakening.ts, replace isVersionBumpPair's bare `if (!/@|version/i.test(removedLine)) return false;` gate with a narrower one that matches only an actual version-pin line shape: a `uses:` step (`/^\s*-?\s*uses:\s/`) or a `*-version:` field (`/[\w-]+-version:\s*['"]?v?\d/i`). Keep everything else (normalizeDigits comparison, LOOSENING_WORDS exclusion) unchanged.
2. Add the regression test from the task's own evidence: isVersionBumpPair('      - run: pnpm --filter @grocs/ui test --shard 1/4', '      - run: pnpm --filter @grocs/ui test --shard 1/1') must return false.
3. Confirm every existing case in tools/checks/weakening.test.ts still passes unmodified (the real 0a26823 ci.yml version-bump case, the continue-on-error/dropped-step/paths-ignore/dropped-java-version cases, the override tests, isVersionBumpPair's own SHA/semver-shape and threshold tests).
4. Run pnpm check, pnpm typecheck, pnpm test (prefix with mise exec -- if the ambient shell resolves Node 22) and confirm all green; commit.

### Risks
- Narrowing the gate must not reintroduce a false positive on a real uses:/*-version: bump (the whole point of TASK-2) - the existing 0a26823 test case is the regression guard for that.
- Do not weaken LOOSENING_WORDS or the removed-line-count path; this is scoped to isVersionBumpPair's line-shape gate only.

### Proof
- isVersionBumpPair returns false for the --shard example and true for the existing uses:/*-version: bump cases.
- pnpm check, pnpm typecheck, pnpm test all green; TASK-2's full existing weakening.test.ts suite passes unmodified.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Review (philosophy:reviewer)

No repro: the bug is already fixed on main (22e680e), so record-check --repro cannot capture a live failing run. The hermetic equivalent was executed instead, two ways, both green:

1. The regression test committed with the fix, tools/checks/weakening.test.ts:198-201, asserts isVersionBumpPair('      - run: pnpm --filter @grocs/ui test --shard 1/4', '      - run: pnpm --filter @grocs/ui test --shard 1/1') === false. On the pre-fix gate that assertion fails.
2. Re-evaluating the pre-fix expression against the same pair, in isolation, reproduces the old behaviour directly: removedLine !== addedLine && /@|version/i.test(removedLine) && !LOOSENING_WORDS on either line && normalizeDigits(removedLine) === normalizeDigits(addedLine) returns true for the shard pair, while the shipped isVersionBumpPair returns false. That is the bug and its fix on the same inputs with no checkout.

Checks changed: the .claude/checks.json drift since 6717246 is 5a3cecc, which only appends `pnpm --filter @grocs/ui visual -- --no-build` to the `full` tier for decision-11's Storybook visual baselines. The `fast` tier that gates this task, `pnpm check && pnpm typecheck && pnpm test`, is byte-identical to what was agreed in 6717246. The drift is additive, in a different tier, and unrelated to tools/checks/; nothing agreed for TASK-8 was loosened.

Independent verification: record-check --tier fast green on main (13 checks, tsc clean, 88 files / 1160 tests). isVersionBumpPair probed directly on eight inputs beyond the suite: the --shard pair, --maxfail, --max-workers and timeout-minutes all return false; uses: actions/checkout@v4->v3, uses: actions/setup-node@v4.0.1->v4.0.2, node-version: 22->20 and java-version: "17"->"11" all still return true. Positive coverage against over-narrowing is the unmodified 0a26823 reviewChange case (weakening.test.ts:150), five uses: pins bumped at once, which still passes.

Residual, not blocking and within AC1 as written (which names a *-version field as a target shape): node-version: 22 -> 20 still reads as a version bump, so the description's "lesser case" of a runtime downgrade is not closed by this fix. Also note the gate still tests removedLine only, so it is not symmetric. Both are narrower follow-ups, not failures of this task.

Closed by philosophy:reviewer. isVersionBumpPair's bare /@|version/i gate is replaced by a version-pin shape gate (a uses: step or a *-version field), so a scoped @grocs/* package name on a --shard, --maxfail or --max-workers line no longer buys an exclusion from the removed-line count and the LOOSENING_WORDS scan. All three acceptance criteria met and independently verified on main: the committed regression test plus eight direct probes of the function, the unmodified 0a26823 five-pin reviewChange case still passing as the guard against over-narrowing, and record-check --tier fast green (13 checks, tsc clean, 88 files / 1160 tests). Two residuals recorded in the review note rather than fixed here, both inside AC1 as written: a node-version downgrade still reads as a version bump, and the gate inspects removedLine only.
<!-- SECTION:NOTES:END -->
