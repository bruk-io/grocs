---
id: TASK-1.22.11
title: 'UI: the row''s press hint is a separate stop for VoiceOver'
status: To Do
assignee:
  - '@builder-ui'
created_date: '2026-11-08 22:09'
updated_date: '2026-11-08 22:09'
labels:
  - layer-ui
  - size-1
dependencies: []
modified_files:
  - packages/ui/src/molecules/ItemRow.tsx
  - packages/ui/src/molecules/ItemRow.test.tsx
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Seen in TASK-1.22's live proof on the iOS simulator: Maestro's accessibility tree shows 'Change the aisle' as its own element at 1x1 on every pressable row, from the visually hidden Text that ItemRow keeps for web's aria-describedby. VoiceOver would stop on it. Cites R42.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On native, a pressable row's hint is only accessibilityHint, with no separate accessibility element, and on web aria-describedby still names the hint, with a behaviour test and visual still passing
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In packages/ui/src/molecules/ItemRow.tsx, render the visually hidden hint Text only when Platform.OS === 'web', and set aria-describedby only then. Keep accessibilityHint for native.
2. In ItemRow.test.tsx, keep a test that web exposes the description, and add one with Platform.OS mocked to 'ios' asserting the hint element is absent and accessibilityHint is set, following how packages/ui tests already mock Platform if they do; otherwise stop and report.
3. Run vitest --project ui for ItemRow, pnpm check, pnpm typecheck, pnpm --filter @grocs/ui build-storybook and pnpm --filter @grocs/ui visual -- --no-build.

### Risks
- A hidden element at 1x1 may be in existing baselines; web keeps it, so they must not change.

### Proof
- The test, plus rerunning the orchestrator's accessibility tree check on the simulator.
<!-- SECTION:PLAN:END -->
