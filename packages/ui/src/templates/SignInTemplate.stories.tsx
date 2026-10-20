import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button } from '../atoms/Button.tsx';
import { SignInTemplate } from './SignInTemplate.tsx';

const meta = {
  title: 'Templates/Sign in',
  component: SignInTemplate,
  args: { title: 'Grocs', tagline: 'Plan the week. Shop together.' },
} satisfies Meta<typeof SignInTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Welcome. */
export const Rest: Story = {};

/** Welcome with one primary action in place of Continue with Google and the invite row (the demo). */
export const PrimaryAction: Story = { args: { primaryLabel: 'Try the demo' } };

/** Welcome in a development build: the test sign-in sits in the sheet's footer, below the invite row. */
export const WithFooter: Story = {
  args: { footer: <Button variant="text" size="s" label="Sign in as Bruk (test)" /> },
};
