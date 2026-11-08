import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from '../atoms/Chip.tsx';
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

/** An aisle an item could sit in, as data: an id and the label to show on its chip. */
export interface AisleOption {
  id: string;
  label: string;
}

export interface ListSectionProps {
  icon: IconName;
  title: string;
  items: readonly ListItem[];
  /** Ticking sends the state it wants, never a toggle (R17). */
  onToggleItem?: (id: string, inCart: boolean) => void;
  onRemoveItem?: (id: string) => void;
  /** The aisles a row's chips offer, as data. Left out, a row cannot be pressed to change its aisle. */
  aisleOptions?: readonly AisleOption[];
  /** The id of the to-buy item whose aisle chips are open. */
  openAisleItemId?: string | null;
  onPressItem?: (id: string) => void;
  onChooseAisle?: (id: string, aisleId: string) => void;
}

/** A group of things still to buy: its header and one row each (section.header, item.row x n). */
export function ListSection({ icon, title, items, onToggleItem, onRemoveItem, aisleOptions, openAisleItemId, onPressItem, onChooseAisle }: ListSectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader icon={icon} title={title} count={items.length} />
      <View style={styles.rows}>
        {items.map((item) => (
          <Fragment key={item.id}>
            <ItemRow
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
              {...(onPressItem && !item.inCart ? { onPress: () => onPressItem(item.id), pressLabel: `Change the aisle for ${item.name}` } : {})}
            />
            {aisleOptions && aisleOptions.length > 0 && openAisleItemId === item.id ? (
              <View style={styles.chips}>
                {aisleOptions.map((aisle) => (
                  <Chip key={aisle.id} label={aisle.label} tone="neutral" onPress={() => onChooseAisle?.(item.id, aisle.id)} />
                ))}
              </View>
            ) : null}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.space[8] },
  rows: { gap: tokens.space[6] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[8], paddingLeft: tokens.space[16] },
});
