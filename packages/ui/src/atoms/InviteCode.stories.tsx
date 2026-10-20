import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InviteCode } from './InviteCode.tsx';

const meta = { title: 'Atoms/InviteCode', component: InviteCode, args: {} } satisfies Meta<typeof InviteCode>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = { args: { code: 'MOREL-24' } };
/** No code yet: a hint instead, never a sample code. */
export const Pending: Story = { args: { hint: 'Your code appears after Start planning.' } };
