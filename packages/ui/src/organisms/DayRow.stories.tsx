import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DayRow } from './DayRow.tsx';

const meta = { title: 'Organisms/DayRow', component: DayRow, args: { weekday: 'Fri', day: 23, meals: [] } } satisfies Meta<typeof DayRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const OneMeal: Story = { args: { meals: [{ id: 'a', name: 'Pizza night', tone: 'tomato' }] } };
/** Two or more meals in the order added; the tile stretches to their height. */
export const ManyMeals: Story = {
  args: {
    weekday: 'Wed',
    day: 21,
    meals: [
      { id: 'a', name: 'Sheet-pan chicken', tone: 'sky', link: 'example.com' },
      { id: 'b', name: 'Green salad', tone: 'leaf' },
    ],
  },
};
export const Empty: Story = { args: { weekday: 'Tue', day: 20 } };
