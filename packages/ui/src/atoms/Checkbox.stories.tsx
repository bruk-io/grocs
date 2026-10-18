import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Checkbox } from './Checkbox.tsx';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  args: { checked: false, label: 'Oat milk' },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
