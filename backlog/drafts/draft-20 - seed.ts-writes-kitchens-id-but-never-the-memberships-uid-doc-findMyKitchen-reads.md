---
id: DRAFT-20
title: >-
  seed.ts writes kitchens/{id} but never the memberships/{uid} doc findMyKitchen
  reads
status: Draft
assignee: []
created_date: '2026-10-23 03:52'
labels: []
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found while end-to-end testing the real (non-demo) app against \`pnpm emulators\` on an Android emulator, using the dev test sign-in (apps/mobile/src/dev/index.ts).

firebase/seed/seed.ts writes only \`kitchens/{seedKitchen.id}\` with a \`members\` array. packages/providers-server/src/kitchen-store.ts's \`findKitchenForUid\` (called by the \`findMyKitchen\` callable) reads \`memberships/{uid}\`, which the seed script never writes. The real createKitchen/joinKitchen functions write both docs atomically (confirmed in kitchen-store.ts), so this only affects manual testing: anyone signing in against \`pnpm emulators\` with a seeded test account currently finds no kitchen, even though \`kitchens/seed-kitchen\` already lists them as a member.

The committed automated suites (e.g. packages/providers-firebase/src/kitchen-gateway.emulator.test.ts) don't catch this because they create their own kitchens through \`createKitchen\`, not through seed.ts's fixture.

## Affected users and systems
firebase/seed/seed.ts, firebase/seed/data.ts; anyone manually testing the real app against \`pnpm emulators\`.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Signing in as a seeded account (bruk@grocs.test or sam@grocs.test) against pnpm emulators lands on the seeded kitchen's Groceries screen, not a not-found state
<!-- AC:END -->
