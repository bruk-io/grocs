import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InviteRetryTemplate } from './InviteRetryTemplate.tsx';

const meta = {
  title: 'Templates/Invite retry',
  component: InviteRetryTemplate,
  args: {
    inviter: 'Bruk',
    code: 'MOREL-42',
    onCodeChange: () => undefined,
    errorMessage: 'That code is not a match. Check it with Bruk, or ask for a fresh link.',
  },
} satisfies Meta<typeof InviteRetryTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** JoinInviteInvalid. */
export const Invalid: Story = {};

/** The typed code entry before any code was tried: neutral title, empty field, no error, no way back. */
export const FirstAttempt: Story = { args: { attempt: 'first', code: '', errorMessage: '' } };
