import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { FilterEmpty } from './FilterEmpty.tsx';

const meta = {
  title: 'Molecules/FilterEmpty',
  component: FilterEmpty,
  args: { mealName: 'Chana masala' },
} satisfies Meta<typeof FilterEmpty>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
