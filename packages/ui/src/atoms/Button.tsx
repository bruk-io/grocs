import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { icons } from '../icons/index.ts';
import type { IconName } from '../icons/index.ts';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';
import { focusRing } from './focus.ts';
import { Spinner } from './Spinner.tsx';

/** The states of Button, for every variant; each has a story (R61, R63). */
export const BUTTON_STATES = ['rest', 'pressed', 'focus', 'disabled', 'loading'] as const;

/**
 * button.primary (one per screen), button.secondary (alternative next to a primary), button.soft (inside
 * fields and cards), button.text (low emphasis), button.back (names the parent screen) and the three icon
 * buttons. Primary and secondary come in two sizes; the rest are always small.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'text' | 'back' | 'icon' | 'iconSoft' | 'iconGhost';

export interface ButtonProps {
  /** What a screen reader says and, except on the icon buttons, what the button shows. */
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** m is the 56 high action button; s is the 44 high one inside a card or field. Only primary and secondary have both. */
  size?: 'm' | 's';
  disabled?: boolean;
  /** Shows the button as busy and ignores presses. */
  loading?: boolean;
  /** What the button says while loading ("Adding"). Defaults to the label. */
  loadingLabel?: string;
  /** The glyph of an icon button. */
  icon?: IconName;
  forceState?: 'pressed' | 'focus';
}

export function Button({ label, onPress, variant = 'primary', size, disabled = false, loading = false, loadingLabel, icon = 'add', forceState }: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const inactive = disabled || loading;
  const iconOnly = variant === 'icon' || variant === 'iconSoft' || variant === 'iconGhost';
  const big = (variant === 'primary' || variant === 'secondary') && (size ?? 'm') === 'm';
  const filled = variant === 'primary' || variant === 'icon';
  const ink = disabled ? tokens.color.disabledInk : filled ? tokens.color.onBrand : variant === 'secondary' ? tokens.color.ink : tokens.color.forest;
  const Glyph = iconOnly ? icons[icon] : variant === 'back' ? icons.back : null;
  return (
    <Pressable
      role="button"
      aria-label={loading ? (loadingLabel ?? label) : label}
      aria-disabled={inactive}
      aria-busy={loading}
      disabled={inactive}
      onPress={() => onPress?.()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => {
        const down = pressed || forceState === 'pressed';
        return [
          styles.base,
          big ? styles.big : styles.small,
          iconOnly && styles.iconOnly,
          styles[variant],
          big && variant === 'primary' && !down && styles.lip,
          filled && down && !disabled && styles.lipPressed,
          big && variant === 'secondary' && styles.lipSoft,
          disabled && styles.disabled,
          disabled && variant === 'secondary' && styles.disabledLine,
          down && !disabled && !loading && styles.down,
          (focused || forceState === 'focus') && focusRing,
        ];
      }}
    >
      {loading ? <Spinner color={filled ? tokens.color.onBrand : tokens.color.forest} /> : Glyph ? <Glyph color={ink} size={iconOnly ? tokens.size.iconButton : tokens.size.iconBack} /> : null}
      {iconOnly ? null : <Text style={[styles.label, big ? styles.labelBig : styles.labelSmall, { color: ink }]}>{loading ? (loadingLabel ?? label) : label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space[8],
    minWidth: tokens.size.target,
  },
  big: { height: tokens.size.control, paddingHorizontal: tokens.space[24], borderRadius: tokens.radius[20] },
  small: { alignSelf: 'flex-start', height: tokens.size.target, paddingHorizontal: tokens.space[16], borderRadius: tokens.radius[16] },
  iconOnly: { width: tokens.size.target, paddingHorizontal: 0, alignSelf: 'flex-start' },
  primary: { backgroundColor: tokens.color.forest },
  secondary: { backgroundColor: tokens.color.surfaceCard, borderWidth: tokens.size.lineW, borderColor: tokens.color.line },
  soft: { backgroundColor: tokens.color.surfaceTint },
  text: { backgroundColor: 'transparent' },
  back: { backgroundColor: 'transparent', alignSelf: 'flex-start' },
  icon: { backgroundColor: tokens.color.forest },
  iconSoft: { backgroundColor: tokens.color.surfaceTint },
  iconGhost: { backgroundColor: 'transparent' },
  lip: { boxShadow: tokens.shadow.lip },
  lipPressed: { boxShadow: [{ offsetX: 0, offsetY: tokens.size.press, blurRadius: 0, color: tokens.color.forestDeep }] },
  lipSoft: { boxShadow: tokens.shadow.lipSoft },
  down: { transform: [{ translateY: tokens.size.press }] },
  disabled: { backgroundColor: tokens.color.disabled, boxShadow: 'none' },
  disabledLine: { borderColor: tokens.color.lineSoft },
  label: { ...fontFace('body', tokens.font.weight.heavy) },
  labelBig: { fontSize: tokens.font.size.label, lineHeight: tokens.font.lineHeight.label },
  labelSmall: { fontSize: tokens.font.size.body, lineHeight: tokens.font.lineHeight.body },
});
