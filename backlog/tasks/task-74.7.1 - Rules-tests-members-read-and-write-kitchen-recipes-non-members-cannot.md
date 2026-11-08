---
id: TASK-74.7.1
title: 'Rules tests: members read and write kitchen recipes, non-members cannot'
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:46'
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
- [x] #1 firestore.rules.test.ts has a kitchens/{k}/recipes describe: member setDoc and getDoc succeed, while non-member carl's getDoc and setDoc fail
- [x] #2 firestore.rules is unchanged, and pnpm test:emulator passes
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Worker report (TASK-74.7.1).
- Worktree was branched from origin/main (has TASK-67) while local main had the TASK-74 board split; ff-only failed, so I merged main (merge commit) before starting.
- Added describe('kitchens/{k}/recipes (decision-16, R49)') to firebase/firestore.rules.test.ts, copied from the meals describe: path kitchens/k1/recipes/r1, data a minimal RecipeDoc-shaped object per the plan. Member alex setDoc+getDoc assertSucceeds; non-member carl getDoc+setDoc assertFails.
- AC#1 evidence (vitest --reporter verbose under emulators:exec):
  ✓ firebase/firestore.rules.test.ts > kitchens/{k}/recipes (decision-16, R49) > a member can read and write a recipe in their kitchen
  ✓ firebase/firestore.rules.test.ts > kitchens/{k}/recipes (decision-16, R49) > a non-member cannot read or write a recipe in a kitchen they do not belong to
- AC#2 evidence: diff against main for firebase/firestore.rules is empty. pnpm test:emulator: Test Files 8 passed (8), Tests 110 passed (110), Script exited successfully (code 0).

Reviewer verdict: closed. AC#1: firebase/firestore.rules.test.ts:123-151 adds the kitchens/{k}/recipes describe (alex setDoc+getDoc assertSucceeds; carl getDoc+setDoc assertFails), commit 10954a5. AC#2: firestore.rules last changed in 38ff51c (TASK-14), untouched here; orchestrator's run on merged main e4de89f: pnpm test:emulator 8 files/110 tests passed, pnpm check/typecheck/test clean. Full-tier record-check not run, because it would start emulators that collide with parallel reviewers; the orchestrator's logs are the evidence. Findings: minor only. Carl's getDoc runs against a doc that the member test in a separate case may not have written (each case reseeds), so the deny shows membership gating, not cross-member denial of existing data. That matches the meals pattern, so no draft.
<!-- SECTION:NOTES:END -->
