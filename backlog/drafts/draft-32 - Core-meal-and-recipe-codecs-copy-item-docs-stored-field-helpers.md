---
id: DRAFT-32
title: 'Core: meal and recipe codecs copy item-doc''s stored-field helpers'
status: Draft
assignee: []
created_date: '2026-11-08 21:00'
labels:
  - layer-core
  - size-1
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in TASK-1.22.10's review. packages/core/src/schema/meal-doc.ts and recipe-doc.ts each hold their own copies of toStored, readStamp, readField and similar helpers from item-doc.ts. A copy can drift: the aisle provider's inline decoder had already drifted from readStamp, accepting an empty by and a non-finite at.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 meal-doc.ts and recipe-doc.ts import those helpers rather than repeating them, with behaviour unchanged by their existing tests
<!-- AC:END -->
