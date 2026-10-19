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
/** The moment of ticking: the check and six sparks, drawn still. The motion itself belongs to the motion layer. */
export const Ticking: Story = { args: { checked: true, forceState: 'ticking' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
