---
id: TASK-74.4.11
title: >-
  The live fetcher can't read gzip-compressed pages, so NYT Cooking imports as
  not-a-recipe
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 05:06'
updated_date: '2026-11-07 05:12'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In packages/providers-server/src/recipe/fetch-page.ts: add Accept-Encoding: gzip, deflate, br to REQUEST_HEADERS.
2. Replace the raw body-read loop with a decoder that: reads Content-Encoding (gzip/x-gzip, deflate, br, or empty/identity -> no transform; anything else -> unreachable without reading further), streams the raw bytes through node:zlib's createGunzip/createInflate/createBrotliDecompress via stream/promises pipeline, counts both the raw (compressed) bytes consumed and the decompressed bytes produced, and aborts (destroying the pipeline, so it stops asking for more input) the moment either total exceeds maxBytes - never buffering a fully inflated oversized body.
3. Charset decoding (decode) runs on the decompressed bytes exactly as before; identity/no-encoding path behaves exactly as today (same bytes, same cap).
4. Update fetch-page.test.ts: existing exact-header-set test gains Accept-Encoding; add cases for gzip, deflate, br bodies decoding correctly, an unknown Content-Encoding giving unreachable, and a small gzip body that decompresses past maxBytes giving unreachable (built from a large run of repeating bytes so the compressed input stays tiny while the decompressed size is large, proving the cap is enforced without fully inflating).
5. Run providers unit tests and typecheck for this layer; paste output into the task notes.

### Risks
- Node's zlib transform streams are inherently async (thread pool); coordinating early-abort through stream/promises pipeline must actually stop pulling more compressed bytes once the writable rejects - verified via the oversized-gzip-bomb test using a large decompressed size.
- Must not regress the existing identity-path tests (non-HTML body never iterated, maxBytes on compressed bytes, windows-1252 charset, redirect/timeout behaviour) - keep passthrough for identity encoding byte-for-byte.
- Scope is providers-only (fetch-page.ts + its test); no changes to ports/core/application/app layers.

### Proof
- mise exec -- pnpm exec vitest run --project unit packages/providers- green, including new gzip/deflate/br/unknown/oversized-inflation cases.
- mise exec -- pnpm -s typecheck clean.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
TASK-74.4.11 (providers): createLiveFetchPage now sends Accept-Encoding: gzip, deflate, br and decodes the body per Content-Encoding (gzip/x-gzip via createGunzip, deflate via createInflate, br via createBrotliDecompress, empty/identity as a byte-for-byte passthrough) before charset decoding; an unknown encoding returns unreachable before a single body byte is read. Decompression streams through node:stream/promises pipeline with a Writable that counts decompressed bytes and errors past maxBytes, and the compressed source itself is capped the same way, so the pipeline is torn down (and no more compressed bytes are pulled) the moment either total is exceeded - proved by fetch-page.test.ts's gzip-bomb case, which splits a 20 MB-decompressed payload into hundreds of small chunks and asserts fewer than half are ever pulled before the cap fires, plus a second case capping the raw (still-compressed) gzip bytes directly.

fetch-page.test.ts gained: gzip/deflate/br round-trip decode cases, an unknown-Content-Encoding case (asserts the body is never iterated), the gzip-bomb early-abort case, and a raw-compressed-bytes-over-maxBytes case; the existing exact-header-set test now expects the fourth header.

Checks run (this layer only, per the agent's narrowed Bash):
- mise exec -- pnpm exec vitest run --project unit packages/providers- -> Test Files 17 passed (17), Tests 300 passed (300)
- mise exec -- pnpm -s typecheck -> tsc --noEmit, exit 0

Contract divergence to record (not blocking, per decision-3): TASK-74 contract §10 lists only 'browser-like User-Agent, Accept and Accept-Language' and says 'A body over maxBytes -> unreachable' with no mention of Accept-Encoding or Content-Encoding decoding. This task's ACs required both; §10 now understates the fetcher by one header (Accept-Encoding: gzip, deflate, br) and should also say the maxBytes cap applies to the decompressed size as well as the compressed bytes read. Suggest a §10 amendment note (same pattern as TASK-74.4.1/TASK-74.4.6) rather than a contract change request, since the orchestrator already owns reconciling built-vs-written here.

Known limitation (not in scope, noting for the record): createInflate expects a zlib-wrapped deflate stream (RFC 1950); some servers send raw DEFLATE (RFC 1951) despite the Content-Encoding: deflate name. AC#1 names 'deflate' and the zlib-wrapped case is the one fetch-page.test.ts proves; a raw-deflate server would still fail as unreachable today.
<!-- SECTION:NOTES:END -->
