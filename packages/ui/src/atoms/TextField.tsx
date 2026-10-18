import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { Text } from './Text.tsx';

/** The states of TextField; each has a story (R61, R63). */
export const TEXTFIELD_STATES = ['rest', 'filled', 'focus', 'disabled', 'invalid'] as const;

export interface TextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  /** What a screen reader says, and the hint shown when the field is empty. */
  label: string;
  onSubmit?: () => void;
  disabled?: boolean;
  /** Shown under the field, and makes the field read as invalid. */
  errorMessage?: string;
  forceState?: 'focus';
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
        placeholderTextColor={tokens.color.textMuted}
        value={value}
        editable={!disabled}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="done"
        style={[
          styles.input,
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
  wrap: { gap: tokens.space[1] },
  input: {
    minHeight: tokens.size.touch,
    borderWidth: tokens.size.borderWidth,
    borderColor: tokens.color.borderStrong,
    borderRadius: tokens.radius.medium,
    paddingHorizontal: tokens.space[3],
    backgroundColor: tokens.color.surfaceRaised,
    color: tokens.color.text,
    fontSize: tokens.font.size.body,
  },
  focused: { borderColor: tokens.color.focusRing, borderWidth: tokens.size.focusWidth },
  invalid: { borderColor: tokens.color.danger },
  disabled: { opacity: tokens.opacity.disabled },
});
