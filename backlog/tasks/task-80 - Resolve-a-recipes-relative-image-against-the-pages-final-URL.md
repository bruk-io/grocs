---
id: TASK-80
title: Resolve a recipe's relative image against the page's final URL
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 04:15'
labels:
  - size-2
  - providers
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
importRecipe resolves a relative JSON-LD image against the normalised request URL, because FetchedPage carries no final URL after redirects (TASK-74's contract, Amendments, 2026-11-07). A page reached through a redirect or a trailing-slash path can resolve a relative image to the wrong address. Accepted for the first pass of TASK-74; this would carry the final URL through FetchedPage and CachedSource.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 FetchedPage and the cached source carry the final URL after redirects, and importRecipe resolves a relative image against it
- [ ] #2 A test covers a relative image on a page reached through a redirect to a different path
<!-- AC:END -->
