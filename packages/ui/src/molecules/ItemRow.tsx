import { StyleSheet, View } from 'react-native';
import { Badge } from '../atoms/Badge.tsx';
import { Checkbox } from '../atoms/Checkbox.tsx';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** The states of ItemRow; each has a story (R61, R63). */
export const ITEMROW_STATES = ['rest', 'inCart', 'pressed', 'focus', 'disabled'] as const;

export interface ItemRowProps {
  name: string;
  /** Free text such as "2 cartons". */
  amount?: string | null;
  /** Names of the meals the item is for. Empty for an extra. */
  mealBadges?: readonly string[];
  inCart: boolean;
  /** Ticking sends the state it wants, never a toggle (R17). */
  onToggle?: (inCart: boolean) => void;
  disabled?: boolean;
  forceState?: 'pressed' | 'focus';
}

export function ItemRow({ name, amount, mealBadges = [], inCart, onToggle, disabled = false, forceState }: ItemRowProps) {
  return (
    <View style={[styles.row, forceState === 'pressed' && styles.rowPressed]}>
      <Checkbox
        checked={inCart}
        label={name}
        disabled={disabled}
        {...(onToggle ? { onChange: onToggle } : {})}
        {...(forceState ? { forceState } : {})}
      />
      <View style={styles.body}>
        <Text variant={inCart ? 'struck' : 'body'}>{name}</Text>
        {amount ? <Text variant="muted">{amount}</Text> : null}
        {mealBadges.length > 0 ? (
          <View style={styles.badges}>
            {mealBadges.map((meal) => (
              <Badge key={meal} label={meal} />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: tokens.size.row,
    paddingHorizontal: tokens.space[8],
    borderRadius: tokens.radius[20],
  },
  rowPressed: { backgroundColor: tokens.color.surfaceTint },
  body: { flex: 1, paddingVertical: tokens.space[8], paddingLeft: tokens.space[4], gap: tokens.space[4] },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[4] },
});
