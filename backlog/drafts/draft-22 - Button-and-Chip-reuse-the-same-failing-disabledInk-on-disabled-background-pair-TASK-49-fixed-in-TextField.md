---
id: DRAFT-22
title: >-
  Button and Chip reuse the same failing disabledInk-on-disabled-background pair
  TASK-49 fixed in TextField
status: Draft
assignee: []
created_date: '2026-10-24 23:32'
labels: []
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-49 replaced tokens.color.disabledInk with tokens.color.inkMuted for TextField's disabled state because disabledInk (#7D877F) on tokens.color.disabled (#E3E7DF) computes to 2.97:1, well under WCAG AA's 4.5:1. Two other components still pair exactly those two tokens: packages/ui/src/atoms/Button.tsx (ink at line 47, background at line 107) and packages/ui/src/atoms/Chip.tsx (colour at line 33, background at line 81). The ratio is identical, so the text in a disabled Button or Chip is as unreadable as TextField's was. axe does not flag it: those components render as disabled/aria-disabled controls, and axe's color-contrast rule exempts disabled controls, which is why pnpm --filter @grocs/ui visual passes at 407 story views with the bug present. TabItem.tsx:29 and RailLink.tsx:29 also use disabledInk but do not set the disabled background in the same file; their effective background needs checking before deciding whether they are affected. inkMuted (#4E5B52) is 5.70:1 on the disabled background and is the colour TASK-49 already settled on, so the fix is likely the same substitution plus a pinning test, but the visual change to filled Buttons should be eyeballed in Storybook rather than assumed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Disabled Button and disabled Chip text meets WCAG AA 4.5:1 against their disabled background, with the chosen colour and computed ratio recorded
- [ ] #2 TabItem and RailLink disabled text is checked against its real background and either fixed or recorded as already passing with the ratio
- [ ] #3 A regression test pins the disabled-state colour for each component changed, since axe's disabled-control exemption means the visual gate cannot catch a regression here
<!-- AC:END -->
