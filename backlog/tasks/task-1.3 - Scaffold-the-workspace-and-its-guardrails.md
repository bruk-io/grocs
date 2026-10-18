---
id: TASK-1.3
title: Scaffold the workspace and its guardrails
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 17:38'
updated_date: '2026-10-18 18:37'
labels:
  - size-3
  - architecture
milestone: m-0
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Sets up the repository layout in doc-1 and the checks that guard it, before any feature code exists, so the checks are never retrofitted. Cites R26, R27, R37, R52, R55, R56, R57, R58. Tool choices made here (package manager, test runners, import checker, pre-commit, CI) are provisional and feed design questions D3 and D8; record each choice and why in the notes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The workspace has the folders from the spec's repository layout that the walking skeleton needs, each layer a package; unused ones are absent rather than empty
- [x] #2 An import-layer check enforces R26 and R27 (no cycles, providers never import each other, ui imports tokens only) and every failure names the rule and why it exists
- [x] #3 A guard blocks weakening edits (focusing or skipping a test, deleting a test, loosening a check's config) with the reason (R57)
- [x] #4 Direct console use outside the console provider fails a check (R37)
- [x] #5 The same check scripts run from agent hooks (after an edit, before an edit, before stop), from pre-commit and from a CI workflow; after-edit hooks finish within 5 seconds (R55, R56)
- [x] #6 One command starts the Firebase emulators (Firestore, Auth) with seed data, and nothing in the repo points at a production project (R52)
- [x] #7 .claude/rules/ holds only the judgement-only rules from the conversation that apply so far, one rule per file, each with its reason (R58)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. pnpm workspace, one package per layer. 2. tools/checks scripts behind one runner (all, files, staged, ci). 3. tools/hooks (pre-edit, post-edit, stop). 4. lefthook and GitHub Actions call the same runner. 5. Firebase emulators with seed, one command. 6. Judgement-only rules. 7. Fixture tests for every check, asserting message content.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
BUILT (commit cf5e775 on branch worktree-agent-a8e68e0f38ff55593; later commits extend the checks). pnpm workspace with one package per layer (packages/core, ports, application, providers-device, providers-firebase, ui; apps/mobile). tools/checks: one runner (modes all, files, staged, ci) and 8 checks (import-layers, console-use, firebase-isolation, weakening, core-purity, design-tokens, story-coverage, test-presence, port-contracts). Every finding prints: FAIL rule (reqs): summary, location, Why, Fix. tools/hooks: pre-edit, post-edit, stop. lefthook.yml and .github/workflows/ci.yml call the same runner. firebase.json, firestore.rules, seed, tools/emulators.ts. .claude/rules: 3 judgement-only rules.

Correction: the registry runs 8 checks in all mode; the weakening guard (R57) is a diff review run by the pre-edit hook, staged mode and CI --mode ci, not a registry check.

AC EVIDENCE. #1 packages/{core,ports,application,providers-device,providers-firebase,ui}, apps/mobile, firebase/, tools/; no empty folders (no server, functions, or providers-server yet). #2 tools/checks/import-layers.ts, tests in import-layers.test.ts assert rule id, Why and Fix text; covers layer table, providers isolated, ui tokens only, barrel-only imports, cycles, design levels, third-party allow-lists. #3 tools/checks/weakening.ts reviewChange: denies focus, skip, test deletion; asks on loosened protected config or shrunk check code; hooks.test.ts runs pre-edit as a subprocess. #4 console-use.ts, only providers-device/src/console-logger may use console. #5 hooks.test.ts asserts post-edit under 5000 ms (measured in the test); same node tools/checks/run.ts called by .claude/settings.json, lefthook.yml and ci.yml. #6 pnpm emulators (tools/emulators.ts) starts Firestore and Auth on project demo-grocs with seed; firebase-isolation check fails on any command or config that names a non-demo project. #7 .claude/rules: fix-the-code-not-the-check, ports-describe-intent, providers-hold-no-rules, each with its reason. Run: pnpm check (8 checks pass), pnpm test (226 pass).

TOOL CHOICES (provisional, proposed for D3, D8, D9). Package manager: pnpm 10 with node-linker=hoisted; rejected npm workspaces (slower, no catalog of strict hoisting control) and yarn; hoisted is needed because Metro does not follow pnpm symlinked layout. Test runner: vitest 4 with projects (unit, ui, app, tools, emulator); rejected jest (needs transform config for TS and ESM, slower). Property tests: fast-check. Import-layer checker: custom script using the TypeScript parser; rejected dependency-cruiser and eslint-plugin-boundaries because neither could print the rule, the reason and the fix in our format, nor express the design-level and testing-entry rules without plugins. Checks and hooks run as TypeScript directly with Node 22 type stripping (no build step); rejected tsx/ts-node (extra dependency, slower start). Pre-commit runner: lefthook; rejected husky (shell scripts per hook, no parallel or staged-file globbing). CI: GitHub Actions calling the same scripts. Emulators: firebase-tools emulators:exec with Java, no Docker (R52).

NOT VERIFIED. GitHub Actions workflow has not run (no push allowed). lefthook run was exercised with --no-auto-install only; a real git commit through the installed hook was not. Claude Code hook wiring in .claude/settings.json is tested by running the scripts with the hook JSON, not inside a live Claude Code session. Emulator seed checked only through the emulator tests. Findings for D8: hook latency stays low because checks read only changed files in files mode; weakening review needs the before text, which pre-edit gets from disk and CI gets from git.

REVIEW (reviewer, 2026-10-18): closed. Re-ran pnpm check (8 checks pass), typecheck, test (226 pass), test:emulator (22 pass). Probed guards with in-memory violations: core importing providers-firebase gives import-layers/allowed-imports and no-cycles; ui importing application gives ui-tokens-only; providers-device importing providers-firebase gives providers-isolated; console.log in core gives console-use/direct-console; pre-edit hook denies it.only, it.skip and rm of a test (exit 2) and asks on loosening tsconfig strict. Each message names rule, reqs, Why and Fix. Emulators use demo-grocs only, seeded. Findings: record-check cannot run, .claude/checks.json missing (DRAFT-1); CI has not run on GitHub; the 5 s post-edit budget is proven only by hooks.test.ts timing.
<!-- SECTION:NOTES:END -->
