import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { PreferencesTemplate } from './PreferencesTemplate.tsx';

const meta = {
  title: 'Templates/Preferences',
  component: PreferencesTemplate,
  args: { name: 'Alex', email: 'you@example.com', kitchen: 'Our kitchen', partnerName: 'Sam' },
} satisfies Meta<typeof PreferencesTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Settings. */
export const Rest: Story = { args: { notificationsOn: false, onNotificationsChange: () => {} } };

/** Settings before push opt-in exists: the switch is disabled and says why. */
export const Unavailable: Story = {
  args: { notificationsUnavailable: 'Coming soon' },
};

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Rest, decorators: [withPhoneInsets] };
