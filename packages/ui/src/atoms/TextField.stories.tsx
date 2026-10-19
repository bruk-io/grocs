import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { TextField } from './TextField.tsx';

const meta = {
  title: 'Atoms/TextField',
  component: TextField,
  args: { value: '', label: 'Add an item', onChangeText: () => undefined },
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Filled: Story = { args: { value: 'Oat milk' } };
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { value: ' ', errorMessage: 'Give the item a name' } };
