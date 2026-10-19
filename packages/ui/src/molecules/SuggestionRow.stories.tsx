import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SuggestionRow } from './SuggestionRow.tsx';

const meta = { title: 'Molecules/SuggestionRow', component: SuggestionRow, args: { name: 'Eggs', detail: 'Dairy & eggs · usually 1 dozen' } } satisfies Meta<typeof SuggestionRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Pressed: Story = { args: { name: 'Egg noodles', detail: 'Pantry', forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
