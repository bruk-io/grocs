---
id: TASK-74.3.7
title: decodeEntities resolves names like '&constructor;' through Object's prototype
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 03:45'
updated_date: '2026-11-07 03:46'
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
- [ ] #1 decodeEntities only resolves names that are the table's own keys: '&constructor;', '&toString;' and '&__proto__;' come through unchanged
- [ ] #2 recipe-schema.test.ts has a case for those three names, and the providers unit tests and typecheck pass
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
