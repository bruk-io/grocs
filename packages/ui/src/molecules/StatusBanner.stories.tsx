import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { StatusBanner } from './StatusBanner.tsx';

const meta = { title: 'Molecules/StatusBanner', component: StatusBanner, args: { kind: 'offline', message: 'Offline. 2 changes waiting.' } } satisfies Meta<typeof StatusBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Offline: Story = { args: { actionLabel: 'Try again' } };
export const Syncing: Story = { args: { kind: 'syncing', message: 'Sending 2 changes…', actionLabel: 'Try again', busyLabel: 'Sending' } };
export const Synced: Story = { args: { kind: 'synced', message: 'Back online. Everything is sent.' } };
