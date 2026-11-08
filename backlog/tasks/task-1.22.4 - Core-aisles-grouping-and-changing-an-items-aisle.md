---
id: TASK-1.22.4
title: 'Core: aisles, grouping and changing an item''s aisle'
status: In Progress
assignee:
  - '@builder-core'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 20:32'
labels:
  - layer-core
  - size-2
dependencies: []
modified_files:
  - packages/core/src/model/aisle.ts
  - packages/core/src/model/aisle.test.ts
  - packages/core/src/index.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R9, R11. See TASK-1.22's slice contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 core exports AISLES, aisleSection, groupByAisle, aisleNameKey and setItemAisle as the contract says, with unit tests including an unknown aisle grouping as other
- [ ] #2 setItemAisle's stamp merges by the existing last-write-wins rule
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add packages/core/src/model/aisle.ts: AISLE_DEFS as a const-literal array (as const satisfies), AisleId derived from it so the id list cannot drift from AISLES, AisleDef, AISLES, aisleSection (unknown -> other), groupByAisle (returns AisleGroup[] in AISLES order, empty aisles left out), aisleNameKey (encodeURIComponent(normaliseName(name))), setItemAisle (plain restamp of the aisle field, matching setItemState/clearFromCart; two copies reconcile via mergeItem's existing last-write-wins rule, not inside the mutator).
2. Export the new names from packages/core/src/index.ts, grouped with the other model/item exports.
3. Unit tests in aisle.test.ts: AISLES order/labels, aisleSection for known and unknown ids, groupByAisle (order, empty aisles omitted, an unknown aisle grouped together with other as one other section in input order, empty input), aisleNameKey normalisation, setItemAisle (restamps only the aisle while id/weekId/addedBy/createdAt/name/amount/state/badges/deleted and the original item are all asserted unchanged; mergeItem keeps the later stamp's aisle in both merge orders, proving AC2's last-write-wins rule).
4. Run unit tests, pnpm check, pnpm typecheck.

### Risks
- No "other" aisle icon exists yet in packages/ui/src/icons; out of scope for core, noted for the UI/app subtasks that render labels.

### Proof
pnpm exec vitest run --project unit packages/core; pnpm check; pnpm typecheck.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented packages/core/src/model/aisle.ts: AISLES (ordered produce/dairy/meat/bakery/pantry/other, ids matching the existing section icon names), AisleId, AisleDef, aisleSection (unknown -> other), groupByAisle (AISLES order, empty aisles omitted), aisleNameKey, setItemAisle. Exported from packages/core/src/index.ts.

Plan note: an advisor review caught that setItemAisle's first draft used mergeStamped against the item's own current value inside the mutator, which silently no-ops on a stale stamp instead of restamping — inconsistent with setItemState/clearFromCart and with the contract's "SetItemAisle... stamps the item." Fixed to a plain restamp (stamped(aisle, stamp)); AC2's "merges by the existing last-write-wins rule" is proven via mergeItem reconciling two copies, mirroring item.test.ts's existing state test shape.

Evidence:
$ mise exec -- pnpm exec vitest run --project unit packages/core
 Test Files  17 passed (17)
      Tests  159 passed (159)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no errors)

$ mise exec -- pnpm check
checks passed (16 checks, all mode, 653 ms)

Note for the reviewer/UI subtasks: no "other" aisle icon exists yet in packages/ui/src/icons (only produce, dairy, meat, bakery, pantry); out of scope for core, flagging for whichever UI/app subtask renders aisle labels.

Files: packages/core/src/model/aisle.ts, packages/core/src/model/aisle.test.ts, packages/core/src/index.ts.

Addressed layer-review follow-ups:
1. The setItemAisle test now asserts id, weekId, addedBy, createdAt, name, amount, state, badges and deleted all unchanged, plus that the original item's aisle is untouched (previously it skipped weekId/addedBy/createdAt and never checked the original).
2. groupByAisle's unknown-aisle test now puts a 'household' item and an explicit 'other' item together and asserts one 'other' section with both, in input order.
3. The task plan is corrected via this edit: it no longer describes mergeStamped inside setItemAisle or the older-stamp-no-op / same-stamp tests, none of which exist in the final code.
4. AisleSection renamed to AisleGroup (it only differed from the aisleSection function by case).
5. AisleId is now derived from an `as const satisfies` literal array (AISLE_DEFS) instead of a separate union annotation, so AISLES and AisleId cannot drift. The aisle exports in packages/core/src/index.ts moved to sit with the other model/item exports instead of between the merge/* exports.

Re-ran checks after all five fixes:
$ mise exec -- pnpm exec vitest run --project unit packages/core
 Test Files  17 passed (17)
      Tests  159 passed (159)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no errors)

$ mise exec -- pnpm check
checks passed (16 checks, all mode, 442 ms)
<!-- SECTION:NOTES:END -->
