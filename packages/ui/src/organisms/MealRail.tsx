import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { MealTone } from '../atoms/meal-tone.ts';
import { MealEmpty } from '../molecules/MealEmpty.tsx';
import { RailLink } from '../molecules/RailLink.tsx';
import { RailRow } from '../molecules/RailRow.tsx';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** nav.rail: nothing chosen, a meal chosen, and no meals planned yet. */
export const MEALRAIL_STATES = ['nothingSelected', 'mealSelected', 'noMealsYet'] as const;

/** A meal in the rail: when it is eaten, its name and how many of its items are still to buy. */
export interface RailMeal {
  id: string;
  name: string;
  /** The day it is planned for, as it should read, such as "Mon". */
  day: string;
  /** Items of this meal still to buy. */
  count: number;
  tone?: MealTone;
}

export interface MealRailProps {
  /** Which page the rail sits beside. */
  activeSection: 'plan' | 'groceries';
  /** What is still to buy, shown on Groceries. Left out when nothing is. */
  toGo?: number;
  /** This week's meals, in the order of the week. */
  meals: readonly RailMeal[];
  /** The meal the list is narrowed to. Left out shows all items. */
  selectedMealId?: string;
  onSelectSection?: (id: 'plan' | 'groceries') => void;
  /** Asks for this meal's items. Pressing the chosen meal again asks for all items instead (R17: the state wanted, not a toggle). */
  onSelectMeal?: (id: string) => void;
  onShowAll?: () => void;
  onPlanMeal?: () => void;
}

/** The left rail of the Fold's inner screen: the two pages, then this week's meals as filters (rail.link x 2, rail.row x n, meal.empty). */
export function MealRail({ activeSection, toGo, meals, selectedMealId, onSelectSection, onSelectMeal, onShowAll, onPlanMeal }: MealRailProps) {
  return (
    <View accessibilityRole="navigation" aria-label="Sections and meals" style={styles.rail}>
      <View style={styles.sections}>
        <RailLink label="Meal plan" icon="calendar" active={activeSection === 'plan'} onPress={() => onSelectSection?.('plan')} />
        <RailLink
          label="Groceries"
          icon="cart"
          active={activeSection === 'groceries'}
          {...(toGo !== undefined && toGo > 0 ? { count: toGo } : {})}
          onPress={() => onSelectSection?.('groceries')}
        />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.meals}>
        <Text accessibilityRole="header" aria-level={2} style={styles.heading}>
          This week's meals
        </Text>
        <RailRow name="All items" selected={selectedMealId === undefined} onPress={() => onShowAll?.()} />
        {meals.map((meal) => (
          <RailRow
            key={meal.id}
            name={meal.name}
            day={meal.day}
            count={meal.count}
            {...(meal.tone ? { tone: meal.tone } : {})}
            selected={meal.id === selectedMealId}
            onPress={() => (meal.id === selectedMealId ? onShowAll?.() : onSelectMeal?.(meal.id))}
          />
        ))}
        <MealEmpty label="Plan a meal" onPress={() => onPlanMeal?.()} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: tokens.size.rail,
    gap: tokens.space[16],
    paddingTop: tokens.space[16],
    paddingBottom: tokens.space[16],
    paddingLeft: tokens.space[16],
    paddingRight: tokens.space[12],
    backgroundColor: tokens.color.surfaceCard,
    borderRightWidth: tokens.size.lineW,
    borderRightColor: tokens.color.lineSoft,
  },
  sections: { gap: tokens.space[6] },
  scroll: { flex: 1, borderTopWidth: tokens.size.lineW, borderTopColor: tokens.color.surfaceTint },
  meals: { gap: tokens.space[6], paddingTop: tokens.space[14] },
  heading: {
    marginHorizontal: tokens.space[4],
    marginBottom: tokens.space[4],
    ...fontFace('body', tokens.font.weight.heavy),
    fontSize: tokens.font.size.caption,
    lineHeight: tokens.font.lineHeight.caption,
    letterSpacing: tokens.font.size.caption * tokens.font.tracking.caps,
    textTransform: 'uppercase',
    color: tokens.color.inkMuted,
  },
});
