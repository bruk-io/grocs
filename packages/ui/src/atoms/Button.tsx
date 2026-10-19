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
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{loading ? `${label}…` : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: tokens.size.control,
    minWidth: tokens.size.target,
    paddingHorizontal: tokens.space[24],
    borderRadius: tokens.radius[20],
    backgroundColor: tokens.color.forest,
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: tokens.color.forestDeep, borderColor: tokens.color.forestDeep },
  focused: { borderColor: tokens.color.focusRing, borderWidth: tokens.size.lineWStrong },
  disabled: { backgroundColor: tokens.color.disabled, borderColor: tokens.color.disabled },
  loading: { opacity: tokens.opacity.pressed },
  label: {
    color: tokens.color.onBrand,
    fontFamily: tokens.font.family.body,
    fontSize: tokens.font.size.label,
    lineHeight: tokens.font.lineHeight.label,
    fontWeight: tokens.font.weight.heavy,
  },
  labelDisabled: { color: tokens.color.disabledInk },
});
