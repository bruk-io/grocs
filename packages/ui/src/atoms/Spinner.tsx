import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';
import { useReduceMotion } from '../platform/reduce-motion.ts';
import { tokens } from '../tokens/tokens.ts';

/** A spinner is only ever drawn, never operated: one state. */
export const SPINNER_STATES = ['rest'] as const;

export interface SpinnerProps {
  /** Stroke colour. Defaults to forest; on a filled button it is the text colour. */
  color?: string;
}

/** A ring with a gap that turns while something loads. Hidden from screen readers: the control that owns it says it is busy. */
export function Spinner({ color = tokens.color.forest }: SpinnerProps) {
  const reduce = useReduceMotion();
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return undefined;
    const loop = Animated.loop(
      Animated.timing(turn, { toValue: 1, duration: tokens.motion.duration.spin, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, turn]);
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.ring, { borderColor: color, borderRightColor: 'transparent', transform: [{ rotate }] }]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    width: tokens.size.spinner,
    height: tokens.size.spinner,
    borderWidth: tokens.size.lineW,
    borderRadius: tokens.radius.pill,
  },
});
