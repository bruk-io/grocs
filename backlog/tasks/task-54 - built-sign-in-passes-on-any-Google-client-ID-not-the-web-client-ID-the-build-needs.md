---
id: TASK-54
title: >-
  built-sign-in passes on any Google client ID, not the web client ID the build
  needs
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 18:52'
updated_date: '2026-11-06 18:53'
labels:
  - size-1
  - release
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Follow-up from TASK-53's review. tools/built-sign-in.ts accepts any *.apps.googleusercontent.com string in the shipped bundle. A bundle carrying only some other Google client ID (an iOS or Android OAuth client, or a stale one) would pass while GoogleSignin.configure() still gets the wrong webClientId, so Firebase rejects the token or Android hits DEVELOPER_ERROR.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 In CI, the check fails unless the bundle carries the exact EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID of the EAS environment the build used
- [ ] #2 In CI, the check fails with the reason when it was not given the expected ID, rather than falling back to any ID
- [ ] #3 Run locally without an expected ID, the check still reports the IDs it found
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. tools/built-sign-in.ts: pure verdict(ids, expected, inCi) -> pass/fail with reason; main reads EXPECTED_GOOGLE_WEB_CLIENT_ID and CI.
2. release.yml (additive only, R57): a step per job writes EXPECTED_GOOGLE_WEB_CLIENT_ID to GITHUB_ENV from eas env:get (production for iOS, preview for Android).
3. Tests for verdict; run the tool against build 9's IPA with the right ID, a wrong ID, and CI=1 with none.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06: verdict() decides from (ids found, expected ID, inCi); 5 new unit tests. release.yml gains one additive step per job writing EXPECTED_GOOGLE_WEB_CLIENT_ID to GITHUB_ENV from eas env:get (production for iOS, preview for Android); no existing line removed (R57). The step's shell, run locally, wrote EXPECTED_GOOGLE_WEB_CLIENT_ID=950648718006-qf0b... Against build 9's IPA: right ID with CI=1 exit 0; wrong (iOS client) ID with CI=1 exit 1 built-sign-in/wrong-web-client-id; CI=1 with none exit 1 built-sign-in/no-expected-id; build 8 exit 1 built-sign-in/no-web-client-id; local with none exit 0 listing the ID found. The in-CI run of the new step is proven only on the next release.
<!-- SECTION:NOTES:END -->
