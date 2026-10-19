---
id: decision-11
title: 'UI testing: four levels, all driven by the stories'
date: '2026-10-19 03:19'
status: proposed
---
## Context

Bruk asked on Oct 18, 2026 what level of testing the UI build (TASK-1.37, TASK-1.30) should add, following good practice. The components are presentational (R26): they take data and callbacks as props and hold no rules. So the risks are that a component looks wrong, is not accessible, or does not call its callback or show its state, not that it computes the wrong answer. The stories are already the single fixture source (R65), and `packages/ui/src/stories.test.tsx` renders every story and checks interactive elements have names (R50).

What is already settled: Testing Library with jsdom and react-native-web for component tests (decision-9); one story per declared state, checked by `story-coverage` (decision-10, R61, R63); Maestro end-to-end flows arrive with the slices that wire logic (decision-9). decision-10 left visual review (Chromatic or not) open.

Options weighed:
- JSX snapshot tests (react-test-renderer). Cheap to write, but they fail on every harmless change, get updated without reading, and say nothing about how a screen looks. Rejected.
- Pixel-comparing stories with the canvas reference screenshots. The canvas rendered HTML and CSS, the components render react-native-web, so the images never match pixel for pixel; a test that cannot pass proves nothing. Matching the reference stays a review judgement, with the evidence attached.
- Chromatic for visual review. Hosted and good, but a third-party account and quota for two people. Rejected for now; the baselines below can move there later.
- Self-hosted visual baselines: a Playwright screenshot of every story compared with an approved, committed image. Catches unintended visual change after a component is approved. Chosen, with the controls below that keep it from being flaky.

## Decision

Every UI test is driven by the stories, at four levels. Each level catches a different failure; none duplicates another.

1. Render and accessibility, every story (jsdom, fast, every edit). The existing harness stays: each story renders, and every button, checkbox and text box has an accessible name (R50, R65).

2. Behaviour, every component with a callback or state prop (jsdom, fast, every edit). A test drives the composed story by role and label and asserts the contract: pressing calls the callback with the right arguments; disabled and loading do not call it; checked, selected, disabled and expanded show in the accessibility state; text input reports changes. Tests use `userEvent`, query by role and label, and never assert styles or component internals. Pure logic inside a component, such as decision-5's `motionFor(state, reduced)`, is pulled out and unit-tested on its own.

3. Visual and accessibility in a real browser, every story (Playwright and Chromium, slower, pre-merge and CI). One pass over the built Storybook does three things per story:
   - an axe-core scan (`@axe-core/playwright`), which fails on any violation, including colour contrast measured on the rendered page (R42);
   - a check that every element with the button, checkbox or link role is at least 44 by 44 points (R42);
   - a screenshot compared with its approved baseline in `packages/ui/visual-baselines/`, with a small pixel tolerance.
   To keep it deterministic: fonts are bundled files, never fetched; the pass forces reduce motion, so animations are still (decision-5's MotionProvider); stories hold no clocks, randomness or network; the viewport is fixed at phone width plus the Fold sizes for templates. Baselines are generated and compared only on Linux (CI and Linux sessions), because font rendering differs by operating system; on a Mac the pass runs the axe and size checks and skips the image comparison, saying so.
   A baseline is created or changed only by an explicit `pnpm --filter @grocs/ui visual:update`, and the change is reviewed as images in the pull request. Deleting or editing a baseline any other way is a weakening (R57), and the pre-edit and CI checks treat `visual-baselines/` as protected.

4. Screens in the app (layer app). Each route renders its template with its sample data without errors, and its links lead to the routes the design shows, tested with expo-router's testing utilities. No end-to-end flows yet: there is no logic to drive. Maestro flows come with the slices (TASK-1.20 onwards, R51).

Matching the design reference is judged, not automated: each UI task attaches the rendered stories next to the reference screenshots in its notes, and its reviewer compares them. Once a component is approved, its baseline (level 3) guards it from then on.

What is not tested: styles and layout values directly (tokens and the raw-value check cover them), JSX structure, or anything level 3 already shows.

## Consequences

- Fast tests (levels 1, 2, 4) run in the after-edit hook and pre-commit; the browser pass (level 3) runs before an agent stops and in CI's bundles job, so the 5-second after-edit budget (R56) holds.
- Baseline images live in git, roughly tens of kilobytes per story; a few hundred stories is a few megabytes. Acceptable at this size; Git LFS if it grows.
- A change that alters a component's look on purpose needs a baseline update in the same change, reviewed as images. That friction is the point.
- Mac-only sessions do not compare images; they rely on CI for that. Any Linux session, including the cloud ones, can update baselines.
- New tooling (axe, the browser pass, baselines, the protected folder) is built once, by TASK-1.37.6, before the component tasks start.
