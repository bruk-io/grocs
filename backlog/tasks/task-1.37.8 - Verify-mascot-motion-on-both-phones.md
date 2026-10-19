---
id: TASK-1.37.8
title: Verify mascot motion on both phones
status: To Do
assignee:
  - '@bruk'
created_date: '2026-10-19 05:28'
labels:
  - size-2
  - layer-app
  - design-system
milestone: m-2
dependencies: []
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.30. The Mascot's motion (Reanimated CSS animations on react-native-svg, decision-5) is verified only in the browser; R64 says a component is signed off on the phones. Enoki's stalks sway together and Cremi's cap wobble was dropped, because group transforms don't animate on the phones per decision-5. Wiring the phone's reduce-motion setting into MotionProvider is part of TASK-1.37.4.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On iOS and both Fold screens, each mushroom's idle motion, tap reaction, bubble and blink run without errors in the on-device Storybook
- [ ] #2 Bruk has looked at Enoki's and Cremi's motion on a phone and either accepted it or filed a task for out-of-step stalks or the cap wobble
<!-- AC:END -->
