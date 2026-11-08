---
id: TASK-74.4.4
title: 'Live page fetcher with connection-pinned SSRF guard, limits and decoding'
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:48'
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
- [x] #1 src/recipe/fetch-page.ts exports FetchedPage, FetchPage, ResolveHost, createGuardedLookup, RawResponse, Transport, LiveFetchOptions and createLiveFetchPage as in contract §10
- [x] #2 createGuardedLookup tests: a resolve stub that answers public then 127.0.0.1 makes the second lookup error (rebinding refused); any non-public address among several is refused; a public answer is passed to the callback with its family
- [x] #3 createLiveFetchPage tests with a stub transport cover: 200 text/html gives a page; 404 not-found; 403 blocked; 500 unreachable; application/pdf gives not-a-recipe and the body is not iterated; a body over maxBytes gives unreachable; a windows-1252 charset decodes correctly; a redirect to a private IP literal or a non-default port is refused as unreachable; more than 5 redirects gives unreachable; the total deadline across two slow hops gives unreachable; a stub transport that throws gives unreachable
- [x] #4 Requests carry User-Agent, Accept and Accept-Language and no Cookie or Authorization header, and the stub transport receives the guarded lookup (all asserted on the stub)
- [x] #5 No URL appears in any thrown or returned message. At this commit, pnpm -s typecheck passes repo-wide and the unit tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. `fetch-page.ts`: `createGuardedLookup(resolve)` wrapping a `ResolveHost` into a `node:net` `LookupFunction`: every call re-resolves, refuses (callback with an `EBLOCKED` error, no hostname in the message) if any answer fails `isPublicAddress`, otherwise hands back all addresses (`options.all`) or the first with its family.
2. Pure building blocks reused as-is from TASK-74.4.3: `isAllowedTarget`, `isPublicAddress` (stripping a bracketed IPv6 literal and a zone id before the call), `errorForStatus`. A small local `literalAddress(hostname)` uses `node:net`'s `isIP` to tell an IP literal from a name (outside `pure/`, so `node:net` is fine here).
3. `createLiveFetchPage(options)`: one `AbortController`/timer for the whole call (the 10s deadline is total, not per-hop), a loop over at most `maxRedirects` redirects that on every hop re-checks `isAllowedTarget` and (for a literal) `isPublicAddress`, calls the injected `transport` with the guarded lookup and fixed headers (User-Agent/Accept/Accept-Language, no Cookie/Authorization), maps 3xx+Location to the next hop, otherwise maps status via `errorForStatus`, then Content-Type (text/html or application/xhtml+xml only, else `not-a-recipe` without reading the body), then reads the body capped at `maxBytes` and decodes with `TextDecoder(charset)` (from Content-Type, falling back to utf-8, same for an unsupported label). Every catch path returns `{kind:"'failed'", error:"'unreachable'"}` with no URL in any value; the function itself never throws.
4. Default `resolve` (`node:dns/promises` `lookup(host,{all:true})`) and default `transport` (`node:http`/`node:https` `request` with `agent:false`, the guarded lookup, the shared signal, no automatic redirects) last; exercised only by typecheck here, per the task description (the real network path is proved in orch-proof-function).
5. `fetch-page.test.ts`: `createGuardedLookup` cases (AC#2); stub-transport cases for every row in AC#3 and the header/lookup assertions in AC#4.
6. Run the unit vitest project scoped to providers-server, then repo-wide typecheck, then the full check runner; record each acceptance criterion's proof in the task notes with --append-notes.

### Risks
- The redirect-count-vs-"more than 5" boundary and the single shared deadline (not per-hop) must match AC#3 exactly; a test for each row guards it.
- URL.hostname keeps brackets around an IPv6 literal (noted by TASK-74.4.3); literalAddress must strip them (and a zone id) before calling isPublicAddress, which judges a bare address.
- Stay inside packages/providers-server/src/recipe/fetch-page.ts and its test; no change to the pure/ files, tools/checks/*, or the contract. A needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
- fetch-page.test.ts green for every row named in AC#2, AC#3 and AC#4, including the exported-shape check (AC#1) and a message-shape assertion that no returned or thrown value contains a URL (AC#5).
- mise exec -- pnpm exec vitest run --project unit packages/providers- and mise exec -- pnpm -s typecheck both green; the check runner reports no findings for the new files.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation

packages/providers-server/src/recipe/fetch-page.ts (new), with packages/providers-server/src/recipe/fetch-page.test.ts beside it, per contract TASK-74 §10. Imports only @grocs/core and the existing pure/ files (address.ts, status.ts) from TASK-74.4.4's dependency TASK-74.4.3 - no change made to pure/ or to tools/checks/*.

- createGuardedLookup(resolve): a node:net LookupFunction. Every call re-resolves with the injected ResolveHost and refuses (callback with an Error coded EBLOCKED, no hostname in its message) unless every answer passes isPublicAddress; otherwise hands back all addresses (options.all) or the first with its family.
- createLiveFetchPage(options): one AbortController/timer for the whole call (contract: "one deadline across all hops"), a loop of at most maxRedirects redirects. Each hop re-checks isAllowedTarget and, for an IP-literal host, isPublicAddress directly (bracket and zone-id stripped first - the gap TASK-74.4.3's notes flagged for this task), calls the injected transport with the guarded lookup and the fixed header set (User-Agent/Accept/Accept-Language only, no Cookie/Authorization), maps a 3xx+Location to the next hop, otherwise maps status via errorForStatus, then Content-Type (text/html or application/xhtml+xml only, else not-a-recipe without reading the body), then reads the body capped at maxBytes and decodes with TextDecoder(charset) from Content-Type, falling back to utf-8 for a missing or unrecognised label. Every failure path returns {kind:"'failed', error:"'unreachable'"} or the mapped error, never a message, and the function never throws.
- Default resolve (node:dns/promises lookup(host,{all:true})) and default transport (node:http/https request, agent:false, the guarded lookup, the shared signal, no automatic redirects) are wired but exercised only by typecheck here; the real network path is proved later in orch-proof-function, per the task description.

Scope note: contract §10 lists createLiveFetchPage/createGuardedLookup among packages/providers-server/src/index.ts's eventual exports, but this task's AC#1 and modified-files list name only fetch-page.ts/.test.ts, and index.ts today exports only kitchen-store.ts (the recipe cache and importRecipe this file feeds do not exist yet). Re-exporting from index.ts is left to the task that actually wires these in (TASK-74.4.5 onward); no index.ts change made here.

## Proof

AC#1 (exports as in contract §10): fetch-page.ts exports FetchedPage, FetchPage, ResolveHost, createGuardedLookup, RawResponse, Transport, LiveFetchOptions, createLiveFetchPage; typechecks repo-wide under strict mode, confirming the type shapes match contract §10's block.

AC#2 (createGuardedLookup, 4 tests in the "createGuardedLookup" describe block): public answer passed through with its family; a resolve stub answering public then 127.0.0.1 on successive calls makes the second lookup error EBLOCKED (rebinding refused); any non-public address among several refused; options.all hands back every address.

AC#3 (createLiveFetchPage with a stub transport, 20 tests): 200 text/html -> page; 404 -> not-found; 403 -> blocked; 500 -> unreachable; application/pdf -> not-a-recipe with the body never iterated (tracked flag); a body over maxBytes -> unreachable; windows-1252 charset decodes correctly (café); a redirect to a private IPv4 literal (127.0.0.1) and to a bracketed private IPv6 literal ([::1]) both refused as unreachable, the redirect target never connected to; a redirect to a non-default port (8443) refused as unreachable; more than 5 redirects -> unreachable, exactly 5 redirects -> page; the total deadline across two slow hops (40ms each, 60ms shared deadline) -> unreachable, with an assertion that the second hop really was attempted (hop===2) so a per-hop-timer regression would fail this test; a stub transport that throws -> unreachable with no URL text in the returned result (JSON-stringified check); a direct private IP-literal host (bracketed and unbracketed) refused with no transport call at all; a public IP-literal host (v4 and bracketed v6) allowed.

AC#4 (headers and lookup, 1 test): the stub transport's init.headers has exactly the keys [Accept, Accept-Language, User-Agent] (no Cookie, no Authorization, and no silently-added header), and init.lookup is asserted to be the real guarded lookup by calling it with a resolve stub queued to answer private and checking it refuses (EBLOCKED).

AC#5 (no URL in any thrown or returned message): FetchedPage's failed variant carries only a fixed RecipeImportError string, never a message field, so no test path can leak a URL through it; one test additionally makes the stub transport throw an Error containing a URL and asserts the returned result (JSON-stringified) does not contain it.

$ mise exec -- pnpm exec vitest run --project unit packages/providers-server/src/recipe/fetch-page.test.ts
 Test Files  1 passed (1)
      Tests  24 passed (24)

$ mise exec -- pnpm exec vitest run --project unit packages/providers-
 Test Files  12 passed (12)
      Tests  203 passed (203)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no output, exit 0)

$ mise exec -- node tools/checks/run.ts --mode staged   (fetch-page.ts/.test.ts staged)
checks passed (16 checks, staged mode, 683 ms)

$ mise exec -- node tools/checks/run.ts   (whole repo, all mode)
checks passed (16 checks, all mode, 482 ms)

Review follow-up (address review findings):

1. BLOCKING - userinfo on a redirect hop (fixed). Added `if (current.username !== '' || current.password !== '') return failed('unreachable');` to the per-hop guard in fetch-page.ts, right after isAllowedTarget, so it applies on every hop including the first. Added a stub-transport test: a 302 to `https://user:pass@other.example.com/x` (a different host than the start URL, so the fix is proven by the result, not only the call count) gives `{kind:'failed', error:'unreachable'}` and the transport is called once. Verified red-without-fix: temporarily removed the guard line and reran just that test - it failed with `calls` length 6 (redirect-looped to maxRedirects instead of refusing), confirming the test catches the regression. Restored the fix and reran the full suite green.

2. RECOMMENDED - resource leak (fixed). `controller.abort()` now runs in the `finally` after `clearTimeout(timer)`, so every request this call started (an open redirect hop, or a response body never fully read because of a non-HTML Content-Type or the maxBytes cap) is destroyed at the end of the call instead of waiting on the remote end. Also added `if (controller.signal.aborted) return failed('unreachable')` right after the body-read loop, so a transport/body that ignores the abort signal still can't slip the deadline past the caller. Did not additionally release each earlier redirect hop's response as soon as a later hop starts (the reviewer's "also consider"): the end-of-call abort already bounds the leak to the lifetime of one fetchPage() call, and releasing hop-by-hop would add complexity for a 5-hop-max chain inside a 10s deadline. Also attached a no-op `res.on('error', () => {})` in the default transport: the abort can land after a body is no longer being iterated (unread redirect/non-HTML body), and an 'error' event with no listener on an already-settled stream would otherwise surface as an unhandled exception unrelated to the actual fetch outcome; the for-await loop's own try/catch still handles an in-flight body error normally.

3. NOTE - header case (documented, not blocking). Added a doc comment on RawResponse.headers: "Keys are lowercase (as node:http/https already deliver them); the fetcher looks up 'location' and 'content-type' verbatim."

Checks after the fixes:
- `mise exec -- pnpm exec vitest run --project unit packages/providers-` -> Test Files 12 passed (12), Tests 204 passed (204)
- `mise exec -- pnpm -s typecheck` -> passes with no output (tsc --noEmit clean)

Files touched: packages/providers-server/src/recipe/fetch-page.ts, packages/providers-server/src/recipe/fetch-page.test.ts

Closed by philosophy:reviewer. All 5 ACs met: exports match contract §10; fetch-page.test.ts 25/25 green on main 6b10c7c (re-run here) covering every AC#2/#3/#4 row; typecheck clean, pnpm check 16 checks pass, unit 2018 pass (orchestrator). Layer review findings (userinfo on redirect hop, abort leak, header case) fixed in 93f56fa. Non-blocking: index.ts re-export of createLiveFetchPage/createGuardedLookup deferred to TASK-74.4.5 onward per notes; default node transport unexercised until orch-proof-function (TASK-74.4.8). No drafts filed.
<!-- SECTION:NOTES:END -->
