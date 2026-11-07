import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { InviteJoinTemplate } from './InviteJoinTemplate.tsx';

const meta = {
  title: 'Templates/Invite join',
  component: InviteJoinTemplate,
  args: {
    inviter: 'Shazya',
    kitchen: 'Our kitchen',
    description: "Plan the week's meals together and shop from one shared list, live on both phones.",
    onJoin: () => undefined,
    onNotNow: () => undefined,
  },
} satisfies Meta<typeof InviteJoinTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Someone with no kitchen of their own. */
export const Rest: Story = {};
/** Someone who already has a kitchen, which joining leaves. */
export const Leaving: Story = { args: { leaving: 'My kitchen' } };
/** While joining. */
export const Joining: Story = { args: { joining: true } };
/** The join did not go through. */
export const Error: Story = { args: { errorMessage: 'That invite was taken back. Ask your partner to add you again.' } };

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Rest, decorators: [withPhoneInsets] };
