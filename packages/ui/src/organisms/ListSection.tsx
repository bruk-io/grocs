import { StyleSheet, View } from 'react-native';
import type { IconName } from '../icons/index.ts';
import { ItemRow } from '../molecules/ItemRow.tsx';
import type { MealBadge } from '../molecules/ItemRow.tsx';
import { SectionHeader } from '../molecules/SectionHeader.tsx';
import { tokens } from '../tokens/tokens.ts';

/** list.section: rest, and waiting (the same section while some items have not reached the other phone). */
export const LISTSECTION_STATES = ['rest', 'waiting'] as const;

/** One thing on the list, as a screen hands it over. */
export interface ListItem {
  id: string;
  name: string;
  amount?: string | null;
  mealBadges?: readonly MealBadge[];
  addedBy?: string;
  inCart: boolean;
  /** Not sent yet (offline). */
  waiting?: boolean;
  /** Just added by the other person. */
  isNew?: boolean;
  /** Slid aside, with Remove showing. */
  swiped?: boolean;
}

export interface ListSectionProps {
  icon: IconName;
  title: string;
  items: readonly ListItem[];
  /** Ticking sends the state it wants, never a toggle (R17). */
  onToggleItem?: (id: string, inCart: boolean) => void;
  onRemoveItem?: (id: string) => void;
}

/** A group of things still to buy: its header and one row each (section.header, item.row x n). */
export function ListSection({ icon, title, items, onToggleItem, onRemoveItem }: ListSectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader icon={icon} title={title} count={items.length} />
      <View style={styles.rows}>
        {items.map((item) => (
          <ItemRow
            key={item.id}
            name={item.name}
            amount={item.amount ?? null}
            {...(item.mealBadges ? { mealBadges: item.mealBadges } : {})}
            {...(item.addedBy ? { addedBy: item.addedBy } : {})}
            {...(item.waiting ? { waiting: true } : {})}
            {...(item.isNew ? { isNew: true } : {})}
            {...(item.swiped ? { swiped: true } : {})}
            inCart={item.inCart}
            onToggle={(next) => onToggleItem?.(item.id, next)}
            {...(onRemoveItem ? { onRemove: () => onRemoveItem(item.id) } : {})}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.space[8] },
  rows: { gap: tokens.space[6] },
});
