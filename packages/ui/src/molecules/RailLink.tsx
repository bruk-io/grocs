import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Count } from '../atoms/Count.tsx';
import { focusRing } from '../atoms/focus.ts';
import { icons } from '../icons/index.ts';
import type { IconName } from '../icons/index.ts';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** The states of RailLink (rail.link active, rest, pressed and focus, plus disabled); each has a story (R61, R63). */
export const RAILLINK_STATES = ['active', 'rest', 'pressed', 'focus', 'disabled'] as const;

export interface RailLinkProps {
  label: string;
  icon: IconName;
  /** This is the page showing beside the rail. */
  active?: boolean;
  /** A number after the name, such as what is still to buy. */
  count?: number;
  onPress?: () => void;
  disabled?: boolean;
  forceState?: 'pressed' | 'focus';
}

/** One page of the meal rail: an icon, a name and an optional count (icon, text.body, count.accent). Sits in the rail's navigation. */
export function RailLink({ label, icon, active = false, count, onPress, disabled = false, forceState }: RailLinkProps) {
  const [focused, setFocused] = useState(false);
  const Glyph = icons[icon];
  const ink = active ? tokens.color.onBrand : disabled ? tokens.color.disabledInk : tokens.color.ink;
  return (
    <Pressable
      role="link"
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onPress?.()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.link,
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
      {count !== undefined ? <Text style={[styles.hidden, { color: ink }]}> to buy</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    minWidth: tokens.size.target,
    minHeight: tokens.size.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[10],
    paddingHorizontal: tokens.space[14],
    borderRadius: tokens.radius[18],
  },
  active: { backgroundColor: tokens.color.forest },
  pressed: { backgroundColor: tokens.color.surfaceTint },
  focus: { ...focusRing, outlineOffset: -tokens.size.focusOutline },
  label: {
    flex: 1,
    ...fontFace('body', tokens.font.weight.heavy),
    fontSize: tokens.font.size.body,
    lineHeight: tokens.font.lineHeight.body,
  },
  count: { justifyContent: 'center' },
  // Read by a screen reader after the count ("14 to buy"), never drawn.
  hidden: { position: 'absolute', width: 1, height: 1, overflow: 'hidden' },
});
