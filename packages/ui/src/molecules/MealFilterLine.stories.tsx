import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MealFilterLine } from './MealFilterLine.tsx';

const meta = {
  title: 'Molecules/MealFilterLine',
  component: MealFilterLine,
  args: { mealName: 'Chana masala', count: 4, tone: 'amber' },
} satisfies Meta<typeof MealFilterLine>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
/** A long name wraps inside the line and keeps the button. */
export const LongName: Story = { args: { mealName: 'Sheet-pan chicken with roasted peppers', tone: 'sky', count: 12 } };
