import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { PreferencesTemplate } from './PreferencesTemplate.tsx';

const meta = {
  title: 'Templates/Preferences',
  component: PreferencesTemplate,
  args: { name: 'Bruk', email: 'you@example.com', kitchen: 'Our kitchen', partnerName: 'Sam' },
} satisfies Meta<typeof PreferencesTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Settings. */
export const Rest: Story = { args: { notificationsOn: false, onNotificationsChange: () => {} } };

/** Settings before push opt-in exists: the switch is disabled and says why. */
export const Unavailable: Story = {
  args: { notificationsUnavailable: 'Coming soon' },
};
