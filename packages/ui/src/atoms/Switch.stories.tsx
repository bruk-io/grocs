import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Switch } from './Switch.tsx';

const meta = { title: 'Atoms/Switch', component: Switch, args: { on: false, label: 'Reminders' } } satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const On: Story = { args: { on: true } };
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { on: true, disabled: true } };
