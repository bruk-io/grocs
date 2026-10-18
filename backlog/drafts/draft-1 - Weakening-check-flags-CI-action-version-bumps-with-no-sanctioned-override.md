---
id: DRAFT-1
title: Weakening check flags CI action version bumps with no sanctioned override
status: Draft
assignee: []
created_date: '2026-10-18 21:59'
labels: []
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
weakening/loosen-check-config (R57) treats any line removal in .github/workflows/* as loosening, so a routine action version bump (actions/checkout@v4 -> @v7) fails the check. TASK-1.35 could only land by committing with git commit --no-verify, with the approval recorded in prose in the commit body; running 'node tools/checks/run.ts --mode ci --base 0a26823~1' on current main still FAILs on that diff.

Two consequences:
- There is no sanctioned override path, so every future workflow bump either bypasses the hook or stalls. fix-the-code-not-the-check.md says a person makes the call, but nothing records that call in a form the check can see.
- The ci-mode step in ci.yml is gated on 'github.event_name == pull_request', so the same diff passes on a push to main and fails as a PR. The check's verdict depends on how the change arrives.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A version-only bump of a pinned action or tool in .github/workflows/* does not trigger weakening/loosen-check-config
- [ ] #2 A genuine loosening of a workflow (adding continue-on-error, excluding a path, dropping a step) still fails the check
- [ ] #3 Where a human override is allowed, it is recorded somewhere the check reads, not only in a commit message
<!-- AC:END -->
