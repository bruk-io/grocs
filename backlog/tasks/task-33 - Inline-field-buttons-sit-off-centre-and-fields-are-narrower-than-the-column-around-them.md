---
id: TASK-33
title: >-
  Inline field buttons sit off centre, and fields are narrower than the column
  around them
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 22:33'
updated_date: '2026-10-21 01:33'
labels:
  - size-2
  - layer-ui
dependencies: []
modified_files:
  - packages/ui/src/atoms/TextField.tsx
  - packages/ui/src/templates/layouts/TaskLayout.tsx
  - packages/ui/src/organisms/MainHeader.tsx
  - packages/ui/src/organisms/SubHeader.tsx
  - packages/ui/visual-baselines
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by Bruk on the demo APK on his Fold (2026-10-20), screenshots in the conversation. In the screenshots (1080 px wide):
- The '+' in Add an item and 'Paste' in the recipe link field sit about 3 px from the field's top and 22 px from its bottom.
- Text fields' visible edges sit about 8 px inside the edges of the list rows, the tab bar and the bottom action button in the same column.

## Affected users and systems
TextField, AddBar, LabelledField; Groceries, Add a meal and every form.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The inline buttons in AddBar and the recipe link field are centred vertically in their field, with equal inset on top, right and bottom
- [ ] #2 A text field's visible edge lines up with the rows, cards and action buttons in the same column on Groceries and Add a meal
- [ ] #3 The visual baselines show both, and the focus ring still shows
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Cause 1: Button small and icon variants set alignSelf flex-start, which beats the row's alignItems center, so the inline button sits at the top. Fix: wrap the inline button in a View with alignSelf center in TextField; inset becomes 4 on top, right and bottom (52 inner, 44 button, paddingHorizontal 4). Cause 2: field containers (TaskLayout content, MainHeader) pad 20 while rows, tab bar and ActionBar use 16. Fix: TextField wrap gets marginHorizontal -4 so the visible edge lands on the 16 gutter; no layout file touched. Regenerate baselines for fields and templates containing them. Modified files: packages/ui/src/atoms/TextField.tsx, packages/ui/visual-baselines/*
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built. Cause 1: Button's small and icon variants set alignSelf flex-start, which overrode the field row's alignItems center; TextField now wraps the inline button in a View with alignSelf center, giving 4 px inset top, right and bottom (52 inner height, 44 button, 4 horizontal padding). Cause 2: TaskLayout content and MainHeader pad 20 while rows, the tab bar and ActionBar use 16; TextField's wrap now has marginHorizontal -4 so its visible edge lands on the 16 gutter (covers AddBar, LabelledField and every form). No layout files touched (TASK-29 clear). Checks: pnpm check passed, pnpm typecheck clean, full pnpm test 104 files / 1381 tests passed, visual:update ran (326 views, axe and 44x44 passed). Changed baselines: atoms-textfield--* (11), molecules-addbar--* (4), molecules-labelledfield--* (5), organisms-mainheader--groceries, templates-grocery-list--* (all, with fold variants), templates-invite-retry--*, templates-item-picker--typing, templates-kitchen-setup--*, templates-meal-form--rest (with fold variants), plus manifest.json; reason: fields are 8 px wider and inline buttons are centred. Focus baselines (atoms-textfield--focus, inline-focus, addbar--focus, labelledfield--focus) regenerated and the ring still draws. Not done: not verified on the Fold device; baselines need Bruk's approval and the Linux workflow is the reference.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(298 earlier lines omitted)
```text
                          [36m/>[39m
                          [36m<circle[39m
                            [33mcx[39m=[32m"13"[39m
                            [33mcy[39m=[32m"15"[39m
                            [33mfill[39m=[32m"#EFE6CF"[39m
                            [33mr[39m=[32m"5"[39m
                            [33mstroke[39m=[32m"#D8CDB4"[39m
                            [33mstroke-width[39m=[32m"1.5"[39m
                          [36m/>[39m
                        [36m</g>[39m
                        [36m<g>[39m
                          [36m<path[39m
                            [33md[39m=[32m"M44 56c2-13 4-26 7-39"[39m
                            [33mfill[39m=[32m"none"[39m
                            [33mstroke[39m=[32m"#D8CDB4"[39m
                            [33mstroke-linecap[39m=[32m"round"[39m
                            [33mstroke-width[39m=[32m"7"[39m
                          [36m/>[39m
                          [36m<path[39m
                            [33md[39m=[32m"M44 56c2-13 4-26 7-39"[39m
                            [33mfill[39m=[32m"none"[39m
                            [33mstroke[39m=[32m"#F7F2E6"[39m
                            [33mstroke-linecap[39m=[32m"round"[39m
                            [33mstroke-width[39m=[32m"4.5"[39m
                          [36m/>[39m
                          [36m<circle[39m
                            [33mcx[39m=[32m"51"[39m
                            [33mcy[39m=[32m"15"[39m
                            [33mfill[39m=[32m"#EFE6CF"[39m
                            [33mr[39m=[32m"5"[39m
                            [33mstroke[39m=[32m"#D8CDB4"[39m
                            [33mstroke-width[39m=[32m"1.5"[39m
                          [36m/>[39m
                        [36m</g>[39m
                        [36m<g>[39m
                          [36m<path[39m
                            [33md[39m=[32m"M32 57V22"[39m
                            [33mfill[39m=[32m"none"[39m
                            [33mstroke[39m=[32m"#D8CDB4"[39m
                            [33mstroke-linecap[39m=[32m"round"[39m
                            [33mstroke-widt...
 ❯ waitForWrapper node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:86:33
 ❯ apps/mobile/src/routes/kitchen.route.test.tsx:59:18
     57|
     58|     fireEvent.click(screen.getByRole('button', { name: 'Start planning…
     59|     await screen.findByText('Nothing on the list yet');
       |                  ^
     60|     const box = screen.getByRole('textbox', { name: 'Add an item' });
     61|     fireEvent.change(box, { target: { value: 'Oat milk' } });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 103 passed (104)
      Tests  1 failed | 1380 passed (1381)
   Start at  19:15:53
   Duration  228.04s (transform 6.96s, setup 1.65s, import 81.97s, tests 81.30s, environment 36.32s)

[ELIFECYCLE] Test failed. See above for more details.
```

Review (philosophy:reviewer, 2026-10-20): NOT CLOSED.
#1 met: inline button wrapped in alignSelf:center, 4 px inset top/right/bottom; compare pass (pnpm --filter @grocs/ui visual) checked 326 views, all match the regenerated baselines, axe and 44x44 pass. Ticked.
#2 not met in a way that holds (left unticked). TextField's wrap gets marginHorizontal:-4, so the atom assumes its container pads 20. It lines up on Groceries (MainHeader 20) and Add a meal (TaskLayout 20 beside ActionBar 16), but in the same TaskLayout column anything else at the 20 gutter now sits 4 inside the field: KitchenSetup's InviteCard, InviteRetry and ItemPicker content. Any field placed in a 16 container (MainLayout content, a card, ActionBar) would overhang by 4. The label and error text in the wrap shift too. The mismatch is in the gutters: TaskLayout content/footer and MainHeader pad space[20] while MainLayout, rows, tab bar and ActionBar pad space[16]. Fix: drop the negative margin and bring TaskLayout and MainHeader to space[16] (or one shared gutter token). TaskLayout is in packages/ui/src/templates/layouts, which TASK-29 is changing now, so sequence after TASK-29 or coordinate with it.
#3 left unticked: the baselines will be regenerated once #2 is redone; the focus ring shows in the current focus baselines. Regenerated baselines are not approved; Bruk approves them before main.
Full-tier check exited 1: apps/mobile/src/routes/kitchen.route.test.tsx 'creating a kitchen > shows the invite link and code, then Groceries works on that kitchen' timed out at findByText('Nothing on the list yet'). Reran alone: worktree 1 fail in 6 runs, main 0 in 6. Looks like a timing flake rather than this styling change, but unproven; confirm on the redo's full check.

Redo of #2 after review: merged main (TASK-29 landed; only conflicts were the task file's updated_date and the visual manifest, which I regenerated). Removed TextField's marginHorizontal -4. Fixed the gutters instead: TaskLayout content and footer, MainHeader and SubHeader now pad space[16], the same as MainLayout, rows, the tab bar and ActionBar, so no atom depends on its container. TaskLayout was touched for the two padding values only, on top of TASK-29's inset work; StageLayout and SignInTemplate untouched. Checks: pnpm check, pnpm typecheck clean, full pnpm test 106 files / 1418 tests passed, visual:update (353 views) then visual compare pass (353 images compared, axe and 44x44 pass). Baselines changed vs main: atoms-textfield--* (11) and molecules-addbar/labelledfield--* (9): inline button centred; organisms-mainheader--groceries and --meal-plan, organisms-subheader--back/line/wordmark: 16 gutter; templates grocery-list, invite-join, invite-retry, item-picker, kitchen-setup, meal-form, meal-plan, preferences (all existing stories with fold variants): header and fields at 16 gutter plus centred buttons. New on-phone baselines (TASK-29) were regenerated with the new gutters. Fields' visible edges now match rows, cards and action buttons. Not verified on the Fold; baselines need Bruk's approval. The earlier kitchen.route.test flake did not recur in this full run.
<!-- SECTION:NOTES:END -->
