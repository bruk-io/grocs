---
id: TASK-12
title: >-
  The sign-in sheet can lead with one primary action instead of Google and the
  invite row
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-19 19:03'
updated_date: '2026-10-20 05:44'
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
- [x] #1 AuthSheet and SignInTemplate can show one primary action in place of Continue with Google and the invite row, with a state and story for it
- [ ] #2 Existing SignInTemplate and AuthSheet states and baselines are unchanged; the new story's baseline is approved through visual:update
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Review round (Oct 20): (1) Make primary mode a type-level choice: AuthSheetProps and SignInTemplateProps become a union of a sign-in shape (onContinue, onOpenInvite, signingIn; primaryLabel/onPrimary: never) and a primary shape (primaryLabel and onPrimary both required; onContinue, onOpenInvite, signingIn: never). signingIn in primary mode: not accepted, because there is no Google sheet to be busy with and the lone button has no loading state; disabled and footer stay shared. (2) Behaviour test: footer renders under the primary action; also one button only. (3) Remove the tall empty band: in primary mode the sheet content starts at the top (flex-start) instead of centring in the sheet, so the button sits where the rest sheet's content begins; the rest sheet stays centred and unchanged. (4) Regenerate with visual:update; only the SignInTemplate primary-action views should change. Run check, typecheck, test, visual.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 19, 2026: 'DRAFT-7 demo Welcome'). Split at acceptance: the draft carried two layer labels. This is the ui half; the app half (the demo Welcome uses it, the real Welcome unchanged) is a size-1 task created once this API exists. The draft's criteria map: #1 and #2 are met by this shape plus the app half, #3 by the app half's route test.

Plan (written on finishing): the previous builder's uncommitted work was reviewed as my own draft and kept. AuthSheet gains optional primaryLabel + onPrimary; with primaryLabel it renders one stretch button.primary in place of Continue with Google and the invite row (footer still renders). SignInTemplate passes both through. New states: AuthSheet 'primaryAction', SignInTemplate 'primaryAction'; stories PrimaryAction in both; behaviour test added.

Report: I finished an interrupted build (the first builder was stopped by a container restart; its edits and four primary-action baselines were uncommitted). Reviewed against criteria: the manifest diff only adds 4 entries (organisms-authsheet--primary-action, templates-sign-in--primary-action plus --fold-inner/--fold-outer); no existing baseline or state changed. No story changed by me, so no visual:update was needed.
New API (for the app task's numbered steps): AuthSheet and SignInTemplate take primaryLabel?: string and onPrimary?: () => void. When primaryLabel is set, the sheet shows one full-width primary button with that label that calls onPrimary, and omits Continue with Google, the invite row, onContinue and onOpenInvite (ignored). footer still shows. Without primaryLabel nothing changes. Demo use: <SignInTemplate primaryLabel="Try the demo" onPrimary={...} />.
Checks: pnpm check, typecheck, test (1282 passed) pass; visual: 315 views, 315 images compared, passes (first run hit a Storybook load timeout under load, rerun clean).

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(633 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-6BQx5Vk9.js
|  5.75 kB │ gzip:   1.97 kB
|  storybook-static/assets/Button-DVwcMXzh.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-yDSJJSl5.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-tEebn1AN.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-CVUR2pBB.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-B-2mFbku.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-iH_wdvDj.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-YmRsIBAV.js
|  1,359.38 kB │ gzip: 391.73 kB

|
!  Vite [plugin builtin:vite-reporter]
|  (!) Some chunks are larger than 500 kB after minification. Consider:
|  - Using dynamic import() to code-split the application
|  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
|  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
|  - Adjust chunk size limit for this warning via
|  build.chunkSizeWarningLimit.
|
!  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
|  shimmed in module "../../node_modules/react-native-web/dist/index.js".

|  Vite ✓ built in 4.84s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.6s of this 4.8s
|  build (75%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (53%, 2.6s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (33%, 1.6s, 822
|  calls)
|  These rows add up to more than the total. Callbacks can overlap, so
|  the same time counts for more than one row.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a6903d9d8b5120b27/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a6903d9d8b5120b27/packages/ui
> node ../../tools/visual.ts -- --no-build

visual: 315 story views checked (axe, 44 x 44, 315 images compared)
```

Review (philosophy:reviewer, Oct 20 2026), commit 49d302e. Verdict: not closed. AC2 is not evidenced. Full tier recorded above, exit 0 (visual: 315 views, 315 images compared; check, typecheck, test, emulator, release all green). #1 met and ticked: AuthSheet and SignInTemplate take primaryLabel/onPrimary, the primaryAction state is added to both STATES lists, PrimaryAction stories exist in both, and the AuthSheet behaviour test shows Google and the invite row are gone, the primary button fires onPrimary, and onContinue does not. #2 NOT ticked. The existing half holds: the manifest diff adds only four entries, the existing entries are unchanged, and the visual compare passes. But the four new baselines came from the interrupted first builder, uncommitted, with no record of being made by visual:update or the visual-baselines workflow (CLAUDE.md: the workflow is the reference). The finishing builder says it ran no visual:update, and nobody has recorded approving them. To close: run the visual baselines workflow on the pushed branch and confirm the four images match, or regenerate them, and record approval by @bruk. My read of the images: 'Try the demo' is the only control on the sheet, full-width primary, and clearly the one way in. One flaw: the sheet keeps its old height, leaving a tall empty band above the button. Findings: the ignored onContinue/onOpenInvite (and signingIn) plus primaryLabel-without-onPrimary rendering a dead button belong at the type level, and there is no test that footer still renders in primary mode. Filed as a draft (size-1, layer-ui), to do before or with the app half.

Oct 20, 2026 (orchestrator): the review's findings are folded back into this task rather than a draft, since it is not closed and the app half (TASK-10.9) builds on the API. To do: make primary mode a choice at the type level (primaryLabel needs onPrimary; say what happens to signingIn in that mode); test that the footer still renders in primary mode; remove the tall empty band above the single button; then regenerate the new baselines through visual:update. The orchestrator then runs the visual baselines workflow on the pushed branch and asks Bruk to approve the four images.

Review round (Oct 20, builder-ui): primary mode is now a type-level choice. AuthSheetProps and SignInTemplateProps are unions. Sign-in shape: onContinue?, onOpenInvite?, signingIn? (primaryLabel/onPrimary: never). Primary shape: primaryLabel: string and onPrimary: () => void both required (onContinue, onOpenInvite, signingIn: never). signingIn is not accepted in primary mode: no Google sheet exists to be busy with. disabled and footer are shared; footer renders in both. Final API for TASK-10.9: <SignInTemplate title=... tagline=... primaryLabel="Try the demo" onPrimary={...} />. Layout: in primary mode the sheet content starts at the top (justifyContent flex-start) instead of centring, so the button sits where the rest sheet's first row sits, with no band above; rest sheet is unchanged. Tests: new AuthSheet behaviour test that the footer still renders under the primary action, and that it is the only button; the old test no longer passes onContinue (the type forbids it). Baselines: visual:update wrote all 315; only 3 files changed: templates-sign-in--primary-action.png, --fold-inner.png, --fold-outer.png (plus their 3 manifest hashes). organisms-authsheet--primary-action.png and every existing state are byte-identical. I looked at the new image: one full-width Try the demo button at the top of the sheet. Checks: pnpm check, typecheck, test (1310 passed), visual (315 views, 315 images compared) pass. Still open: the orchestrator runs the visual baselines workflow on the pushed branch and Bruk approves the images (AC2).
<!-- SECTION:NOTES:END -->
