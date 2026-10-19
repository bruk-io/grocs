import { StyleSheet, View } from 'react-native';
import { Text } from '../atoms/Text.tsx';
import { TextField } from '../atoms/TextField.tsx';
import { tokens } from '../tokens/tokens.ts';

/** The states of LabelledField (field.labelled rest and error, plus the filled, focus and disabled looks of its field); each has a story (R61, R63). */
export const LABELLEDFIELD_STATES = ['rest', 'filled', 'focus', 'disabled', 'invalid'] as const;

export interface LabelledFieldProps {
  /** The name of the field, shown above it and read by a screen reader. */
  label: string;
  /** Adds "(optional)" after the label. */
  optional?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  /** What the empty field says, when that is not the label. */
  placeholder?: string;
  /** Quiet help under the field. Hidden while there is an error. */
  hint?: string;
  /** Shown under the field instead of the hint, and makes the field read as invalid. */
  errorMessage?: string;
  /** Names the soft button inside the field, such as "Paste". */
  actionLabel?: string;
  onAction?: () => void;
  onSubmit?: () => void;
  /** Sets the typed value in the display font, as for an invite code. */
  display?: boolean;
  disabled?: boolean;
  forceState?: 'focus';
}

/** A label over a text field, with an optional action inside it and a hint or error under it (text.body, input.text, button.soft, text.small). */
export function LabelledField({ label, optional = false, value, onChangeText, placeholder, hint, errorMessage, actionLabel, onAction, onSubmit, display = false, disabled = false, forceState }: LabelledFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="label" aria-hidden>
        {label}
        {optional ? <Text variant="muted"> (optional)</Text> : null}
      </Text>
      <TextField
        value={value}
        onChangeText={onChangeText}
        label={optional ? `${label} (optional)` : label}
        disabled={disabled}
        {...(placeholder ? { placeholder } : {})}
        {...(errorMessage !== undefined ? { errorMessage } : {})}
        {...(actionLabel !== undefined ? { actionLabel, actionKind: 'soft' as const } : {})}
        {...(onAction ? { onAction } : {})}
        {...(onSubmit ? { onSubmit } : {})}
        {...(display ? { display } : {})}
        {...(forceState ? { forceState } : {})}
      />
      {hint && errorMessage === undefined ? <Text variant="muted">{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: tokens.space[6] },
});
