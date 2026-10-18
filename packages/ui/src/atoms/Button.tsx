import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { tokens } from '../tokens/tokens.ts';

/** The states of Button; each has a story (R61, R63). */
export const BUTTON_STATES = ['rest', 'pressed', 'focus', 'disabled', 'loading'] as const;

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Shows the button as busy and ignores presses. */
  loading?: boolean;
  forceState?: 'pressed' | 'focus';
}

export function Button({ label, onPress, disabled = false, loading = false, forceState }: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const inactive = disabled || loading;
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={inactive}
      aria-busy={loading}
      disabled={inactive}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        (pressed || forceState === 'pressed') && styles.pressed,
        (focused || forceState === 'focus') && styles.focused,
        disabled && styles.disabled,
        loading && styles.loading,
      ]}
    >
      <Text style={styles.label}>{loading ? `${label}…` : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: tokens.size.touch,
    minWidth: tokens.size.touch,
    paddingHorizontal: tokens.space[4],
    borderRadius: tokens.radius.medium,
    backgroundColor: tokens.color.primary,
    borderWidth: tokens.size.borderWidth,
    borderColor: tokens.color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: tokens.color.primaryPressed, borderColor: tokens.color.primaryPressed },
  focused: { borderColor: tokens.color.focusRing, borderWidth: tokens.size.focusWidth },
  disabled: { opacity: tokens.opacity.disabled },
  loading: { opacity: tokens.opacity.pressed },
  label: {
    color: tokens.color.textOnPrimary,
    fontSize: tokens.font.size.body,
    lineHeight: tokens.font.lineHeight.body,
    fontWeight: tokens.font.weight.bold,
  },
});
