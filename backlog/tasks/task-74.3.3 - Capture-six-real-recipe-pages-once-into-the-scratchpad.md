---
id: TASK-74.3.3
title: 'Capture six real recipe pages once, into the scratchpad'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-2
  - orchestrator
dependencies: []
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
1. Use WebSearch once per site to find one recipe page URL on it, and use only URLs that a search returned.
2. Write a scratchpad script `capture` (PEP 723, uv run, dependencies requests and click). It GETs each URL with User-Agent 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', Accept 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' and Accept-Language 'en-US,en;q=0.9', with no cookies. It saves the body to recipe-fixtures/raw/<site>.html in its own new directory.
3. Run it once. For each file, confirm with grep that it contains 'application/ld+json' and '"Recipe"'. Replace any site that fails with another search result.
4. Write capture-notes.md, and add the scratchpad path to providers-recipe-fixtures' task notes with the backlog CLI.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- (none)
<!-- SECTION:PLAN:END -->
