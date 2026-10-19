---
id: TASK-8
title: isVersionBumpPair's '@' gate is too wide in a repo of @grocs/* scoped names
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 04:28'
updated_date: '2026-10-19 11:58'
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
- [ ] #1 isVersionBumpPair no longer matches a line pair just because both lines contain an @ sign; it matches only shapes that are actually a pinned version (a uses: line, a *-version field, or similar), with isVersionBumpPair('      - run: pnpm --filter @grocs/ui test --shard 1/4', '      - run: pnpm --filter @grocs/ui test --shard 1/1') returning false as a regression test
- [ ] #2 TASK-2's existing weakening.test.ts suite (the real 0a26823 version-bump case, the continue-on-error/dropped-step/paths-ignore cases, the override tests) all still pass unmodified
- [ ] #3 pnpm check, pnpm typecheck, pnpm test all pass
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
