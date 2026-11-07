---
id: TASK-74.5.1
title: Retire the stale RecipeImport reference board
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:38'
labels:
  - size-1
  - orchestrator
dependencies: []
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
design/reference/RecipeImport.dc.html shows ingredient ticking, servings scaling and pantry staples, which accepted decision-16 supersedes. CLAUDE.md and spec R66 say reference boards are deleted as each is built. This slice builds the recipe view, so the board goes now. A builder will then not copy a design that the accepted decisions overrule, and nothing has to be named around reference-built.

Split key: orch-retire-recipe-board. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 design/reference/RecipeImport.dc.html and any shots referenced only by it are deleted
- [ ] #2 TASK-74.5 notes record the deletion as superseded by decision-16 under R66, and pnpm check (reference-built) passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Run `grep -rn RecipeImport design/ tools/ packages/ui/` to find shots or references used only by this board.
2. `git rm` the board and those shots.
3. Run `pnpm check`. If reference-built or any other check fails, stop and report.
4. Add a TASK-74.5 note: 'Deleted design/reference/RecipeImport.dc.html: superseded by decision-16 (no ticking, no scaling), R66.' Then commit and push main.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- design/reference/RecipeImport.dc.html
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Evidence (worktree wf_ff6cb6f7-7f6-7):
- Step 1: grep -rn RecipeImport design/ tools/ packages/ui/ found only design/reference/canvas.json (boards entry and order list) besides the board itself; shots/RecipeImport.png is the board's shot (README: delete a board's shot with the board).
- Step 2: removed design/reference/RecipeImport.dc.html and design/reference/shots/RecipeImport.png, and the board's boards/order entries in design/reference/canvas.json (the reference-built rule's fix text names all three).
- After: grep -rn RecipeImport design/ tools/ packages/ui/ gives no matches (exit 1).
- Step 3: pnpm check gives 'checks passed (16 checks, all mode, 658 ms)', exit 0; reference-built is registered in tools/checks/registry.ts.
- Step 4: TASK-74.5 note added. Committed in the worktree only, not pushed: the workflow forbids pushing and switching branches in the main checkout, so the orchestrator lands it on main.
- Worktree setup: its branch was cut from origin/main (TASK-67 commits) while local main had the TASK-74 board commits, so a fast-forward was impossible; local main was merged in (merge commit) to get this task.
<!-- SECTION:NOTES:END -->
