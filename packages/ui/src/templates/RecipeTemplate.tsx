import { StyleSheet, View } from 'react-native';
import { Text } from '../atoms/Text.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { tokens } from '../tokens/tokens.ts';
import { Card } from './layouts/Card.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The saved recipe for a meal: no servings stepper and no ticking (decision-16: no scaling). */
export const RECIPETEMPLATE_STATES = ['rest', 'noYield', 'long'] as const;

export interface RecipeTemplateProps {
  title: string;
  /** e.g. "4 servings"; left out of the header when there is none. */
  yieldLabel: string | null;
  /** The source site's hostname, such as "example.com". */
  sourceLabel: string;
  /** Each ingredient's line, as written. */
  ingredients: readonly string[];
  steps: readonly string[];
  /** Goes back to the meal the recipe was imported for. */
  onBack?: () => void;
}

/** template.task filled for a saved recipe: header.sub, the source line, card.ingredients, card.steps (numbered). */
export function RecipeTemplate({ title, yieldLabel, sourceLabel, ingredients, steps, onBack }: RecipeTemplateProps) {
  return (
    <TaskLayout
      header={
        <SubHeader
          lead={{ kind: 'back', label: 'Meal plan', ...(onBack ? { onPress: onBack } : {}) }}
          {...(yieldLabel ? { tag: yieldLabel } : {})}
          title={title}
          mascot="chanty"
        />
      }
    >
      <Text variant="small" tone="muted">{`From ${sourceLabel}`}</Text>
      <Card>
        <Text variant="heading" accessibilityRole="header">
          Ingredients
        </Text>
        <View style={styles.list}>
          {ingredients.map((line, index) => (
            <Text key={`${index}-${line}`} variant="body">
              {line}
            </Text>
          ))}
        </View>
      </Card>
      <Card>
        <Text variant="heading" accessibilityRole="header">
          Steps
        </Text>
        <View style={styles.list}>
          {steps.map((step, index) => (
            <Text key={`${index}-${step}`} variant="body">{`${index + 1}. ${step}`}</Text>
          ))}
        </View>
      </Card>
    </TaskLayout>
  );
}

const styles = StyleSheet.create({
  list: { gap: tokens.space[8] },
});
