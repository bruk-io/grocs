import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MealCard } from './MealCard.tsx';

const meta = { title: 'Molecules/MealCard', component: MealCard, args: { name: 'Chana masala', tone: 'amber' } } satisfies Meta<typeof MealCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = { args: { link: 'example.com' } };
export const Pressed: Story = { args: { link: 'example.com', forceState: 'pressed' } };
export const Focus: Story = { args: { link: 'example.com', forceState: 'focus' } };
export const Disabled: Story = { args: { link: 'example.com', disabled: true } };

/** Not states: the other meal colours on the board, with no recipe link. */
export const Tomato: Story = { args: { name: 'Pizza night', tone: 'tomato' } };
export const Neutral: Story = { args: { name: 'Eating out', tone: 'neutral' } };
