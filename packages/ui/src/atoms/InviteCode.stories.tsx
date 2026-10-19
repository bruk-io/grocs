import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InviteCode } from './InviteCode.tsx';

const meta = { title: 'Atoms/InviteCode', component: InviteCode, args: { code: 'MOREL-24' } } satisfies Meta<typeof InviteCode>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
