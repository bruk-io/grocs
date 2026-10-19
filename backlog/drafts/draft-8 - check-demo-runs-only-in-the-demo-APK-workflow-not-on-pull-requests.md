---
id: DRAFT-8
title: 'check:demo runs only in the demo APK workflow, not on pull requests'
status: Draft
assignee: []
created_date: '2026-10-19 19:03'
labels:
  - size-1
  - ci
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-10.4 added pnpm check:demo (tools/demo-bundle.ts) and runs it only in .github/workflows/demo-apk.yml, which triggers on apk/**, demo-v* tags and by hand. ci.yml does not run it, so a change on main that pulls Firebase into the demo bundle is only caught when Bruk cuts a demo tag, after merge, and the tag then gets no Release.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ci.yml runs pnpm check:demo on pull requests and pushes to main, or the reason it can't is written in ci.yml
<!-- AC:END -->
