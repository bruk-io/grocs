import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** The states of ServingsStepper (stepper.servings rest and min, plus max and the pressed, focus and disabled the rules ask for); each has a story (R61, R63). */
export const SERVINGSSTEPPER_STATES = ['rest', 'min', 'max', 'pressed', 'focus', 'disabled'] as const;

export interface ServingsStepperProps {
  /** How many the meal serves. */
  value: number;
  /** Sends the number it wants, never a step. */
  onChange?: (next: number) => void;
  /** The fewest it can serve; the minus button is off there. */
  min?: number;
  /** The most it can serve; the plus button is off there. */
  max?: number;
  disabled?: boolean;
  /** Draws the plus button pressed or focused without the interaction. For Storybook and tests. */
  forceState?: 'pressed' | 'focus';
}

/** A minus, the number with "serves" under it, and a plus (button.icon--ghost x 2, text.heading, text.micro). */
export function ServingsStepper({ value, onChange, min = 1, max, disabled = false, forceState }: ServingsStepperProps) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;
  return (
    <View role="group" aria-label="Servings" style={styles.group}>
      <Button variant="iconGhost" icon="remove" label="Fewer servings" disabled={disabled || atMin} onPress={() => onChange?.(value - 1)} />
      <View style={styles.value}>
        <Text variant="heading">{value}</Text>
        <Text variant="micro">serves</Text>
      </View>
      <Button
        variant="iconGhost"
        icon="add"
        label="More servings"
        disabled={disabled || atMax}
        onPress={() => onChange?.(value + 1)}
        {...(forceState ? { forceState } : {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radius[18],
    backgroundColor: tokens.color.surfaceCard,
  },
  value: { minWidth: tokens.space[40], alignItems: 'center' },
});
