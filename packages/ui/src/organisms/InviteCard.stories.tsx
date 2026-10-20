import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InviteCard } from './InviteCard.tsx';

const meta = {
  title: 'Organisms/InviteCard',
  component: InviteCard,
  args: { code: 'MOREL-24' },
} satisfies Meta<typeof InviteCard>;
export default meta;
type Story = StoryObj<typeof meta>;
const sendable = { onShare: () => undefined, onCopy: () => undefined };

export const Waiting: Story = { args: { ...sendable, status: { message: 'Link sent. Waiting for them to join…' } } };
export const Joined: Story = { args: { ...sendable, status: { kind: 'joined', name: 'Sam', message: 'Sam joined your kitchen!' } } };
/** Before the link is shared there is no status line yet. */
export const Unsent: Story = { args: sendable };
/** There is nothing to share yet (no kitchen): neither handler is given, so both buttons are disabled. */
export const Unshareable: Story = {};
