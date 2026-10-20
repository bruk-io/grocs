---
id: TASK-27.1
title: 'Kitchen gains memberNames: core domain change'
status: In Progress
assignee:
  - '@builder-core'
created_date: '2026-10-20 22:24'
updated_date: '2026-10-20 22:26'
labels:
  - layer-core
  - size-1
dependencies: []
modified_files:
  - packages/core/src/model/kitchen.ts
  - packages/core/src/model/kitchen.test.ts
parent_task_id: TASK-27
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-27 (the app reads its kitchen's name and members). Kitchen needs to carry each member's display name so the app can show who's in the kitchen without a separate lookup. Design settled on the parent task: no Cloud Function needed, no rules change needed (kitchens/{kitchenId} is already readable by its members) - just a denormalized memberNames map, captured server-side from the caller's ID token at create/join time. This is the pure-domain half: the Kitchen type and the two functions that build/extend it. KITCHEN_SCHEMA_VERSION stays at 1 - nothing validates a Kitchen document against it, unlike item-doc.ts.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Kitchen gains memberNames: Readonly<Record<string, string>> (uid -> display name)
- [ ] #2 createKitchen (NewKitchenInput gains ownerName) seeds memberNames with the owner, and addMember gains a name parameter and adds it to memberNames; both have tests for the new behaviour with no shrink in existing test counts
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In packages/core/src/model/kitchen.ts, add `readonly memberNames: Readonly<Record<string, string>>;` to the Kitchen interface, right after `members`.
2. Add `readonly ownerName: string;` to NewKitchenInput, right after `ownerUid`.
3. In createKitchen, add `memberNames: { [input.ownerUid]: input.ownerName },` to the returned object, alongside the existing `members: [input.ownerUid],` line.
4. Change addMember's signature from `addMember(kitchen: Kitchen, uid: string)` to `addMember(kitchen: Kitchen, uid: string, name: string)`, and change its returned object from `{ ...kitchen, members: [...kitchen.members, uid] }` to `{ ...kitchen, members: [...kitchen.members, uid], memberNames: { ...kitchen.memberNames, [uid]: name } }`.
5. In packages/core/src/model/kitchen.test.ts (or wherever these functions are tested - find it first), update every existing createKitchen/addMember call site to supply the new ownerName/name argument, and update every object literal asserted against a Kitchen shape to include memberNames. Add at least one new test: createKitchen seeds memberNames with the owner's name; addMember adds the joiner's name to memberNames without disturbing the owner's entry. Do not shrink the existing test count - add, do not replace, unless a test is now asserting the exact same thing a new one does.
6. Find every other call site of createKitchen/addMember outside this package (grep the whole repo for 'addMember(' and 'createKitchen(' - packages/providers-server and packages/ports/src/kitchen-gateway/fake.ts and memory-kitchen-gateway.ts are the known ones) and leave them exactly as they are: this task's acceptance criteria are packages/core only, and those callers will not compile until TASK-27.2/27.3 update them in their own tasks. If you find a core-package caller you did not expect, update it; if you find one outside packages/core, leave it and note it in this task's notes rather than editing outside your layer.
7. Run `vitest run --project unit packages/core` and confirm it passes.

### Risks
This task alone leaves packages/ports, packages/providers-server and packages/providers-memory failing to typecheck (they call createKitchen/addMember with the old signature) - expected, not a defect. Whole-repo typecheck is not this task's job; TASK-27.2 and TASK-27.3 fix their own callers. Do not edit outside packages/core to make typecheck pass early.

### Proof
vitest run --project unit packages/core passes, and Kitchen/NewKitchenInput/addMember's signatures match this plan exactly (grep for memberNames and ownerName in kitchen.ts).
<!-- SECTION:PLAN:END -->
