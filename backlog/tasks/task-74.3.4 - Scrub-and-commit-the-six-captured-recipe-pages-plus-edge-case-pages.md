---
id: TASK-74.3.4
title: 'Commit the five captured recipe pages'' JSON-LD, plus edge-case pages'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:12'
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
2. Extract each raw captured page's <script type=\"application/ld+json\"> block(s) verbatim (regex, no re-encoding), including each block's original opening <script ...> tag, into packages/providers-server/src/recipe/pure/fixtures/<site>.html, wrapped in a minimal <!DOCTYPE html><html><head>...</head><body></body></html> skeleton - not the publisher's full page.
3. Inspect each real fixture's actual recipeYield/image/recipeInstructions/@type/top-level shapes to find which AC#2 edge cases the five real pages do not already cover.
4. Hand-write one minimal page per uncovered edge case: Recipe under mainEntity, recipeYield as a bare number, image as a bare @id reference with no resolvable url, a page with no JSON-LD at all, a malformed ld+json block before a valid one, and a Recipe with no recipeInstructions.
5. grep every fixture file for AIza, firebaseio.com, googleapis and seven-character merge-marker lines.
6. Write fixtures/README.md: per-file source URL/capture date/headers for the real-site files, says they keep only their JSON-LD, and names the six hand-made files and what each covers.

### Risks
No parser exists yet (TASK-74.3.6 is later), so these fixtures cannot be proven against the real reader in this task; AC#1-#3 are proven by inspection and by diffing extracted JSON-LD against the raw captures, AC#4 by grep. This task only commits fixtures, per its own acceptance criteria and modified-files list - no parser code is added. No contract deviation found; following TASK-74.3.4's own task text (not the stale task-file title 'Scrub-and-commit-the-six...plus edge-case pages' versus the current five-site body) since the body/AC/notes are authoritative over the historic filename.

Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
- ls + grep output recorded in notes for AC#1 and AC#4.
- A table in README.md naming each real file's shape and each hand-made file's covered edge case, keyed to AC#2 and AC#3.
- pnpm check output (AC#4's "the orchestrator confirms pnpm check passes" is the orchestrator's job, not this builder's, per the task text; this builder records its own layer checks).

Files expected to change:
- packages/providers-server/src/recipe/pure/fixtures/*.html
- packages/providers-server/src/recipe/pure/fixtures/README.md
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
finish-moved 2026-11-07 (orchestrator): AC #1 and #3 changed from committing scrubbed full pages to committing each page's extracted JSON-LD in a minimal wrapper. The repo is going public (TASK-10), the NYT page alone was ~680 KB, and full publisher pages are not ours to redistribute. The parser's real-page coverage is unchanged because it reads only the ld+json blocks.

Raw captures from TASK-74.3.3 (orchestrator, 2026-11-07): /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/52850201-1584-4979-8b13-ca0cc6779c1a/scratchpad/recipe-fixtures/ holds raw/ (nyt-cooking.html, serious-eats.html, allrecipes.html, recipetineats.html, food52.html), capture-notes.md (source URL, capture date, exact headers per file) and capture-log.json. The scratchpad is session-scoped: run this task while it still exists. BBC Good Food is not yet captured (no search returned a bbcgoodfood.com URL); see TASK-74.3.3 notes.

finish-moved 2026-11-07 (orchestrator): five sites instead of six. No web search returned a bbcgoodfood.com recipe URL (its domain is blocked to the search crawler), so BBC Good Food is dropped. Five real sites including NYT Cooking still meet TASK-74.3's 'at least five sites'.

Correction 2026-11-07 (orchestrator): BBC Good Food is dropped, not pending. The five captured sites are NYT Cooking, Serious Eats, Allrecipes, RecipeTin Eats and Food52 (see TASK-74.3.3). Don't wait for a sixth page.

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

Review-fix 2026-11-07 (builder, TASK-74.3.4 revision): addressed layer-reviewer findings.

1) README.md's "A note for TASK-74.3.6 (the parser)" section claimed nyt-cooking.html's ImageObject entries carry contentUrl but not url, so a parser reading only url would see image: null. This is false: every one of nyt-cooking.html's 4 image entries has both url and contentUrl, and the two values are byte-identical (verified by parsing the fixture's JSON and comparing img['url'] == img['contentUrl'] for all 4 images - all True). Removed the section.

2) README.md's intro paragraph and the nyt-cooking table row both claimed the Recipe block is not the first ld+json block on the NYT page. Checked: nyt-cooking.html's block 0 (of 4) is the Recipe (@type Recipe), followed by WebPage, Organization, NewsMediaOrganization. That claim was false for NYT. Parsed all five real fixtures' ld+json blocks in order (not just NYT) to confirm which ones actually have the Recipe later than block 0: allrecipes block 0 is the Recipe/NewsArticle array, serious-eats block 0 is the Recipe array, recipetineats block 0 is the @graph document that holds the Recipe node, nyt-cooking block 0 is the Recipe - only food52.html has the Recipe later (block 2 of 3: WebSite, Organization, Recipe). Reworded the intro and both table rows to credit "Recipe is a later block" coverage to food52.html only.

3) The recipetineats.html table row claimed "@type a list of several types ending in Recipe". Checked the raw capture: the Recipe node's @type is the plain string "Recipe" (python search for the literal `"@type":"Recipe"` found it in the raw file; a list form `"@type":[` was not found). This matches the capture notes already on file. Fixed the row to say @type is a plain string, not a list. The claim that the real set covers @type-as-a-list still holds via serious-eats.html (["Recipe"]) and allrecipes.html (["Recipe","NewsArticle"]).

4) All five real-site fixtures had their opening <script> tag for each ld+json block rewritten to a bare `<script type="application/ld+json">`, losing the original attributes. Restored each block's original opening tag exactly as captured: nyt-cooking.html's four blocks now reopen with `data-next-head=""`; serious-eats.html's block reopens with `id="bedrock-schema_1-0" class="comp bedrock-schema mntl-schema-unified" type="application/ld+json"`; allrecipes.html's block reopens with `id="allrecipes-schema_1-0" class="comp allrecipes-schema mntl-schema-unified" type="application/ld+json"`; recipetineats.html's two blocks reopen with `class="yoast-schema-graph"` and `class="wp-parsely-metadata"` respectively. food52.html already matched the raw capture's bare tags, so it needed no change. Re-verified after the fix that every fixture's extracted ld+json block bodies are still byte-identical to the raw captures (same block count and same per-block byte length for all five files). Re-ran the AIza/firebaseio.com/googleapis/seven-character-marker scrub: only README.md's own descriptive sentence matches ("AIza", "firebaseio.com", "googleapis" as literal words it names); no fixture .html file matches, and no seven-character marker line exists anywhere under fixtures/. Updated README.md's wording ("unmodified" -> "unmodified down to each block's original opening <script ...> tag") to describe this accurately.

5) Removed the stray "test simple note" line from these Implementation Notes (leftover debugging text, not evidence).

6) Restored the plan's dropped "Files expected to change" list and the decision-3 mediation risk line (see Implementation Plan).

Re-ran checks after all fixes:
mise exec -- pnpm -s typecheck: tsc --noEmit, no output, exit 0.
mise exec -- pnpm exec vitest run --project unit packages/providers-: Test Files 7 passed (7), Tests 63 passed (63).

Review-fix follow-up 2026-11-07 (builder): first commit attempt failed the pre-commit hook on apps/mobile/src/routes/kitchen.route.test.tsx ("shows the invite link and code, then Groceries works on that kitchen") timing out at 5000ms - outside this layer and outside this task's changed files. Retried the commit unchanged and the same suite passed (Test Files 138 passed (138), Tests 1765 passed (1765)); treating it as a flake, not something this fix introduced.

Also noted while re-running board-check: TASK-74.3.4's plan already fails two pre-existing, unrelated board-check findings - "lists no files: add each file that changes with --modified-file" and "cites no requirement from TASK-74's spec: name the R-numbers it delivers" - confirmed present before this round's edits too (checked via git stash against commit c64a867). Neither is among the reviewer's five findings for this round, so left alone; the reviewer asked for a restored prose "Files expected to change" list (done), which is a different thing from the --modified-file frontmatter field board-check wants. Flagging for the orchestrator since fixing board metadata wasn't asked of this task.
<!-- SECTION:NOTES:END -->
