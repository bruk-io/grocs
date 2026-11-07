---
id: TASK-74.4.2
title: 'Deny tests: app clients cannot touch the recipe cache'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-1
  - orchestrator
dependencies:
  - TASK-74.4.1
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Decision-15 says clients get no read or write on recipes, recipeSources or recipeFailures. Firestore's default deny already does this. Following the inviteCodes precedent (no match block, deny-only tests at firestore.rules.test.ts:123), no rule is added. An explicit `if false` rule could never get the allow test R49 asks for. The firestore.rules change is a comment only. Covers the reworded TASK-74.4 AC#5.

Split key: orch-cache-rules. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 firestore.rules has no new match block, only a comment naming recipes, recipeSources and recipeFailures as Admin-SDK-only under default deny (decision-15)
- [ ] #2 firestore.rules.test.ts has one describe per collection. Get and set each fail for a signed-in kitchen member and for an unauthenticated client, against a doc seeded with rules disabled
- [ ] #3 pnpm test:emulator passes, and pnpm check reports no weakening
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Read firebase/firestore.rules and the inviteCodes describe at firebase/firestore.rules.test.ts:123.
2. Inside `match /databases/{database}/documents`, add the comment `// recipes, recipeSources, recipeFailures: the recipe-import cache, written only by the Admin SDK (decision-15). No rule here: default deny keeps app clients out; deny tests prove it.`
3. Copy the inviteCodes describe three times, as 'recipes/{key} (decision-15)', 'recipeSources/{key} (decision-15)' and 'recipeFailures/{key} (decision-15)'. Seed recipes/k1, recipeSources/k1 and recipeFailures/k1 with testEnv.withSecurityRulesDisabled, and seed a kitchen with alex as a member.
4. In each describe, assertFails getDoc and setDoc as authenticatedContext('alex') and as unauthenticatedContext().
5. Run `pnpm test:emulator` and `pnpm check` from the repo root, confirm the test count only grew, then commit to main locally (do not push).

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- firebase/firestore.rules
- firebase/firestore.rules.test.ts
<!-- SECTION:PLAN:END -->
