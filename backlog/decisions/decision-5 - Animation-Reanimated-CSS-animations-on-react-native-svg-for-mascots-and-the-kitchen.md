---
id: decision-5
title: >-
  Animation: Reanimated CSS animations on react-native-svg for mascots and the
  kitchen
date: '2026-10-18 18:36'
status: accepted
---
## Context

Design question D6 in doc-1: what runs the mushroom mascots (idle motion, a reaction and speech bubble on tap, with the line announced to screen readers, R40) and the Welcome screen's panning cartoon kitchen, and how all of it follows the OS reduce-motion setting (R41). The runtime must work in an Expo development build on the New Architecture, which has been the only architecture since Expo SDK 55; the current SDK is 58 with React Native 0.88. It must look right on the Pixel 10 Fold's outer and inner screens and keep state across fold changes (R43). It must fit one Mascot component whose look, lines and reaction are data (R62), take motion values only from design tokens (R39, R59), and render in browser Storybook, on-device Storybook and component tests from the same stories (R63 to R65). Bruk draws the art and is not an animator. The mascots are flat SVG today, animated with CSS keyframes in the canvas, and step 3 of the canvas move converts them to React Native components with a tool.

Options weighed (versions current on 2026-10-18):

- Reanimated 4.7.1 with react-native-svg 15.16.0. Both are in Expo SDK 58's bundled module list, and Reanimated 4 is New Architecture only. Its CSS animations API takes keyframe objects (`animationName`, `animationDuration`, `animationIterationCount`), so the canvas's CSS keyframes port almost line for line. Since 4.4, CSS animations also drive react-native-svg props: `opacity`, `fill` and `stroke` on every shape, and geometry on `Circle`, `Ellipse`, `Rect` and `Path` `d` on all platforms. 4.6 added end-of-animation callbacks on iOS and Android. It runs on web, and its Jest resolver uses the web implementation. Art stays as SVG and timings stay in code, so tokens can drive them. Reduce motion: worklet animations default to `ReduceMotion.System`, and `useReducedMotion` reads the setting only at app start. The docs don't say whether CSS animations honour the setting, so the gate has to be explicit. App size: nothing added, since react-native-svg is needed for the icon set (R62) and Reanimated for the rest of the UI's motion. Limits: animation is code, so a complex character performance is slow to write. On web, `Path` `d` morphs only between paths with the same command structure.
- Rive (`@rive-app/react-native` 0.5.5, the new runtime built on Nitro Modules; the legacy `rive-react-native` is still maintained). It needs a development build, Expo SDK 53 or later, React Native 0.78 or later and iOS 15.1 or later. Its state machines are the best tool here for interactive characters, and its rendering is crisp at any size. Against it: the package is pre-1.0 and has no web implementation in its source, so browser Storybook (R64) would need a separate `@rive-app/react-canvas` path; Jest sees only a mock; exporting files for runtimes is a paid feature (Cadet, $17 a seat a month or $108 a year); the art has to be rebuilt in Rive's editor by someone new to it; durations and easings live inside a binary `.riv` file that tokens can't reach (R39) and diffs can't show; reduce motion has to be a state-machine input in every file. App size: about 1.7 MB download on iOS and 2.4 MB on Android arm64.
- Lottie (`lottie-react-native` 7.5.0, New Architecture and React Native 0.84 or later, in SDK 58's bundled list). It runs on web through `@lottiefiles/dotlottie-react`. Authoring is in After Effects or Lottie Creator, whose free plan allows five exports. A tap reaction is a segment played on cue, with no state or input model. Timings are baked into the JSON (R39), Jest needs a file stub, and Bruk would still need to learn a motion tool.
- React Native Skia (`@shopify/react-native-skia` 2.14.0, in SDK 58's bundled list). It is a fast GPU canvas that can draw SVG and Lottie (Skottie) and pairs with Reanimated shared values. It adds about 6 MB on iOS, 4 MB on Android and 2.9 MB on web (CanvasKit, which Storybook has to load). Jest needs a custom environment. What it draws is opaque to accessibility, so the mascot's role, label and hit area must be overlaid. Its strength, heavy per-frame drawing, isn't needed by flat cartoons.
- Combinations: Rive mascots plus a Reanimated kitchen means two runtimes and two ways of authoring, and keeps every Rive cost above. Reanimated plus Skia for the kitchen alone is the fallback if the SVG pan drops frames. Lottie plus Reanimated adds an authoring tool for no new ability.

## Decision

Use Reanimated 4 with react-native-svg for everything, at the versions `npx expo install` pins for SDK 58: `react-native-reanimated` 4.7.1, `react-native-worklets` 0.13.0 and `react-native-svg` 15.16.0. No Rive, Lottie or Skia.

Art:
- The SVG conversion tool (step 3, chosen in D9) turns each mascot into a component in `packages/ui/src/mascots/art/`. The parts that move are named groups or shapes: `body`, `cap`, `eyeL` and `eyeR` as `Ellipse` elements, and `mouth` as a `Path`.
- Each mouth pose is drawn with the same path command structure, so it morphs on web too. A check in `tools/checks` fails if mouth paths in one mascot differ in structure.

Mascot data (`packages/ui/src/mascots/<name>.ts`, R62): `{ art, lines: string[], idle: Keyframes, reaction: Keyframes, reactionPose }`.
- The keyframes are Reanimated `CSSAnimationKeyframes` objects ported from the canvas CSS.
- Durations, delays and easings are motion token names from `tokens.json` (R39), resolved by the Mascot component. A raw number in a mascot file fails the raw-values check.

One `Mascot` component (molecule):
- Whole-body motion (bob, squash, tilt) is a CSS animation on an `Animated.View` wrapper. Part motion is a CSS animation on SVG props: blink is the eyes' `Ellipse` `ry`, and mouth shapes are `Path` `d`.
- It is a `Pressable` of at least 44 by 44 points (R42), with `accessibilityRole="button"` and a label from the data ("Morel, tap to hear a line").
- A tap swaps `animationName` to the reaction with `animationIterationCount: 1` and returns to idle on `onAnimationEnd`. It shows the speech bubble, an atom with plain React Native `Text`, and calls `AccessibilityInfo.announceForAccessibility(line)` (R40).
- Lines cycle in order, with no randomness, so stories and tests are deterministic.

Welcome kitchen (organism):
- The scene SVG is drawn wider than any screen and scaled to the viewport height.
- An `Animated.View` translates it with an alternating linear keyframe between `0` and `-(sceneWidth - viewportWidth)`, recalculated from `onLayout`. On the Fold's inner screen the range shrinks, and if the viewport is wider than the scene it doesn't pan. Fold changes restart the keyframe from the current position.
- The wrapper sets `renderToHardwareTextureAndroid` and `shouldRasterizeIOS`, so only a bitmap moves each frame.
- Mascots placed in the scene are ordinary `Mascot` components layered above it.

Reduce motion (R41):
- `packages/ui` exports a `MotionProvider` with `{ reduced: boolean }` and a `useMotion()` hook. Every animated component reads it, and no UI component reads the OS itself.
- `apps/mobile` sets it from `AccessibilityInfo.isReduceMotionEnabled()` and the `reduceMotionChanged` event, because `useReducedMotion` doesn't update at runtime. The app root also renders `<ReducedMotionConfig mode={ReduceMotion.System} />` for worklet and layout animations.
- When reduced:
  - Idle sets `animationName: "none"`.
  - A tap shows `reactionPose` as a static frame for the reaction's token duration, then returns to rest.
  - The bubble appears with an opacity fade only.
  - The kitchen sits still at the framing set in its data.
  - The line is still announced.

Stories and tests:
- Every mascot has stories for `idle`, `reacting`, `speaking`, `reduced` and `pressed` (R61, R63). The kitchen has `panning`, `reduced`, and outer and inner Fold widths.
- A Storybook global "Reduce motion" toolbar sets `MotionProvider` in both browser and on-device Storybook. In the browser, Reanimated's web build plays the same keyframes as real CSS.
- Component tests (R50, R65) render the composed stories with React Native Testing Library under Reanimated's Jest resolver and `setUpTests()`, with fake timers. They find the mascot by role and label, press it, and assert the bubble text and the `announceForAccessibility` call.
- The pure `motionFor(state, reduced)` function, which picks the keyframes, pose and duration, has its own unit tests. That covers the reduced paths without depending on what Jest can show of a CSS animation.
- Motion quality is signed off on the phones (decision-2).

## Consequences

- No new native dependency, no new app size, no subscription and no new authoring tool. Bruk keeps drawing in SVG, and motion is reviewed as code diffs.
- Rich character performance is ruled out: lip sync, many-limb rigs, physics, and blending several animations driven by state. Each reaction is a small set of keyframes on a few named parts. If the mascots grow past that, Rive becomes the next step, which means a Cadet plan, rebuilding the art in Rive, its web path for Storybook, and a reduce-motion input in each file.
- The art and the code are coupled through part names. A redrawn mascot has to keep the `body`, `cap`, `eyeL`, `eyeR` and `mouth` names and the mouth's path structure, and the conversion tool and the check enforce that.
- Whether Reanimated's CSS animations honour the OS setting on their own is unconfirmed, so the explicit `MotionProvider` gate is mandatory, not a safety net. The provider value is app state that every animated component depends on.
- Jest can't show whether a CSS animation looks right, only which keyframes and states were chosen. Visual correctness rests on stories viewed on the phones.
- Still open: whether the panning kitchen holds 60 fps on the Fold's inner screen with rasterisation on. If it doesn't, the scene alone moves to Skia, drawing the same SVG, with Reanimated driving it, at the cost of about 4 MB on Android and 6 MB on iOS. The conversion tool and the per-part naming come from D9.

## Sources

- Expo SDK 55 changelog (Legacy Architecture dropped): https://expo.dev/changelog/sdk-55
- Expo SDK 56 changelog (Hermes v1 and worklets memory regression, fixed in SDK 57): https://expo.dev/changelog/sdk-56
- Expo SDK 58 changelog (React Native 0.88): https://expo.dev/changelog/sdk-58
- Expo SDK 58 bundled native module versions: https://github.com/expo/expo/blob/sdk-58/packages/expo/bundledNativeModules.json
- Reanimated compatibility table (4.7.x supports React Native 0.86 to 0.88, New Architecture only): https://github.com/software-mansion/react-native-reanimated/blob/main/packages/react-native-reanimated/compatibility.json
- Reanimated CSS animations, `animationName`: https://docs.swmansion.com/react-native-reanimated/docs/css-animations/animation-name
- Reanimated, animating SVG (CSS on SVG from 4.4, web path limits): https://docs.swmansion.com/react-native-reanimated/docs/guides/animating-svg
- Reanimated 4.6.0 changelog (CSS animation event callbacks): https://swmansion.com/changelog/reanimated-4-6-0/
- Reanimated accessibility (ReduceMotion, useReducedMotion reads at start): https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility
- Reanimated ReducedMotionConfig: https://docs.swmansion.com/react-native-reanimated/docs/device/ReducedMotionConfig
- Reanimated testing with Jest: https://docs.swmansion.com/react-native-reanimated/docs/guides/testing
- Rive React Native runtime (new runtime, Nitro, requirements): https://rive.app/docs/runtimes/react-native/react-native
- Rive with Expo (development build required): https://rive.app/docs/runtimes/react-native/adding-rive-to-expo.md
- Margelo, rewriting Rive React Native with Nitro Modules: https://margelo.com/blog/rewriting-rive-react-native-with-nitro-modules
- Rive pricing (runtime exports from Cadet): https://rive.app/docs/account-admin/pricing
- Rive runtime sizes: https://rive.app/docs/runtimes/runtime-sizes.md
- lottie-react-native README (New Architecture, React Native 0.84+, web via dotLottie, Jest stub): https://github.com/lottie-react-native/lottie-react-native
- Lottie Creator free plan limits: https://help.lottiefiles.com/hc/en-us/articles/15418024472345-Is-Lottie-Creator-free
- React Native Skia installation (bundle sizes, Jest environment): https://shopify.github.io/react-native-skia/docs/getting-started/installation
- npm registry, current versions (checked 2026-10-18): `react-native-reanimated` 4.7.1, `react-native-worklets` 0.13.0, `react-native-svg` 15.16.0, `@rive-app/react-native` 0.5.5 (no web implementation in its `src`), `rive-react-native` 9.8.6, `lottie-react-native` 7.5.0, `@shopify/react-native-skia` 2.14.0
