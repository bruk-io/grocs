---
id: TASK-10.1
title: MIT licence and a README that shows how the work ran
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 14:27'
updated_date: '2026-10-19 14:32'
labels:
  - size-2
  - docs
dependencies: []
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The public face of TASK-10. A visitor should learn what Grocs is in a paragraph, how to try it (the APK, the browser page), and how it was built: Bruk's philosophy plugin running an orchestrator and per-layer agents over a Backlog.md board, with links to real examples on this board (an intent, the spec, a decision, a review that refused to close, a follow-up filed from a finding, a bug found by the system's own checks).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 LICENSE holds the MIT licence for Bruk Habtu
- [ ] #2 README.md says what Grocs is, how to try it, how to run it locally, and how the work ran, linking at least five real board artefacts that exist on main
- [ ] #3 Every link in the README resolves to a file on main
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Write LICENSE (MIT, Bruk Habtu, 2026) and README.md at the root in Bruk's voice: what Grocs is (from TASK-1's problem), how to try it (Releases APK, Storybook on Pages), how the work ran with links to real board artefacts, how to run it locally, licence. Check every relative link resolves with a script.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator (Oct 19, 2026). README links eight board artefacts (TASK-1, doc-1, decision-3, decision-11, TASK-9's refused first review, TASK-1.39, TASK-1.41, TASK-1.36, TASK-1.37); a script confirmed every relative link resolves on main. One marked placeholder: the philosophy plugin link (PLACEHOLDER-philosophy-plugin-link), which only Bruk has. The Releases and Pages links go live with TASK-10.4 and TASK-10.5 and the visibility flip.
<!-- SECTION:NOTES:END -->
