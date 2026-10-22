import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { mealColours } from '../atoms/meal-tone.ts';
import type { MealTone } from '../atoms/meal-tone.ts';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** meal.filter-line: the list is showing one meal (rest is the only state). */
export const MEALFILTERLINE_STATES = ['rest'] as const;

export interface MealFilterLineProps {
  /** The meal the list is narrowed to, such as "Chana masala". */
  mealName: string;
  /** How many of its items are still to buy. */
  count: number;
  /** The meal's colour. */
  tone?: MealTone;
  /** Goes back to every item. */
  onShowAll?: () => void;
}

/** Says the list is narrowed to a meal, in that meal's colour, with the way back ("Only Chana masala · 4 to buy" and button.secondary). */
export function MealFilterLine({ mealName, count, tone = 'neutral', onShowAll }: MealFilterLineProps) {
  const { fill, ink } = mealColours[tone];
  return (
    <View style={[styles.line, { backgroundColor: fill }]}>
      <Text style={[styles.text, { color: ink }]}>{`Only ${mealName} · ${count} to buy`}</Text>
      <Button variant="secondary" size="s" label="Show all" leadingIcon="close" {...(onShowAll ? { onPress: onShowAll } : {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[8],
    paddingVertical: tokens.space[4],
    paddingLeft: tokens.space[16],
    paddingRight: tokens.space[4],
    borderRadius: tokens.radius.pill,
  },
  text: {
    flex: 1,
    minWidth: 0,
    ...fontFace('body', tokens.font.weight.heavy),
    fontSize: tokens.font.size.body,
    lineHeight: tokens.font.lineHeight.body,
  },
});
