import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MainHeader } from './MainHeader.tsx';

const members = [{ name: 'Bruk' }, { name: 'Shazya', tone: 'chartreuse', online: true }] as const;

const meta = {
  title: 'Organisms/MainHeader',
  component: MainHeader,
  args: { title: 'Groceries', members, mascot: 'cremi' },
} satisfies Meta<typeof MainHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Groceries: the week, who is in, the title with the shop's progress, and the add bar. */
export const Groceries: Story = {
  args: { eyebrow: 'Week of Oct 19', progress: { toGo: 14, inCart: 3 }, addBar: { value: '', onChangeText: () => undefined } },
};
/** Meal plan: week.nav replaces the label; no progress and no add bar. */
export const MealPlan: Story = {
  args: { title: 'This week', mascot: 'shii', weekNav: { label: 'Oct 19 - 25' } },
};
