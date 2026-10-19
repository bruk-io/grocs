import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AuthSheet } from './AuthSheet.tsx';

const meta = { title: 'Organisms/AuthSheet', component: AuthSheet } satisfies Meta<typeof AuthSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
/** Google's sheet is open: the button shows it is busy. */
export const SigningIn: Story = { args: { signingIn: true } };
export const Disabled: Story = { args: { disabled: true } };
