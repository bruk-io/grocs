---
id: TASK-78
title: Share a kitchen by adding the other person's email instead of an invite code
status: In Progress
assignee:
  - '@bruk'
created_date: '2026-11-07 17:36'
updated_date: '2026-11-07 17:39'
labels:
  - area-kitchen
  - size-5
dependencies: []
type: intent
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem

Shaz invited me to her kitchen but there is no way in my app to join it. I had already set up my own kitchen, and the only screens that take an invite code are the signed-out Welcome and Kitchen setup, which a person with a kitchen never sees again. The invite link is a grocs:// link that message apps do not make tappable, so in practice the invite is a code typed by hand.

I want to drop invite codes and share a kitchen by adding the other person's email: the member types their partner's email, and the partner sees the invite the next time they open the app and can join from there, even if they already have a kitchen of their own.

Decided with Bruk on 2026-11-07 (chat), before this was written down:
- The invited person confirms with a Join button; nobody is moved into a kitchen without saying yes.
- No email or push is sent; the person who invites tells their partner themselves.
- Joining from a kitchen of your own leaves that kitchen (its list stays with it) and the screen says so first.
- The invite is matched to the email on the person's Google sign-in, read on the server, never an email the phone sends.

## Affected users and systems

- Bruk and Shazya, both signed in with Google.
- Spec doc-1 R2 and R3 (short invite code, invite link), which this replaces.
- Kitchen domain (core), KitchenGateway port, kitchen commands, the server store and Cloud Functions, Firebase and memory providers, Firestore rules.
- Screens: Kitchen setup, Household, the /join route and its templates (InviteJoin, InviteRetry, InviteCard).

## Open questions

- [x] Does an email invite expire? Settled: it stays until it is used or cancelled; the only person who can use it is the one whose Google account has that email.
- [x] What happens to a kitchen when its last member leaves to join another? Settled: it stays in the database with no members; nothing reads it. Deleting its data is not part of this.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A member can add their partner's email from Household (and from Kitchen setup after creating a kitchen), and sees it listed as invited until it is used or they cancel it
- [ ] #2 A signed-in person whose Google email matches a pending invite is offered it on opening the app, naming who invited them and the kitchen, with Join and Not now
- [ ] #3 Joining works whether or not the person already has a kitchen; when they do, the screen says their current list stays behind, and after joining they are no longer a member of the old kitchen
- [ ] #4 The server matches invites only by the verified email on the caller's sign-in; a person whose email does not match cannot see or use the invite, and a kitchen still holds at most two members (allow and deny tests)
- [ ] #5 Adding an email never reveals whether that email has a Grocs account
- [ ] #6 Invite codes, the code entry screen, the /join route and the grocs://join link are gone, and spec R2 and R3 describe sharing by email
- [ ] #7 Must not break: an existing two-member kitchen keeps working unchanged, and a member still cannot read or write any other kitchen
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Sized 5 (2026-11-07): high complexity (every layer, plus rules, functions and a large deletion of the code path), few unknowns (one: whether a callable's ID token carries email and email_verified for a Google sign-in, checked first against the Auth emulator), moderate risk (membership moves between kitchens in one transaction). Not split into layer-* tasks: the layers depend on each other in order, so layer agents would add no parallelism; built bottom-up in one worktree by the orchestrator. Spec change (R2, R3) is part of the work (AC #6); Bruk approved the design in chat on 2026-11-07: "Let's go ahead and build".
<!-- SECTION:NOTES:END -->
