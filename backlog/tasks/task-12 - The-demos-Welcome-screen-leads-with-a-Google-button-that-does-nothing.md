---
id: TASK-12
title: >-
  The sign-in sheet can lead with one primary action instead of Google and the
  invite row
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-19 19:03'
updated_date: '2026-10-20 04:11'
labels:
  - size-2
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Seen in run 39301929518's smoke-output welcome.png (TASK-10.4). In the demo APK, 'Continue with Google' is the full-width primary button but does nothing in the demo, while the demo's only way in, 'Try the demo', is a small left-aligned text link under 'Got an invite?'. A friend who installs the demo will tap the big button first and think the app is broken.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 AuthSheet and SignInTemplate can show one primary action in place of Continue with Google and the invite row, with a state and story for it
- [ ] #2 Existing SignInTemplate and AuthSheet states and baselines are unchanged; the new story's baseline is approved through visual:update
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 19, 2026: 'DRAFT-7 demo Welcome'). Split at acceptance: the draft carried two layer labels. This is the ui half; the app half (the demo Welcome uses it, the real Welcome unchanged) is a size-1 task created once this API exists. The draft's criteria map: #1 and #2 are met by this shape plus the app half, #3 by the app half's route test.

Plan (written on finishing): the previous builder's uncommitted work was reviewed as my own draft and kept. AuthSheet gains optional primaryLabel + onPrimary; with primaryLabel it renders one stretch button.primary in place of Continue with Google and the invite row (footer still renders). SignInTemplate passes both through. New states: AuthSheet 'primaryAction', SignInTemplate 'primaryAction'; stories PrimaryAction in both; behaviour test added.

Report: I finished an interrupted build (the first builder was stopped by a container restart; its edits and four primary-action baselines were uncommitted). Reviewed against criteria: the manifest diff only adds 4 entries (organisms-authsheet--primary-action, templates-sign-in--primary-action plus --fold-inner/--fold-outer); no existing baseline or state changed. No story changed by me, so no visual:update was needed.
New API (for the app task's numbered steps): AuthSheet and SignInTemplate take primaryLabel?: string and onPrimary?: () => void. When primaryLabel is set, the sheet shows one full-width primary button with that label that calls onPrimary, and omits Continue with Google, the invite row, onContinue and onOpenInvite (ignored). footer still shows. Without primaryLabel nothing changes. Demo use: <SignInTemplate primaryLabel="Try the demo" onPrimary={...} />.
Checks: pnpm check, typecheck, test (1282 passed) pass; visual: 315 views, 315 images compared, passes (first run hit a Storybook load timeout under load, rerun clean).
<!-- SECTION:NOTES:END -->
