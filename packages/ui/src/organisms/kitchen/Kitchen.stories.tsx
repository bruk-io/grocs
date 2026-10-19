import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { MotionProvider } from '../../platform/motion.tsx';
import { tokens } from '../../tokens/tokens.ts';
import { KitchenScene } from './KitchenScene.tsx';

// The stage as a phone window onto the scene, at full size: the camera pans along the kitchen behind it.
const phoneWindow = (Story: () => React.JSX.Element) => (
  <View style={{ width: '100%', aspectRatio: 0.6, borderRadius: tokens.radius[20], overflow: 'hidden' }}>
    <Story />
  </View>
);

const meta = { title: 'Organisms/Kitchen scene', component: KitchenScene, decorators: [phoneWindow] } satisfies Meta<typeof KitchenScene>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Moving: the camera pans along the kitchen and the cupboard door opens. Held still in the browser pass and wherever reduce motion is on. */
export const Panning: Story = {};
/** Reduce motion on: the camera rests at the fridge and nothing moves. */
export const Reduced: Story = { decorators: [(Story) => <MotionProvider reduced><Story /></MotionProvider>] };
