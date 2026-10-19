import { StyleSheet, Text, View } from 'react-native';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** invite.code: the code a partner types to join. Only ever read, so one state. */
export const INVITECODE_STATES = ['rest'] as const;

export interface InviteCodeProps {
  code: string;
  /** The small heading above the code. */
  label?: string;
}

export function InviteCode({ code, label = 'Invite code' }: InviteCodeProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>{label}</Text>
      <Text selectable style={styles.code}>
        {code}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: tokens.space[4],
    padding: tokens.space[14],
    borderRadius: tokens.radius[18],
    borderWidth: tokens.size.lineW,
    borderStyle: 'dashed',
    borderColor: tokens.color.lineDashed,
    backgroundColor: tokens.color.surfaceCanvas,
  },
  label: {
    color: tokens.color.inkMuted,
    ...fontFace('body', tokens.font.weight.heavy),
    fontSize: tokens.font.size.caption,
    lineHeight: tokens.font.lineHeight.caption,
    letterSpacing: tokens.font.tracking.code * tokens.font.size.caption,
    textTransform: 'uppercase',
  },
  code: {
    color: tokens.color.forest,
    ...fontFace('display', tokens.font.weight.bold),
    fontSize: tokens.font.size.titleM,
    lineHeight: tokens.font.lineHeight.titleM,
    letterSpacing: tokens.font.tracking.code * tokens.font.size.titleM,
  },
});
