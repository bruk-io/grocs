import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePlatformStyle } from '../platform/platform-style.tsx';
import { tokens } from '../tokens/tokens.ts';

/** The states of Checkbox; each has a story (R61, R63). */
export const CHECKBOX_STATES = ['rest', 'checked', 'pressed', 'focus', 'disabled'] as const;
export type CheckboxState = (typeof CHECKBOX_STATES)[number];

export interface CheckboxProps {
  checked: boolean;
  /** What a screen reader says: the name of the thing being ticked. */
  label: string;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Draws a state without the interaction that causes it. For Storybook and tests. */
  forceState?: 'pressed' | 'focus';
}

export function Checkbox({ checked, label, onChange, disabled = false, forceState }: CheckboxProps) {
  const [focused, setFocused] = useState(false);
  const shape = usePlatformStyle();
  return (
    <Pressable
      role="checkbox"
      aria-label={label}
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={styles.target}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.box,
            shape === 'ios' ? styles.round : styles.rounded,
            checked && styles.boxChecked,
            (pressed || forceState === 'pressed') && styles.boxPressed,
            (focused || forceState === 'focus') && styles.boxFocused,
            disabled && styles.boxDisabled,
          ]}
        >
          {checked ? <Text style={styles.tick}>{'✓'}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    width: tokens.size.touch,
    height: tokens.size.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: tokens.size.check,
    height: tokens.size.check,
    borderWidth: tokens.size.borderWidth + 1,
    borderColor: tokens.color.borderStrong,
    backgroundColor: tokens.color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: { borderRadius: tokens.radius.round },
  rounded: { borderRadius: tokens.radius.small },
  boxChecked: { backgroundColor: tokens.color.checkFill, borderColor: tokens.color.checkFill },
  boxPressed: { backgroundColor: tokens.color.surfacePressed, opacity: tokens.opacity.pressed },
  boxFocused: { borderColor: tokens.color.focusRing, borderWidth: tokens.size.focusWidth },
  boxDisabled: { opacity: tokens.opacity.disabled },
  tick: {
    color: tokens.color.textOnCheckFill,
    fontSize: tokens.font.size.body,
    lineHeight: tokens.font.lineHeight.body,
    fontWeight: tokens.font.weight.bold,
  },
});
