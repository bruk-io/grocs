import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { icons } from '../icons/index.ts';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';
import { focusRing } from './focus.ts';
import { mealColours } from './meal-tone.ts';
import type { MealTone } from './meal-tone.ts';

/** The states of Chip, for both kinds (chip.meal and chip.quick-add); each has a story (R61, R63). */
export const CHIP_STATES = ['rest', 'pressed', 'selected', 'focus', 'disabled'] as const;

export interface ChipProps {
  label: string;
  /** meal picks a meal in its colour; quickAdd adds a suggested item, with a plus. */
  kind?: 'meal' | 'quickAdd';
  /** The colour of a meal chip. */
  tone?: MealTone;
  /** Chosen: a meal chip is ticked and outlined, a quick-add chip outlined in forest. */
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /** Draws a state without the interaction that causes it. For Storybook and tests. */
  forceState?: 'pressed' | 'focus';
}

export function Chip({ label, kind = 'meal', tone = 'amber', selected = false, onPress, disabled = false, forceState }: ChipProps) {
  const [focused, setFocused] = useState(false);
  const meal = kind === 'meal';
  const { fill, ink } = mealColours[tone];
  const Tick = icons.check;
  const Add = icons.add;
  const colour = disabled ? tokens.color.disabledInk : meal ? ink : tokens.color.ink;
  return (
    <Pressable
      role="button"
      aria-pressed={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onPress?.()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={styles.target}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.chip,
            meal ? { backgroundColor: fill, borderColor: selected ? ink : 'transparent', paddingHorizontal: tokens.space[16] } : styles.quickAdd,
            !meal && selected && { borderColor: tokens.color.forest },
            disabled && styles.disabled,
            (pressed || forceState === 'pressed') && !disabled && { transform: [{ scale: tokens.scale.pressChip }] },
            (focused || forceState === 'focus') && focusRing,
          ]}
        >
          {meal && selected ? <Tick color={colour} size={tokens.size.iconChip} /> : null}
          {meal ? null : (
            <View aria-hidden>
              <Add color={tokens.color.forest} size={tokens.size.iconChip} />
            </View>
          )}
          <Text style={[styles.label, meal || disabled ? styles.heavy : styles.bold, { color: colour }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // The press target keeps its size while the chip drawn inside it shrinks, so it stays 44 high pressed (R42).
  target: { alignSelf: 'flex-start', minWidth: tokens.size.target, minHeight: tokens.size.target, justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[6],
    minHeight: tokens.size.target,
    borderWidth: tokens.size.lineW,
    borderRadius: tokens.radius.pill,
  },
  quickAdd: { paddingHorizontal: tokens.space[14], borderColor: tokens.color.line, backgroundColor: tokens.color.surfaceCard },
  disabled: { backgroundColor: tokens.color.disabled, borderColor: tokens.color.lineSoft, paddingHorizontal: tokens.space[16] },
  label: { fontSize: tokens.font.size.body, lineHeight: tokens.font.lineHeight.body },
  heavy: { ...fontFace('body', tokens.font.weight.heavy) },
  bold: { ...fontFace('body', tokens.font.weight.bold) },
});
