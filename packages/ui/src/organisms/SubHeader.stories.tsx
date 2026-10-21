import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { SubHeader } from './SubHeader.tsx';

const meta = { title: 'Organisms/SubHeader', component: SubHeader, args: { title: 'Add a meal', mascot: 'chanty' } } satisfies Meta<typeof SubHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A task screen: the back link names the parent. */
export const Back: Story = { args: { lead: { kind: 'back', label: 'Meal plan' }, tag: 'Thursday, Oct 22' } };
/** A plain line where there is no parent to go back to (Your kitchen, after sign-in). */
export const Line: Story = { args: { lead: { kind: 'line', text: 'Signed in as you@example.com' }, tag: 'Last step', title: 'Your kitchen', mascot: 'enoki' } };
/** The Join screen: the wordmark replaces the back link, because nothing sits behind it. */
export const Wordmark: Story = { args: { lead: { kind: 'wordmark' }, tag: 'Invite', title: "You're invited" } };

/** Chanty speaking at 360 wide: the bubble opens to the left of the mascot and stays on screen. */
export const SpeakingAt360: Story = {
  args: { ...Back.args, mascotState: 'speaking' },
  decorators: [(Story) => <View style={{ width: tokens.size.phoneNarrow }}><Story /></View>],
};
