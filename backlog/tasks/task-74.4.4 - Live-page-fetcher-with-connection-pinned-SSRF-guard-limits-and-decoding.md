---
id: TASK-74.4.4
title: 'Live page fetcher with connection-pinned SSRF guard, limits and decoding'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-3
  - layer-providers
dependencies:
  - TASK-74.4.3
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §10: createGuardedLookup and createLiveFetchPage. Resolving the host and then calling fetch would let DNS rebinding answer differently the second time. So the address check runs inside the connection's lookup, and the socket connects to the address that was checked. IP-literal hosts skip lookup and are checked directly. The 10 s deadline is total across hops. Bodies are capped and decoded with the declared charset. A non-HTML Content-Type is refused before the body is read. The transport and resolve functions are injected, so unit tests never touch the network. The default node:http/https transport is exercised only in orch-proof-function. Covers TASK-74.4 AC#1 (no cookies or credentials, public pages only) and decision-15's fetching rules.

Split key: providers-recipe-fetch. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 src/recipe/fetch-page.ts exports FetchedPage, FetchPage, ResolveHost, createGuardedLookup, RawResponse, Transport, LiveFetchOptions and createLiveFetchPage as in contract §10
- [ ] #2 createGuardedLookup tests: a resolve stub that answers public then 127.0.0.1 makes the second lookup error (rebinding refused); any non-public address among several is refused; a public answer is passed to the callback with its family
- [ ] #3 createLiveFetchPage tests with a stub transport cover: 200 text/html gives a page; 404 not-found; 403 blocked; 500 unreachable; application/pdf gives not-a-recipe and the body is not iterated; a body over maxBytes gives unreachable; a windows-1252 charset decodes correctly; a redirect to a private IP literal or a non-default port is refused as unreachable; more than 5 redirects gives unreachable; the total deadline across two slow hops gives unreachable; a stub transport that throws gives unreachable
- [ ] #4 Requests carry User-Agent, Accept and Accept-Language and no Cookie or Authorization header, and the stub transport receives the guarded lookup (all asserted on the stub)
- [ ] #5 No URL appears in any thrown or returned message. At this commit, pnpm -s typecheck passes repo-wide and the unit tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write createGuardedLookup and its tests.
2. Write the redirect loop around the pure guards, with the deadline, cap, charset and content-type rules, then the stub-driven tests.
3. Write the default node:http/https transport last, with `agent: false` and the guarded lookup.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-server/src/recipe/fetch-page.ts
- packages/providers-server/src/recipe/fetch-page.test.ts
<!-- SECTION:PLAN:END -->
