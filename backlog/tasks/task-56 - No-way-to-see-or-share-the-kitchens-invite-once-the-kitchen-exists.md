---
id: TASK-56
title: No way to see or share the kitchen's invite once the kitchen exists
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 19:50'
updated_date: '2026-11-06 21:12'
labels:
  - size-3
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in the 2026-11-06 device sweep (release builds, Android emulator and iOS simulator). The real invite card shows only on KitchenSetupScreen, once, while the kitchen is being created. Nothing in the app navigates to /household, and HouseholdScreen is still the design mock (inviteCode MOREL-24, you@example.com, 'Waiting for Sam to join'). So a member whose kitchen already exists, Bruk's included, cannot get the invite again, and Shazya cannot join from her phone. Blocks TASK-1.20 AC #2.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A signed-in member can reach their kitchen's real invite link and code from the app after setup
- [ ] #2 The household screen shows the kitchen's real name, members and invite state, with no sample data
- [ ] #3 A partner who opens that link or enters that code on a second device joins the same kitchen
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Finding: invites expire after a day (core INVITE_LIFETIME_MS), so the kitchen's first code is dead for any kitchen older than that, Bruk's included. Showing it again is not enough: the household screen asks for an invite, and the server reuses a pending, unexpired one or issues a fresh one, or answers 'full' (MAX_MEMBERS = 2). Not specified by R2/R3 or the design reference; the smallest behaviour that satisfies them.
1. core (invite.ts): inviteToReuse(invites, now) picks the newest pending, unexpired invite or null; inviteExpiresAt(createdAt). Unit tests.
2. ports (kitchen-gateway): inviteForKitchen(kitchenId): Promise<KitchenInvite>, KitchenInvite = { kind: 'open', code, expiresAt } | { kind: 'full' }. Fake + contract cases (reuse, renew after expiry, full, non-member refused).
3. providers-server: KitchenStore.inviteForKitchen(kitchenId, callerUid) in a transaction, decisions from core; functions: onCall inviteForKitchen. Emulator tests.
4. providers-firebase: callable client; providers-memory: same over its maps.
5. application: query getKitchenInvite; App exposes it and getKitchenInfo (built in TASK-27, never wired).
6. ui: HouseholdTemplate (kitchen name, members, InviteCard or a full status), stories per state, behaviour test.
7. app: HouseholdScreen on real data behind KitchenGate; reached from the meal plan's member avatars and from Settings. Route tests.
8. Verify: full check; pnpm e2e plus a household flow that reads the code as Alex on one device and joins with it as a new account on the other (AC3).
<!-- SECTION:PLAN:END -->
