import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { MealFormTemplate } from './MealFormTemplate.tsx';

const meta = {
  title: 'Templates/Meal form',
  component: MealFormTemplate,
  args: {
    dateLabel: 'Thursday, Oct 22',
    submitLabel: 'Add to Thursday',
    name: 'Fried rice',
    onNameChange: () => undefined,
    link: '',
    onLinkChange: () => undefined,
  },
} satisfies Meta<typeof MealFormTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** AddMeal. */
export const Rest: Story = {};

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Rest, decorators: [withPhoneInsets] };
