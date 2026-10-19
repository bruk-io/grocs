import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RecipeSummary } from './RecipeSummary.tsx';

const meta = { title: 'Organisms/RecipeSummary', component: RecipeSummary, args: { found: 12, link: 'example.com', servings: 4 } } satisfies Meta<typeof RecipeSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
/** One serving: the minus button is off. */
export const MinServings: Story = { args: { servings: 1 } };
