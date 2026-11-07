import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { MealFormTemplate } from './MealFormTemplate.tsx';

const meta = {
  title: 'Templates/Meal form',
  component: MealFormTemplate,
  args: {
    dateLabel: 'Thursday, Oct 22',
    title: 'Add a meal',
    submitLabel: 'Add to Thursday',
    submittingLabel: 'Adding',
    name: 'Fried rice',
    onNameChange: () => undefined,
    link: '',
    onLinkChange: () => undefined,
  },
} satisfies Meta<typeof MealFormTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Add a meal. */
export const Rest: Story = {};

/** Edit a meal, with Remove meal available. */
export const Editing: Story = { ...Rest, args: { title: 'Edit a meal', submitLabel: 'Save changes', submittingLabel: 'Saving', onRemove: () => undefined } };

/** While removing a meal. */
export const Removing: Story = { ...Editing, args: { ...Editing.args, link: 'https://example.com/recipe', removing: true } };

/** The link field shows a validation error. */
export const Invalid: Story = { ...Rest, args: { linkError: 'Invalid recipe link' } };

/** A link is pasted in and 'Get recipe and groceries' is offered. */
export const WithImport: Story = { ...Rest, args: { link: 'https://example.com/recipe', onImportRecipe: () => undefined } };

/** Importing the recipe: the action is busy and disabled. */
export const Importing: Story = { ...WithImport, args: { ...WithImport.args, importing: true } };

/** The import failed: the message shows under the link field, in place of the hint. */
export const ImportError: Story = { ...WithImport, args: { ...WithImport.args, importError: "We couldn't reach that site. Try again tomorrow." } };

/** The meal already has a saved recipe: its title shows with a View recipe action. */
export const WithRecipe: Story = { ...WithImport, args: { ...WithImport.args, recipeTitle: 'Fried rice', onOpenRecipe: () => undefined } };

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Rest, decorators: [withPhoneInsets] };
