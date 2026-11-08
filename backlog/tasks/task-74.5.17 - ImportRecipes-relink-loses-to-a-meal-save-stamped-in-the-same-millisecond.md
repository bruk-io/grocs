---
id: TASK-74.5.17
title: ImportRecipe's relink loses to a meal save stamped in the same millisecond
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-08 03:48'
updated_date: '2026-11-08 03:55'
labels:
  - size-1
  - layer-application
dependencies: []
parent_task_id: TASK-74.5
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by TASK-74.5.15's builder and its reviewer. AddMealScreen saves the meal (AddMeal or EditMeal, link = the raw pasted URL) and then dispatches ImportRecipe, which relinks the meal to the normalised sourceUrl. SystemClock is Date.now(), so both writes can carry the same stamp {at, by}. core mergeStamped then breaks the tie by JSON ordering, and a raw link with a query ('?' 0x3F) sorts above its normalised form (ends in '"' 0x22), so the raw link wins and the meal detaches from its recipe - the failure contract §17 exists to prevent. Reproduces in the demo build (in-memory store), not only under FakeClock.

Fix (orchestrator ruling, contract §8 amendment): ImportRecipe stamps the relink strictly after the link it replaces: at = max(clock.now(), meal.link.stamp.at + 1). The recipe keeps clock.now() as its createdAt. A causal bump for one field; the general same-millisecond problem is DRAFT-24 (hybrid logical clock stamps).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A scenario test with a FakeClock that does not advance saves a meal whose link is 'https://recipe.invalid/a?utm_source=ig', imports a recipe whose sourceUrl is 'https://recipe.invalid/a', and asserts the stored meal's link is the sourceUrl; it fails before the fix and passes after (repro recorded)
- [ ] #2 import-recipe.ts stamps the relink at max(clock.now(), meal.link.stamp.at + 1) with the caller's uid, and the recipe's createdAt stays clock.now(); every existing import-recipe scenario test, including the three R47 cases, still passes
- [ ] #3 pnpm -s typecheck passes repo-wide and vitest --project unit packages/application passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In packages/application/src/commands/import-recipe.scenario.test.ts add one test, modelled on the happy path: a FakeClock that is never advanced, AddMeal with link 'https://recipe.invalid/a?utm_source=ig', a FakeRecipeImporter seeded so that URL returns a recipe with sourceUrl 'https://recipe.invalid/a', then ImportRecipe; assert the stored meal's link.value equals 'https://recipe.invalid/a'.
2. Run `pnpm exec vitest run --project unit packages/application/src/commands/import-recipe.scenario.test.ts` and confirm the new test FAILS. Record the failing output in the notes with `python3 /Users/brukhabtu/.claude/plugins/cache/knowhere/philosophy/0.4.6/scripts/record-check <this task id> --repro -- pnpm exec vitest run --project unit packages/application/src/commands/import-recipe.scenario.test.ts` (see its --help if the syntax differs).
3. In packages/application/src/commands/import-recipe.ts, give relinkMeal its own stamp: `{ at: Math.max(clock.now(), meal.link.stamp.at + 1), by: user.uid }`, with a one-line comment saying the relink must sort after the link it replaces (a same-millisecond save would otherwise win the tie by JSON order). Keep `{ at: clock.now(), by: user.uid }` for recipeFromImport. Call clock.now() once.
4. Rerun the scenario file (all pass), `pnpm exec vitest run --project unit packages/application` and `pnpm -s typecheck`; paste the key lines into the notes; commit.

### Risks
The R47 offline-relink case: B's earlier/later stamps are never in A's view of the meal, so the bump changes nothing there; if one of those tests fails, stop and report rather than change the test.

### Proof
The new test fails before step 3 and passes after; the whole application unit project and typecheck pass.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Repro at 76bf812b862a, test files: packages/application/src/commands/import-recipe.scenario.test.ts; command: `pnpm exec vitest run --project unit packages/application/src/commands/import-recipe.scenario.test.ts` exited 1

(4 earlier lines omitted)
```text
     × relink must win over a meal save stamped in the same millisecond (TASK-74.5.17 repro) 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |unit| packages/application/src/commands/import-recipe.scenario.test.ts > ImportRecipe scenarios (contract TASK-74 §8, R47) > relink must win over a meal save stamped in the same millisecond (TASK-74.5.17 repro)
AssertionError: expected 'https://recipe.invalid/a?utm_source=ig' to be 'https://recipe.invalid/a' // Object.is equality

Expected: "https://recipe.invalid/a"
Received: "https://recipe.invalid/a?utm_source=ig"

 ❯ packages/application/src/commands/import-recipe.scenario.test.ts:238:30
    236|     expect(result.ok).toBe(true);
    237|     const [meal] = await client.store.getMeals(KITCHEN, WEEK);
    238|     expect(meal?.link.value).toBe(normalisedUrl);
       |                              ^
    239|   });
    240|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 19 passed (20)
   Start at  22:55:14
   Duration  184ms (transform 81ms, setup 0ms, import 103ms, tests 9ms, environment 0ms)
```

Orchestrator: merged at 76bf812 (fix 98a05f4, repro test c859741). The repro above was recorded on main with import-recipe.ts temporarily restored to c859741's (pre-fix) version: 1 failed / 19 passed. With the fix restored: vitest --project unit packages/application 20 files / 118 tests passed. reviewer-application approved; its optional note (clientWithMeal's clock.advance(1) comment is now stale) is left as-is because AC #2 asks the existing tests to stay unchanged.
<!-- SECTION:NOTES:END -->
