---
id: decision-2
title: 'Design system playground: Storybook in the browser and on device'
date: '2026-10-18 17:29'
status: accepted
---
## Context

The design system lives in a canvas artifact (HTML boards), apart from the code. Bruk wants it in the repo as a playground he can open in a browser and see as the Android and iOS apps would show it. Decided by Bruk on Oct 18, 2026.

Options weighed:
- Storybook, with the same story files run in the browser (React Native Web framework, Vite) and on device (Storybook for React Native). Stories can also be rendered by component tests.
- A plain preview route in the app, hand-built or via a small package. Almost no setup, but no controls or accessibility panel, and states aren't reused as tests.
- Keeping the canvas. It stays apart from the code, so it drifts.

## Decision

Use Storybook. Story files sit beside each component in `packages/ui` and are shared by:
- the browser playground (Storybook for React Native Web), with screen sizes for the iPhone and both Fold screens and a switch between iOS and Android styling;
- the on-device Storybook, a route in development builds only;
- the component tests, which render the stories.

## Consequences

- A browser can't show true iOS or Android rendering: react-native-web draws web elements. Shadows, text rendering and native controls differ, so sign-off happens on the phones.
- The on-device Storybook hooks into the app's bundler config, and release builds must not contain it.
- The canvas becomes a place to sketch designs that aren't built yet. A built component's stories are its record.
- Setup details (config locations, story conventions, hosting the web build) are design question D9 in the spec.
