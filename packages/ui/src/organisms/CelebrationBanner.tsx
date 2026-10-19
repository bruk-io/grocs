import { StyleSheet, View } from 'react-native';
import { Text } from '../atoms/Text.tsx';
import { Mascot } from '../molecules/Mascot.tsx';
import { tokens } from '../tokens/tokens.ts';

/** celebration.banner: shown in place of the list header when every item is in the cart. */
export const CELEBRATIONBANNER_STATES = ['rest'] as const;

export interface CelebrationBannerProps {
  title?: string;
  message?: string;
}

/** The enoki cheering that the shop is done (mascot.enoki, text.heading, text.body). */
export function CelebrationBanner({ title = 'All done!', message = "Everything's in the cart." }: CelebrationBannerProps) {
  return (
    <View aria-live="polite" style={styles.banner}>
      <Mascot name="enoki" size={tokens.size.mascotHeader} />
      <View style={styles.words}>
        <Text variant="heading">{title}</Text>
        <Text variant="body" tone="forest">
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[14],
    paddingVertical: tokens.space[14],
    paddingHorizontal: tokens.space[16],
    borderRadius: tokens.radius[24],
    backgroundColor: tokens.color.positiveTint,
  },
  words: { flex: 1, gap: tokens.space[2] },
});
