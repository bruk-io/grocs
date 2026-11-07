---
id: TASK-74.4.1
title: Reword children's ACs and annotate decision-16 to match what is built
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-1
  - orchestrator
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
- [ ] #4 decision-16 has an appended note (via the backlog CLI) recording: R20 wins over the 'importing again restores' consequence, so a re-import of a deleted recipe is refused with 'recipe-deleted'; and R12's prompt is not built yet
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
