import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Count } from '../atoms/Count.tsx';
import { focusRing } from '../atoms/focus.ts';
import { icons } from '../icons/index.ts';
import type { IconName } from '../icons/index.ts';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** The states of TabItem (tab.item active, rest, pressed and focus, plus disabled); each has a story (R61, R63). */
export const TABITEM_STATES = ['active', 'rest', 'pressed', 'focus', 'disabled'] as const;

export interface TabItemProps {
  label: string;
  icon: IconName;
  /** This is the tab whose page is showing. */
  active?: boolean;
  /** A number on the tab, such as what is still to buy. */
  count?: number;
  onPress?: () => void;
  disabled?: boolean;
  forceState?: 'pressed' | 'focus';
}

/** One tab of the bottom bar: an icon, a name and an optional count (icon, text.body, count.accent). Sits in a tab list. */
export function TabItem({ label, icon, active = false, count, onPress, disabled = false, forceState }: TabItemProps) {
  const [focused, setFocused] = useState(false);
  const Glyph = icons[icon];
  const ink = active ? tokens.color.onBrand : disabled ? tokens.color.disabledInk : tokens.color.ink;
  return (
    <Pressable
      role="tab"
      aria-selected={active}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onPress?.()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.tab,
        active && styles.active,
        (pressed || forceState === 'pressed') && !active && !disabled && styles.pressed,
        (focused || forceState === 'focus') && styles.focus,
      ]}
    >
      <Glyph color={ink} size={tokens.size.iconButton} />
      <Text style={[styles.label, { color: ink }]}>{label}</Text>
      {count !== undefined ? (
        <View style={styles.count}>
          <Count value={count} tone="accent" />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    minWidth: tokens.size.target,
    height: tokens.size.tab,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space[8],
    borderRadius: tokens.radius[18],
  },
  count: { justifyContent: 'center' },
  active: { backgroundColor: tokens.color.forest },
  pressed: { backgroundColor: tokens.color.surfaceTint },
  focus: { ...focusRing, outlineOffset: -tokens.size.focusOutline },
  label: { ...fontFace('body', tokens.font.weight.heavy), fontSize: tokens.font.size.body, lineHeight: tokens.font.lineHeight.body },
});
