import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { PreferencesTemplate } from './PreferencesTemplate.tsx';

const meta = {
  title: 'Templates/Preferences',
  component: PreferencesTemplate,
  args: { name: 'Bruk', email: 'you@example.com', kitchen: 'Our kitchen', partnerName: 'Shazya', notificationsOn: false },
} satisfies Meta<typeof PreferencesTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Settings. */
export const Rest: Story = {};
