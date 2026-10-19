import { StyleSheet, View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { DayRow } from './DayRow.tsx';
import type { PlannedMeal } from './DayRow.tsx';

/** week.list: a full week, and the week with nothing planned yet. */
export const WEEKLIST_STATES = ['rest', 'empty'] as const;

export interface PlanDay {
  /** Stable, such as the date "2026-10-19". */
  id: string;
  weekday: string;
  day: number;
  meals: readonly PlannedMeal[];
}

export interface WeekListProps {
  days: readonly PlanDay[];
  onOpenMeal?: (dayId: string, mealId: string) => void;
  /** Opens the add-a-meal screen for that day. */
  onPlan?: (dayId: string) => void;
}

/** The seven days in a column (day.row x 7). */
export function WeekList({ days, onOpenMeal, onPlan }: WeekListProps) {
  return (
    <View style={styles.list}>
      {days.map((day) => (
        <DayRow
          key={day.id}
          weekday={day.weekday}
          day={day.day}
          meals={day.meals}
          onOpenMeal={(mealId) => onOpenMeal?.(day.id, mealId)}
          onPlan={() => onPlan?.(day.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: tokens.space[10] },
});
