---
id: TASK-74.4.11
title: >-
  The live fetcher can't read gzip-compressed pages, so NYT Cooking imports as
  not-a-recipe
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 05:06'
labels:
  - size-2
  - layer-providers
dependencies: []
parent_task_id: TASK-74.4
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in TASK-74.4.8's local proof (2026-11-07): importing https://cooking.nytimes.com/recipes/1015178-marcella-hazans-tomato-sauce through the real callable returns not-a-recipe. NYT sends a gzip-compressed body even when the request has no Accept-Encoding: curl without --compressed gets ~3.5 KB of gzip bytes, with --compressed gets the 690 KB page with 2 Recipe JSON-LD matches. createLiveFetchPage (packages/providers-server/src/recipe/fetch-page.ts) sends no Accept-Encoding and never decompresses, so the parser reads compressed bytes. Fixtures and fakes cannot catch this: they never go through node:http.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The live fetcher sends Accept-Encoding: gzip, deflate, br and decodes the body according to Content-Encoding (gzip, deflate, br, or none) before charset decoding; an unknown encoding is unreachable
- [ ] #2 The 5 MB body limit applies to the decompressed size as well as the bytes read, so a small compressed body that inflates past the limit is refused (unreachable) without being fully inflated
- [ ] #3 fetch-page.test.ts covers gzip, deflate and br bodies, an unknown encoding, and a compressed body that inflates past the limit, through the stub transport
- [ ] #4 The providers unit tests and typecheck pass
<!-- AC:END -->
