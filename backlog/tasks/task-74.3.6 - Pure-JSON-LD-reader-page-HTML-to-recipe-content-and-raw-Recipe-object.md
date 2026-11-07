---
id: TASK-74.3.6
title: 'Pure JSON-LD reader: page HTML to recipe content and raw Recipe object'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
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
- [ ] #1 parseRecipePage returns ok {content, jsonLd} with a non-empty title, at least one ingredient and at least one step for every real fixture. Per-fixture tests assert the title, ingredient count, step count and yield
- [ ] #2 A page with no Recipe JSON-LD gives 'not-a-recipe'. A Recipe with no ingredients, no steps or no title gives 'incomplete-recipe'
- [ ] #3 parseRecipeJsonLd(result.jsonLd) deep-equals result.content for every fixture (74.3 AC#3)
- [ ] #4 Hand-made fixtures prove: Recipe under mainEntity is found; an image that is only an @id reference gives null; a malformed ld+json block is skipped, not thrown; HTML entities in the title, steps and lines are decoded
- [ ] #5 No branch tests a hostname or site name. Pure-folder, core-purity and test-presence pass. At this commit, pnpm -s typecheck passes repo-wide and the unit tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write findRecipeJsonLd over the hand-made pages, then the normalisers, then the real-fixture suite.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-server/src/recipe/pure/json-ld.ts
- packages/providers-server/src/recipe/pure/json-ld.test.ts
- packages/providers-server/src/recipe/pure/recipe-schema.ts
- packages/providers-server/src/recipe/pure/recipe-schema.test.ts
<!-- SECTION:PLAN:END -->
