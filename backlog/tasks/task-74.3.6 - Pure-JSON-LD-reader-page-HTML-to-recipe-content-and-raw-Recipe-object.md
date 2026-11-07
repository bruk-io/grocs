---
id: TASK-74.3.6
title: 'Pure JSON-LD reader: page HTML to recipe content and raw Recipe object'
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:48'
labels:
  - size-3
  - layer-providers
dependencies:
  - TASK-74.3.4
  - TASK-74.3.5
  - TASK-74.3.2
parent_task_id: TASK-74.3
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §9: findRecipeJsonLd, parseRecipeJsonLd, parseRecipePage and PARSER_VERSION in pure/ (decision-15's exception; cite it). It has no site-specific code. The search order, the mainEntity rule, the @id-only image rule and the yield and instruction rules are fixed in the contract. It extracts ld+json script blocks without a third-party HTML library, because no new dependency is allowed. Covers TASK-74.3 AC#1, #3, #4 and #5, and TASK-74 AC#5, #6 and #12.

Split key: providers-recipe-schema. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 parseRecipePage returns ok {content, jsonLd} with a non-empty title, at least one ingredient and at least one step for every real fixture. Per-fixture tests assert the title, ingredient count, step count and yield
- [x] #2 A page with no Recipe JSON-LD gives 'not-a-recipe'. A Recipe with no ingredients, no steps or no title gives 'incomplete-recipe'
- [x] #3 parseRecipeJsonLd(result.jsonLd) deep-equals result.content for every fixture (74.3 AC#3)
- [x] #4 Hand-made fixtures prove: Recipe under mainEntity is found; an image that is only an @id reference gives null; a malformed ld+json block is skipped, not thrown; HTML entities in the title, steps and lines are decoded
- [x] #5 No branch tests a hostname or site name. Pure-folder, core-purity and test-presence pass. At this commit, pnpm -s typecheck passes repo-wide and the unit tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. json-ld.ts: findRecipeJsonLd - regex-extract every <script type=\"application/ld+json\"> block (attr order/case free), JSON.parse each (skip on throw), search each parsed value in order (top-level object, top-level array elements, @graph entries, one level of mainEntity on any of those nodes) for a node whose @type is 'Recipe' or a list containing it; return the first match across blocks in document order, else not-a-recipe.
2. recipe-schema.ts: PARSER_VERSION=1, RecipeContent = Omit<ParsedRecipe,'recipeId'|'sourceUrl'>. parseRecipeJsonLd resolves name->title, recipeIngredient (string[]) -> cleanText then parseIngredientLine, recipeInstructions (string split on \n / string[] / HowToStep.text / nested HowToSection.itemListElement, flattened) -> cleanText, recipeYield (string | number | list, first non-purely-numeric entry of a list else first entry) -> string|null, image (string | ImageObject.url | first resolvable entry of a list; bare {@id} -> null). A small hand-rolled entity decoder (numeric &#NNN;/&#xHH;; named amp/lt/gt/quot/apos/nbsp) plus a `<[^>]*>` tag strip applied to title, steps and ingredient lines before parsing. No title, no ingredients or no steps -> incomplete-recipe. parseRecipePage composes findRecipeJsonLd then parseRecipeJsonLd, returning {content, jsonLd}; the invariant in AC#3 holds by construction (same parseRecipeJsonLd call).
3. Tests: json-ld.test.ts and recipe-schema.test.ts, covering: each real fixture (title, ingredient count, step count, yield) and parseRecipeJsonLd(jsonLd) deep-equals content for each (AC#1, #3); hand-no-json-ld -> not-a-recipe, a Recipe fixture missing title/ingredients/steps -> incomplete-recipe (AC#2); hand-main-entity, hand-image-bare-id, hand-malformed-then-valid, hand-yield-number, hand-no-instructions, entity decoding via recipetineats' &gt;/&#39; steps (AC#4); no site-specific branches (AC#5).

### Risks
- Entity/tag handling is hand-rolled (no HTML/XML library allowed per decision-15's exception) - scope it to what the captured fixtures actually need (confirmed by grep: &amp; &gt; &quot; &#39; &#8211;) plus the general numeric/named cases, not a full HTML-entity table.
- The mainEntity/graph search order is my reading of contract §9's prose; if a fixture's expected match contradicts it, that is a contract-interpretation question, not something to resolve by special-casing - would stop and ask in notes.
- Must not export new pure/ symbols from packages/providers-server/src/index.ts: that wiring belongs to TASK-74.4, which is out of this task's file list.

### Proof
- `mise exec -- pnpm exec vitest run --project unit packages/providers-` green, including per-fixture title/ingredient-count/step-count/yield assertions and the parseRecipeJsonLd(jsonLd) === content check for every fixture.
- `mise exec -- pnpm -s typecheck` passes repo-wide.
- pure-folder (import-layers), core-purity and test-presence checks pass for the two new files (part of `pnpm check`, confirmed via the unit test run + manual grep of imports).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented json-ld.ts (findRecipeJsonLd) and recipe-schema.ts (PARSER_VERSION, RecipeContent, parseRecipeJsonLd, parseRecipePage) plus their tests, inside packages/providers-server/src/recipe/pure/.

Proof:
- `mise exec -- pnpm exec vitest run --project unit packages/providers-`: 13 test files, 222 tests, all passed (includes the two new suites: json-ld.test.ts and recipe-schema.test.ts).
- `mise exec -- pnpm -s typecheck`: clean, no output (passes repo-wide).
- `mise exec -- pnpm check`: "checks passed (16 checks, all mode, 522 ms)" - includes core-purity, import-layers (pure-folder) and test-presence for the two new files.

AC#1: per-fixture test asserts title, ingredient count, step count and yield for all five real fixtures (nyt-cooking, serious-eats, allrecipes, recipetineats, food52).
AC#2: hand-no-json-ld -> not-a-recipe; hand-no-instructions (no steps) and two synthetic cases (no recipeIngredient, no name) -> incomplete-recipe.
AC#3: parseRecipeJsonLd(result.jsonLd) deep-equals result.content asserted for all five real fixtures plus hand-main-entity, hand-yield-number and hand-image-bare-id.
AC#4: hand-main-entity (mainEntity), hand-image-bare-id (bare @id -> null), hand-malformed-then-valid (malformed block skipped, not thrown), hand-yield-number (bare number -> string), entity decoding asserted via recipetineats' literal &gt;/&#39; in its ld+json, plus a synthetic literal-tag-stripping test.
AC#5: no branch anywhere reads a hostname, URL or site name; the five differently-shaped real fixtures are found and parsed by the same code paths. core-purity, import-layers/pure-folder and test-presence all pass (part of `pnpm check` above); typecheck passes repo-wide.

Review findings addressed (TASK-74.3.6):

1. Added `decodes HTML entities in the title, ingredient lines and steps` test (recipe-schema.test.ts), with a synthetic Recipe whose name, recipeIngredient and recipeInstructions all carry entities. Uses `&#189;` rather than the review's example `&frac12;`: NAMED_ENTITIES only covers amp/lt/gt/quot/apos/nbsp, so `&frac12;` passes through undecoded (confirmed by probe) - this is a narrower-than-ideal table, flagged in the test comment but not changed, since widening NAMED_ENTITIES wasn't asked for. Also fixed the stale comment above the recipetineats steps-only entity test (was "steps and ingredient lines").
2. parseRecipeJsonLd now runs cleanText + a blank filter over recipeIngredient the same way steps are filtered, before the completeness check. Added `gives incomplete-recipe when every recipeIngredient entry is blank` test for `recipeIngredient: ['', '  ']`.
3. Added 'hand-malformed-then-valid.html' to the AC#3 round-trip it.each list.
4. Did NOT take the optional cleanText reorder (strip, decode, strip). Probed it first: `cleanText("Reduce to &lt;1 cup&gt; of liquid")` under strip-decode-strip loses "<1 cup>" entirely, because the second strip can't tell an entity-decoded '<' from a literal one. Left cleanText as strip-then-decode (single strip) and added a comment explaining why, since the reviewer's own note said leaving it as is meets the contract's wording.
5. Carrying forward unchanged, for the orchestrator (not mine to resolve in this layer): a relative `image` string such as '/rel.jpg' passes through parseRecipeJsonLd unchanged. Core ParsedRecipe.image is documented as an 'Absolute URL', but contract §9 fixes parseRecipeJsonLd/parseRecipePage's signatures without a page URL to resolve against, so this layer cannot resolve a relative image itself. Needs a contract decision: return null when the image isn't an absolute http(s) URL, or resolve it in §10/§11 against sourceUrl.

Proof:
- `mise exec -- pnpm exec vitest run --project unit packages/providers-`: 13 test files, 225 tests, all passed.
- `mise exec -- pnpm -s typecheck`: clean, no output (passes repo-wide).

Closed by reviewer. All 5 ACs met: per-fixture title/ingredient/step/yield tests and parseRecipeJsonLd round-trip for all five real fixtures; not-a-recipe and incomplete-recipe cases; hand fixtures for mainEntity, bare @id image, malformed block, entity decoding; no hostname/site branches (grep clean); pnpm check, typecheck and 2018 unit tests green on main at 6b10c7c; pure suite re-run 165/165. Findings (no drafts): (low) NAMED_ENTITIES covers only amp/lt/gt/quot/apos/nbsp, so named entities like &frac12; pass through undecoded; numeric forms decode; acceptable per plan scope, no task. (info) relative image strings pass through unchanged; carried to the contract owner and addressed by the image-URL contract amendment in 05d4685.
<!-- SECTION:NOTES:END -->
