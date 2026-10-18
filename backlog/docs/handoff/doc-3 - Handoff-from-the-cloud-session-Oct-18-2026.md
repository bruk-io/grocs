---
id: doc-3
title: 'Handoff: from the cloud session (Oct 18, 2026)'
type: guide
created_date: '2026-10-18 19:03'
updated_date: '2026-10-18 19:03'
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

1. Accept or change each proposed decision above. Accepting one: `backlog decision edit <id> -s accepted`, then the reviewer closes its design task.
2. Push notifications (decision-4): may the body name the item ("Bruk added lemons")? It passes through FCM and APNs and shows on the lock screen. The alternative is "Bruk added something", a one-line change in `planPartnerPush`.
3. Choose between the design options on the canvas's "Design options" page: the combine prompt (D1, TASK-1.6) and the Fold's inner screen (D2, TASK-1.7). The designer's picks: D1 option A (the tray), borrowing option C's slide-under motion; D2 option B (plan and list side by side). The inner screen measured 791 x 820 dp (outer 412 x 901 dp); one source says 755 x 783.
4. Accept, change or drop the drafts: DRAFT-1 to DRAFT-15 are the slices and the canvas move, DRAFT-16 to DRAFT-18 are follow-ups from review and CI. Their dependencies get set on promotion, because a draft's id changes then.
5. Outside the repo: the Apple Developer account (the release pipeline waits on it); a Firebase project with an Android and an iOS app and Google sign-in turned on (the kitchen slice and release pipeline wait on it; the emulators don't).

## Next, in order

1. The device spikes, now possible on Bruk's machine: TASK-1.16 (Firestore offline across restarts with the native SDK) feeds D4; TASK-1.15 (Google sign-in in an Expo dev build) feeds the kitchen slice.
2. Accept D3, D4, D7, D8 and D9, and close their design tasks.
3. DRAFT-16 (declare `.claude/checks.json`, so `record-check` works for reviewers), then DRAFT-1 (generate the layer agents and the launch hook from decision-3, using the skeleton's files as the examples).
4. DRAFT-2, the rest of the canvas move: tokens.json as the source of grocs.css, SVG conversion. Step 1 (copying the canvas into `design/canvas/`) is done.
5. The First real shop slices, through the layer workflow in decision-3.

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

## The design canvas

- The canvas is a Design artifact on claude.ai, private to Bruk: https://claude.ai/artifact/MYK7qqUoy4cUmQdDirgdtq (version 18, with the Design options page).
- Its source is now in `design/canvas/`: the boards (`*.dc.html`), `canvas.json`, `grocs.css`, `AGENT-BRIEF.md` (the board format and the rules that fail silently) and `source/kitchen-scene.svg`, and `tools/` (the board checker, the generators and token pass used to build the boards, and the render helper). `design/canvas/README.md` has the commands. The spec's step 1 put the checker in `tools/checks/`; it lives in `design/canvas/tools/` instead, beside the files it checks, because the repo's checks runner is TypeScript. The design reviews are doc doc-2.
- Check the boards: `python3 design/canvas/tools/dc_check.py design/canvas`.
- Publishing goes through the Artifact tool, which a claude.ai session has. If Claude Code on the desktop doesn't offer it, publish from a claude.ai chat with this repo attached. The artifact's published paths are `project/<file>`. Before publishing, list the artifact's files and compare them with the repo: edits made in the canvas editor save a new version there, and those must be committed to `design/canvas/` before anything else is published.
- Two low findings left from the canvas review: Welcome's sign-in sheet has an empty band above the Google button, and icon stroke widths weren't confirmed as one width.
