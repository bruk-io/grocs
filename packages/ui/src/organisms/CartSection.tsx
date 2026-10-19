import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { ItemRow } from '../molecules/ItemRow.tsx';
import { SectionHeader } from '../molecules/SectionHeader.tsx';
import { tokens } from '../tokens/tokens.ts';
import type { ListItem } from './ListSection.tsx';

/** cart.section: the section once something is in the cart. */
export const CARTSECTION_STATES = ['rest'] as const;

export interface CartSectionProps {
  /** What is in the cart. Each one is ticked. */
  items: readonly ListItem[];
  /** Unticking sends the state it wants (false), never a toggle (R17). */
  onToggleItem?: (id: string, inCart: boolean) => void;
  onClear?: () => void;
}

/** The ticked-off things and the way to clear them (section.header, item.row--done x n, button.text). */
export function CartSection({ items, onToggleItem, onClear }: CartSectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader icon="cart" title="In the cart" count={items.length} tone="cart" />
      <View style={styles.rows}>
        {items.map((item) => (
          <ItemRow key={item.id} name={item.name} inCart onToggle={(next) => onToggleItem?.(item.id, next)} />
        ))}
      </View>
      <View style={styles.clear}>
        <Button variant="text" size="s" label="Clear the cart" {...(onClear ? { onPress: onClear } : {})} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.space[8] },
  rows: { gap: tokens.space[6] },
  clear: { alignItems: 'center' },
});
