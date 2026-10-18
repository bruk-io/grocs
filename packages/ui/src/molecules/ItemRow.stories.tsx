import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ItemRow } from './ItemRow.tsx';

const meta = {
  title: 'Molecules/ItemRow',
  component: ItemRow,
  args: { name: 'Oat milk', inCart: false },
} satisfies Meta<typeof ItemRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const InCart: Story = { args: { inCart: true } };
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };

/** Not a state: the row with an amount and meal badges, as it shows on the list. */
export const WithAmountAndBadges: Story = {
  args: { amount: '2 cartons', mealBadges: ['Taco night', 'Pancakes'] },
};
