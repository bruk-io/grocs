---
id: TASK-74.4.11
title: >-
  The live fetcher can't read gzip-compressed pages, so NYT Cooking imports as
  not-a-recipe
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 05:06'
updated_date: '2026-11-07 05:27'
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

Review-requested fixes applied to fetch-page.test.ts (providers layer, bug follow-up):

1. Decoded-cap isolation: 'gives unreachable for a gzip body that decompresses past maxBytes, isolated from the raw-bytes cap' now uses maxBytes: 100_000 (above the ~20406-byte compressed fixture, well below the 20 MB decompressed size), with `expect(compressed.byteLength).toBeLessThan(maxBytes)` as a precondition so only the decoded-size counter can ever trip. Confirmed by deleting the `decodedTotal > maxBytes` branch in readDecodedBody: the test goes red (gives `{ kind: 'page', html: 'aaa...' }` instead of the expected failure), then restored it and reran - green again.

2. Replaced the `pulled < chunks.length / 2` assertion (which only ever passed because the fixture's 20406 compressed bytes fit entirely inside the pipeline's internal buffers before the cap fired - the raw cap tripped at chunk 16 of 319, not the decoded one) with a new test, 'caps a gzip bomb early: does not pull anywhere near every compressed chunk before refusing it'. It builds its compressed source lazily (one independently-gzipped 10 KB member at a time, via gzipSync per member, concatenated gzip members decode fine under node's createGunzip), representing a 2 GB decompressed total (~209,716 members) without ever materialising more than what's pulled. `pulled` is asserted to be far under 1/1000 of the potential total; observed in practice 22-1426 of 209,716 depending on which cap fires first, always orders of magnitude below the total. This is a true early-abort proof regardless of fixture size, since nothing past the cap is ever computed.

3. Raw-cap isolation: 'gives unreachable when the compressed (raw) body itself exceeds maxBytes, isolated from the decoded-size cap' now gzips with `{ level: 0 }` so the compressed form (178 bytes) is bigger than the decoded form (155 bytes), and sets maxBytes: 160 (between the two), so only the raw-bytes counter can trip. Confirmed by deleting the `rawTotal > maxBytes` throw: the test goes red, then restored and reran - green.

Checks after the fixes (this layer only, per the agent's narrowed Bash):
- mise exec -- pnpm exec vitest run --project unit packages/providers-server/src/recipe/fetch-page.test.ts -> Test Files 1 passed (1), Tests 32 passed (32)
- mise exec -- pnpm exec vitest run --project unit packages/providers- -> Test Files 17 passed (17), Tests 301 passed (301)
- mise exec -- pnpm -s typecheck -> tsc --noEmit, exit 0

Correction to the earlier implementation notes: the claim that the gzip-bomb case "proves the cap fires early because fewer than half the chunks are pulled" was wrong - that fixture's compressed size (20406 bytes) was small enough to fit entirely in the pipeline's stream buffers before either cap could fire, so the old assertion passed on buffering alone, not on early abort. Each cap (raw-bytes and decoded-size) is now proven by its own isolated test, each confirmed by deleting its branch in readDecodedBody and seeing the matching test go red; the early-abort/laziness property (not fully inflating a bomb) is proven separately by a lazily-generated source large enough that internal stream buffering cannot account for the small fraction pulled.

Left to the orchestrator (not blocking, carried from the prior notes): (1) contract §10 amendment for the Accept-Encoding header and the decompressed-size cap, following the TASK-74.4.1/74.4.6 precedent; (2) the raw-DEFLATE (RFC 1951) limitation and the refusal of multi-value Content-Encoding (e.g. 'br, gzip') as unreachable remain acceptable under AC#1's wording and could be filed as follow-up drafts if a real site needs them.

Second round of review-requested fixes applied to fetch-page.test.ts (providers layer, bug follow-up):

1. The 'caps a gzip bomb early' test was itself a raw-cap test, not a decoded-cap one. With its
   committed parameters (10 KiB members, maxBytes: 1000), each member gzips to ~46 bytes, so the
   raw-bytes counter trips at member 22 (22 x 46 = 1012 > 1000) before the decoded counter ever
   reaches 1000 decoded bytes - the same arithmetic on every run, not fixture noise. A scratch
   reproduction of readDecodedBody's exact pipeline confirmed pulled=22 and 'refused: raw' both
   with the `decodedTotal > maxBytes` branch present and with it deleted, so the test passed
   either way and proved nothing about the decoded cap specifically.

   Re-parameterized to 1 MiB members (gzip to ~1052 compressed bytes each) and maxBytes: 1_000_000,
   renamed to 'caps a gzip bomb early via the decoded-size cap, isolated from the raw-bytes cap'.
   Measured directly against this codebase's readDecodedBody (not a reimplementation): with the
   `decodedTotal > maxBytes` branch present, pulled=64; with it deleted, pulled=951 (the raw cap
   alone, tripping once rawTotal, ~1052 bytes/member, exceeds 1,000,000 around member 951). Three
   runs gave the same two numbers. The test now asserts
   `pulled * memberCompressedBytes < maxBytes / 4`, i.e. the compressed bytes actually pulled so
   far are nowhere near maxBytes, which is only true when the decoded cap (not the raw cap) is
   what stopped it. Deleting the `decodedTotal > maxBytes` branch makes this assertion fail
   (verified: pulled rises to 951, failing the bound) - confirming the test now depends on that
   branch specifically.

2. Fixed the inverted comments on two other isolation tests ('gives unreachable for a gzip body
   that decompresses past maxBytes...' and 'gives unreachable when the compressed (raw) body
   itself exceeds maxBytes...'), both of which said deleting their guarded branch makes the test
   'go green'. The opposite is true: deleting either branch makes its test fail (go red), which is
   what the earlier notes' own verification runs actually showed. Comments now say 'fails'/'red'
   and describe what the broken pipeline produces instead (a page, not the expected refusal).

Checks after these fixes (this layer only, per the agent's narrowed Bash):
- mise exec -- pnpm exec vitest run --project unit packages/providers-server/src/recipe/fetch-page.test.ts -> Test Files 1 passed (1), Tests 32 passed (32)
- mise exec -- pnpm exec vitest run --project unit packages/providers- -> Test Files 17 passed (17), Tests 301 passed (301)
- mise exec -- pnpm -s typecheck -> tsc --noEmit, exit 0
- Deleting the `decodedTotal > maxBytes` branch: both decoded-cap tests ('gives unreachable for a
  gzip body that decompresses past maxBytes...' and 'caps a gzip bomb early via the decoded-size
  cap...') fail; all other 30 tests still pass.
- Deleting the `rawTotal > maxBytes` throw: only 'gives unreachable when the compressed (raw) body
  itself exceeds maxBytes...' fails; all other 31 tests (including both decoded-cap tests) still
  pass - confirming the decoded-cap tests do not depend on the raw cap.
- Both branches restored afterward; `git diff --stat` on fetch-page.ts shows no changes from this
  investigation.

Correction (supersedes the 'Correction' paragraph in the prior round): that paragraph said the
lazy-source gzip-bomb test was 'a true early-abort proof' of the property generally. With the
parameters committed at the time, it was specifically a proof of the raw cap's early abort, not
the decoded cap's - the notes' own '22-1426 depending on which cap fires first' range was always
22 (the raw cap) under those parameters, since the raw cap could not help but fire first given a
10 KiB member and maxBytes: 1000. After the re-parameterization above (1 MiB members, maxBytes:
1_000_000), this same test is now a true early-abort proof of the decoded cap specifically,
isolated from the raw cap: deleting `decodedTotal > maxBytes` makes it fail as recorded above.
<!-- SECTION:NOTES:END -->
