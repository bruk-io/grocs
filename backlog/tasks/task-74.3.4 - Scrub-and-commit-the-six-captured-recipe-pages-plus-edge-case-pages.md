---
id: TASK-74.3.4
title: 'Commit the five captured recipe pages'' JSON-LD, plus edge-case pages'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:03'
labels:
  - size-2
  - layer-providers
  - finish-moved
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
- [ ] #1 packages/providers-server/src/recipe/pure/fixtures/ holds, for each of the five captured pages (NYT Cooking, Serious Eats, Allrecipes, RecipeTin Eats and Food52), its Recipe JSON-LD block(s) exactly as captured inside a minimal HTML wrapper - not the publisher's full page, since the repo is going public (TASK-10) and full pages are large and not ours to redistribute
- [ ] #2 Hand-made minimal pages cover any shape the real pages do not show among: @graph, a top-level array, @type as a list, Recipe under mainEntity, HowToSection instructions, yield as a number and as a list, image as a bare @id reference. There is also a page with no JSON-LD, a page with a malformed ld+json block before a valid one, and a Recipe with no recipeInstructions
- [ ] #3 fixtures/README.md lists each file's source URL, capture date and headers (from the orchestrator's capture notes), says the real-site files keep only their JSON-LD, and says which files are hand-made
- [ ] #4 No fixture contains 'AIza', 'firebaseio.com' or a seven-character marker line. The orchestrator confirms pnpm check passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Merge local main into this worktree; confirm with git log.
2. Extract each raw captured page's <script type=\"application/ld+json\"> block(s) verbatim (regex, no re-encoding) into packages/providers-server/src/recipe/pure/fixtures/<site>.html, wrapped in a minimal <!DOCTYPE html><html><head>...</head><body></body></html> skeleton - not the publisher's full page.
3. Inspect each real fixture's actual recipeYield/image/recipeInstructions/@type/top-level shapes to find which AC#2 edge cases the five real pages do not already cover.
4. Hand-write one minimal page per uncovered edge case: Recipe under mainEntity, recipeYield as a bare number, image as a bare @id reference with no resolvable url, a page with no JSON-LD at all, a malformed ld+json block before a valid one, and a Recipe with no recipeInstructions.
5. grep every fixture file for AIza, firebaseio.com, googleapis and seven-character merge-marker lines.
6. Write fixtures/README.md: per-file source URL/capture date/headers for the real-site files, says they keep only their JSON-LD, and names the six hand-made files and what each covers.

### Risks
No parser exists yet (TASK-74.3.6 is later), so these fixtures cannot be proven against the real reader in this task; AC#1-#3 are proven by inspection and by diffing extracted JSON-LD against the raw captures, AC#4 by grep. This task only commits fixtures, per its own acceptance criteria and modified-files list - no parser code is added. No contract deviation found; following TASK-74.3.4's own task text (not the stale task-file title 'Scrub-and-commit-the-six...plus edge-case pages' versus the current five-site body) since the body/AC/notes are authoritative over the historic filename.

### Proof
- ls + grep output recorded in notes for AC#1 and AC#4.
- A table in README.md naming each real file's shape and each hand-made file's covered edge case, keyed to AC#2 and AC#3.
- pnpm check output (AC#4's "the orchestrator confirms pnpm check passes" is the orchestrator's job, not this builder's, per the task text; this builder records its own layer checks).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
finish-moved 2026-11-07 (orchestrator): AC #1 and #3 changed from committing scrubbed full pages to committing each page's extracted JSON-LD in a minimal wrapper. The repo is going public (TASK-10), the NYT page alone was ~680 KB, and full publisher pages are not ours to redistribute. The parser's real-page coverage is unchanged because it reads only the ld+json blocks.

Raw captures from TASK-74.3.3 (orchestrator, 2026-11-07): /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/52850201-1584-4979-8b13-ca0cc6779c1a/scratchpad/recipe-fixtures/ holds raw/ (nyt-cooking.html, serious-eats.html, allrecipes.html, recipetineats.html, food52.html), capture-notes.md (source URL, capture date, exact headers per file) and capture-log.json. The scratchpad is session-scoped: run this task while it still exists. BBC Good Food is not yet captured (no search returned a bbcgoodfood.com URL); see TASK-74.3.3 notes.

finish-moved 2026-11-07 (orchestrator): five sites instead of six. No web search returned a bbcgoodfood.com recipe URL (its domain is blocked to the search crawler), so BBC Good Food is dropped. Five real sites including NYT Cooking still meet TASK-74.3's 'at least five sites'.

Correction 2026-11-07 (orchestrator): BBC Good Food is dropped, not pending. The five captured sites are NYT Cooking, Serious Eats, Allrecipes, RecipeTin Eats and Food52 (see TASK-74.3.3). Don't wait for a sixth page.

test simple note

Checks run (providers layer, from the worktree):
mise exec -- pnpm -s typecheck: tsc --noEmit, no output, exit 0.
mise exec -- pnpm exec vitest run --project unit packages/providers-: Test Files 7 passed (7), Tests 63 passed (63).

AC#1: fixtures/ holds nyt-cooking.html, serious-eats.html, allrecipes.html, recipetineats.html, food52.html, each containing only its page's ld+json block(s) inside a minimal wrapper, not the full page. Verified byte-identical block sizes vs raw capture:
nyt-cooking: raw 4 blocks (20507,1328,1104,975) = fixture 4 blocks (same)
serious-eats: raw 1 block (23368) = fixture 1 block (23368)
allrecipes: raw 1 block (17244) = fixture 1 block (17244)
recipetineats: raw 2 blocks (17436,1038) = fixture 2 blocks (same)
food52: raw 3 blocks (329,559,4078) = fixture 3 blocks (same)
File sizes dropped from 184KB-690KB (raw) to 5.2KB-24KB (fixtures).

AC#2 (6 hand-made edge pages, each verified by parsing): real pages already cover @graph, top-level array, @type-as-list and HowToSection nesting.

hand-main-entity.html: 1 block, Recipe reachable only via WebPage.mainEntity; yield/ingredients/instructions present.

hand-yield-number.html: 1 block, Recipe; recipeYield is JSON int 4, not string.

hand-image-bare-id.html: 1 block, Recipe; image is an @id-only object, no url or contentUrl.

hand-no-json-ld.html: 0 ld+json blocks found (confirmed by script).

hand-malformed-then-valid.html: 2 blocks; block 0 raises a JSON decode error, block 1 parses as a valid Recipe.

hand-no-instructions.html: 1 block, Recipe; recipeInstructions key absent.

AC#3: fixtures/README.md tables list each real file's source URL, capture date (UTC), shared request headers, blocks kept and notable shape, say real files keep only JSON-LD, and name the six hand-made files with the edge case each covers.

AC#4 (orchestrator confirms pnpm check): grep for AIza, firebaseio.com, googleapis across fixtures/ matches only README.md's own sentence describing the scrub, no fixture .html file matches.

Grep for a seven-character conflict-marker line across fixtures/: no matches anywhere. No dependency was added; the lockfile is untouched by this task.
<!-- SECTION:NOTES:END -->
