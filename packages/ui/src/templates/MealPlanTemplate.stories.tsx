import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { household, week } from './fixtures.ts';
import { MealPlanTemplate } from './MealPlanTemplate.tsx';

const meta = {
  title: 'Templates/Meal plan',
  component: MealPlanTemplate,
  args: { weekLabel: 'Oct 19 - 25', members: household, days: week, toBuy: 14 },
} satisfies Meta<typeof MealPlanTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Plan. */
export const Week: Story = {};

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Week, decorators: [withPhoneInsets] };
