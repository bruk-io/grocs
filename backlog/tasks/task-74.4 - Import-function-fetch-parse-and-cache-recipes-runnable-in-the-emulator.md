---
id: TASK-74.4
title: 'Import function: fetch, parse and cache recipes, runnable in the emulator'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 01:00'
labels:
  - size-5
  - providers
dependencies:
  - TASK-74.1
  - TASK-74.3
parent_task_id: TASK-74
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The server half of TASK-74: a callable Cloud Function in apps/functions that takes a URL from a signed-in member and returns a parsed recipe or an error. It returns the cached recipe when it has one; otherwise it fetches the page, parses it with TASK-74.3's code, caches the result and returns it. The first goal is to prove it locally in the Functions emulator; deploying it belongs to the separate infrastructure intent (Grocs' Firebase project and deploys are code). Note: a plain curl of an NYT page with only a browser User-Agent got a page with no recipe data while Python requests got the full page, so a successful fetch can still hold nothing usable.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Only signed-in members can call the function; it fetches public pages with no cookies or credentials
- [ ] #2 A URL already in the shared cache is answered from it without fetching the site, and the cache is keyed by canonical URL so tracking parameters do not create duplicates
- [ ] #3 The cache stores the parsed recipe and the raw Recipe JSON-LD separately
- [ ] #4 A URL whose fetch or parse failed is not fetched again for 1 day, and callers get the same error meanwhile
- [ ] #5 Firestore rules stop app clients reading or writing the cache directly, with allow and deny tests
- [ ] #6 Emulator tests cover cache hit, cache miss, failure memory and the not-a-recipe error without fetching live sites
- [ ] #7 pnpm emulators runs the function locally, and importing a real recipe URL through it works
- [ ] #8 No recipe URL or content is written to logs (R36)
<!-- AC:END -->
