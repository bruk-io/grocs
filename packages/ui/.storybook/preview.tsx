import './fonts.css';
import type { Preview } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
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

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    viewport: { options: viewports },
  },
  initialGlobals: {
    viewport: { value: 'foldOuter', isRotated: false },
    platform: 'android',
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
  },
  decorators: [
    (Story, context) => (
      <PlatformStyleProvider value={(context.globals['platform'] as PlatformStyle | undefined) ?? 'android'}>
        <View style={{ padding: tokens.space[16], backgroundColor: tokens.color.surfaceCanvas, minHeight: '100%' as never }}>
          <Story />
        </View>
      </PlatformStyleProvider>
    ),
  ],
};

export default preview;
