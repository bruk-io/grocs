import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AuthSheet } from './AuthSheet.tsx';

const meta = { title: 'Organisms/AuthSheet', component: AuthSheet } satisfies Meta<typeof AuthSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
/** Google's sheet is open: the button shows it is busy. */
export const SigningIn: Story = { args: { signingIn: true } };
export const Disabled: Story = { args: { disabled: true } };
/** One primary action in place of Google and the invite row (the demo's Welcome). */
export const PrimaryAction: Story = { args: { primaryLabel: 'Try the demo', onPrimary: () => {} } };
