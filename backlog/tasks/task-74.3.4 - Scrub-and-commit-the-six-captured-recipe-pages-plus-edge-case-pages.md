---
id: TASK-74.3.4
title: 'Scrub and commit the six captured recipe pages, plus edge-case pages'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:41'
labels:
  - size-2
  - layer-providers
dependencies:
  - TASK-74.3.3
parent_task_id: TASK-74.3
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fixtures for TASK-74.3 AC#4 (at least five sites, including NYT Cooking) and TASK-74 AC#12. The orchestrator has already captured the raw pages into the scratchpad path written in this task's notes. This builder makes no network access. Real pages often embed AIza keys and Firebase hosts. Keeping the fixtures as .html keeps them outside firebase-isolation's scanned extensions, but they are scrubbed anyway. They must contain no line that is exactly seven '<', '=', '|' or '>' characters (merge-conflict-markers). No dependency is added (pnpm-lock belongs to the orchestrator).

Split key: providers-recipe-fixtures. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/providers-server/src/recipe/pure/fixtures/ holds the six captured pages (NYT Cooking, Serious Eats, BBC Good Food, Allrecipes, RecipeTin Eats and the sixth site), each still containing its Recipe JSON-LD
- [ ] #2 Hand-made minimal pages cover any shape the real pages do not show among: @graph, a top-level array, @type as a list, Recipe under mainEntity, HowToSection instructions, yield as a number and as a list, image as a bare @id reference. There is also a page with no JSON-LD, a page with a malformed ld+json block before a valid one, and a Recipe with no recipeInstructions
- [ ] #3 fixtures/README.md lists each file's source URL, capture date and headers (from the orchestrator's capture notes), says which inline scripts were removed, and says which files are hand-made
- [ ] #4 No fixture contains 'AIza', 'firebaseio.com' or a seven-character marker line. The orchestrator confirms pnpm check passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Copy the raw pages from the scratchpad path in the notes into fixtures/.
2. Remove large inline script bodies other than application/ld+json, then Grep for AIza, firebaseio.com, googleapis and seven-character marker lines.
3. Hand-write the minimal edge-case pages.
4. Write the README.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-server/src/recipe/pure/fixtures/*.html
- packages/providers-server/src/recipe/pure/fixtures/README.md
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Raw captures from TASK-74.3.3 (orchestrator, 2026-11-07): /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/52850201-1584-4979-8b13-ca0cc6779c1a/scratchpad/recipe-fixtures/ holds raw/ (nyt-cooking.html, serious-eats.html, allrecipes.html, recipetineats.html, food52.html), capture-notes.md (source URL, capture date, exact headers per file) and capture-log.json. The scratchpad is session-scoped: run this task while it still exists. BBC Good Food is not yet captured (no search returned a bbcgoodfood.com URL); see TASK-74.3.3 notes.
<!-- SECTION:NOTES:END -->
