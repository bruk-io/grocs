---
id: TASK-79
title: A kitchen its inviter left keeps offering its invite
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 18:25'
updated_date: '2026-11-07 18:28'
labels:
  - area-kitchen
  - size-1
dependencies: []
modified_files:
  - packages/core/src/model/email-invite.ts
  - packages/core/src/model/email-invite.test.ts
  - packages/ports/src/kitchen-gateway/contract.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found reviewing TASK-78.1. removeMember (packages/core/src/model/email-invite.ts) strips members and memberNames but spreads invite through, and acceptInvite writes that object back as the left kitchen. KitchenStore.invitesFor (packages/providers-server/src/kitchen-store.ts) queries every kitchen by invite.email and filters only on whether the caller is a member, so the empty kitchen is still offered, with inviter '' (memberNames no longer has the inviter), and acceptInvite lets the invited person join it. Realistic path: Bruk and Shaz each make a kitchen and invite each other; Bruk joins Shaz's; Shaz is then offered Bruk's empty old kitchen and, if she taps Join, leaves the kitchen she now shares with Bruk. This contradicts TASK-78's settled open question that nothing reads a memberless kitchen. No contract test covers the invite on a kitchen someone left.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A kitchen a member leaves by joining another no longer holds the invite that member sent, or such an invite is never offered or accepted
- [ ] #2 A contract test on every gateway covers: a person who invited from their own kitchen then joins another, and the invited address is offered nothing from the old kitchen
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Repro at c8de564f1d8e, test files: packages/core/src/model/email-invite.test.ts; command: `pnpm vitest run packages/core/src/model/email-invite.test.ts packages/ports/src/kitchen-gateway packages/providers-memory -t TASK-79` exited 1

(32 earlier lines omitted)
```text
    114|         t.expect(await owner.acceptInvite(theirs.kitchenId)).toEqual({…
    115|         t.expect(await owner.findMyKitchen()).toBe(ours.kitchenId);
 ❯ packages/ports/src/kitchen-gateway/contract.ts:31:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  |unit| packages/core/src/model/email-invite.test.ts > acceptInvite (R3, R4, TASK-78) > drops the invite the leaver sent from the kitchen they left, so it is never offered again (TASK-79)
AssertionError: expected { email: 'alex@example.com', …(2) } to be undefined

- Expected:
undefined

+ Received:
{
  "createdAt": 2000,
  "email": "alex@example.com",
  "invitedBy": "sam",
}

 ❯ packages/core/src/model/email-invite.test.ts:100:42
     98|     const samInvitedAlex: Kitchen = { ...samsOwn, invite: { email: 'al…
     99|     const r = acceptInvite({ ...sam, target: invited, current: samInvi…
    100|     expect(r.ok && r.value.left?.invite).toBeUndefined();
       |                                          ^
    101|   });
    102|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  |unit| packages/ports/src/kitchen-gateway/fake.test.ts > KitchenGateway contract > offers nothing from a kitchen whose inviter has left it to join another (TASK-79)
AssertionError: expected [ { kitchenId: 'kitchen-2', …(2) } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "inviter": "",
+     "kitchen": "Their kitchen",
+     "kitchenId": "kitchen-2",
+   },
+ ]

 ❯ packages/ports/src/kitchen-gateway/contract.ts:113:46
    111|         await partner.inviteByEmail(theirs.kitchenId, ownerEmail);
    112|         await partner.acceptInvite(ours.kitchenId);
    113|         t.expect(await owner.invitesForMe()).toEqual([]);
       |                                              ^
    114|         t.expect(await owner.acceptInvite(theirs.kitchenId)).toEqual({…
    115|         t.expect(await owner.findMyKitchen()).toBe(ours.kitchenId);
 ❯ packages/ports/src/kitchen-gateway/contract.ts:31:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  3 failed | 2 skipped (5)
      Tests  3 failed | 84 skipped (87)
   Start at  13:27:51
   Duration  158ms (transform 248ms, setup 0ms, import 330ms, tests 14ms, environment 0ms)
```

## Worker report (2026-11-07)

Fix c8de564: removeMember (packages/core/src/model/email-invite.ts) now drops the kitchen's invite along with the member. A kitchen holding an invite has one member, so the person leaving is the one who sent it; acceptInvite writes the left kitchen back without it, so KitchenStore.invitesFor's invite.email query no longer finds it.

Repro (recorded above, against the pre-fix code with the fix reverted in the working tree): the core test and the new contract test 'offers nothing from a kitchen whose inviter has left it to join another (TASK-79)' fail on the fake and memory gateways.

After the fix:
- pnpm vitest run packages/core packages/ports packages/providers-memory packages/application: 313 passed.
- pnpm test:emulator: 8 files, 104 tests passed - the new contract test on the server store (Admin SDK) and on the Firebase gateway through the real callables.
- pnpm check: 16 checks passed; pre-commit (checks, typecheck, unit tests) green.

Also, from the TASK-78.1 review's low findings: 10dd0ae points reference-built's 'invite' specimen at InviteCard and rewords the two field comments that mentioned invite codes. The reused reason text in weakening-overrides.json is left as is.
<!-- SECTION:NOTES:END -->
