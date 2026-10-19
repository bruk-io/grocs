import { StyleSheet, View } from 'react-native';
import { Chip } from '../atoms/Chip.tsx';
import type { MealTone } from '../atoms/meal-tone.ts';
import { Text } from '../atoms/Text.tsx';
import { TextField } from '../atoms/TextField.tsx';
import { SuggestionRow } from '../molecules/SuggestionRow.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { tokens } from '../tokens/tokens.ts';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The Add an item screen as it appears in the reference: typing, with suggestions under the field. */
export const ITEMPICKERTEMPLATE_STATES = ['typing'] as const;

export interface PickerMeal {
  id: string;
  label: string;
  tone: MealTone;
}

export interface PickerSuggestion {
  id: string;
  name: string;
  /** Where it lives and how much it usually is. */
  detail?: string;
}

export interface PickerFrequent {
  id: string;
  label: string;
}

export interface ItemPickerTemplateProps {
  /** The week as it should read, such as "Week of Oct 19". */
  weekLabel: string;
  value: string;
  onValueChange: (text: string) => void;
  /** Adds what is typed. */
  onAdd?: () => void;
  /** The meals of the week an item can be for. */
  meals: readonly PickerMeal[];
  /** The meal the item is for; none means an extra. */
  selectedMealId?: string;
  onSelectMeal?: (id: string | undefined) => void;
  suggestions: readonly PickerSuggestion[];
  onAddSuggestion?: (id: string) => void;
  /** What the household buys often. */
  frequent: readonly PickerFrequent[];
  onAddFrequent?: (id: string) => void;
  /** Goes back to Groceries. */
  onBack?: () => void;
}

/** template.task filled for Add an item: header.sub, the add field, chip.group, suggestion.row x n, quick-add chips. */
export function ItemPickerTemplate({
  weekLabel,
  value,
  onValueChange,
  onAdd,
  meals,
  selectedMealId,
  onSelectMeal,
  suggestions,
  onAddSuggestion,
  frequent,
  onAddFrequent,
  onBack,
}: ItemPickerTemplateProps) {
  return (
    <TaskLayout header={<SubHeader lead={{ kind: 'back', label: 'Groceries', ...(onBack ? { onPress: onBack } : {}) }} tag={weekLabel} title="Add an item" mascot="ollie" />}>
      <View style={styles.group}>
        <TextField
          value={value}
          onChangeText={onValueChange}
          label="Add an item"
          actionLabel="Add"
          actionKind="primary"
          {...(onAdd ? { onAction: onAdd, onSubmit: onAdd } : {})}
        />
        <Text variant="muted">
          Paste a few items at once, one per line.
        </Text>
      </View>
      {meals.length > 0 ? (
        <View style={styles.group}>
          <Text variant="label" accessibilityRole="header">
            For a meal <Text variant="muted">(optional)</Text>
          </Text>
          <View style={styles.chips}>
            {meals.map((meal) => (
              <Chip
                key={meal.id}
                label={meal.label}
                tone={meal.tone}
                selected={meal.id === selectedMealId}
                onPress={() => onSelectMeal?.(meal.id === selectedMealId ? undefined : meal.id)}
              />
            ))}
          </View>
        </View>
      ) : null}
      {suggestions.length > 0 ? (
        <View style={styles.group}>
          <Text variant="label" accessibilityRole="header">
            Suggestions
          </Text>
          <View style={styles.rows}>
            {suggestions.map((suggestion) => (
              <SuggestionRow
                key={suggestion.id}
                name={suggestion.name}
                {...(suggestion.detail ? { detail: suggestion.detail } : {})}
                onAdd={() => onAddSuggestion?.(suggestion.id)}
              />
            ))}
          </View>
        </View>
      ) : null}
      {frequent.length > 0 ? (
        <View style={styles.group}>
          <Text variant="label" accessibilityRole="header">
            You buy often
          </Text>
          <View style={styles.chips}>
            {frequent.map((item) => (
              <Chip key={item.id} kind="quickAdd" label={item.label} onPress={() => onAddFrequent?.(item.id)} />
            ))}
          </View>
        </View>
      ) : null}
    </TaskLayout>
  );
}

const styles = StyleSheet.create({
  group: { gap: tokens.space[8] },
  rows: { gap: tokens.space[6] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[8] },
});
