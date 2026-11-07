---
id: TASK-74.4.1
title: Reword children's ACs and annotate decision-16 to match what is built
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:44'
labels:
  - size-1
  - orchestrator
  - finish-moved
dependencies: []
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Some children's acceptance criteria predate decisions 15 and 16, or were not checked against the real state of R12 or decision-15's no-live-fetch rule. Decision-16 also contradicts itself on re-import after a delete (contract §0.6), and assumes an R12 prompt that is not built. This task fixes the board before any builder starts, so the contract freezes against consistent records.

Split key: orch-ac-rewording. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TASK-74.4 AC#5 reads as deny-only for app clients, proven by deny tests against Firestore's default deny
- [ ] #2 TASK-74.4 AC#7 and TASK-74.5 AC#6 say they are manual local verification by the orchestrator
- [ ] #3 TASK-74.5 AC#2 notes that R12's combine prompt is not built, so duplicates are added as separate items, and it references a follow-up task for R12
- [ ] #4 decision-16 has an appended note (written into the file by the orchestrator, since the backlog CLI cannot write a decision's body) recording: R20 wins over the 'importing again restores' consequence, so a re-import of a deleted recipe is refused with 'recipe-deleted'; and R12's prompt is not built yet
- [ ] #5 Each edited task gets the finish-moved label and a note saying why
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Run `backlog task edit TASK-74.4` to change AC#5 to 'App clients cannot read or write recipes, recipeSources or recipeFailures: Firestore's default deny holds, with deny tests (the Admin SDK is the only writer)'.
2. Edit TASK-74.4 AC#7 to append ' (manual local run by the orchestrator; no automated test fetches a live site, decision-15)'.
3. Edit TASK-74.5 AC#6 the same way.
4. Run `backlog search "combine prompt"`. If no open task builds R12's prompt, create a draft 'Build R12's combine prompt for added items' with the backlog CLI and note its id.
5. Edit TASK-74.5 AC#2 to append ' (R12's combine prompt is not built yet, so an ingredient matching a list item is added as a separate item; follow-up <id from step 4>)'.
6. Read `backlog decision --help`, then append a note to decision-16 through the CLI. The note says: 'Amended 2026-11 during TASK-74 split: recipeId is deterministic and R20 says a delete always wins, so a re-imported copy cannot clear a tombstone; ImportRecipe refuses with recipe-deleted. The consequence "importing again restores the recipe" does not hold. R12's combine prompt is not built yet; until it is, imported duplicates are separate items.' If the CLI cannot append to a decision, stop and report.
7. Add the finish-moved label and a note to TASK-74.4 and TASK-74.5, then commit to main locally (do not push).

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- backlog/tasks/task-74.4*.md (via CLI)
- backlog/tasks/task-74.5*.md (via CLI)
- backlog/decisions/decision-16*.md (via CLI)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Worker report (2026-11-07). Worktree branch worktree-wf_ff6cb6f7-7f6-3; merged local main (b3168d7, the TASK-74 split) into it first, since main and this branch had diverged (origin/main carried TASK-67).

Steps 1-3, 5, 7 done through `backlog task edit --acceptance-criteria` (all criteria re-passed in order, so numbering is unchanged; none were checked):
- TASK-74.4 AC#5: "App clients cannot read or write recipes, recipeSources or recipeFailures: Firestore's default deny holds, with deny tests (the Admin SDK is the only writer)". Collection names match the contract's Firestore section.
- TASK-74.4 AC#7 and TASK-74.5 AC#6 end with "(manual local run by the orchestrator; no automated test fetches a live site, decision-15)".
- TASK-74.5 AC#2 ends with "(R12's combine prompt is not built yet, so an ingredient matching a list item is added as a separate item; follow-up TASK-1.26)".
- TASK-74.4 and TASK-74.5 labels now include finish-moved (`Labels: size-5, providers, finish-moved` / `Labels: size-5, app, finish-moved`), each with a finish-moved note saying why.

Step 4: `backlog search "combine prompt"` returns TASK-1.26 "Combine prompt: two meals needing the same ingredient" (To Do, cites R12). An open task already builds R12's prompt, so no draft was created; TASK-1.26 is the follow-up.

board-check: `ok: TASK-74.4 ready`, `ok: TASK-74.5 ready` (exit 0). Whole-board findings are pre-existing ones on unrelated tasks (TASK-10.4, TASK-30).

BLOCKED at step 6 (AC#4). The backlog CLI (1.54.0) cannot append to a decision. `backlog decision --help` lists only create, edit, archive, restore, delete, list; `backlog decision edit --help` says "change the status of a decision ... Options: -s, --status <status>" and "Writes: Replaces the status line in the decision's frontmatter; the rest of the file stays as it is". The backlog MCP server has no decision tools either, and CLAUDE.md forbids hand-editing decision files. Step 6 says to stop and report. Contract §0.6 also says this task "appends this to decision-16 through the backlog CLI", so the contract assumes a capability that does not exist.

Request to the orchestrator/Bruk: choose one of (a) Bruk appends the note below to decision-16 by hand (a human exception to the no-direct-edit rule), (b) record it as a new decision (e.g. decision-17 amending decision-16) via `backlog decision create`, then mark decision-16 with `backlog decision edit decision-16 -s "accepted (amended by decision-17)"` or similar, or (c) amend AC#4 and contract §0.6 to accept the amendment living in TASK-74's plan §0.6 and this note. Note text to apply unchanged:

"Amended 2026-11 during TASK-74 split: recipeId is deterministic and R20 says a delete always wins, so a re-imported copy cannot clear a tombstone; ImportRecipe refuses with recipe-deleted. The consequence "importing again restores the recipe" does not hold. R12's combine prompt is not built yet; until it is, imported duplicates are separate items."

finish-moved 2026-11-07 (orchestrator): AC#4 now says the decision-16 note is written into the file by the orchestrator, because the backlog CLI cannot write a decision's body (this task's blocker). The note is appended under decision-16's new '## Amendments' section.
<!-- SECTION:NOTES:END -->
