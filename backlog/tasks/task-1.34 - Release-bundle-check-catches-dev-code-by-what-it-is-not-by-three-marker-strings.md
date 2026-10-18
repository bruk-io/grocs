---
id: TASK-1.34
title: >-
  Release-bundle check catches dev code by what it is, not by three marker
  strings
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:39'
updated_date: '2026-10-18 21:48'
labels:
  - size-2
  - architecture
milestone: m-1
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.4 (low). check:release looks for three marker strings, so dev-only code under another name would reach release unnoticed (R53, R64).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Any module under a development-only path or testing entry that reaches a release bundle fails the check, whatever its contents
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
What was wrong: check:release grepped each release bundle's text for 3 literal marker strings (grocs-dev-tools-marker, signInWithTestAccount, grocs-storybook-marker). Dev-only code under a renamed export, or a new file under a dev-only path, would reach a release build with no detection. signInWithTestAccount is also a real TestSignIn port method name used throughout fakes/contract suites (packages/ports, packages/application/src/testing), so the check was fragile in both directions.

What changed: tools/release-bundle.ts now exports each bundle with `expo export --source-maps external` and reads the bundle's own Metro sourcemap (`sections[].map.sources`, falling back to a flat `sources` array) to get the real module paths Metro included. A release bundle fails if any source path falls under apps/mobile/src/dev/, apps/mobile/.rnstorybook/, a package's src/testing/ subpath, or is a test/story file by extension (DEV_ONLY_PATH table in the file) - matched structurally by path, not by content. Confirmed via a content-hash comparison that --source-maps external does not change what Metro bundles (same hash, only an appended sourceMappingURL/debugId comment). The "blind" self-check now requires the development bundle to specifically reach apps/mobile/src/dev/ (DEV_TOOLS_PATH, not just any pattern in the table) and that every bundle's sourcemap has real sources, so the check can't silently stop seeing anything (e.g. after a Metro upgrade changes the sourcemap shape).

tools/release-bundle.test.ts rewritten: 9 unit tests (pure logic, no I/O) covering path detection including a file renamed/relocated under a dev-only path (the exact case the old check missed), the message format, and both sourcemap shapes.

Real verification (not just unit tests): ran `pnpm check:release` for real (full Metro export, both platforms, dev+release) - passed clean on the unmodified tree. Then temporarily made apps/mobile/src/composition/compose-app.ts import apps/mobile/src/dev/index.ts (a release-reachable file reaching dev code) and reran `pnpm check:release`: it correctly failed for both android and ios, naming /apps/mobile/src/dev/index.ts and /apps/mobile/src/dev/test-sign-in.ts under rule release-bundle/dev-code-in-release. Reverted that file (git diff on it is empty) and reran `pnpm check:release` clean again.

pnpm check, pnpm typecheck, pnpm test (231 tests) all pass.

Mid-task finding, filed as TASK-1.36 and fixed first: tools/hooks/hooks.test.ts leaked a real git hook's GIT_DIR into its own isolated git fixture's subprocess calls, corrupting the repo's shared index and .git/config user identity on every real git commit (reproduced twice before the fix). That fix (and its extension to tools/checks/run.ts's git/gitShow helpers, also affected) landed first, in a separate commit, with the real pre-commit hook passing end-to-end.

Commits, merged into main: 6d793a1/fa62abb (TASK-1.36 fix), bb5ecf4 (this task's release-bundle rewrite).
<!-- SECTION:NOTES:END -->
