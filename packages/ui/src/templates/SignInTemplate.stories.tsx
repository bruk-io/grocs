import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { createElement } from 'react';
import type { ComponentType, ReactElement } from 'react';
import { View } from 'react-native';
import { withPhoneInsets } from './phone-insets.ts';
import { Text } from '../atoms/Text.tsx';
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
export const PrimaryAction: Story = { args: { primaryLabel: 'Try the demo', onPrimary: () => {} } };

/** Welcome with Google sign-in's error in the sheet's footer, below the invite row. */
export const WithFooter: Story = {
  args: { footer: <Text variant="muted">auth/google-sign-in-cancelled</Text> },
};

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...PrimaryAction, decorators: [withPhoneInsets] };

/** A decorator drawing the story on a screen this size (exactly, or at least, when the browser's own viewport is taller and the sheet should run to its bottom), under the phone's bars. */
const onScreen = (width: number, height: number, exact: boolean) => (Story: ComponentType): ReactElement =>
  withPhoneInsets(() => createElement(View, { style: exact ? { width, height, flexShrink: 0, overflow: 'hidden' } : { flex: 1, minWidth: width, minHeight: height } }, createElement(Story)));

/** A tall phone (412 x 915): the kitchen takes the space above the sheet, its floor meeting the sheet, and the sheet is only as tall as its button plus the gesture bar. */
export const OnTallPhone: Story = { ...PrimaryAction, decorators: [onScreen(412, 915, false)] };

/** A short phone (360 x 640): the button stays in view; the whole kitchen shrinks to fit, cast and all. */
export const OnShortPhone: Story = { ...PrimaryAction, decorators: [onScreen(360, 640, true)] };
