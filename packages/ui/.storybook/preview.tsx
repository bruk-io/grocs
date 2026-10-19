import './fonts.css';
import type { Preview } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { MotionProvider } from '../src/platform/motion.tsx';
import { PlatformStyleProvider } from '../src/platform/platform-style.tsx';
import type { PlatformStyle } from '../src/platform/platform-style.tsx';
import { tokens } from '../src/tokens/tokens.ts';

// Screen sizes in device-independent pixels. The Fold sizes are approximate (Pixel 9 Pro Fold
// numbers, rounded); confirm both on the phone when the fold layout is designed (D2).
const viewports = {
  iphone: { name: 'iPhone (393 x 852)', type: 'mobile', styles: { width: '393px', height: '852px' } },
  foldOuter: { name: 'Pixel Fold, outer screen (412 x 929)', type: 'mobile', styles: { width: '412px', height: '929px' } },
  foldInner: { name: 'Pixel Fold, inner screen (791 x 820)', type: 'tablet', styles: { width: '791px', height: '820px' } },
} as const;

/** The toolbar's choice as MotionProvider props: left out, the provider follows the browser. */
const reducedFrom = (choice: unknown): { reduced?: boolean } => (choice === 'on' ? { reduced: true } : choice === 'off' ? { reduced: false } : {});

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    viewport: { options: viewports },
  },
  initialGlobals: {
    viewport: { value: 'foldOuter', isRotated: false },
    platform: 'android',
    reduceMotion: 'system',
  },
  globalTypes: {
    platform: {
      description: 'Platform look',
      toolbar: {
        title: 'Platform',
        icon: 'mobile',
        items: [
          { value: 'ios', title: 'iOS' },
          { value: 'android', title: 'Android' },
        ],
        dynamicTitle: true,
      },
    },
    // Reduce motion (R41, decision-5): the same switch the phones' MotionProvider gets from the OS.
    // "Browser setting" follows prefers-reduced-motion, which the browser pass forces on.
    reduceMotion: {
      description: 'Reduce motion',
      toolbar: {
        title: 'Reduce motion',
        icon: 'lightning',
        items: [
          { value: 'system', title: 'Browser setting' },
          { value: 'on', title: 'Reduce motion: on' },
          { value: 'off', title: 'Reduce motion: off' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <PlatformStyleProvider value={(context.globals['platform'] as PlatformStyle | undefined) ?? 'android'}>
        <MotionProvider {...reducedFrom(context.globals['reduceMotion'])}>
          {context.title.startsWith('Templates/') ? (
            // A template is a whole screen: it fills the viewport edge to edge and lays itself out.
            <View style={{ flex: 1, backgroundColor: tokens.color.surfaceCanvas, minHeight: '100vh' as never }}>
              <Story />
            </View>
          ) : (
            <View style={{ padding: tokens.space[16], backgroundColor: tokens.color.surfaceCanvas, minHeight: '100%' as never }}>
              <Story />
            </View>
          )}
        </MotionProvider>
      </PlatformStyleProvider>
    ),
  ],
};

export default preview;
