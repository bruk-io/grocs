---
id: TASK-1.22.10
title: 'Core: a versioned codec for the aisle memory document'
status: To Do
assignee:
  - '@builder-core'
created_date: '2026-11-08 20:56'
updated_date: '2026-11-08 20:56'
labels:
  - layer-core
  - size-1
dependencies: []
modified_files:
  - packages/core/src/schema/aisle-doc.ts
  - packages/core/src/schema/aisle-doc.test.ts
  - packages/core/src/index.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From TASK-1.22.6's review. Deciding what a valid stored aisle document is belongs in core, as item-doc.ts says; the provider's inline decoder has drifted from core's readStamp and overwrites a newer-schema document. Cites R30, R54.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/core/src/schema/aisle-doc.ts exports the version, encode and decode of {schemaVersion, aisle: stored stamped value}, with decode returning a Result that tells unsupported-version from malformed, with tests for each branch
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Read packages/core/src/schema/item-doc.ts and its test for the existing helpers (toStored, readField, readStamp, SchemaError, version handling).
2. Create packages/core/src/schema/aisle-doc.ts: AISLE_SCHEMA_VERSION = 1, encodeAisleMemory(aisle: Stamped<string>), decodeAisleMemory(raw): Result<Stamped<string>, SchemaError>, reusing those helpers.
3. Create aisle-doc.test.ts: round trip; unsupported version; missing aisle; empty by; non-finite at.
4. Export the three names from packages/core/src/index.ts.
5. Run vitest for packages/core, pnpm check and pnpm typecheck.

### Risks
- Must reuse core's stored-field helpers, not repeat them.

### Proof
- The new test file, one case per decode branch.
<!-- SECTION:PLAN:END -->
