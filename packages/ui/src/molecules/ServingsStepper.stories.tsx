import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ServingsStepper } from './ServingsStepper.tsx';

const meta = { title: 'Molecules/ServingsStepper', component: ServingsStepper, args: { value: 4 } } satisfies Meta<typeof ServingsStepper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Min: Story = { args: { value: 1 } };
export const Max: Story = { args: { value: 12, max: 12 } };
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
