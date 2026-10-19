import { StyleSheet, Text, View } from 'react-native';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';
import { mealColours } from './meal-tone.ts';
import type { MealTone } from './meal-tone.ts';

/** badge.meal in each of the five meal colours; a badge is only ever read, so each state is a colour. */
export const BADGE_STATES = ['amber', 'sky', 'tomato', 'leaf', 'neutral'] as const;

export interface BadgeProps {
  /** The name of the meal an item is for. */
  label: string;
  tone?: MealTone;
}

/** A small label naming the meal an item is for. */
export function Badge({ label, tone = 'amber' }: BadgeProps) {
  const { fill, ink } = mealColours[tone];
  return (
    <View style={[styles.pill, { backgroundColor: fill }]}>
      <Text style={[styles.text, { color: ink }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.space[10],
    paddingVertical: tokens.space[4],
    maxWidth: '100%',
  },
  text: {
    ...fontFace('body', tokens.font.weight.heavy),
    fontSize: tokens.font.size.micro,
    lineHeight: tokens.font.lineHeight.micro,
  },
});
