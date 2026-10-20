import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InviteRetryTemplate } from './InviteRetryTemplate.tsx';

const meta = {
  title: 'Templates/Invite retry',
  component: InviteRetryTemplate,
  args: {
    code: 'MOREL-42',
    onCodeChange: () => undefined,
  },
} satisfies Meta<typeof InviteRetryTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** JoinInviteInvalid. */
export const Invalid: Story = {
  args: { inviter: 'Bruk', errorMessage: 'That code is not a match. Check it with Bruk, or ask for a fresh link.' },
};

/** The typed code entry before any code was tried: neutral title and label, empty field showing the code's shape, no error, no way back, no footer. */
export const FirstAttempt: Story = { args: { attempt: 'first', code: '' } };
