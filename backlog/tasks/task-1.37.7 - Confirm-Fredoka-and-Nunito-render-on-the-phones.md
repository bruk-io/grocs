---
id: TASK-1.37.7
title: Confirm Fredoka and Nunito render on the phones
status: To Do
assignee:
  - '@bruk'
created_date: '2026-10-19 05:16'
labels:
  - size-1
  - layer-app
  - design-system
milestone: m-2
dependencies: []
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Moved from TASK-1.37.1 criterion 6, which can't be proved without a phone, and filed from its review. apps/mobile/app/_layout.tsx registers the five @expo-google-fonts faces and layout-fonts.test.ts checks the names match NATIVE_FACES, but nothing has run on a phone. A failed load falls back to the system face silently (the layout draws anyway), and fontFace() falls back to the CSS family name on native for an unmapped weight. Needs dev builds on the Fold and an iPhone.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A development build on iOS and on Android shows the text atoms in Fredoka and Nunito at each weight, with screenshots in the notes
- [ ] #2 fontFace on native fails loudly (a test or type error) for a weight with no registered face, instead of falling back to the web family name
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Build a development build on the Fold and on an iPhone or simulator.
2. Open the on-device Storybook, or the app, at the text atoms and screenshot each weight.
3. Change fontFace so an unmapped weight is a type error or throws, with a test.
4. Attach the screenshots to the notes.

### Risks
- A face that silently falls back looks close to Nunito at a glance; compare letter shapes (g, y, a).

### Proof
- Screenshots from both platforms in the notes, and the new fontFace test.
<!-- SECTION:PLAN:END -->
