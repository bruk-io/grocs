import { StyleSheet, View } from 'react-native';
import type { AisleOption } from '../atoms/aisle-option.ts';
import { Chip } from '../atoms/Chip.tsx';
import { tokens } from '../tokens/tokens.ts';

/** The states of AisleChipGroup (chip.group rest, plus the pressed, focus and disabled the rules ask for); each has a story (R61, R63). */
export const AISLECHIPGROUP_STATES = ['rest', 'pressed', 'focus', 'disabled'] as const;

export interface AisleChipGroupProps {
  /** What a screen reader says for the group, such as "Aisle for Lemon". */
  label: string;
  options: readonly AisleOption[];
  /** The id of the aisle the item is currently in, so its chip shows pressed. */
  selectedId?: string;
  onSelect?: (id: string) => void;
  disabled?: boolean;
  /** Draws a state on the first chip without the interaction that causes it. For Storybook and tests. */
  forceState?: 'pressed' | 'focus';
}

/** The aisles an item could move to, as a labelled group of chips (chip.meal x n). */
export function AisleChipGroup({ label, options, selectedId, onSelect, disabled = false, forceState }: AisleChipGroupProps) {
  return (
    <View role="group" aria-label={label} style={styles.chips}>
      {options.map((aisle, index) => (
        <Chip
          key={aisle.id}
          label={aisle.label}
          tone="neutral"
          selected={aisle.id === selectedId}
          disabled={disabled}
          onPress={() => onSelect?.(aisle.id)}
          {...(index === 0 && forceState ? { forceState } : {})}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[8], paddingLeft: tokens.space[16] },
});
