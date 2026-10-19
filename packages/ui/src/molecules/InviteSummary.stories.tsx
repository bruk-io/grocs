import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InviteSummary } from './InviteSummary.tsx';

const meta = {
  title: 'Molecules/InviteSummary',
  component: InviteSummary,
  args: { inviter: 'Bruk', kitchen: 'Our kitchen', description: "Plan the week's meals together and shop from one shared list, live on both phones." },
} satisfies Meta<typeof InviteSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
