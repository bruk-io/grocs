---
id: TASK-10.5
title: Storybook published to GitHub Pages for friends without Android
status: In Progress
assignee:
  - '@builder'
created_date: '2026-10-19 14:28'
updated_date: '2026-10-19 14:48'
labels:
  - size-2
  - ci
dependencies: []
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-10: iPhone friends open every screen and component in a browser. A workflow builds Storybook and deploys it to GitHub Pages on each push to main. Pages on this plan needs the repo public, so the site goes live when Bruk flips the visibility; until then the workflow must not fail CI.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A workflow builds Storybook and deploys it to GitHub Pages on push to main, and does nothing harmful while the repo is private
- [ ] #2 The README and the workflow say the Pages URL and that it goes live when the repo is public
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Files: .github/workflows/storybook-pages.yml (new). Not README.md (Bruk writes it in parallel).
1. Verify the base path first: build Storybook, serve packages/ui/storybook-static under a /grocs/ prefix, load it in Chromium (Playwright's, from PLAYWRIGHT_BROWSERS_PATH), and check the iframe, the manager, the fonts (Fredoka, Nunito woff2) and a story all load with no 404 under /grocs/. If Storybook's default relative base breaks, set it in the workflow or .storybook/main.ts viteFinal base.
2. Workflow storybook-pages.yml: on push to main plus workflow_dispatch; runs-on ubuntu-24.04; same setup as ci.yml bundles job (checkout@v7, pnpm/action-setup@v6, setup-node@v7 node 24 cache pnpm, pnpm install --frozen-lockfile, pnpm --filter @grocs/ui build-storybook). Job build: builds, asks the Pages API whether Pages is on with a GitHub Actions source (gh api repos/$GITHUB_REPOSITORY/pages, any failure -> output deploy=false plus a notice), uploads the artifact (actions/upload-pages-artifact@v5) only when deploying. Job deploy (needs build, if deploy == 'true', environment github-pages, pages: write + id-token: write, actions/deploy-pages@v5). Private repo or Pages off: build runs green, deploy is skipped, nothing fails. No continue-on-error (weakening check flags it). concurrency group pages, no cancel. Workflow comment states https://bruk-io.github.io/grocs/ and that it goes live once the repo is public and Pages source is GitHub Actions.
3. Prove: actionlint (pip/npx) on the workflow; run the check-script logic locally against a stubbed gh for the 404 / legacy / workflow cases; pnpm check; pnpm typecheck.
4. Report in the task notes; commit on the worktree branch through the hook.
Risk: AC #2 also mentions the README, which I am told not to edit; I tick only the workflow half and hand the URL to Bruk.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Started: builder agent in worktree agent-ac2b92d54102b1cc6.

Report (builder). Added the workflow storybook-pages.yml in the workflows folder, three jobs on ubuntu-24.04: gate (asks the Pages API whether Pages is on with source GitHub Actions; any other answer sets deploy=false, writes the reason to the run summary and a notice, exits 0), build (only when deploy=true: same setup as the ci.yml bundles job, build-storybook, upload-pages-artifact v5), deploy (environment github-pages, deploy-pages v5). Private repo or Pages off: gate is green, build and deploy are skipped. No continue-on-error. Triggers: push to main and workflow_dispatch. The workflow comment states https://bruk-io.github.io/grocs/ and that it goes live when the repo is public and Pages source is GitHub Actions.

Sub-path proof: Storybook 10.6.2 builds with relative asset paths, so no base config was needed. Served packages/ui/storybook-static under /grocs/ only (everything outside the prefix returns 404 and is logged) and loaded it in Playwright's Chromium: the manager, a story iframe (templates-grocery-list--groceries) and a manager deep link. Result: 0 bad responses, 0 failed requests, 0 page errors, 0 requests outside /grocs/; Fredoka 600 and 700 and Nunito 600 and 800 loaded (woff2 requests all 200). A screenshot of the deep link showed the sidebar, toolbar and story drawn.

Workflow proof: actionlint 1.7.12 reports 0 errors. The gate script was syntax-checked and run against a stub of the GitHub CLI for four cases (404, 403, legacy source, workflow source): deploy is false, false, false, true, and every run exits 0. The repo checks and the typecheck both passed.

Not provable without a public repo: that the workflow token with pages read permission may call the Pages API, and the deploy itself. If the gate says Pages is unavailable on a public repo that has Pages on, read the API message in the run summary. Open: AC 2 also names the README; Bruk is writing it and will link the URL, so only the workflow half is done here. Action versions come from release pages (upload-pages-artifact 5.0.0, deploy-pages 5.0.0, both Node 24), because the sandbox could not call the API for those repos.
<!-- SECTION:NOTES:END -->
