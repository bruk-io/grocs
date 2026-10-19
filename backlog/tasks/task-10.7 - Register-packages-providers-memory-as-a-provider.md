---
id: TASK-10.7
title: Register packages/providers-memory as a provider
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 15:52'
updated_date: '2026-10-19 15:53'
labels:
  - size-1
dependencies: []
references:
  - >-
    backlog/decisions/decision-12 -
    Demo-build-an-in-memory-provider-package-not-the-test-fakes.md
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Before the in-memory provider is built (decision-12), the repo has to know the package is a provider: the import-layers layer map, the providers agent config (and regenerated agents), and doc-1's repository layout.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 import-layers maps providers-memory to the providers layer, so providers-isolated and allowed-imports apply to it, with a test
- [ ] #2 The providers agent config covers packages/providers-memory/**, the agents are regenerated, and pnpm check's agent-definitions check passes
- [ ] #3 doc-1's repository layout lists packages/providers-memory and what it is for
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Map providers-memory to the providers layer in tools/checks/import-layers.ts with a test; add packages/providers-memory/** to tools/agents/configs/providers.json and regenerate the agents; add the package to doc-1's repository layout.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator (Oct 19, 2026). import-layers: PACKAGE_LAYER maps providers-memory to providers; a new test shows it may import ports and core, is refused another provider (providers-isolated) and the test fakes (testing-entry-test-only). 18/18 import-layers tests pass. providers.json covers the package; pnpm agents:generate rewrote the three providers agents. doc-1's layout lists the package (one line); TASK-1 marked finish-moved for the spec change.
<!-- SECTION:NOTES:END -->
