---
id: DRAFT-2
title: >-
  Confirm visual baselines on the first CI run, and decide where baselines are
  generated
status: Draft
assignee: []
created_date: '2026-10-19 04:32'
labels:
  - size-2
  - testing
milestone: m-2
dependencies: []
parent_task_id: TASK-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.37.6. The baselines in packages/ui/visual-baselines/ were generated in the cloud agent sandbox. CI installs Chromium with 'playwright-core install --with-deps chromium' on ubuntu-latest. The browser build matches (playwright-core 1.64.1, headless shell revision 1248), but system fonts, freetype and fontconfig on the runner can differ for any glyph that falls back past the bundled fonts, against a 0.1% tolerance. Nothing pins the runner image, and CI cannot regenerate baselines, so a mismatch would block every pull request until someone regenerates them by hand on another Linux machine.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The bundles job's browser pass has passed on CI against the committed baselines, or the baselines were regenerated in the CI environment and committed with the manifest through visual:update
- [ ] #2 The repo documents one environment where baselines are generated (a CI job, a pinned container, or the sandbox) and how to regenerate them there
<!-- AC:END -->
