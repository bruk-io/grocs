import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button } from './Button.tsx';

const meta = { title: 'Atoms/Button', component: Button, args: { label: 'Add' } } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
