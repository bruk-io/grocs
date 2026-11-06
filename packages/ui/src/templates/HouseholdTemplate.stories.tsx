import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { HouseholdTemplate } from './HouseholdTemplate.tsx';

const meta = {
  title: 'Templates/Household',
  component: HouseholdTemplate,
  args: {
    kitchenName: 'Our kitchen',
    members: [{ name: 'Bruk', isYou: true }],
    invite: { kind: 'open', code: 'MOREL-0042', expires: 'Works until 3:40 PM tomorrow', onShare: () => undefined, onCopy: () => undefined },
    onBack: () => undefined,
  },
} satisfies Meta<typeof HouseholdTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The kitchen has room: the invite to send, and how long it works. */
export const Waiting: Story = {};
/** Both members are in: no invite, since a kitchen holds two (R3). */
export const Full: Story = { args: { members: [{ name: 'Bruk', isYou: true }, { name: 'Shazya', isYou: false }], invite: { kind: 'full' } } };
/** While the phone asks the server for the invite. */
export const Loading: Story = { args: { invite: { kind: 'loading' } } };
/** The server could not be reached. */
export const Failed: Story = { args: { invite: { kind: 'failed', message: 'check your connection and try again' } } };

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Waiting, decorators: [withPhoneInsets] };
