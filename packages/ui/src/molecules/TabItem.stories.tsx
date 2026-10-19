import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { TabItem } from './TabItem.tsx';

// A tab always sits in a tab list, which the nav.tabs organism supplies; the stories give it one.
const inTabList = (Story: () => React.JSX.Element) => (
  <View role="tablist" style={{ flexDirection: 'row', padding: tokens.space[6], borderRadius: tokens.radius[24], backgroundColor: tokens.color.surfaceCanvas }}>
    <Story />
  </View>
);

const meta = { title: 'Molecules/TabItem', component: TabItem, args: { label: 'Groceries', icon: 'cart' }, decorators: [inTabList] } satisfies Meta<typeof TabItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { label: 'Meal plan', icon: 'calendar', active: true } };
export const Rest: Story = { args: { count: 14 } };
export const Pressed: Story = { args: { label: 'Meal plan', icon: 'calendar', forceState: 'pressed' } };
export const Focus: Story = { args: { count: 14, forceState: 'focus' } };
export const Disabled: Story = { args: { count: 14, disabled: true } };
