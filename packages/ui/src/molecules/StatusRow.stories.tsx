import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { StatusRow } from './StatusRow.tsx';

const meta = { title: 'Molecules/StatusRow', component: StatusRow, args: { message: 'Link sent. Waiting for them to join…' } } satisfies Meta<typeof StatusRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = {};
export const Joined: Story = { args: { kind: 'joined', name: 'Sam', message: 'Sam joined your kitchen!' } };
