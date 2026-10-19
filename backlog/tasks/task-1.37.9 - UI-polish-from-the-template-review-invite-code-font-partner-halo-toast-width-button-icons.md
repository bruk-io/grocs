---
id: TASK-1.37.9
title: >-
  UI polish from the template review: invite code font, partner halo, toast
  width, button icons
status: Done
assignee:
  - '@builder-ui'
created_date: '2026-10-19 08:30'
updated_date: '2026-10-19 13:14'
labels:
  - size-2
  - layer-ui
  - design-system
milestone: m-2
dependencies: []
parent_task_id: TASK-1.37
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.37.3. Small likeness gaps against design/reference/shots: the invite code (MOREL-42) on JoinInviteInvalid is in the body font where the reference uses the display font; the partner avatar in the Main, Toast and Offline headers has a solid tomato ring where the reference has a soft halo; the toast pill is narrower than the reference; and the Button atom has no icon slot, so Share link and Copy diagnostics (Household, Settings) lose their icons.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The invite code uses the display font, the partner avatar shows a soft halo, and the toast pill width matches the reference
- [x] #2 Button takes an optional leading icon, used by Share link and Copy diagnostics, with stories, behaviour tests and approved baselines
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted Oct 19, 2026 (Bruk: wrap up the UI portions).

Builder-ui report. Invite code field takes a display prop (TextField, LabelledField) set on InviteRetryTemplate so MOREL-42 is in the display font. Avatar online ring is now a soft halo (lineWStrong tomato ring at opacity.tucked plus a tomato blur). ActivityToast text is body heavy at small size, widening the pill toward the reference. Button gains leadingIcon (16px glyph before the label, dropped while loading, ignored on icon and back variants), used by InviteCard Share link (share) and PreferencesTemplate Copy diagnostics (copy). Stories LeadingIconPrimary/Secondary/Disabled/Loading and 3 behaviour tests added. Baselines: 4 new atoms-button--leading-icon-*; changed for the halo: atoms-avatar--online, atoms-avatar--xl-online, molecules-avatarstack--online, organisms-mainheader--groceries and --meal-plan, templates-grocery-list (groceries, toast, empty, all-done, offline) and templates-meal-plan--week, each with fold variants, plus manifest.json; toast width: molecules-activitytoast--rest and --planned and grocery-list--toast/groceries; invite code font: templates-invite-retry--invalid; icons: organisms-invitecard--unsent/waiting/joined, templates-kitchen-setup--rest, templates-preferences--rest. pnpm check, typecheck, test (1167) and visual all pass.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(508 earlier lines omitted)
```text
|  3.25 kB │ gzip:   1.46 kB
|  storybook-static/assets/SignInTemplate.stories-Cxjkx3T-.js
|  3.32 kB │ gzip:   1.36 kB
|  storybook-static/assets/ItemPickerTemplate.stories-DFZPgQTN.js
|  4.34 kB │ gzip:   1.52 kB
|  storybook-static/assets/Button.stories-Boz-hlDS.js
|  4.47 kB │ gzip:   1.31 kB
|  storybook-static/assets/PreferencesTemplate.stories-C9xk6R3_.js
|  4.55 kB │ gzip:   1.75 kB
|  storybook-static/assets/TextField-a7lFJsO7.js
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/ItemRow-C3ZYActY.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-O9oiqo-_.js
|  5.76 kB │ gzip:   1.98 kB
|  storybook-static/assets/Button-yerDO0dA.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-q3eUbIQb.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-DBPKC93N.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-Be5iFFVT.js
|  17.02 kB │ gzip:   4.60 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-BPeaRf1v.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-C3LmNh5o.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-D2z1s_db.js
|  1,359.27 kB │ gzip: 391.71 kB

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

|  Vite ✓ built in 5.50s
|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a31655b2a1acc01ed/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a31655b2a1acc01ed/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 308 story views checked (axe, 44 x 44, 308 images compared)
```

Review (philosophy:reviewer, Oct 19, 2026): closed. Full-tier record-check exit 0 on the merged branch (1c2ec1f, after the main merge 62b9fdb): check, typecheck, test, emulator and the browser pass, 308 story views compared clean. Compared against the reference shots read straight from git (81a13b9:design/reference/shots/*; note the copies in the session scratchpad differ from git in the header regions and were not used for the halo or toast). Toast: reference pill spans x 20-276 (257 px) at its mid row; the new baseline spans 16-274 (259 px), was 239 px before; within a couple of pixels, close enough, and the pill sits about 4 px further left than the reference, not worth a task. Halo: reference is a thin translucent tomato ring (about #ebb3a3) with a gap; new ring is #e9a492 plus a soft outer blur, replacing the old solid #e2583a ring; clearly toward the reference, the blur slightly softer-wider than the reference. Invite code: MOREL-42 now in the display font as in the reference; the reference also letter-spaces it, which this does not (minor, not filed). Leading icon: share on Share link, copy on Copy diagnostics, 4 stories, 3 behaviour tests, 4 new baselines. Findings, none filed: (low, process) the task has no Implementation Plan section though CLAUDE.md asks a worker to write one before editing; (low) ActivityToast now uses raw RN Text with a hand-built style rather than the Text atom, consistent with other molecules but a heavy-small variant may be worth adding to Text if it recurs.
<!-- SECTION:NOTES:END -->
