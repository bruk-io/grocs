// Browser Storybook (R64): React Native Web on Vite. The same story files run on the phones in
// apps/mobile/.rnstorybook. In the browser, react-native-web draws web elements, so shadows, text
// rendering and native controls differ from the phones; sign-off happens on the phones.
import type { StorybookConfig } from '@storybook/react-native-web-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  framework: { name: '@storybook/react-native-web-vite', options: {} },
};

export default config;
