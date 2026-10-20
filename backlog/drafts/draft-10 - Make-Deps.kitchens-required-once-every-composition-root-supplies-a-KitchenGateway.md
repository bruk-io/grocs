---
id: DRAFT-10
title: >-
  Make Deps.kitchens required once every composition root supplies a
  KitchenGateway
status: Draft
assignee: []
created_date: '2026-10-20 05:02'
labels:
  - size-1
  - layer-application
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the TASK-1.20.1 review. Deps.kitchens is optional in packages/application/src/dispatch/types.ts because apps/mobile's compose-app, compose-firebase and compose-demo did not supply a gateway and would not typecheck. Both kitchen commands carry a kitchens-unavailable branch and instrumentDeps spreads kitchens conditionally only because of that. Waits on TASK-1.20.2 supplying FirebaseKitchenGateway or MemoryKitchenGateway in every root. Risk while optional: a root that forgets the gateway compiles and fails at runtime.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Deps.kitchens is required and every composition root typechecks with a gateway supplied
- [ ] #2 The kitchens-unavailable branches, the conditional spread in instrumentDeps, and the kitchens: null test option and its two scenario tests are removed
<!-- AC:END -->
