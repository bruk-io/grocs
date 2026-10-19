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
