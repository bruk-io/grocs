import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
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

/** A code that did not match, after the first attempt. */
export const Invalid: Story = {
  args: { inviter: 'Alex', errorMessage: 'That code is not a match. Check it with Alex, or ask for a fresh link.' },
};

/** The typed code entry before any code was tried: neutral title and label, empty field showing the code's shape, no error, no way back, no footer. */
export const FirstAttempt: Story = { args: { attempt: 'first', code: '' } };

/** Check code pressed with nothing typed: still the neutral first attempt, with the field asking for the code. */
export const MissingCode: Story = { args: { attempt: 'first', code: '', errorMessage: 'Type the code from your invite first.' } };

/** A code being checked: the button spins and a line says the first check can be slow (the server may be starting up). */
export const Checking: Story = { args: { attempt: 'first', code: 'MOREL-42', checking: true } };

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Invalid, decorators: [withPhoneInsets] };
