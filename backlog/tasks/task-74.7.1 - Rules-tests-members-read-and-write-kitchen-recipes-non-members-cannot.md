---
id: TASK-74.7.1
title: 'Rules tests: members read and write kitchen recipes, non-members cannot'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-1
  - orchestrator
dependencies: []
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Decision-16 needs no rule change, because the generic kitchens/{k}/{collection}/{document=**} rule covers recipes. It does need allow and deny tests (R49). firebase/ belongs to no layer. Covers TASK-74.7 AC#4.

Split key: orch-kitchen-recipe-rules. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 firestore.rules.test.ts has a kitchens/{k}/recipes describe: member setDoc and getDoc succeed, while non-member carl's getDoc and setDoc fail
- [ ] #2 firestore.rules is unchanged, and pnpm test:emulator passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Find the meals allow/deny describe in firebase/firestore.rules.test.ts.
2. Copy it into a new describe('kitchens/{k}/recipes (decision-16, R49)'). Change the path to kitchens/<k>/recipes/r1 and the data to a minimal RecipeDoc-shaped object (schemaVersion 1, id 'r1', addedBy 'alex', createdAt 1, sourceUrl 'https://recipe.invalid/a', title 'T', yield null, steps ['s'], ingredients [{line:'l',quantity:null,unit:null,item:null}], image null, deleted null).
3. Keep the assertions: member alex setDoc and getDoc assertSucceeds; non-member carl getDoc and setDoc assertFails.
4. Run `pnpm test:emulator` from the repo root, then commit to main locally (do not push).

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- firebase/firestore.rules.test.ts
<!-- SECTION:PLAN:END -->
