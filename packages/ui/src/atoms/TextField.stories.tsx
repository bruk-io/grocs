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
export const Filled: Story = { args: { value: 'Fried rice' } };
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { value: 'Fried rice', forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true, label: 'Can not edit' } };
export const Invalid: Story = { args: { value: 'Fried rice', errorMessage: 'Enter a name' } };
export const InvalidFocus: Story = { args: { value: 'Fried rice', errorMessage: 'Enter a name', forceState: 'focus' } };
/** input.text--inline: the add bar, with its round button inside the field. */
export const InlineRest: Story = { args: { label: 'Add an item…', actionLabel: 'Add item' } };
export const InlineFocus: Story = { args: { value: 'egg', actionLabel: 'Add item', forceState: 'focus' } };
export const InlineDisabled: Story = { args: { label: 'Add an item…', actionLabel: 'Add item', disabled: true } };
/** The quick-add field's own button: a small filled "Add" with its word on it. */
export const InlinePrimaryAction: Story = { args: { value: 'egg', label: 'Add an item', actionLabel: 'Add', actionKind: 'primary', forceState: 'focus' } };
