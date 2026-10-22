---
id: TASK-24
title: Pin the CI runner image so a GitHub image move can't fail every browser pass
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 12:40'
updated_date: '2026-10-22 04:41'
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

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(670 earlier lines omitted)
```text
│  3.40 kB │ gzip:   1.44 kB
│  storybook-static/assets/SignInTemplate.stories-DMGDd-zy.js
│  3.43 kB │ gzip:   1.58 kB
│  storybook-static/assets/MealRail-C0jD0Wlr.js
│  3.75 kB │ gzip:   1.49 kB
│  storybook-static/assets/ItemPickerTemplate.stories-CH23T94O.js
│  4.44 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-xDNgEJLQ.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/TextField-CzXDmluD.js
│  4.64 kB │ gzip:   1.78 kB
│  storybook-static/assets/PreferencesTemplate.stories-B6X6L1GZ.js
│  4.69 kB │ gzip:   1.82 kB
│  storybook-static/assets/ItemRow-CL-odj_r.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/Button-mAbb9PVx.js
│  6.43 kB │ gzip:   2.03 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-DZZS859y.js
│  9.35 kB │ gzip:   3.11 kB
│  storybook-static/assets/Mascot-9wOdy4H3.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-BrtJGt-P.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-DLUJ5bxM.js
│  17.99 kB │ gzip:   5.00 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-V5bZC6s3.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-CYAHSAHA.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-BjFF9lkE.js
│  1,360.62 kB │ gzip: 392.04 kB

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

│  Vite ✓ built in 1.15s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 398 story views checked (axe, 44 x 44, images not compared)
```

Reviewer's pass (philosophy:reviewer, not the author). Closed: both acceptance criteria met, verified against current main rather than the notes.

AC #1 - verified from the repo, not the report: grep -rn 'ubuntu-latest' .github/workflows/ returns nothing (exit 1); all three ci.yml jobs (lines 15, 39, 61) and visual-baselines.yml's one job (line 25) read ubuntu-24.04, matching storybook-pages.yml and demo-apk.yml. Judged, not assumed, on 'named in one place': the image is literally written in four places across the two files (ten repo-wide), not hoisted into one env var or reusable-workflow input. Passed on the accepted plan's reading - one image, consistently - with AC #2's documented bump procedure as the mitigation, which visual-baselines.yml's header concedes explicitly ('bump the pin here and in ci.yml's three jobs together'). A future hardening could hoist the literal; not required by this finish line.

AC #2 - visual-baselines.yml's header comment (lines 3-8) documents the procedure: both files pin the same image, and when GitHub deprecates it, bump here and in ci.yml's three jobs together, then regenerate the baselines through this same workflow before merging.

Weakening-override integrity re-derived independently with sha256, not taken on trust. Both entries' hashes match exactly: ci.yml beforeHash 7708c061 = git show 1126992^:.github/workflows/ci.yml, afterHash 5de2305a = git show 1126992:.github/workflows/ci.yml; visual-baselines.yml beforeHash cd85be2e and afterHash 9ef1bcab likewise, and that file's afterHash still equals its current content. ci.yml's current content (ae6ab8db) differs from its afterHash, which is correct and not a finding: commit 618be1e (TASK-38) legitimately changed the file afterwards, and an override is scoped to the exact diff pair it approved. Approval provenance is sound - Bruk in chat 2026-10-21, not self-approved.

Full tier recorded above, exited 0. One caveat for future readers: that run carried unrelated in-flight TASK-41 edits from a concurrent session in the same working tree (file mtimes 00:37-00:39 fall inside the check window), so some steps read pre-edit and some post-edit content. Harmless for this task - both workflow YAMLs are clean in git status and outside those edits - but the 0 should not be read as 'clean main'. Not re-run, since it would be no cleaner while that session is live.

Findings, all outside this task's scope and reported to the orchestrator rather than filed as drafts, because they are another session's live work in progress and not board-worthy bugs: (high) packages/providers-firebase/src/firestore-sync-store.ts has an uncommitted deliberate production break, onItems([]) with a 'TEMP: reverted immediately after' comment, which nothing tracks if that session dies; (medium) apps/mobile/src/composition/two-client.emulator.test.ts moves the 3 s sync assertion behind if (round === 1), loosening a test gate - the kind of change tools/hooks/pre-edit.ts's deny path existed to catch, and nothing did while it is unregistered in .claude/settings.json. No finding against TASK-24 itself.
<!-- SECTION:NOTES:END -->
