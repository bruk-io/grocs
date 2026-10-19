---
id: TASK-10.6
title: 'check:release can''t see test fakes or demo code in a release bundle'
status: Done
assignee:
  - '@builder'
created_date: '2026-10-19 15:52'
updated_date: '2026-10-19 16:42'
labels:
  - size-2
  - testing
dependencies: []
references:
  - >-
    backlog/decisions/decision-12 -
    Demo-build-an-in-memory-provider-package-not-the-test-fakes.md
parent_task_id: TASK-10
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-10.3 builder (Oct 19, 2026). tools/release-bundle.ts DEV_ONLY_PATH matches apps/mobile/src/dev/, .rnstorybook/, packages/*/src/testing/ and test, spec and story files. The fakes live at packages/ports/src/auth/fake.ts, sync-store/fake.ts and test-support.ts, so a fake reaching a real release bundle passes unnoticed (R49, R53). After decision-12 the demo variant ships a demo composition and packages/providers-memory, and neither may reach the real release bundles.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 check:release fails when a test fake, a contract suite, the demo composition or the in-memory provider is in a real release bundle, and each failure names the rule and why
- [x] #2 Like the existing dev-code self-check, it proves it can see each pattern, so a pattern that matches nothing fails rather than passing blind
- [x] #3 Tests cover each new pattern, and the real release bundles pass today
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Files that change: tools/release-bundle.ts, tools/release-bundle.test.ts (nothing else; no existing pattern is removed or narrowed).

1. Rules. Keep RULE (dev-code-in-release) as is. Add three rules, each with its own id, requirement refs, summary, why and fix, so every failure names the rule and why: release-bundle/test-fake-in-release (R48, R49, R53), release-bundle/contract-suite-in-release (R48, R53), release-bundle/demo-in-release (decision-12). Each pattern carries its rule (default RULE); findDevModules returns it; formatLeak prints one block per rule. formatLeak(platform, leaks) keeps working for leaks without a rule.
2. Patterns, matched on Metro's bundled module paths, limited to apps/ and packages/ and never inside node_modules, so a third-party file named like a fake cannot trip it:
   - test fakes: any module whose file name contains "fake" (fake.ts, fakes.ts, FakeAuth.ts, auth.fake.ts). Today: packages/ports/src/{auth,clock,ids,logging,sync-store}/fake.ts.
   - test support: packages/*/src/test-support.* and packages/*/src/testing.* (the entry that decision-12 and the existing "testing/ subpath" pattern assume but that only matches a testing/ folder; ports uses a file, src/testing.ts and src/test-support.ts), plus apps/mobile/testing/.
   - contract suites: file name contract.* / *.contract.* / contracts.*.
   - demo composition: apps/mobile/src/demo/.
   - in-memory provider: packages/providers-memory/.
3. Proving it can see each pattern. The existing self-check (dev bundle must reach src/dev) stays for the bundle format. It cannot cover the new patterns: the dev bundle reaches no fake, and the demo code is built by other tasks and is in no bundle this script builds. So add a second self-check against the repo's own files (git ls-files, tracked plus untracked, so a file being written is seen too), in a pure function selfCheck(files, patterns) so it is unit-tested:
   a. A pattern must match at least one real file, unless it declares a "home" directory (where another task will put the code) that holds no files yet. Today the fake, test-support, contract and existing patterns all match files, so a typo in them fails. demo and providers-memory declare homes apps/mobile/src/demo and packages/providers-memory; with the folders missing the check passes, and it starts to bite the moment a file appears there.
   b. When a home has files, every one of them must be matched by a pattern in the table. The home is spelled as a plain path, the pattern as a regex, so a typo in either (providers-memry, a renamed folder in the regex only) leaves files unmatched and fails with "the check cannot see".
   c. A name sweep: any tracked file under apps/ or packages/ whose path has a demo or in-memory segment (demo, demos, demo-mode, in-memory, inmemory, providers-memory) must be matched by some pattern. This catches the folder being renamed to something the home and regex both missed, without failing on a missing folder.
   Failures print FAIL release-bundle/blind with the files or pattern named, same as the existing blind failures.
4. Real release bundles must pass today: run pnpm check:release and confirm clean.
5. Tests (vitest): each new pattern positive and negative; unit test with the real fake paths (packages/ports/src/auth/fake.ts, sync-store/fake.ts, test-support.ts, auth/contract.ts, testing.ts) showing findDevModules flags them in a synthetic release-bundle source list under the right rule; node_modules lookalikes pass; formatLeak names the new rules and why; selfCheck cases: pattern matches nothing fails, absent home passes, home present and pattern typo'd fails, renamed demo folder fails, today's file list passes.
6. Verify: pnpm check, pnpm typecheck, pnpm test, pnpm check:release; commit with the hook on.
Stop condition: if any existing real bundle contains a newly matched module, or a change needs loosening anything, stop and report.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Builder report (TASK-10.6). Changed tools/release-bundle.ts and tools/release-bundle.test.ts only.

What the check bars now, beyond the four patterns it had (none removed or narrowed):
- test fakes (release-bundle/test-fake-in-release): any module under apps/ or packages/ (never node_modules) with "fake" in its file name. Today that is the five packages/ports/src/*/fake.ts.
- testing entries, same rule: packages/*/src/test-support.* and src/testing.*, apps/mobile/testing/. Found a hole beyond the task text: the existing "testing/ subpath" pattern needs a folder, but @grocs/ports/testing is the file src/test-support.ts, which re-exports src/testing.ts and every fake.
- contract suites (release-bundle/contract-suite-in-release): contract.*, *.contract.*, contracts.*.
- demo composition and in-memory provider (release-bundle/demo-in-release): apps/mobile/src/demo/ and packages/providers-memory/.
Each rule has its own id, requirement refs, why and fix; formatLeak prints one block per rule.

Self-check design (AC #2). The existing check (dev bundle must reach src/dev) stays and proves the bundle's path format. It cannot prove the new patterns: the dev bundle reaches no fake, and no bundle this script builds holds demo code yet. So blindSpots() holds the patterns against the repo's own files (git ls-files, tracked plus untracked), in a pure function with unit tests:
1. a pattern must match at least one real file, unless it declares a `home` folder that holds no files yet (demo, providers-memory, and .rnstorybook, which has no files yet either). So a missing folder fails nothing today;
2. once files exist under a home, every one must be matched by some pattern. The home is spelled as a path and the pattern as a regex, so a typo in either fails the build the moment code exists;
3. a name sweep: any file under apps/ or packages/ named demo, demos, in-memory, inmemory or providers-memory-ish must be matched by some pattern, so code moved to a folder neither the home nor the regex expected is caught.
Failures are `FAIL release-bundle/blind` and run before the release bundles are judged.
Limit: this proves the patterns match the files' paths on disk; that Metro names a source the same way is shown by the dev-bundle check plus my reading of the real release sourcemap (sources look like /packages/ui/src/index.ts, matching the tests' form).

Evidence: pnpm check (13 checks passed), pnpm typecheck, pnpm test (88 files, 1215 tests), pnpm check:release (release bundles clean, 2 bundles, 9 patterns) all pass. release-bundle.test.ts has 30 tests, including it.each over the five real fake paths, the testing entries and contracts (unit test on pattern matching, as asked), node_modules look-alikes passing, and blindSpots cases for today's file list, demo code added with and without a typo in the pattern, partial coverage, and renamed folders.
Follow-ups for the other tasks: when TASK-10.3 or the providers-memory task add files, check:release now fails if the real build bundles them. The demo variant's own bundle will need a different invocation of this check (or none) since it legitimately holds them; I did not design that.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(508 earlier lines omitted)
```text
|  3.25 kB │ gzip:   1.46 kB
|  storybook-static/assets/SignInTemplate.stories-BJ7sbCBj.js
|  3.69 kB │ gzip:   1.53 kB
|  storybook-static/assets/ItemPickerTemplate.stories-84KNSM2C.js
|  4.34 kB │ gzip:   1.52 kB
|  storybook-static/assets/Button.stories-oKuUPhPX.js
|  4.47 kB │ gzip:   1.31 kB
|  storybook-static/assets/PreferencesTemplate.stories-x1S07O_a.js
|  4.55 kB │ gzip:   1.74 kB
|  storybook-static/assets/TextField-BUQ8W6wa.js
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/ItemRow-DlxtsPQG.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-CG-L9128.js
|  5.75 kB │ gzip:   1.97 kB
|  storybook-static/assets/Button-HlTd63fv.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-CVO2Zfzk.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-D4zA4yxG.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-_dK9hVdg.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-d75twOs6.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-wrpbBZ8J.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-7rNFOYcX.js
|  1,359.38 kB │ gzip: 391.72 kB

|
!  Vite [plugin builtin:vite-reporter]
|  (!) Some chunks are larger than 500 kB after minification. Consider:
|  - Using dynamic import() to code-split the application
|  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
|  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
|  - Adjust chunk size limit for this warning via
|  build.chunkSizeWarningLimit.
|
!  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
|  shimmed in module "../../node_modules/react-native-web/dist/index.js".

|  Vite ✓ built in 4.42s
|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a85fb2f8bb9c24912/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a85fb2f8bb9c24912/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

No repro: the bug is a blind spot in the check, not a failing build. No real release bundle holds a fake today, so there is nothing to fail. The new it.each cases over the real fake, testing-entry and contract paths are the demonstration: findDevModules before this change matched none of them.

Review by philosophy:reviewer, Oct 19, 2026: closed. The full check at 8421574 exited 0. No earlier pattern was removed or narrowed; .rnstorybook gained only a home. All three criteria are met, and blindSpots rules 1 and 2 behave as specified. Run over the TASK-10.8 branch's files, blindSpots returns nothing, and every providers-memory file is matched. The broad fake rule is acceptable: it fires only for files in a release bundle, names the file and the fix, and excludes node_modules. Findings, no task: (medium) the DEMO_NAME sweep will fail release-bundle/blind on a demo-variant entry outside apps/mobile/src/demo (for example index.demo.ts), so TASK-10.3 should keep its demo code under that folder or add a pattern. (low) The contract regex is loose (contracts-page.tsx would match), but it fires only in a release bundle.
<!-- SECTION:NOTES:END -->
