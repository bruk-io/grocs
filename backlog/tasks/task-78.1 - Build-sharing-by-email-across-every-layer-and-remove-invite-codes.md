---
id: TASK-78.1
title: Build sharing by email across every layer and remove invite codes
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 17:39'
updated_date: '2026-11-07 17:39'
labels:
  - area-kitchen
  - size-5
dependencies: []
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
