import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { focusRing } from '../atoms/focus.ts';
import { mealColours } from '../atoms/meal-tone.ts';
import type { MealTone } from '../atoms/meal-tone.ts';
import { icons } from '../icons/index.ts';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** The states of MealCard; each has a story (R61, R63). The meal's colour is a prop, not a state. */
export const MEALCARD_STATES = ['rest', 'pressed', 'focus', 'disabled'] as const;

export interface MealCardProps {
  /** The name of the meal, such as "Pizza night". */
  name: string;
  /** The colour of the meal. It comes from the meal, never from status. */
  tone?: MealTone;
  /** Where the recipe lives, such as "example.com". Shows a link line when the meal has one. */
  link?: string;
  onPress?: () => void;
  disabled?: boolean;
  forceState?: 'pressed' | 'focus';
}

/** One planned meal as a coloured card (text.heading, icon.link, text.small, meal colour). */
export function MealCard({ name, tone = 'amber', link, onPress, disabled = false, forceState }: MealCardProps) {
  const [focused, setFocused] = useState(false);
  const { fill, ink } = mealColours[tone];
  const Link = icons.link;
  return (
    <Pressable
      role="button"
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onPress?.()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: fill },
        (pressed || forceState === 'pressed') && !disabled && styles.pressed,
        disabled && styles.disabled,
        (focused || forceState === 'focus') && focusRing,
      ]}
    >
      <Text style={[styles.name, { color: tone === 'neutral' ? ink : tokens.color.ink }]}>{name}</Text>
      {link ? (
        <View style={styles.link}>
          <Link color={ink} size={tokens.size.iconChip} />
          <Text style={[styles.linkText, { color: ink }]}>{link}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: tokens.size.target,
    minHeight: tokens.size.row,
    justifyContent: 'center',
    gap: tokens.space[6],
    paddingVertical: tokens.space[12],
    paddingHorizontal: tokens.space[16],
    borderRadius: tokens.radius[20],
  },
  pressed: { transform: [{ scale: tokens.scale.pressRow }] },
  disabled: { opacity: tokens.opacity.disabled },
  name: { ...fontFace('display', tokens.font.weight.medium), fontSize: tokens.font.size.heading, lineHeight: tokens.font.lineHeight.heading },
  link: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[6] },
  linkText: { ...fontFace('body', tokens.font.weight.bold), fontSize: tokens.font.size.small, lineHeight: tokens.font.lineHeight.small },
});
