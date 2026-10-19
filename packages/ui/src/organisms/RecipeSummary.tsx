import { StyleSheet, View } from 'react-native';
import { Text } from '../atoms/Text.tsx';
import { icons } from '../icons/index.ts';
import { ServingsStepper } from '../molecules/ServingsStepper.tsx';
import { tokens } from '../tokens/tokens.ts';

/** recipe.summary: what the import found. Parked with recipe import; built so the board can go (R66). */
export const RECIPESUMMARY_STATES = ['rest', 'minServings'] as const;

export interface RecipeSummaryProps {
  /** How many ingredients the import found. */
  found: number;
  /** Where the recipe lives, such as "example.com". */
  link: string;
  servings: number;
  /** Sends the number it wants, never a step. */
  onServingsChange?: (next: number) => void;
}

/** The import's result and the servings to scale it by (icon.check, icon.link, text, stepper.servings). */
export function RecipeSummary({ found, link, servings, onServingsChange }: RecipeSummaryProps) {
  const Check = icons.check;
  const Link = icons.link;
  return (
    <View style={styles.card}>
      <View style={styles.words}>
        <View style={styles.line}>
          <Check color={tokens.color.mealAmberInk} size={tokens.size.iconChip} />
          <Text variant="label">{`Found ${found} ingredients`}</Text>
        </View>
        <View style={styles.line}>
          <Link color={tokens.color.mealAmberInk} size={tokens.size.iconChip} />
          <Text variant="small">{link}</Text>
        </View>
      </View>
      <View style={styles.stepper}>
        <ServingsStepper value={servings} {...(onServingsChange ? { onChange: onServingsChange } : {})} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.space[12],
    paddingVertical: tokens.space[10],
    paddingLeft: tokens.space[16],
    paddingRight: tokens.space[10],
    borderRadius: tokens.radius[20],
    backgroundColor: tokens.color.mealAmber,
  },
  words: { flex: 1, minWidth: 0, gap: tokens.space[2] },
  line: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[6] },
  stepper: { borderRadius: tokens.radius[16], backgroundColor: tokens.color.surfaceCard },
});
