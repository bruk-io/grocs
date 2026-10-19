---
id: TASK-2
title: Weakening check flags CI action version bumps with no sanctioned override
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 21:59'
updated_date: '2026-10-19 11:57'
labels:
  - size-2
dependencies: []
modified_files:
  - tools/checks/weakening.ts
  - tools/checks/weakening-overrides.json
  - tools/checks/weakening.test.ts
  - tools/checks/run.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
weakening/loosen-check-config (R57) treats any line removal in .github/workflows/* as loosening, so a routine action version bump (actions/checkout@v4 -> @v7) fails the check. TASK-1.35 could only land by committing with git commit --no-verify, with the approval recorded in prose in the commit body; running 'node tools/checks/run.ts --mode ci --base 0a26823~1' on current main still FAILs on that diff.

Two consequences:
- There is no sanctioned override path, so every future workflow bump either bypasses the hook or stalls. fix-the-code-not-the-check.md says a person makes the call, but nothing records that call in a form the check can see.
- The ci-mode step in ci.yml is gated on 'github.event_name == pull_request', so the same diff passes on a push to main and fails as a PR. The check's verdict depends on how the change arrives.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A version-only bump of a pinned action or tool in .github/workflows/* does not trigger weakening/loosen-check-config
- [x] #2 A genuine loosening of a workflow (adding continue-on-error, excluding a path, dropping a step) still fails the check
- [x] #3 Where a human override is allowed, it is recorded somewhere the check reads, not only in a commit message
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. tools/checks/weakening.ts: add a line-pair matcher that normalizes digit/version tokens (e.g. '@v4' -> '@v7', 'node-version: 20' -> '22') and, for isCheckConfig files only, excludes matched remove/add pairs from the removedReal/addedReal counts before the 'removes N lines' and LOOSENING_WORDS checks run. A pair only matches when the lines differ only in digits and the line contains '@' or the word 'version' (scopes it to pinned-version bumps, not arbitrary number edits like a threshold).
2. tools/checks/weakening.ts: add a WeakeningOverride type (file, beforeHash, afterHash, approvedBy, reason, date) plus hashContent()/isOverridden() pure helpers (sha256 via node:crypto). reviewChange() gains an optional 'overrides' param (default []); inside the isProtected(file) branch, if isOverridden(file, before, after, overrides) is true, return no findings for that exact diff. Scoped to the isProtected branch only (check-config/check-code loosening) so test-deletion rules can never be overridden this way.
3. tools/checks/weakening-overrides.json: new, checked-in, empty array by default. This is the file a human-approved exception is recorded in (read by the check itself), keyed to the exact before/after content hash of one diff so it cannot be reused as a blanket bypass once the file changes again.
4. tools/checks/run.ts: load the overrides file (readFileSync relative to this module, swallow a missing/invalid file as []) once in main(), thread it through reviewGitChange() into reviewChange().
5. tools/checks/weakening.test.ts: add cases - a pure action-version bump (checkout@v4 -> @v7) on a workflow file produces no findings; a version bump line that also adds continue-on-error still fails; dropping a step (real line removal, no paired add) still fails; excluding a path still fails; an override entry matching the exact before/after hash suppresses the finding, and a stale override (content changed again) does not.
6. Update the loosen-check-config rule's 'fix' text to mention recording an override in weakening-overrides.json instead of --no-verify.
7. Re-verify against TASK-1.35's actual landed diff (0a26823) per the task description, to confirm the real-world false positive is now gone.
8. pnpm check && pnpm typecheck && pnpm test.

### Risks
- Over-broadening the version-bump matcher could let a real loosening slip through disguised as a version change; scoping it to lines containing '@' or 'version', requiring the LOOSENING_WORDS check still runs independently, and requiring the two lines differ *only* in digits bounds this.
- An overrides file that is not tied to the exact diff content would be a standing bypass; hashing before+after content closes that - changing the file again invalidates the override.
- Must not touch the ci-mode push-vs-PR asymmetry beyond what's needed (not in scope per AC1-3; noting it in implementation notes if still open).

### Proof
- New unit tests in weakening.test.ts covering AC1/AC2/AC3 pass.
- 'node tools/checks/run.ts --mode ci --base 0a26823~1' (TASK-1.35's real diff) no longer FAILs on the version-pin-only changes.
- pnpm check && pnpm typecheck && pnpm test all green.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fix: version-only bumps of pinned CI actions/tools no longer trigger weakening/loosen-check-config; real loosening still fails; overrides recorded in tools/checks/weakening-overrides.json, keyed to exact before/after content hash.

Changed files: tools/checks/weakening.ts, tools/checks/weakening-overrides.json (new), tools/checks/run.ts, tools/hooks/pre-edit.ts, tools/checks/weakening.test.ts.

1. isVersionBumpPair(removed, added) in weakening.ts: a removed/added line pair is treated as a non-loosening version bump only when they differ only in digits (digit runs collapsed to a placeholder), the line contains @ or the word version, and neither line matches LOOSENING_WORDS. excludeVersionBumps() removes matched pairs before the config-file removal count and loosening-word checks run, so a pure action version bump (checkout@v4 -> @v7 etc) produces zero findings, while any left-over removal or added loosening word in the same diff still fails.

2. WeakeningOverride type + hashContent()/isOverridden()/loadOverrides(root) in weakening.ts. An override entry is {file, beforeHash, afterHash, approvedBy, reason, date}, hashed from the file's exact before/after content, not just its path. It is checked only inside the isProtected() branch (check config/check code), never against the test-weakening rules, and only AFTER the file-deleted branch, so an override can never wave through a check config's outright deletion, only one specific content-to-content change. Because it is keyed to exact content it stops applying the moment the file changes again: a one-time, auditable exception, not a standing bypass.

3. tools/checks/weakening-overrides.json: new, checked in, starts as an empty array. This is the file AC3 asks for: a human override recorded somewhere the check itself reads, not only in commit-message prose.
4. run.ts (CI/pre-commit) and pre-edit.ts (the per-edit hook) both call loadOverrides(root) and thread it into reviewChange, so the agent-edit hook, the pre-commit staged diff and the CI diff-against-base keep agreeing, per weakening.ts's own header comment.

Honesty note: the overrides file is not an authentication boundary. An agent can write an entry into weakening-overrides.json as easily as a human can; the content-hash pin only guarantees it cannot be a standing bypass (it dies the instant the content changes again) and that it is visible in the diff for review. It does not replace a human actually having looked.

Honesty note: the task description's second named consequence (ci.yml's weakened-checks step only runs on pull_request, so the same diff passes on push to main but fails as a PR) is deliberately NOT touched here. None of AC1-3 cover it, and fixing it means removing that if-gate line from a protected workflow file with no paired addition, which would itself need an override entry - a separate follow-on change. Left as-is so it is not filed twice.

Verification: node tools/checks/run.ts --mode all passes (9 checks). pnpm check, pnpm typecheck and pnpm test are all green (287 tests, 35 files). No Firebase/emulator code touched, so pnpm test:emulator was not run.

Test evidence: weakening.test.ts now embeds the real before/after content of commit 0a26823 (the checkout/setup-node/setup-java/cache/pnpm-action-setup v4-to-v6-or-v7 bump that previously needed --no-verify), extracted from the two blobs on either side of that commit. reviewChange() on that exact diff returns [] (AC1). continue-on-error, a dropped field, and paths-ignore each still fail even layered on the same legitimate bumps (AC2). A mispairing-safety test drops the java-version field alongside unrelated legitimate bumps and confirms the removal still surfaces, naming java-version in the finding. An override entry keyed to one exact before/after hash suppresses that one diff and stops applying once the file changes again, and does not apply to a file deletion or a different file (AC3).

Did not run the end-to-end run.ts --mode ci --base 0a26823~1 command mentioned in the task description: from this worktree's branch that would compare the whole branch, including this task's own edits, against that ancestor and conflate the two. The unit tests against the real extracted blobs are the hermetic equivalent and are what AC1 is judged on.

Check `pnpm check && pnpm typecheck && pnpm test` exited 1

```text
 ERR_PNPM_UNSUPPORTED_ENGINE  Unsupported environment (bad pnpm and/or Node.js version)

Your Node version is incompatible with "/Users/brukhabtu/src/github.com/bruk-io/grocs".

Expected version: >=24.12
Got: v22.21.1

This is happening because the package's manifest has an engines.node field specified.
To fix this issue, install the required Node version.
```

Check `pnpm check && pnpm typecheck && pnpm test` exited 0

```text

> grocs@0.0.0 check /Users/brukhabtu/src/github.com/bruk-io/grocs
> node tools/checks/run.ts --mode all

checks passed (12 checks, all mode, 211 ms)

> grocs@0.0.0 typecheck /Users/brukhabtu/src/github.com/bruk-io/grocs
> tsc --noEmit


> grocs@0.0.0 test /Users/brukhabtu/src/github.com/bruk-io/grocs
> vitest run --project unit --project ui --project app --project tools


 RUN  v4.1.12 /Users/brukhabtu/src/github.com/bruk-io/grocs


 Test Files  37 passed (37)
      Tests  381 passed (381)
   Start at  00:28:15
   Duration  6.02s (transform 3.17s, setup 0ms, import 8.27s, tests 7.89s, environment 1.68s)
```

Reviewer note (philosophy:reviewer, 2026-10-19): the first `pnpm check && pnpm typecheck && pnpm test` record above, exited 1, is an artifact of my shell running Node 22 instead of the repo-pinned Node 24 (mise.toml) - not a real failure of this task. The exit-0 record immediately after it is the true fast-tier result, run under `mise exec`.

Reviewer verification of AC1 against reality: extracted the actual `.github/workflows/ci.yml` blobs from 0a26823~1 and 0a26823 with `git show` and ran `reviewChange(".github/workflows/ci.yml", before, after)` on them directly. Result: `[]`. That is stronger evidence for AC1 than the embedded fixture, since it uses the real committed content rather than a reconstruction.

No repro: the failing command this bug names (node tools/checks/run.ts --mode ci --base 0a26823~1) can no longer fail, since the fix (b4af711) is already on main - running it now would pass, which record-check --repro refuses to record as a repro. The hermetic equivalent is already in the test suite: weakening.test.ts's 'allows a pure version-only bump of pinned CI actions (TASK-2, the real 0a26823 diff)' test and the reviewer's own independent probe (reviewChange() run directly against the real git-show blobs of .github/workflows/ci.yml at 0a26823~1 and 0a26823, result []) both exercise the exact historical failure against the real content, just without needing to roll the repo back to reproduce it live.

Checks changed: .claude/checks.json changed after TASK-2 was accepted, in 5a3cecc (decision-11's browser pass over Storybook). The diff only appends 'pnpm --filter @grocs/ui visual -- --no-build' to the 'full' tier; the 'fast' tier this task was verified under (pnpm check && pnpm typecheck && pnpm test) is byte-identical to the accepted one.

Confirmed closed by the orchestrator after philosophy:reviewer's independent review (verified against the real git-show blobs of .github/workflows/ci.yml at 0a26823~1 and 0a26823, not just the test fixture). All three ACs met: AC1 version-only bumps pass clean, AC2 continue-on-error/dropped-step/paths-ignore/dropped-field all still fail even layered on a legitimate bump, AC3 the content-hash-pinned override mechanism is wired into both enforcement points and can never waive a deletion. No repro recorded (see implementation notes) since the failing command this bug names can no longer fail now that the fix (b4af711) is on main.
<!-- SECTION:NOTES:END -->
