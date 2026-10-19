import { StyleSheet, View } from 'react-native';
import type { MealTone } from '../atoms/meal-tone.ts';
import { Tile } from '../atoms/Tile.tsx';
import { tokens } from '../tokens/tokens.ts';
import { MealCard } from './MealCard.tsx';

/** The states of DayMeal; each has a story (R61, R63). */
export const DAYMEAL_STATES = ['rest', 'pressed', 'focus', 'disabled'] as const;

export interface DayMealProps {
  /** Short weekday as it should show, such as "Fri". */
  weekday: string;
  /** Day of the month. */
  day: number;
  /** The name of the meal planned for that day. */
  meal: string;
  tone?: MealTone;
  link?: string;
  onPress?: () => void;
  disabled?: boolean;
  forceState?: 'pressed' | 'focus';
}

/** One day and its one meal side by side (tile.day, meal.card). */
export function DayMeal({ weekday, day, meal, tone, link, onPress, disabled = false, forceState }: DayMealProps) {
  return (
    <View style={styles.row}>
      <Tile weekday={weekday} day={day} />
      <View style={styles.meal}>
        <MealCard
          name={meal}
          disabled={disabled}
          {...(tone ? { tone } : {})}
          {...(link ? { link } : {})}
          {...(onPress ? { onPress } : {})}
          {...(forceState ? { forceState } : {})}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: tokens.space[10] },
  meal: { flex: 1, minWidth: 0 },
});
