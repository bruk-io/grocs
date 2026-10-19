import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar } from '../atoms/Avatar.tsx';
import { Badge } from '../atoms/Badge.tsx';
import { Checkbox } from '../atoms/Checkbox.tsx';
import { focusRing } from '../atoms/focus.ts';
import type { MealTone } from '../atoms/meal-tone.ts';
import { Skeleton } from '../atoms/Skeleton.tsx';
import { Tag } from '../atoms/Tag.tsx';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** The states of ItemRow (item.row rest, pressed, done, swiped, loading, and the focus and disabled the rules ask for); each has a story (R61, R63). */
export const ITEMROW_STATES = ['rest', 'inCart', 'pressed', 'focus', 'disabled', 'swiped', 'loading', 'waiting', 'new'] as const;

/** A meal an item is for: its name, or its name and colour. */
export type MealBadge = string | { label: string; tone?: MealTone };

export interface ItemRowProps {
  name: string;
  /** Free text such as "2 cartons". */
  amount?: string | null;
  /** The meals the item is for. Empty for an extra. */
  mealBadges?: readonly MealBadge[];
  /** Who added the item; shown as a small avatar at the end of the row. */
  addedBy?: string;
  /** The change has not reached the other phone yet (offline): shows "Waiting to send". */
  waiting?: boolean;
  /** The other person just added it: shows "New". */
  isNew?: boolean;
  inCart: boolean;
  /** Ticking sends the state it wants, never a toggle (R17). */
  onToggle?: (inCart: boolean) => void;
  disabled?: boolean;
  /** The row is slid aside and Remove is showing. The swipe itself belongs to the screen. */
  swiped?: boolean;
  onRemove?: () => void;
  /** The row is a placeholder while the list loads (the import skeleton). */
  loading?: boolean;
  forceState?: 'pressed' | 'focus';
}

const REMOVE_WIDTH = 88;

export function ItemRow({ name, amount, mealBadges = [], addedBy, waiting = false, isNew = false, inCart, onToggle, disabled = false, swiped = false, onRemove, loading = false, forceState }: ItemRowProps) {
  const [removeFocused, setRemoveFocused] = useState(false);
  if (loading) {
    return (
      <View role="status" aria-busy aria-label="Loading an item" style={[styles.row, styles.card]}>
        <View aria-hidden style={styles.skeletonCheck} />
        <View aria-hidden style={styles.skeletonBody}>
          <View style={{ width: '55%' }}>
            <Skeleton />
          </View>
          <View style={{ width: '30%' }}>
            <Skeleton />
          </View>
        </View>
      </View>
    );
  }
  const check = (
    <Checkbox
      checked={inCart}
      label={name}
      disabled={disabled}
      {...(onToggle ? { onChange: onToggle } : {})}
      {...(forceState === 'focus' ? { forceState } : {})}
    />
  );
  if (inCart) {
    return (
      <View style={[styles.row, styles.done]}>
        {check}
        <Text variant="struck">{name}</Text>
      </View>
    );
  }
  const body = (
    <View style={[styles.row, styles.card, forceState === 'pressed' && styles.pressed]}>
      {check}
      <View style={styles.body}>
        <Text variant="label">{name}</Text>
        {amount || mealBadges.length > 0 || waiting ? (
          <View style={styles.meta}>
            {amount ? <Text variant="muted">{amount}</Text> : null}
            {mealBadges.map((meal) => {
              const badge = typeof meal === 'string' ? { label: meal } : meal;
              return <Badge key={badge.label} label={badge.label} {...(badge.tone ? { tone: badge.tone } : {})} />;
            })}
            {waiting ? <Tag label="Waiting to send" kind="sync" /> : null}
          </View>
        ) : null}
      </View>
      {isNew ? <Tag label="New" kind="new" /> : null}
      {addedBy ? <Avatar name={addedBy} size="s" /> : null}
    </View>
  );
  if (!swiped) return body;
  return (
    <View style={styles.swipeFrame}>
      <Pressable
        role="button"
        aria-label={`Remove ${name}`}
        onPress={() => onRemove?.()}
        onFocus={() => setRemoveFocused(true)}
        onBlur={() => setRemoveFocused(false)}
        style={[styles.remove, removeFocused && focusRing]}
      >
        <Text variant="small" tone="error">
          Remove
        </Text>
      </Pressable>
      <View style={{ marginRight: REMOVE_WIDTH }}>{body}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: tokens.size.row,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[4],
    paddingVertical: tokens.space[8],
    paddingLeft: tokens.space[4],
    paddingRight: tokens.space[14],
    borderRadius: tokens.radius[20],
    borderWidth: tokens.size.lineW,
  },
  card: { borderColor: tokens.color.lineSoft, backgroundColor: tokens.color.surfaceCard },
  pressed: { backgroundColor: tokens.color.surfaceTint },
  done: { minHeight: tokens.size.rowDone, borderStyle: 'dashed', borderColor: tokens.color.lineDone, backgroundColor: tokens.color.surfaceDone },
  body: { flex: 1, minWidth: 0, gap: tokens.space[4] },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: tokens.space[6] },
  swipeFrame: { borderRadius: tokens.radius[20], backgroundColor: tokens.color.errorTint, overflow: 'hidden' },
  remove: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: REMOVE_WIDTH,
    minHeight: tokens.size.target,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonCheck: { width: tokens.size.check, height: tokens.size.check, marginLeft: tokens.space[10], marginRight: tokens.space[8], borderRadius: tokens.radius.pill, backgroundColor: tokens.color.lineSoft },
  skeletonBody: { flex: 1, gap: tokens.space[8] },
});
