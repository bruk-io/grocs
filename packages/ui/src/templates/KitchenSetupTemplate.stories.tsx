import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { KitchenSetupTemplate } from './KitchenSetupTemplate.tsx';

const meta = {
  title: 'Templates/Kitchen setup',
  component: KitchenSetupTemplate,
  args: {
    email: 'you@example.com',
    kitchenName: 'Our kitchen',
    onKitchenNameChange: () => undefined,
    invite: { kind: 'noKitchen' },
    onStart: () => undefined,
    onCheckInvites: () => undefined,
    onSignOut: () => undefined,
  },
} satisfies Meta<typeof KitchenSetupTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Before Start planning: no kitchen to invite to yet, and a way to look for a partner's invite instead. */
export const Rest: Story = {};
/** The kitchen is made: the partner's email can be added. */
export const Made: Story = { args: { invite: { kind: 'compose', email: '', onEmailChange: () => undefined, onInvite: () => undefined } } };
/** The partner is invited. */
export const Invited: Story = { args: { invite: { kind: 'invited', email: 'shazya@gmail.com', onCancel: () => undefined } } };

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Rest, decorators: [withPhoneInsets] };
