---
id: doc-3
title: 'Handoff: from the cloud session (Oct 18, 2026)'
type: guide
created_date: '2026-10-18 19:03'
updated_date: '2026-10-18 19:18'
---
Handoff from the claude.ai cloud session of Oct 18, 2026 to Claude Code on Bruk's machine. Everything the session knew that wasn't already in the repo is here, in `CLAUDE.md`, or on the board. Read this, then `backlog task list --plain` and the board.

## Where things stand

- Intent TASK-1 and spec doc-1 are approved. Milestones m-0 to m-4: Skeleton, Ready to build, First real shop, Feels like Grocs, A month in Grocs.
- Done: TASK-1.3 scaffold and guardrails, TASK-1.4 walking skeleton, TASK-1.17 canvas brought in line with the spec. Each was closed by `philosophy:reviewer`; the evidence is in the tasks' notes.
- Accepted decisions: decision-1 Firebase, decision-2 Storybook, decision-3 agent workflow (with the Haiku small builders).
- Proposed decisions, waiting on Bruk: 
  - decision-4, push (D5, TASK-1.10): an activity trigger sends through FCM to the partner's opted-in devices.
  - decision-5, animation (D6, TASK-1.11): Reanimated CSS animations on react-native-svg; Rive is the next step if the mascots outgrow keyframes.
  - decision-6, workspace tooling (D3, TASK-1.8): pnpm 10 hoisted, no task runner, our own import checker with two gaps closed, Node 24.
  - decision-7, sync (D4, TASK-1.9): an append-only change log folded in core, ordered by a hybrid logical clock. It fixes the offline gap. Its strongest counter-argument: no document holds an item's current state. Spike TASK-1.16 must confirm the eight device behaviours it lists before it is accepted.
  - decision-8, logging (D7, TASK-1.12): keep the skeleton's wiring; add the R33 handlers, listener errors, withheld SDK messages, schema-declared personal fields and a buffer that survives a crash.
  - decision-9, tests (D8, TASK-1.13): vitest (with `extends: true`, because vitest 4 projects ignore the root `allowOnly`), Maestro, `.claude/checks.json` tiers, and the new checks.
  - decision-10, Storybook (D9, TASK-1.14): our token script, SVGR with checked-in output, two release guards, and hosting for Shazya on a Cloudflare Worker. It assumes Bruk's Workers sit behind Google sign-in; confirm that.
- CI on GitHub passes all three jobs: checks, types and unit tests; emulator contracts and two-client sync; Android and iOS bundles plus Storybook.

## Waiting on Bruk

1. Accept or change each proposed decision above. Accepting one: `backlog decision edit <id> -s accepted`, then the reviewer closes its design task. Already answered: push notifications may name the item (recorded in decision-4 and doc-1).
2. Choose the D1 and D2 options (TASK-1.6, TASK-1.7). They are on the "Design options" page of the frozen design artifact (link below) and as boards in `design/reference/`. The designer's picks: D1 option A (the tray), borrowing option C's slide-under motion; D2 option B (plan and list side by side). The inner screen measured 791 x 820 dp (outer 412 x 901 dp); one source says 755 x 783.
3. Outside the repo: the Apple Developer account (the release pipeline, TASK-1.25, waits on it); a Firebase project with an Android and an iOS app and Google sign-in turned on (the kitchen slice and release pipeline wait on it; the emulators don't).

Already done by Bruk on Oct 18: the slices and follow-ups were accepted (TASK-1.18 to TASK-1.35, dependencies set), and the canvas was retired in favour of Storybook.

## Next, in order

1. The device spikes, now possible on Bruk's machine: TASK-1.16 (Firestore offline across restarts with the native SDK) feeds D4; TASK-1.15 (Google sign-in in an Expo dev build) feeds the kitchen slice.
2. Accept D3, D4, D7, D8 and D9, and close their design tasks. Each accepted decision that changes the code (D3's tooling changes, D4's change log, D7's gaps, D8's new checks, D9's setup) then needs its own build task; none exists yet.
3. TASK-1.33 (declare `.claude/checks.json`, so `record-check` works for reviewers), then TASK-1.18 (generate the layer agents and the launch hook from decision-3, using the skeleton's files as the examples).
4. TASK-1.19: extract the tokens and art from the retired canvas, with the design-system checks.
5. The First real shop slices, starting at TASK-1.20, through the layer workflow in decision-3. `backlog task list --plain` shows what each waits on.

## Lessons from this session

These are operational, not design. The ones every session needs are also in `CLAUDE.md`.

- Agent worktrees live in `.claude/worktrees/` (gitignored). The orchestrator never `cd`s into one: the stop hook checks the current folder's git state, and a worker's half-done edits there are not the orchestrator's to commit.
- Chaining `cd … &&` in front of a command triggers permission prompts. Run `backlog` and `pnpm` from the repo root.
- Fetching a URL the model recalled or built itself asks the person for approval. Search first and only open URLs a search returned. Put this in every brief until the layer template carries it.
- The first canvas agent stopped without reporting, and its work was found only by checking files. Check on long-running agents rather than waiting.
- Briefs must ask workers to write a plan with `philosophy:plan-change` first; the skeleton's tasks went without one. The layer template makes it the first step.
- `philosophy:reviewer` can file a follow-up draft but can't commit it, because only `close-task` commits. The orchestrator reads and files it on main. The fix belongs in the philosophy plugin.
- Metro bundles every export a shipped file reaches. Fakes and contract suites live behind `@grocs/ports/testing` and `@grocs/application/testing`, which the import-layer check limits to tests, and `pnpm check:release` fails a release bundle carrying dev code.
- The Firebase providers take Firebase's modular API by injection, so the web SDK stands in for `@react-native-firebase` in Node tests. The native modules themselves are untested until a device run.
- R16 (offline) is unmet: the skeleton's transaction-based merge fails offline. D4's proposal addresses it.

## The retired canvas

- Bruk retired the canvas on Oct 18, 2026. Storybook is the only record of the design system (doc-1 R66, decision-2).
- The boards are in `design/reference/`, read-only, as the visual reference for building. Delete a board in the same change that builds what it shows. `design/reference/README.md` explains the folder.
- The Welcome kitchen scene is in `design/svg/scenes/kitchen.svg`. The mascots and icons are still to be extracted from the boards into `design/svg/` (TASK-1.19).
- The design artifact on claude.ai is frozen at version 18 and is not published again: https://claude.ai/artifact/MYK7qqUoy4cUmQdDirgdtq. It is the only place the boards render, including the D1 and D2 options. Bruk can delete it once those are chosen.
- The canvas tools (board checker, generators, render helper) were removed with the retirement; they are in git history at commit b0dadf0 under `design/canvas/tools/`.
- The design reviews are doc-2.
