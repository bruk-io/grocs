import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { InviteJoinTemplate } from './InviteJoinTemplate.tsx';

const meta = {
  title: 'Templates/Invite join',
  component: InviteJoinTemplate,
  args: { inviter: 'Alex', kitchen: 'Our kitchen', description: "Plan the week's meals together and shop from one shared list, live on both phones." },
} satisfies Meta<typeof InviteJoinTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** JoinInvite. */
export const Rest: Story = {};

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Rest, decorators: [withPhoneInsets] };
