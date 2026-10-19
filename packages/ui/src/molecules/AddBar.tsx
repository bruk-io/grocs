import { TextField } from '../atoms/TextField.tsx';

/** The states of AddBar (add.bar rest and focus, plus the filled and disabled looks of its field); each has a story (R61, R63). */
export const ADDBAR_STATES = ['rest', 'filled', 'focus', 'disabled'] as const;

export interface AddBarProps {
  value: string;
  onChangeText: (text: string) => void;
  /** Called by the round plus button. */
  onAdd?: () => void;
  /** Called by the keyboard's done key. */
  onSubmit?: () => void;
  /** Shown while the field is empty and read by a screen reader. */
  label?: string;
  disabled?: boolean;
  /** Draws the focused look without the interaction. For Storybook and tests. */
  forceState?: 'focus';
}

/** The field at the foot of the list with a round plus inside it (input.text--inline and button.icon). */
export function AddBar({ value, onChangeText, onAdd, onSubmit, label = 'Add an item', disabled = false, forceState }: AddBarProps) {
  return (
    <TextField
      value={value}
      onChangeText={onChangeText}
      label={label}
      actionLabel="Add"
      disabled={disabled}
      {...(onAdd ? { onAction: onAdd } : {})}
      {...(onSubmit ? { onSubmit } : {})}
      {...(forceState ? { forceState } : {})}
    />
  );
}
