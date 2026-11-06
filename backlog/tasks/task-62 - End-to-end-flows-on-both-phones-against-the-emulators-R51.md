---
id: TASK-62
title: End-to-end flows on both phones against the emulators (R51)
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 19:55'
updated_date: '2026-11-06 20:59'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06 progress (branch feat/e2e-maestro-flows, 996cdcd). Two dev-environment defects found and fixed on the way: (1) the seed wrote kitchens/seed-kitchen but no memberships/{uid}, so findMyKitchen returned null and seed accounts landed on kitchen setup; the seed now builds the kitchen with core's createKitchen/addMember and writes each membership. (2) A dev build on device carries the real project id from google-services.json, so the Firestore emulator (single project mode, demo-grocs) served it an empty namespace and every kitchen read and write failed rules line 14 ('Null value error', surfaced as firestore/unknown); tools/emulator-config.ts derives demo-grocs copies of both config files for emulator builds. Flow fixes for Android: hideKeyboard is Back on Android (drops typed text, or leaves the screen), so item flows press Enter and the meal flow taps the heading. iOS: clearState does not clear the keychain, so the sign-in subflow signs out first if the app opens signed in. Found by the flows: TASK-63. Gotcha: starting Expo here writes apps/mobile/tsconfig.json (gitignored) extending expo/tsconfig.base, which breaks 15 vitest files until deleted. Results so far: pnpm e2e --android emulator-5554 passed all three single-device flows; both-device run passed the second-device pair (added on Android as Alex, seen, ticked and cleared on iOS as Sam) and the first iOS flow; the other two iOS flows failed before the keychain fix; rerun in progress.

2026-11-06 pnpm e2e --android emulator-5554 --ios 9EB5207C-C6E9-4EF9-807C-D5519575A9DB (fold emulator; iPhone 18 Pro simulator; both development builds built from tools/emulator-config.ts's demo-grocs config): 'e2e: every flow passed'. Runs: add-and-tick-item, add-meal, sign-in on each device, then second-device-add on Android (Alex) and second-device-see on iOS (Sam).

2026-11-06 full check ('full' in .claude/checks.json) exit 0: 15 checks incl. e2e-flows; 131/131 unit test files; test:emulator 8/8 files (incl. the seed's new seedKitchenDoc test); check:release 'release bundles clean' with app/dev-sign-in.tsx present; Storybook built; visual 410 story views.
<!-- SECTION:NOTES:END -->
