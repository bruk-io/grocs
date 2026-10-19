import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InviteCard } from './InviteCard.tsx';

const meta = {
  title: 'Organisms/InviteCard',
  component: InviteCard,
  args: { code: 'MOREL-24' },
} satisfies Meta<typeof InviteCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = { args: { status: { message: 'Link sent. Waiting for them to join…' } } };
export const Joined: Story = { args: { status: { kind: 'joined', name: 'Shazya', message: 'Shazya joined your kitchen!' } } };
/** Before the link is shared there is no status line yet. */
export const Unsent: Story = {};
