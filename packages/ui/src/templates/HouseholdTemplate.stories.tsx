import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { HouseholdTemplate } from './HouseholdTemplate.tsx';

const meta = {
  title: 'Templates/Household',
  component: HouseholdTemplate,
  args: {
    kitchenName: 'Our kitchen',
    members: [{ name: 'Bruk', isYou: true }],
    invite: { kind: 'compose', email: '', onEmailChange: () => undefined, onInvite: () => undefined },
    onBack: () => undefined,
  },
} satisfies Meta<typeof HouseholdTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The kitchen has room: the partner's email to add. */
export const Rest: Story = {};
/** The partner is invited and has not joined yet. */
export const Invited: Story = { args: { invite: { kind: 'invited', email: 'shazya@gmail.com', onCancel: () => undefined } } };
/** Both members are in: no invite, since a kitchen holds two (R3). */
export const Full: Story = { args: { members: [{ name: 'Bruk', isYou: true }, { name: 'Shazya', isYou: false }], invite: { kind: 'full' } } };
/** While the phone reads the kitchen. */
export const Loading: Story = { args: { invite: { kind: 'loading' } } };
/** The server could not be reached. */
export const Failed: Story = { args: { invite: { kind: 'failed', message: 'check your connection and try again' } } };

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Rest, decorators: [withPhoneInsets] };
