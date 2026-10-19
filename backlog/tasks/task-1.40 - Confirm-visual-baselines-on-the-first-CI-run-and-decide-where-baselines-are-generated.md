---
id: TASK-1.40
title: >-
  Confirm visual baselines on the first CI run, and decide where baselines are
  generated
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 04:32'
updated_date: '2026-10-19 11:33'
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
- [x] #1 The bundles job's browser pass has passed on CI against the committed baselines, or the baselines were regenerated in the CI environment and committed with the manifest through visual:update
- [ ] #2 The repo documents one environment where baselines are generated (a CI job, a pinned container, or the sandbox) and how to regenerate them there
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-19: criterion 1 is met. CI run 39200078012's bundles job compared all 39 story images against the committed baselines and passed (visual: 39 story views checked, 39 images compared). Criterion 2 (document where baselines are generated) remains.

Criterion 1 met before acceptance: every CI run since 39200540301 has run the browser pass against the committed baselines and passed (latest 39231108029 on 2f40096). Accepted Oct 19, 2026 (Bruk: wrap up the UI portions).

Built by the orchestrator (Oct 19, 2026), commit 75237b0. Chosen environment: a manual workflow, .github/workflows/visual-baselines.yml, on the runner image and Chromium the browser pass uses. It runs visual:update and uploads the baselines as an artifact; it never commits, so a change is still reviewed as images (decision-11). The regenerate commands are at the top of the workflow; CLAUDE.md's Workspace section and visual:update's refusal on macOS point to it. Proof: run 39244676209 on be13e0e wrote 305 files (304 images and the manifest) byte-identical to the committed packages/ui/visual-baselines (diff -rq clean). The first run (39241970034) failed axe at random on mascot bubbles mid-fade; filed and fixed as TASK-1.41.
<!-- SECTION:NOTES:END -->
