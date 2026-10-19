import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
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
