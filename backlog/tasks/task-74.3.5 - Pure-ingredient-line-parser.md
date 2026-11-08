---
id: TASK-74.3.5
title: Pure ingredient-line parser
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:23'
labels:
  - size-2
  - layer-providers
dependencies:
  - TASK-74.3.1
  - TASK-74.3.2
parent_task_id: TASK-74.3
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §9 parseIngredientLine. It lives in packages/providers-server/src/recipe/pure/, a deliberate decision-15 exception to providers-hold-no-rules (cite decision-15 in the plan). It is held to core rules: no globals such as Date or crypto, and no imports except @grocs/core and pure/ siblings. orch-pure-boundary makes the post-edit hook enforce that. Best effort: quantity and unit may be null, and the line is the source of truth. Covers TASK-74.3 AC#2.

Split key: providers-ingredient-line. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 pure/ingredient-line.ts exports parseIngredientLine(line): ParsedIngredient. line is trimmed, and quantity and unit are kept as written
- [x] #2 ingredient-line.test.ts has table tests for: Unicode fractions (½, 1¼), mixed numbers (1 1/2), ranges (2-3, 2 to 3), bracketed sizes ('1 (14-ounce) can chickpeas' → quantity '1', unit '(14-ounce) can', item 'chickpeas'), a note after the first comma excluded from item ('2 onions, finely chopped' → item 'onions'), no quantity ('salt to taste' → quantity null, unit null), common units and abbreviations (cup, tbsp, tsp, g, kg, ml, oz, lb, clove, pinch) and plural units
- [x] #3 Pure-folder, core-purity and test-presence pass. At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/providers- passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write ingredient-line.test.ts first: a table of cases covering AC#2 (unicode fractions, mixed numbers, ranges, bracketed sizes, a note after the first comma, no-quantity lines, common units/abbreviations and plurals), each asserting the full ParsedIngredient.
2. Implement packages/providers-server/src/recipe/pure/ingredient-line.ts: parseIngredientLine(line) -> ParsedIngredient, trimming the line and keeping quantity/unit as written (best effort; quantity/unit may be null). No ambient globals, no imports except @grocs/core (for the ParsedIngredient type) and pure/ siblings -- this file is decision-15's exception to providers-hold-no-rules, held to core-purity and import-layers' pure-folder rule.
3. Run the pure-folder, core-purity and test-presence checks plus vitest and typecheck; fix until green; record output in the task notes.

### Risks
- decision-15's exception only covers this folder; nothing else in providers-server may relax providers-hold-no-rules.
- Ambiguous cases (e.g. "2 to 3", bracketed sizes, notes after a comma) have one correct behaviour in contract §9/AC#2; if a case in AC#2 is underspecified beyond what's written, I implement the documented table and leave any genuine contract gap in this task's notes rather than guessing silently.
- decision-16's delete-wins note does not bear on this task (no merge logic here); noted per the launch instructions only.

### Proof
- AC#1/#2: ingredient-line.test.ts table tests, pasted vitest output.
- AC#3: `pnpm -s typecheck` (repo-wide) and `pnpm exec vitest run --project unit packages/providers-` output, both green, pasted into notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Proof (TASK-74.3.5)

AC#1/#2 - packages/providers-server/src/recipe/pure/ingredient-line.ts and ingredient-line.test.ts
cover Unicode fractions, mixed numbers, ranges ('-' and 'to'), bracketed sizes, a note after the
first comma excluded from item, the no-quantity case, and common units/abbreviations/plurals
(cup, tbsp(s), tsp(s), g, kg, ml, oz, lb, clove(s), pinch(es)).

$ mise exec -- pnpm exec vitest run --project unit packages/providers-
 Test Files  8 passed (8)
      Tests  87 passed (87)

AC#3 - repo-wide typecheck and the full check suite (pure-folder, core-purity, test-presence
among others) both pass at this commit:

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no errors)

$ node tools/checks/run.ts --mode all
checks passed (16 checks, all mode, 522 ms)

## Follow-up check (advisor-prompted)

Added table rows for range + long-form-unit, a range of two vulgar fractions, a 'to' range with
a trailing note, and a mixed-number-to-plain-number range, to probe the quantity/range regex
beyond the AC#2 examples:
'1-2 tablespoons olive oil', '¼-½ teaspoon salt', '2 to 3 cloves garlic, minced',
'1 1/2 to 2 cups flour'. All parse correctly with no code change.

$ mise exec -- pnpm exec vitest run --project unit packages/providers-
 Test Files  8 passed (8)
      Tests  91 passed (91)

Noted boundary: the unit set is exactly AC#2's list (cup, tbsp, tsp, g, kg, ml, oz, lb, clove,
pinch) plus their long forms/plurals, not a general units dictionary. 'can', 'package', etc. are
not units here (e.g. '1 can tomatoes' parses as quantity '1', unit null, item 'can tomatoes'),
only the explicit bracketed-size form ('1 (14-ounce) can chickpeas') gets a unit. TASK-74.3.6's
fixtures should expect that boundary.

Closed by review. AC#1: parseIngredientLine trims line, keeps quantity/unit as written (test '2 Cups Flour'). AC#2: table covers every listed case incl. plurals; 28 tests pass locally. AC#3: orchestrator's merged-main run at 6b8e90f: pnpm check 16 checks pass (pure-folder, core-purity, test-presence), typecheck clean, 1907 unit tests pass. Findings (none filed): unit set is AC#2's list only, so '1 can tomatoes' gives unit null - documented boundary for TASK-74.3.6, acceptable under best effort.
<!-- SECTION:NOTES:END -->
