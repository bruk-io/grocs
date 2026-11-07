---
id: TASK-74.3.7
title: decodeEntities resolves names like '&constructor;' through Object's prototype
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 03:45'
updated_date: '2026-11-07 04:20'
labels:
  - size-1
  - layer-providers
dependencies: []
modified_files:
  - packages/providers-server/src/recipe/pure/recipe-schema.ts
  - packages/providers-server/src/recipe/pure/recipe-schema.test.ts
parent_task_id: TASK-74.3
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
recipe-schema.ts looks named entities up with NAMED_ENTITIES[body.toLowerCase()], a plain-object index, so an inherited key such as 'constructor' or 'toString' returns a function and its source text ends up in a recipe field. Found by reviewer-providers on TASK-74.3.6.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 decodeEntities only resolves names that are the table's own keys: '&constructor;', '&toString;' and '&__proto__;' come through unchanged
- [x] #2 recipe-schema.test.ts has a case for those three names, and the providers unit tests and typecheck pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In packages/providers-server/src/recipe/pure/recipe-schema.ts, change line 40 from `return NAMED_ENTITIES[body.toLowerCase()] ?? match;` to:
   `const key = body.toLowerCase();`
   `return Object.hasOwn(NAMED_ENTITIES, key) ? NAMED_ENTITIES[key]! : match;`
2. In packages/providers-server/src/recipe/pure/recipe-schema.test.ts, directly after the test 'decodes HTML entities in the title, ingredient lines and steps' (ends near line 138), add:
   it('leaves names that are not in the entity table unchanged, including inherited ones', () => {
     const html = `<script type="application/ld+json">{"@type": "Recipe", "name": "A &constructor; B &toString; C &__proto__;", "recipeIngredient": ["1 egg"], "recipeInstructions": ["Cook."]}</script>`;
     const result = parseRecipePage(html);
     expect(result.ok).toBe(true);
     if (!result.ok) throw new Error('expected ok');
     expect(result.value.content.title).toBe('A &constructor; B &toString; C &__proto__;');
   });
3. Run `mise exec -- pnpm exec vitest run --project unit packages/providers-server` and `mise exec -- pnpm -s typecheck`; both must pass. Paste the key output into the task notes with --append-notes.
4. Commit with a message naming TASK-74.3.7.

### Risks
If the regex in decodeEntities does not match '__proto__' (underscores), the test still holds because the text is left unchanged either way.

### Proof
The new test passes and the existing entity tests still pass.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Notes

### Changes Made
1. Fixed line 40 in packages/providers-server/src/recipe/pure/recipe-schema.ts:
   - Changed from: `return NAMED_ENTITIES[body.toLowerCase()] ?? match;`
   - Changed to: `const key = body.toLowerCase(); return Object.hasOwn(NAMED_ENTITIES, key) ? NAMED_ENTITIES[key]! : match;`
   - This ensures inherited properties like 'constructor', 'toString', and '__proto__' are not resolved and are left unchanged

2. Added test case in packages/providers-server/src/recipe/pure/recipe-schema.test.ts:
   - Test verifies that inherited property names are left unchanged in the parsed recipe
   - Specifically tests: '&constructor;', '&toString;', and '&__proto__;'

### Test Results
- Unit tests: ✓ All 191 tests passed (7 test files)
- Typecheck: ✓ Passed (no TypeScript errors)
- The new test specifically validates that these inherited names are not decoded and pass through as literals

Review (reviewer): both criteria met and ticked. AC1: recipe-schema.ts:41 uses Object.hasOwn (commit 8cb88d3). AC2: test at recipe-schema.test.ts:140-146 covers the three names; file passes 34/34 on ca542a3; orchestrator reports typecheck clean and 2061 unit tests. Not closed: close-task refuses a bug without a recorded repro. Worker or orchestrator should record the new test failing against pre-fix code (610b2fe) with record-check TASK-74.3.7 --repro -- pnpm -s exec vitest run packages/providers-server/src/recipe/pure/recipe-schema.test.ts -t 'inherited ones', then rerun close-task. A reviewer cannot revert code to produce it.

Repro at ca542a3fc41f, test files: packages/providers-server/src/recipe/pure/recipe-schema.test.ts; command: `pnpm -s exec vitest run --project unit packages/providers-server/src/recipe/pure/recipe-schema.test.ts -t 'inherited ones'` exited 1

```text

 RUN  v4.1.12 /Users/brukhabtu/src/github.com/bruk-io/grocs

 ❯ |unit| packages/providers-server/src/recipe/pure/recipe-schema.test.ts (34 tests | 1 failed | 33 skipped) 5ms
     × leaves names that are not in the entity table unchanged, including inherited ones 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |unit| packages/providers-server/src/recipe/pure/recipe-schema.test.ts > parseRecipePage > leaves names that are not in the entity table unchanged, including inherited ones
AssertionError: expected 'A function Object() { [native code] }…' to be 'A &constructor; B &toString; C &__pro…' // Object.is equality

Expected: "A &constructor; B &toString; C &__proto__;"
Received: "A function Object() { [native code] } B &toString; C &__proto__;"

 ❯ packages/providers-server/src/recipe/pure/recipe-schema.test.ts:145:40
    143|     expect(result.ok).toBe(true);
    144|     if (!result.ok) throw new Error('expected ok');
    145|     expect(result.value.content.title).toBe('A &constructor; B &toStri…
       |                                        ^
    146|   });
    147|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 33 skipped (34)
   Start at  23:19:59
   Duration  151ms (transform 53ms, setup 0ms, import 70ms, tests 5ms, environment 0ms)
```
<!-- SECTION:NOTES:END -->
