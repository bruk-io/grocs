import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { focusRing } from '../atoms/focus.ts';
import { Text } from '../atoms/Text.tsx';
import { icons } from '../icons/index.ts';
import { tokens } from '../tokens/tokens.ts';

/** The states of SuggestionRow (suggestion.row rest and pressed, plus focus and disabled); each has a story (R61, R63). */
export const SUGGESTIONROW_STATES = ['rest', 'pressed', 'focus', 'disabled'] as const;

export interface SuggestionRowProps {
  /** The item being suggested, such as "Eggs". */
  name: string;
  /** Where it lives and how much it usually is, such as "Dairy & eggs · usually 1 dozen". */
  detail?: string;
  /** Adds the item. The whole row is the target. */
  onAdd?: () => void;
  disabled?: boolean;
  forceState?: 'pressed' | 'focus';
}

/** An item the app thinks is wanted, with a plus to add it (text.label, text.small, a soft icon button look). */
export function SuggestionRow({ name, detail, onAdd, disabled = false, forceState }: SuggestionRowProps) {
  const [focused, setFocused] = useState(false);
  const Add = icons.add;
  return (
    <Pressable
      role="button"
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onAdd?.()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.row,
        (pressed || forceState === 'pressed') && !disabled && styles.pressed,
        disabled && styles.disabled,
        (focused || forceState === 'focus') && focusRing,
      ]}
    >
      <View style={styles.body}>
        <Text variant="label">{name}</Text>
        {detail ? <Text variant="muted">{detail}</Text> : null}
      </View>
      <View aria-hidden style={styles.plus}>
        <Add color={tokens.color.forest} size={tokens.size.iconTileGlyph} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minWidth: tokens.size.target,
    minHeight: tokens.size.row,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[12],
    paddingVertical: tokens.space[8],
    paddingLeft: tokens.space[16],
    paddingRight: tokens.space[10],
    borderRadius: tokens.radius[20],
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.lineSoft,
    backgroundColor: tokens.color.surfaceCard,
  },
  pressed: { backgroundColor: tokens.color.surfaceTint, transform: [{ scale: tokens.scale.pressRow }] },
  disabled: { opacity: tokens.opacity.disabled },
  body: { flex: 1, minWidth: 0, gap: tokens.space[2] },
  plus: {
    width: tokens.size.target,
    height: tokens.size.target,
    borderRadius: tokens.radius[16],
    backgroundColor: tokens.color.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
