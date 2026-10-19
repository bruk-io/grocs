import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';
import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import { mascotArt } from '../mascots/art/index.ts';
import type { MascotName } from '../mascots/art/index.ts';
import { mascots } from '../mascots/data.ts';
import { lineFor, motionFor } from '../mascots/motion.ts';
import { partPropsFor } from '../mascots/part-props.ts';
import { PartPropsContext } from '../mascots/part.tsx';
import type { MascotState } from '../mascots/types.ts';
import { useMotion } from '../platform/motion.tsx';
import { tokens } from '../tokens/tokens.ts';

/** The states of Mascot; each has a story (R61, R63). `reduced` is the same mascot under the reduce-motion setting. */
export const MASCOT_STATES = ['idle', 'rest', 'reacting', 'speaking', 'reduced', 'pressed', 'focus', 'disabled'] as const;

export interface MascotProps {
  name: MascotName;
  /** The art's width and height. Default is the header size. */
  size?: number;
  /** Called with the line just spoken, after the reaction starts and the line is announced. */
  onPress?: (line: string) => void;
  /** Not tappable: a mushroom that is only decoration for now. */
  disabled?: boolean;
  /** A pose that holds a prop: cremi "stir" (spoon), morty "scrub" (brush and tomato). */
  pose?: 'stir' | 'scrub';
  /** Pins a state for stories; the phones never set it. */
  forceState?: 'rest' | 'reacting' | 'speaking' | 'pressed' | 'focus';
}

const FORCED_STATE: Readonly<Record<string, MascotState>> = { rest: 'rest', reacting: 'reacting', speaking: 'speaking' };

// The bubble grows in (with the canvas's pop curve) or, when motion is reduced, only fades in.
const bubblePop = { from: { opacity: 0, transform: [{ scale: 0.6 }] }, to: { opacity: 1, transform: [{ scale: 1 }] } } as CSSAnimationKeyframes;
const bubbleFade = { from: { opacity: 0 }, to: { opacity: 1 } } as CSSAnimationKeyframes;

/** A token easing string as Reanimated takes it: a keyword as is, cubic-bezier(...) as a curve. */
function timing(easing: string) {
  const curve = /^cubic-bezier\(([^)]+)\)$/.exec(easing);
  if (!curve) return easing as 'ease-in-out';
  const [x1, y1, x2, y2] = (curve[1] as string).split(',').map(Number) as [number, number, number, number];
  return cubicBezier(x1, y1, x2, y2);
}

export function Mascot({ name, size = tokens.size.mascotHeader, onPress, disabled = false, pose, forceState }: MascotProps) {
  const { reduced } = useMotion();
  const data = mascots[name];
  const Art = mascotArt[name];
  const [state, setState] = useState<MascotState>('idle');
  const [taps, setTaps] = useState(0);
  const [focused, setFocused] = useState(false);

  const pinned = forceState === undefined ? undefined : FORCED_STATE[forceState];
  const current = pinned ?? state;
  const plan = useMemo(() => motionFor(data, current, reduced, pose), [data, current, reduced, pose]);
  const line = lineFor(data.lines, taps);

  // A tap starts the reaction; the plan says how long each state lasts before the next (reaction, then
  // speech, then back to idle).
  useEffect(() => {
    if (pinned !== undefined || plan.holdMs === null) return;
    const next: MascotState = current === 'reacting' ? 'speaking' : 'idle';
    const timer = setTimeout(() => setState(next), plan.holdMs);
    return () => clearTimeout(timer);
  }, [pinned, current, plan.holdMs, taps]);

  const press = (): void => {
    if (disabled) return;
    const tap = taps + 1;
    const spoken = lineFor(data.lines, tap);
    setTaps(tap);
    setState('reacting');
    AccessibilityInfo.announceForAccessibility(spoken);
    onPress?.(spoken);
  };

  const partProps = useMemo(() => partPropsFor(data, plan), [data, plan]);
  const bodyStyle = plan.body
    ? {
        animationName: plan.body.keyframes,
        animationDuration: plan.body.durationMs,
        animationTimingFunction: timing(plan.body.easing),
        animationIterationCount: plan.body.iterations,
        transformOrigin: plan.body.origin,
      }
    : { transformOrigin: data.idle.origin };
  const showBubble = plan.bubble !== 'none';
  const ring = focused || forceState === 'focus';

  return (
    <View style={styles.root}>
      {showBubble ? (
        <Animated.View
          key={`bubble-${taps}`}
          aria-hidden
          style={[
            styles.bubbleWrap,
            {
              animationName: plan.bubble === 'pop' ? bubblePop : bubbleFade,
              animationDuration: tokens.motion.duration.bubble,
              animationTimingFunction: timing(plan.bubble === 'pop' ? tokens.motion.easing.pop : tokens.motion.easing.soft),
              animationFillMode: 'both',
              transformOrigin: 'bottom',
            },
          ]}
        >
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{line}</Text>
            <View style={styles.tail} />
          </View>
        </Animated.View>
      ) : null}
      <Pressable
        role="button"
        aria-label={`${data.title}, tap to hear a line`}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={press}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => [
          styles.target,
          (pressed || forceState === 'pressed') && styles.pressed,
          ring && styles.focused,
          disabled && styles.disabled,
        ]}
      >
        <Animated.View key={`${current}-${taps}`} style={[{ width: size, height: size }, bodyStyle, plan.pose]}>
          <PartPropsContext.Provider value={partProps}>
            <Art width={size} height={size} style={styles.overflow} />
          </PartPropsContext.Provider>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center' },
  target: {
    minWidth: tokens.size.target,
    minHeight: tokens.size.target,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius[20],
    borderWidth: tokens.size.lineW,
    borderColor: 'transparent',
  },
  pressed: { opacity: tokens.opacity.pressed },
  focused: { borderColor: tokens.color.focusRing },
  disabled: { opacity: tokens.opacity.disabled },
  overflow: { overflow: 'visible' },
  bubbleWrap: { position: 'absolute', bottom: '100%', marginBottom: tokens.space[8], zIndex: 1 },
  bubble: {
    width: tokens.size.bubble,
    paddingVertical: tokens.space[10],
    paddingHorizontal: tokens.space[12],
    borderRadius: tokens.radius[16],
    backgroundColor: tokens.color.surfaceCard,
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.line,
    boxShadow: [...tokens.shadow.float],
  },
  bubbleText: {
    textAlign: 'center',
    color: tokens.color.ink,
    fontFamily: tokens.font.family.body,
    fontSize: tokens.font.size.small,
    lineHeight: tokens.font.lineHeight.small,
    fontWeight: tokens.font.weight.bold,
  },
  tail: {
    position: 'absolute',
    bottom: -(tokens.size.dot / 2),
    alignSelf: 'center',
    width: tokens.size.dot,
    height: tokens.size.dot,
    backgroundColor: tokens.color.surfaceCard,
    borderRightWidth: tokens.size.lineW,
    borderBottomWidth: tokens.size.lineW,
    borderColor: tokens.color.line,
    transform: [{ rotate: '45deg' }],
  },
});
