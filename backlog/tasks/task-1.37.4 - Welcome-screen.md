---
id: TASK-1.37.4
title: Welcome screen
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-19 03:13'
updated_date: '2026-10-19 08:43'
labels:
  - size-3
  - layer-app
  - design-system
  - finish-moved
milestone: m-2
dependencies:
  - TASK-1.37.3
modified_files:
  - apps/mobile/app/index.tsx
  - apps/mobile/app/_layout.tsx
  - apps/mobile/src/screens/WelcomeScreen.tsx
  - apps/mobile/src/screens/SignInScreen.tsx
  - apps/mobile/src/platform/useSystemReduceMotion.ts
  - apps/mobile/src/routes/index.route.test.tsx
  - design/reference/Welcome.dc.html
  - design/reference/shots/Welcome.png
  - design/reference/canvas.json
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The signed-out screen in the app, rendering the Welcome template. No sign-in logic yet: Bruk asked for UI only. Compare with design/reference/shots/Welcome.png. Cites R40, R41, R53, R66.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Opening the app signed out shows the Welcome screen matching Welcome.png: wordmark, tagline, the panning kitchen with its mushrooms, and the sign-in sheet
- [ ] #2 Continue with Google does nothing yet; in development builds the existing test sign-in stays reachable from the sheet and still leads to the list (R53)
- [ ] #3 Tapping a mushroom plays its reaction and speech bubble, announced to screen readers (R40), and with reduce motion on the kitchen holds still (R41)
- [ ] #4 Android and iOS bundles build, and pnpm check:release passes
- [ ] #5 Welcome.dc.html and its shot are deleted (R66)
- [ ] #6 Each route has a render test with its sample data, and its links lead to the routes the design shows (decision-11 level 4)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. useSystemReduceMotion hook in apps/mobile/src/platform: reads AccessibilityInfo.isReduceMotionEnabled() and subscribes to reduceMotionChanged. Root layout wraps the Slot in MotionProvider reduced=that (R41).
2. WelcomeScreen renders SignInTemplate (title Grocs, tagline) with no sign-in logic; Continue with Google and Open it to join do nothing. In dev builds only (dev prop non-null) the test sign-in buttons render over the empty lower part of the sheet, reusing SignInScreen's test sign-in logic (renamed DevSignIn); no dev import added, so check:release holds (R53).
3. index.tsx shows WelcomeScreen when signed out; delete SignInScreen.tsx.
4. Route tests: signed-out shows wordmark, tagline, Continue with Google, invite link; dev account button signs in and leads to the list; mascot tap shows its bubble; reduce motion hook test.
5. Delete Welcome.dc.html, its shot, canvas.json entry (R66).
### Risks
Dev buttons overlay the sheet since ui is not editable; sheet centres its content so overlay sits at the bottom. react-native-web in jsdom may not render the kitchen art; route test will show.
### Proof
vitest app project, pnpm check, typecheck, check:release, ui visual unchanged. Delivers R40, R41, R53, R66.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18 before work started: added decision-11's route tests, after Bruk asked for the right level of testing in the UI build.

From the TASK-1.30 review: MotionProvider takes 'reduced' as a prop on the phones (packages/ui/src/platform/motion.tsx), and nothing in apps/mobile passes the OS setting yet. This task's reduce-motion criterion (R41) needs apps/mobile to pass AccessibilityInfo.isReduceMotionEnabled() and its reduceMotionChanged events into MotionProvider.

Checks changed: .claude/checks.json's full tier gained the browser pass (pnpm --filter @grocs/ui visual -- --no-build) in TASK-1.37.6 (commit 5a3cecc), merged into main after this task was accepted. Noted up front by the orchestrator so the close isn't refused for a change this task didn't make.

## Report (builder-app)
Signed-out route now renders WelcomeScreen (apps/mobile/src/screens/WelcomeScreen.tsx) = ui SignInTemplate (title Grocs, tagline), no sign-in logic: Continue with Google and Open it to join do nothing. SignInScreen.tsx removed.
Dev sign-in (R53): ui is not editable, so in development builds (dev non-null, from the __DEV__-gated load-dev) the test-account buttons render as text buttons overlaid at the foot of the sheet. No new dev import; pnpm check:release clean.
Reduce motion (R41): apps/mobile/src/platform/useSystemReduceMotion.ts reads AccessibilityInfo.isReduceMotionEnabled() and subscribes to reduceMotionChanged; root _layout.tsx wraps the Slot in MotionProvider reduced=. Hook test with mocked AccessibilityInfo. The kitchen's own still pose when reduced is TASK-1.37.3's (sceneMotion).
Route tests (decision-11 level 4) in index.route.test.tsx: signed-out Welcome (wordmark, tagline, both buttons), Continue does nothing and no test sign-in in a release build, dev test sign-in leads to the list, mushroom tap shows the bubble and calls announceForAccessibility (R40), signed-in list. appOnFakes gained a dev option. The route's only links (Open it to join) go nowhere yet: the join route is not built, so no link target exists to test.
Reference deleted (R66): Welcome.dc.html, shots/Welcome.png, canvas.json entries.
Not verified on a device or simulator; the Android/iOS bundles build via check:release's export. Differences from Welcome.png are those listed in TASK-1.37.3's notes (ui is unchanged).
Check pnpm exec vitest run --project app --project tools apps (10 passed), pnpm check, pnpm typecheck, pnpm check:release, pnpm --filter @grocs/ui visual (304 views, unchanged) all exit 0.
<!-- SECTION:NOTES:END -->
