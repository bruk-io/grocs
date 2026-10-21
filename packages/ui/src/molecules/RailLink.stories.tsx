import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { RailLink } from './RailLink.tsx';

// A rail link always sits in the rail's navigation, on the card colour; the stories give it both.
const inRail = (Story: () => React.JSX.Element) => (
  <View role="navigation" aria-label="Sections and meals" style={{ padding: tokens.space[16], backgroundColor: tokens.color.surfaceCard }}>
    <Story />
  </View>
);

const meta = { title: 'Molecules/RailLink', component: RailLink, args: { label: 'Meal plan', icon: 'calendar' }, decorators: [inRail] } satisfies Meta<typeof RailLink>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { label: 'Groceries', icon: 'cart', active: true, count: 14 } };
export const Rest: Story = {};
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
