import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { MotionProvider } from '../platform/motion.tsx';
import { tokens } from '../tokens/tokens.ts';
import { Mascot } from './Mascot.tsx';

// The bubble opens above the mushroom, so every story leaves room for it.
const room = (Story: () => React.JSX.Element) => (
  <View style={{ paddingTop: tokens.space[64] + tokens.space[40], alignItems: 'center' }}>
    <Story />
  </View>
);

const meta = {
  title: 'Molecules/Mascot',
  component: Mascot,
  args: { name: 'cremi', size: tokens.size.avatarXl * 2 },
  decorators: [room],
} satisfies Meta<typeof Mascot>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Moving: bounces and blinks. Still in the browser pass and wherever reduce motion is on. */
export const Idle: Story = {};
/** The art with no motion at all. */
export const Rest: Story = { args: { forceState: 'rest' } };
/** Just tapped: the reaction plays (the hop) and the bubble grows in. */
export const Reacting: Story = { args: { forceState: 'reacting' } };
/** The reaction is over; the bubble stays up. */
export const Speaking: Story = { args: { forceState: 'speaking' } };
/** Reduce motion on: a tap holds the reaction's pose still and the bubble only fades. */
export const Reduced: Story = {
  args: { forceState: 'reacting' },
  decorators: [(Story) => <MotionProvider reduced><Story /></MotionProvider>],
};
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
