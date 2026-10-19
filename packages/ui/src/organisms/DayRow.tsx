import { StyleSheet, View } from 'react-native';
import { Tile } from '../atoms/Tile.tsx';
import type { MealTone } from '../atoms/meal-tone.ts';
import { MealCard } from '../molecules/MealCard.tsx';
import { MealEmpty } from '../molecules/MealEmpty.tsx';
import { tokens } from '../tokens/tokens.ts';

/** day.row: a day with one meal, with two or more, and with none (the empty slot). */
export const DAYROW_STATES = ['oneMeal', 'manyMeals', 'empty'] as const;

/** A meal planned for a day. */
export interface PlannedMeal {
  id: string;
  name: string;
  tone?: MealTone;
  /** Where the recipe lives, such as "example.com". */
  link?: string;
}

export interface DayRowProps {
  /** Short weekday as it should show, such as "Fri". */
  weekday: string;
  /** Day of the month. */
  day: number;
  /** The meals in the order they were added. Empty shows the slot to plan one. */
  meals: readonly PlannedMeal[];
  onOpenMeal?: (id: string) => void;
  onPlan?: () => void;
}

/** One day of the plan: its tile, stretched to the height of the meals beside it (tile.day, meal.card x n or meal.empty). */
export function DayRow({ weekday, day, meals, onOpenMeal, onPlan }: DayRowProps) {
  return (
    <View style={styles.row}>
      <Tile weekday={weekday} day={day} />
      <View style={styles.meals}>
        {meals.length === 0 ? (
          <MealEmpty {...(onPlan ? { onPress: onPlan } : {})} />
        ) : (
          meals.map((meal) => (
            <MealCard
              key={meal.id}
              name={meal.name}
              {...(meal.tone ? { tone: meal.tone } : {})}
              {...(meal.link ? { link: meal.link } : {})}
              onPress={() => onOpenMeal?.(meal.id)}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch', gap: tokens.space[10] },
  meals: { flex: 1, minWidth: 0, gap: tokens.space[6] },
});
