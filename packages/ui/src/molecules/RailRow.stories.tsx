import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { RailRow } from './RailRow.tsx';

// A rail row always sits in the rail, on the card colour; the stories give it that.
const inRail = (Story: () => React.JSX.Element) => (
  <View style={{ padding: tokens.space[16], backgroundColor: tokens.color.surfaceCard }}>
    <Story />
  </View>
);

const meta = {
  title: 'Molecules/RailRow',
  component: RailRow,
  args: { name: 'Chana masala', day: 'Mon', count: 5, tone: 'amber' },
  decorators: [inRail],
} satisfies Meta<typeof RailRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Selected: Story = { args: { selected: true } };
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
/** All items has no day, no count and no meal colour. */
export const AllItems: Story = { render: () => <RailRow name="All items" selected /> };
/** A meal with the neutral colour, such as Eating out. */
export const Neutral: Story = { args: { name: 'Eating out', day: 'Sat', count: 0, tone: 'neutral' } };
