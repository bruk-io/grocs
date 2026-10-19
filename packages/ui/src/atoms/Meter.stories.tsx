import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Meter } from './Meter.tsx';

const meta = { title: 'Atoms/Meter', component: Meter, args: { fraction: 0, label: 'Items in the cart' } } satisfies Meta<typeof Meter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Part: Story = { args: { fraction: 0.4 } };
export const Full: Story = { args: { fraction: 1 } };
