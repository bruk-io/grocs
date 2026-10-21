import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Count } from '../atoms/Count.tsx';
import { focusRing } from '../atoms/focus.ts';
import { mealColours } from '../atoms/meal-tone.ts';
import type { MealTone } from '../atoms/meal-tone.ts';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** The states of RailRow (rail.row at rest, selected, pressed, focus and disabled); each has a story (R61, R63). */
export const RAILROW_STATES = ['rest', 'selected', 'pressed', 'focus', 'disabled'] as const;

export interface RailRowProps {
  /** The meal's name, or "All items". */
  name: string;
  /** The day the meal is planned for, such as "Mon". Left out on All items. */
  day?: string;
  /** Items of the meal still to buy. Left out on All items. */
  count?: number;
  /** The meal's colour. All items takes the tint instead. */
  tone?: MealTone;
  /** The list is narrowed to this row. */
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  forceState?: 'pressed' | 'focus';
}

/** A choice in the rail's list of meals: a meal in its colour with its day and count, or All items (text.body, text.micro, count.neutral). Pressed when chosen. */
export function RailRow({ name, day, count, tone, selected = false, onPress, disabled = false, forceState }: RailRowProps) {
  const [focused, setFocused] = useState(false);
  const meal = day !== undefined;
  const { fill, ink } = mealColours[tone ?? 'neutral'];
  const nameInk = !meal ? tokens.color.ink : tone === undefined || tone === 'neutral' ? tokens.color.tagNeutralInk : tokens.color.ink;
  return (
    <Pressable
      role="button"
      aria-pressed={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onPress?.()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.row,
        meal ? styles.meal : styles.all,
        { backgroundColor: meal ? fill : tokens.color.surfaceTint, borderColor: selected ? tokens.color.forest : 'transparent' },
        (pressed || forceState === 'pressed') && !disabled && styles.pressed,
        disabled && styles.disabled,
        (focused || forceState === 'focus') && focusRing,
      ]}
    >
      <View style={styles.text}>
        {meal ? <Text style={[styles.day, { color: ink }]}>{day}</Text> : null}
        <Text style={[styles.name, { color: nameInk }]}>{name}</Text>
      </View>
      {count !== undefined ? <Count value={count} /> : null}
      {count !== undefined ? <Text style={[styles.hidden, { color: nameInk }]}> to buy</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minWidth: tokens.size.target,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[8],
    paddingHorizontal: tokens.space[12],
    borderRadius: tokens.radius[16],
    borderWidth: tokens.size.lineW,
  },
  all: { minHeight: tokens.size.target },
  meal: { minHeight: tokens.size.control, paddingVertical: tokens.space[6] },
  pressed: { transform: [{ scale: tokens.scale.pressRow }] },
  disabled: { opacity: tokens.opacity.disabled },
  text: { flex: 1, minWidth: 0 },
  day: {
    ...fontFace('body', tokens.font.weight.heavy),
    fontSize: tokens.font.size.micro,
    lineHeight: tokens.font.lineHeight.micro,
    letterSpacing: tokens.font.size.micro * tokens.font.tracking.caps,
    textTransform: 'uppercase',
  },
  name: {
    ...fontFace('body', tokens.font.weight.heavy),
    fontSize: tokens.font.size.body,
    lineHeight: tokens.font.lineHeight.body,
  },
  // Read by a screen reader after the count ("5 to buy"), never drawn.
  hidden: { position: 'absolute', width: 1, height: 1, overflow: 'hidden' },
});
