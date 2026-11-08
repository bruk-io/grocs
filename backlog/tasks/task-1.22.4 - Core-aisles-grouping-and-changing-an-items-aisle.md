---
id: TASK-1.22.4
title: 'Core: aisles, grouping and changing an item''s aisle'
status: In Progress
assignee:
  - '@builder-core'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 20:26'
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
1. Add packages/core/src/model/aisle.ts: AISLES (fixed ordered list with labels matching the existing section icon ids), AisleId, AisleDef, aisleSection (unknown -> other), groupByAisle (sections in AISLES order, empty aisles left out), aisleNameKey (encodeURIComponent(normaliseName(name))), setItemAisle (merges the new stamped value with the item's existing aisle via mergeStamped, so an older stamp never overwrites).
2. Export the new names from packages/core/src/index.ts.
3. Unit tests in aisle.test.ts: AISLES order/labels, aisleSection for known and unknown ids, groupByAisle (order, empty aisles omitted, unknown aisle grouped as other, empty input), aisleNameKey normalisation, setItemAisle (restamps only aisle, later stamp wins, older stamp is a no-op, same stamp twice is idempotent).
4. Run unit tests, pnpm check, pnpm typecheck.

### Risks
- setItemAisle's merge behaviour (via mergeStamped against the item's current stamp, not a bare overwrite like setItemState) is a deliberate reading of AC2 ("merges by the existing last-write-wins rule"); flagging in notes in case review wants the simpler overwrite-and-let-mergeItem-reconcile pattern instead.
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
<!-- SECTION:NOTES:END -->
