---
id: TASK-74.3.3
title: 'Capture six real recipe pages once, into the scratchpad'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:42'
labels:
  - size-2
  - orchestrator
dependencies: []
modified_files:
  - >-
    backlog/tasks/task-74.3.3 -
    Capture-six-real-recipe-pages-once-into-the-scratchpad.md
  - >-
    backlog/tasks/task-74.3.4 -
    Scrub-and-commit-the-six-captured-recipe-pages-plus-edge-case-pages.md
parent_task_id: TASK-74.3
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Decision-15 allows one manual capture and no automated live fetch. builder-providers' Bash is narrowed to vitest and typecheck, and CLAUDE.md says to open only URLs a search returned, so the orchestrator does the capture. Decision-15 records that curl with only a User-Agent got no NYT recipe data while Python requests with full browser headers got the full page. Covers the capture half of TASK-74.3 AC#4 and TASK-74 AC#12.

Split key: orch-capture-fixtures. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Six raw .html pages are saved in the scratchpad under recipe-fixtures/raw/, one each from NYT Cooking, Serious Eats, BBC Good Food, Allrecipes, RecipeTin Eats and one more site (for example Bon Appétit or Food52), each containing schema.org Recipe JSON-LD
- [ ] #2 recipe-fixtures/capture-notes.md records, for each file, the source URL (taken from a web search result), the capture date and the exact headers sent
- [ ] #3 Nothing is committed by this task. The scratchpad path is written into providers-recipe-fixtures' notes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. WebSearch once per site (NYT Cooking, Serious Eats, BBC Good Food, Allrecipes, RecipeTin Eats, and Bon Appetit or Food52) for one recipe page; use only URLs a search returned.
2. Write the scratchpad script <scratchpad>/tools/capture (PEP 723, uv run, requests + click), kept outside the download directory. It GETs each URL with User-Agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36", Accept "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", Accept-Language "en-US,en;q=0.9", no cookies, and saves each body to <scratchpad>/recipe-fixtures/raw/<site>.html (a new, empty directory). It prints the status and the headers actually sent.
3. Run it once. Grep each file for "application/ld+json" and "\"Recipe\"" (Recipe in quotes). Replace a failing site with another search result.
4. Write <scratchpad>/recipe-fixtures/capture-notes.md (URL, capture date, exact headers per file). Append the scratchpad path to TASK-74.3.4 (providers-recipe-fixtures) notes with the backlog CLI.
5. Commit only the board edits (status, plan, notes); no fixture file enters the repository.

<scratchpad> is /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/52850201-1584-4979-8b13-ca0cc6779c1a/scratchpad

### Risks
- A site blocks the request (403, bot wall) or serves a page without JSON-LD: swap to another search result for that site, or another site for the sixth slot; record it in the notes.
- The scratchpad is session-specific; TASK-74.3.4 must run while it exists. The exact path is recorded so its builder can read it.
- Downloaded HTML is untrusted: it is only grepped, never executed or loaded by an interpreter from its directory.
- Follow TASK-74 slice contract exactly; a needed contract change goes in this task notes and the work stops (decision-3 mediation).

### Proof
- AC#1: ls of recipe-fixtures/raw/ plus per-file grep -c for "application/ld+json" and the quoted "Recipe", pasted into the notes.
- AC#2: the contents of capture-notes.md, pasted into the notes.
- AC#3: repository status showing no fixture file tracked or staged; TASK-74.3.4 notes showing the path.

Requirements: this capture serves TASK-74.3 AC#4 and TASK-74 AC#12. Of doc-1, it upholds R36 (recipe URLs are personal fields): the capture writes no URL or content to any app log; URLs live only in scratchpad notes. Repository files changed are board files only.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Capture report (orchestrator, 2026-11-07 02:40 UTC). Scratchpad: /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/52850201-1584-4979-8b13-ca0cc6779c1a/scratchpad/recipe-fixtures/ (raw/, capture-notes.md, capture-log.json). Script: scratchpad/tools/capture (PEP 723, requests, no cookies), run once.

AC#1 (5 of 6). Script output:
OK nyt-cooking: 200 689994B ld+json=True Recipe=True final=https://cooking.nytimes.com/recipes/1015178-marcella-hazans-tomato-sauce
OK serious-eats: 200 589578B ld+json=True Recipe=True final=https://www.seriouseats.com/the-best-chili-recipe
OK allrecipes: 200 562761B ld+json=True Recipe=True final=https://www.allrecipes.com/recipe/20144/banana-banana-bread/
OK recipetineats: 200 539028B ld+json=True Recipe=True final=https://www.recipetineats.com/easy-classic-chinese-beef-stir-fry/
OK food52: 200 184433B ld+json=True Recipe=True final=https://food52.com/recipes/65245-weeknight-chili
grep -c application/ld+json: food52 3, recipetineats 2, allrecipes 1, nyt-cooking 1, serious-eats 1. grep -c "Recipe": food52 1, recipetineats 2, allrecipes 1, nyt-cooking 2, serious-eats 1. @type forms seen: "Recipe" (nyt, recipetineats, food52) and ["Recipe", ...] list (serious-eats, allrecipes).

BBC Good Food NOT captured. No WebSearch in this session returned a www.bbcgoodfood.com recipe URL (8 queries, listed in capture-notes.md); the search crawler is blocked on bbcgoodfood.com, so results were only copies (whisk, copymethat, scribd, an ageuk PDF) or bbcgoodfoodme.com (Good Food Middle East, a different publication, not substituted). Open question for Bruk/orchestrator: supply a bbcgoodfood.com recipe URL (a search result you run, or one you pick) to capture with the same script, OR accept five sites (TASK-74.3 AC#4 asks for at least five including NYT, which is met) and reword this AC. Food52 fills the sixth-site slot.

AC#2: capture-notes.md records per file the source URL, the query and verbatim search line it came from, the capture time (2026-11-07T02:40:55-58Z) and the exact headers as requests sent them (response.request.headers): User-Agent Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36; Accept-Encoding gzip, deflate; Accept text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8; Connection keep-alive; Accept-Language en-US,en;q=0.9; no Cookie. Allrecipes redirected once to the trailing-slash URL. NYT, Serious Eats and Allrecipes URLs appeared in search result text, not the links list, because the search crawler is blocked on those domains; this is recorded.

AC#3: the scratchpad is outside the repository; only board files (this task, TASK-74.3.4) are committed. Path appended to TASK-74.3.4 notes.
<!-- SECTION:NOTES:END -->
