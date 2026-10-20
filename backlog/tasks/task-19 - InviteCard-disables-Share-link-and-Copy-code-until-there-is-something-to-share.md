---
id: TASK-19
title: InviteCard disables Share link and Copy code until there is something to share
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 12:11'
updated_date: '2026-10-20 17:52'
labels:
  - size-2
  - layer-ui
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-17 builder. InviteCard always renders Share link and Copy code as live-looking buttons and leaves out onPress when a handler is missing; Button supports disabled but InviteCard never passes it. INVITECARD_STATES lists 'unsent' but nothing implements it. KitchenSetupTemplate always renders the card and forwards only onShare, onCopy, inviteCode and inviteStatus, so the app cannot avoid dead controls before a kitchen exists (TASK-17 criterion 2).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 InviteCard's unsent state shows Share link and Copy code disabled (a button without its handler is disabled, never dead), with its story and behaviour test
- [x] #2 KitchenSetupTemplate can show the card unsent; every existing state and baseline is unchanged and the new baselines are approved
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan (builder-ui): InviteCard: a button whose handler is missing renders disabled (Button disabled), never dead. To keep every existing baseline unchanged, Waiting/Joined/Unsent/Rest stories get handlers in their own args (they render as today); the existing Unsent story means 'ready, not yet sent' and stays enabled. New state 'unshareable' (story Unshareable, no handlers) shows both buttons disabled. KitchenSetupTemplate forwards handlers already, so omitting them shows the card disabled: add state 'inviteUnavailable' + story InviteUnavailable, Rest gets handlers in args. Behaviour tests for both; baselines via visual:update. Conflict noted: AC1 says 'unsent state disabled' but the existing Unsent baseline must not change, so the disabled state is a new named state.

Report (builder-ui): InviteCard disables Share link / Copy code when onShare / onCopy is missing (never dead). New InviteCard state 'unshareable' (story Unshareable). KitchenSetupTemplate state 'inviteUnavailable' (story InviteUnavailable): omit onShare/onCopy and the card shows disabled; no new prop. Existing stories now pass handlers in their own args so every existing baseline is byte-unchanged; the existing Unsent story still means ready-but-unsent (enabled). New baselines: organisms-invitecard--unshareable.png; templates-kitchen-setup--invite-unavailable.png, --fold-inner.png, --fold-outer.png (plus manifest.json lines). check, typecheck, test, ui visual all pass.

Rework (builder-ui, after Bruk saw the screenshots: 'hide them instead'). Plan: before a code exists Share link and Copy code are not rendered, and the code box shows a hint instead of a sample code. Type level: InviteCard code is string | null; code:null refuses status, onShare, onCopy (?: never). KitchenSetupTemplate inviteCode is string | null, null refuses inviteStatus, onShare, onCopy. InviteCode atom gains a 'pending' state: a hint prop instead of code (union), new story Pending. Hint copy: 'Your code appears after Start planning.' Renames: InviteCard 'unshareable'/Unshareable -> 'noCode'/NoCode; KitchenSetupTemplate 'inviteUnavailable'/InviteUnavailable -> 'noInviteYet'/NoInviteYet. Never-dead rule kept where a code exists: a missing handler on one button renders that button disabled (Button disabled), the other stays live; tested on InviteCard and the template. The superseded Unshareable/InviteUnavailable baselines (4 files, from the earlier attempt, never approved) are removed.

Report (builder-ui, rework): final API for the app half. <KitchenSetupTemplate inviteCode={string | null} .../>: inviteCode={null} before Start planning shows the hint and no Share link or Copy code, and accepts no inviteStatus, onShare or onCopy; with a string code, inviteStatus?, onShare?, onCopy? as before. KitchenSetupScreen should pass inviteCode={created?.inviteCode ?? null} (drop the '- - - -' placeholder) and keep onShare only in the created branch; HouseholdScreen (sample data, passes a code but no handlers) now shows both buttons disabled and needs onShare/onCopy or inviteCode={null}. A missing handler with a code present: that button renders disabled (aria-disabled, no press), the other stays live; so today's KitchenSetupScreen, which gives onShare but no onCopy, shows Copy code disabled until it passes onCopy (TASK-17). Baselines added: packages/ui/visual-baselines/organisms-invitecard--no-code.png, templates-kitchen-setup--no-invite-yet.png (+ --fold-inner, --fold-outer), atoms-invitecode--pending.png. Removed (the unapproved earlier attempt): organisms-invitecard--unshareable.png, templates-kitchen-setup--invite-unavailable.png (+ --fold-inner, --fold-outer). Changed: none; manifest.json lines added and removed to match; every other baseline unchanged (visual: 323 views compared clean). pnpm check, typecheck, test, ui visual pass.

Baselines approved by @bruk on Oct 20, 2026, in the second round ('Approve both'), after the first round's 'fix the copy first' (TASK-18) and 'hide them instead' (TASK-19). The visual baselines workflow (run 39458891270, on 3c015fe pushed as task-18-19-ui) wrote 324 files byte-identical to this branch's packages/ui/visual-baselines, so the four hand-removed, never-approved files from the first attempt match what a full visual:update retires.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(685 earlier lines omitted)
```text
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

|  Vite ✓ built in 5.69s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 4.8s of this 5.6s
|  build (85%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (38%, 2.1s, 822
|  calls)
|  Additional callback time came from the callbacks below and from
|  callbacks under 1s.
|  1 callback is listed without a time. Its calls overlapped, so the time
|  inside one call includes work from other calls. To find its cost,
|  profile the build with `node --cpu-prof`:
|  - plugin vite:css transform (2 calls)
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

Review (philosophy:reviewer, Oct 20, 2026): not closed. Full tier recorded above exited 0 (1345 tests, 323 visual views clean). Criterion 2 met and ticked: KitchenSetupTemplate inviteCode={null} (state noInviteYet, story NoInviteYet) shows the card before a code; existing baselines byte-unchanged; new baselines (no-invite-yet x3, invitecard--no-code, invitecode--pending) approved by @bruk in round two. Criterion 1 not ticked: it says the unsent state shows both buttons disabled, but on @bruk's decision ('hide them instead') code:null hides them and shows the hint, and the existing 'unsent' state stays enabled. The built behaviour matches his decision and is tested (InviteCard 'before there is a code...' and 'disables the button whose handler is missing'; the type union refuses status/onShare/onCopy with code:null; InviteCode gains 'pending'), so the work is right and the criterion's wording is stale. The reviewer cannot move a finish line: whoever owns it should reword criterion 1 to the hide-plus-hint behaviour (keeping 'with a code, a missing handler renders disabled, never dead'), add finish-moved and a note citing Bruk's round-one choice, commit, and re-run close-task; it should then close. Other findings: builder's 'pnpm test' count was the ui vitest project only (full suite 1345) - reporting slip. Hand-removed unapproved baselines: workflow run 39458891270 wrote 324 files byte-identical to the branch, so the result equals a full visual:update; sound. HouseholdScreen now shows both buttons disabled, not dead: acceptable, folded into TASK-17's notes. Nit: KitchenSetupTemplate.tsx STATES comment reads 'and and'.
<!-- SECTION:NOTES:END -->
