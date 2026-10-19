---
id: TASK-10
title: Make Grocs public with something friends can install
status: In Progress
assignee:
  - '@bruk'
created_date: '2026-10-19 14:27'
updated_date: '2026-10-19 15:52'
labels:
  - size-8
dependencies: []
type: intent
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
In Bruk's words (Oct 19, 2026): "I want to make the repo public so I need something I can demo to my friends - an APK or whatever would be good." And: "This is meant to show that work can be done autonomously using my philosophy plugin."

## Affected users and systems
- Bruk's friends: Android phones (install an APK) and iPhones (a browser)
- Visitors to the public repo, who should see how the work ran: intents, spec, decisions, the agent loop, reviews
- Shazya, whose first name is in the app's sample data and test accounts
- CI (.github/workflows) and the app's build variants (apps/mobile/app.config.ts)

## Open questions
- [ ] Real Google sign-in in a friend's build. Carried forward: it needs the Firebase project config Bruk's local session holds (google-services.json and the signing key's SHA-1 registered in Firebase); the demo build ships first and needs neither.
- [x] Licence: MIT (Bruk, Oct 19, 2026).
- [x] Shazya's name: swapped in the app's sample data and test accounts; the board and git history keep it (Bruk, Oct 19, 2026).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 An Android friend can download an APK from the repo's GitHub Releases, install it, and use the app without an account, on sample data
- [ ] #2 An iPhone friend can open every screen and component in a browser, published from CI once the repo is public
- [ ] #3 The README tells a visitor what Grocs is and how it was built, linking real examples of the philosophy plugin's loop on this board
- [ ] #4 The repo carries an MIT licence, has no secrets in its history, and the app's sample data and test accounts do not use Shazya's name
- [ ] #5 Release builds still hold no demo or development-only code (check:release), and CI stays green
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk through his answers on Oct 19, 2026 (demo build first, real sign-in after; Storybook in the browser for iPhones; MIT; swap Shazya's name in the app only). Split by the orchestrator into TASK-10.1 to 10.5 and a draft for real sign-in. Order: 10.2 before 10.3 (both touch the sample data), 10.3 before 10.4 (the APK builds the demo variant); 10.1 and 10.5 run alongside.

Oct 19, 2026: decision-12 (Bruk) puts the demo on a real in-memory provider. Added TASK-10.6 (release check sees fakes and demo code), TASK-10.7 (register the package) and TASK-10.8 (the provider). Order: 10.7 then 10.8, alongside 10.6; then 10.3; then 10.4.
<!-- SECTION:NOTES:END -->
