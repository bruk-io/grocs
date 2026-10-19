import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ItemRow } from './ItemRow.tsx';

const meta = {
  title: 'Molecules/ItemRow',
  component: ItemRow,
  args: {
    name: 'Yellow onions',
    amount: '2',
    mealBadges: [
      { label: 'Chana masala', tone: 'amber' },
      { label: 'Sheet-pan chicken', tone: 'sky' },
    ],
    inCart: false,
  },
} satisfies Meta<typeof ItemRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = { args: { addedBy: 'Shazya' } };
export const InCart: Story = { args: { name: 'Coffee beans', inCart: true } };
export const Pressed: Story = { args: { name: 'Garlic', amount: '4 cloves', mealBadges: [{ label: 'Chana masala' }], forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
export const Swiped: Story = { args: { name: 'Oat milk', amount: '1 carton', mealBadges: [], swiped: true } };
export const Loading: Story = { args: { loading: true } };

/** Not a state: the row as the list screen shows it, with the amount only. */
export const AmountOnly: Story = { args: { name: 'Oat milk', amount: '2 cartons', mealBadges: [] } };
