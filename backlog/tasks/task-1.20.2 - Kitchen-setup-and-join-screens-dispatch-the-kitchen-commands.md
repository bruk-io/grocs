---
id: TASK-1.20.2
title: Kitchen setup and join screens dispatch the kitchen commands
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-20 03:20'
updated_date: '2026-10-20 06:21'
labels:
  - size-3
  - layer-app
dependencies:
  - TASK-1.20.3
references:
  - >-
    backlog/decisions/decision-13 -
    Kitchen-create-and-join-go-through-application-commands.md
parent_task_id: TASK-1.20
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-13. KitchenSetupTemplate and the join screen (InviteJoinTemplate, InviteRetryTemplate; routes from TASK-1.37.5) dispatch CreateKitchen and JoinKitchen. The composition root picks the gateway: FirebaseKitchenGateway in the real app, MemoryKitchenGateway in the demo. No port tells a returning member their kitchen yet (filed separately), so the app holds the kitchen it created or joined in session state. AC1 and AC2 of TASK-1.20 also need real phones and Google sign-in (TASK-1.15); this task proves the flows in route tests.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A signed-in member with no kitchen sees kitchen setup; creating one shows the invite link and code, then the Groceries screen works on that kitchen
- [ ] #2 Entering or opening an invite code joins the kitchen, and each rejection reason shows its own inline error where the code was entered (TASK-1.20 AC3)
- [ ] #3 Route tests cover create, join, and every rejection reason on the in-memory gateway; the real composition uses the Firebase gateway and check:release stays clean
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Oct 20, 2026 (orchestrator): TASK-14 (Bruk's session) added KitchenGateway.findMyKitchen(), so a returning member's kitchen comes from the gateway, not session state. Use it: on sign-in, a member with a kitchen lands on Groceries for it and one without sees kitchen setup. The session-state stopgap in this task's description and in decision-13's last consequence is superseded. TASK-1.20.1 is merged (a43fcd5).

Oct 20, 2026: TASK-1.20.3 (the findMyKitchen query) is merged to main; unblocked.

Oct 20, 2026 (builder-app): built. findMyKitchen (TASK-1.20.3) now on App; Home routes a member with a kitchen to Groceries for it and one without to a new KitchenSetupScreen (Start planning dispatches CreateKitchen, shows the invite code, Share link and waiting status via the InviteCard; a second press opens Groceries). /join is real: JoinInviteScreen shows the invite when the URL has ?code=, else the code entry (InviteRetryTemplate); it dispatches JoinKitchen (signing in with Google first if the dispatch says not-signed-in) and each of the five rejection reasons has its own inline message on the code field. Composition: FirebaseKitchenGateway in compose-firebase/native (new dependency @react-native-firebase/functions in apps/mobile, functions emulator connected in src/dev), MemoryKitchenGateway in the demo (demo member already in the demo kitchen), FakeKitchenGateway in appOnFakes. Deps.kitchens left optional. Route tests: apps/mobile/src/routes/kitchen.route.test.tsx (routing, create, join by link and by typed code, all five rejections, signed-out join). Existing index/ListScreen tests now use the gateway's real kitchen id; the join sample test changed because /join is no longer sample. pnpm check, typecheck, test, check:release, check:demo pass. Caveats: pnpm-lock.yaml changed by 1590 lines (pnpm re-resolved peers when the functions dependency was added); Copy code does nothing (no clipboard module installed; the code is selectable); the entry screen reuses InviteRetryTemplate so its title reads Code didn't work even before a first attempt (a ui change would fix it); FirebaseModules.functions is optional so the Node emulator two-client test is untouched. AC1/AC2 on real phones still need TASK-1.15.
<!-- SECTION:NOTES:END -->
