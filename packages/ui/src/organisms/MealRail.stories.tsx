import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { MealRail } from './MealRail.tsx';
import type { RailMeal } from './MealRail.tsx';

const week: readonly RailMeal[] = [
  { id: 'chana', name: 'Chana masala', day: 'Mon', count: 5, tone: 'amber' },
  { id: 'chicken', name: 'Sheet-pan chicken', day: 'Wed', count: 3, tone: 'sky' },
  { id: 'salad', name: 'Green salad', day: 'Wed', count: 0, tone: 'leaf' },
  { id: 'pizza', name: 'Pizza night', day: 'Fri', count: 2, tone: 'tomato' },
  { id: 'out', name: 'Eating out', day: 'Sat', count: 0, tone: 'neutral' },
];

const meta = {
  title: 'Organisms/MealRail',
  component: MealRail,
  args: { activeSection: 'groceries', toGo: 14, meals: week },
  // The rail is as tall as the screen it sits on.
  decorators: [
    (Story) => (
      <View style={{ height: '100vh', flexDirection: 'row' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof MealRail>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Every item is showing: All items is the chosen row. */
export const NothingSelected: Story = {};
/** The list is narrowed to Chana masala. */
export const MealSelected: Story = { args: { selectedMealId: 'chana' } };
/** No meals planned this week: only All items and Plan a meal. */
export const NoMealsYet: Story = { args: { meals: [] } };
