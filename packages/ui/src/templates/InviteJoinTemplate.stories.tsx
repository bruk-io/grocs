import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InviteJoinTemplate } from './InviteJoinTemplate.tsx';

const meta = {
  title: 'Templates/Invite join',
  component: InviteJoinTemplate,
  args: { inviter: 'Bruk', kitchen: 'Our kitchen', description: "Plan the week's meals together and shop from one shared list, live on both phones." },
} satisfies Meta<typeof InviteJoinTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** JoinInvite. */
export const Rest: Story = {};
