import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';
import { useReduceMotion } from '../platform/reduce-motion.ts';
import { tokens } from '../tokens/tokens.ts';

/** A skeleton line is only ever drawn, never operated: one state. */
export const SKELETON_STATES = ['rest'] as const;

/** A grey line standing where text will load. It fills the width it is given and shimmers unless motion is reduced. */
export function Skeleton() {
  const reduce = useReduceMotion();
  const glow = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduce) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: tokens.opacity.disabled, duration: tokens.motion.duration.shimmer, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(glow, { toValue: 1, duration: tokens.motion.duration.shimmer, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, glow]);
  return <Animated.View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.line, { opacity: glow }]} />;
}

const styles = StyleSheet.create({
  line: {
    alignSelf: 'stretch',
    height: tokens.space[12],
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.lineSoft,
  },
});
