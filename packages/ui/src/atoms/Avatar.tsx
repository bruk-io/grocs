import { StyleSheet, Text, View } from 'react-native';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** avatar.l, avatar.l--online (a tomato ring) and avatar.s; an avatar is only ever read, so each state is a look. */
export const AVATAR_STATES = ['large', 'online', 'small', 'xl'] as const;

export interface AvatarProps {
  /** The person's name; the avatar shows its first letter and says the whole name. */
  name: string;
  size?: 'xl' | 'l' | 's';
  /** Which of the two household colours the avatar wears. A small avatar is tinted unless it is chartreuse (on a toast). */
  tone?: 'forest' | 'chartreuse';
  /** Rings a large avatar in tomato: this person is here now. */
  online?: boolean;
}

export function Avatar({ name, size = 'l', tone = 'forest', online = false }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  const large = size !== 's';
  const xl = size === 'xl';
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={online ? `${name}, online` : name} style={[xl ? styles.xl : large ? styles.large : styles.small, (large || tone === 'chartreuse') && (tone === 'forest' ? styles.forest : styles.chartreuse)]}>
      {large && !xl && online ? <View aria-hidden style={styles.ring} /> : null}
      <Text aria-hidden style={[styles.initial, xl ? styles.initialXl : large ? styles.initialLarge : styles.initialSmall, { color: large ? (tone === 'forest' ? tokens.color.onBrand : tokens.color.ink) : tone === 'chartreuse' ? tokens.color.ink : tokens.color.inkOnTint }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  large: {
    width: tokens.size.avatarL,
    height: tokens.size.avatarL,
    borderRadius: tokens.radius.pill,
    borderWidth: tokens.size.lineWStrong,
    borderColor: tokens.color.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xl: {
    width: tokens.size.avatarXl,
    height: tokens.size.avatarXl,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    width: tokens.size.avatarS,
    height: tokens.size.avatarS,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forest: { backgroundColor: tokens.color.forest },
  chartreuse: { backgroundColor: tokens.color.chartreuse },
  ring: {
    position: 'absolute',
    top: -tokens.space[4],
    left: -tokens.space[4],
    right: -tokens.space[4],
    bottom: -tokens.space[4],
    borderRadius: tokens.radius.pill,
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.tomato,
  },
  initial: { ...fontFace('display', tokens.font.weight.medium) },
  initialLarge: { fontSize: tokens.font.size.body, lineHeight: tokens.font.lineHeight.body },
  initialXl: { fontSize: tokens.font.size.titleM, lineHeight: tokens.font.lineHeight.titleM },
  initialSmall: { fontSize: tokens.font.size.caption, lineHeight: tokens.font.lineHeight.caption },
});
