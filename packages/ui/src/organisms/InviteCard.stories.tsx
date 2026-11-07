import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InviteCard } from './InviteCard.tsx';

const meta = {
  title: 'Organisms/InviteCard',
  component: InviteCard,
  args: { kind: 'compose', email: '', onEmailChange: () => undefined, onInvite: () => undefined },
} satisfies Meta<typeof InviteCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing typed yet. */
export const Rest: Story = {};
/** An address typed, ready to invite. */
export const Filled: Story = { args: { kind: 'compose', email: 'shazya@gmail.com', onEmailChange: () => undefined, onInvite: () => undefined } };
/** The address was refused, with why under the field. */
export const Invalid: Story = { args: { kind: 'compose', email: 'shazya@', onEmailChange: () => undefined, onInvite: () => undefined, errorMessage: 'That is not an email address. Check it and try again.' } };
/** The invite is on its way. */
export const Sending: Story = { args: { kind: 'compose', email: 'shazya@gmail.com', onEmailChange: () => undefined, onInvite: () => undefined, sending: true } };
/** Invited, waiting for them to open Grocs and join. */
export const Invited: Story = { args: { kind: 'invited', email: 'shazya@gmail.com', onCancel: () => undefined } };
/** Before the kitchen exists: the field is there, but there is nothing to invite to yet. */
export const NoKitchen: Story = { args: { kind: 'noKitchen' } };
