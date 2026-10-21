import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { MainHeader } from './MainHeader.tsx';

const members = [{ name: 'Bruk' }, { name: 'Sam', tone: 'chartreuse', online: true }] as const;

const meta = {
  title: 'Organisms/MainHeader',
  component: MainHeader,
  args: { title: 'Groceries', members, mascot: 'cremi' },
} satisfies Meta<typeof MainHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Groceries: the week, who is in, the title with the shop's progress, and the add bar. */
export const Groceries: Story = {
  args: { eyebrow: 'Week of Oct 19', progress: { toGo: 14, inCart: 3 }, addBar: { value: '', onChangeText: () => undefined } },
};
/** Meal plan: week.nav replaces the label; no progress and no add bar. */
export const MealPlan: Story = {
  args: { title: 'This week', mascot: 'shii', weekNav: { label: 'Oct 19 - 25' } },
};

// A 360-wide phone: the narrowest the header is drawn for. The mascot sits at the right edge, so this is where a bubble would run off.
const at360 = (Story: () => React.JSX.Element) => (
  <View style={{ width: tokens.size.phoneNarrow }}>
    <Story />
  </View>
);
/** Cremi speaking at 360 wide: the bubble opens to the left of the mascot and clears Settings. */
export const SpeakingAt360: Story = { ...Groceries, args: { ...Groceries.args, mascotState: 'speaking' }, decorators: [at360] };
/** Shii speaking at 360 wide, on the Meal plan header. */
export const MealPlanSpeakingAt360: Story = { ...MealPlan, args: { ...MealPlan.args, mascotState: 'speaking' }, decorators: [at360] };
