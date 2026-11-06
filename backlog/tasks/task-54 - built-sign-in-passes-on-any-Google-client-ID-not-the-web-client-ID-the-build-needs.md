---
id: TASK-54
title: >-
  built-sign-in passes on any Google client ID, not the web client ID the build
  needs
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 18:52'
updated_date: '2026-11-06 19:18'
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
- [x] #1 In CI, the check fails unless the bundle carries the exact EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID of the EAS environment the build used
- [x] #2 In CI, the check fails with the reason when it was not given the expected ID, rather than falling back to any ID
- [x] #3 Run locally without an expected ID, the check still reports the IDs it found
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

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(668 earlier lines omitted)
```text
│  3.40 kB │ gzip:   1.44 kB
│  storybook-static/assets/MealRail-Cuo5YPfO.js
│  3.74 kB │ gzip:   1.49 kB
│  storybook-static/assets/MealFormTemplate.stories-CO7SGPBn.js
│  4.32 kB │ gzip:   1.57 kB
│  storybook-static/assets/ItemPickerTemplate.stories-C2hsARQQ.js
│  4.44 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-D5eXwH2W.js
│  4.47 kB │ gzip:   1.30 kB
│  storybook-static/assets/PreferencesTemplate.stories-C-OHZbA-.js
│  4.69 kB │ gzip:   1.82 kB
│  storybook-static/assets/TextField-B_wGVCnP.js
│  4.98 kB │ gzip:   1.91 kB
│  storybook-static/assets/ItemRow-NZ5KgLd6.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/Button-BSNfhlQn.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-DSOSRXVh.js
│  9.35 kB │ gzip:   3.10 kB
│  storybook-static/assets/Mascot-akOYPpvL.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-CLG4T_VG.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-Clugwqz9.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-BCf9tTTn.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-Bd43CqIF.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-fT1uqcH6.js
│  1,360.62 kB │ gzip: 392.03 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 1.22s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 410 story views checked (axe, 44 x 44, images not compared)
```

Review (philosophy:reviewer): all three criteria met and ticked, but NOT closed: close-task refused because a bug closes with its repro recorded (record-check TASK-54 --repro -- <failing test>, or a note starting 'No repro:'). The worker recorded neither. A repro exists: the pre-fix tool (ad102d5^:tools/built-sign-in.ts) run on build 9's IPA with the iOS client ID expected passes, and the new unit test 'fails a bundle that carries only some other Google client ID' fails against it. Evidence: full check exit 0; reproduced all five tool runs (right ID pass; wrong ID -> wrong-web-client-id; CI none -> no-expected-id; build 8 -> no-web-client-id; local none -> pass listing the ID). release.yml environments match the build profiles (production iOS, preview Android); a missing eas env:get line fails the step under bash -e, and an empty value falls to no-expected-id. Findings, none filed: (low) the CI step's first live run is the next release; (low) Boolean(process.env.CI) treats CI=false as CI, which only makes it stricter; (info) iOS step reading the newest build is TASK-55.

Repro at ad102d5a8620, test files: ../../../../../../private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/repro54/rejects-wrong-id.sh, ../../../../../../private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/repro54/built-sign-in.ts, ../../../../../../private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/ipa9/app.ipa; command: `/private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/repro54/rejects-wrong-id.sh /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/repro54/built-sign-in.ts /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/ipa9/app.ipa` exited 1

```text
BUG: /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/repro54/built-sign-in.ts accepted /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/ipa9/app.ipa although it lacks the expected client ID 950648718006-qbdlrjkjt6f5lmc0c1aihstprp5ok5l8.apps.googleusercontent.com
```

Repro (above) runs the pre-fix tool (git show ad102d5^:tools/built-sign-in.ts) against build 9's IPA with the iOS client ID as the expected ID: it exits 0, accepting a bundle that lacks that ID. The same script against the fixed tools/built-sign-in.ts prints 'ok: ... rejected a bundle without the expected client ID' and exits 0.

Review (philosophy:reviewer), second close attempt: NOT closed. The repro is sound (scratch copy byte-identical to ad102d5^:tools/built-sign-in.ts; script exits 1 against it, 0 against the fixed tool), but close-task refused: each recorded repro file (scratchpad/repro54/rejects-wrong-id.sh, scratchpad/repro54/built-sign-in.ts, scratchpad/ipa9/app.ipa) 'changed since ad102d5'. They live in the session scratchpad outside the repo, so git has no version of them at that commit and close-task reads them as edited. To close: record a repro whose files are tracked in the repo at the recorded commit (e.g. a committed test), or a 'No repro:' note saying why the IPA-based repro can't be committed.

No repro: the fix landed before a repro was recorded, and a failing repro needs a release binary (build 9's IPA), which does not belong in the repo, so none can be committed at the recorded commit. The out-of-repo run above stands as the evidence: the pre-fix tool (git show ad102d5^:tools/built-sign-in.ts, byte-identical copy confirmed by the reviewer) accepts build 9 with the iOS client ID as the expected ID and exits 1 in the repro script; the fixed tool rejects it. The committed unit test 'fails a bundle that carries only some other Google client ID' in tools/built-sign-in.test.ts covers the same case against verdict() going forward.

Review (philosophy:reviewer), third close attempt: NOT closed. The 'No repro:' note is present, but close-task still checks the earlier recorded repro ('Repro at ad102d5a8620, test files: ...scratchpad...') and refuses with the same three 'changed since ad102d5' findings. A 'No repro:' note does not cancel a recorded repro. To close, that recorded repro block has to stop counting (a human decision on how: remove or supersede it), or close-task needs to accept out-of-repo repro files.
<!-- SECTION:NOTES:END -->
