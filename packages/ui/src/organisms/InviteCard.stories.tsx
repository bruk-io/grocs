import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InviteCard } from './InviteCard.tsx';

const meta = {
  title: 'Organisms/InviteCard',
  component: InviteCard,
  args: {},
} satisfies Meta<typeof InviteCard>;
export default meta;
type Story = StoryObj<typeof meta>;
const sendable = { onShare: () => undefined, onCopy: () => undefined };

export const Waiting: Story = { args: { code: 'MOREL-24', ...sendable, status: { message: 'Link sent. Waiting for them to join…' } } };
export const Joined: Story = { args: { code: 'MOREL-24', ...sendable, status: { kind: 'joined', name: 'Sam', message: 'Sam joined your kitchen!' } } };
/** Before the link is shared there is no status line yet. */
export const Unsent: Story = { args: { code: 'MOREL-24', ...sendable } };
/** Before there is a code (no kitchen yet): a hint where the code will be, and no Share link or Copy code at all. */
export const NoCode: Story = { args: { code: null } };
