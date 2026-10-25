---
id: TASK-1.22.2
title: 'Application: AddItem can carry an optional mealId'
status: To Do
assignee:
  - '@claude'
created_date: '2026-10-25 01:22'
updated_date: '2026-10-25 01:23'
labels:
  - layer-application
  - size-1
dependencies:
  - TASK-1.22.1
modified_files:
  - packages/application/src/commands/add-item.ts
  - packages/application/src/commands/add-item.scenario.test.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Depends on TASK-1.22.1 (core: createExtraItem/NewItemInput gain optional badges). Threads a mealId through the application command so the already-built core capability is actually reachable.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 AddItem gains an optional mealId: string; when present, the created item's badges field is [mealId]; when absent, behavior is exactly today's (badges: [])
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Delivers R10 (an item can be added as an extra, or for a meal of that week, carrying that meal's badge).

### Order of work
1. In packages/application/src/commands/add-item.ts: add `readonly mealId?: string;` to the AddItem interface (alongside the existing optional `amount`/`aisle` fields), with a one-line doc comment ("The meal this item is for, if any - absent means an extra.").
2. In addItem's call to createExtraItem, add `...(command.mealId !== undefined ? { badges: [command.mealId] } : {})` to the input object, matching the existing conditional-spread pattern already used there for `amount`/`aisle`.
3. Update the file's own doc comment (currently "Add an extra item (no meal) to a week's grocery list (R10).") to say it also covers the meal case now.
4. In packages/application/src/commands/add-item.scenario.test.ts, add one scenario: dispatching AddItem with a mealId produces an item whose badges include that mealId (read back via the fake SyncStore); keep the existing no-mealId scenario's assertion that badges is empty as the regression guard.
5. Run `pnpm exec vitest run --project unit packages/application` and `pnpm -s typecheck` to confirm both pass.

### Risks
- None beyond TASK-1.22.1's own: this is a thin, additive pass-through with no new decision logic (R25 - the decision of what a badge means stays in core's createExtraItem, this just forwards the caller's input).

### Proof
- pnpm exec vitest run --project unit packages/application passes, including the new scenario.
- pnpm -s typecheck passes.
<!-- SECTION:PLAN:END -->
