---
id: TASK-24
title: Pin the CI runner image so a GitHub image move can't fail every browser pass
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 12:40'
updated_date: '2026-10-22 04:35'
labels:
  - testing
  - size-1
dependencies: []
modified_files:
  - .github/workflows/ci.yml
  - .github/workflows/visual-baselines.yml
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the TASK-1.40/1.41 review. ci.yml and visual-baselines.yml run on ubuntu-latest, and GitHub's annotation on run 39244676209 says that label moves to Ubuntu 26 from Oct 19, 2026. Both jobs move together, so the workflow stays the reference, but after the move the browser pass can fail on every pull request (font rendering) until someone regenerates the baselines.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Every job in ci.yml and visual-baselines.yml runs on one pinned Ubuntu image, named in one place
- [x] #2 The repo says how to move to a new image: bump the pin and regenerate the baselines through the visual baselines workflow in the same change
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In .github/workflows/ci.yml, pin all three jobs' runs-on from ubuntu-latest to ubuntu-24.04 (matching the pin already used in storybook-pages.yml and demo-apk.yml).
2. In .github/workflows/visual-baselines.yml, pin its one job's runs-on from ubuntu-latest to ubuntu-24.04, and extend its existing top-of-file comment (which already explains it shares an image with ci.yml's browser pass) with the bump procedure: when GitHub deprecates this image, bump the pin here and in ci.yml's three jobs together, then regenerate the baselines through this same workflow before merging.
3. Confirm no other workflow file under .github/workflows still says ubuntu-latest (storybook-pages.yml and demo-apk.yml already pin ubuntu-24.04; grep to be sure).

### Risks
Low: a version-only runner bump is exempt from weakening/loosen-check-config's line-removal finding, but worth confirming pnpm check still passes clean since this touches 4 runs-on lines across 2 protected CI config files.

### Proof
grep -rn 'ubuntu-latest' .github/workflows/ turns up nothing; pnpm check/typecheck/test all pass.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Pinned ubuntu-latest -> ubuntu-24.04 in all 3 ci.yml jobs and visual-baselines.yml's one job, matching the pin already used in storybook-pages.yml and demo-apk.yml. Extended visual-baselines.yml's header comment with the bump procedure for AC2. pnpm check (full mode) is clean, but the staged weakening check flags all 4 runs-on lines as weakening/loosen-check-config (ask): the existing version-bump exemption only recognizes 'uses: owner/repo@vN' and '*-version:' lines, and normalizeDigits can't match 'latest' against '24.04' as a digit-only change anyway, so this specific diff needs a human-approved override entry in weakening-overrides.json, same as TASK-3's flag removal. Asked Bruk directly in chat rather than self-approving. Change is staged, uncommitted, pending that approval.

Bruk approved the weakening-override in chat, 2026-10-21. Both runs-on pins (ci.yml's three jobs, visual-baselines.yml's one) now applied and recorded in tools/checks/weakening-overrides.json with exact before/after content hashes. pnpm check (staged mode) passes clean with the override matched.
<!-- SECTION:NOTES:END -->
