import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MealEmpty } from './MealEmpty.tsx';

const meta = { title: 'Molecules/MealEmpty', component: MealEmpty } satisfies Meta<typeof MealEmpty>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
