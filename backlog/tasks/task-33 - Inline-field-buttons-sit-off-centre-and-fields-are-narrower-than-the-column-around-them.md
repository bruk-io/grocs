---
id: TASK-33
title: >-
  Inline field buttons sit off centre, and fields are narrower than the column
  around them
status: To Do
assignee: []
created_date: '2026-10-20 22:33'
updated_date: '2026-10-20 23:10'
labels:
  - size-2
  - layer-ui
dependencies: []
modified_files:
  - packages/ui/src/atoms/TextField.tsx
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
- [ ] #1 The inline buttons in AddBar and the recipe link field are centred vertically in their field, with equal inset on top, right and bottom
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
<!-- SECTION:NOTES:END -->
