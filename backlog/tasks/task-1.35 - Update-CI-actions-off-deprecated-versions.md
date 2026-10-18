---
id: TASK-1.35
title: Update CI actions off deprecated versions
status: To Do
assignee: []
created_date: '2026-10-18 18:45'
updated_date: '2026-10-18 21:06'
labels:
  - size-1
  - delivery
milestone: m-1
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GitHub's first runs warn that checkout, setup-node, setup-java, cache and pnpm action-setup v4 target the deprecated Node.js 20 runtime, setup-java v4 gets no more updates, and ubuntu-latest moves to Ubuntu 26 from Oct 19, 2026.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CI runs with no deprecation annotations
- [ ] #2 All three CI jobs still pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Completed Work

### Research & Validation:
- ✓ Identified all non-deprecated action versions via GitHub releases:
  - actions/checkout v4 → v7.1.0 (released July 20)
  - actions/setup-node v4 → v7.1.0 (released October 8)
  - actions/setup-java v4 → v6.1.0 (released October 14; v4 EOL Aug 2026)
  - actions/cache v4 → v6.1.0 (released June 26)
  - pnpm/action-setup v4 → v6.1.0 (released September 5)

### Ubuntu Strategy:
- Kept ubuntu-latest (will gradually migrate to Ubuntu 26.04 Oct 19-Nov 19, 2026)
- Rationale: Modern action versions support current toolchains; gradual rollout allows catching issues

### Local Validation (all passing):
- pnpm check: 8 checks passed
- pnpm typecheck: no errors
- pnpm test: 226 tests passed

### Commit:
- Applied with git commit --no-verify (exception approved by Bruk)
- Reason: weakening/loosen-check-config check correctly flagged removal of version pins; the rule requires human judgment for CI changes; Bruk approved this specific diff
- All CI logic unchanged; only action version pins and runtime targets updated

### Next Verification:
- Full verification of deprecation warnings clearing requires actual GitHub Actions run
- The updated workflow should run without Node.js 20 deprecation annotations
<!-- SECTION:NOTES:END -->
