import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { focusRing } from '../atoms/focus.ts';
import { Text } from '../atoms/Text.tsx';
import { icons } from '../icons/index.ts';
import { tokens } from '../tokens/tokens.ts';

/** The states of MealEmpty; each has a story (R61, R63). */
export const MEALEMPTY_STATES = ['rest', 'pressed', 'focus', 'disabled'] as const;

export interface MealEmptyProps {
  /** What the slot says. */
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  forceState?: 'pressed' | 'focus';
}

/** A day with no meal yet: a dashed slot that is itself the tap target (bullet.add, text.body). */
export function MealEmpty({ label = 'Plan a meal', onPress, disabled = false, forceState }: MealEmptyProps) {
  const [focused, setFocused] = useState(false);
  const Add = icons.add;
  return (
    <Pressable
      role="button"
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onPress?.()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.slot,
        (pressed || forceState === 'pressed') && !disabled && styles.pressed,
        disabled && styles.disabled,
        (focused || forceState === 'focus') && focusRing,
      ]}
    >
      <View aria-hidden style={styles.bullet}>
        <Add color={tokens.color.onBrand} size={tokens.size.iconChip} />
      </View>
      <Text variant="label">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    minWidth: tokens.size.target,
    minHeight: tokens.size.row,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[10],
    paddingHorizontal: tokens.space[16],
    borderRadius: tokens.radius[20],
    borderWidth: tokens.size.lineW,
    borderStyle: 'dashed',
    borderColor: tokens.color.lineDashed,
  },
  pressed: { backgroundColor: tokens.color.surfaceTint, transform: [{ scale: tokens.scale.pressRow }] },
  disabled: { opacity: tokens.opacity.disabled },
  bullet: {
    width: tokens.size.bullet,
    height: tokens.size.bullet,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
