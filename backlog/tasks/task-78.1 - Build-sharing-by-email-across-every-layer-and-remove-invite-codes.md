---
id: TASK-78.1
title: Build sharing by email across every layer and remove invite codes
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 17:39'
updated_date: '2026-11-07 18:19'
labels:
  - area-kitchen
  - size-5
dependencies: []
modified_files:
  - apps/functions/src/index.ts
  - apps/mobile/app/join.tsx
  - apps/mobile/e2e/household-full.yaml
  - apps/mobile/e2e/household-invite.yaml
  - apps/mobile/e2e/household-join.yaml
  - apps/mobile/e2e/subflows/sign-in.yaml
  - apps/mobile/src/composition/compose-app.ts
  - apps/mobile/src/demo/compose-demo.ts
  - apps/mobile/src/demo/demo.route.test.tsx
  - apps/mobile/src/routes/index.route.test.tsx
  - apps/mobile/src/routes/kitchen.route.test.tsx
  - apps/mobile/src/routes/screens.route.test.tsx
  - apps/mobile/src/screens/HouseholdScreen.tsx
  - apps/mobile/src/screens/InviteOfferScreen.tsx
  - apps/mobile/src/screens/JoinInviteScreen.tsx
  - apps/mobile/src/screens/KitchenGate.tsx
  - apps/mobile/src/screens/KitchenSetupScreen.tsx
  - apps/mobile/src/screens/WelcomeScreen.tsx
  - apps/mobile/src/screens/invite-expiry.test.ts
  - apps/mobile/src/screens/invite-expiry.ts
  - apps/mobile/src/screens/invite-message.test.tsx
  - apps/mobile/src/screens/invite.ts
  - apps/mobile/src/screens/navigate.ts
  - apps/mobile/src/screens/use-email-invite.ts
  - apps/mobile/src/screens/use-kitchen-info.test.ts
  - apps/mobile/src/screens/use-kitchen.ts
  - apps/mobile/testing/render-route.tsx
  - firebase/firestore.rules
  - firebase/firestore.rules.test.ts
  - firebase/seed/seed.ts
  - packages/application/src/commands/accept-invite.scenario.test.ts
  - packages/application/src/commands/accept-invite.ts
  - packages/application/src/commands/cancel-invite.scenario.test.ts
  - packages/application/src/commands/cancel-invite.ts
  - packages/application/src/commands/create-kitchen.scenario.test.ts
  - packages/application/src/commands/create-kitchen.ts
  - packages/application/src/commands/index.ts
  - packages/application/src/commands/invite-by-email.scenario.test.ts
  - packages/application/src/commands/invite-by-email.ts
  - packages/application/src/commands/join-kitchen.scenario.test.ts
  - packages/application/src/commands/join-kitchen.ts
  - packages/application/src/index.ts
  - packages/application/src/queries/get-invite-offers.test.ts
  - packages/application/src/queries/get-invite-offers.ts
  - packages/application/src/queries/get-invite-preview.test.ts
  - packages/application/src/queries/get-invite-preview.ts
  - packages/application/src/queries/get-kitchen-info.test.ts
  - packages/application/src/queries/get-kitchen-info.ts
  - packages/application/src/queries/get-kitchen-invite.test.ts
  - packages/application/src/queries/get-kitchen-invite.ts
  - packages/core/src/index.ts
  - packages/core/src/model/email-invite.test.ts
  - packages/core/src/model/email-invite.ts
  - packages/core/src/model/invite.test.ts
  - packages/core/src/model/invite.ts
  - packages/core/src/model/kitchen.ts
  - packages/ports/src/index.ts
  - packages/ports/src/kitchen-gateway/contract.ts
  - packages/ports/src/kitchen-gateway/fake.test.ts
  - packages/ports/src/kitchen-gateway/fake.ts
  - packages/ports/src/kitchen-gateway/port.ts
  - packages/providers-firebase/src/kitchen-gateway.emulator.test.ts
  - packages/providers-firebase/src/kitchen-gateway.ts
  - packages/providers-memory/src/index.ts
  - packages/providers-memory/src/memory-kitchen-gateway.test.ts
  - packages/providers-memory/src/memory-kitchen-gateway.ts
  - packages/providers-server/src/index.ts
  - packages/providers-server/src/kitchen-store.emulator.test.ts
  - packages/providers-server/src/kitchen-store.ts
  - packages/ui/src/atoms/InviteCode.stories.tsx
  - packages/ui/src/atoms/InviteCode.tsx
  - packages/ui/src/atoms/TextField.tsx
  - packages/ui/src/index.ts
  - packages/ui/src/organisms/AuthSheet.behaviour.test.tsx
  - packages/ui/src/organisms/AuthSheet.stories.tsx
  - packages/ui/src/organisms/AuthSheet.tsx
  - packages/ui/src/organisms/InviteCard.behaviour.test.tsx
  - packages/ui/src/organisms/InviteCard.stories.tsx
  - packages/ui/src/organisms/InviteCard.tsx
  - packages/ui/src/templates/HouseholdTemplate.behaviour.test.tsx
  - packages/ui/src/templates/HouseholdTemplate.stories.tsx
  - packages/ui/src/templates/HouseholdTemplate.tsx
  - packages/ui/src/templates/InviteJoinTemplate.behaviour.test.tsx
  - packages/ui/src/templates/InviteJoinTemplate.stories.tsx
  - packages/ui/src/templates/InviteJoinTemplate.tsx
  - packages/ui/src/templates/InviteRetryTemplate.behaviour.test.tsx
  - packages/ui/src/templates/InviteRetryTemplate.stories.tsx
  - packages/ui/src/templates/InviteRetryTemplate.tsx
  - packages/ui/src/templates/KitchenSetupTemplate.behaviour.test.tsx
  - packages/ui/src/templates/KitchenSetupTemplate.stories.tsx
  - packages/ui/src/templates/KitchenSetupTemplate.tsx
  - packages/ui/src/templates/SignInTemplate.behaviour.test.tsx
  - packages/ui/src/templates/SignInTemplate.stories.tsx
  - packages/ui/src/templates/SignInTemplate.tsx
  - tools/checks/weakening-overrides.json
  - tools/checks/weakening.test.ts
  - tools/checks/weakening.ts
  - tools/e2e.test.ts
  - tools/e2e.ts
parent_task_id: TASK-78
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Delivers TASK-78 in one change, bottom-up in one worktree (see TASK-78's sizing note for why it is not split into layer tasks). The acceptance criteria are TASK-78's.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TASK-78 #1 to #7 hold, each with the evidence named in the plan's Proof
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Design

- The pending invite lives on the kitchen document: `kitchens/{id}.invite = { email, invitedBy, createdAt }` or absent. A kitchen has one open place at most, so one pending invite per kitchen; members already read their kitchen doc, so Household sees who is invited with no new rule. Lookup by email is a server-side query on `invite.email` (single-field index, automatic). No new collection; `inviteCodes/*` is left unread and unwritten.
- The caller's email comes only from `request.auth.token.email` with `email_verified === true`; anything else is treated as having no email (no invites offered, inviting your own address not detectable).
- Adding an email does not look up accounts, so its answer is the same whether or not the address has signed in (AC #5).

### Order of work

1. core: `model/email-invite.ts` (normaliseEmail, inviteByEmail, acceptInvite, removeMember decisions) with unit tests; `Kitchen.invite?`; delete `model/invite.ts` and its tests and exports.
2. ports: KitchenGateway becomes createKitchen -> { kitchenId }, inviteByEmail, cancelInvite, invitesForMe, acceptInvite, findMyKitchen, getKitchen (+ invitedEmail). Fake, contract (subjects carry their emails) and fake test together.
3. providers-server KitchenStore + apps/functions callables + firestore.rules comment/tests; emulator tests. In acceptInvite's transaction every read (target kitchen, caller membership, old kitchen) comes before the first write.
4. providers-firebase gateway (Google-credential sign-in in the emulator test so tokens carry email) and providers-memory gateway.
5. application: CreateKitchen (no code), InviteByEmail, CancelInvite, AcceptInvite commands; getInviteOffers query; getKitchenInfo carries invitedEmail; delete JoinKitchen, getInvitePreview, getKitchenInvite.
6. ui: InviteCard becomes the add-an-email card (rest, filled, invalid, sending, invited states); InviteJoinTemplate becomes the offer (Join, Not now, the leave-behind line when the person has a kitchen); KitchenSetup shows the person's own email for their partner to add; delete InviteRetryTemplate, InviteCode, InviteSummary if unused, and the Welcome invite row.
7. app: KitchenGate offers a pending invite before the kitchen (dismissable for the session); Household and KitchenSetup dispatch the new commands; delete /join, JoinInviteScreen, invite.ts, invite-expiry.ts; demo composition.
8. spec doc-1 R2 and R3 rewritten; visual baselines regenerated once at the end.

### Risks

- The callable token may lack email for some sign-ins: checked first, in the emulator, through the real callable.
- Leaving a kitchen inside the join transaction: reads before writes, and a contract test where the joiner already has a kitchen.
- Deleting many UI files at once: story-coverage and baselines are run together at the end.

### Proof

- AC #1-#3: route tests (Household add/cancel; KitchenGate offer, Join, Not now, the leave-behind line) and the contract suite on fake, memory, server and Firebase gateways.
- AC #4: contract tests that a non-matching email sees no offer and cannot accept, and a third person cannot get into a full kitchen; rules tests keep denying non-members.
- AC #5: contract test that inviting an unknown address and a known one give the same outcome.
- AC #6: grep for inviteCode / joinKitchen / grocs://join finds nothing; spec diff.
- AC #7: existing two-member kitchen tests and the rules suite pass unchanged; pnpm check, typecheck, test, test:emulator, check:demo green; iOS e2e sign-in and add-item flows pass.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Worker report (2026-11-07, commit 36694c2 on feat/share-by-email)

Built bottom-up in one worktree, as planned.

- core: model/email-invite.ts (normaliseEmail, inviteByEmail, cancelInvite, isInvitedTo, acceptInvite, removeMember); Kitchen.invite. model/invite.ts deleted.
- ports: KitchenGateway is createKitchen, inviteByEmail, cancelInvite, invitesForMe, acceptInvite, findMyKitchen, getKitchen (+invitedEmail). Contract rewritten (16 tests), passed by the fake, memory, server and Firebase providers.
- server: the invite lives on kitchens/{id}.invite; invitesFor queries invite.email; acceptInvite reads target, membership and old kitchen before any write. Functions take the email only from request.auth.token.email when email_verified is true.
- application: InviteByEmail, CancelInvite, AcceptInvite commands with scenario tests; getInviteOffers query; JoinKitchen, getInvitePreview, getKitchenInvite deleted.
- ui: InviteCard is the email card (rest, filled, invalid, sending, invited, noKitchen); InviteJoinTemplate is the offer (rest, leaving, joining, error) with Join and Not now; KitchenSetup shows the email a partner should add and Check for an invite; AuthSheet's Open it to join replaced by a line; InviteRetryTemplate and InviteCode deleted. TextField gained an email mode.
- app: KitchenGate offers a waiting invite before the kitchen (Not now remembered per launch); Household and Kitchen setup share use-email-invite; /join, JoinInviteScreen, invite.ts, invite-expiry.ts deleted. Seed accounts are email-verified.
- spec doc-1 R2 and R3 rewritten.
- R57: the delete-test rule now honours a content-keyed approval in weakening-overrides.json (never focus or skip); Bruk approved the 13 removals via AskUserQuestion, recorded there.

### Evidence

- The one unknown: the Firebase gateway contract runs through the real callables with Google-credential sign-ins in the emulator, and passes; a separate test shows an unverified email and an anonymous sign-in are offered nothing and cannot accept.
- pnpm test: 137 files, 1745 tests passed. pnpm test:emulator: 8 files, 102 tests passed. pnpm typecheck clean. pnpm check: 16 checks passed (all, staged and ci --base origin/main modes). check:demo and check:release clean.
- iOS simulator (9EB5207C), dev build on the emulators, Maestro: sign-in, add-and-tick-item, add-meal, quick-add-first-tap, meal-form-keyboard, and the household trio run in sequence on the one device (Jo adds pat@grocs.test, Pat signs in and is offered it, joins, both see the kitchen full) - all COMPLETED.
- Bruk's own case (a person with a kitchen of their own joins their partner's): route test 'is offered to someone who has a kitchen of their own...' and the contract test 'lets someone with a kitchen of their own join, and takes them out of the old one'. Not run on a device: the seed has no such pair.

### Not done

- Android: not run (the Android SDK is missing from this machine, as in TASK-76).
- Visual baselines: regenerating via the visual-baselines workflow (run 42399900120).

Update: visual baselines regenerated by run 42399900120, reviewed (invite join leaving, kitchen setup rest, household invited, invite card invalid read by eye) and committed in 6d7040a. PR #32 opened.
<!-- SECTION:NOTES:END -->
