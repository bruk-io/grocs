import { StyleSheet, Text, View } from 'react-native';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** speech.bubble: what a mascot says. Only ever read, so one state. */
export const SPEECHBUBBLE_STATES = ['rest'] as const;

export interface SpeechBubbleProps {
  message: string;
}

/** Small text in a card with a float shadow and a tail on the right, pointing at the mascot. Announced to screen readers when it appears. */
export function SpeechBubble({ message }: SpeechBubbleProps) {
  return (
    <View accessibilityLiveRegion="polite" aria-live="polite" style={styles.bubble}>
      <Text style={styles.text}>{message}</Text>
      <View aria-hidden style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: tokens.size.bubble,
    paddingVertical: tokens.space[10],
    paddingHorizontal: tokens.space[12],
    borderRadius: tokens.radius[16],
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surfaceCard,
    boxShadow: tokens.shadow.float,
  },
  text: {
    color: tokens.color.ink,
    ...fontFace('body', tokens.font.weight.bold),
    fontSize: tokens.font.size.small,
    lineHeight: tokens.font.lineHeight.small,
  },
  tail: {
    position: 'absolute',
    right: -tokens.space[8],
    top: tokens.space[16],
    width: tokens.size.dot,
    height: tokens.size.dot,
    backgroundColor: tokens.color.surfaceCard,
    borderRightWidth: tokens.size.lineW,
    borderTopWidth: tokens.size.lineW,
    borderColor: tokens.color.line,
    transform: [{ rotate: '45deg' }],
  },
});
