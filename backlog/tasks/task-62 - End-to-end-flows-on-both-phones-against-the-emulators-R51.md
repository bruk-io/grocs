---
id: TASK-62
title: End-to-end flows on both phones against the emulators (R51)
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 19:55'
labels:
  - size-3
  - app
  - e2e
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
R51 (decision-9: Maestro) has never been built, so nothing exercises the app on a device; the 2026-11-06 sweep did it by hand and found TASK-56..61. Flows run on development builds against the Firebase emulators with seed data (R52). Sign-in: real Google sign-in can't be automated (no account on CI emulators, iOS needs a password), and Bruk removed the visible dev test sign-in on 2026-10-24 so dev and release look the same. Chosen 2026-11-06 with Bruk: a development-only deep link signs a seeded account in to the Auth emulator; no button, and release builds don't carry it (R53).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A development build opened at grocs://dev-sign-in?as=alex (or sam) is signed in to the Auth emulator as that seed account; a release build ignores the link, and a development build pointed at live Firebase refuses it
- [ ] #2 Maestro flows in apps/mobile/e2e cover signing in, adding a meal, adding an item and ticking it, and pass on the Android emulator and the iOS simulator
- [ ] #3 A flow shows a change made on one device reaching the other
- [ ] #4 One command runs the flows against the emulators with seed data
- [ ] #5 A check (R55) fails when a flow signs in any way but the dev link or names an app other than the development build
<!-- AC:END -->
