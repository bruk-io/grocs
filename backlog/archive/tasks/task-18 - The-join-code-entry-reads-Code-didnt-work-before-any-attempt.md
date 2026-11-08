---
id: TASK-18
title: The ui offers a neutral code-entry state for a first join attempt
status: Done
assignee:
  - '@builder-ui'
created_date: '2026-10-20 11:35'
updated_date: '2026-10-20 17:38'
labels:
  - size-2
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-1.20.2 review. JoinInviteScreen reuses InviteRetryTemplate for typed code entry at /join, so its title says "Code didn't work" and offers 'Back to my invite' when nobody has entered a code yet. A first-time joiner from Welcome's 'Open it to join' sees an error state first.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The ui offers a code-entry state with a neutral title for a first attempt, with its story and approved baseline
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 20, 2026: 'go further'). Split at acceptance: criterion 2 (the /join screen uses the new state, retry wording only after a rejection) is app-layer work, filed as its own size-1 task once this state exists. Sized 2: a new state needs its baselines approved by Bruk.

Plan (builder-ui): add a state to InviteRetryTemplate, not a new template. Prop attempt?: 'first' | 'retry' (default 'retry' = today, unchanged). 'first' shows title 'Enter your invite code', no error styling expected, and no 'Back to my invite' button. Why same template: the /join screen then flips first->retry on a rejection without remounting the field (keeps focus/typed code); a separate template would swap trees. Files: InviteRetryTemplate.tsx, .stories.tsx (FirstAttempt), .behaviour.test.tsx, new baselines via visual:update.

Report (builder-ui): InviteRetryTemplate gains attempt?: 'first' | 'retry' (default 'retry', so every existing state/baseline is unchanged). attempt='first': title 'Enter your invite code', no 'Back to my invite' button; app passes code='' and no errorMessage. State 'firstAttempt' added to INVITERETRYTEMPLATE_STATES; story FirstAttempt; behaviour test added. New baselines: templates-invite-retry--first-attempt.png, ...--first-attempt--fold-inner.png, ...--first-attempt--fold-outer.png (plus 3 manifest.json lines). pnpm check, typecheck, test, ui visual all pass.

Rework (builder-ui, after Bruk saw the screenshots: 'fix the copy first'). Plan: the first attempt is someone who chose to join, so no name is known and nothing failed. InviteRetryTemplate props become a union on attempt (as SignInTemplate did for primary mode, TASK-12): attempt:'first' accepts only code, onCodeChange, onCheck, checking (inviter, errorMessage, onBack are ?: never); attempt?:'retry' keeps inviter (required), errorMessage, onBack. First: label 'Invite code' (was 'Invite code from Bruk'), placeholder 'MOREL-42' (the code's shape), no 'Not expecting this? You can ignore it.' footer (kept on retry, where the person may not have expected the invite). Title and no-back-button unchanged. Files: InviteRetryTemplate.tsx/.stories.tsx/.behaviour.test.tsx; Invalid story now carries inviter and errorMessage in its own args, so its baselines are unchanged.

Report (builder-ui, rework): final API for the app half. <InviteRetryTemplate attempt="first" code onCodeChange onCheck? checking? /> for typed entry before any attempt (no inviter, errorMessage or onBack: the type refuses them). After a rejection render <InviteRetryTemplate inviter errorMessage onBack? ... /> (attempt omitted or 'retry'); both are the same component at the same tree position so the field keeps focus and the typed code when the app flips. Today's apps/mobile JoinInviteScreen passes inviter always and typechecks as a retry; the app task must pass attempt='first' until a rejection. First-attempt copy: title 'Enter your invite code', label 'Invite code', placeholder 'MOREL-42', no footer. Baselines changed (regenerated, same three names as before): packages/ui/visual-baselines/templates-invite-retry--first-attempt.png, ...--first-attempt--fold-inner.png, ...--first-attempt--fold-outer.png, plus 3 manifest.json lines. None added or removed; every other baseline unchanged (visual: 322 views compared clean). pnpm check, typecheck, test (794) pass.

Baselines approved by @bruk on Oct 20, 2026, in the second round ('Approve both'), after the first round's 'fix the copy first' (TASK-18) and 'hide them instead' (TASK-19). The visual baselines workflow (run 39458891270, on 3c015fe pushed as task-18-19-ui) wrote 324 files byte-identical to this branch's packages/ui/visual-baselines, so the four hand-removed, never-approved files from the first attempt match what a full visual:update retires.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(681 earlier lines omitted)
```text
|  storybook-static/assets/TextField-DdWvRqRW.js
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/ItemRow-xBnMyVwI.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-CXWYZHB2.js
|  5.75 kB │ gzip:   1.98 kB
|  storybook-static/assets/Button-C95kDzbw.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-BtBVEI8w.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-CWDGtaoA.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-CICBh2O_.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-Qj2UL3QX.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-re48lt7C.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-DB28BbHA.js
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

|  Vite ✓ built in 7.05s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 5.0s of this 7.0s
|  build (71%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (29%, 2.0s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (29%, 2.0s, 822
|  calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a818552d42d83a3ba/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 323 story views checked (axe, 44 x 44, 323 images compared)
```

No repro: this task delivers only the ui state; the reported bug (/join shows 'Code didn't work' before any attempt) lives in apps/mobile JoinInviteScreen and stays reproducible until the split app task lands. That task's route test is the repro. Here the guard is InviteRetryTemplate.behaviour.test.tsx 'on a first attempt is neutral...'.

Review (philosophy:reviewer, Oct 20, 2026): closed. Criterion 1 met: attempt='first' gives title 'Enter your invite code', label 'Invite code', placeholder MOREL-42, no error, back button or footer; props are a union so 'first' refuses inviter, errorMessage and onBack. Story FirstAttempt, behaviour test, baselines approved by @bruk in round two. Retry unchanged: Invalid baselines byte-unchanged. Full tier exited 0 (1345 tests, 323 visual views clean). Findings: (1) builder's 'pnpm test (794)' was the ui vitest project only (full suite 1345) - reporting slip, suite passes. (2) Hand-removed unapproved baselines: workflow run 39458891270 wrote 324 files byte-identical to the branch, so the result equals a full visual:update; sound, process note only. (3) The app half (/join passes attempt='first' until a rejection), promised at acceptance as its own size-1 task, is not on the board: filed as a draft.
<!-- SECTION:NOTES:END -->
