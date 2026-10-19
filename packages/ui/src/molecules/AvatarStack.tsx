import { StyleSheet, View } from 'react-native';
import { Avatar } from '../atoms/Avatar.tsx';
import { tokens } from '../tokens/tokens.ts';

/** avatar.stack--away and --online (a tomato ring on the other person); an avatar stack is only ever read, so each state is who is here. */
export const AVATARSTACK_STATES = ['away', 'online'] as const;

export interface StackMember {
  name: string;
  tone?: 'forest' | 'chartreuse';
  /** Rings the avatar in tomato: this person is in the app now. */
  online?: boolean;
}

export interface AvatarStackProps {
  members: readonly StackMember[];
}

/** The household as overlapping large avatars (avatar.l x n, overlapped by 10). */
export function AvatarStack({ members }: AvatarStackProps) {
  return (
    <View style={styles.row}>
      {members.map((member, index) => (
        <View key={member.name} style={index > 0 ? styles.overlap : undefined}>
          <Avatar name={member.name} {...(member.tone ? { tone: member.tone } : {})} {...(member.online ? { online: true } : {})} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignSelf: 'flex-start', paddingLeft: tokens.space[4] },
  overlap: { marginLeft: -tokens.space[10] },
});
