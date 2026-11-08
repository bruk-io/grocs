---
id: TASK-79
title: A kitchen its inviter left keeps offering its invite
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 18:25'
updated_date: '2026-11-07 18:33'
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
- [x] #1 A kitchen a member leaves by joining another no longer holds the invite that member sent, or such an invite is never offered or accepted
- [x] #2 A contract test on every gateway covers: a person who invited from their own kitchen then joins another, and the invited address is offered nothing from the old kitchen
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

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(775 earlier lines omitted)
```text
│  3.73 kB │ gzip:   1.49 kB
│  storybook-static/assets/MealFormTemplate.stories-CNxvce07.js
│  4.32 kB │ gzip:   1.57 kB
│  storybook-static/assets/KitchenSetupTemplate.stories-DTqI6Emg.js
│  4.34 kB │ gzip:   1.73 kB
│  storybook-static/assets/ItemPickerTemplate.stories-D5959drz.js
│  4.45 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-Cf-cXPNU.js
│  4.47 kB │ gzip:   1.30 kB
│  storybook-static/assets/ItemRow-BxoPYo3r.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/TextField-BCPEAhXA.js
│  5.35 kB │ gzip:   2.03 kB
│  storybook-static/assets/PreferencesTemplate.stories-REguETur.js
│  5.75 kB │ gzip:   2.17 kB
│  storybook-static/assets/Button-BGBisdDM.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-CG1CBRg6.js
│  9.43 kB │ gzip:   3.14 kB
│  storybook-static/assets/Mascot-4rKT5ofR.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-Czdhq-VZ.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-D84rpS8T.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-DCqf-5KD.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-BtIyf4X3.js
│  167.09 kB │ gzip:  49.81 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-DMAHZb3t.js
│  1,361.03 kB │ gzip: 392.16 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 1.16s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/share-by-email/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 437 story views checked (axe, 44 x 44, images not compared)
```

Review (philosophy:reviewer, 2026-11-07): closed. Full check green, exit 0 (emulator suite 104/104 incl. the new contract test on the server store and Firebase gateway). AC #1: removeMember now drops the invite; sound because a kitchen holding an invite has exactly one member (inviteByEmail refuses full kitchens and joining consumes the invite), so the leaver is the inviter. AC #2: contract test 'offers nothing from a kitchen whose inviter has left it...' runs on fake, memory, server and Firebase; repro recorded failing against pre-fix code. No new findings. 10dd0ae resolves the earlier low findings 2 and 3.
<!-- SECTION:NOTES:END -->
