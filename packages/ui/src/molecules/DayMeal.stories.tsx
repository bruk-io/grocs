import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DayMeal } from './DayMeal.tsx';

const meta = { title: 'Molecules/DayMeal', component: DayMeal, args: { weekday: 'Fri', day: 23, meal: 'Pizza night', tone: 'tomato' } } satisfies Meta<typeof DayMeal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
