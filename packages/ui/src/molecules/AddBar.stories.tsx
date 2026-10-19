import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AddBar } from './AddBar.tsx';

const meta = { title: 'Molecules/AddBar', component: AddBar, args: { value: '', onChangeText: () => undefined } } satisfies Meta<typeof AddBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Filled: Story = { args: { value: 'egg' } };
export const Focus: Story = { args: { value: 'egg', forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
