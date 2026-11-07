---
id: TASK-74.4.9
title: normaliseRecipeUrl is not idempotent for a path of '//'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 03:20'
updated_date: '2026-11-07 03:25'
labels:
  - size-1
  - layer-providers
dependencies: []
modified_files:
  - packages/providers-server/src/recipe/pure/normalise-url.ts
  - packages/providers-server/src/recipe/pure/normalise-url.test.ts
parent_task_id: TASK-74.4
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract section 9 step 4 (amended 2026-11-07) strips every trailing slash. The merged normalise-url.ts strips one, so https://x.com// normalises to https://x.com/ and then to https://x.com, breaking the contract's idempotence rule. Found by reviewer-providers on TASK-74.4.3.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 normaliseRecipeUrl strips every trailing slash from the path: https://x.com// and https://x.com/ give https://x.com, and https://x.com/a// gives https://x.com/a
- [ ] #2 normalise-url.test.ts has those cases in its golden table and an idempotence test over the whole table, and the providers unit tests and typecheck pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In packages/providers-server/src/recipe/pure/normalise-url.ts, change line 40 (the `const path = ...` line) to strip every trailing slash: `const path = url.pathname.replace(/\/+$/, '');` (this also turns '/' into '').
2. In the same file, change the doc comment on line 25 from 'strips one trailing slash' to 'strips every trailing slash'.
3. In packages/providers-server/src/recipe/pure/normalise-url.test.ts, add three rows to the `table` array that starts on line 9, after the 'root path collapses to no path' row:
   ['double slash path collapses to no path', 'https://x.com//', 'https://x.com'],
   ['trailing slashes are all stripped', 'https://x.com/a//', 'https://x.com/a'],
   ['one trailing slash is stripped', 'https://x.com/a/', 'https://x.com/a'],
4. Check that the existing test 'is idempotent: normalising the output again changes nothing' (line 40) runs over every row of `table`; if it does not, make it loop over `table` and assert normalise(normalise(input)) === normalise(input).
5. Run `mise exec -- pnpm exec vitest run --project unit packages/providers-server` and `mise exec -- pnpm -s typecheck`; both must pass. Paste the key output into the task notes with --append-notes.
6. Commit with a message naming TASK-74.4.9.

### Risks
None beyond the contract: section 9 step 4 (amended 2026-11-07) says every trailing slash is stripped.

### Proof
The three new golden rows and the idempotence test pass.
<!-- SECTION:PLAN:END -->
