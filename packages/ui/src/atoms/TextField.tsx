import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { Text } from './Text.tsx';

/** The states of TextField; each has a story (R61, R63). */
export const TEXTFIELD_STATES = ['rest', 'filled', 'pressed', 'focus', 'disabled', 'invalid'] as const;

export interface TextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  /** What a screen reader says, and the hint shown when the field is empty. */
  label: string;
  onSubmit?: () => void;
  disabled?: boolean;
  /** Shown under the field, and makes the field read as invalid. */
  errorMessage?: string;
  /** Draws a state without the interaction that causes it. For Storybook and tests. */
  forceState?: 'pressed' | 'focus';
}

export function TextField({ value, onChangeText, label, onSubmit, disabled = false, errorMessage, forceState }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const invalid = errorMessage !== undefined;
  return (
    <View style={styles.wrap}>
      <TextInput
        aria-label={label}
        aria-invalid={invalid}
        placeholder={label}
        placeholderTextColor={tokens.color.inkHint}
        value={value}
        editable={!disabled}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="done"
        style={[
          styles.input,
          forceState === 'pressed' && styles.pressed,
          (focused || forceState === 'focus') && styles.focused,
          invalid && styles.invalid,
          disabled && styles.disabled,
        ]}
      />
      {invalid ? (
        <Text variant="caption" role="alert">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: tokens.space[4] },
  input: {
    minHeight: tokens.size.control,
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.line,
    borderRadius: tokens.radius[20],
    paddingHorizontal: tokens.space[16],
    backgroundColor: tokens.color.surfaceCard,
    color: tokens.color.ink,
    fontFamily: tokens.font.family.body,
    fontSize: tokens.font.size.label,
    fontWeight: tokens.font.weight.heavy,
  },
  pressed: { backgroundColor: tokens.color.surfaceTint },
  focused: { borderColor: tokens.color.forest },
  invalid: { borderColor: tokens.color.error },
  disabled: { backgroundColor: tokens.color.disabled, color: tokens.color.disabledInk },
});
