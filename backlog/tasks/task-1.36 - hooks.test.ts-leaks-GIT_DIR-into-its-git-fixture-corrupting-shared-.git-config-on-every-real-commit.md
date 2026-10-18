---
id: TASK-1.36
title: >-
  hooks.test.ts leaks GIT_DIR into its git fixture, corrupting shared
  .git/config on every real commit
status: To Do
assignee: []
created_date: '2026-10-18 21:14'
updated_date: '2026-10-18 21:38'
labels:
  - size-1
  - architecture
  - bug
dependencies: []
parent_task_id: TASK-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from TASK-1.34. tools/hooks/hooks.test.ts's git() helper (execFileSync('git', args, { cwd: root })) never strips GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE/GIT_CEILING_DIRECTORIES from the inherited environment. Harmless when the test runs standalone (pnpm test), but when it runs as a side effect of lefthook's pre-commit hook during a real git commit, git sets GIT_DIR on the hook's process tree, which leaks through lefthook -> pnpm test -> vitest -> this test's git() calls. With GIT_DIR pointing at the real repo and cwd at the tmp fixture dir, the test's git add -A stages the tiny fixture file set into the real index (wiping everything else to deleted), its git config user.name/email writes to the real shared .git/config (common to every worktree), and its nested git init/commit confuses core.bare detection. Deterministic on every real commit until fixed; this already corrupted shared git state 3 times across worker-1-33 and worker-1-34's commit attempts today.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 hooks.test.ts's git() helper strips GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE and GIT_CEILING_DIRECTORIES from the env passed to its git subprocess calls
- [ ] #2 A real git commit that triggers the pre-commit hook (not --no-verify) completes without altering .git/config's core.bare or [user] section
- [ ] #3 hooks.test.ts's own tests still pass
- [ ] #4 tools/checks/run.ts's git and gitShow helpers (used by reviewGitChange) also strip GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE and GIT_CEILING_DIRECTORIES from their subprocess env — same leak, production code path
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Root cause (found by worker-1-34 while committing TASK-1.34): tools/hooks/hooks.test.ts's git() helper, and tools/checks/run.ts's git()/gitShow() helpers (used by reviewGitChange, which that test also exercises), ran execFileSync('git', args, { cwd: root, ... }) with no env override. Harmless standalone, but a real git commit triggers lefthook's pre-commit hook, which sets GIT_DIR for its whole process tree; that leaks through lefthook -> pnpm test -> vitest into these calls. With GIT_DIR pointing at the real repo and cwd at hooks.test.ts's isolated tmp fixture, the fixture's `git add -A` staged its own tiny tree over the real index (mass "deleted" everything else), its `git config user.name/email` landed in the shared .git/config (common to every worktree), and its nested `git commit` recursively re-triggered the real pre-commit hook, which found the fixture's own throwaway lefthook.yml and failed - the original visible symptom.

Corrupted shared git state 3 times today across worker-1-33 and worker-1-34's real commit attempts (core.bare flipped true, [user] overwritten) before the fix landed. No permanent data loss each time - repaired via `git config core.bare false` + unsetting the bogus [user] section; real files and commit history were never touched, only the shared config file and, once, an uncommitted index (reset clean).

Fix: stripped GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE and GIT_CEILING_DIRECTORIES from the env passed to both sets of git subprocess calls (hooks.test.ts's git(), and run.ts's git()/gitShow()). Verified end-to-end with two real commits that let the actual pre-commit hook run (not --no-verify): both completed clean, .git/config untouched, full test suite green (231/231) including the two tests that previously cascaded-failed from this exact leak.

Committed as 6d793a1 on branch task-1.34-release-bundle-check (not yet merged to main). Commit message has full detail. All 4 acceptance criteria met.
<!-- SECTION:NOTES:END -->
