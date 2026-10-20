import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { KitchenSetupTemplate } from './KitchenSetupTemplate.tsx';

const meta = {
  title: 'Templates/Kitchen setup',
  component: KitchenSetupTemplate,
  args: {
    email: 'you@example.com',
    kitchenName: 'Our kitchen',
    onKitchenNameChange: () => undefined,
    inviteCode: 'MOREL-24',
  },
} satisfies Meta<typeof KitchenSetupTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Household. */
export const Rest: Story = { args: { onShare: () => undefined, onCopy: () => undefined } };
/** No invite to share yet: the card's Share link and Copy code are disabled. */
export const InviteUnavailable: Story = {};
