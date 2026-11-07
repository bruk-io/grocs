import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RecipeTemplate } from './RecipeTemplate.tsx';

const ingredients = ['1 1/2 cups chickpeas', '1 (14-ounce) can crushed tomatoes', '2 cloves garlic, minced', '1 tsp cumin'];
const steps = ['Heat the oil in a large pot over medium heat.', 'Add the garlic and cumin, and cook until fragrant.', 'Stir in the tomatoes and chickpeas and simmer for 20 minutes.'];

const meta = {
  title: 'Templates/Recipe',
  component: RecipeTemplate,
  args: { title: 'Chana masala', yieldLabel: '4 servings', sourceLabel: 'example.com', ingredients, steps },
} satisfies Meta<typeof RecipeTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A saved recipe with its yield shown in the header. */
export const Rest: Story = {};

/** A source page with no yield: the header carries no tag. */
export const NoYield: Story = { args: { yieldLabel: null } };

/** A long recipe: many ingredients and steps, scrolling past the fold. */
export const Long: Story = {
  args: {
    title: 'Slow-cooked Sunday ragu',
    ingredients: Array.from({ length: 16 }, (_, i) => `Ingredient line ${i + 1}, as written on the page`),
    steps: Array.from({ length: 12 }, (_, i) => `Step ${i + 1}: do the next thing the recipe says to do.`),
  },
};
