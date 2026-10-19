import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { NavTabs } from './NavTabs.tsx';

const meta = {
  title: 'Organisms/NavTabs',
  component: NavTabs,
  args: {
    tabs: [
      { id: 'plan', label: 'Meal plan', icon: 'calendar' },
      { id: 'groceries', label: 'Groceries', icon: 'cart', count: 14 },
    ],
    activeId: 'plan',
  },
} satisfies Meta<typeof NavTabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PlanActive: Story = {};
export const GroceriesActive: Story = { args: { activeId: 'groceries' } };
