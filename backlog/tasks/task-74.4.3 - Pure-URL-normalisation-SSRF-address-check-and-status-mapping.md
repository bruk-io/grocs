---
id: TASK-74.4.3
title: 'Pure URL normalisation, SSRF address check and status mapping'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:15'
labels:
  - size-3
  - layer-providers
dependencies:
  - TASK-74.3.1
  - TASK-74.3.2
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §9: normaliseRecipeUrl (the exact algorithm), isPublicAddress (the full deny list, failing closed, with hand-parsed IPv6, because pure/ cannot import node:net), isAllowedTarget and errorForStatus, all in pure/ (decision-15's exception; cite it). Hashing and DNS stay out of pure/. normaliseRecipeUrl's output is hashed into recipeId and matched exactly by recipeForLink, so it follows the contract's steps literally. Covers TASK-74.4 AC#2 (canonical-URL key: tracking parameters make no duplicates) and AC#1 (public pages only), plus decision-15's SSRF and status table.

Split key: providers-url-guard. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 normaliseRecipeUrl implements contract §9 steps 1-7 exactly. normalise-url.test.ts has a golden table of at least 10 input/output pairs, including: 'https://x.com/' → 'https://x.com'; uppercase host; utm_Source and fbclid dropped; parameter order sorted; '%20' kept as written; fragment dropped; 'ftp://x' and 'https://u:p@x.com' → invalid-url; non-default port kept. It also shows idempotence and that the output passes core relinkMeal
- [ ] #2 isPublicAddress returns false for every range listed in contract §9 and for unparseable input. Table tests cover compressed IPv6, a zone id (fe80::1%eth0), IPv4-mapped in dotted (::ffff:127.0.0.1) and hex (::ffff:7f00:1) form, NAT64, 6to4, 0.1.2.3, 198.18.0.1, 224.0.0.1 and 255.255.255.255. It returns true for public v4 (e.g. 93.184.216.34) and v6 (e.g. 2606:4700::1)
- [ ] #3 isAllowedTarget allows only http/https on ports '', '80' and '443'
- [ ] #4 errorForStatus maps per decision-15's table (404/410 not-found; 401/403/429 blocked; other non-2xx unreachable; 2xx null)
- [ ] #5 Pure-folder, core-purity and test-presence pass. At this commit, pnpm -s typecheck passes repo-wide and the unit tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write the golden table, then normaliseRecipeUrl.
2. Write the address tables, then an IPv4/IPv6 parser and the range checks.
3. Write isAllowedTarget and errorForStatus with their tables.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-server/src/recipe/pure/normalise-url.ts
- packages/providers-server/src/recipe/pure/normalise-url.test.ts
- packages/providers-server/src/recipe/pure/address.ts
- packages/providers-server/src/recipe/pure/address.test.ts
- packages/providers-server/src/recipe/pure/status.ts
- packages/providers-server/src/recipe/pure/status.test.ts
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Review findings addressed (TASK-74.4.3, round 2)

Finding 1 (address.test.ts port coverage) — fixed. The two "explicit port"
tests used `http://x.com:80/path` and `https://x.com:443/path`, both
default-port-for-scheme, so WHATWG strips the port and `url.port === ''`
duplicates the default-port tests above. Added two cross-scheme cases that
actually reach the `'80'`/`'443'` branches of isAllowedTarget:
- `https://x.com:80/path` -> true, url.port === '80' (verified with
  `new URL(...).port`)
- `http://x.com:443/path` -> true, url.port === '443' (verified likewise)
Also added `https://x.com:8080/path` -> false next to the existing 8443 case.
Renamed the original two tests to note they're the default-port (stripped)
cases, to avoid the same ambiguity recurring.

Finding 2 (idempotence conflict in TASK-74's contract §9, double slash:
`https://x.com//` normalising twice gives a different result than once) —
not actioned here, as instructed: this is a frozen-contract conflict for
the contract owner / decision-3 mediation, not a providers-layer fix. No
change made to normalise-url.ts or its tests for this finding.

## Checks rerun after the fix
- `pnpm exec vitest run --project unit packages/providers-`: 10 test files,
  151 tests passed (includes the new address.test.ts cases).
- `pnpm -s typecheck`: exit 0, no errors.
<!-- SECTION:NOTES:END -->
