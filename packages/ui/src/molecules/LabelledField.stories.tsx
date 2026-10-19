import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { LabelledField } from './LabelledField.tsx';

const meta = {
  title: 'Molecules/LabelledField',
  component: LabelledField,
  args: {
    label: 'Recipe link',
    optional: true,
    value: '',
    onChangeText: () => undefined,
    placeholder: 'Paste a link',
    actionLabel: 'Paste',
    hint: 'Saved with the meal, so the recipe is easy to find again.',
  },
} satisfies Meta<typeof LabelledField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Filled: Story = { args: { value: 'https://example.com/chana-masala' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
/** The board's field.labelled--error. */
export const Invalid: Story = { args: { errorMessage: 'That link does not look right.' } };
