import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { KitchenSetupTemplate } from './KitchenSetupTemplate.tsx';

const meta = {
  title: 'Templates/Kitchen setup',
  component: KitchenSetupTemplate,
  args: {
    email: 'you@example.com',
    kitchenName: 'Our kitchen',
    onKitchenNameChange: () => undefined,
  },
} satisfies Meta<typeof KitchenSetupTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Household. */
export const Rest: Story = { args: { inviteCode: 'MOREL-24', onShare: () => undefined, onCopy: () => undefined } };
/** Before Start planning there is no code: the card shows a hint and no Share link or Copy code. */
export const NoInviteYet: Story = { args: { inviteCode: null } };
