---
id: TASK-1.40
title: >-
  Confirm visual baselines on the first CI run, and decide where baselines are
  generated
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 04:32'
updated_date: '2026-10-19 12:19'
labels:
  - size-2
  - testing
milestone: m-2
dependencies: []
parent_task_id: TASK-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.37.6. The baselines in packages/ui/visual-baselines/ were generated in the cloud agent sandbox. CI installs Chromium with 'playwright-core install --with-deps chromium' on ubuntu-latest. The browser build matches (playwright-core 1.64.1, headless shell revision 1248), but system fonts, freetype and fontconfig on the runner can differ for any glyph that falls back past the bundled fonts, against a 0.1% tolerance. Nothing pins the runner image, and CI cannot regenerate baselines, so a mismatch would block every pull request until someone regenerates them by hand on another Linux machine.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The bundles job's browser pass has passed on CI against the committed baselines, or the baselines were regenerated in the CI environment and committed with the manifest through visual:update
- [x] #2 The repo documents one environment where baselines are generated (a CI job, a pinned container, or the sandbox) and how to regenerate them there
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-19: criterion 1 is met. CI run 39200078012's bundles job compared all 39 story images against the committed baselines and passed (visual: 39 story views checked, 39 images compared). Criterion 2 (document where baselines are generated) remains.

Criterion 1 met before acceptance: every CI run since 39200540301 has run the browser pass against the committed baselines and passed (latest 39231108029 on 2f40096). Accepted Oct 19, 2026 (Bruk: wrap up the UI portions).

Built by the orchestrator (Oct 19, 2026), commit 75237b0. Chosen environment: a manual workflow, .github/workflows/visual-baselines.yml, on the runner image and Chromium the browser pass uses. It runs visual:update and uploads the baselines as an artifact; it never commits, so a change is still reviewed as images (decision-11). The regenerate commands are at the top of the workflow; CLAUDE.md's Workspace section and visual:update's refusal on macOS point to it. Proof: run 39244676209 on be13e0e wrote 305 files (304 images and the manifest) byte-identical to the committed packages/ui/visual-baselines (diff -rq clean). The first run (39241970034) failed axe at random on mascot bubbles mid-fade; filed and fixed as TASK-1.41.

Review (philosophy:reviewer, Oct 19 2026): closes. AC1 already met. AC2 met: .github/workflows/visual-baselines.yml (workflow_dispatch, contents: read, uploads, never commits) documents the commands at its top; CLAUDE.md and the visual:update refusal in tools/visual.ts point to it. Verified: run 39244676209 succeeded on be13e0e; its artifact downloaded and diff -rq against packages/ui/visual-baselines is clean (305 files each). Full check exited 0 in the review-140 worktree (recorded on TASK-1.41, same tree). Findings: (medium) both ci.yml and this workflow use ubuntu-latest, and run 39244676209 carries GitHub's annotation that ubuntu-latest migrates to Ubuntu 26 from Oct 19 2026; they move together so the workflow stays the reference, but the migration can fail every PR's browser pass until someone regenerates. Pin both to ubuntu-24.04 and move them deliberately; reported to the orchestrator as a size-1 follow-up. (low) the documented gh run list --limit 1 can pick another run if two are dispatched on one branch; noted only.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

```text

> grocs@0.0.0 check /home/claude/grocs/.claude/worktrees/review-140
> node tools/checks/run.ts --mode all

checks passed (13 checks, all mode, 4891 ms)
note: could not read the installed philosophy plugin's board.py (not found on disk, e.g. in CI) — ROUTE_TABLE_MIRROR in tools/agents/roles.ts was not checked against it this run.

> grocs@0.0.0 typecheck /home/claude/grocs/.claude/worktrees/review-140
> tsc --noEmit


> grocs@0.0.0 test /home/claude/grocs/.claude/worktrees/review-140
> vitest run --project unit --project ui --project app --project tools


 RUN  v4.1.12 /home/claude/grocs/.claude/worktrees/review-140

Sourcemap for "/home/claude/grocs/.claude/worktrees/review-140/node_modules/expo-router/build/index.js" points to missing source files
Sourcemap for "/home/claude/grocs/.claude/worktrees/review-140/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files
 ❯ |tools| tools/hooks/hooks.test.ts (21 tests | 1 failed) 48461ms
     × allows the orchestrator writing the board, root config or .claude/ 5660ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |tools| tools/hooks/hooks.test.ts > write guard (decision-3): layer agents and the orchestrator > allows the orchestrator writing the board, root config or .claude/
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ tools/hooks/hooks.test.ts:205:3
    203|   });
    204|
    205|   it('allows the orchestrator writing the board, root config or .claud…
       |   ^
    206|     for (const rel of ['backlog/tasks/task-9.md', '.claude/settings.js…
    207|       const r = hook('pre-edit', { agent_type: undefined, tool_name: '…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 87 passed (88)
      Tests  1 failed | 1155 passed (1156)
   Start at  08:12:08
   Duration  448.72s (transform 14.31s, setup 3.38s, import 168.30s, tests 166.91s, environment 70.17s)

 ELIFECYCLE  Test failed. See above for more details.
```
<!-- SECTION:NOTES:END -->
