import { StyleSheet, Text, View } from 'react-native';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** invite.code: the code a partner types to join (rest), or a short hint where it will appear once there is one (pending). Only ever read. */
export const INVITECODE_STATES = ['rest', 'pending'] as const;

interface InviteCodeBase {
  /** The small heading above the code. */
  label?: string;
}

export interface InviteCodeRestProps extends InviteCodeBase {
  code: string;
  hint?: never;
}

/** No code exists yet: the box says when it will, and shows no sample code. */
export interface InviteCodePendingProps extends InviteCodeBase {
  code?: never;
  hint: string;
}

export type InviteCodeProps = InviteCodeRestProps | InviteCodePendingProps;

export function InviteCode({ code, hint, label = 'Invite code' }: InviteCodeProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>{label}</Text>
      {hint !== undefined ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : (
        <Text selectable style={styles.code}>
          {code}
        </Text>
      )}
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
  hint: {
    color: tokens.color.inkMuted,
    textAlign: 'center',
    ...fontFace('body', tokens.font.weight.medium),
    fontSize: tokens.font.size.small,
    lineHeight: tokens.font.lineHeight.small,
  },
  code: {
    color: tokens.color.forest,
    ...fontFace('display', tokens.font.weight.bold),
    fontSize: tokens.font.size.titleM,
    lineHeight: tokens.font.lineHeight.titleM,
    letterSpacing: tokens.font.tracking.code * tokens.font.size.titleM,
  },
});
