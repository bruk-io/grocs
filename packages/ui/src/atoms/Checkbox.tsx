import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { icons } from '../icons/index.ts';
import { tokens } from '../tokens/tokens.ts';
import { focusRing } from './focus.ts';
import { spaceActivates } from './keyboard.ts';

/** The states of Checkbox (check.off, --pressed, --on, --ticking, --focus, --disabled); each has a story (R61, R63). */
export const CHECKBOX_STATES = ['rest', 'checked', 'pressed', 'ticking', 'focus', 'disabled'] as const;
export type CheckboxState = (typeof CHECKBOX_STATES)[number];

export interface CheckboxProps {
  checked: boolean;
  /** What a screen reader says: the name of the thing being ticked. */
  label: string;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Draws a state without the interaction that causes it. For Storybook and tests. */
  forceState?: 'pressed' | 'focus' | 'ticking';
}

/** The six sparks of the tick: where each flies to from the centre of the check, and its colour. */
const SPARKS = [
  { x: 15, y: -12, color: tokens.color.chartreuse },
  { x: -15, y: -11, color: tokens.color.chartreuse },
  { x: 17, y: 8, color: tokens.color.tomato },
  { x: -16, y: 9, color: tokens.color.water },
  { x: 2, y: -19, color: tokens.color.tomato },
  { x: -1, y: 18, color: tokens.color.chartreuse },
] as const;

export function Checkbox({ checked, label, onChange, disabled = false, forceState }: CheckboxProps) {
  const [focused, setFocused] = useState(false);
  const Tick = icons.check;
  const on = checked || forceState === 'ticking';
  const toggle = () => onChange?.(!checked);
  return (
    <Pressable
      role="checkbox"
      aria-label={label}
      aria-checked={on}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={toggle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={styles.target}
      {...spaceActivates(toggle, !disabled)}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.box,
            on && styles.boxOn,
            disabled && styles.boxDisabled,
            (pressed || forceState === 'pressed') && !disabled && styles.boxPressed,
            (focused || forceState === 'focus') && focusRing,
          ]}
        >
          {on ? <Tick color={tokens.color.onBrand} size={tokens.size.iconTick} /> : null}
          {forceState === 'ticking'
            ? SPARKS.map((spark) => <View key={`${spark.x},${spark.y}`} aria-hidden style={[styles.spark, { backgroundColor: spark.color, transform: [{ translateX: spark.x }, { translateY: spark.y }] }]} />)
            : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    width: tokens.size.target,
    height: tokens.size.target,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: tokens.size.check,
    height: tokens.size.check,
    borderRadius: tokens.radius.pill,
    borderWidth: tokens.size.lineWStrong,
    borderColor: tokens.color.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: tokens.color.forest },
  boxDisabled: { backgroundColor: tokens.color.disabled, borderColor: tokens.color.line },
  boxPressed: { transform: [{ scale: tokens.scale.pressRow }] },
  spark: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -tokens.size.spark / 2,
    marginTop: -tokens.size.spark / 2,
    width: tokens.size.spark,
    height: tokens.size.spark,
    borderRadius: tokens.radius.pill,
  },
});
